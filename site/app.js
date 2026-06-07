// ============================================================
//  app.js  —  전역 변수, 전체 함수 로직, 이벤트 핸들러
//  로드 순서: data.js → app.js
// ============================================================

// CSS 커스텀 토큰 읽기 헬퍼
function getCssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// 보안: XSS 방지용 HTML 이스케이프 함수
function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/[&<>'"]/g, tag => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag]));
}

function _escapeInlineJsString(value) {
    if (value == null) return '';
    return String(value)
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function selectPlayerType(type, formType) {
    if (formType === 'add') {
        document.getElementById('pType').value = type;
        document.getElementById('addTypePitcher').classList.toggle('active', type === '투수');
        document.getElementById('addTypeBatter').classList.toggle('active', type === '타자');
        document.getElementById('addPitcherFields').style.display = type === '투수' ? '' : 'none';
        document.getElementById('addBatterFields').style.display = type === '타자' ? 'block' : 'none';
    } else if (formType === 'edit') {
        document.getElementById('eType').value = type;
        document.getElementById('editTypePitcher').classList.toggle('active', type === '투수');
        document.getElementById('editTypeBatter').classList.toggle('active', type === '타자');
        document.getElementById('editPitcherFields').style.display = type === '투수' ? '' : 'none';
        document.getElementById('editBatterFields').style.display = type === '타자' ? 'block' : 'none';
    }
}

// 스왑 상태 관리
let swapState = {
    playerId: null,
    dayIndex: null,
    originalExName: null,
    selectedSwapName: null
};

let isBackupDownloadInProgress = false;

// === 유틸리티 함수 ===
function getLocalDateStr(date) {
    const d = date instanceof Date ? date : new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function parseLocalDate(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
}

function isSameLocalDate(d1, d2) {
    return getLocalDateStr(d1) === getLocalDateStr(d2);
}

function getTodayStr() {
    return getLocalDateStr(new Date());
}

function generateUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const _UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function _isUuidLike(id) {
    return typeof id === 'string' && _UUID_RE.test(id);
}

function _normalizePlayerIds(playerList) {
    const seen = new Set();
    let changed = false;
    playerList.forEach(p => {
        if (!_isUuidLike(p.id) || seen.has(p.id)) {
            p.id = generateUUID();
            changed = true;
        }
        seen.add(p.id);
    });
    return changed;
}

function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return Math.abs(hash);
}

function migratePlayerDates(playerList) {
    playerList.forEach(p => {
        if (typeof p.weekStartDate === 'string' && p.weekStartDate.includes(' ')) {
            try { p.weekStartDate = new Date(p.weekStartDate).toISOString().split('T')[0]; } catch (e) { p.weekStartDate = getTodayStr(); }
        }
        if (p.wellness && typeof p.wellness.date === 'string' && p.wellness.date.includes(' ')) {
            try { p.wellness.date = new Date(p.wellness.date).toISOString().split('T')[0]; } catch (e) { p.wellness.date = getTodayStr(); }
        }
        if (typeof p.lastPromptDate === 'string' && p.lastPromptDate.includes(' ')) {
            try { p.lastPromptDate = new Date(p.lastPromptDate).toISOString().split('T')[0]; } catch (e) { p.lastPromptDate = getTodayStr(); }
        }
    });
    return playerList;
}

const ALLOWED_USER_TYPES = ['', 'youth_student', 'adult_amateur', 'recreational'];

function _normalizeUserType(value) {
    if (typeof value !== 'string') return '';
    const normalized = value.trim();
    return ALLOWED_USER_TYPES.includes(normalized) ? normalized : '';
}

const USER_TYPE_LABELS = {
    youth_student: '유소년·학생',
    adult_amateur: '사회인',
    recreational: '취미 야구'
};

function _getUserTypeLabel(value) {
    const normalized = _normalizeUserType(value);
    if (normalized === '') return '';
    return USER_TYPE_LABELS[normalized] || '';
}

const ALLOWED_USAGE_PERSPECTIVES = ['', 'self', 'coach', 'guardian'];

function _normalizeUsagePerspective(value) {
    if (typeof value !== 'string') return '';
    const normalized = value.trim();
    return ALLOWED_USAGE_PERSPECTIVES.includes(normalized) ? normalized : '';
}

const USAGE_PERSPECTIVE_LABELS = {
    self: '선수 본인',
    coach: '코치·지도자',
    guardian: '보호자'
};

function _getUsagePerspectiveLabel(value) {
    const normalized = _normalizeUsagePerspective(value);
    if (normalized === '') return '';
    return USAGE_PERSPECTIVE_LABELS[normalized] || '';
}

const GOAL_DISPLAY_LABELS = {
    '구속 향상': '구속·파워 준비 (파워/스트렝스)',
    '타구속도 향상': '타구 속도·파워 준비 (파워/스트렝스)',
    '부상 방지': '회복·가동성 관리'
};

function _getGoalDisplayLabel(goal) {
    return (typeof goal === 'string' && GOAL_DISPLAY_LABELS[goal])
        ? GOAL_DISPLAY_LABELS[goal]
        : (goal || '');
}

const ALLOWED_TRAINING_FOCUSES = ['', 'performance', 'conditioning', 'recovery', 'mobility', 'game_ready', 'general_fitness'];

function _normalizeTrainingFocus(value) {
    if (typeof value !== 'string') return '';
    const normalized = value.trim();
    return ALLOWED_TRAINING_FOCUSES.includes(normalized) ? normalized : '';
}

const TRAINING_FOCUS_LABELS = {
    performance: '근력·파워 개발',
    conditioning: '체력·컨디션 유지',
    recovery: '회복 관리',
    mobility: '가동성 관리',
    game_ready: '경기 전 준비',
    general_fitness: '건강·취미 운동'
};

function _getTrainingFocusLabel(value) {
    const normalized = _normalizeTrainingFocus(value);
    if (normalized === '') return '';
    return TRAINING_FOCUS_LABELS[normalized] || '';
}

function _filterRuntimePlayerObjects(playerList) {
    const ALLOWED_AGES = ['U-12', 'U-15', 'U-18', '성인'];
    const ALLOWED_TYPES = ['투수', '타자'];
    return playerList.filter(item => {
        if (item === null || typeof item !== 'object' || Array.isArray(item)) return false;
        // id는 normalizePlayerIds()가 이미 UUID로 복구한 뒤이므로 여기서는 비공백 문자열인지만 확인
        if (typeof item.id !== 'string' || item.id.trim() === '') return false;
        if (typeof item.name !== 'string' || item.name.trim() === '') return false;
        if (typeof item.week !== 'number' || item.week < 1) return false;
        if (!ALLOWED_AGES.includes(item.age)) return false;
        if (item.type !== undefined && item.type !== null && !ALLOWED_TYPES.includes(item.type)) return false;
        return true;
    });
}

function _normalizePlayerRuntimeState(playerList) {
    const ALLOWED_TRAINING_TIMES = [30, 60, 90, 120];

    playerList.forEach(p => {
        // dailyCompletion
        if (!p.dailyCompletion || typeof p.dailyCompletion !== 'object' || Array.isArray(p.dailyCompletion)) {
            p.dailyCompletion = {};
        } else {
            Object.keys(p.dailyCompletion).forEach(key => {
                const entry = p.dailyCompletion[key];
                if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
                    delete p.dailyCompletion[key];
                    return;
                }
                if (typeof entry.completed !== 'boolean') entry.completed = !!entry.completed;
                if (typeof entry.rpe !== 'number') entry.rpe = 0;
                if (typeof entry.pitchCount !== 'number') entry.pitchCount = 0;
                if (typeof entry.workload !== 'number') entry.workload = 0;
                if (!Array.isArray(entry.exercises)) entry.exercises = [];
            });
        }

        // completionHistory
        if (!p.completionHistory || typeof p.completionHistory !== 'object' || Array.isArray(p.completionHistory)) {
            p.completionHistory = {};
        } else {
            Object.keys(p.completionHistory).forEach(key => {
                const entry = p.completionHistory[key];
                if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
                    delete p.completionHistory[key];
                    return;
                }
                if (typeof entry.dayIndex !== 'number') delete entry.dayIndex;
                if (typeof entry.rpe !== 'number') entry.rpe = 0;
                if (typeof entry.pitchCount !== 'number') entry.pitchCount = 0;
                if (typeof entry.workload !== 'number') entry.workload = 0;
                if (!Array.isArray(entry.exercises)) entry.exercises = [];
            });
        }

        // workloadHistory
        if (!Array.isArray(p.workloadHistory)) {
            p.workloadHistory = [];
        } else {
            p.workloadHistory = p.workloadHistory.filter(entry => {
                if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return false;
                if (typeof entry.date !== 'string' || entry.date.trim() === '') return false;
                return true;
            });
            p.workloadHistory.forEach(entry => {
                if (typeof entry.workload !== 'number') entry.workload = 0;
            });
        }

        // performanceHistory
        if (!Array.isArray(p.performanceHistory)) {
            p.performanceHistory = [];
        } else {
            p.performanceHistory = p.performanceHistory.filter(entry => {
                if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return false;
                if (typeof entry.date !== 'string' || entry.date.trim() === '') return false;
                entry.date = entry.date.trim();
                return true;
            });
            const PERFORMANCE_HISTORY_KEYS = ['maxVelo', 'avgVelo', 'rpm', 'exitVelo', 'batSpeed'];
            p.performanceHistory.forEach(entry => {
                PERFORMANCE_HISTORY_KEYS.forEach(key => {
                    if (key in entry) {
                        entry[key] = _normalizeOptionalNumberValue(entry[key]);
                    }
                });
            });
        }

        // exerciseSwaps
        if (p.exerciseSwaps !== undefined && p.exerciseSwaps !== null) {
            if (typeof p.exerciseSwaps !== 'object' || Array.isArray(p.exerciseSwaps)) {
                p.exerciseSwaps = {};
            } else {
                Object.keys(p.exerciseSwaps).forEach(key => {
                    const entry = p.exerciseSwaps[key];
                    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
                        delete p.exerciseSwaps[key];
                        return;
                    }
                    if (typeof entry.replacement !== 'string' || entry.replacement.trim() === '') {
                        delete p.exerciseSwaps[key];
                        return;
                    }
                    if (entry.original !== undefined && typeof entry.original !== 'string') delete entry.original;
                    if (entry.dayIndex !== undefined && typeof entry.dayIndex !== 'number') delete entry.dayIndex;
                    if (entry.date !== undefined && typeof entry.date !== 'string') delete entry.date;
                });
            }
        }

        // scores
        const SCORES_KEYS = ['sprint', 'squat', 'deadlift', 'pullup', 'lateralBound', 'broadJump', 'thoracic', 'hip', 'core', 'shoulder'];
        if (p.scores !== undefined && p.scores !== null) {
            if (typeof p.scores !== 'object' || Array.isArray(p.scores)) {
                p.scores = null;
            } else {
                SCORES_KEYS.forEach(k => {
                    if (k in p.scores && !Number.isFinite(p.scores[k])) delete p.scores[k];
                });
                const hasValid = SCORES_KEYS.some(k => Number.isFinite(p.scores[k]));
                if (!hasValid) p.scores = null;
            }
        }

        // lateralBound 옛 기준 점수 1회 정리 (타자만, cleanupVersion 미완료 시)
        if ((p.type || '투수') === '타자' && p.lateralBoundCleanupVersion !== 1) {
            const hasVerifiedNewLateralBound =
                p.lateralBoundAssessmentVersion === 2 &&
                p.scores != null &&
                Number.isFinite(p.scores.lateralBound);
            if (!hasVerifiedNewLateralBound && p.scores != null && Number.isFinite(p.scores.lateralBound)) {
                delete p.scores.lateralBound;
            }
            p.lateralBoundCleanupVersion = 1;
        }

        // 이전 legacy marker는 cleanupVersion 반영 후 제거
        if ('lateralBoundAssessmentVersion' in p) {
            delete p.lateralBoundAssessmentVersion;
        }

        // trainingTime
        if (!ALLOWED_TRAINING_TIMES.includes(p.trainingTime)) {
            p.trainingTime = 60;
        }

        // userType / usagePerspective (optional metadata)
        const rawUserType = typeof p.userType === 'string' ? p.userType.trim() : '';
        const rawUsagePerspective = typeof p.usagePerspective === 'string' ? p.usagePerspective.trim() : '';
        if (rawUserType === 'coach' && rawUsagePerspective === '') {
            p.usagePerspective = 'coach';
            p.userType = '';
        } else if (rawUserType === 'guardian' && rawUsagePerspective === '') {
            p.usagePerspective = 'guardian';
            p.userType = '';
        }
        p.userType = _normalizeUserType(p.userType);
        p.usagePerspective = _normalizeUsagePerspective(p.usagePerspective);

        // trainingFocus (optional metadata)
        p.trainingFocus = _normalizeTrainingFocus(p.trainingFocus);

        // week (최소 안전 보정)
        if (!Number.isInteger(p.week) || p.week < 1) {
            p.week = Math.max(1, Math.floor(p.week) || 1);
        }
    });

    return playerList;
}

const _PAIN_WHITELIST = ['어깨', '팔꿈치', '허리', '무릎', '손목', '고관절', '발목', '없음'];

function _ensureWellnessShape(playerList) {
    const DEFAULT_WELLNESS = { sleep: 7, fatigue: 3, soreness: 2, pain: ['없음'], recovery: { '없음': 10 }, date: '' };
    playerList.forEach(p => {
        if (!p.wellness || typeof p.wellness !== 'object' || Array.isArray(p.wellness)) {
            p.wellness = Object.assign({}, DEFAULT_WELLNESS, { pain: ['없음'], recovery: { '없음': 10 } });
            return;
        }
        if (p.wellness.sleep === undefined) p.wellness.sleep = DEFAULT_WELLNESS.sleep;
        if (p.wellness.fatigue === undefined) p.wellness.fatigue = DEFAULT_WELLNESS.fatigue;
        if (p.wellness.soreness === undefined) p.wellness.soreness = DEFAULT_WELLNESS.soreness;
        if (!p.wellness.pain) {
            p.wellness.pain = ['없음'];
        } else if (!Array.isArray(p.wellness.pain)) {
            p.wellness.pain = p.wellness.pain ? [p.wellness.pain] : ['없음'];
        } else if (p.wellness.pain.length === 0) {
            p.wellness.pain = ['없음'];
        }
        if (!p.wellness.recovery || typeof p.wellness.recovery !== 'object' || Array.isArray(p.wellness.recovery)) {
            p.wellness.recovery = { '없음': 10 };
        }
        if (typeof p.wellness.date !== 'string') p.wellness.date = '';

        // 통증 부위 whitelist 정규화
        p.wellness.pain = _normalizePainAreas(p.wellness.pain);

        // recovery key whitelist 정규화 및 값 clamp
        if (p.wellness.pain.includes('없음')) {
            p.wellness.recovery = { '없음': 10 };
        } else {
            const cleanedRecovery = {};
            p.wellness.pain.forEach(area => {
                const raw = p.wellness.recovery[area];
                cleanedRecovery[area] = Math.round(_clampNumber(raw !== undefined ? raw : 5, 1, 10, 5));
            });
            p.wellness.recovery = cleanedRecovery;
        }
    });
    return playerList;
}

let players = [];
try {
    const raw = _safeLocalStorageGet('pLDB_v4_5');
    if (raw) {
        players = JSON.parse(raw);
        if (!Array.isArray(players)) players = [];
        const beforeNormalize = JSON.stringify(players);
        // id 정규화를 먼저 수행해 malformed id도 UUID로 복구한 뒤 filter
        players = players.filter(item => item !== null && typeof item === 'object' && !Array.isArray(item));
        _normalizePlayerIds(players);
        players = _filterRuntimePlayerObjects(players);
        _normalizePlayerRuntimeState(players);
        _ensureWellnessShape(players);
        players = migratePlayerDates(players);
        players.forEach(p => { if (!p.type) p.type = '투수'; });
        const afterNormalize = JSON.stringify(players);
        if (afterNormalize !== beforeNormalize) {
            _safeLocalStorageSet('pLDB_v4_5', afterNormalize);
        }
    }
} catch (e) {
    console.error('데이터 로드 실패, 초기화합니다:', e);
    players = [];
}

let currentId = null;
let radarChartInstance = null;
let currentViewMode = 'card'; // 'card' | 'calendar' | 'monthly'
let currentDashboardFilter = '조치 필요';
let currentCalendarDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let _monthlyClickHandler = null;
let _weeklyCalendarClickHandler = null;
let _todaySummaryWorkloadClickHandler = null;
let _scheduleWorkloadClickHandler = null;
let _scheduleTabClickHandler = null;
let _scheduleGuideClickHandler = null;
let _scheduleSwapClickHandler = null;
let _playerListClickHandler = null;
let _dashboardActionQueueClickHandler = null;
let _dashboardFilterClickHandler = null;
let _recoveryScoreClickHandler = null;
let _assessmentGuideClickHandler = null;
let _confirmBtnClickHandler = null;
let _captureScheduleClickHandler = null;
let _confirmCancelClickHandler = null;
let _alertConfirmClickHandler = null;
let _guideModalCloseClickHandler = null;
let _swapModalCloseClickHandler = null;
let _swapModalActionClickHandler = null;
let _appGuideModalCloseClickHandler = null;
let _workloadModalCloseClickHandler = null;
let _wellnessModalCloseClickHandler = null;
let _perfModalCloseClickHandler = null;
let _editPlayerModalCloseClickHandler = null;
let _headerCtaClickHandler = null;
let _backupActionClickHandler = null;
let _backupRestoreChangeHandler = null;
let _resultViewToggleClickHandler = null;
let _assessmentActionClickHandler = null;
let _addPlayerSubmitClickHandler = null;
let _addPlayerTypeClickHandler = null;
let _addPlayerValidateInputHandler = null;
let _addPlayerPainChangeHandler = null;
let _editPlayerTypeClickHandler = null;
let _editPlayerValidateInputHandler = null;
let _editPlayerSaveClickHandler = null;
let _perfValidateInputHandler = null;
let _perfSaveClickHandler = null;
let _wellnessSliderInputHandler = null;
let _wellnessPainChangeHandler = null;
let _wellnessSaveClickHandler = null;
let _workloadRestTodayClickHandler = null;
let _workloadLiveCalcInputHandler = null;
let _workloadSaveClickHandler = null;
let _rpeBarClickHandler = null;
let _staticNavClickHandler = null;

window.onload = () => {
    _validateExerciseEvidenceLevels();
    renderPlayerList();
    renderBackupStorageStatus();
    lucide.createIcons();
    _bindCaptureScheduleClickHandler();
    _bindConfirmCancelClickHandler();
    _bindAlertConfirmClickHandler();
    _bindGuideModalCloseClickHandler();
    _bindSwapModalCloseClickHandler();
    _bindSwapModalActionClickHandler();
    _bindAppGuideModalCloseClickHandler();
    _bindWorkloadModalCloseClickHandler();
    _bindWorkloadRestTodayClickHandler();
    _bindWorkloadLiveCalcInputHandler();
    _bindWorkloadSaveClickHandler();
    _bindRpeBarClickHandler();
    _bindStaticNavClickHandler();
    _bindWellnessModalCloseClickHandler();
    _bindWellnessSliderInputHandler();
    _bindWellnessPainChangeHandler();
    _bindWellnessSaveClickHandler();
    _bindPerfModalCloseClickHandler();
    _bindEditPlayerModalCloseClickHandler();
    _bindHeaderCtaClickHandler();
    _bindBackupControlHandlers();
    _bindResultViewToggleClickHandler();
    _bindAssessmentActionClickHandler();
    _bindAddPlayerSubmitClickHandler();
    _bindAddPlayerTypeClickHandler();
    _bindAddPlayerValidateInputHandler();
    _bindAddPlayerPainChangeHandler();
    _bindEditPlayerTypeClickHandler();
    _bindEditPlayerValidateInputHandler();
    _bindEditPlayerSaveClickHandler();
    _bindPerfValidateInputHandler();
    _bindPerfSaveClickHandler();
    if (!_safeLocalStorageGet('pLAppGuideSeen_v1')) {
        _safeLocalStorageSet('pLAppGuideSeen_v1', '1');
        setTimeout(() => openModal('appGuideModal'), 400);
    }
};

function _isQuotaExceededError(error) {
    return !!error && (
        error.name === 'QuotaExceededError' ||
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        error.code === 22 ||
        error.code === 1014
    );
}

function _safeLocalStorageGet(key) {
    try {
        return localStorage.getItem(key);
    } catch (e) {
        return null;
    }
}

function _safeLocalStorageSet(key, value) {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch (e) {
        return false;
    }
}

function _safeLocalStorageRemove(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (e) {
        return false;
    }
}

function _formatStorageSize(bytes) {
    if (!Number.isFinite(bytes) || bytes < 0) return '알 수 없음';
    if (bytes < 1024) return `${bytes}B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)}KB`;
    return `${(kb / 1024).toFixed(2)}MB`;
}

function _getSerializedPlayersSizeLabel() {
    try {
        const serialized = JSON.stringify(players);
        const sizeBytes = typeof Blob !== 'undefined' ? new Blob([serialized]).size : serialized.length;
        return _formatStorageSize(sizeBytes);
    } catch (e) {
        return '알 수 없음';
    }
}

function _getSerializedPlayersSizeInfo() {
    try {
        const serialized = JSON.stringify(players);
        const sizeBytes = typeof Blob !== 'undefined' ? new Blob([serialized]).size : serialized.length;
        return {
            bytes: sizeBytes,
            label: _formatStorageSize(sizeBytes)
        };
    } catch (e) {
        return {
            bytes: NaN,
            label: '알 수 없음'
        };
    }
}

function _getPlayerHistoryStats(playerList = players) {
    const safePlayerList = Array.isArray(playerList) ? playerList : [];
    return safePlayerList.reduce((stats, p) => {
        const completionCount = p && p.completionHistory && typeof p.completionHistory === 'object' && !Array.isArray(p.completionHistory)
            ? Object.keys(p.completionHistory).length
            : 0;
        const workloadCount = Array.isArray(p && p.workloadHistory) ? p.workloadHistory.length : 0;
        const performanceCount = Array.isArray(p && p.performanceHistory) ? p.performanceHistory.length : 0;

        stats.players += 1;
        stats.completion += completionCount;
        stats.workload += workloadCount;
        stats.performance += performanceCount;
        return stats;
    }, { players: 0, completion: 0, workload: 0, performance: 0 });
}

function renderBackupStorageStatus() {
    const el = document.getElementById('backupStorageStatus');
    if (!el) return;

    const sizeInfo = _getSerializedPlayersSizeInfo();
    const stats = _getPlayerHistoryStats();
    const cleanupStats = _countOldHistoryRecords(players, _getOldRecordCutoffDateStr());
    const cleanupTotal = cleanupStats.completion + cleanupStats.workload;
    const cleanupText = cleanupTotal > 0
        ? `정리 가능 오래된 기록 ${cleanupTotal}건`
        : '정리 가능 오래된 기록 없음';
    const baseText = `약 ${sizeInfo.label} · 선수 ${stats.players}명 · 훈련기록 ${stats.completion}건 · 워크로드 ${stats.workload}건 · 퍼포먼스 ${stats.performance}건 · ${cleanupText}`;

    el.classList.remove('is-warning', 'is-danger');
    if (Number.isFinite(sizeInfo.bytes) && sizeInfo.bytes >= 4 * 1024 * 1024) {
        el.classList.add('is-danger');
        el.textContent = `저장공간 위험: 현재 데이터 ${baseText}. 백업 다운로드 후 오래된 기록 정리를 준비하세요.`;
    } else if (Number.isFinite(sizeInfo.bytes) && sizeInfo.bytes >= 3 * 1024 * 1024) {
        el.classList.add('is-warning');
        el.textContent = `저장공간 주의: 현재 데이터 ${baseText}. 정기 백업을 권장합니다.`;
    } else {
        el.textContent = `현재 저장 데이터: ${baseText}`;
    }
}

const OLD_RECORD_RETENTION_DAYS = 180;

function _getOldRecordCutoffDateStr() {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - OLD_RECORD_RETENTION_DAYS);
    return getLocalDateStr(cutoff);
}

function _isCleanupTargetDate(dateStr, cutoffDateStr) {
    if (typeof dateStr !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
    const parsed = parseLocalDate(dateStr);
    if (Number.isNaN(parsed.getTime()) || getLocalDateStr(parsed) !== dateStr) return false;
    return dateStr < cutoffDateStr;
}

function _countOldHistoryRecords(playerList, cutoffDateStr) {
    return playerList.reduce((stats, p) => {
        if (p && p.completionHistory && typeof p.completionHistory === 'object' && !Array.isArray(p.completionHistory)) {
            stats.completion += Object.keys(p.completionHistory).filter(dateStr => _isCleanupTargetDate(dateStr, cutoffDateStr)).length;
        }
        if (p && Array.isArray(p.workloadHistory)) {
            stats.workload += p.workloadHistory.filter(entry => entry && _isCleanupTargetDate(entry.date, cutoffDateStr)).length;
        }
        return stats;
    }, { completion: 0, workload: 0 });
}

function _cleanupOldHistoryRecords(cutoffDateStr) {
    players.forEach(p => {
        if (!p) return;
        if (p.completionHistory && typeof p.completionHistory === 'object' && !Array.isArray(p.completionHistory)) {
            Object.keys(p.completionHistory).forEach(dateStr => {
                if (_isCleanupTargetDate(dateStr, cutoffDateStr)) {
                    delete p.completionHistory[dateStr];
                }
            });
        }
        if (Array.isArray(p.workloadHistory)) {
            p.workloadHistory = p.workloadHistory.filter(entry => !entry || !_isCleanupTargetDate(entry.date, cutoffDateStr));
        }
    });
}

function requestCleanupOldRecords() {
    const cutoffDateStr = _getOldRecordCutoffDateStr();
    const stats = _countOldHistoryRecords(players, cutoffDateStr);
    const total = stats.completion + stats.workload;

    if (total === 0) {
        customAlert(`정리할 오래된 기록이 없습니다. 최근 ${OLD_RECORD_RETENTION_DAYS}일 기준으로 보존 중입니다.`);
        return;
    }

    customConfirm(
        `${OLD_RECORD_RETENTION_DAYS}일 이전 기록 ${total}건을 정리합니다.\n\n훈련기록 ${stats.completion}건, 워크로드 ${stats.workload}건이 삭제됩니다.\n진행 전 백업 다운로드를 권장합니다.\n\n계속할까요?`,
        () => {
            const prevPlayersSnapshot = typeof structuredClone === 'function'
                ? structuredClone(players)
                : JSON.parse(JSON.stringify(players));
            const prevCurrentId = currentId;

            _cleanupOldHistoryRecords(cutoffDateStr);

            if (!saveDB()) {
                players = prevPlayersSnapshot;
                currentId = prevCurrentId;
                renderBackupStorageStatus();
                return;
            }

            renderBackupStorageStatus();

            const listScreen = document.getElementById('s1');
            if (listScreen && listScreen.classList.contains('active')) {
                renderPlayerList();
            }

            const resultScreen = document.getElementById('s3');
            if (resultScreen && resultScreen.classList.contains('active') && currentId) {
                renderResult();
            }

            customAlert(`오래된 기록 정리가 완료되었습니다. 훈련기록 ${stats.completion}건, 워크로드 ${stats.workload}건을 정리했습니다.`);
        }
    );
}

function saveDB() {
    let serialized = '';
    try {
        serialized = JSON.stringify(players);
        localStorage.setItem('pLDB_v4_5', serialized);
        renderBackupStorageStatus();
        return true;
    } catch (e) {
        console.error('데이터 저장 실패:', e);
        if (typeof customAlert === 'function') {
            const sizeBytes = serialized
                ? (typeof Blob !== 'undefined' ? new Blob([serialized]).size : serialized.length)
                : NaN;
            const sizeLabel = serialized ? _formatStorageSize(sizeBytes) : '알 수 없음';
            const message = _isQuotaExceededError(e)
                ? `브라우저 저장공간이 부족해 데이터를 저장하지 못했습니다. 현재 데이터 크기: ${sizeLabel}. 데이터 관리에서 백업 다운로드를 먼저 실행한 뒤, 불필요한 브라우저 저장공간을 정리해주세요.`
                : `데이터 저장에 실패했습니다. 현재 데이터 크기: ${sizeLabel}. 브라우저 저장 설정 또는 시크릿 모드 여부를 확인하고, 데이터 관리에서 백업 다운로드로 현재 상태를 보관해주세요.`;
            customAlert(message);
        }
        return false;
    }
}
function showScreen(id) { document.querySelectorAll('.screen').forEach(s => s.classList.remove('active')); document.getElementById(id).classList.add('active'); }
function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

function validatePlayerForm(type) {
    let maxId, avgId, ageId, expId, veloErrorId, expErrorId, btnId;

    if (type === 'add') {
        maxId = 'pMaxVelo'; avgId = 'pAvgVelo';
        ageId = 'pAge'; expId = 'pExp';
        veloErrorId = 'addVeloError'; expErrorId = 'addExpError';
        btnId = 'addPlayerBtn';
    } else if (type === 'edit') {
        maxId = 'eMaxVelo'; avgId = 'eAvgVelo';
        ageId = 'eAge'; expId = 'eExp';
        veloErrorId = 'editVeloError'; expErrorId = 'editExpError';
        btnId = 'editPlayerBtn';
    } else if (type === 'perf') {
        maxId = 'newMaxVelo'; avgId = 'newAvgVelo';
        veloErrorId = 'perfVeloError';
        btnId = 'perfSaveBtn';
    }

    const btn = document.getElementById(btnId);
    if (!btn) return;

    let isValid = true;

    if (maxId && avgId) {
        const maxInput = document.getElementById(maxId);
        const avgInput = document.getElementById(avgId);
        const veloError = document.getElementById(veloErrorId);

        if (maxInput && avgInput && veloError) {
            const maxVal = parseFloat(maxInput.value);
            const avgVal = parseFloat(avgInput.value);
            if (!isNaN(maxVal) && !isNaN(avgVal) && avgVal > maxVal) {
                veloError.style.display = 'block';
                isValid = false;
            } else {
                veloError.style.display = 'none';
            }
        }
    }

    if (ageId && expId) {
        const ageInput = document.getElementById(ageId);
        const expInput = document.getElementById(expId);
        const expError = document.getElementById(expErrorId);

        if (ageInput && expInput && expError) {
            const ageVal = parseInt(ageInput.value);
            const expVal = parseInt(expInput.value);
            if (!isNaN(ageVal) && !isNaN(expVal) && expVal > ageVal) {
                expError.style.display = 'block';
                isValid = false;
            } else {
                expError.style.display = 'none';
            }
        }
    }

    if (isValid) {
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
    } else {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
    }
}

function customAlert(msg) {
    document.getElementById('alertMsg').innerText = msg;
    openModal('alertModal');
}

function customConfirm(msg, callback) {
    document.getElementById('confirmMsg').innerText = msg;
    const btn = document.getElementById('confirmBtn');
    if (_confirmBtnClickHandler) {
        btn.removeEventListener('click', _confirmBtnClickHandler);
    }
    _confirmBtnClickHandler = () => {
        if (callback) callback();
        closeModal('confirmModal');
    };
    btn.addEventListener('click', _confirmBtnClickHandler);
    openModal('confirmModal');
}

function _handleConfirmCancelClick(e) {
    e.preventDefault();
    e.stopPropagation();
    closeModal('confirmModal');
}

function _bindConfirmCancelClickHandler() {
    const btn = document.getElementById('confirmCancelBtn');
    if (!btn) return;
    if (_confirmCancelClickHandler) {
        btn.removeEventListener('click', _confirmCancelClickHandler);
    }
    _confirmCancelClickHandler = _handleConfirmCancelClick;
    btn.addEventListener('click', _confirmCancelClickHandler);
}

function _handleAlertConfirmClick(e) {
    e.preventDefault();
    e.stopPropagation();
    closeModal('alertModal');
}

function _bindAlertConfirmClickHandler() {
    const btn = document.getElementById('alertConfirmBtn');
    if (!btn) return;
    if (_alertConfirmClickHandler) {
        btn.removeEventListener('click', _alertConfirmClickHandler);
    }
    _alertConfirmClickHandler = _handleAlertConfirmClick;
    btn.addEventListener('click', _alertConfirmClickHandler);
}

function _handleGuideModalCloseClick(e) {
    const closeBtn = e.target.closest('[data-guide-modal-action="close"]');
    if (!closeBtn || !e.currentTarget.contains(closeBtn)) return;

    e.preventDefault();
    e.stopPropagation();
    closeModal('guideModal');
}

function _bindGuideModalCloseClickHandler() {
    const modal = document.getElementById('guideModal');
    if (!modal) return;
    if (_guideModalCloseClickHandler) {
        modal.removeEventListener('click', _guideModalCloseClickHandler);
    }
    _guideModalCloseClickHandler = _handleGuideModalCloseClick;
    modal.addEventListener('click', _guideModalCloseClickHandler);
}

function _handleSwapModalCloseClick(e) {
    const closeBtn = e.target.closest('[data-swap-modal-action="close"]');
    if (!closeBtn || !e.currentTarget.contains(closeBtn)) return;

    e.preventDefault();
    e.stopPropagation();
    closeModal('swapModal');
}

function _bindSwapModalCloseClickHandler() {
    const modal = document.getElementById('swapModal');
    if (!modal) return;
    if (_swapModalCloseClickHandler) {
        modal.removeEventListener('click', _swapModalCloseClickHandler);
    }
    _swapModalCloseClickHandler = _handleSwapModalCloseClick;
    modal.addEventListener('click', _swapModalCloseClickHandler);
}

function _handleSwapModalActionClick(e) {
    const actionBtn = e.target.closest('[data-swap-modal-action="confirm"], [data-swap-modal-action="reset"]');
    if (!actionBtn || !e.currentTarget.contains(actionBtn)) return;

    e.preventDefault();
    e.stopPropagation();

    const action = actionBtn.dataset.swapModalAction;
    if (action === 'confirm') {
        confirmSwap();
        return;
    }
    if (action === 'reset') {
        resetSwap();
    }
}

function _bindSwapModalActionClickHandler() {
    const modal = document.getElementById('swapModal');
    if (!modal) return;
    if (_swapModalActionClickHandler) {
        modal.removeEventListener('click', _swapModalActionClickHandler);
    }
    _swapModalActionClickHandler = _handleSwapModalActionClick;
    modal.addEventListener('click', _swapModalActionClickHandler);
}

function _handleAppGuideModalCloseClick(e) {
    const closeBtn = e.target.closest('[data-app-guide-modal-action="close"]');
    if (!closeBtn || !e.currentTarget.contains(closeBtn)) return;

    e.preventDefault();
    e.stopPropagation();
    closeModal('appGuideModal');
}

function _bindAppGuideModalCloseClickHandler() {
    const modal = document.getElementById('appGuideModal');
    if (!modal) return;
    if (_appGuideModalCloseClickHandler) {
        modal.removeEventListener('click', _appGuideModalCloseClickHandler);
    }
    _appGuideModalCloseClickHandler = _handleAppGuideModalCloseClick;
    modal.addEventListener('click', _appGuideModalCloseClickHandler);
}

function _handleWorkloadModalCloseClick(e) {
    const closeBtn = e.target.closest('[data-workload-modal-action="close"]');
    if (!closeBtn || !e.currentTarget.contains(closeBtn)) return;

    e.preventDefault();
    e.stopPropagation();
    closeModal('workloadModal');
}

function _bindWorkloadModalCloseClickHandler() {
    const modal = document.getElementById('workloadModal');
    if (!modal) return;
    if (_workloadModalCloseClickHandler) {
        modal.removeEventListener('click', _workloadModalCloseClickHandler);
    }
    _workloadModalCloseClickHandler = _handleWorkloadModalCloseClick;
    modal.addEventListener('click', _workloadModalCloseClickHandler);
}

function _handleWellnessModalCloseClick(e) {
    const closeBtn = e.target.closest('[data-wellness-modal-action="close"]');
    if (!closeBtn || !e.currentTarget.contains(closeBtn)) return;

    e.preventDefault();
    e.stopPropagation();
    closeModal('wellnessModal');
}

function _bindWellnessModalCloseClickHandler() {
    const modal = document.getElementById('wellnessModal');
    if (!modal) return;
    if (_wellnessModalCloseClickHandler) {
        modal.removeEventListener('click', _wellnessModalCloseClickHandler);
    }
    _wellnessModalCloseClickHandler = _handleWellnessModalCloseClick;
    modal.addEventListener('click', _wellnessModalCloseClickHandler);
}

function _handlePerfModalCloseClick(e) {
    const closeBtn = e.target.closest('[data-perf-modal-action="close"]');
    if (!closeBtn || !e.currentTarget.contains(closeBtn)) return;

    e.preventDefault();
    e.stopPropagation();
    closeModal('perfModal');
}

function _bindPerfModalCloseClickHandler() {
    const modal = document.getElementById('perfModal');
    if (!modal) return;
    if (_perfModalCloseClickHandler) {
        modal.removeEventListener('click', _perfModalCloseClickHandler);
    }
    _perfModalCloseClickHandler = _handlePerfModalCloseClick;
    modal.addEventListener('click', _perfModalCloseClickHandler);
}

function _handleEditPlayerModalCloseClick(e) {
    const closeBtn = e.target.closest('[data-edit-player-modal-action="close"]');
    if (!closeBtn || !e.currentTarget.contains(closeBtn)) return;

    e.preventDefault();
    e.stopPropagation();
    closeModal('editPlayerModal');
}

function _bindEditPlayerModalCloseClickHandler() {
    const modal = document.getElementById('editPlayerModal');
    if (!modal) return;
    if (_editPlayerModalCloseClickHandler) {
        modal.removeEventListener('click', _editPlayerModalCloseClickHandler);
    }
    _editPlayerModalCloseClickHandler = _handleEditPlayerModalCloseClick;
    modal.addEventListener('click', _editPlayerModalCloseClickHandler);
}

function _handleHeaderCtaClick(e) {
    const actionBtn = e.target.closest('[data-header-action]');
    if (!actionBtn || !e.currentTarget.contains(actionBtn)) return;

    e.preventDefault();
    e.stopPropagation();

    const action = actionBtn.dataset.headerAction;
    if (action === 'team-dashboard') {
        showScreen('s4');
        currentDashboardFilter = '조치 필요';
        renderTeamDashboard();
        return;
    }

    if (action === 'guide') {
        openGuideModal();
    }
}

function _bindHeaderCtaClickHandler() {
    const row = document.querySelector('.header-btn-row');
    if (!row) return;
    if (_headerCtaClickHandler) {
        row.removeEventListener('click', _headerCtaClickHandler);
    }
    _headerCtaClickHandler = _handleHeaderCtaClick;
    row.addEventListener('click', _headerCtaClickHandler);
}

function _handleBackupActionClick(e) {
    const actionBtn = e.target.closest('[data-backup-action]');
    if (!actionBtn || !e.currentTarget.contains(actionBtn)) return;

    e.preventDefault();
    e.stopPropagation();

    const action = actionBtn.dataset.backupAction;
    if (action === 'download') {
        downloadBackup();
        return;
    }

    if (action === 'restore') {
        triggerRestoreInput();
        return;
    }

    if (action === 'cleanup-old-records') {
        requestCleanupOldRecords();
        return;
    }

    if (action === 'reset-all') {
        requestResetAllData();
        return;
    }
}

let _resetAllInputHandler = null;
let _resetAllConfirmHandler = null;
let _resetAllCancelHandler = null;

function _computeResetAllSummary() {
    let pCount = 0, cCount = 0, wCount = 0;
    try {
        const list = (typeof players !== 'undefined' && Array.isArray(players)) ? players : [];
        pCount = list.length;
        for (const p of list) {
            if (!p || typeof p !== 'object') continue;
            if (p.completionHistory && typeof p.completionHistory === 'object') {
                cCount += Object.keys(p.completionHistory).length;
            }
            if (p.dailyCompletion && typeof p.dailyCompletion === 'object') {
                cCount += Object.keys(p.dailyCompletion).length;
            }
            if (p.workloadHistory && typeof p.workloadHistory === 'object') {
                wCount += Object.keys(p.workloadHistory).length;
            }
        }
    } catch (_) {}
    return { players: pCount, completion: cCount, workload: wCount };
}

function requestResetAllData() {
    const summary = _computeResetAllSummary();
    const summaryEl = document.getElementById('resetAllSummary');
    if (summaryEl) {
        summaryEl.innerHTML = `현재 등록 선수 <strong>${summary.players}명</strong>, 훈련 완료 기록 <strong>${summary.completion}건</strong>, 워크로드 기록 <strong>${summary.workload}건</strong>이 모두 삭제됩니다.`;
    }
    const input = document.getElementById('resetAllInput');
    const confirmBtn = document.getElementById('resetAllConfirmBtn');
    if (input) input.value = '';
    if (confirmBtn) confirmBtn.disabled = true;
    _bindResetAllModalHandlers();
    openModal('resetAllModal');
    if (input) {
        setTimeout(() => { try { input.focus(); } catch (_) {} }, 60);
    }
}

function _handleResetAllInputChange(e) {
    const input = e.target;
    const confirmBtn = document.getElementById('resetAllConfirmBtn');
    if (!confirmBtn) return;
    confirmBtn.disabled = (input.value || '').trim() !== '초기화';
}

function _handleResetAllConfirmClick(e) {
    e.preventDefault();
    e.stopPropagation();
    const input = document.getElementById('resetAllInput');
    if (input && (input.value || '').trim() !== '초기화') return;
    _safeLocalStorageRemove('pLDB_v4_5');
    _safeLocalStorageRemove('pLAppGuideSeen_v1');
    closeModal('resetAllModal');
    try {
        location.reload();
    } catch (_) {}
}

function _handleResetAllCancelClick(e) {
    e.preventDefault();
    e.stopPropagation();
    closeModal('resetAllModal');
}

function _bindResetAllModalHandlers() {
    const input = document.getElementById('resetAllInput');
    if (input) {
        if (_resetAllInputHandler) {
            input.removeEventListener('input', _resetAllInputHandler);
        }
        _resetAllInputHandler = _handleResetAllInputChange;
        input.addEventListener('input', _resetAllInputHandler);
    }
    const confirmBtn = document.getElementById('resetAllConfirmBtn');
    if (confirmBtn) {
        if (_resetAllConfirmHandler) {
            confirmBtn.removeEventListener('click', _resetAllConfirmHandler);
        }
        _resetAllConfirmHandler = _handleResetAllConfirmClick;
        confirmBtn.addEventListener('click', _resetAllConfirmHandler);
    }
    const cancelBtn = document.getElementById('resetAllCancelBtn');
    if (cancelBtn) {
        if (_resetAllCancelHandler) {
            cancelBtn.removeEventListener('click', _resetAllCancelHandler);
        }
        _resetAllCancelHandler = _handleResetAllCancelClick;
        cancelBtn.addEventListener('click', _resetAllCancelHandler);
    }
}

function _handleBackupRestoreChange(e) {
    const input = e.target.closest('[data-backup-file-input="restore"]');
    if (!input || !e.currentTarget.contains(input)) return;

    handleRestoreFile(e);
}

function _bindBackupControlHandlers() {
    const section = document.getElementById('backupSection');
    if (!section) return;

    if (_backupActionClickHandler) {
        section.removeEventListener('click', _backupActionClickHandler);
    }
    _backupActionClickHandler = _handleBackupActionClick;
    section.addEventListener('click', _backupActionClickHandler);

    if (_backupRestoreChangeHandler) {
        section.removeEventListener('change', _backupRestoreChangeHandler);
    }
    _backupRestoreChangeHandler = _handleBackupRestoreChange;
    section.addEventListener('change', _backupRestoreChangeHandler);
}

function _handleResultViewToggleClick(e) {
    const viewBtn = e.target.closest('[data-view-mode]');
    if (!viewBtn || !e.currentTarget.contains(viewBtn)) return;

    e.preventDefault();
    e.stopPropagation();

    const mode = viewBtn.dataset.viewMode;
    if (!['card', 'calendar', 'monthly'].includes(mode)) return;

    toggleViewMode(mode);
}

function _bindResultViewToggleClickHandler() {
    const toggle = document.querySelector('.view-toggle');
    if (!toggle) return;
    if (_resultViewToggleClickHandler) {
        toggle.removeEventListener('click', _resultViewToggleClickHandler);
    }
    _resultViewToggleClickHandler = _handleResultViewToggleClick;
    toggle.addEventListener('click', _resultViewToggleClickHandler);
}

function _handleAssessmentActionClick(e) {
    const actionBtn = e.target.closest('[data-assessment-action]');
    if (!actionBtn || !e.currentTarget.contains(actionBtn)) return;

    e.preventDefault();
    e.stopPropagation();

    const action = actionBtn.dataset.assessmentAction;
    if (action === 'skip') {
        showScreen('s1');
        renderPlayerList();
        return;
    }

    if (action === 'save') {
        saveAssessment();
    }
}

function _bindAssessmentActionClickHandler() {
    const row = document.querySelector('.assess-action-row');
    if (!row) return;
    if (_assessmentActionClickHandler) {
        row.removeEventListener('click', _assessmentActionClickHandler);
    }
    _assessmentActionClickHandler = _handleAssessmentActionClick;
    row.addEventListener('click', _assessmentActionClickHandler);
}

function _handleAddPlayerSubmitClick(e) {
    const submitBtn = e.target.closest('[data-add-player-action="submit"]');
    if (!submitBtn || submitBtn !== e.currentTarget) return;

    e.preventDefault();
    e.stopPropagation();
    addPlayer();
}

function _bindAddPlayerSubmitClickHandler() {
    const btn = document.getElementById('addPlayerBtn');
    if (!btn) return;
    if (_addPlayerSubmitClickHandler) {
        btn.removeEventListener('click', _addPlayerSubmitClickHandler);
    }
    _addPlayerSubmitClickHandler = _handleAddPlayerSubmitClick;
    btn.addEventListener('click', _addPlayerSubmitClickHandler);
}

function _handleAddPlayerTypeClick(e) {
    const typeBtn = e.target.closest('[data-player-type-action="select"]');
    if (!typeBtn || !e.currentTarget.contains(typeBtn)) return;

    e.preventDefault();
    e.stopPropagation();

    const type = typeBtn.dataset.playerType;
    const formType = typeBtn.dataset.playerFormType;
    if (!['투수', '타자'].includes(type)) return;
    if (formType !== 'add') return;

    selectPlayerType(type, formType);
}

function _bindAddPlayerTypeClickHandler() {
    const addTypeToggle = document.getElementById('addTypePitcher')?.closest('.type-toggle');
    if (!addTypeToggle) return;
    if (_addPlayerTypeClickHandler) {
        addTypeToggle.removeEventListener('click', _addPlayerTypeClickHandler);
    }
    _addPlayerTypeClickHandler = _handleAddPlayerTypeClick;
    addTypeToggle.addEventListener('click', _addPlayerTypeClickHandler);
}

function _handleAddPlayerValidateInput(e) {
    const input = e.target.closest('[data-add-player-validate="input"]');
    if (!input || !e.currentTarget.contains(input)) return;

    validatePlayerForm('add');
}

function _bindAddPlayerValidateInputHandler() {
    const addPlayerCard = document.getElementById('pAge')?.closest('.card');
    if (!addPlayerCard) return;
    if (_addPlayerValidateInputHandler) {
        addPlayerCard.removeEventListener('input', _addPlayerValidateInputHandler);
    }
    _addPlayerValidateInputHandler = _handleAddPlayerValidateInput;
    addPlayerCard.addEventListener('input', _addPlayerValidateInputHandler);
}

function _handleAddPlayerPainChange(e) {
    const checkbox = e.target.closest('input[name="pPain"]');
    if (!checkbox || !e.currentTarget.contains(checkbox)) return;

    handlePainCheck(checkbox, 'pPain');
}

function _bindAddPlayerPainChangeHandler() {
    const painGroup = document.querySelector('[data-add-player-pain-group="pPain"]');
    if (!painGroup) return;
    if (_addPlayerPainChangeHandler) {
        painGroup.removeEventListener('change', _addPlayerPainChangeHandler);
    }
    _addPlayerPainChangeHandler = _handleAddPlayerPainChange;
    painGroup.addEventListener('change', _addPlayerPainChangeHandler);
}

function _handleEditPlayerTypeClick(e) {
    const typeBtn = e.target.closest('[data-player-type-action="select"]');
    if (!typeBtn || !e.currentTarget.contains(typeBtn)) return;

    e.preventDefault();
    e.stopPropagation();

    const type = typeBtn.dataset.playerType;
    const formType = typeBtn.dataset.playerFormType;
    if (!['투수', '타자'].includes(type)) return;
    if (formType !== 'edit') return;

    selectPlayerType(type, formType);
}

function _bindEditPlayerTypeClickHandler() {
    const editTypeToggle = document.getElementById('editTypePitcher')?.closest('.type-toggle');
    if (!editTypeToggle) return;
    if (_editPlayerTypeClickHandler) {
        editTypeToggle.removeEventListener('click', _editPlayerTypeClickHandler);
    }
    _editPlayerTypeClickHandler = _handleEditPlayerTypeClick;
    editTypeToggle.addEventListener('click', _editPlayerTypeClickHandler);
}

function _handleEditPlayerValidateInput(e) {
    const input = e.target.closest('[data-edit-player-validate="input"]');
    if (!input || !e.currentTarget.contains(input)) return;

    validatePlayerForm('edit');
}

function _bindEditPlayerValidateInputHandler() {
    const editModal = document.getElementById('editPlayerModal');
    if (!editModal) return;
    if (_editPlayerValidateInputHandler) {
        editModal.removeEventListener('input', _editPlayerValidateInputHandler);
    }
    _editPlayerValidateInputHandler = _handleEditPlayerValidateInput;
    editModal.addEventListener('input', _editPlayerValidateInputHandler);
}

function _handleEditPlayerSaveClick(e) {
    const saveBtn = e.target.closest('[data-edit-player-action="save"]');
    if (!saveBtn || saveBtn !== e.currentTarget) return;

    e.preventDefault();
    e.stopPropagation();
    savePlayerEdit();
}

function _bindEditPlayerSaveClickHandler() {
    const btn = document.getElementById('editPlayerBtn');
    if (!btn) return;
    if (_editPlayerSaveClickHandler) {
        btn.removeEventListener('click', _editPlayerSaveClickHandler);
    }
    _editPlayerSaveClickHandler = _handleEditPlayerSaveClick;
    btn.addEventListener('click', _editPlayerSaveClickHandler);
}

function _handlePerfValidateInput(e) {
    const input = e.target.closest('[data-perf-validate="input"]');
    if (!input || !e.currentTarget.contains(input)) return;

    validatePlayerForm('perf');
}

function _bindPerfValidateInputHandler() {
    const perfModal = document.getElementById('perfModal');
    if (!perfModal) return;
    if (_perfValidateInputHandler) {
        perfModal.removeEventListener('input', _perfValidateInputHandler);
    }
    _perfValidateInputHandler = _handlePerfValidateInput;
    perfModal.addEventListener('input', _perfValidateInputHandler);
}

function _handlePerfSaveClick(e) {
    const saveBtn = e.target.closest('[data-perf-action="save"]');
    if (!saveBtn || saveBtn !== e.currentTarget) return;

    e.preventDefault();
    e.stopPropagation();
    savePerformance();
}

function _bindPerfSaveClickHandler() {
    const btn = document.getElementById('perfSaveBtn');
    if (!btn) return;
    if (_perfSaveClickHandler) {
        btn.removeEventListener('click', _perfSaveClickHandler);
    }
    _perfSaveClickHandler = _handlePerfSaveClick;
    btn.addEventListener('click', _perfSaveClickHandler);
}

function _handleWellnessSliderInput(e) {
    const slider = e.target.closest('[data-wellness-slider-target]');
    if (!slider || !e.currentTarget.contains(slider)) return;

    const targetId = slider.dataset.wellnessSliderTarget;
    const target = document.getElementById(targetId);
    if (!target) return;

    target.innerText = slider.value;
}

function _bindWellnessSliderInputHandler() {
    const modal = document.getElementById('wellnessModal');
    if (!modal) return;
    if (_wellnessSliderInputHandler) {
        modal.removeEventListener('input', _wellnessSliderInputHandler);
    }
    _wellnessSliderInputHandler = _handleWellnessSliderInput;
    modal.addEventListener('input', _wellnessSliderInputHandler);
}

function _handleWellnessPainChange(e) {
    const checkbox = e.target.closest('input[name="wPain"]');
    if (!checkbox || !e.currentTarget.contains(checkbox)) return;

    handlePainCheck(checkbox, 'wPain');
}

function _bindWellnessPainChangeHandler() {
    const painGroup = document.querySelector('[data-wellness-pain-group="wPain"]');
    if (!painGroup) return;
    if (_wellnessPainChangeHandler) {
        painGroup.removeEventListener('change', _wellnessPainChangeHandler);
    }
    _wellnessPainChangeHandler = _handleWellnessPainChange;
    painGroup.addEventListener('change', _wellnessPainChangeHandler);
}

function _handleWellnessSaveClick(e) {
    const saveBtn = e.target.closest('[data-wellness-action="save"]');
    if (!saveBtn || saveBtn !== e.currentTarget) return;

    e.preventDefault();
    e.stopPropagation();
    saveWellness();
}

function _bindWellnessSaveClickHandler() {
    const btn = document.getElementById('wellnessSaveBtn');
    if (!btn) return;
    if (_wellnessSaveClickHandler) {
        btn.removeEventListener('click', _wellnessSaveClickHandler);
    }
    _wellnessSaveClickHandler = _handleWellnessSaveClick;
    btn.addEventListener('click', _wellnessSaveClickHandler);
}

function _handleWorkloadRestTodayClick(e) {
    const restBtn = e.target.closest('[data-workload-action="rest-today"]');
    if (!restBtn || restBtn !== e.currentTarget) return;

    e.preventDefault();
    e.stopPropagation();
    setNoWorkloadToday();
}

function _bindWorkloadRestTodayClickHandler() {
    const btn = document.getElementById('wlNoBtn');
    if (!btn) return;
    if (_workloadRestTodayClickHandler) {
        btn.removeEventListener('click', _workloadRestTodayClickHandler);
    }
    _workloadRestTodayClickHandler = _handleWorkloadRestTodayClick;
    btn.addEventListener('click', _workloadRestTodayClickHandler);
}

function _handleWorkloadLiveCalcInput(e) {
    const input = e.target.closest('[data-workload-live-calc="input"]');
    if (!input || !e.currentTarget.contains(input)) return;

    calculateLiveWorkload();
}

function _bindWorkloadLiveCalcInputHandler() {
    const modal = document.getElementById('workloadModal');
    if (!modal) return;
    if (_workloadLiveCalcInputHandler) {
        modal.removeEventListener('input', _workloadLiveCalcInputHandler);
    }
    _workloadLiveCalcInputHandler = _handleWorkloadLiveCalcInput;
    modal.addEventListener('input', _workloadLiveCalcInputHandler);
}

function _handleWorkloadSaveClick(e) {
    const saveBtn = e.target.closest('[data-workload-action="save"]');
    if (!saveBtn || saveBtn !== e.currentTarget) return;

    e.preventDefault();
    e.stopPropagation();
    saveDailyWorkload();
}

function _bindWorkloadSaveClickHandler() {
    const btn = document.getElementById('workloadSaveBtn');
    if (!btn) return;
    if (_workloadSaveClickHandler) {
        btn.removeEventListener('click', _workloadSaveClickHandler);
    }
    _workloadSaveClickHandler = _handleWorkloadSaveClick;
    btn.addEventListener('click', _workloadSaveClickHandler);
}

function _handleRpeBarClick(e) {
    const cell = e.target.closest('.rpe-cell[data-rpe-value]');
    if (!cell || !e.currentTarget.contains(cell)) return;

    const value = cell.dataset.rpeValue;
    const rpeInput = document.getElementById('wlRPE');
    if (!rpeInput) return;

    rpeInput.value = value;
    rpeInput.dispatchEvent(new Event('input', { bubbles: true }));
    _syncRpeBarSelection(value);
}

function _syncRpeBarSelection(value) {
    const bar = document.getElementById('wlRpeBar');
    if (!bar) return;

    const cells = bar.querySelectorAll('.rpe-cell[data-rpe-value]');
    const raw = (value === '' || value === null || value === undefined) ? '' : String(value).trim();
    const num = raw === '' ? NaN : Number(raw);
    const hasSelection = Number.isFinite(num) && Number.isInteger(num) && num >= 0 && num <= 10;

    let matched = false;
    cells.forEach(cell => {
        const cellValue = Number(cell.dataset.rpeValue);
        const isSelected = hasSelection && cellValue === num;
        cell.setAttribute('aria-checked', isSelected ? 'true' : 'false');
        cell.setAttribute('tabindex', isSelected ? '0' : '-1');
        if (isSelected) matched = true;
    });

    if (!matched && cells.length > 0) {
        cells[0].setAttribute('tabindex', '0');
    }
}

function _bindRpeBarClickHandler() {
    const bar = document.getElementById('wlRpeBar');
    if (!bar) return;
    if (_rpeBarClickHandler) {
        bar.removeEventListener('click', _rpeBarClickHandler);
    }
    _rpeBarClickHandler = _handleRpeBarClick;
    bar.addEventListener('click', _rpeBarClickHandler);
}

function _handleStaticNavClick(e) {
    const btn = e.target.closest('[data-static-nav-action]');
    if (!btn || btn !== e.currentTarget) return;

    const action = btn.dataset.staticNavAction;
    if (action === 'player-list-refresh') {
        e.preventDefault();
        e.stopPropagation();
        showScreen('s1');
        renderPlayerList();
        return;
    }

    if (action === 'home') {
        e.preventDefault();
        e.stopPropagation();
        showScreen('s1');
    }
}

function _bindStaticNavClickHandler() {
    const buttons = document.querySelectorAll('[data-static-nav-action]');
    buttons.forEach(btn => {
        if (_staticNavClickHandler) {
            btn.removeEventListener('click', _staticNavClickHandler);
        }
    });
    _staticNavClickHandler = _handleStaticNavClick;
    buttons.forEach(btn => {
        btn.addEventListener('click', _staticNavClickHandler);
    });
}

function openGuideModal() {
    if (!_safeLocalStorageGet('pLAppGuideSeen_v1')) {
        _safeLocalStorageSet('pLAppGuideSeen_v1', '1');
    }
    openModal('appGuideModal');
}

function handlePainCheck(checkbox, groupName) {
    if (!['pPain', 'wPain'].includes(groupName)) return;
    const checkboxes = document.querySelectorAll(`input[name="${groupName}"]`);
    if (checkbox.value === '없음' && checkbox.checked) {
        checkboxes.forEach(cb => { if (cb.value !== '없음') cb.checked = false; });
    } else if (checkbox.checked) {
        document.querySelector(`input[name="${groupName}"][value="없음"]`).checked = false;
    }

    // 최소 하나는 선택되도록 보장
    const checkedCount = document.querySelectorAll(`input[name="${groupName}"]:checked`).length;
    if (checkedCount === 0) {
        document.querySelector(`input[name="${groupName}"][value="없음"]`).checked = true;
    }

    const isNone = document.querySelector(`input[name="${groupName}"][value="없음"]`).checked;
    const recoveryGroup = groupName === 'pPain' ? document.getElementById('initialRecoveryGroup') : document.getElementById('wellnessRecoveryGroup');

    if (recoveryGroup) {
        if (isNone) {
            recoveryGroup.style.display = 'none';
            recoveryGroup.replaceChildren();
        } else {
            recoveryGroup.style.display = 'block';
            const rawChecked = Array.from(document.querySelectorAll(`input[name="${groupName}"]:checked`)).map(cb => cb.value);
            const checkedAreas = _normalizePainAreas(rawChecked).filter(a => a !== '없음');
            let html = `<div class="recovery-picker-label">통증 부위별 회복 상태 점수</div>`;
            html += `<div class="recovery-picker-help">1은 통증/불편감이 큰 상태, 10은 회복이 양호한 상태입니다.</div>`;

            checkedAreas.forEach(area => {
                let currentValue = 5;
                const existingInput = document.getElementById(`rLv_${groupName}_${area}`);
                if (existingInput && existingInput.value !== undefined && existingInput.value !== '') {
                    currentValue = existingInput.value;
                } else if (groupName === 'wPain' && currentId) {
                    const p = players.find(p => String(p.id) === String(currentId));
                    if (p && p.wellness && p.wellness.recovery && typeof p.wellness.recovery === 'object' && p.wellness.recovery[area] !== undefined) {
                        currentValue = p.wellness.recovery[area];
                    }
                }
                html += _renderRecoveryLevelPicker(groupName, area, currentValue);
            });
            recoveryGroup.innerHTML = html;
            _bindRecoveryScoreClickHandler(recoveryGroup);
        }
    }
}

function _normalizeRecoveryLevel(value) {
    return Math.round(_clampNumber(value, 1, 10, 5));
}

function _getRecoveryStatus(level) {
    const normalized = _normalizeRecoveryLevel(level);
    if (normalized <= 3) return { className: 'is-low', text: '회복 낮음 · 강도 조절 권장' };
    if (normalized <= 6) return { className: 'is-mid', text: '주의 · 상태 확인 필요' };
    return { className: 'is-good', text: '양호 · 훈련 가능' };
}

function _renderRecoveryLevelPicker(groupName, area, currentValue) {
    if (!['pPain', 'wPain'].includes(groupName)) return '';
    if (!_PAIN_WHITELIST.includes(area)) return '';
    if (area === '없음') return '';
    const normalized = _normalizeRecoveryLevel(currentValue);
    const inputId = `rLv_${groupName}_${area}`;
    const safeInputIdAttr = escapeHTML(inputId);
    const safeAreaAttr = escapeHTML(area);
    const safeAreaText = escapeHTML(area);
    const status = _getRecoveryStatus(normalized);
    const safeStatusClass = escapeHTML(status.className);
    const safeStatusText = escapeHTML(status.text);

    let buttonsHtml = '';
    for (let i = 1; i <= 10; i++) {
        const isActive = i === normalized;
        const activeClass = isActive ? ' active' : '';
        const ariaPressed = isActive ? 'true' : 'false';
        buttonsHtml += `<button type="button" class="recovery-score-btn${activeClass}" data-recovery-action="set-level" data-input-id="${safeInputIdAttr}" data-value="${i}" aria-pressed="${ariaPressed}">${i}</button>`;
    }

    return `
        <div class="recovery-score-card">
            <div class="recovery-score-head">
                <span class="recovery-score-title">${safeAreaText} 회복 상태</span>
                <span class="recovery-score-current">현재 ${normalized} / 10</span>
            </div>
            <div class="recovery-score-grid">${buttonsHtml}</div>
            <div class="recovery-score-caption">1 통증/불편감 큼 · 10 회복 양호</div>
            <div class="recovery-score-status ${safeStatusClass}">${safeStatusText}</div>
            <input type="hidden" id="${safeInputIdAttr}" data-area="${safeAreaAttr}" value="${normalized}">
        </div>
    `;
}

function _handleRecoveryScoreClick(e) {
    const scoreBtn = e.target.closest('[data-recovery-action="set-level"]');
    if (!scoreBtn || !e.currentTarget.contains(scoreBtn)) return;

    e.preventDefault();
    e.stopPropagation();

    const inputId = scoreBtn.dataset.inputId || '';
    const value = scoreBtn.dataset.value || '';
    if (!inputId || !/^\d+$/.test(value)) return;

    setRecoveryLevel(inputId, Number(value));
}

function _bindRecoveryScoreClickHandler(root) {
    if (!root) return;
    if (_recoveryScoreClickHandler) {
        root.removeEventListener('click', _recoveryScoreClickHandler);
    }
    _recoveryScoreClickHandler = _handleRecoveryScoreClick;
    root.addEventListener('click', _recoveryScoreClickHandler);
}

function setRecoveryLevel(inputId, value) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const normalized = _normalizeRecoveryLevel(value);
    input.value = normalized;
    const card = input.closest('.recovery-score-card');
    if (!card) return;
    const currentEl = card.querySelector('.recovery-score-current');
    if (currentEl) currentEl.textContent = `현재 ${normalized} / 10`;
    card.querySelectorAll('.recovery-score-btn').forEach(btn => {
        const v = parseInt(btn.getAttribute('data-value'), 10);
        const isActive = v === normalized;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
    const statusEl = card.querySelector('.recovery-score-status');
    if (statusEl) {
        const status = _getRecoveryStatus(normalized);
        statusEl.classList.remove('is-low', 'is-mid', 'is-good');
        statusEl.classList.add(status.className);
        statusEl.textContent = status.text;
    }
}

function _normalizePainAreas(pain) {
    if (!Array.isArray(pain) || pain.length === 0) return ['없음'];
    const filtered = [...new Set(pain.filter(v => _PAIN_WHITELIST.includes(v)))];
    if (filtered.length === 0) return ['없음'];
    if (filtered.includes('없음')) return ['없음'];
    return filtered;
}

function _optNumInRange(val, min, max) {
    if (val === '' || val === null || val === undefined) return true;
    const s = String(val).trim();
    if (s === '') return true;
    const n = Number(s);
    if (!Number.isFinite(n)) return false;
    return n >= min && n <= max;
}

function _normalizeOptionalNumberValue(value) {
    if (value === null || value === undefined) return '';
    const s = String(value).trim();
    if (s === '') return '';
    const n = Number(s);
    return Number.isFinite(n) ? n : '';
}

function _normalizeTrainingTimeValue(value) {
    const allowed = [30, 60, 90, 120];
    const n = parseInt(value, 10);
    return allowed.includes(n) ? n : 60;
}

function _clampNumber(val, min, max, fallback) {
    const s = String(val).trim();
    if (s === '') return fallback;
    const n = Number(s);
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, n));
}

function addPlayer() {
    const name = document.getElementById('pName').value.trim();
    const playerType = document.getElementById('pType').value;
    const userType = _normalizeUserType(document.getElementById('pUserType').value);
    const usagePerspective = _normalizeUsagePerspective(document.getElementById('pUsagePerspective').value);
    const trainingFocus = _normalizeTrainingFocus(document.getElementById('pTrainingFocus').value);

    const _pAgeRaw = String(document.getElementById('pAge').value).trim();
    const _pExpRaw = String(document.getElementById('pExp').value).trim();
    const _pHeightRaw = String(document.getElementById('pHeight').value).trim();
    const _pWeightRaw = String(document.getElementById('pWeight').value).trim();

    if (!name) return customAlert('선수 이름을 입력하세요.');

    if (_pAgeRaw === '') return customAlert('올바른 나이를 입력하세요.');
    const ageInput = Number(_pAgeRaw);
    if (!Number.isFinite(ageInput) || !Number.isInteger(ageInput) || ageInput <= 0) return customAlert('올바른 나이를 입력하세요.');
    if (ageInput < 5 || ageInput > 80) return customAlert('나이는 5~80 범위만 허용됩니다.');

    if (_pExpRaw === '') return customAlert('구력을 입력하세요. 야구 경력이 없으면 0을 입력하세요.');
    let expInput = 0;
    if (_pExpRaw !== '') {
        const expNum = Number(_pExpRaw);
        if (!Number.isFinite(expNum) || !Number.isInteger(expNum)) return customAlert('구력은 0 이상의 정수만 입력 가능합니다.');
        if (expNum < 0) return customAlert('구력은 0 이상이어야 합니다.');
        expInput = expNum;
    }
    if (expInput > ageInput) return customAlert('구력이 나이보다 높을 수 없습니다.');

    if (_pHeightRaw === '') return customAlert('키를 입력하세요.');
    let heightInput = 0;
    if (_pHeightRaw !== '') {
        const heightNum = Number(_pHeightRaw);
        if (!Number.isFinite(heightNum) || !Number.isInteger(heightNum)) return customAlert('키는 정수만 입력 가능합니다.');
        heightInput = heightNum;
    }
    if (heightInput < 100 || heightInput > 230) return customAlert('키는 100~230cm 범위만 허용됩니다.');

    if (_pWeightRaw === '') return customAlert('체중을 입력하세요.');
    let weightInput = 0;
    if (_pWeightRaw !== '') {
        const weightNum = Number(_pWeightRaw);
        if (!Number.isFinite(weightNum) || !Number.isInteger(weightNum)) return customAlert('몸무게는 정수만 입력 가능합니다.');
        weightInput = weightNum;
    }
    if (weightInput < 20 || weightInput > 200) return customAlert('몸무게는 20~200kg 범위만 허용됩니다.');

    let ageGroup = '성인';
    if (ageInput <= 12) ageGroup = 'U-12';
    else if (ageInput <= 15) ageGroup = 'U-15';
    else if (ageInput <= 18) ageGroup = 'U-18';

    const painCheckboxes = document.querySelectorAll('input[name="pPain"]:checked');
    let painAreas = Array.from(painCheckboxes).map(cb => cb.value);
    if (painAreas.length === 0 || painAreas.includes('없음')) painAreas = ['없음'];

    let recoveryData = {};
    if (!painAreas.includes('없음')) {
        painAreas.forEach(area => {
            const slider = document.getElementById(`rLv_pPain_${area}`);
            if (slider) {
                recoveryData[area] = Math.round(_clampNumber(slider.value, 1, 10, 5));
            } else {
                recoveryData[area] = 5;
            }
        });
    } else {
        recoveryData = { '없음': 10 };
    }

    let newPlayer;

    if (playerType === '타자') {
        const batterPos = document.getElementById('pBatterPos').value;
        const season = document.getElementById('pBatterSeason').value;
        const goal = document.getElementById('pBatterGoal').value;
        const trainingTimeRaw = document.getElementById('pBatterTime').value;
        const exitVeloRaw = document.getElementById('pExitVelo').value;
        const batSpeedRaw = document.getElementById('pBatSpeed').value;
        if (!_optNumInRange(exitVeloRaw, 30, 200)) return customAlert('타구속도는 30~200km/h 범위만 허용됩니다.');
        if (!_optNumInRange(batSpeedRaw, 20, 130)) return customAlert('배트스피드는 20~130km/h 범위만 허용됩니다.');

        const trainingTime = _normalizeTrainingTimeValue(trainingTimeRaw);
        const exitVelo = _normalizeOptionalNumberValue(exitVeloRaw);
        const batSpeed = _normalizeOptionalNumberValue(batSpeedRaw);

        newPlayer = {
            id: generateUUID(), name, type: '타자', userType, usagePerspective, trainingFocus, age: ageGroup, realAge: ageInput, exp: expInput, height: heightInput, weight: weightInput,
            batterPos, season, goal, week: 1, exitVelo, batSpeed, trainingTime,
            scores: null, wellness: { sleep: 7, fatigue: 3, soreness: 2, pain: painAreas, recovery: recoveryData, date: getTodayStr() },
            isUpgraded: false, prevExitVelo: exitVelo,
            weekStartDate: getTodayStr(), dailyCompletion: {},
            performanceHistory: [{ date: new Date().toISOString().split('T')[0], exitVelo, batSpeed }],
            workloadHistory: []
        };
    } else {
        const role = document.getElementById('pRole').value;
        const season = document.getElementById('pSeason').value;
        const goal = document.getElementById('pGoal').value;
        const maxVeloRaw = document.getElementById('pMaxVelo').value;
        const avgVeloRaw = document.getElementById('pAvgVelo').value;
        const rpmRaw = document.getElementById('pRPM').value;
        const pitchDate = document.getElementById('pPitchDate').value;
        const trainingTimeRaw = document.getElementById('pTime').value;

        if (!_optNumInRange(maxVeloRaw, 30, 180)) return customAlert('최고구속은 30~180km/h 범위만 허용됩니다.');
        if (!_optNumInRange(avgVeloRaw, 30, 180)) return customAlert('평균구속은 30~180km/h 범위만 허용됩니다.');
        if (!_optNumInRange(rpmRaw, 0, 4000)) return customAlert('RPM은 0~4000 범위만 허용됩니다.');

        const maxVelo = _normalizeOptionalNumberValue(maxVeloRaw);
        const avgVelo = _normalizeOptionalNumberValue(avgVeloRaw);
        const rpm = _normalizeOptionalNumberValue(rpmRaw);
        const trainingTime = _normalizeTrainingTimeValue(trainingTimeRaw);

        if (maxVelo !== '' && avgVelo !== '' && avgVelo > maxVelo) {
            return customAlert('평균구속이 최고구속보다 높을 수 없습니다.');
        }

        newPlayer = {
            id: generateUUID(), name, type: '투수', userType, usagePerspective, trainingFocus, age: ageGroup, realAge: ageInput, exp: expInput, height: heightInput, weight: weightInput, role, season, goal, week: 1, maxVelo, avgVelo, rpm, pitchDate, trainingTime,
            scores: null, wellness: { sleep: 7, fatigue: 3, soreness: 2, pain: painAreas, recovery: recoveryData, date: getTodayStr() },
            isUpgraded: false, prevMaxVelo: maxVelo, prevRPM: rpm,
            weekStartDate: getTodayStr(), dailyCompletion: {},
            performanceHistory: [{ date: new Date().toISOString().split('T')[0], maxVelo, avgVelo, rpm }],
            workloadHistory: []
        };
    }

    const prevPlayersLength = players.length;
    players.push(newPlayer);
    if (!saveDB()) {
        players.length = prevPlayersLength;
        renderBackupStorageStatus();
        return;
    }

    // Reset form
    document.getElementById('pName').value = '';
    document.getElementById('pAge').value = '';
    document.getElementById('pExp').value = '';
    document.getElementById('pHeight').value = '';
    document.getElementById('pWeight').value = '';
    if (playerType === '타자') {
        document.getElementById('pExitVelo').value = '';
        document.getElementById('pBatSpeed').value = '';
    } else {
        document.getElementById('pMaxVelo').value = '';
        document.getElementById('pAvgVelo').value = '';
        document.getElementById('pRPM').value = '';
        document.getElementById('pPitchDate').value = '';
    }
    document.querySelectorAll('input[name="pPain"]').forEach(cb => cb.checked = (cb.value === '없음'));
    const initialRecoveryGroup = document.getElementById('initialRecoveryGroup');
    if (initialRecoveryGroup) initialRecoveryGroup.style.display = 'none';
    selectPlayerType('투수', 'add');

    currentId = newPlayer.id;
    renderAssessmentForm(newPlayer);
    showScreen('s2');
}

function deletePlayer(id) {
    customConfirm('정말 이 선수를 삭제하시겠습니까?', () => {
        const prevPlayers = players;
        players = players.filter(p => String(p.id) !== String(id));
        if (!saveDB()) {
            players = prevPlayers;
            renderBackupStorageStatus();
            return;
        }
        renderPlayerList();
    });
}

function getWeekAdvanceStatus(player) {
    const dailyCompletion = player && player.dailyCompletion ? player.dailyCompletion : {};
    const completedDays = Array.from({ length: 7 }, (_, index) => {
        const entry = dailyCompletion[index];
        return !!(entry && entry.completed);
    }).filter(Boolean).length;

    const missedDayIndices = Array.from({ length: 7 }, (_, index) => index)
        .filter(index => {
            const entry = dailyCompletion[index];
            return !(entry && entry.completed);
        });
    const missedDays = missedDayIndices.length;

    const day7Completed = !!(dailyCompletion[6] && dailyCompletion[6].completed);

    let diffDays = 0;
    if (player && player.weekStartDate) {
        const start = parseLocalDate(player.weekStartDate);
        diffDays = Math.floor((new Date() - start) / (1000 * 60 * 60 * 24));
    }

    const weekElapsed = diffDays >= 7;
    const allDaysCompleted = completedDays >= 7;

    return {
        diffDays,
        completedDays,
        missedDays,
        missedDayIndices,
        day7Completed,
        weekElapsed,
        allDaysCompleted,
        canAdvance: day7Completed || weekElapsed
    };
}

function advancePlayerWeek(player) {
    // prevWeekMissed 저장
    const advStatus = getWeekAdvanceStatus(player);
    player.prevWeekMissed = {
        missedDays: advStatus.missedDays,
        missedDayIndices: advStatus.missedDayIndices
    };

    // 보조 아카이브: dailyCompletion에서 완료된 항목 중 completionHistory에 없는 날짜를 보존
    if (player.weekStartDate && player.dailyCompletion) {
        const weekStart = parseLocalDate(player.weekStartDate);
        if (!player.completionHistory) player.completionHistory = {};
        for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
            const entry = player.dailyCompletion[dayIdx];
            if (entry && entry.completed) {
                const dayDate = new Date(weekStart);
                dayDate.setDate(weekStart.getDate() + dayIdx);
                const dateStr = getLocalDateStr(dayDate);
                if (!player.completionHistory[dateStr]) {
                    player.completionHistory[dateStr] = {
                        dayIndex: dayIdx,
                        workload: entry.workload || 0,
                        rpe: entry.rpe || 0,
                        pitchCount: entry.pitchCount || 0,
                        exercises: entry.exercises || []
                    };
                }
            }
        }
    }

    player.week += 1;
    let nextStart;
    if (player.weekStartDate) {
        const weekStart = parseLocalDate(player.weekStartDate);
        const day7Date = new Date(weekStart);
        day7Date.setDate(weekStart.getDate() + 6);
        if (getLocalDateStr(day7Date) === getTodayStr()) {
            // 주차 완료 당일 전환 → 내일부터 Day 1 시작
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            nextStart = getLocalDateStr(tomorrow);
        } else {
            // 완료 다음날 이후 전환 → 오늘부터 Day 1 시작
            nextStart = getTodayStr();
        }
    } else {
        nextStart = getTodayStr();
    }
    player.weekStartDate = nextStart;
    player.dailyCompletion = {};
}

function levelUp(id) {
    const p = players.find(p => String(p.id) === String(id));
    if (!p) return;

    if (!p.weekStartDate) {
        const prevPlayerSnapshot = typeof structuredClone === 'function'
            ? structuredClone(p)
            : JSON.parse(JSON.stringify(p));
        p.weekStartDate = getTodayStr();
        p.dailyCompletion = {};
        if (!saveDB()) {
            Object.keys(p).forEach(key => delete p[key]);
            Object.assign(p, prevPlayerSnapshot);
            renderBackupStorageStatus();
            return;
        }
    }

    const progress = getWeekAdvanceStatus(p);
    if (!progress.canAdvance) {
        return customAlert(`아직 ${p.week}주차를 마칠 수 없습니다. 7일이 지나거나 Day 7 훈련을 완료한 뒤 다음 주차로 넘어갈 수 있습니다. (현재 완료 ${progress.completedDays}/7일)`);
    }

    const prevPlayerSnapshot = typeof structuredClone === 'function'
        ? structuredClone(p)
        : JSON.parse(JSON.stringify(p));
    advancePlayerWeek(p);
    if (!saveDB()) {
        Object.keys(p).forEach(key => delete p[key]);
        Object.assign(p, prevPlayerSnapshot);
        renderBackupStorageStatus();
        return;
    }
    renderPlayerList();
    customAlert(`${escapeHTML(p.name)} 선수가 ${p.week}주차로 레벨업 되었습니다!`);
}

function reAssessPlayer(id) {
    customConfirm('4주차 정밀 재평가를 진행하시겠습니까? 새로운 스케줄이 생성됩니다.', () => {
        currentId = id;
        const p = players.find(p => String(p.id) === String(id));
        renderAssessmentForm(p);
        showScreen('s2');
    });
}

function _handlePlayerListClick(e) {
    const actionEl = e.target.closest('[data-player-action]');
    if (!actionEl || !e.currentTarget.contains(actionEl)) return;

    e.preventDefault();
    e.stopPropagation();

    const action = actionEl.dataset.playerAction;
    const playerId = actionEl.dataset.playerId || '';
    if (!playerId) return;

    if (action === 'toggle-detail') {
        togglePlayerDetail(playerId);
        return;
    }

    if (action === 'assess-or-result') {
        goAssessOrResult(playerId);
        return;
    }

    if (action === 'edit-player') {
        editPlayer(playerId);
        return;
    }

    if (action === 'wellness') {
        openWellness(playerId);
        return;
    }

    if (action === 'level-up') {
        levelUp(playerId);
        return;
    }

    if (action === 'performance') {
        openPerformance(playerId);
        return;
    }

    if (action === 'reassess') {
        reAssessPlayer(playerId);
        return;
    }

    if (action === 'delete-player') {
        deletePlayer(playerId);
        return;
    }
}

function _bindPlayerListClickHandler(list) {
    if (!list) return;
    if (_playerListClickHandler) {
        list.removeEventListener('click', _playerListClickHandler);
    }
    _playerListClickHandler = _handlePlayerListClick;
    list.addEventListener('click', _playerListClickHandler);
}

function renderPlayerList() {
    const list = document.getElementById('playerList');
    _bindPlayerListClickHandler(list);
    if (players.length === 0) {
        list.innerHTML = `<div class="empty-state">
            <div class="empty-state-icon"><i data-lucide="user-plus" class="ui-icon-20"></i></div>
            <div class="empty-state-title">등록된 선수가 없습니다</div>
            <div class="empty-state-desc">위 폼에서 선수 정보를 입력한 뒤<br>"선수 등록 및 정밀 평가 시작" 버튼을 눌러 시작하세요.</div>
        </div>`;
        lucide.createIcons();
        return;
    }

    list.innerHTML = players.map(p => {
        const isEvenWeek = p.week % 2 === 0;
        const is4thWeek = p.week > 0 && p.week % 4 === 0;
        const pType = p.type || '투수';
        const typeBadge = pType === '타자'
            ? '<span class="player-type-badge batter">타자</span>'
            : '<span class="player-type-badge pitcher">투수</span>';

        const safePlayerIdAttr = escapeHTML(p.id);
        const safePlayerName = escapeHTML(p.name);
        const streak = getRecordStreak(p);
        const streakBadgeHtml = streak >= 2 ? `<span class="player-streak-badge"><i data-lucide="flame"></i>${streak}일</span>` : '';
        const safeHeightText = escapeHTML(p.height ? String(p.height) + 'cm' : '-');
        const safeWeightText = escapeHTML(p.weight ? String(p.weight) + 'kg' : '-');
        const safeExpText = escapeHTML(String(p.exp || 0));
        const exitVeloDisplay = _normalizeOptionalNumberValue(p.exitVelo);
        const batSpeedDisplay = _normalizeOptionalNumberValue(p.batSpeed);
        const maxVeloDisplay = _normalizeOptionalNumberValue(p.maxVelo);
        const avgVeloDisplay = _normalizeOptionalNumberValue(p.avgVelo);
        const rpmDisplay = _normalizeOptionalNumberValue(p.rpm);
        const safeExitVeloText = exitVeloDisplay === '' ? '-' : escapeHTML(String(exitVeloDisplay));
        const safeBatSpeedText = batSpeedDisplay === '' ? '-' : escapeHTML(String(batSpeedDisplay));
        const safeMaxVeloText = maxVeloDisplay === '' ? '-' : escapeHTML(String(maxVeloDisplay));
        const safeAvgVeloText = avgVeloDisplay === '' ? '-' : escapeHTML(String(avgVeloDisplay));
        const safeRpmText = rpmDisplay === '' ? '-' : escapeHTML(String(rpmDisplay));

        // 압축 행용: 오늘 컨디션 상태 및 위험 배지
        const isRowToday = p.wellness && p.wellness.date === getTodayStr();
        const rowPainAreas = p.wellness ? (Array.isArray(p.wellness.pain) ? p.wellness.pain : [p.wellness.pain]) : ['없음'];
        const rowHasPain = !rowPainAreas.includes('없음');
        const rowAcwr = p.scores ? calculateACWRMetrics(p).ratio : 0;
        const rowHasFatigue = isRowToday && p.wellness && (p.wellness.fatigue >= 4 || p.wellness.soreness >= 4);
        const rowStatusIcon = !isRowToday
            ? '<span class="status-dot dot-neutral"></span>'
            : rowHasPain
            ? '<span class="status-dot dot-danger"></span>'
            : rowHasFatigue
            ? '<span class="status-dot dot-warning"></span>'
            : '<span class="status-dot dot-success"></span>';
        let rowRiskHtml = '';
        if (!isRowToday && p.scores) rowRiskHtml += '<span class="player-risk-badge info">컨디션 미입력</span>';
        if (rowHasPain) rowRiskHtml += '<span class="player-risk-badge danger">통증</span>';
        if (rowAcwr > 1.5) rowRiskHtml += '<span class="player-risk-badge danger">ACWR위험</span>';
        else if (rowAcwr > 1.3) rowRiskHtml += '<span class="player-risk-badge warning">ACWR주의</span>';

        let veloBoxHtml = '';
        let statsGridHtml = '';
        let infoRowHtml = '';

        const trainingFocusLabel = _getTrainingFocusLabel(p.trainingFocus);
        const trainingFocusTagHtml = trainingFocusLabel
            ? `<span class="player-training-focus-tag">${escapeHTML(trainingFocusLabel)}</span>`
            : '';

        const userTypeLabel = _getUserTypeLabel(p.userType);
        const userTypeTagHtml = userTypeLabel
            ? `<span class="player-user-type-tag">${escapeHTML(userTypeLabel)}</span>`
            : '';

        const usagePerspectiveLabel = _getUsagePerspectiveLabel(p.usagePerspective);
        const usagePerspectiveTagHtml = usagePerspectiveLabel
            ? `<span class="player-usage-perspective-tag">${escapeHTML(usagePerspectiveLabel)}</span>`
            : '';

        if (pType === '타자') {
            veloBoxHtml = `
            <div class="player-velo-box batter">
                <div class="player-velo-item">
                    <span class="player-velo-label">타구속도</span>
                    <span class="player-velo-value">${safeExitVeloText}<small>km/h</small></span>
                </div>
                <div class="player-velo-divider"></div>
                <div class="player-velo-item">
                    <span class="player-velo-label">배트스피드</span>
                    <span class="player-velo-value">${safeBatSpeedText}<small>km/h</small></span>
                </div>
            </div>`;
            statsGridHtml = `
            <div class="player-stats-grid">
                <div class="player-stat-item"><span class="player-stat-label">키</span><span class="player-stat-value">${safeHeightText}</span></div>
                <div class="player-stat-item"><span class="player-stat-label">체중</span><span class="player-stat-value">${safeWeightText}</span></div>
                <div class="player-stat-item"><span class="player-stat-label">구력</span><span class="player-stat-value">${safeExpText}년</span></div>
                <div class="player-stat-item"><span class="player-stat-label">포지션</span><span class="player-stat-value">${escapeHTML(p.batterPos || '내야수')}</span></div>
            </div>`;
            infoRowHtml = `
            <div class="player-info-row">
                <span class="player-goal-tag">${escapeHTML(_getGoalDisplayLabel(p.goal))}</span>
                ${userTypeTagHtml}
                ${usagePerspectiveTagHtml}
                ${trainingFocusTagHtml}
                <span class="player-season-tag">${p.season === '시즌중' ? '시즌중' : '비시즌'}</span>
            </div>`;
        } else {
            veloBoxHtml = `
            <div class="player-velo-box">
                <div class="player-velo-item">
                    <span class="player-velo-label">최고 구속</span>
                    <span class="player-velo-value">${safeMaxVeloText}<small>km/h</small></span>
                </div>
                <div class="player-velo-divider"></div>
                <div class="player-velo-item">
                    <span class="player-velo-label">평균 구속</span>
                    <span class="player-velo-value">${safeAvgVeloText}<small>km/h</small></span>
                </div>
                <div class="player-velo-divider"></div>
                <div class="player-velo-item">
                    <span class="player-velo-label">RPM</span>
                    <span class="player-velo-value">${safeRpmText}</span>
                </div>
            </div>`;
            statsGridHtml = `
            <div class="player-stats-grid">
                <div class="player-stat-item"><span class="player-stat-label">키</span><span class="player-stat-value">${safeHeightText}</span></div>
                <div class="player-stat-item"><span class="player-stat-label">체중</span><span class="player-stat-value">${safeWeightText}</span></div>
                <div class="player-stat-item"><span class="player-stat-label">구력</span><span class="player-stat-value">${safeExpText}년</span></div>
                <div class="player-stat-item"><span class="player-stat-label">보직</span><span class="player-stat-value">${escapeHTML(p.role || '선발')}</span></div>
            </div>`;
            infoRowHtml = `
            <div class="player-info-row">
                <span class="player-goal-tag">${escapeHTML(_getGoalDisplayLabel(p.goal))}</span>
                ${userTypeTagHtml}
                ${usagePerspectiveTagHtml}
                ${trainingFocusTagHtml}
                <span class="player-season-tag">${p.season === '시즌중' ? '시즌중' : '비시즌'}</span>
                <span class="player-pitch-date">등판: ${escapeHTML(p.pitchDate) || '미정'}</span>
            </div>`;
        }

        return `
        <div class="player-row" id="player-row-${safePlayerIdAttr}">
            <div class="player-row-header" data-player-action="toggle-detail" data-player-id="${safePlayerIdAttr}">
                <div class="player-row-info">
                    <span class="player-row-name">${safePlayerName}</span>
                    ${typeBadge}
                    <span class="player-season-tag">${p.season === '시즌중' ? '시즌중' : '비시즌'}</span>
                    ${streakBadgeHtml}
                </div>
                <div class="player-row-status">
                    ${rowStatusIcon}
                    ${rowRiskHtml}
                    <span class="player-row-chevron" id="chevron-${safePlayerIdAttr}">▼</span>
                </div>
            </div>
            <div class="player-row-detail" id="detail-${safePlayerIdAttr}">
                ${veloBoxHtml}
                ${statsGridHtml}
                ${infoRowHtml}
                <div class="player-actions">
                    <button class="btn btn-primary btn-sm ${!p.scores ? 'btn-block' : ''}" data-player-action="assess-or-result" data-player-id="${safePlayerIdAttr}"><i data-lucide="${p.scores ? 'bar-chart-2' : 'clipboard-edit'}"></i> ${p.scores ? '결과/스케줄' : '초기 평가하기'}</button>
                    <button class="btn btn-sm btn-tone-neutral" data-player-action="edit-player" data-player-id="${safePlayerIdAttr}"><i data-lucide="edit"></i> 정보 수정</button>
                    ${p.scores ? `<button class="btn btn-sm btn-tone-success" data-player-action="wellness" data-player-id="${safePlayerIdAttr}"><i data-lucide="heart-pulse"></i> 컨디션</button>
                    <button class="btn btn-sm btn-tone-warning" data-player-action="level-up" data-player-id="${safePlayerIdAttr}"><i data-lucide="arrow-up-circle"></i> +1주</button>` : ''}
                    ${isEvenWeek && p.scores ? `<button class="btn btn-sm btn-block btn-tone-success btn-tone-strong" data-player-action="performance" data-player-id="${safePlayerIdAttr}"><i data-lucide="trending-up"></i> 퍼포먼스 재측정</button>` : ''}
                    ${is4thWeek && p.scores ? `<button class="btn btn-sm btn-block btn-tone-warning btn-tone-strong" data-player-action="reassess" data-player-id="${safePlayerIdAttr}"><i data-lucide="clipboard-list"></i> 정밀 재평가</button>` : ''}
                    <button class="btn btn-danger btn-sm ${!p.scores ? 'btn-block' : ''}" data-player-action="delete-player" data-player-id="${safePlayerIdAttr}"><i data-lucide="trash-2"></i> 삭제</button>
                </div>
            </div>
        </div>
    `}).join('');
    lucide.createIcons();
}

function togglePlayerDetail(id) {
    const detail = document.getElementById('detail-' + id);
    const chevron = document.getElementById('chevron-' + id);
    if (!detail) return;
    const isOpen = detail.classList.toggle('open');
    if (chevron) chevron.textContent = isOpen ? '▲' : '▼';
}

function switchDayTab(_playerId, dayIndex) {
    // 모든 탭 비활성화, 모든 day 패널 숨기기
    for (let i = 0; i < 7; i++) {
        const tabBtn = document.getElementById('dayTab_' + i);
        const dayPanel = document.getElementById('scheduleDay_' + i);
        if (tabBtn) tabBtn.classList.remove('active');
        if (dayPanel) dayPanel.style.display = 'none';
    }
    // 선택 탭 활성화, 해당 day 패널 표시
    const activeBtn = document.getElementById('dayTab_' + dayIndex);
    const activePanel = document.getElementById('scheduleDay_' + dayIndex);
    if (activeBtn) activeBtn.classList.add('active');
    if (activePanel) activePanel.style.display = 'block';
}

function goAssessOrResult(id) {
    currentId = id;
    const p = players.find(p => String(p.id) === String(id));
    if (p.scores) {
        if (checkWeekProgression(p) === false) return;
        currentViewMode = 'card';
        showScreen('s3');
        const cardBtn = document.getElementById('viewCardBtn');
        const calBtn = document.getElementById('viewCalendarBtn');
        const monthlyBtn = document.getElementById('viewMonthlyBtn');
        if (cardBtn) cardBtn.classList.add('active');
        if (calBtn) calBtn.classList.remove('active');
        if (monthlyBtn) monthlyBtn.classList.remove('active');
        renderResult();
    }
    else { renderAssessmentForm(p); showScreen('s2'); }
}

function checkWeekProgression(p) {
    if (!p.weekStartDate) {
        const prevPlayerSnapshot = typeof structuredClone === 'function'
            ? structuredClone(p)
            : JSON.parse(JSON.stringify(p));
        p.weekStartDate = getTodayStr();
        p.dailyCompletion = {};
        if (!saveDB()) {
            Object.keys(p).forEach(key => delete p[key]);
            Object.assign(p, prevPlayerSnapshot);
            renderBackupStorageStatus();
            return false;
        }
        return true;
    }

    const progress = getWeekAdvanceStatus(p);
    if (progress.canAdvance) {
        if (p.lastPromptDate !== getTodayStr()) {
            const prevPlayerSnapshot = typeof structuredClone === 'function'
                ? structuredClone(p)
                : JSON.parse(JSON.stringify(p));
            p.lastPromptDate = getTodayStr();
            if (!saveDB()) {
                Object.keys(p).forEach(key => delete p[key]);
                Object.assign(p, prevPlayerSnapshot);
                renderBackupStorageStatus();
                return false;
            }
            setTimeout(() => {
                let promptReason;
                if (progress.weekElapsed) {
                    promptReason = `${p.week}주차 훈련 기간(7일)이 지났습니다.`;
                } else if (progress.day7Completed && progress.missedDays === 0) {
                    promptReason = `${p.week}주차 Day 1~7 훈련을 모두 완료했습니다.`;
                } else {
                    promptReason = `${p.week}주차 Day 7 훈련을 완료했습니다. 미완료 Day는 다음 주차 조정에 반영됩니다.`;
                }
                customConfirm(`${p.name} 선수님, ${promptReason}\n다음 주차(${p.week + 1}주차) 훈련 프로그램으로 넘어가시겠습니까?`, () => {
                    const prevPlayerSnapshot = typeof structuredClone === 'function'
                        ? structuredClone(p)
                        : JSON.parse(JSON.stringify(p));
                    advancePlayerWeek(p);
                    if (!saveDB()) {
                        Object.keys(p).forEach(key => delete p[key]);
                        Object.assign(p, prevPlayerSnapshot);
                        renderBackupStorageStatus();
                        return;
                    }
                    renderResult();
                });
            }, 500);
        }
    }
    return true;
}

function editPlayer(id) {
    currentId = id;
    const p = players.find(p => String(p.id) === String(id));
    if (!p) return;

    const pType = p.type || '투수';
    selectPlayerType(pType, 'edit');

    const editExpValue = p.exp === 0 ? 0 : (p.exp || '');
    const editExitVelo = _normalizeOptionalNumberValue(p.exitVelo);
    const editBatSpeed = _normalizeOptionalNumberValue(p.batSpeed);
    const editMaxVelo = _normalizeOptionalNumberValue(p.maxVelo);
    const editAvgVelo = _normalizeOptionalNumberValue(p.avgVelo);
    const editRPM = _normalizeOptionalNumberValue(p.rpm);

    document.getElementById('eName').value = p.name || '';
    document.getElementById('eUserType').value = _normalizeUserType(p.userType);
    document.getElementById('eUsagePerspective').value = _normalizeUsagePerspective(p.usagePerspective);
    document.getElementById('eTrainingFocus').value = _normalizeTrainingFocus(p.trainingFocus);
    document.getElementById('eAge').value = p.realAge || '';
    document.getElementById('eExp').value = editExpValue;
    document.getElementById('eHeight').value = p.height || '';
    document.getElementById('eWeight').value = p.weight || '';

    if (pType === '타자') {
        document.getElementById('eBatterPos').value = p.batterPos || '내야수';
        document.getElementById('eBatterSeason').value = p.season || '비시즌';
        document.getElementById('eBatterGoal').value = p.goal || '타구속도 향상';
        document.getElementById('eBatterTime').value = p.trainingTime || '60';
        document.getElementById('eExitVelo').value = editExitVelo;
        document.getElementById('eBatSpeed').value = editBatSpeed;
    } else {
        document.getElementById('eRole').value = p.role || '선발';
        document.getElementById('eSeason').value = p.season || '비시즌';
        document.getElementById('eGoal').value = p.goal || '구속 향상';
        document.getElementById('eTime').value = p.trainingTime || '60';
        document.getElementById('eMaxVelo').value = editMaxVelo;
        document.getElementById('eAvgVelo').value = editAvgVelo;
        document.getElementById('eRPM').value = editRPM;
        document.getElementById('ePitchDate').value = p.pitchDate || '';
    }

    openModal('editPlayerModal');
}

function savePlayerEdit() {
    const p = players.find(p => String(p.id) === String(currentId));
    if (!p) return;

    const name = document.getElementById('eName').value.trim();
    const playerType = document.getElementById('eType').value;
    const userType = _normalizeUserType(document.getElementById('eUserType').value);
    const usagePerspective = _normalizeUsagePerspective(document.getElementById('eUsagePerspective').value);
    const trainingFocus = _normalizeTrainingFocus(document.getElementById('eTrainingFocus').value);

    if (!name) return customAlert('선수 이름을 입력하세요.');

    const _eAgeRaw = String(document.getElementById('eAge').value).trim();
    const _eExpRaw = String(document.getElementById('eExp').value).trim();
    const _eHeightRaw = String(document.getElementById('eHeight').value).trim();
    const _eWeightRaw = String(document.getElementById('eWeight').value).trim();

    if (_eAgeRaw === '') return customAlert('올바른 나이를 입력하세요.');
    const ageInput = Number(_eAgeRaw);
    if (!Number.isFinite(ageInput) || !Number.isInteger(ageInput) || ageInput <= 0) return customAlert('올바른 나이를 입력하세요.');
    if (ageInput < 5 || ageInput > 80) return customAlert('나이는 5~80 범위만 허용됩니다.');

    if (_eExpRaw === '') return customAlert('구력을 입력하세요. 야구 경력이 없으면 0을 입력하세요.');
    let expInput = 0;
    if (_eExpRaw !== '') {
        const expNum = Number(_eExpRaw);
        if (!Number.isFinite(expNum) || !Number.isInteger(expNum)) return customAlert('구력은 0 이상의 정수만 입력 가능합니다.');
        if (expNum < 0) return customAlert('구력은 0 이상이어야 합니다.');
        expInput = expNum;
    }
    if (expInput > ageInput) return customAlert('구력이 나이보다 높을 수 없습니다.');

    if (_eHeightRaw === '') return customAlert('키를 입력하세요.');
    let eHeightInput = 0;
    if (_eHeightRaw !== '') {
        const heightNum = Number(_eHeightRaw);
        if (!Number.isFinite(heightNum) || !Number.isInteger(heightNum)) return customAlert('키는 정수만 입력 가능합니다.');
        eHeightInput = heightNum;
    }
    if (eHeightInput < 100 || eHeightInput > 230) return customAlert('키는 100~230cm 범위만 허용됩니다.');

    if (_eWeightRaw === '') return customAlert('체중을 입력하세요.');
    let eWeightInput = 0;
    if (_eWeightRaw !== '') {
        const weightNum = Number(_eWeightRaw);
        if (!Number.isFinite(weightNum) || !Number.isInteger(weightNum)) return customAlert('몸무게는 정수만 입력 가능합니다.');
        eWeightInput = weightNum;
    }
    if (eWeightInput < 20 || eWeightInput > 200) return customAlert('몸무게는 20~200kg 범위만 허용됩니다.');

    let ageGroup = '성인';
    if (ageInput <= 12) ageGroup = 'U-12';
    else if (ageInput <= 15) ageGroup = 'U-15';
    else if (ageInput <= 18) ageGroup = 'U-18';

    let editData;
    let performanceChanged = false;
    let initialPerformanceEntry = null;
    let nextPerformanceEntry = null;

    // 모든 입력 검증이 끝난 뒤에만 p 객체를 수정한다.
    if (playerType === '타자') {
        const newExitVeloRaw = document.getElementById('eExitVelo').value;
        const newBatSpeedRaw = document.getElementById('eBatSpeed').value;
        const trainingTimeRaw = document.getElementById('eBatterTime').value;
        if (!_optNumInRange(newExitVeloRaw, 30, 200)) return customAlert('타구속도는 30~200km/h 범위만 허용됩니다.');
        if (!_optNumInRange(newBatSpeedRaw, 20, 130)) return customAlert('배트스피드는 20~130km/h 범위만 허용됩니다.');

        const newExitVelo = _normalizeOptionalNumberValue(newExitVeloRaw);
        const newBatSpeed = _normalizeOptionalNumberValue(newBatSpeedRaw);
        const trainingTime = _normalizeTrainingTimeValue(trainingTimeRaw);
        const prevExitVelo = _normalizeOptionalNumberValue(p.exitVelo);
        const prevBatSpeed = _normalizeOptionalNumberValue(p.batSpeed);

        performanceChanged = (prevExitVelo !== newExitVelo || prevBatSpeed !== newBatSpeed);
        initialPerformanceEntry = { date: new Date().toISOString().split('T')[0], exitVelo: prevExitVelo, batSpeed: prevBatSpeed };
        nextPerformanceEntry = { date: new Date().toISOString().split('T')[0], exitVelo: newExitVelo, batSpeed: newBatSpeed };
        editData = {
            batterPos: document.getElementById('eBatterPos').value,
            season: document.getElementById('eBatterSeason').value,
            goal: document.getElementById('eBatterGoal').value,
            trainingTime,
            exitVelo: newExitVelo,
            batSpeed: newBatSpeed
        };
    } else {
        const newMaxRaw = document.getElementById('eMaxVelo').value;
        const newAvgRaw = document.getElementById('eAvgVelo').value;
        const newRPMRaw = document.getElementById('eRPM').value;
        const trainingTimeRaw = document.getElementById('eTime').value;

        if (!_optNumInRange(newMaxRaw, 30, 180)) return customAlert('최고구속은 30~180km/h 범위만 허용됩니다.');
        if (!_optNumInRange(newAvgRaw, 30, 180)) return customAlert('평균구속은 30~180km/h 범위만 허용됩니다.');
        if (!_optNumInRange(newRPMRaw, 0, 4000)) return customAlert('RPM은 0~4000 범위만 허용됩니다.');

        const newMax = _normalizeOptionalNumberValue(newMaxRaw);
        const newAvg = _normalizeOptionalNumberValue(newAvgRaw);
        const newRPM = _normalizeOptionalNumberValue(newRPMRaw);
        const trainingTime = _normalizeTrainingTimeValue(trainingTimeRaw);
        const prevMax = _normalizeOptionalNumberValue(p.maxVelo);
        const prevAvg = _normalizeOptionalNumberValue(p.avgVelo);
        const prevRPM = _normalizeOptionalNumberValue(p.rpm);

        if (newMax !== '' && newAvg !== '' && newAvg > newMax) {
            return customAlert('평균구속이 최고구속보다 높을 수 없습니다.');
        }

        performanceChanged = (prevMax !== newMax || prevAvg !== newAvg || prevRPM !== newRPM);
        initialPerformanceEntry = { date: new Date().toISOString().split('T')[0], maxVelo: prevMax, avgVelo: prevAvg, rpm: prevRPM };
        nextPerformanceEntry = { date: new Date().toISOString().split('T')[0], maxVelo: newMax, avgVelo: newAvg, rpm: newRPM };
        editData = {
            role: document.getElementById('eRole').value,
            season: document.getElementById('eSeason').value,
            goal: document.getElementById('eGoal').value,
            trainingTime,
            maxVelo: newMax,
            avgVelo: newAvg,
            rpm: newRPM,
            pitchDate: document.getElementById('ePitchDate').value
        };
    }

    const prevPlayerSnapshot = typeof structuredClone === 'function'
        ? structuredClone(p)
        : JSON.parse(JSON.stringify(p));

    p.name = name;
    p.realAge = ageInput;
    p.age = ageGroup;
    p.exp = expInput;
    p.height = eHeightInput;
    p.weight = eWeightInput;
    p.type = playerType;
    p.userType = userType;
    p.usagePerspective = usagePerspective;
    p.trainingFocus = trainingFocus;

    if (playerType === '타자') {
        p.batterPos = editData.batterPos;
        p.season = editData.season;
        p.goal = editData.goal;
        p.trainingTime = editData.trainingTime;
        if (performanceChanged) {
            if (!p.performanceHistory) p.performanceHistory = [initialPerformanceEntry];
            p.performanceHistory.push(nextPerformanceEntry);
        }
        p.exitVelo = editData.exitVelo;
        p.batSpeed = editData.batSpeed;
    } else {
        p.role = editData.role;
        p.season = editData.season;
        p.goal = editData.goal;
        p.trainingTime = editData.trainingTime;
        if (performanceChanged) {
            if (!p.performanceHistory) p.performanceHistory = [initialPerformanceEntry];
            p.performanceHistory.push(nextPerformanceEntry);
        }
        p.maxVelo = editData.maxVelo;
        p.avgVelo = editData.avgVelo;
        p.rpm = editData.rpm;
        p.pitchDate = editData.pitchDate;
    }

    if (!saveDB()) {
        Object.keys(p).forEach(key => delete p[key]);
        Object.assign(p, prevPlayerSnapshot);
        renderBackupStorageStatus();
        return;
    }
    closeModal('editPlayerModal');
    renderPlayerList();
    customAlert('선수 정보가 수정되었습니다.');
}

const assessmentGuideMap = {
    sprint: 'sprint',
    squat: '스쿼트',
    deadlift: 'deadlift',
    pullup: 'pullup',
    lateralBound: 'lateralBound',
    broadJump: '제자리 멀리뛰기',
    thoracic: 'Lying T-Spine Rotation',
    hip: '90/90 자세',
    core: '플랭크'
};

function getAssessmentGuideConfig(key) {
    const lookupKey = assessmentGuideMap[key];
    if (!lookupKey || !exerciseDB[lookupKey]) return null;
    return {
        lookupKey,
        displayTitle: criteriaDB[key] && criteriaDB[key].name ? criteriaDB[key].name : lookupKey,
        data: exerciseDB[lookupKey]
    };
}

function hasAssessmentGuide(key) {
    const config = getAssessmentGuideConfig(key);
    return !!(config && config.data && _isSafeYoutubeWatchUrl(config.data.guideYoutubeUrl));
}

function _handleAssessmentGuideClick(e) {
    const guideBtn = e.target.closest('[data-assessment-guide-action="open"]');
    if (!guideBtn || !e.currentTarget.contains(guideBtn)) return;

    e.preventDefault();
    e.stopPropagation();

    const key = guideBtn.dataset.assessmentKey || '';
    if (!key) return;

    openAssessmentGuide(key);
}

function _bindAssessmentGuideClickHandler(form) {
    if (!form) return;
    if (_assessmentGuideClickHandler) {
        form.removeEventListener('click', _assessmentGuideClickHandler);
    }
    _assessmentGuideClickHandler = _handleAssessmentGuideClick;
    form.addEventListener('click', _assessmentGuideClickHandler);
}

function openAssessmentGuide(key) {
    const config = getAssessmentGuideConfig(key);
    if (!config || !config.data || !_isSafeYoutubeWatchUrl(config.data.guideYoutubeUrl)) {
        customAlert('가이드가 아직 준비되지 않았습니다.');
        return;
    }
    openGuide(config.lookupKey, config.displayTitle);
}

function getAssessmentKeysByType(type) {
    return type === '타자'
        ? ['sprint', 'squat', 'deadlift', 'lateralBound', 'broadJump', 'thoracic', 'hip', 'core']
        : ['sprint', 'squat', 'deadlift', 'pullup', 'broadJump', 'thoracic', 'hip', 'core'];
}

function renderAssessmentForm(p) {
    document.getElementById('assessPlayerName').innerText = `${escapeHTML(p.name)} (${escapeHTML(p.age)})`;
    const form = document.getElementById('assessmentForm');
    const pType = p.type || '투수';

    const keys = getAssessmentKeysByType(pType);

    form.innerHTML = keys.map(key => {
        const c = criteriaDB[key];
        const options = c[p.age].map((opt, i) => `<option value="${i + 1}">${escapeHTML(opt)}</option>`).join('');
        const safeAssessmentKeyAttr = escapeHTML(key);
        const guideButton = hasAssessmentGuide(key)
            ? `<div class="assessment-guide-action-wrap"><button type="button" class="btn btn-outline btn-sm" data-assessment-guide-action="open" data-assessment-key="${safeAssessmentKeyAttr}">가이드 보기</button></div>`
            : '';
        return `
            <div class="assess-item cl-assess-card">
                <div class="assess-title">${escapeHTML(c.name)}</div>
                <div class="assess-desc">${escapeHTML(c.desc)}</div>
                ${guideButton}
                <select id="score_${key}" class="form-control cl-assess-input">
                    ${options}
                </select>
            </div>
        `;
    }).join('');
    _bindAssessmentGuideClickHandler(form);
}

function saveAssessment() {
    const p = players.find(p => String(p.id) === String(currentId));
    if (!p) return;
    const pType = p.type || '투수';

    const keys = getAssessmentKeysByType(pType);

    for (const key of keys) {
        const val = parseInt(document.getElementById(`score_${key}`).value);
        if (isNaN(val) || val < 1 || val > 5) {
            return customAlert('평가 항목을 모두 올바르게 선택해주세요. (각 항목: 1~5점)');
        }
    }

    const prevPlayerSnapshot = typeof structuredClone === 'function'
        ? structuredClone(p)
        : JSON.parse(JSON.stringify(p));

    p.scores = {};
    keys.forEach(key => {
        p.scores[key] = parseInt(document.getElementById(`score_${key}`).value);
    });

    if (pType === '타자') {
        p.lateralBoundCleanupVersion = 1;
    }

    p.week = 1;
    p.weekStartDate = getTodayStr();
    p.dailyCompletion = {};

    if (!saveDB()) {
        Object.keys(p).forEach(key => delete p[key]);
        Object.assign(p, prevPlayerSnapshot);
        renderBackupStorageStatus();
        return;
    }
    showScreen('s3');
    renderResult();
}

function getWorkloadThreshold(ageGroup, playerType) {
    let base;
    switch (ageGroup) {
        case 'U-12': base = 150; break;
        case 'U-15': base = 250; break;
        case 'U-18': base = 350; break;
        default: base = 400;
    }
    return (playerType === '타자') ? base * 2 : base;
}

function calculateLiveWorkload() {
    const rpeInput = document.getElementById('wlRPE').value;
    const pitchCountInput = document.getElementById('wlPitchCount').value;
    const displayEl = document.getElementById('liveWorkloadDisplay');

    const rpe = parseInt(rpeInput) || 0;
    const pitchCount = parseInt(pitchCountInput) || 0;
    const workload = rpe * pitchCount;

    const p = players.find(p => String(p.id) === String(currentId));
    const threshold = p ? getWorkloadThreshold(p.age, p.type) : 300;
    const ageLabel = p ? p.age : '성인';

    // 누적 상태 class 방지 — 매 호출 시작에서 3종 모두 제거 후 분기 1개만 add
    displayEl.classList.remove(
        'live-workload-display--idle',
        'live-workload-display--danger',
        'live-workload-display--safe'
    );

    if (rpeInput !== '' && pitchCountInput !== '') {
        displayEl.style.display = 'block';
        if (workload === 0) {
            displayEl.classList.add('live-workload-display--idle');
            const noActionLabel = (p && p.type === '타자') ? '타격' : '투구';
            displayEl.innerHTML = `오늘 ${escapeHTML(String(noActionLabel))}하지 않음 (워크로드: 0)`;
        } else if (workload > threshold) {
            displayEl.classList.add('live-workload-display--danger');
            displayEl.innerHTML = `주의: ${escapeHTML(String(ageLabel))} 권장 워크로드(${escapeHTML(String(threshold))}) 초과! (${escapeHTML(String(workload))})`;
        } else {
            displayEl.classList.add('live-workload-display--safe');
            displayEl.innerHTML = `실시간 예상 워크로드: ${escapeHTML(String(workload))} (안전 범위: ~${escapeHTML(String(threshold))})`;
        }
    } else {
        displayEl.style.display = 'none';
        displayEl.replaceChildren();
    }
}

function setNoWorkloadToday() {
    document.getElementById('wlRPE').value = 0;
    document.getElementById('wlPitchCount').value = 0;
    _syncRpeBarSelection(0);
    calculateLiveWorkload();
}

function openWellness(id) {
    currentId = id;
    const p = players.find(p => String(p.id) === String(id));
    if (!p) return;
    const prevPlayerSnapshot = typeof structuredClone === 'function'
        ? structuredClone(p)
        : JSON.parse(JSON.stringify(p));
    let wellnessAutoRepairNeeded = false;
    // 구버전/손상 데이터 방어: wellness 기본 구조 보장
    if (!p.wellness || typeof p.wellness !== 'object') {
        p.wellness = { sleep: 7, fatigue: 3, soreness: 2, pain: ['없음'], recovery: { '없음': 10 }, date: '' };
        wellnessAutoRepairNeeded = true;
    }
    if (p.wellness.sleep === undefined) {
        p.wellness.sleep = 7;
        wellnessAutoRepairNeeded = true;
    }
    if (p.wellness.fatigue === undefined) {
        p.wellness.fatigue = 3;
        wellnessAutoRepairNeeded = true;
    }
    if (p.wellness.soreness === undefined) {
        p.wellness.soreness = 2;
        wellnessAutoRepairNeeded = true;
    }
    if (!p.wellness.pain) {
        p.wellness.pain = ['없음'];
        wellnessAutoRepairNeeded = true;
    }
    if (!p.wellness.recovery || typeof p.wellness.recovery !== 'object') {
        p.wellness.recovery = { '없음': 10 };
        wellnessAutoRepairNeeded = true;
    }
    if (!p.wellness.date) p.wellness.date = '';
    if (p.wellness.date !== getTodayStr()) {
        // 날짜가 바뀌면 sleep/fatigue/soreness만 기본값으로 초기화
        // pain과 recovery는 마지막 저장 상태를 유지(carry-over)
        const prevPain = Array.isArray(p.wellness.pain) ? p.wellness.pain : [p.wellness.pain || '없음'];
        const prevRecovery = (p.wellness.recovery && typeof p.wellness.recovery === 'object') ? p.wellness.recovery : { '없음': 10 };
        p.wellness = { sleep: 7, fatigue: 3, soreness: 2, pain: prevPain, recovery: prevRecovery, date: getTodayStr() };
        wellnessAutoRepairNeeded = true;
    }

    // 통증 부위 whitelist 정규화 — 손상 데이터 보정 후 변경된 경우 저장
    const _painBefore = JSON.stringify(p.wellness.pain);
    const _recoveryBefore = JSON.stringify(p.wellness.recovery);
    p.wellness.pain = _normalizePainAreas(p.wellness.pain);
    if (p.wellness.pain.includes('없음')) {
        p.wellness.recovery = { '없음': 10 };
    } else {
        const _cleanedRecovery = {};
        p.wellness.pain.forEach(area => {
            const raw = p.wellness.recovery[area];
            _cleanedRecovery[area] = Math.round(_clampNumber(raw !== undefined ? raw : 5, 1, 10, 5));
        });
        p.wellness.recovery = _cleanedRecovery;
    }
    const painOrRecoveryChanged = JSON.stringify(p.wellness.pain) !== _painBefore ||
        JSON.stringify(p.wellness.recovery) !== _recoveryBefore;
    if (wellnessAutoRepairNeeded || painOrRecoveryChanged) {
        if (!saveDB()) {
            Object.keys(p).forEach(key => delete p[key]);
            Object.assign(p, prevPlayerSnapshot);
            renderBackupStorageStatus();
            closeModal('wellnessModal');
            return;
        }
    }

    document.getElementById('wSleep').value = p.wellness.sleep; document.getElementById('wSleepVal').innerText = p.wellness.sleep;
    document.getElementById('wFatigue').value = p.wellness.fatigue; document.getElementById('wFatigueVal').innerText = p.wellness.fatigue;
    document.getElementById('wSoreness').value = p.wellness.soreness; document.getElementById('wSorenessVal').innerText = p.wellness.soreness;

    const painAreas = p.wellness.pain;
    document.querySelectorAll('input[name="wPain"]').forEach(cb => {
        cb.checked = painAreas.includes(cb.value);
    });

    // 모달 열 때 통증 상태에 따라 회복 수준 바 표시 여부 업데이트
    const isNone = painAreas.includes('없음');
    const recoveryGroup = document.getElementById('wellnessRecoveryGroup');
    if (recoveryGroup) {
        if (isNone) {
            recoveryGroup.style.display = 'none';
            recoveryGroup.replaceChildren();
        } else {
            recoveryGroup.style.display = 'block';
            let html = `<div class="recovery-picker-label">통증 부위별 회복 상태 점수</div>`;
            html += `<div class="recovery-picker-help">1은 통증/불편감이 큰 상태, 10은 회복이 양호한 상태입니다.</div>`;

            painAreas.filter(a => a !== '없음').forEach(area => {
                let currentValue = 5;
                if (p.wellness.recovery && typeof p.wellness.recovery === 'object' && p.wellness.recovery[area] !== undefined) {
                    currentValue = p.wellness.recovery[area];
                }
                html += _renderRecoveryLevelPicker('wPain', area, currentValue);
            });
            recoveryGroup.innerHTML = html;
            _bindRecoveryScoreClickHandler(recoveryGroup);
        }
    }

    openModal('wellnessModal');
}

function saveWellness() {
    const p = players.find(p => String(p.id) === String(currentId));
    if (!p) return;

    const painCheckboxes = document.querySelectorAll('input[name="wPain"]:checked');
    let painAreas = Array.from(painCheckboxes).map(cb => cb.value);
    if (painAreas.length === 0 || painAreas.includes('없음')) painAreas = ['없음'];

    let recoveryData = {};
    if (!painAreas.includes('없음')) {
        painAreas.forEach(area => {
            const slider = document.getElementById(`rLv_wPain_${area}`);
            if (slider) {
                recoveryData[area] = Math.round(_clampNumber(slider.value, 1, 10, 5));
            } else {
                recoveryData[area] = 5; // default
            }
        });
    } else {
        recoveryData = { '없음': 10 };
    }

    const _wSleepRaw = String(document.getElementById('wSleep').value).trim();
    const _wFatigueRaw = String(document.getElementById('wFatigue').value).trim();
    const _wSorenessRaw = String(document.getElementById('wSoreness').value).trim();
    const wSleepVal = Number(_wSleepRaw);
    const wFatigueVal = Number(_wFatigueRaw);
    const wSorenessVal = Number(_wSorenessRaw);
    if (_wSleepRaw === '' || !Number.isFinite(wSleepVal) || wSleepVal < 4 || wSleepVal > 12) return customAlert('수면 시간은 4~12 범위만 허용됩니다.');
    if (_wFatigueRaw === '' || !Number.isFinite(wFatigueVal) || !Number.isInteger(wFatigueVal) || wFatigueVal < 1 || wFatigueVal > 5) return customAlert('피로도는 1~5 범위만 허용됩니다.');
    if (_wSorenessRaw === '' || !Number.isFinite(wSorenessVal) || !Number.isInteger(wSorenessVal) || wSorenessVal < 1 || wSorenessVal > 5) return customAlert('근육통은 1~5 범위만 허용됩니다.');

    const prevPlayerSnapshot = typeof structuredClone === 'function'
        ? structuredClone(p)
        : JSON.parse(JSON.stringify(p));

    p.wellness = {
        sleep: wSleepVal,
        fatigue: wFatigueVal,
        soreness: wSorenessVal,
        recovery: recoveryData,
        pain: painAreas,
        date: getTodayStr()
    };
    if (!saveDB()) {
        Object.keys(p).forEach(key => delete p[key]);
        Object.assign(p, prevPlayerSnapshot);
        renderBackupStorageStatus();
        return;
    }
    closeModal('wellnessModal');
    customAlert(`컨디션이 저장되었습니다. 스케줄에 실시간 반영됩니다.`);
    if (document.getElementById('s1').classList.contains('active')) renderPlayerList();
    if (document.getElementById('s3').classList.contains('active') && currentId) renderResult();
    if (document.getElementById('s4').classList.contains('active')) renderTeamDashboard();
}

function openPerformance(id) {
    currentId = id;
    const p = players.find(p => String(p.id) === String(id));
    const pType = p.type || '투수';
    const perfExitVelo = _normalizeOptionalNumberValue(p.exitVelo);
    const perfBatSpeed = _normalizeOptionalNumberValue(p.batSpeed);
    const perfMaxVelo = _normalizeOptionalNumberValue(p.maxVelo);
    const perfAvgVelo = _normalizeOptionalNumberValue(p.avgVelo);
    const perfRPM = _normalizeOptionalNumberValue(p.rpm);
    if (pType === '타자') {
        document.getElementById('perfPitcherFields').style.display = 'none';
        document.getElementById('perfBatterFields').style.display = 'block';
        document.getElementById('newExitVelo').value = perfExitVelo;
        document.getElementById('newBatSpeed').value = perfBatSpeed;
    } else {
        document.getElementById('perfPitcherFields').style.display = '';
        document.getElementById('perfBatterFields').style.display = 'none';
        document.getElementById('newMaxVelo').value = perfMaxVelo;
        document.getElementById('newAvgVelo').value = perfAvgVelo;
        document.getElementById('newRPM').value = perfRPM;
    }
    openModal('perfModal');
}

function savePerformance() {
    const p = players.find(p => String(p.id) === String(currentId));
    if (!p) return;
    const pType = p.type || '투수';
    let prevPlayerSnapshot = null;

    if (pType === '타자') {
        const _evRaw = String(document.getElementById('newExitVelo').value).trim();
        const _bsRaw = String(document.getElementById('newBatSpeed').value).trim();
        if (_evRaw === '' || _bsRaw === '') return customAlert('타구속도와 배트스피드를 모두 입력하세요.');
        const newExitVelo = Number(_evRaw);
        const newBatSpeed = Number(_bsRaw);
        if (!Number.isFinite(newExitVelo)) return customAlert('타구속도는 30~200km/h 범위만 허용됩니다.');
        if (!Number.isFinite(newBatSpeed)) return customAlert('배트스피드는 20~130km/h 범위만 허용됩니다.');
        if (newExitVelo < 30 || newExitVelo > 200) return customAlert('타구속도는 30~200km/h 범위만 허용됩니다.');
        if (newBatSpeed < 20 || newBatSpeed > 130) return customAlert('배트스피드는 20~130km/h 범위만 허용됩니다.');

        const oldExitVelo = _normalizeOptionalNumberValue(p.exitVelo);
        const oldBatSpeed = _normalizeOptionalNumberValue(p.batSpeed);

        prevPlayerSnapshot = typeof structuredClone === 'function'
            ? structuredClone(p)
            : JSON.parse(JSON.stringify(p));

        p.prevExitVelo = oldExitVelo;
        if (!p.performanceHistory) p.performanceHistory = [{ date: new Date().toISOString().split('T')[0], exitVelo: oldExitVelo, batSpeed: oldBatSpeed }];
        p.performanceHistory.push({ date: new Date().toISOString().split('T')[0], exitVelo: newExitVelo, batSpeed: newBatSpeed });
        p.exitVelo = newExitVelo;
        p.batSpeed = newBatSpeed;

        if (typeof oldExitVelo === 'number' && newExitVelo > oldExitVelo) {
            p.isUpgraded = true;
            p.upgradeMsg = `축하합니다! 기록 변화 확인 (타구속도: ${oldExitVelo} -> ${newExitVelo}km/h)`;
        } else {
            p.isUpgraded = false;
            p.upgradeMsg = `꾸준함이 정답입니다! 다음 측정까지 파이팅!`;
        }
    } else {
        const _maxRaw = String(document.getElementById('newMaxVelo').value).trim();
        const _avgRaw = String(document.getElementById('newAvgVelo').value).trim();
        const _rpmRaw = String(document.getElementById('newRPM').value).trim();
        if (_maxRaw === '' || _avgRaw === '' || _rpmRaw === '') return customAlert('최고구속, 평균구속, RPM을 모두 입력하세요.');
        const newMax = Number(_maxRaw);
        const newAvg = Number(_avgRaw);
        const newRPM = Number(_rpmRaw);
        if (!Number.isFinite(newMax) || newMax < 30 || newMax > 180) return customAlert('최고구속은 30~180km/h 범위만 허용됩니다.');
        if (!Number.isFinite(newAvg) || newAvg < 30 || newAvg > 180) return customAlert('평균구속은 30~180km/h 범위만 허용됩니다.');
        if (!Number.isFinite(newRPM) || newRPM < 0 || newRPM > 4000) return customAlert('RPM은 0~4000 범위만 허용됩니다.');
        if (newAvg > newMax) return customAlert('평균구속이 최고구속보다 높을 수 없습니다.');

        const oldMax = _normalizeOptionalNumberValue(p.maxVelo);
        const oldAvg = _normalizeOptionalNumberValue(p.avgVelo);
        const oldRPM = _normalizeOptionalNumberValue(p.rpm);

        prevPlayerSnapshot = typeof structuredClone === 'function'
            ? structuredClone(p)
            : JSON.parse(JSON.stringify(p));

        p.prevMaxVelo = oldMax;
        p.prevRPM = oldRPM;

        if (!p.performanceHistory) p.performanceHistory = [{ date: new Date().toISOString().split('T')[0], maxVelo: oldMax, avgVelo: oldAvg, rpm: oldRPM }];
        p.performanceHistory.push({ date: new Date().toISOString().split('T')[0], maxVelo: newMax, avgVelo: newAvg, rpm: newRPM });

        p.maxVelo = newMax;
        p.avgVelo = newAvg;
        p.rpm = newRPM;

        const maxImproved = typeof oldMax === 'number' && newMax > oldMax;
        const rpmImproved = typeof oldRPM === 'number' && newRPM > oldRPM;
        if (maxImproved || rpmImproved) {
            const improvedParts = [];
            if (maxImproved) improvedParts.push(`구속: ${oldMax} -> ${newMax}km/h`);
            if (rpmImproved) improvedParts.push(`RPM: ${oldRPM} -> ${newRPM}`);
            p.isUpgraded = true;
            p.upgradeMsg = `축하합니다! 기록 변화 확인 (${improvedParts.join(', ')})`;
        } else {
            p.isUpgraded = false;
            p.upgradeMsg = `꾸준함이 정답입니다! 다음 측정까지 파이팅!`;
        }
    }

    if (!saveDB()) {
        Object.keys(p).forEach(key => delete p[key]);
        Object.assign(p, prevPlayerSnapshot);
        renderBackupStorageStatus();
        return;
    }
    closeModal('perfModal');
    renderPlayerList();
    customAlert('퍼포먼스 재측정 결과가 저장되었습니다.');
}

function renderResult() {
    const p = players.find(p => String(p.id) === String(currentId));
    const _resStreak = getRecordStreak(p);
    const _resStreakBadge = _resStreak >= 2 ? `<span class="player-streak-badge"><i data-lucide="flame"></i>${_resStreak}일</span>` : '';
    document.getElementById('resName').innerHTML = `${escapeHTML(p.name)} 선수 리포트 ${_resStreakBadge}`;
    document.getElementById('resWeek').innerText = `${p.week}주차`;
    drawRadarChart(p);
    renderACWR(p);
    drawTrendChart(p);

    if (currentViewMode === 'calendar') {
        renderWeeklyCalendar(p);
    } else if (currentViewMode === 'monthly') {
        renderMonthlyCalendar(p);
    } else {
        renderBadgesAndSchedule(p);
    }
    lucide.createIcons();
}

function toggleViewMode(mode) {
    currentViewMode = mode;
    document.getElementById('viewCardBtn').classList.toggle('active', mode === 'card');
    document.getElementById('viewCalendarBtn').classList.toggle('active', mode === 'calendar');
    const monthlyBtn = document.getElementById('viewMonthlyBtn');
    if (monthlyBtn) monthlyBtn.classList.toggle('active', mode === 'monthly');

    const p = players.find(p => String(p.id) === String(currentId));
    if (p) renderResult();
}


function drawRadarChart(p) {
    const ctx = document.getElementById('radarChart').getContext('2d');
    if (radarChartInstance) radarChartInstance.destroy();

    const pType = p.type || '투수';
    const labels = pType === '타자'
        ? ['스프린트', '스쿼트', '데드리프트', '사이드 점프', '제자리 멀리뛰기', '흉추', '고관절', '코어']
        : ['스프린트', '스쿼트', '데드리프트', '풀업', '제자리 멀리뛰기', '흉추', '고관절', '코어'];

    const scoreData = labels.map((_, i) => {
        const key = pType === '타자'
            ? ['sprint', 'squat', 'deadlift', 'lateralBound', 'broadJump', 'thoracic', 'hip', 'core'][i]
            : ['sprint', 'squat', 'deadlift', 'pullup', 'broadJump', 'thoracic', 'hip', 'core'][i];
        return p.scores[key];
    });

    radarChartInstance = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [{
                label: '현재 능력치 (1~5단계)',
                data: scoreData,
                backgroundColor: 'rgba(31, 69, 133, 0.18)', borderColor: getCssVar('--primary'),
                pointBackgroundColor: getCssVar('--primary'), borderWidth: 2, pointRadius: 4
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: { r: { min: 0, max: 5, ticks: { stepSize: 1, display: false }, pointLabels: { font: { family: 'Pretendard', size: 12, weight: 'bold' }, color: getCssVar('--text-muted') } } },
            plugins: { legend: { display: false } }
        }
    });
}

let trendChartInstance = null;
function drawTrendChart(p) {
    const ctx = document.getElementById('trendChart').getContext('2d');
    if (trendChartInstance) trendChartInstance.destroy();

    if (!p.performanceHistory || p.performanceHistory.length === 0) {
        trendChartInstance = new Chart(ctx, {
            type: 'line',
            data: { labels: ['데이터 없음'], datasets: [] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });
        return;
    }

    const pType = p.type || '투수';
    const labels = p.performanceHistory.map(h => h.date.substring(5));

    if (pType === '타자') {
        const exitVeloData = p.performanceHistory.map(h => h.exitVelo);
        const batSpeedData = p.performanceHistory.map(h => h.batSpeed);
        trendChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    { label: '타구속도 (km/h)', data: exitVeloData, borderColor: getCssVar('--chart-amber'), backgroundColor: 'rgba(166, 118, 53, 0.12)', yAxisID: 'y', tension: 0.3, fill: true },
                    { label: '배트스피드 (km/h)', data: batSpeedData, borderColor: getCssVar('--chart-red'), backgroundColor: 'rgba(184, 92, 82, 0.12)', yAxisID: 'y', tension: 0.3, fill: true }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                scales: { y: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'km/h' } } }
            }
        });
    } else {
        const maxVeloData = p.performanceHistory.map(h => h.maxVelo);
        const avgVeloData = p.performanceHistory.map(h => h.avgVelo);
        const rpmData = p.performanceHistory.map(h => h.rpm);
        trendChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    { label: '최고 구속 (km/h)', data: maxVeloData, borderColor: getCssVar('--chart-red'), backgroundColor: 'rgba(184, 92, 82, 0.12)', yAxisID: 'y', tension: 0.3, fill: true },
                    { label: '평균 구속 (km/h)', data: avgVeloData, borderColor: getCssVar('--chart-green'), backgroundColor: 'rgba(47, 122, 95, 0.12)', yAxisID: 'y', tension: 0.3, fill: true },
                    { label: 'RPM', data: rpmData, borderColor: getCssVar('--primary'), backgroundColor: 'rgba(31, 69, 133, 0.12)', yAxisID: 'y1', tension: 0.3, fill: true }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                scales: {
                    y: { type: 'linear', display: true, position: 'left', title: { display: true, text: '구속' } },
                    y1: { type: 'linear', display: true, position: 'right', title: { display: true, text: 'RPM' }, grid: { drawOnChartArea: false } }
                }
            }
        });
    }
}

function getScheduleStatus(player, dayIndex, exercises) {
    if (!player.weekStartDate) return '비배정';
    const weekStart = parseLocalDate(player.weekStartDate);
    const dayDate = new Date(weekStart);
    dayDate.setDate(weekStart.getDate() + dayIndex);
    const today = new Date();
    const isCompleted = player.dailyCompletion && player.dailyCompletion[dayIndex] && player.dailyCompletion[dayIndex].completed;
    if (isCompleted) return '완료';
    if (isSameLocalDate(dayDate, today)) return '오늘';
    if (exercises && exercises.length === 1 && exercises[0].name === '휴식') return '휴식';
    if (dayDate > today) return '잠금';
    return '미완료';
}

function canCompleteScheduleDay(player, dayIndex) {
    if (!player.weekStartDate) return false;
    const weekStart = parseLocalDate(player.weekStartDate);
    const dayDate = new Date(weekStart);
    dayDate.setDate(weekStart.getDate() + dayIndex);
    return getLocalDateStr(dayDate) === getTodayStr();
}

function calculateACWRMetrics(player) {
    if (!player.workloadHistory || player.workloadHistory.length < 7) {
        return { acuteLoad: 0, chronicLoad: 0, ratio: 0, isReady: false };
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let acuteSum = 0, chronicSum = 0;
    player.workloadHistory.forEach(entry => {
        const entryDate = parseLocalDate(entry.date);
        const diffDays = Math.floor((today - entryDate) / (1000 * 60 * 60 * 24));
        if (diffDays < 7) acuteSum += entry.workload;
        if (diffDays < 28) chronicSum += entry.workload;
    });
    const chronicLoad = chronicSum / 4;
    const ratio = chronicLoad > 0 ? acuteSum / chronicLoad : 0;
    return { acuteLoad: acuteSum, chronicLoad, ratio, isReady: true };
}

function renderACWR(p) {
    const { acuteLoad, chronicLoad, ratio: acwr, isReady } = calculateACWRMetrics(p);
    const statusEl = document.getElementById('acwrStatus');
    // 누적 상태 class 방지 — 매 호출 시작에서 5종 모두 제거 후 분기 1개만 add
    statusEl.classList.remove(
        'acwr-status--muted',
        'acwr-status--safe',
        'acwr-status--watch',
        'acwr-status--risk',
        'acwr-status--info'
    );

    if (!isReady) {
        document.getElementById('acuteLoad').innerText = '0';
        document.getElementById('chronicLoad').innerText = '0';
        document.getElementById('acwrRatio').innerText = '0.00';
        statusEl.innerText = '데이터 수집 중 (최소 7일 필요)';
        statusEl.classList.add('acwr-status--muted');
        return;
    }

    document.getElementById('acuteLoad').innerText = acuteLoad;
    document.getElementById('chronicLoad').innerText = chronicLoad.toFixed(1);
    document.getElementById('acwrRatio').innerText = acwr.toFixed(2);

    if (acwr === 0) {
        statusEl.innerText = '데이터 부족';
        statusEl.classList.add('acwr-status--muted');
    } else if (acwr >= 0.8 && acwr <= 1.3) {
        statusEl.innerText = '권장 범위 참고';
        statusEl.classList.add('acwr-status--safe');
    } else if (acwr > 1.3 && acwr <= 1.5) {
        statusEl.innerText = '부하 증가 확인 필요';
        statusEl.classList.add('acwr-status--watch');
    } else if (acwr > 1.5) {
        statusEl.innerText = '부하 급증 조정 검토';
        statusEl.classList.add('acwr-status--risk');
    } else {
        statusEl.innerText = '부하 낮음';
        statusEl.classList.add('acwr-status--info');
    }
}

function renderWeeklyCalendar(p) {
    const container = document.getElementById('calendarContainer');
    const cardContainer = document.getElementById('scheduleContainer');
    const monthlyContainer = document.getElementById('monthlyCalendarContainer');
    const guideText = document.getElementById('scheduleGuideText');
    const summarySection = document.getElementById('todaySummarySection');
    if (summarySection) summarySection.style.display = 'none';

    container.style.display = 'grid';
    cardContainer.style.display = 'none';
    if (monthlyContainer) monthlyContainer.style.display = 'none';
    if (guideText) guideText.innerText = "날짜를 클릭하면 카드형 뷰로 전환됩니다.";

    // 기준일 계산 (Day 1)
    const baseDate = p.weekStartDate ? parseLocalDate(p.weekStartDate) : new Date();
    const startDay = baseDate.getDay(); // 0(일) ~ 6(토)

    // 현재 진행 일차 계산 (weekStartDate가 미래이면 -1로 유지 → 전체 잠금)
    let currentDayIdx = -1;
    if (p.weekStartDate) {
        currentDayIdx = Math.floor((new Date() - parseLocalDate(p.weekStartDate)) / (1000 * 60 * 60 * 24));
    }

    let html = `<div class="week-list">`;
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

    for (let i = 0; i < 7; i++) {
        const d = new Date(baseDate);
        d.setDate(baseDate.getDate() + i);
        const dateStr = `${d.getMonth() + 1}/${d.getDate()}`;
        const dayName = weekDays[d.getDay()];

        const isCompleted = p.dailyCompletion && p.dailyCompletion[i] && p.dailyCompletion[i].completed;
        const isToday = i === currentDayIdx;
        const isFuture = i > currentDayIdx;
        const isMissed = !isCompleted && i < currentDayIdx;

        let rowClass = '';
        let statusText = '미완료';
        if (isCompleted) { statusText = '완료'; }
        else if (isToday) { rowClass = 'today'; statusText = '오늘'; }
        else if (isFuture) { statusText = '잠금'; }
        else if (isMissed) { statusText = '미완료'; }

        html += `
            <div class="week-row ${rowClass}" data-calendar-cell-action="open-card">
                <div class="week-date">Day ${i + 1} <strong>${escapeHTML(dayName)}</strong></div>
                <div class="week-content">
                    <div class="week-meta">
                        <span>${escapeHTML(statusText)}</span>
                        <span>·</span>
                        <span>${escapeHTML(dateStr)}</span>
                        ${isCompleted ? `<span>·</span><span>WL ${escapeHTML(String(p.dailyCompletion[i].workload ?? ''))}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }
    html += `</div>`;
    container.innerHTML = html;
    _bindWeeklyCalendarClickHandler(container);
}

function _handleWeeklyCalendarClick(e) {
    const cell = e.target.closest('[data-calendar-cell-action="open-card"]');
    if (!cell || !e.currentTarget.contains(cell)) return;

    e.preventDefault();
    e.stopPropagation();

    toggleViewMode('card');
}

function _bindWeeklyCalendarClickHandler(container) {
    if (!container) return;
    if (_weeklyCalendarClickHandler) {
        container.removeEventListener('click', _weeklyCalendarClickHandler);
    }
    _weeklyCalendarClickHandler = _handleWeeklyCalendarClick;
    container.addEventListener('click', _weeklyCalendarClickHandler);
}

function _getMonthlyDetailStatusClass(status) {
    const allowed = {
        '완료': '완료',
        '오늘': '오늘',
        '잠금': '잠금',
        '미완료': '미완료',
        '휴식': '휴식',
        '비배정': '비배정'
    };
    return allowed[status] || '비배정';
}

const MONTHLY_SCHEDULE_DAY_COUNT = 7;

function _parseMonthlyDayIndex(value) {
    const text = String(value ?? '');
    if (!/^(0|[1-9]\d*)$/.test(text)) return -1;
    const n = Number(text);
    return n >= 0 && n < MONTHLY_SCHEDULE_DAY_COUNT ? n : -1;
}

function _parseMonthlyActionDayIndex(value, allowHistoryIndex = false) {
    if (allowHistoryIndex && String(value ?? '') === '-1') return -1;
    const parsed = _parseMonthlyDayIndex(value);
    return parsed === -1 ? null : parsed;
}

function _isMonthlyDateKey(value) {
    const text = String(value || '');
    const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return false;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return false;
    if (month < 1 || month > 12) return false;

    const date = new Date(year, month - 1, day);
    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
}

function _formatMonthlyDetailNumber(value) {
    if (value === null || value === undefined || value === '') return '-';
    const n = Number(value);
    return Number.isFinite(n) ? escapeHTML(String(n)) : '-';
}

function _renderMonthlyExerciseList(exercises) {
    if (!Array.isArray(exercises) || exercises.length === 0) return '';
    let html = '<ul class="detail-exercise-list">';
    exercises.forEach(ex => {
        const li = document.createElement('li');
        const name = ex && ex.name !== undefined ? ex.name : '';
        const sets = ex && ex.sets !== undefined ? ex.sets : '';
        const reps = ex && ex.reps !== undefined ? ex.reps : '';
        const isSkipped = ex && ex.completed === false;
        if (isSkipped) li.className = 'detail-exercise-skipped';
        const reasonLabel = isSkipped ? _getSkippedReasonLabel(ex && ex.skippedReason) : '';
        const skippedSuffix = isSkipped
            ? (reasonLabel ? ` · 미수행: ${reasonLabel}` : ' · 미수행')
            : '';
        li.textContent = `${name} — ${sets}세트 × ${reps}${skippedSuffix}`;
        html += li.outerHTML;
    });
    html += '</ul>';
    return html;
}

function renderMonthlyCalendar(p) {
    const container = document.getElementById('monthlyCalendarContainer');
    const cardContainer = document.getElementById('scheduleContainer');
    const weeklyContainer = document.getElementById('calendarContainer');
    const guideText = document.getElementById('scheduleGuideText');
    const summarySection = document.getElementById('todaySummarySection');
    if (summarySection) summarySection.style.display = 'none';

    cardContainer.style.display = 'none';
    weeklyContainer.style.display = 'none';
    container.style.display = 'block';
    if (guideText) guideText.innerText = '날짜를 클릭하면 해당 일차의 상세 정보를 확인할 수 있습니다.';

    const safeCalendarPlayerIdAttr = escapeHTML(p.id);
    const safeCalendarPlayerIdArg = _escapeInlineJsString(p.id);

    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

    // weekStartDate 기준 Day 0~6 날짜 맵 생성
    const scheduleMap = {};
    if (p.weekStartDate) {
        const weekStart = parseLocalDate(p.weekStartDate);
        for (let i = 0; i < 7; i++) {
            const d = new Date(weekStart);
            d.setDate(weekStart.getDate() + i);
            scheduleMap[getLocalDateStr(d)] = i;
        }
    }

    let html = `
        <div class="monthly-header">
            <button class="btn btn-sm btn-outline" data-month-nav="prev">&#8249;</button>
            <span class="monthly-title">${year}년 ${month + 1}월</span>
            <button class="btn btn-sm btn-outline" data-month-nav="today">오늘</button>
            <button class="btn btn-sm btn-outline" data-month-nav="next">&#8250;</button>
        </div>
        <div class="monthly-grid">
    `;

    weekDays.forEach(d => {
        html += `<div class="monthly-day-header">${d}</div>`;
    });

    for (let i = 0; i < firstDay; i++) {
        html += `<div class="monthly-cell empty"></div>`;
    }

    const todayStr = getTodayStr();
    for (let date = 1; date <= lastDate; date++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
        const dayIndex = scheduleMap[dateStr];
        const hasSchedule = dayIndex !== undefined;

        let cellClass = 'monthly-cell';
        let statusText = '';
        let workloadText = '';

        if (dateStr === todayStr) cellClass += ' monthly-today';

        const histEntry = p.completionHistory && p.completionHistory[dateStr];
        if (histEntry) {
            // 1순위: 과거 수행 기록 (completionHistory)
            cellClass += ' mc-completed';
            statusText = '완료';
            workloadText = `WL: ${escapeHTML(String(histEntry.workload ?? ''))}`;
            if (hasSchedule) {
                html += `
                    <div class="${cellClass}" data-date="${escapeHTML(dateStr)}" data-day-index="${dayIndex}" data-player-id="${safeCalendarPlayerIdAttr}">
                        <div class="mc-date">${date}</div>
                        <div class="mc-day-label">Day ${dayIndex + 1}</div>
                        <div class="mc-status">${escapeHTML(statusText)}</div>
                        <div class="mc-workload">${workloadText}</div>
                    </div>
                `;
            } else {
                html += `
                    <div class="${cellClass}" data-date="${escapeHTML(dateStr)}" data-day-index="" data-player-id="${safeCalendarPlayerIdAttr}">
                        <div class="mc-date">${date}</div>
                        <div class="mc-status">${escapeHTML(statusText)}</div>
                        <div class="mc-workload">${workloadText}</div>
                    </div>
                `;
            }
            continue;
        } else if (hasSchedule) {
            // 2순위: 현재 주차 스케줄
            const exs = _cachedDayExercises[dayIndex];
            const status = getScheduleStatus(p, dayIndex, exs);
            const statusClassMap = { '완료': 'mc-completed', '오늘': 'mc-today', '잠금': 'mc-locked', '미완료': 'mc-missed', '휴식': 'mc-rest' };
            cellClass += ` ${statusClassMap[status] || ''}`;
            statusText = status;
            if (status === '완료' && p.dailyCompletion[dayIndex]) {
                workloadText = `WL: ${escapeHTML(String(p.dailyCompletion[dayIndex].workload ?? ''))}`;
            }
        } else {
            cellClass += ' mc-none';
            statusText = '비배정';
        }

        html += `
            <div class="${cellClass}" data-date="${escapeHTML(dateStr)}" data-day-index="${hasSchedule ? dayIndex : ''}" data-player-id="${safeCalendarPlayerIdAttr}">
                <div class="mc-date">${date}</div>
                ${hasSchedule ? `<div class="mc-day-label">Day ${dayIndex + 1}</div>` : ''}
                ${statusText ? `<div class="mc-status">${escapeHTML(statusText)}</div>` : ''}
                ${workloadText ? `<div class="mc-workload">${workloadText}</div>` : ''}
            </div>
        `;
    }

    html += `</div>`;
    html += `<div id="dayDetailPanel" class="day-detail-panel is-initially-hidden"></div>`;
    container.innerHTML = html;

    // 이벤트 위임 - 누적 방지: 기존 핸들러 제거 후 새 핸들러 등록
    if (_monthlyClickHandler) {
        container.removeEventListener('click', _monthlyClickHandler);
    }
    _monthlyClickHandler = function (e) {
        const actionBtn = e.target.closest('[data-monthly-action]');
        if (actionBtn) {
            e.preventDefault();
            e.stopPropagation();

            const action = actionBtn.dataset.monthlyAction;
            const playerId = actionBtn.dataset.playerId || '';
            const date = actionBtn.dataset.date || '';

            if (action === 'edit-workload') {
                if (!_isMonthlyDateKey(date)) return;
                const actionDayIdx = _parseMonthlyActionDayIndex(actionBtn.dataset.dayIndex, true);
                if (actionDayIdx === null) return;
                openWorkloadModal(playerId, actionDayIdx, date);
                return;
            }

            if (action === 'delete-history') {
                if (!_isMonthlyDateKey(date)) return;
                deleteHistoryEntry(playerId, date);
                return;
            }

            if (action === 'add-workload') {
                const actionDayIdx = _parseMonthlyActionDayIndex(actionBtn.dataset.dayIndex, false);
                if (actionDayIdx === null) return;
                openWorkloadModal(playerId, actionDayIdx);
                return;
            }

            return;
        }

        const navBtn = e.target.closest('[data-month-nav]');
        if (navBtn) {
            const nav = navBtn.dataset.monthNav;
            if (nav === 'prev') {
                currentCalendarDate = new Date(year, month - 1, 1);
            } else if (nav === 'next') {
                currentCalendarDate = new Date(year, month + 1, 1);
            } else if (nav === 'today') {
                currentCalendarDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
            }
            renderMonthlyCalendar(p);
            return;
        }

        const cell = e.target.closest('.monthly-cell');
        if (!cell || !cell.dataset.date) return;

        const cellDateStr = cell.dataset.date;
        if (!_isMonthlyDateKey(cellDateStr)) return;

        const safeCellDateText = escapeHTML(cellDateStr);
        const safeCellDateArg = _escapeInlineJsString(cellDateStr);
        const safePanelPlayerIdArg = safeCalendarPlayerIdArg;
        const safeCellDateAttr = escapeHTML(cellDateStr);
        const safePanelPlayerIdAttr = safeCalendarPlayerIdAttr;
        const histEntry = p.completionHistory && p.completionHistory[cellDateStr];
        const dayIdx = _parseMonthlyDayIndex(cell.dataset.dayIndex);

        // 보여줄 데이터가 없는 셀은 무시
        if (!histEntry && dayIdx === -1) return;

        const panel = document.getElementById('dayDetailPanel');
        if (!panel) return;
        const pType = (p.type || '투수');
        const countLabel = pType === '타자' ? '타격(스윙) 수' : '투구 수';

        // 히스토리만 있는 셀 (이전 주차 완료 기록, dayIndex 없음)
        if (histEntry && dayIdx === -1) {
            let detailHtml = `<div class="detail-header"><strong>${safeCellDateText}</strong> <span class="detail-status 완료">완료</span></div>`;
            detailHtml += `<div class="detail-row">RPE ${_formatMonthlyDetailNumber(histEntry.rpe)} × ${countLabel} ${_formatMonthlyDetailNumber(histEntry.pitchCount)} = <strong>WL ${_formatMonthlyDetailNumber(histEntry.workload)}</strong></div>`;
            detailHtml += _renderMonthlyExerciseList(histEntry.exercises);
            detailHtml += `<div class="detail-action-row">
                <button class="btn btn-outline btn-sm" data-monthly-action="edit-workload" data-player-id="${safePanelPlayerIdAttr}" data-day-index="-1" data-date="${safeCellDateAttr}">✏️ 기록 수정</button>
                <button class="btn btn-danger-outline btn-sm" data-monthly-action="delete-history" data-player-id="${safePanelPlayerIdAttr}" data-date="${safeCellDateAttr}">🗑 기록 삭제</button>
            </div>`;
            panel.innerHTML = detailHtml;
            panel.style.display = 'block';
            lucide.createIcons();
            return;
        }

        // 현재 주차 스케줄 셀 (dayIdx >= 0)
        const cached = _cachedDayExercises[dayIdx];
        const status = getScheduleStatus(p, dayIdx, cached);
        const dc = p.dailyCompletion && p.dailyCompletion[dayIdx];
        const dateLabel = safeCellDateText;

        const safeDetailStatusClass = _getMonthlyDetailStatusClass(histEntry ? '완료' : status);
        const safeDayLabel = (Number.isInteger(dayIdx) && dayIdx >= 0) ? `Day ${dayIdx + 1}` : '';
        let detailHtml = `<div class="detail-header"><strong>${safeDayLabel}</strong> <span>${dateLabel}</span> <span class="detail-status ${safeDetailStatusClass}">${escapeHTML(histEntry ? '완료' : status)}</span></div>`;

        // completionHistory 우선: 과거 기록 표시
        const completedData = histEntry || (status === '완료' ? dc : null);
        if (completedData) {
            detailHtml += `<div class="detail-row">RPE ${_formatMonthlyDetailNumber(completedData.rpe)} × ${countLabel} ${_formatMonthlyDetailNumber(completedData.pitchCount)} = <strong>WL ${_formatMonthlyDetailNumber(completedData.workload)}</strong></div>`;
            detailHtml += _renderMonthlyExerciseList(completedData.exercises);
        } else if (cached && cached.length > 0) {
            detailHtml += _renderMonthlyExerciseList(cached);
        } else {
            detailHtml += `<p class="detail-hint">운동 목록은 카드형 뷰에서 먼저 로드해주세요.</p>`;
        }

        if (completedData) {
            // 완료 기록 있음 → 수정/삭제 버튼 노출
            detailHtml += `<div class="detail-action-row">
                <button class="btn btn-outline btn-sm" data-monthly-action="edit-workload" data-player-id="${safePanelPlayerIdAttr}" data-day-index="${dayIdx}" data-date="${safeCellDateAttr}">✏️ 기록 수정</button>
                <button class="btn btn-danger-outline btn-sm" data-monthly-action="delete-history" data-player-id="${safePanelPlayerIdAttr}" data-date="${safeCellDateAttr}">🗑 기록 삭제</button>
            </div>`;
        } else if (canCompleteScheduleDay(p, dayIdx)) {
            detailHtml += `<button class="btn btn-primary btn-sm monthly-add-workload-btn" data-monthly-action="add-workload" data-player-id="${safePanelPlayerIdAttr}" data-day-index="${dayIdx}">워크로드 입력</button>`;
        }

        panel.innerHTML = detailHtml;
        panel.style.display = 'block';
        lucide.createIcons();
    };
    container.addEventListener('click', _monthlyClickHandler);
}

function getPlayerRiskInfo(p) {
    const todayStr = getTodayStr();
    const isWellnessToday = p.wellness && p.wellness.date === todayStr;
    const painAreas = p.wellness ? (Array.isArray(p.wellness.pain) ? p.wellness.pain : [p.wellness.pain]) : ['없음'];
    const hasPain = isWellnessToday && !painAreas.includes('없음');

    const acwrMetrics = calculateACWRMetrics(p);
    const acwrDanger = acwrMetrics.isReady && acwrMetrics.ratio > 1.5;
    const acwrCaution = acwrMetrics.isReady && acwrMetrics.ratio > 1.3 && acwrMetrics.ratio <= 1.5;

    let hasLowRecovery = false;
    if (isWellnessToday && p.wellness.recovery) {
        if (typeof p.wellness.recovery === 'object') {
            hasLowRecovery = Object.values(p.wellness.recovery).some(v => v <= 3);
        } else {
            hasLowRecovery = p.wellness.recovery <= 3;
        }
    }

    const wellnessMissing = p.scores && (!p.wellness || !isWellnessToday);

    let currentDayIndex = -1;
    if (p.weekStartDate) {
        const start = parseLocalDate(p.weekStartDate);
        currentDayIndex = Math.floor((new Date() - start) / (1000 * 60 * 60 * 24));
    }
    const isPreview = currentDayIndex < 0;
    const isValidDay = currentDayIndex >= 0 && currentDayIndex <= 6;
    // preview mode 또는 주차 범위 초과면 오늘 훈련 판정 제외
    const todayNotCompleted = isValidDay && p.scores && !(p.dailyCompletion && p.dailyCompletion[currentDayIndex] && p.dailyCompletion[currentDayIndex].completed);

    let priority = 0;
    if (hasPain) priority = 6;
    else if (acwrDanger) priority = 5;
    else if (acwrCaution) priority = 4;
    else if (hasLowRecovery) priority = 3;
    else if (wellnessMissing) priority = 2;
    else if (todayNotCompleted) priority = 1;

    const needsAction = hasPain || acwrDanger || acwrCaution || hasLowRecovery || wellnessMissing || todayNotCompleted;

    return {
        hasPain, painAreas: hasPain ? painAreas.filter(a => a !== '없음') : [],
        acwrDanger, acwrCaution, hasLowRecovery,
        wellnessMissing, todayNotCompleted,
        needsAction, priority
    };
}

function getFilteredPlayers(filter) {
    switch (filter) {
        case '전체': return players;
        case '투수': return players.filter(p => (p.type || '투수') === '투수');
        case '타자': return players.filter(p => p.type === '타자');
        case '시즌중': return players.filter(p => p.season === '시즌중');
        case '비시즌': return players.filter(p => p.season !== '시즌중');
        case '조치 필요': return players.filter(p => getPlayerRiskInfo(p).needsAction);
        default: return players;
    }
}

function setDashboardFilter(filter) {
    currentDashboardFilter = filter;
    renderTeamDashboard();
}

function _handleDashboardActionQueueClick(e) {
    const actionEl = e.target.closest('[data-dashboard-action]');
    if (!actionEl || !e.currentTarget.contains(actionEl)) return;

    e.preventDefault();
    e.stopPropagation();

    const action = actionEl.dataset.dashboardAction;
    const playerId = actionEl.dataset.playerId || '';
    if (!playerId) return;

    if (action === 'open-result') {
        goAssessOrResult(playerId);
        return;
    }

    if (action === 'open-wellness') {
        openWellness(playerId);
        return;
    }
}

function _bindDashboardActionQueueClickHandler(actionQueue) {
    if (!actionQueue) return;
    if (_dashboardActionQueueClickHandler) {
        actionQueue.removeEventListener('click', _dashboardActionQueueClickHandler);
    }
    _dashboardActionQueueClickHandler = _handleDashboardActionQueueClick;
    actionQueue.addEventListener('click', _dashboardActionQueueClickHandler);
}

function _handleDashboardFilterClick(e) {
    const filterBtn = e.target.closest('[data-dashboard-filter-action="set"]');
    if (!filterBtn || !e.currentTarget.contains(filterBtn)) return;

    e.preventDefault();
    e.stopPropagation();

    const filter = filterBtn.dataset.filter || '';
    if (!filter) return;

    setDashboardFilter(filter);
}

function _bindDashboardFilterClickHandler(filterBar) {
    if (!filterBar) return;
    if (_dashboardFilterClickHandler) {
        filterBar.removeEventListener('click', _dashboardFilterClickHandler);
    }
    _dashboardFilterClickHandler = _handleDashboardFilterClick;
    filterBar.addEventListener('click', _dashboardFilterClickHandler);
}

function renderTeamDashboard() {
    const statsGrid = document.getElementById('teamStatsGrid');
    const actionQueue = document.getElementById('actionQueueList');
    const filterBar = document.getElementById('dashboardFilterBar');
    _bindDashboardActionQueueClickHandler(actionQueue);
    _bindDashboardFilterClickHandler(filterBar);

    // 필터 바 렌더링
    const filters = ['조치 필요', '전체', '투수', '타자', '시즌중', '비시즌'];
    filterBar.innerHTML = filters.map(f => {
        const safeFilterLabel = escapeHTML(f);
        const safeFilterValue = escapeHTML(f);
        return `<button class="dashboard-filter-chip${currentDashboardFilter === f ? ' active' : ''}" data-dashboard-filter-action="set" data-filter="${safeFilterValue}">${safeFilterLabel}</button>`;
    }).join('');

    // 전역 통계 (필터 무관)
    const total = players.length;
    const assessed = players.filter(p => p.scores).length;

    // 필터 적용 통계
    const filtered = getFilteredPlayers(currentDashboardFilter);
    const filteredCount = filtered.length;

    const todayStr = getTodayStr();
    const recordedTodayCount = players.filter(p => getCompletionEntryByDate(p, todayStr) || getWorkloadEntryByDate(p, todayStr)).length;
    const wellnessMissingCount = filtered.filter(p => p.scores && (!p.wellness || p.wellness.date !== todayStr)).length;

    const todayNotCompletedCount = filtered.filter(p => {
        if (!p.scores) return false;
        let idx = -1;
        if (p.weekStartDate) {
            idx = Math.floor((new Date() - parseLocalDate(p.weekStartDate)) / (1000 * 60 * 60 * 24));
        }
        if (idx < 0 || idx > 6) return false; // preview mode 또는 주차 범위 초과
        return !(p.dailyCompletion && p.dailyCompletion[idx] && p.dailyCompletion[idx].completed);
    }).length;

    const painCount = filtered.filter(p => getPlayerRiskInfo(p).hasPain).length;
    const acwrRiskCount = filtered.filter(p => { const r = getPlayerRiskInfo(p); return r.acwrDanger || r.acwrCaution; }).length;
    const lowRecoveryCount = filtered.filter(p => getPlayerRiskInfo(p).hasLowRecovery).length;
    const actionNeededCount = filtered.filter(p => getPlayerRiskInfo(p).needsAction).length;

    const safeCurrentDashboardFilter = escapeHTML(currentDashboardFilter);
    const safeTotal = escapeHTML(String(total ?? ''));
    const safeAssessed = escapeHTML(String(assessed ?? ''));
    const safeRecordedTodayCount = escapeHTML(String(recordedTodayCount ?? ''));
    const safeFilteredCount = escapeHTML(String(filteredCount ?? ''));
    const safePainCount = escapeHTML(String(painCount ?? ''));
    const safeAcwrRiskCount = escapeHTML(String(acwrRiskCount ?? ''));
    const safeLowRecoveryCount = escapeHTML(String(lowRecoveryCount ?? ''));
    const safeWellnessMissingCount = escapeHTML(String(wellnessMissingCount ?? ''));
    const safeTodayNotCompletedCount = escapeHTML(String(todayNotCompletedCount ?? ''));
    const safeActionNeededCount = escapeHTML(String(actionNeededCount ?? ''));

    statsGrid.innerHTML = `
        <div class="stat-section-label">전체 기준</div>
        <div class="stat-section stat-section-global">
            <div class="stat-card">
                <div class="label">전체 선수</div>
                <div class="value">${safeTotal}</div>
            </div>
            <div class="stat-card">
                <div class="label">평가 완료</div>
                <div class="value">${safeAssessed}</div>
            </div>
            <div class="stat-card">
                <div class="label">오늘 기록</div>
                <div class="value">${safeRecordedTodayCount}</div>
            </div>
        </div>
        <div class="stat-section-label">현재 필터 기준 <span class="stat-filter-badge">${safeCurrentDashboardFilter} · ${safeFilteredCount}명</span></div>
        <div class="stat-section stat-section-filtered">
            <div class="stat-card ${painCount > 0 ? 'danger' : ''}">
                <div class="label">통증</div>
                <div class="value">${safePainCount}</div>
            </div>
            <div class="stat-card ${acwrRiskCount > 0 ? 'danger' : ''}">
                <div class="label">ACWR 부하 참고</div>
                <div class="value">${safeAcwrRiskCount}</div>
            </div>
            <div class="stat-card ${lowRecoveryCount > 0 ? 'warning' : ''}">
                <div class="label">회복저하</div>
                <div class="value">${safeLowRecoveryCount}</div>
            </div>
            <div class="stat-card ${wellnessMissingCount > 0 ? 'warning' : ''}">
                <div class="label">웰니스 미입력</div>
                <div class="value">${safeWellnessMissingCount}</div>
            </div>
            <div class="stat-card ${todayNotCompletedCount > 0 ? 'warning' : ''}">
                <div class="label">오늘 미완료</div>
                <div class="value">${safeTodayNotCompletedCount}</div>
            </div>
            <div class="stat-card ${actionNeededCount > 0 ? 'danger' : ''}">
                <div class="label">조치 필요</div>
                <div class="value">${safeActionNeededCount}</div>
            </div>
        </div>
    `;

    // 액션 큐: 필터 대상 중 조치 필요 선수, 우선순위 정렬
    const queueItems = filtered
        .map(p => ({ p, risk: getPlayerRiskInfo(p) }))
        .filter(({ risk }) => risk.needsAction)
        .sort((a, b) => b.risk.priority - a.risk.priority);

    if (queueItems.length === 0) {
        actionQueue.innerHTML = `<div class="empty-state">
            <div class="empty-state-icon"><i data-lucide="check-circle" class="ui-icon-20"></i></div>
            <div class="empty-state-title">현재 조치가 필요한 선수가 없습니다</div>
            <div class="empty-state-desc">모든 선수가 정상 범위 내에 있습니다.</div>
        </div>`;
        lucide.createIcons();
    } else {
        actionQueue.innerHTML = queueItems.map(({ p, risk }) => {
            const reasons = [];
            if (risk.hasPain) reasons.push(`<span class="aq-tag aq-danger">통증: ${risk.painAreas.map(escapeHTML).join(', ')}</span>`);
            if (risk.acwrDanger) reasons.push('<span class="aq-tag aq-danger">ACWR 부하 급증</span>');
            if (risk.acwrCaution) reasons.push('<span class="aq-tag aq-warning">ACWR 부하 증가</span>');
            if (risk.hasLowRecovery) reasons.push('<span class="aq-tag aq-warning">회복저하</span>');
            if (risk.wellnessMissing) reasons.push('<span class="aq-tag aq-info">웰니스 미입력</span>');
            if (risk.todayNotCompleted) reasons.push('<span class="aq-tag aq-info">오늘 미완료</span>');
            const reasonsHtml = reasons.slice(0, 2).join('');
            const pType = p.type || '투수';
            const seasonText = p.season === '시즌중' ? '시즌중' : '비시즌';
            const safePlayerIdAttr = escapeHTML(p.id);
            const safePlayerName = escapeHTML(p.name);
            const safeSeasonText = escapeHTML(seasonText);
            return `
                <div class="aq-card" data-dashboard-action="open-result" data-player-id="${safePlayerIdAttr}">
                    <div class="aq-card-top">
                        <div class="aq-card-info">
                            <span class="aq-name">${safePlayerName}</span>
                            <span class="aq-meta">${pType === '타자' ? '타자' : '투수'} · ${safeSeasonText}</span>
                        </div>
                        <div class="aq-card-actions">
                            <button class="btn btn-sm btn-primary" data-dashboard-action="open-result" data-player-id="${safePlayerIdAttr}">결과 보기</button>
                            ${p.scores ? `<button class="btn btn-sm btn-tone-success" data-dashboard-action="open-wellness" data-player-id="${safePlayerIdAttr}">컨디션 입력</button>` : ''}
                        </div>
                    </div>
                    <div class="aq-risk-tags">${reasonsHtml}</div>
                </div>
            `;
        }).join('');
    }
}

function _formatScheduleText(value, fallback = '') {
    if (value === null || value === undefined) return escapeHTML(fallback);
    const text = String(value).trim();
    return escapeHTML(text === '' ? fallback : text);
}

function _formatScheduleCount(value, fallback = '-') {
    if (value === null || value === undefined || value === '') return escapeHTML(fallback);
    const n = Number(value);
    if (Number.isFinite(n)) return escapeHTML(String(n));
    return _formatScheduleText(value, fallback);
}

function _formatExerciseVolumeForDisplay(exData, reps) {
    const baseReps = String(reps ?? '');
    if (!exData || !exData.volumeType) return baseReps;
    const volumeType = exData.volumeType;
    const volumeNote = exData.volumeNote;
    if (volumeType === 'reps') {
        if (volumeNote === '좌우 각' && baseReps && !baseReps.includes('좌우')) {
            return `${baseReps} (좌우 각)`;
        }
        return baseReps;
    }
    if (volumeType === 'seconds') {
        if (baseReps.includes('초')) return baseReps;
        if (typeof exData.defaultDurationSec === 'number') return `${exData.defaultDurationSec}초`;
        return baseReps;
    }
    if (volumeType === 'distance') {
        if (baseReps.includes('m')) return baseReps;
        if (typeof exData.defaultDistance === 'string') return exData.defaultDistance;
        return baseReps;
    }
    if (volumeType === 'throws') {
        if (baseReps.includes('던지기') || baseReps.includes('throw')) return baseReps;
        if (exData.defaultThrows) return `${exData.defaultThrows}회 던지기`;
        if (baseReps) return `${baseReps} 던지기`;
        return baseReps;
    }
    if (volumeType === 'runs') {
        if (baseReps.includes('왕복') || baseReps.includes('인터벌')) return baseReps;
        if (exData.defaultRuns) return `${exData.defaultRuns}회 왕복`;
        if (baseReps) return `${baseReps} 왕복`;
        return baseReps;
    }
    if (volumeType === 'mixed') {
        if (volumeNote) return volumeNote;
        return baseReps;
    }
    return baseReps;
}

function _isValidScheduleDayIndex(index) {
    return Number.isInteger(index) && index >= 0 && index <= 6;
}

function _getScheduleDayRenderState(dayStatus, isCompleted, index, activeDayTab, safeSchedulePlayerIdAttr) {
    let cardModifier = '';
    let headerModifier = '';
    let btnClass = '';
    let btnText = '';
    let btnDisabled = '';
    let btnAction = _isValidScheduleDayIndex(index)
        ? `data-schedule-workload-action="open" data-player-id="${safeSchedulePlayerIdAttr}" data-day-index="${index}"`
        : '';
    let dayHeaderExtra = '';

    if (dayStatus === '잠금') {
        btnClass = 'btn-outline';
        btnText = '내일 이후 오픈';
        btnDisabled = 'disabled';
        btnAction = '';
    } else if (dayStatus === '오늘') {
        if (isCompleted) {
            cardModifier = 'schedule-day--completed';
            headerModifier = 'day-header--completed';
            btnClass = 'btn-primary';
            btnText = '완료됨 (수정)';
            dayHeaderExtra = '<span class="today-training-badge">오늘의 훈련</span>';
        } else {
            cardModifier = 'schedule-day--today-pending';
            btnClass = 'btn-primary';
            btnText = '오늘 훈련 완료하기';
            dayHeaderExtra = '<span class="today-training-badge">오늘의 훈련</span>';
        }
    } else {
        if (isCompleted) {
            cardModifier = 'schedule-day--completed';
            headerModifier = 'day-header--completed';
            btnClass = 'btn-outline';
            btnText = '완료됨';
        } else {
            btnClass = 'btn-outline';
            btnText = '미완료';
        }
        btnDisabled = 'disabled';
        btnAction = '';
    }

    const tabHiddenClass = index !== activeDayTab ? 'schedule-day--hidden' : '';

    return {
        cardModifier,
        headerModifier,
        btnClass,
        btnText,
        btnDisabled,
        btnAction,
        dayHeaderExtra,
        tabHiddenClass,
    };
}

function _parseScheduleWorkloadDayIndex(value) {
    const text = String(value ?? '').trim();
    if (!/^\d+$/.test(text)) return null;
    const parsed = Number(text);
    return _isValidScheduleDayIndex(parsed) ? parsed : null;
}

function _handleScheduleWorkloadClick(e) {
    const actionBtn = e.target.closest('[data-schedule-workload-action="open"]');
    if (!actionBtn || !e.currentTarget.contains(actionBtn)) return;

    e.preventDefault();
    e.stopPropagation();

    const playerId = actionBtn.dataset.playerId || '';
    const dayIndex = _parseScheduleWorkloadDayIndex(actionBtn.dataset.dayIndex);
    if (dayIndex === null) return;

    openWorkloadModal(playerId, dayIndex);
}

function _handleScheduleTabClick(e) {
    const tabBtn = e.target.closest('[data-schedule-tab-action="switch"]');
    if (!tabBtn || !e.currentTarget.contains(tabBtn)) return;

    e.preventDefault();
    e.stopPropagation();

    const playerId = tabBtn.dataset.playerId || '';
    const dayIndex = _parseScheduleWorkloadDayIndex(tabBtn.dataset.dayIndex);
    if (dayIndex === null) return;

    switchDayTab(playerId, dayIndex);
}

function _handleScheduleGuideClick(e) {
    if (e.target.closest('.ex-swap-btn')) return;

    const guideItem = e.target.closest('[data-schedule-guide-action="open"]');
    if (!guideItem || !e.currentTarget.contains(guideItem)) return;

    e.preventDefault();
    e.stopPropagation();

    const guideName = guideItem.dataset.guideName || '';
    if (!guideName) return;

    openGuide(guideName);
}

function _handleScheduleSwapClick(e) {
    const swapBtn = e.target.closest('[data-schedule-swap-action="open"]');
    if (!swapBtn || !e.currentTarget.contains(swapBtn)) return;

    e.preventDefault();
    e.stopPropagation();

    const playerId = swapBtn.dataset.playerId || '';
    const dayIndex = _parseScheduleWorkloadDayIndex(swapBtn.dataset.dayIndex);
    const exName = swapBtn.dataset.exName || '';
    if (dayIndex === null || !exName) return;

    openSwapModal(playerId, dayIndex, exName, e);
}

function _normalizeScheduleSets(value, fallback = 1) {
    if (value === null || value === undefined || value === '') return fallback;

    const directNumber = Number(value);
    if (Number.isFinite(directNumber)) {
        return Math.max(1, Math.round(directNumber));
    }

    const text = String(value).trim();
    const match = text.match(/\d+(?:\.\d+)?/);
    if (!match) return fallback;

    const parsedNumber = Number(match[0]);
    if (!Number.isFinite(parsedNumber)) return fallback;
    return Math.max(1, Math.round(parsedNumber));
}

function renderBadgesAndSchedule(p) {
    const badgeContainer = document.getElementById('wellnessBadges');
    const scheduleContainer = document.getElementById('scheduleContainer');
    const calendarContainer = document.getElementById('calendarContainer');
    const guideText = document.getElementById('scheduleGuideText');

    calendarContainer.style.display = 'none';
    const monthlyContainer = document.getElementById('monthlyCalendarContainer');
    if (monthlyContainer) monthlyContainer.style.display = 'none';
    scheduleContainer.style.display = 'block';
    if (guideText) guideText.innerText = "운동 항목을 클릭하면 상세 가이드를 볼 수 있습니다.";

    let badgesHtml = '';

    // ACWR 계산
    const acwr = calculateACWRMetrics(p).ratio;

    const isToday = p.wellness.date === getTodayStr();
    let volDown = false; let painAreas = ['없음'];
    let highWorkload = false;
    const threshold = getWorkloadThreshold(p.age, p.type);

    if (isToday) {
        let hasLowRecovery = false;
        if (typeof p.wellness.recovery === 'object') {
            hasLowRecovery = Object.values(p.wellness.recovery).some(val => val <= 3);
        } else {
            hasLowRecovery = p.wellness.recovery <= 3;
        }

        if (p.wellness.fatigue >= 4 || p.wellness.soreness >= 4 || p.wellness.sleep < 6 || hasLowRecovery) {
            volDown = true; badgesHtml += `<div class="badge badge-warning">피로/근육통 높음 또는 회복 부족: 오늘 세트 수 1 하향 조정</div>`;
        }

        painAreas = Array.isArray(p.wellness.pain) ? p.wellness.pain : [p.wellness.pain];
        if (!painAreas.includes('없음')) {
            badgesHtml += `<div class="badge badge-danger">통증(${escapeHTML(painAreas.join(', '))}): 관련 운동 대체 프로그램 적용</div>`;
        }

        if (!volDown && painAreas.includes('없음')) badgesHtml += `<div class="badge badge-success">컨디션 양호: 정상 스케줄 진행</div>`;
    } else {
        badgesHtml += `<div class="badge badge-muted">오늘의 컨디션이 입력되지 않았습니다. 컨디션 버튼을 눌러 입력하면 맞춤 스케줄이 적용됩니다.</div>`;
    }

    // 어제 워크로드 확인 (highWorkload 로직)
    // weekStartDate가 미래이면 음수 유지 → 미리보기 상태
    let currentDayIndex = 0;
    if (p.weekStartDate) {
        const start = parseLocalDate(p.weekStartDate);
        const now = new Date();
        const diffTime = now - start;
        currentDayIndex = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }
    const isPreviewMode = currentDayIndex < 0;

    if (currentDayIndex > 0 && p.dailyCompletion && p.dailyCompletion[currentDayIndex - 1]) {
        const yesterdayWorkload = p.dailyCompletion[currentDayIndex - 1].workload;
        if (yesterdayWorkload && yesterdayWorkload > threshold) {
            highWorkload = true;
            volDown = true;
            badgesHtml += `<div class="badge badge-warning">어제 ${escapeHTML(String(p.age))}세 권장 워크로드(${escapeHTML(String(threshold))}) 초과: 오늘 회복·가동성 관리 스케줄 자동 적용</div>`;
        }
    }

    if (p.dailyCompletion && p.dailyCompletion[currentDayIndex] && p.dailyCompletion[currentDayIndex].completed) {
        const todayWorkload = p.dailyCompletion[currentDayIndex].workload;
        const workloadLabel = (p.type || '투수') === '타자' ? '오늘의 타격 워크로드' : '오늘의 투구 워크로드';
        const countLabel = (p.type || '투수') === '타자' ? '타격(스윙) 수' : '투구 수';
        const noWorkloadLabel = (p.type || '투수') === '타자' ? '오늘 타격하지 않음' : '오늘 투구하지 않음';
        if (todayWorkload > 0) {
            badgesHtml += `<div class="badge badge-info">${escapeHTML(String(workloadLabel))}: ${escapeHTML(String(todayWorkload))} (RPE ${escapeHTML(String(p.dailyCompletion[currentDayIndex].rpe))} x ${escapeHTML(String(countLabel))} ${escapeHTML(String(p.dailyCompletion[currentDayIndex].pitchCount))})</div>`;
        } else {
            badgesHtml += `<div class="badge badge-muted">${escapeHTML(String(noWorkloadLabel))} (워크로드: 0)</div>`;
        }
    }

    if (p.upgradeMsg) {
        if (p.isUpgraded) {
            badgesHtml += `<div class="badge badge-success-soft">${escapeHTML(p.upgradeMsg)}</div>`;
        } else {
            badgesHtml += `<div class="badge badge-muted-plain">${escapeHTML(p.upgradeMsg)}</div>`;
        }
    }

    // 지난 주차 미완료 안내
    if (p.prevWeekMissed && p.prevWeekMissed.missedDays > 0) {
        if (p.prevWeekMissed.missedDays <= 2) {
            badgesHtml += `<div class="badge badge-success-outline">지난 주 ${escapeHTML(String(p.prevWeekMissed.missedDays))}일 미완료 — 이번 주 정상 진행</div>`;
        } else {
            badgesHtml += `<div class="badge badge-warning">지난 주 ${escapeHTML(String(p.prevWeekMissed.missedDays))}일 미완료 — 이번 주 세트 수는 그대로 유지됩니다. 코치 확인을 권장합니다.</div>`;
        }
    }

    // ACWR 배지 추가
    if (acwr > 1.5) {
        badgesHtml += `<div class="badge badge-danger">ACWR 부하 급증 (${acwr.toFixed(2)}): 부하가 빠르게 증가했습니다. 휴식 또는 강도 조정을 검토하세요.</div>`;
    } else if (acwr > 1.3) {
        badgesHtml += `<div class="badge badge-warning">ACWR 부하 증가 (${acwr.toFixed(2)}): 상체 운동 볼륨이 50% 감소합니다.</div>`;
    }

    badgeContainer.innerHTML = badgesHtml;

    const scheduleTitleEl = document.getElementById('scheduleTitle');
    if (scheduleTitleEl) {
        if (p.isUpgraded) {
            scheduleTitleEl.innerHTML = `맞춤형 1주일(7일) 스케줄 <span class="schedule-title-tag">[성장 레벨업 스케줄 적용]</span>`;
        } else {
            scheduleTitleEl.innerHTML = `맞춤형 1주일(7일) 스케줄`;
        }
    }

    // 7일치 전체 스케줄 확장 로직
    let baseSchedule = [];
    if (p.type === '타자') {
        // ── 타자 전용 3분기 스케줄 ──
        if (p.goal === '타구속도 향상') {
            baseSchedule = [
                { day: 'Day 1 (하체 파워 & 지면반발력)', exercises: [{ name: '스파이더맨 런지 & 흉추 회전', sets: 2, reps: '각 5회' }, { name: '스쿼트', sets: 3, reps: '5-6회' }, { name: '루마니안 데드리프트', sets: 3, reps: '6회' }, { name: '박스 점프', sets: 3, reps: '5회' }] },
                { day: 'Day 2 (회전 파워 & 배트 스피드)', exercises: [{ name: '스파이더맨 런지 & 흉추 회전', sets: 2, reps: '각 5회' }, { name: '메디신볼 로테이셔널 스로우', sets: 3, reps: '각 5회' }, { name: '메디신볼 슬램', sets: 3, reps: '8회' }, { name: '케틀벨 스윙', sets: 3, reps: '10회' }] },
                { day: 'Day 3 (적극적 회복 & 모빌리티)', exercises: [{ name: '브렛젤 스트레칭', sets: 2, reps: '각 60초' }, { name: '90/90 자세', sets: 2, reps: '각 60초' }, { name: '폼롤러 흉추 신전', sets: 2, reps: '15회' }, { name: '버드독', sets: 2, reps: '각 10회' }] },
                { day: 'Day 4 (편측성 폭발력)', exercises: [{ name: '스파이더맨 런지 & 흉추 회전', sets: 2, reps: '각 5회' }, { name: '불가리안 스플릿 스쿼트 점프', sets: 3, reps: '각 5회' }, { name: '덤벨 스내치', sets: 3, reps: '각 5회' }, { name: '스케이터 점프', sets: 3, reps: '각 5회' }] },
                { day: 'Day 5 (메디신볼 파워 & 항회전 코어)', exercises: [{ name: '스파이더맨 런지 & 흉추 회전', sets: 2, reps: '각 5회' }, { name: '메디신볼 샷풋 스로우', sets: 3, reps: '각 5회' }, { name: '메디신볼 슬램', sets: 3, reps: '8회' }, { name: '팔로프 프레스', sets: 3, reps: '각 10회' }] },
                { day: 'Day 6 (하체 스트렝스 & 안정성)', exercises: [{ name: '스파이더맨 런지 & 흉추 회전', sets: 2, reps: '각 5회' }, { name: '불가리안 스플릿 스쿼트', sets: 3, reps: '각 8회' }, { name: '루마니안 데드리프트', sets: 3, reps: '8회' }, { name: '데드버그', sets: 3, reps: '각 10회' }] },
                { day: 'Day 7 (완전 휴식)', exercises: [{ name: '휴식', sets: 0, reps: '0회' }] }
            ];
        } else if (p.goal === '컨택 능력') {
            baseSchedule = [
                { day: 'Day 1 (고관절-흉추 복합 가동성)', exercises: [{ name: '스파이더맨 런지 & 흉추 회전', sets: 3, reps: '각 6회' }, { name: '90/90 자세', sets: 3, reps: '각 60초' }, { name: '브렛젤 스트레칭', sets: 2, reps: '각 60초' }, { name: '버드독', sets: 3, reps: '각 10회' }] },
                { day: 'Day 2 (항회전 코어 & 배트 경로 안정성)', exercises: [{ name: '스파이더맨 런지 & 흉추 회전', sets: 2, reps: '각 5회' }, { name: '팔로프 프레스', sets: 3, reps: '각 12회' }, { name: '데드버그', sets: 3, reps: '각 10회' }, { name: '밴드 촙 & 리프트', sets: 3, reps: '각 10회' }] },
                { day: 'Day 3 (적극적 회복 & 모빌리티)', exercises: [{ name: '브렛젤 스트레칭', sets: 2, reps: '각 60초' }, { name: '90/90 자세', sets: 2, reps: '각 60초' }, { name: '폼롤러 흉추 신전', sets: 2, reps: '15회' }, { name: '글루트 브릿지', sets: 2, reps: '15회' }] },
                { day: 'Day 4 (편측 밸런스 & 스탠스 안정성)', exercises: [{ name: '스파이더맨 런지 & 흉추 회전', sets: 2, reps: '각 5회' }, { name: '불가리안 스플릿 스쿼트', sets: 3, reps: '각 10회' }, { name: '싱글레그 아이소메트릭 홀드', sets: 3, reps: '각 20초' }, { name: '팔로프 프레스', sets: 3, reps: '각 12회' }] },
                { day: 'Day 5 (회전 파워 & 코어)', exercises: [{ name: '스파이더맨 런지 & 흉추 회전', sets: 2, reps: '각 5회' }, { name: '메디신볼 로테이셔널 스로우', sets: 3, reps: '각 5회' }, { name: '케틀벨 스윙', sets: 3, reps: '10회' }, { name: '사이드 플랭크', sets: 3, reps: '각 40초' }] },
                { day: 'Day 6 (흉추-고관절 가동 & 발 민첩성)', exercises: [{ name: '스파이더맨 런지 & 흉추 회전', sets: 3, reps: '각 6회' }, { name: '폼롤러 흉추 신전', sets: 2, reps: '15회' }, { name: '90/90 자세', sets: 3, reps: '각 60초' }, { name: '데드버그', sets: 3, reps: '각 10회' }, { name: '래더 드릴', sets: 2, reps: '각 패턴 3회' }] },
                { day: 'Day 7 (완전 휴식)', exercises: [{ name: '휴식', sets: 0, reps: '0회' }] }
            ];
        } else {
            // 부상 방지
            baseSchedule = [
                { day: 'Day 1 (저부하 코어 & 안정성)', exercises: [{ name: '스파이더맨 런지 & 흉추 회전', sets: 2, reps: '각 5회' }, { name: '데드버그', sets: 3, reps: '각 10회' }, { name: '버드독', sets: 3, reps: '각 10회' }, { name: '90/90 자세', sets: 2, reps: '각 60초' }] },
                { day: 'Day 2 (하체 안정성 & 후면 사슬)', exercises: [{ name: '스파이더맨 런지 & 흉추 회전', sets: 2, reps: '각 5회' }, { name: '불가리안 스플릿 스쿼트', sets: 3, reps: '각 10회' }, { name: '루마니안 데드리프트', sets: 3, reps: '10-12회' }, { name: '글루트 브릿지', sets: 2, reps: '15회' }] },
                { day: 'Day 3 (적극적 회복 & 모빌리티)', exercises: [{ name: '브렛젤 스트레칭', sets: 2, reps: '각 60초' }, { name: '90/90 자세', sets: 2, reps: '각 60초' }, { name: '폼롤러 흉추 신전', sets: 2, reps: '15회' }, { name: '버드독', sets: 2, reps: '각 10회' }] },
                { day: 'Day 4 (항회전 코어 & 밸런스)', exercises: [{ name: '스파이더맨 런지 & 흉추 회전', sets: 2, reps: '각 5회' }, { name: '팔로프 프레스', sets: 3, reps: '각 12회' }, { name: '싱글레그 아이소메트릭 홀드', sets: 3, reps: '각 20초' }, { name: '데드버그', sets: 3, reps: '각 10회' }] },
                { day: 'Day 5 (가벼운 회전 파워 & 코어)', exercises: [{ name: '스파이더맨 런지 & 흉추 회전', sets: 2, reps: '각 5회' }, { name: '메디신볼 슬램', sets: 2, reps: '8회' }, { name: '케틀벨 스윙', sets: 3, reps: '10회' }, { name: '사이드 플랭크', sets: 3, reps: '각 40초' }] },
                { day: 'Day 6 (전신 가동성 & 저충격 컨디셔닝)', exercises: [{ name: '스파이더맨 런지 & 흉추 회전', sets: 3, reps: '각 6회' }, { name: '브렛젤 스트레칭', sets: 2, reps: '각 60초' }, { name: '90/90 자세', sets: 3, reps: '각 60초' }, { name: '데드버그', sets: 3, reps: '각 10회' }, { name: '점프로프', sets: 2, reps: '2분' }] },
                { day: 'Day 7 (완전 휴식)', exercises: [{ name: '휴식', sets: 0, reps: '0회' }] }
            ];
        }
    } else if (p.goal === '구속 향상') {
        baseSchedule = [
            { day: 'Day 1 (파워 & 지면반발력)', exercises: [{ name: '스파이더맨 런지 & 흉추 회전', sets: 2, reps: '각 5회' }, { name: '데스 점프', sets: 3, reps: '5회' }, { name: '트랩바(또는 덤벨) 데드리프트', sets: 3, reps: '5-8회' }, { name: '메디신볼 샷풋 스로우', sets: 3, reps: '각 6회' }] },
            { day: 'Day 2 (상체 파워 & 감속)', exercises: [{ name: '스파이더맨 런지 & 흉추 회전', sets: 2, reps: '각 5회' }, { name: '푸시업', sets: 3, reps: '최대' }, { name: '메디신볼 로테이셔널 스로우', sets: 3, reps: '각 5회' }, { name: '편심성 이두근 컬', sets: 3, reps: '10회' }] },
            { day: 'Day 3 (적극적 회복 & 모빌리티)', exercises: [{ name: '브렛젤 스트레칭', sets: 2, reps: '각 60초' }, { name: '90/90 자세', sets: 2, reps: '각 60초' }, { name: '폼롤러 흉추 신전', sets: 2, reps: '15회' }, { name: '버드독', sets: 2, reps: '각 10회' }] },
            { day: 'Day 4 (편측성 폭발력)', exercises: [{ name: '스파이더맨 런지 & 흉추 회전', sets: 2, reps: '각 5회' }, { name: '불가리안 스플릿 스쿼트 점프', sets: 3, reps: '각 6회' }, { name: '덤벨 스내치', sets: 3, reps: '각 6회' }, { name: '스케이터 점프', sets: 3, reps: '각 5회' }] },
            { day: 'Day 5 (회전 코어 & 힙 드라이브)', exercises: [{ name: '스파이더맨 런지 & 흉추 회전', sets: 2, reps: '각 5회' }, { name: '박스 점프', sets: 3, reps: '5회' }, { name: '케틀벨 스윙', sets: 3, reps: '10회' }, { name: '사이드 플랭크', sets: 3, reps: '각 45초' }] },
            { day: 'Day 6 (밸런스 & 안정성)', exercises: [{ name: '스파이더맨 런지 & 흉추 회전', sets: 2, reps: '각 5회' }, { name: '싱글레그 아이소메트릭 홀드', sets: 3, reps: '각 20초' }, { name: 'Y-레이즈', sets: 3, reps: '15회' }, { name: 'DNS 스타 플랭크', sets: 3, reps: '각 30초' }] },
            { day: 'Day 7 (완전 휴식)', exercises: [{ name: '휴식', sets: 0, reps: '0회' }] }
        ];
    } else if (p.goal === '제구 안정') {
        baseSchedule = [
            { day: 'Day 1 (지지발 안정성 & 항회전 코어)', exercises: [{ name: '스파이더맨 런지 & 흉추 회전', sets: 2, reps: '각 5회' }, { name: '싱글레그 아이소메트릭 홀드', sets: 3, reps: '각 20초' }, { name: '밴드 촙 & 리프트', sets: 3, reps: '각 10회' }, { name: '데드버그', sets: 3, reps: '각 10회' }] },
            { day: 'Day 2 (상체 가동성 & 견갑 안정화)', exercises: [{ name: '스파이더맨 런지 & 흉추 회전', sets: 2, reps: '각 5회' }, { name: '월 엔젤', sets: 3, reps: '15회' }, { name: '밴드 풀어파트', sets: 3, reps: '20회' }, { name: 'DNS 스타 플랭크', sets: 3, reps: '각 30초' }] },
            { day: 'Day 3 (적극적 회복 & 모빌리티)', exercises: [{ name: '브렛젤 스트레칭', sets: 2, reps: '각 60초' }, { name: '글루트 브릿지', sets: 2, reps: '15회' }, { name: '90/90 자세', sets: 2, reps: '각 60초' }, { name: '버드독', sets: 2, reps: '각 10회' }] },
            { day: 'Day 4 (후면 사슬 & 협응)', exercises: [{ name: '스파이더맨 런지 & 흉추 회전', sets: 2, reps: '각 5회' }, { name: '싱글레그 RDL', sets: 3, reps: '각 8회' }, { name: '고블릿 스쿼트 템포', sets: 3, reps: '10회' }, { name: '팔로프 프레스', sets: 3, reps: '각 12회' }] },
            { day: 'Day 5 (편측 밸런스 & 코어)', exercises: [{ name: '스파이더맨 런지 & 흉추 회전', sets: 2, reps: '각 5회' }, { name: '밴드 촙 & 리프트', sets: 3, reps: '각 10회' }, { name: '싱글레그 스쿼트', sets: 3, reps: '각 8회' }, { name: '런지', sets: 3, reps: '각 10회' }] },
            { day: 'Day 6 (어깨 가동성 & 미는 힘)', exercises: [{ name: '스파이더맨 런지 & 흉추 회전', sets: 2, reps: '각 5회' }, { name: '밴드 풀어파트', sets: 3, reps: '20회' }, { name: '월 엔젤', sets: 3, reps: '15회' }, { name: '푸시업', sets: 3, reps: '12회' }] },
            { day: 'Day 7 (완전 휴식)', exercises: [{ name: '휴식', sets: 0, reps: '0회' }] }
        ];
    } else {
        baseSchedule = [
            { day: 'Day 1 (어깨 감속기 & 하체 안정성)', exercises: [{ name: '스파이더맨 런지 & 흉추 회전', sets: 2, reps: '각 5회' }, { name: '리버스 스로우', sets: 3, reps: '10회' }, { name: '고블릿 스쿼트', sets: 3, reps: '12회' }, { name: '90/90 밴드 외회전', sets: 3, reps: '각 15회' }] },
            { day: 'Day 2 (후면 삼각근 & 팔꿈치 보호)', exercises: [{ name: '스파이더맨 런지 & 흉추 회전', sets: 2, reps: '각 5회' }, { name: '프론 YTWL', sets: 3, reps: '각 8회' }, { name: '편심성 이두근 컬', sets: 3, reps: '각 10회' }, { name: '프론 수평 외전', sets: 3, reps: '15초 유지' }] },
            { day: 'Day 3 (적극적 회복 & 모빌리티)', exercises: [{ name: '브렛젤 스트레칭', sets: 2, reps: '각 60초' }, { name: '슬리퍼 스트레치', sets: 2, reps: '각 30초' }, { name: '폼롤러 흉추 신전', sets: 2, reps: '15회' }, { name: '글루트 브릿지', sets: 2, reps: '15회' }] },
            { day: 'Day 4 (관절 안정화 & 밸런스)', exercises: [{ name: '스파이더맨 런지 & 흉추 회전', sets: 2, reps: '각 5회' }, { name: '싱글레그 아이소메트릭 홀드', sets: 3, reps: '각 20초' }, { name: '리버스 스로우', sets: 3, reps: '10회' }, { name: '팔로프 프레스', sets: 3, reps: '각 12회' }] },
            { day: 'Day 5 (감속기 및 관절 케어 연속)', exercises: [{ name: '스파이더맨 런지 & 흉추 회전', sets: 2, reps: '각 5회' }, { name: '루마니안 데드리프트', sets: 3, reps: '10-12회' }, { name: '편심성 이두근 컬', sets: 3, reps: '각 10회' }, { name: '프론 수평 외전', sets: 3, reps: '15초 유지' }] },
            { day: 'Day 6 (견갑 안정화 & 가동성)', exercises: [{ name: '스파이더맨 런지 & 흉추 회전', sets: 2, reps: '각 5회' }, { name: '월 엔젤', sets: 3, reps: '15회' }, { name: '슬리퍼 스트레치', sets: 2, reps: '각 30초' }, { name: 'Y-레이즈', sets: 3, reps: '12회' }] },
            { day: 'Day 7 (완전 휴식)', exercises: [{ name: '휴식', sets: 0, reps: '0회' }] }
        ];
    }

    // 보직(role) 및 시즌 상태(season)에 따른 스케줄 조정
    if (p.season === '시즌중') {
        // 시즌 중에는 웨이트 비중 감소, 회복 위주
        baseSchedule.forEach(day => {
            day.exercises.forEach(ex => {
                if (['스쿼트', '루마니안 데드리프트', '불가리안 스플릿 스쿼트', '덤벨 스내치'].includes(ex.name)) {
                    ex.sets = Math.max(1, ex.sets - 1); // 세트 수 감소
                }
            });
        });
        baseSchedule[3].day += ' (시즌중 볼륨 조절)';
    }

    if ((p.type || '투수') !== '타자') {
        // 투수 전용 보직별 컨디셔닝 배치
        if (p.role === '선발') {
            // 선발 투수: 하체 지구력 및 러닝 추가 (시즌중 볼륨 감소)
            const runSets = p.season === '시즌중' ? 3 : 5;
            baseSchedule[0].exercises.push({ name: '폴투폴 러닝', sets: runSets, reps: '왕복' });
            baseSchedule[4].exercises.push({ name: '인터벌 러닝', sets: runSets, reps: '30초 전력/30초 걷기' });
        } else if (p.role === '구원' || p.role === '마무리') {
            // 구원/마무리 투수: 단기 폭발력 및 연투 회복 (장거리 러닝 없음)
            baseSchedule[0].exercises.push({ name: '메디신볼 슬램', sets: 3, reps: '10회' });
            baseSchedule[2].exercises.push({ name: '튜빙 밴드 회전근개', sets: 3, reps: '15회' });
        }
    }

    // 정밀 평가 결과에 따른 취약점 보완 운동 추가 및 강등(Downgrade)
    if (p.scores) {
        // 하체 밸런스 부족 시 스쿼트 강등
        if (p.scores.hip <= 2 || p.scores.core <= 2) {
            baseSchedule.forEach(day => {
                day.exercises.forEach(ex => {
                    if (ex.name === '스쿼트') {
                        ex.name = '고블릿 스쿼트 (안정성 위주)';
                        ex.reps = '12-15회';
                    } else if (ex.name === '싱글레그 스쿼트') {
                        ex.name = '런지 (안정성 위주)';
                    }
                });
            });
        }

        // 어깨 가동성 부족 시 상체 운동 전 웜업 텍스트 추가
        if (p.scores.shoulder <= 2) {
            baseSchedule[1].exercises.unshift({ name: '월 엔젤 (필수 웜업)', sets: 2, reps: '15회' });
        }

        if (p.scores.thoracic <= 2) {
            if (!baseSchedule[2].exercises.some(e => e.name === 'Lying T-Spine Rotation')) {
                baseSchedule[2].exercises.push({ name: 'Lying T-Spine Rotation', sets: 2, reps: '각 10회' });
            }
            if (!baseSchedule[5].exercises.some(e => e.name === 'Open Book')) {
                baseSchedule[5].exercises.push({ name: 'Open Book', sets: 2, reps: '각 10회' });
            }
        }
        if (p.scores.hip <= 2) {
            if (!baseSchedule[0].exercises.some(e => e.name === '90/90 자세')) {
                baseSchedule[0].exercises.push({ name: '90/90 자세', sets: 2, reps: '각 60초' });
            }
            if (!baseSchedule[3].exercises.some(e => e.name === '90/90 자세')) {
                baseSchedule[3].exercises.push({ name: '90/90 자세', sets: 2, reps: '각 60초' });
            }
        }
        if (p.scores.core <= 2) {
            if (!baseSchedule[1].exercises.some(e => e.name === '데드버그')) {
                baseSchedule[1].exercises.push({ name: '데드버그', sets: 2, reps: '20회' });
            }
            if (!baseSchedule[4].exercises.some(e => e.name === '플랭크')) {
                baseSchedule[4].exercises.push({ name: '플랭크', sets: 2, reps: '45초' });
            }
        }
    }

    // 통증 부위에 따른 '적극적 재활' 루틴 강제 삽입 (웜업)
    if (!painAreas.includes('없음')) {
        baseSchedule.forEach(day => {
            if (painAreas.includes('어깨')) {
                day.exercises.unshift({ name: '튜빙 밴드 내/외회전 (재활)', sets: 2, reps: '초경량 15회' });
            }
            if (painAreas.includes('팔꿈치')) {
                day.exercises.unshift({ name: '전완근 아이소메트릭 홀드 (재활)', sets: 2, reps: '초경량 밴드 20-30초' });
            }
            if (painAreas.includes('허리')) {
                day.exercises.unshift({ name: '맥길 빅3 (버드독/사이드플랭크/컬업)', sets: 1, reps: '각 10회' });
            }
            if (painAreas.includes('무릎')) {
                day.exercises.unshift({ name: 'TKE (Terminal Knee Extension)', sets: 2, reps: '15회' });
            }
            if (painAreas.includes('손목')) {
                day.exercises.unshift({ name: '전완근 아이소메트릭 홀드 (재활)', sets: 2, reps: '초경량 밴드 20-30초' });
            }
            if (painAreas.includes('고관절')) {
                day.exercises.unshift({ name: '90/90 자세 (재활)', sets: 2, reps: '각 60초' });
            }
            if (painAreas.includes('발목')) {
                day.exercises.unshift({ name: '싱글레그 아이소메트릭 홀드 (재활)', sets: 2, reps: '각 20초' });
            }
        });
    }

    // 투구 워크로드 초과 시 오늘 부상 방지 및 회복 스케줄로 대체
    let isHighWorkloadReplaced = false;
    if (highWorkload && baseSchedule.length > currentDayIndex) {
        baseSchedule[currentDayIndex].day = `Day ${currentDayIndex + 1} — 회복·가동성 관리`;
        baseSchedule[currentDayIndex].exercises = [
            { name: '폼롤러 근막 이완 (전신)', sets: 1, reps: '10분' },
            { name: '슬리퍼 스트레치 (어깨 후면)', sets: 2, reps: '각 30초' },
            { name: '90/90 자세 (고관절 가동성)', sets: 2, reps: '각 60초' },
            { name: '가벼운 밴드 풀어파트', sets: 2, reps: '15회' },
            { name: '아이싱 및 휴식', sets: 1, reps: '15분' }
        ];
        isHighWorkloadReplaced = true;
    }

    if (!p.dailyCompletion) p.dailyCompletion = {};
    const totalDays = 7;
    const completedDays = Object.values(p.dailyCompletion).filter(v => v && v.completed).length;
    const progressPercent = Math.round((completedDays / totalDays) * 100);

    const safeSchedulePlayerIdArg = _escapeInlineJsString(p.id);
    const safeSchedulePlayerIdAttr = escapeHTML(p.id);

    // ── 오늘 요약 섹션 렌더 ──
    const summarySection = document.getElementById('todaySummarySection');
    if (summarySection) {
        if (isPreviewMode) {
            // weekStartDate가 미래 → 미리보기 상태 안내만 표시
            summarySection.style.display = 'block';
            summarySection.innerHTML = `
                <div class="today-summary-card">
                    <div class="schedule-preview-title">다음 주차 미리보기</div>
                    <div class="schedule-preview-help">내일부터 Day 1이 시작됩니다. 오늘은 훈련 완료가 불가합니다.</div>
                </div>
            `;
        } else {
            const todayPlan = baseSchedule[currentDayIndex];
            const todayExerciseNames = todayPlan
                ? todayPlan.exercises.filter(e => e.name !== '휴식').map(e => escapeHTML(e.name)).join(', ')
                : '휴식';
            const isTodayDone = p.dailyCompletion[currentDayIndex] && p.dailyCompletion[currentDayIndex].completed;
            const todayDoneText = isTodayDone ? '완료' : '미완료';
            const painStatusText = !painAreas.includes('없음') ? `통증: ${escapeHTML(painAreas.join(', '))}` : '통증 없음';
            const acwrStatusText = acwr > 1.5 ? 'ACWR 부하 급증' : acwr > 1.3 ? 'ACWR 부하 증가' : 'ACWR 권장 범위';
            const workloadBtnId = `todaySummaryWlBtn_${currentDayIndex}`;

            summarySection.style.display = 'block';
            summarySection.innerHTML = `
                <div class="today-summary-card">
                    <div class="today-summary-title">오늘(Day ${currentDayIndex + 1}) 요약</div>
                    <div class="today-summary-exercise"><strong>운동:</strong> ${todayExerciseNames}</div>
                    <div class="today-summary-meta">
                        <span>${todayDoneText}</span>
                        <span>|</span>
                        <span>${painStatusText}</span>
                        <span>|</span>
                        <span>${acwrStatusText}</span>
                    </div>
                    ${canCompleteScheduleDay(p, currentDayIndex) ? `<button id="${workloadBtnId}" class="btn btn-primary btn-sm today-summary-wl-btn" data-schedule-workload-action="open" data-player-id="${safeSchedulePlayerIdAttr}" data-day-index="${currentDayIndex}">워크로드 입력</button>` : ''}
                </div>
            `;
        }

        if (_todaySummaryWorkloadClickHandler) {
            summarySection.removeEventListener('click', _todaySummaryWorkloadClickHandler);
        }
        _todaySummaryWorkloadClickHandler = _handleScheduleWorkloadClick;
        summarySection.addEventListener('click', _todaySummaryWorkloadClickHandler);
    }

    // ── activeTab 초기값: 오늘에 해당하는 day, 없으면 0 ──
    let activeDayTab = baseSchedule.findIndex((_, i) => canCompleteScheduleDay(p, i));
    if (activeDayTab === -1) activeDayTab = Math.min(Math.max(0, currentDayIndex), 6);

    let scheduleHtml = `
        <div class="weekly-progress-card">
            <div class="weekly-progress-header">
                <span>이번 주 훈련 달성률</span>
                <span class="weekly-progress-value">${completedDays} / ${totalDays}일 (${progressPercent}%)</span>
            </div>
            <div class="weekly-progress-track">
                <div class="weekly-progress-bar" id="weeklyProgressBar"></div>
            </div>
        </div>
    `;

    // ── Day 탭 바 빌드 ──
    let tabBarHtml = `<div class="day-tab-bar" id="dayTabBar">`;
    baseSchedule.forEach((_, i) => {
        const isCompleted = p.dailyCompletion[i] && p.dailyCompletion[i].completed;
        const tabStatus = getScheduleStatus(p, i, null);
        let markClass = tabStatus === '잠금' ? 'mark-lock' : isCompleted ? 'mark-done' : tabStatus === '오늘' ? 'mark-today' : 'mark-open';
        let mark = `<span class="day-tab-status ${markClass}"></span>`;
        tabBarHtml += `<button class="day-tab-btn${i === activeDayTab ? ' active' : ''}" id="dayTab_${i}" data-schedule-tab-action="switch" data-player-id="${safeSchedulePlayerIdAttr}" data-day-index="${i}"><span class="day-tab-num">D${i + 1}</span><span class="day-tab-mark">${mark}</span></button>`;
    });
    tabBarHtml += `</div>`;
    scheduleHtml += tabBarHtml;

    _cachedDayExercises = {};
    baseSchedule.forEach((dayPlan, index) => {
        let exHtml = '';
        // 중복 운동 제거 로직
        let uniqueExercises = [];
        const seenNames = new Set();
        dayPlan.exercises.forEach(ex => {
            if (!seenNames.has(ex.name)) {
                seenNames.add(ex.name);
                uniqueExercises.push(ex);
            }
        });

        // 훈련 시간(trainingTime)에 따른 운동 종목 수 및 종류 유연성 확보
        if (uniqueExercises.length > 0 && uniqueExercises[0].name !== '휴식') {
            if (p.trainingTime === 30) {
                // 30분: 핵심 운동 2개만 남기고 제거 (시간 부족 시 종목 수 자체를 줄임)
                if (uniqueExercises.length > 2) {
                    uniqueExercises = uniqueExercises.slice(0, 2);
                }
            } else if (p.trainingTime === 90) {
                // 90분: 기존 운동 유지 + 코어/가동성 보강
                if (!seenNames.has('플랭크')) {
                    uniqueExercises.push({ name: '플랭크', sets: 3, reps: '60초' });
                    seenNames.add('플랭크');
                }
            } else if (p.trainingTime === 120) {
                // 120분: 기존 운동 유지 + 유산소 및 전신 회복 보강
                if (!seenNames.has('플랭크')) {
                    uniqueExercises.push({ name: '플랭크', sets: 3, reps: '60초' });
                    seenNames.add('플랭크');
                }
                if (!seenNames.has('폼롤러 흉추 신전')) {
                    uniqueExercises.push({ name: '폼롤러 흉추 신전', sets: 2, reps: '15회' });
                    seenNames.add('폼롤러 흉추 신전');
                }
            }
        }

        // 완료된 날의 스냅샷이 있으면 저장된 운동 목록 사용 (설정 변경 시에도 보호)
        const savedSnapshot = p.dailyCompletion[index] && p.dailyCompletion[index].exercises;
        const isSnapshotDay = savedSnapshot && savedSnapshot.length > 0;
        if (isSnapshotDay) {
            uniqueExercises = savedSnapshot;
        }
        let dayFinalExercises = [];

        uniqueExercises.forEach(ex => {
            // 스냅샷 데이터는 이미 최종 값이므로 변환 없이 직접 렌더링
            if (isSnapshotDay) {
                const eqTags = getEquipmentTags(ex.name || '');
                const snapshotName = _formatScheduleText(ex.name, '운동');
                const snapshotGuideNameAttr = escapeHTML(ex.name || '');
                const snapshotSetsText = _formatScheduleCount(ex.sets);
                const snapshotRepsText = _formatScheduleText(ex.reps, '-');
                const isSkipped = ex && ex.completed === false;
                const skippedClass = isSkipped ? ' exercise-item-skipped' : '';
                const skippedBadge = isSkipped ? '<span class="ex-skipped-badge">미수행</span>' : '';
                const skippedReasonLabel = isSkipped ? _getSkippedReasonLabel(ex && ex.skippedReason) : '';
                const skippedReasonBadge = skippedReasonLabel
                    ? `<span class="ex-skipped-reason-badge">${escapeHTML(skippedReasonLabel)}</span>`
                    : '';
                let volHtml = ex.name === '휴식' ? '' : `${snapshotSetsText}세트 x ${snapshotRepsText}`;
                exHtml += `
                    <li class="exercise-item${skippedClass}" data-schedule-guide-action="open" data-guide-name="${snapshotGuideNameAttr}">
                        <div class="ex-name">
                            <div class="exercise-item-wrapper">
                                <div class="exercise-title-row">
                                    <span class="ex-icon"></span><span class="exercise-title">${snapshotName}</span>
                                </div>
                                <div class="exercise-item-meta">${eqTags}${skippedBadge}${skippedReasonBadge}</div>
                            </div>
                        </div>
                        <div class="ex-vol">${volHtml}</div>
                    </li>
                `;
                return;
            }
            let originalName = ex.name;
            let finalName = ex.name;
            let finalSets = _normalizeScheduleSets(ex.sets);
            let finalReps = ex.reps;
            originalName = originalName || '';
            finalName = finalName || '';
            finalReps = String(finalReps ?? '');
            let isReplaced = false;
            let matchedPain = '';

            // 구력(exp)에 따른 반복수 및 강도 조절
            if (p.exp < 1 && finalName !== '휴식' && !finalReps.includes('초') && !finalReps.includes('분')) {
                // 초보자: 고반복, 맨몸 위주 텍스트
                if (finalReps.includes('-')) {
                    finalReps = '15회 (가볍게)';
                } else if (!finalReps.includes('최대')) {
                    finalReps = parseInt(finalReps) + 5 + '회 (가볍게)';
                }
            } else if (p.exp >= 3 && finalName !== '휴식' && !finalReps.includes('초') && !finalReps.includes('분')) {
                // 숙련자: 저반복, 고중량 텍스트
                if (['스쿼트', '데드리프트', '런지', '덤벨 로우', '푸시업'].some(n => finalName.includes(n))) {
                    finalReps = '5-8회 (고중량)';
                }
            }

            // ACWR 기반 부분 디로딩 (주의 영역 1.3 ~ 1.5)
            let isAcwrDeloaded = false;
            let preAcwrSets = finalSets;
            if (acwr > 1.3 && acwr <= 1.5 && finalName !== '휴식') {
                // 상체(어깨/팔꿈치) 개입 운동 볼륨 50% 감소
                if (['푸시업', '덤벨 로우', '월 엔젤', 'Y-레이즈', '밴드 풀어파트', '슬리퍼 스트레치', '메디신볼 로테이셔널 스로우', '덤벨 스내치'].includes(finalName)) {
                    finalSets = Math.max(1, Math.ceil(finalSets / 2));
                    isAcwrDeloaded = true;
                }
            }

            // 훈련 시간(trainingTime)에 따른 세트 수 조정
            if (p.trainingTime === 120 && finalName !== '휴식') {
                finalSets += 1;
            } else if (p.trainingTime === 90 && ['플랭크', '데드버그', '팔로프 프레스', '버드독'].includes(finalName)) {
                finalSets += 1; // 90분은 코어 운동 세트 추가
            }

            // 연령대에 따른 세트/반복수 조정 (U-12는 세트 수 감소)
            if (p.age === 'U-12' && finalName !== '휴식') {
                finalSets = Math.max(1, finalSets - 1);
            }

            if (p.isUpgraded && ['스쿼트', '루마니안 데드리프트', '불가리안 스플릿 스쿼트', '풀업', '고블릿 스쿼트', '푸시업', '팔로프 프레스'].includes(ex.name)) {
                finalSets += 1;
            }

            let preVolDownSets = finalSets;
            let isVolDownApplied = false;
            if (volDown && finalName !== '휴식') {
                finalSets = Math.max(1, finalSets - 1);
                if (finalSets < preVolDownSets) isVolDownApplied = true;
            }

            // 다중 통증 부위 처리: 운동의 avoid 속성이 통증 부위 배열에 포함되어 있는지 확인
            if (!painAreas.includes('없음') && exerciseDB[ex.name] && painAreas.includes(exerciseDB[ex.name].avoid)) {
                // 대체 운동 선택 로직: 첫 번째로 매칭되는 통증 부위의 대체 운동 사용
                matchedPain = painAreas.find(pain => exerciseDB[ex.name].avoid === pain);
                const replacements = replacementDB[matchedPain] || ['플랭크'];
                // contextCondition:'pain' 태그 운동 우선 선택 (부상 특화 재활 운동)
                const painSafeOptions = replacements.filter(name => exerciseDB[name] && exerciseDB[name].contextCondition === 'pain' && !seenNames.has(name));
                const poolToUse = painSafeOptions.length > 0 ? painSafeOptions : replacements;
                const hashIndex = simpleHash(p.id + ex.name + matchedPain) % poolToUse.length;
                finalName = poolToUse[hashIndex];
                isReplaced = true;
            }

            // ACWR 위험 구간(>1.3): contextCondition='normal'인 고강도 운동을 회복 운동으로 대체
            let isAcwrReplaced = false;
            let acwrScoreResult = null;
            if (!isReplaced && acwr > 1.3) {
                const exData = exerciseDB[finalName];
                if (exData && exData.contextCondition === 'normal') {
                    const swapOptions = exerciseSwapDB[finalName];
                    if (swapOptions) {
                        const recoveryOptions = swapOptions.filter(name =>
                            exerciseDB[name]
                            && (exerciseDB[name].contextCondition === 'recovery' || exerciseDB[name].contextCondition === 'pain')
                            && !seenNames.has(name)
                        );
                        const rankedRecoveryOptions = _rankScheduleRecoverySwapOptions(recoveryOptions, p, index, finalName);
                        const recoverySwap = rankedRecoveryOptions[0];
                        if (recoverySwap) {
                            if (exerciseDB[recoverySwap]) {
                                const acwrScoreContext = _getScheduleRecoveryScoreContext(p, finalName);
                                acwrScoreResult = _scoreExerciseForPlayer(recoverySwap, exerciseDB[recoverySwap], p, acwrScoreContext);
                            }
                            finalName = recoverySwap;
                            isReplaced = true;
                            isAcwrReplaced = true;
                        }
                    }
                }
            }

            // 대체 후에도 중복되는지 확인
            if (isReplaced && seenNames.has(finalName)) {
                return; // 이미 스케줄에 있는 운동이면 건너뜀
            }
            if (isReplaced) {
                seenNames.add(finalName);
            }

            let isSwapped = false;
            // 통증으로 인한 교체가 아닐 때만 사용자가 선택한 스왑 적용
            if (!isReplaced) {
                const swapData = getSwappedExercise(p.id, index, originalName);
                if (swapData) {
                    finalName = swapData.replacement;
                    isSwapped = true;
                }
            }

            if (!isSnapshotDay && !isReplaced && !isSwapped && !isAcwrDeloaded && !isVolDownApplied && finalName !== '휴식') {
                const userTypeModifier = _getUserTypeScheduleModifier(p, finalName, exerciseDB[finalName], {
                    trainingTime: p.trainingTime,
                    highWorkload: acwr > 1.3,
                    isGameDay: false
                });
                if (userTypeModifier.setDelta !== 0) {
                    finalSets = Math.max(1, finalSets + userTypeModifier.setDelta);
                }
            }

            const safeOriginalName = escapeHTML(originalName);
            const safeFinalName = escapeHTML(finalName);
            const safeMatchedPain = escapeHTML(matchedPain);
            const displayVolumeBody = _formatExerciseVolumeForDisplay(exerciseDB[finalName], finalReps);
            const safeFinalReps = escapeHTML(displayVolumeBody);
            const safeFinalSets = _formatScheduleCount(finalSets);
            const safePreAcwrSets = _formatScheduleCount(preAcwrSets);
            const safePreVolDownSets = _formatScheduleCount(preVolDownSets);
            const guideFinalNameAttr = escapeHTML(finalName || '');
            const swapOriginalNameAttr = escapeHTML(originalName || '');
            const safePlayerIdAttr = escapeHTML(p.id);

            let nameHtml = `<span class="ex-icon"></span><span class="exercise-title">${safeFinalName}</span>`;
            if (isReplaced && isAcwrReplaced) {
                nameHtml = `
                    <span class="ex-icon"></span>
                    <del class="schedule-original-name">${safeOriginalName}</del>
                    <span class="exercise-title exercise-title--acwr-replaced">[ACWR 부하 조정] ${safeFinalName}</span>
                `;
            } else if (isReplaced) {
                nameHtml = `
                    <span class="ex-icon"></span>
                    <del class="schedule-original-name">${safeOriginalName}</del>
                    <span class="exercise-title exercise-title--pain-replaced">[${safeMatchedPain} 보호] ${safeFinalName}</span>
                `;
            } else if (isSwapped) {
                nameHtml = `
                    <span class="ex-icon"></span>
                    <del class="schedule-original-name">${safeOriginalName}</del>
                    <span class="exercise-title exercise-title--swapped">${safeFinalName}</span>
                    <span class="swapped-indicator">대체됨</span>
                `;
            }

            const eqTags = getEquipmentTags(finalName);
            const canSwap = !isReplaced && finalName !== '휴식' && index >= currentDayIndex;
            const safeDayIndex = _isValidScheduleDayIndex(index) ? index : 0;
            const swapBtn = canSwap && _isValidScheduleDayIndex(index)
                ? `<button class="ex-swap-btn" data-schedule-swap-action="open" data-player-id="${safePlayerIdAttr}" data-day-index="${safeDayIndex}" data-ex-name="${swapOriginalNameAttr}">대체</button>`
                : '';

            const scheduleReasonLabels = (isReplaced && isAcwrReplaced)
                ? _getExerciseMatchReasonLabels(acwrScoreResult)
                : [];
            const scheduleReasonHtml = scheduleReasonLabels.length
                ? `<span class="schedule-match-reasons">${scheduleReasonLabels.map(label => `<span class="schedule-match-reason">${escapeHTML(label)}</span>`).join('')}</span>`
                : '';

            let suggestedSwapHtml = '';
            if (!isSnapshotDay && !isReplaced && !isSwapped && !isAcwrDeloaded && !isVolDownApplied && finalName !== '휴식') {
                const safeSuggestedSwap = _getScheduleAutoSwapCandidate(p, index, finalName, seenNames);
                const suggestedSwap = safeSuggestedSwap || _getScheduleSuggestedSwapCandidate(p, index, finalName);
                if (suggestedSwap && suggestedSwap.name) {
                    suggestedSwapHtml = `<div class="schedule-suggested-swap">유형·목적에 맞는 대체 후보: <span>${escapeHTML(suggestedSwap.name)}</span> · 적용은 대체 버튼에서 선택</div>`;
                }
            }

            nameHtml = `
                <div class="exercise-item-wrapper">
                    <div class="exercise-title-row">${nameHtml}</div>
                    <div class="exercise-item-meta">${eqTags}${scheduleReasonHtml}${suggestedSwapHtml}</div>
                    ${swapBtn}
                </div>
            `;

            let volHtml = finalName === '휴식' ? '' : `${safeFinalSets}세트 x ${safeFinalReps}`;
            if (isAcwrDeloaded && !isReplaced && finalName !== '휴식') {
                volHtml = `
                    <del class="schedule-vol-original">${safePreAcwrSets}세트</del>
                    <span class="schedule-vol-adjusted">${safeFinalSets}세트 (ACWR 디로딩)</span> x ${safeFinalReps}
                `;
            } else if (isVolDownApplied && !isReplaced && finalName !== '휴식') {
                volHtml = `
                    <del class="schedule-vol-original">${safePreVolDownSets}세트</del>
                    <span class="schedule-vol-adjusted">${safeFinalSets}세트</span> x ${safeFinalReps}
                `;
            }

            exHtml += `
                <li class="exercise-item" data-schedule-guide-action="open" data-guide-name="${guideFinalNameAttr}">
                    <div class="ex-name">
                        ${nameHtml}
                    </div>
                    <div class="ex-vol">${volHtml}</div>
                </li>
            `;
            dayFinalExercises.push({ name: finalName, sets: finalSets, reps: String(finalReps) });
        });
        if (!isSnapshotDay) {
            _cachedDayExercises[index] = dayFinalExercises;
        }
        const completionData = p.dailyCompletion[index];
        const isCompleted = completionData && completionData.completed;

        const dayStatus = getScheduleStatus(p, index, dayFinalExercises);
        const {
            cardModifier,
            headerModifier,
            btnClass,
            btnText,
            btnDisabled,
            btnAction,
            dayHeaderExtra,
            tabHiddenClass,
        } = _getScheduleDayRenderState(dayStatus, isCompleted, index, activeDayTab, safeSchedulePlayerIdAttr);

        let bannerHtml = '';
        if (dayStatus === '오늘') {
            if (isHighWorkloadReplaced) {
                bannerHtml = `
                    <div class="schedule-adjustment-banner schedule-adjustment-banner--danger">
                        <div><strong>스케줄 전면 대체됨:</strong> 어제 투구 워크로드 초과로 인해 오늘 훈련이 '회복·가동성 관리' 프로그램으로 변경되었습니다.</div>
                    </div>
                `;
            } else if (isToday && (!painAreas.includes('없음') || volDown)) {
                let reasons = [];
                if (!painAreas.includes('없음')) reasons.push(`통증(${escapeHTML(painAreas.join(', '))})으로 인한 운동 대체`);
                if (volDown) reasons.push(`컨디션 저하로 인한 세트 수 감소`);

                if (reasons.length > 0) {
                    bannerHtml = `
                        <div class="schedule-adjustment-banner schedule-adjustment-banner--warning">
                            <div><strong>스케줄 부분 조정됨:</strong> ${reasons.join(' 및 ')}가 적용되었습니다.</div>
                        </div>
                    `;
                }
            }
        }

        scheduleHtml += `
            <div class="schedule-day ${cardModifier} ${tabHiddenClass}" id="scheduleDay_${index}">
                <div class="day-header ${headerModifier}">
                    <div><span>${escapeHTML(dayPlan.day)}</span>${dayHeaderExtra}</div>
                    <button ${btnAction} class="btn ${btnClass} schedule-day-btn" ${btnDisabled}>
                        ${btnText}
                    </button>
                </div>
                ${bannerHtml}
                <ul class="exercise-list">${exHtml}</ul>
            </div>
        `;
    });
    scheduleContainer.innerHTML = scheduleHtml;

    const weeklyProgressBar = scheduleContainer.querySelector('#weeklyProgressBar');
    if (weeklyProgressBar) {
        weeklyProgressBar.style.width = `${progressPercent}%`;
    }

    if (_scheduleWorkloadClickHandler) {
        scheduleContainer.removeEventListener('click', _scheduleWorkloadClickHandler);
    }
    _scheduleWorkloadClickHandler = _handleScheduleWorkloadClick;
    scheduleContainer.addEventListener('click', _scheduleWorkloadClickHandler);

    if (_scheduleTabClickHandler) {
        scheduleContainer.removeEventListener('click', _scheduleTabClickHandler);
    }
    _scheduleTabClickHandler = _handleScheduleTabClick;
    scheduleContainer.addEventListener('click', _scheduleTabClickHandler);

    if (_scheduleGuideClickHandler) {
        scheduleContainer.removeEventListener('click', _scheduleGuideClickHandler);
    }
    _scheduleGuideClickHandler = _handleScheduleGuideClick;
    scheduleContainer.addEventListener('click', _scheduleGuideClickHandler);

    if (_scheduleSwapClickHandler) {
        scheduleContainer.removeEventListener('click', _scheduleSwapClickHandler);
    }
    _scheduleSwapClickHandler = _handleScheduleSwapClick;
    scheduleContainer.addEventListener('click', _scheduleSwapClickHandler);
}

let currentWorkloadDayIndex = 0;
let _cachedDayExercises = {};
let currentWorkloadEditDate = null;
let currentWorkloadEditMode = 'current-day'; // 'current-day' | 'history'

// ── 기록 수정/삭제 Helper ────────────────────────────────────────
function isDateInCurrentWeek(player, dateStr) {
    if (!player.weekStartDate) return false;
    const start = new Date(player.weekStartDate);
    const target = new Date(dateStr);
    const diff = Math.round((target - start) / 86400000);
    return diff >= 0 && diff <= 6;
}

function getCompletionEntryByDate(player, dateStr) {
    return (player.completionHistory && player.completionHistory[dateStr]) || null;
}

function getRecordStreak(player) {
    if (!player) return 0;

    // 활동 날짜 Set 구성 (read-only — 데이터 수정 없음)
    const activeDates = new Set();
    if (player.completionHistory && !Array.isArray(player.completionHistory)) {
        Object.keys(player.completionHistory).forEach(d => activeDates.add(d));
    }
    if (Array.isArray(player.workloadHistory)) {
        player.workloadHistory.forEach(entry => {
            if (entry && entry.date) activeDates.add(entry.date);
        });
    }

    if (activeDates.size === 0) return 0;

    const today = getTodayStr();
    let cursor;
    if (activeDates.has(today)) {
        cursor = parseLocalDate(today);
    } else {
        // 오늘 기록 없으면 어제부터 시도
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = getLocalDateStr(yesterday);
        if (!activeDates.has(yesterdayStr)) return 0;
        cursor = parseLocalDate(yesterdayStr);
    }

    let count = 0;
    while (activeDates.has(getLocalDateStr(cursor))) {
        count++;
        cursor.setDate(cursor.getDate() - 1);
    }
    return count;
}

function getWorkloadEntryByDate(player, dateStr) {
    return (player.workloadHistory && player.workloadHistory.find(w => w.date === dateStr)) || null;
}

function upsertCompletionHistoryEntry(player, dateStr, payload) {
    if (!player.completionHistory) player.completionHistory = {};
    player.completionHistory[dateStr] = Object.assign({}, player.completionHistory[dateStr], payload);
}

function upsertWorkloadHistoryEntry(player, dateStr, workload) {
    if (!player.workloadHistory) player.workloadHistory = [];
    const existing = player.workloadHistory.find(w => w.date === dateStr);
    if (existing) {
        existing.workload = workload;
    } else {
        player.workloadHistory.push({ date: dateStr, workload });
    }
}

function syncDailyCompletionForDate(player, dateStr, payloadOrNull) {
    const dayIdx = getDayIndexForDate(player, dateStr);
    if (dayIdx < 0 || dayIdx > 6) return;
    if (!player.dailyCompletion) player.dailyCompletion = {};
    if (payloadOrNull === null) {
        delete player.dailyCompletion[dayIdx];
    } else {
        player.dailyCompletion[dayIdx] = Object.assign({}, player.dailyCompletion[dayIdx], { completed: true }, payloadOrNull);
    }
}

function getDayIndexForDate(player, dateStr) {
    if (!isDateInCurrentWeek(player, dateStr)) return -1;
    const start = new Date(player.weekStartDate);
    const target = new Date(dateStr);
    return Math.round((target - start) / 86400000);
}

function removeHistoryEntryByDate(player, dateStr) {
    if (player.completionHistory) delete player.completionHistory[dateStr];
    if (player.workloadHistory) {
        player.workloadHistory = player.workloadHistory.filter(w => w.date !== dateStr);
    }
    syncDailyCompletionForDate(player, dateStr, null);
}

function deleteHistoryEntry(playerId, dateStr) {
    const p = players.find(p => String(p.id) === String(playerId));
    if (!p) return;
    let entry = getCompletionEntryByDate(p, dateStr);
    const dayIdx = getDayIndexForDate(p, dateStr);
    if (!entry && dayIdx >= 0 && p.dailyCompletion && p.dailyCompletion[dayIdx] && p.dailyCompletion[dayIdx].completed) {
        entry = p.dailyCompletion[dayIdx];
    }
    const wEntry = getWorkloadEntryByDate(p, dateStr);
    const rpe = entry ? entry.rpe : '?';
    const pitchCount = entry ? entry.pitchCount : '?';
    const workload = (entry && entry.workload !== undefined) ? entry.workload : (wEntry ? wEntry.workload : '?');
    const inCurrentWeek = isDateInCurrentWeek(p, dateStr);
    const weekNote = inCurrentWeek ? '\n현재 주차 기록이므로 카드/달력 상태도 함께 초기화됩니다.' : '';
    customConfirm(
        `${dateStr} 기록을 삭제하시겠습니까?\n삭제 대상: RPE ${rpe} / 투구·스윙 ${pitchCount} / WL ${workload}${weekNote}`,
        () => {
            const prevPlayerSnapshot = typeof structuredClone === 'function'
                ? structuredClone(p)
                : JSON.parse(JSON.stringify(p));
            removeHistoryEntryByDate(p, dateStr);
            if (!saveDB()) {
                Object.keys(p).forEach(key => delete p[key]);
                Object.assign(p, prevPlayerSnapshot);
                renderBackupStorageStatus();
                return;
            }
            const panel = document.getElementById('dayDetailPanel');
            if (panel) panel.style.display = 'none';
            renderResult();
        }
    );
}
// ────────────────────────────────────────────────────────────────

const ALLOWED_SKIPPED_REASONS = ['', 'time', 'pain', 'equipment', 'fatigue', 'coach', 'other'];

const SKIPPED_REASON_LABELS = {
    time: '시간 부족',
    pain: '통증/불편감',
    equipment: '장비 없음',
    fatigue: '피로 누적',
    coach: '코치 지시',
    other: '기타'
};

function _normalizeSkippedReason(value) {
    if (typeof value !== 'string') return '';
    const normalized = value.trim();
    return ALLOWED_SKIPPED_REASONS.includes(normalized) ? normalized : '';
}

function _getSkippedReasonLabel(value) {
    const normalized = _normalizeSkippedReason(value);
    return normalized ? (SKIPPED_REASON_LABELS[normalized] || '') : '';
}

function _normalizeExerciseCompletionFlag(ex) {
    return !(ex && ex.completed === false);
}

const EXERCISE_METADATA_ALLOWED = {
    userTypeFit: ['youth_student', 'adult_amateur', 'recreational'],
    trainingFocusFit: ['performance', 'conditioning', 'recovery', 'mobility', 'game_ready', 'general_fitness'],
    intensityTier: ['low', 'medium', 'high'],
    skillTier: ['easy', 'moderate', 'advanced'],
    movementPattern: ['squat', 'hinge', 'push', 'pull', 'rotate', 'carry', 'jump', 'sprint', 'mobility', 'core', 'recovery', 'conditioning'],
    ageFit: ['U-12', 'U-15', 'U-18', 'adult', 'all'],
    roleFit: ['pitcher', 'batter', 'both'],
    equipmentLevel: ['none', 'light', 'gym', 'field'],
    matchTags: ['low-setup', 'low-impact', 'game-day', 'warmup', 'shoulder-care', 'hip-mobility', 'ankle-mobility', 'thoracic-mobility', 'core-stability', 'landing-control', 'deceleration', 'baseball-rotation']
};

function _normalizeExerciseMetadataArray(value, allowedValues) {
    if (!Array.isArray(value)) return [];
    const allowed = Array.isArray(allowedValues) ? allowedValues : [];
    const seen = new Set();
    const out = [];
    for (const item of value) {
        if (typeof item !== 'string') continue;
        const trimmed = item.trim();
        if (!trimmed) continue;
        if (!allowed.includes(trimmed)) continue;
        if (seen.has(trimmed)) continue;
        seen.add(trimmed);
        out.push(trimmed);
    }
    return out;
}

function _normalizeExerciseMetadataValue(value, allowedValues) {
    if (typeof value !== 'string') return '';
    const trimmed = value.trim();
    const allowed = Array.isArray(allowedValues) ? allowedValues : [];
    return allowed.includes(trimmed) ? trimmed : '';
}

function _getPlayerRoleFitValue(player) {
    return (player && player.type) === '타자' ? 'batter' : 'pitcher';
}

function _getPlayerAgeFitValue(player) {
    if (!player || typeof player.age !== 'string') return '';
    const age = player.age.trim();
    if (age === '성인') return 'adult';
    if (age === 'U-12' || age === 'U-15' || age === 'U-18') return age;
    return '';
}

function _normalizeExerciseMetadata(exData) {
    const base = {
        userTypeFit: [],
        trainingFocusFit: [],
        intensityTier: '',
        skillTier: '',
        movementPattern: [],
        ageFit: [],
        roleFit: '',
        equipmentLevel: '',
        matchTags: []
    };
    if (!exData || typeof exData !== 'object') return base;
    return {
        userTypeFit: _normalizeExerciseMetadataArray(exData.userTypeFit, EXERCISE_METADATA_ALLOWED.userTypeFit),
        trainingFocusFit: _normalizeExerciseMetadataArray(exData.trainingFocusFit, EXERCISE_METADATA_ALLOWED.trainingFocusFit),
        intensityTier: _normalizeExerciseMetadataValue(exData.intensityTier, EXERCISE_METADATA_ALLOWED.intensityTier),
        skillTier: _normalizeExerciseMetadataValue(exData.skillTier, EXERCISE_METADATA_ALLOWED.skillTier),
        movementPattern: _normalizeExerciseMetadataArray(exData.movementPattern, EXERCISE_METADATA_ALLOWED.movementPattern),
        ageFit: _normalizeExerciseMetadataArray(exData.ageFit, EXERCISE_METADATA_ALLOWED.ageFit),
        roleFit: _normalizeExerciseMetadataValue(exData.roleFit, EXERCISE_METADATA_ALLOWED.roleFit),
        equipmentLevel: _normalizeExerciseMetadataValue(exData.equipmentLevel, EXERCISE_METADATA_ALLOWED.equipmentLevel),
        matchTags: _normalizeExerciseMetadataArray(exData.matchTags, EXERCISE_METADATA_ALLOWED.matchTags)
    };
}

function _getUserTypeScheduleModifier(player, exName, exData, context) {
    const result = { setDelta: 0, scoreDelta: 0, excluded: false, reasons: [] };
    const userType = _normalizeUserType(player && player.userType);
    if (!userType || userType === 'coach' || userType === 'guardian') {
        return result;
    }
    const metadata = _normalizeExerciseMetadata(exData);
    const ctx = (context && typeof context === 'object') ? context : {};
    const trainingTime = (typeof ctx.trainingTime === 'number')
        ? ctx.trainingTime
        : ((player && typeof player.trainingTime === 'number') ? player.trainingTime : null);
    const trainingFocus = _normalizeTrainingFocus(player && player.trainingFocus);

    const isHigh = metadata.intensityTier === 'high';
    const isAdvanced = metadata.skillTier === 'advanced';
    const isEasyOrModerate = metadata.skillTier === 'easy' || metadata.skillTier === 'moderate';
    const equipmentLight = metadata.equipmentLevel === 'none' || metadata.equipmentLevel === 'light';

    if (userType === 'youth_student') {
        if (isHigh && isAdvanced) {
            result.excluded = true;
            result.scoreDelta -= 6;
            result.reasons.push('userType:youth-high-advanced');
        }
        if (isHigh) {
            result.setDelta -= 1;
            result.scoreDelta -= 2;
            result.reasons.push('userType:youth-high-intensity-down');
        }
        if (isEasyOrModerate) {
            result.scoreDelta += 1;
            result.reasons.push('userType:youth-skill-fit');
        }
        const foundationKeys = ['core', 'mobility', 'recovery', 'conditioning', 'landing-control', 'core-stability', 'warmup', 'low-impact', 'low-setup'];
        const hasFoundation = foundationKeys.some(k => metadata.movementPattern.includes(k) || metadata.matchTags.includes(k));
        if (hasFoundation) {
            result.scoreDelta += 1;
            result.reasons.push('userType:youth-foundation-fit');
        }
        if (equipmentLight) {
            result.scoreDelta += 1;
            result.reasons.push('userType:youth-equipment-fit');
        }
    } else if (userType === 'adult_amateur') {
        if (metadata.userTypeFit.includes('adult_amateur')) {
            result.scoreDelta += 2;
            result.reasons.push('userType:adult-fit');
        }
        if (typeof trainingTime === 'number' && trainingTime <= 45 && metadata.matchTags.includes('low-setup')) {
            result.scoreDelta += 1;
            result.reasons.push('userType:adult-time-fit');
        }
        if (trainingFocus === 'game_ready' && (metadata.matchTags.includes('warmup') || metadata.matchTags.includes('game-day'))) {
            result.scoreDelta += 1;
            result.reasons.push('userType:adult-game-ready-fit');
        }
    } else if (userType === 'recreational') {
        if (metadata.userTypeFit.includes('recreational')) {
            result.scoreDelta += 2;
            result.reasons.push('userType:recreational-fit');
        }
        if (metadata.matchTags.includes('low-setup') || metadata.matchTags.includes('low-impact')) {
            result.scoreDelta += 2;
            result.reasons.push('userType:recreational-low-burden');
        }
        if (equipmentLight) {
            result.scoreDelta += 1;
            result.reasons.push('userType:recreational-equipment-fit');
        }
        if (metadata.trainingFocusFit.includes('general_fitness')) {
            result.scoreDelta += 1;
            result.reasons.push('userType:recreational-general-fit');
        }
        if (isHigh) {
            result.setDelta -= 1;
            result.scoreDelta -= 2;
            result.reasons.push('userType:recreational-high-intensity-down');
        }
        if (isAdvanced) {
            result.scoreDelta -= 2;
            result.reasons.push('userType:recreational-advanced-down');
        }
    }

    return result;
}

function _scoreExerciseForPlayer(exName, exData, player, context) {
    const ctx = (context && typeof context === 'object') ? context : {};
    const metadata = _normalizeExerciseMetadata(exData);
    const result = { score: 0, excluded: false, reasons: [] };

    const painArea = (ctx.painArea && typeof ctx.painArea === 'string')
        ? ctx.painArea
        : (player && player.wellness && typeof player.wellness.painArea === 'string' ? player.wellness.painArea : '');
    const avoidValue = (exData && typeof exData.avoid === 'string') ? exData.avoid : '';
    if (painArea && avoidValue && avoidValue !== '없음' && avoidValue === painArea) {
        result.excluded = true;
        result.reasons.push('hard:pain-area-match');
    }

    const exContextCondition = (exData && typeof exData.contextCondition === 'string') ? exData.contextCondition : '';
    if (ctx.highWorkload === true && exContextCondition === 'normal' && metadata.intensityTier === 'high') {
        result.excluded = true;
        result.reasons.push('hard:high-workload-high-intensity');
    }

    const playerUserType = _normalizeUserType(player && player.userType);
    if (playerUserType === 'youth_student' && metadata.intensityTier === 'high' && metadata.skillTier === 'advanced') {
        result.excluded = true;
        result.reasons.push('hard:youth-high-advanced');
    }

    const playerRole = _getPlayerRoleFitValue(player);
    if (metadata.roleFit && (metadata.roleFit === playerRole || metadata.roleFit === 'both')) {
        result.score += 2;
        result.reasons.push('roleFit:+2');
    }

    const playerFocus = _normalizeTrainingFocus(player && player.trainingFocus);
    if (playerFocus && metadata.trainingFocusFit.includes(playerFocus)) {
        result.score += 3;
        result.reasons.push('trainingFocusFit:+3');
    }

    if (playerUserType && playerUserType !== 'coach' && playerUserType !== 'guardian'
        && metadata.userTypeFit.includes(playerUserType)) {
        result.score += 2;
        result.reasons.push('userTypeFit:+2');
    }

    const playerAge = _getPlayerAgeFitValue(player);
    if (metadata.ageFit.includes('all') || (playerAge && metadata.ageFit.includes(playerAge))) {
        result.score += 2;
        result.reasons.push('ageFit:+2');
    }

    const preferContext = (ctx.preferContextCondition && typeof ctx.preferContextCondition === 'string') ? ctx.preferContextCondition : '';
    if (preferContext && exContextCondition && preferContext === exContextCondition) {
        result.score += 2;
        result.reasons.push('contextCondition:+2');
    }

    const evidence = (exData && typeof exData.evidenceLevel === 'string') ? exData.evidenceLevel.trim() : '';
    if (evidence === 'A') {
        result.score += 2;
        result.reasons.push('evidenceLevel:A:+2');
    } else if (evidence === 'B') {
        result.score += 1;
        result.reasons.push('evidenceLevel:B:+1');
    }

    const trainingTime = Number(player && player.trainingTime);
    if (Number.isFinite(trainingTime) && trainingTime <= 30 && metadata.matchTags.includes('low-setup')) {
        result.score += 1;
        result.reasons.push('trainingTime<=30+low-setup:+1');
    }

    const skipped = _normalizeSkippedReason(ctx.skippedReason || ctx.lastSkippedReason);
    if (skipped === 'equipment') {
        if (metadata.equipmentLevel === 'gym' || metadata.equipmentLevel === 'field') {
            result.score -= 2;
            result.reasons.push('skipped:equipment:-2');
        } else if (metadata.equipmentLevel === 'none' || metadata.equipmentLevel === 'light') {
            result.score += 1;
            result.reasons.push('skipped:equipment:+1');
        }
    } else if (skipped === 'fatigue') {
        if (metadata.intensityTier === 'high') {
            result.score -= 2;
            result.reasons.push('skipped:fatigue:-2');
        }
        if (metadata.trainingFocusFit.includes('recovery') || metadata.trainingFocusFit.includes('mobility')) {
            result.score += 1;
            result.reasons.push('skipped:fatigue:+1');
        }
    } else if (skipped === 'pain') {
        if (exContextCondition === 'pain' || exContextCondition === 'recovery') {
            result.score += 2;
            result.reasons.push('skipped:pain:+2');
        }
    } else if (skipped === 'time') {
        if (metadata.matchTags.includes('low-setup')) {
            result.score += 2;
            result.reasons.push('skipped:time:+2');
        }
    }

    const userTypeModifier = _getUserTypeScheduleModifier(player, exName, exData, {
        trainingTime: player && player.trainingTime,
        highWorkload: ctx.highWorkload === true,
        isGameDay: ctx.isGameDay === true
    });
    if (userTypeModifier.scoreDelta !== 0) {
        result.score += userTypeModifier.scoreDelta;
    }
    if (userTypeModifier.excluded) {
        result.excluded = true;
    }
    if (Array.isArray(userTypeModifier.reasons) && userTypeModifier.reasons.length > 0) {
        result.reasons.push(...userTypeModifier.reasons);
    }

    return result;
}

const EXERCISE_MATCH_REASON_LABELS = {
    'trainingFocusFit:+3': '목적에 맞음',
    'skipped:pain:+2': '부담 낮은 대안',
    'skipped:time:+2': '짧게 준비 가능',
    'skipped:equipment:+1': '장비 부담 적음',
    'skipped:fatigue:+1': '피로 시 가벼움',
    'userTypeFit:+2': '대상에 맞음',
    'roleFit:+2': '포지션에 맞음',
    'ageFit:+2': '연령대 고려',
    'contextCondition:+2': '상황에 맞음',
    'trainingTime<=30+low-setup:+1': '짧은 세션에 맞음',
    'evidenceLevel:A:+2': '근거 수준 A',
    'evidenceLevel:B:+1': '근거 수준 B',
    'userType:youth-skill-fit': '수준에 맞음',
    'userType:youth-foundation-fit': '기초 움직임에 맞음',
    'userType:youth-equipment-fit': '장비 부담 적음',
    'userType:adult-time-fit': '짧게 준비 가능',
    'userType:adult-game-ready-fit': '경기 준비에 맞음',
    'userType:recreational-low-burden': '저부담으로 진행',
    'userType:recreational-equipment-fit': '장비 부담 적음',
    'userType:recreational-general-fit': '건강 목적에 맞음'
};

const EXERCISE_MATCH_REASON_PRIORITY = [
    'trainingFocusFit:+3',
    'skipped:equipment:+1',
    'skipped:fatigue:+1',
    'skipped:pain:+2',
    'skipped:time:+2',
    'userTypeFit:+2',
    'userType:youth-foundation-fit',
    'userType:youth-skill-fit',
    'userType:adult-game-ready-fit',
    'userType:adult-time-fit',
    'userType:recreational-general-fit',
    'userType:recreational-low-burden',
    'userType:youth-equipment-fit',
    'userType:recreational-equipment-fit',
    'roleFit:+2',
    'ageFit:+2',
    'contextCondition:+2',
    'trainingTime<=30+low-setup:+1',
    'evidenceLevel:A:+2',
    'evidenceLevel:B:+1'
];

function _getExerciseMatchReasonLabels(scoreResult) {
    if (!scoreResult || !Array.isArray(scoreResult.reasons)) return [];
    const reasonSet = new Set(scoreResult.reasons);
    const labels = [];
    for (const key of EXERCISE_MATCH_REASON_PRIORITY) {
        if (labels.length >= 3) break;
        if (reasonSet.has(key) && EXERCISE_MATCH_REASON_LABELS[key]) {
            labels.push(EXERCISE_MATCH_REASON_LABELS[key]);
        }
    }
    return labels;
}

function _getRecentSkippedReasonForExercise(player, exName) {
    if (!player || !Array.isArray(player.completionHistory)) return '';
    if (typeof exName !== 'string' || !exName) return '';
    for (let i = player.completionHistory.length - 1; i >= 0; i--) {
        const entry = player.completionHistory[i];
        if (!entry || !Array.isArray(entry.exercises)) continue;
        for (const ex of entry.exercises) {
            if (!ex || ex.name !== exName) continue;
            if (ex.completed === false) {
                const normalized = _normalizeSkippedReason(ex.skippedReason);
                if (normalized) return normalized;
            }
        }
    }
    return '';
}

function _getSwapScoreContext(player, dayIndex, originalExName) {
    const ctx = {
        preferContextCondition: '',
        highWorkload: false,
        painArea: '',
        lastSkippedReason: ''
    };
    const origData = (typeof originalExName === 'string') ? exerciseDB[originalExName] : null;
    if (origData && typeof origData.contextCondition === 'string') {
        ctx.preferContextCondition = origData.contextCondition;
    }
    if (player && player.highWorkload === true) {
        ctx.highWorkload = true;
    }
    if (player && player.wellness && typeof player.wellness.painArea === 'string') {
        ctx.painArea = player.wellness.painArea;
    }
    ctx.lastSkippedReason = _getRecentSkippedReasonForExercise(player, originalExName);
    return ctx;
}

function _sortSwapAlternativesForPlayer(alternatives, player, dayIndex, originalExName) {
    if (!Array.isArray(alternatives)) return [];
    const context = _getSwapScoreContext(player, dayIndex, originalExName);
    const decorated = alternatives.map((altName, idx) => {
        const altData = (typeof altName === 'string') ? exerciseDB[altName] : null;
        let score = 0;
        let excluded = false;
        if (altData) {
            const result = _scoreExerciseForPlayer(altName, altData, player, context);
            score = (result && typeof result.score === 'number') ? result.score : 0;
            excluded = !!(result && result.excluded);
        }
        return { altName, idx, score, excluded };
    });
    decorated.sort((a, b) => {
        if (a.excluded !== b.excluded) return a.excluded ? 1 : -1;
        if (b.score !== a.score) return b.score - a.score;
        return a.idx - b.idx;
    });
    return decorated.map(item => item.altName);
}

function _getScheduleRecoveryScoreContext(player, originalExName) {
    return {
        preferContextCondition: 'recovery',
        highWorkload: true,
        painArea: '',
        lastSkippedReason: _getRecentSkippedReasonForExercise(player, originalExName)
    };
}

function _rankScheduleRecoverySwapOptions(candidates, player, dayIndex, originalExName) {
    if (!Array.isArray(candidates)) return [];
    const context = _getScheduleRecoveryScoreContext(player, originalExName);
    const decorated = candidates.map((altName, idx) => {
        const altData = (typeof altName === 'string') ? exerciseDB[altName] : null;
        let score = 0;
        let excluded = false;
        if (altData) {
            const result = _scoreExerciseForPlayer(altName, altData, player, context);
            score = (result && typeof result.score === 'number') ? result.score : 0;
            excluded = !!(result && result.excluded);
        }
        return { altName, idx, score, excluded };
    });
    decorated.sort((a, b) => {
        if (a.excluded !== b.excluded) return a.excluded ? 1 : -1;
        if (b.score !== a.score) return b.score - a.score;
        return a.idx - b.idx;
    });
    return decorated.map(item => item.altName);
}

function _getScheduleSuggestedSwapCandidate(player, dayIndex, finalName) {
    if (!finalName || finalName === '휴식') return null;
    const alternatives = exerciseSwapDB[finalName];
    if (!Array.isArray(alternatives) || alternatives.length === 0) return null;
    const sorted = _sortSwapAlternativesForPlayer(alternatives, player, dayIndex, finalName);
    if (!Array.isArray(sorted) || sorted.length === 0) return null;
    const restNames = new Set(['휴식', '피로 관리', '경기 출전 휴식']);
    const context = _getSwapScoreContext(player, dayIndex, finalName);
    for (const candidate of sorted) {
        if (typeof candidate !== 'string') continue;
        if (candidate === finalName) continue;
        if (restNames.has(candidate)) continue;
        const data = exerciseDB[candidate];
        if (!data) continue;
        const result = _scoreExerciseForPlayer(candidate, data, player, context);
        if (result && result.excluded === true) continue;
        return { name: candidate, scoreResult: result };
    }
    return null;
}

function _getScheduleAutoSwapCandidate(player, dayIndex, finalName, seenNames) {
    if (!finalName) return null;
    const restNames = new Set(['휴식', '피로 관리', '경기 출전 휴식']);
    if (restNames.has(finalName)) return null;
    const originalData = exerciseDB[finalName];
    if (!originalData) return null;
    if (originalData.volumeType !== 'reps') return null;
    const alternatives = exerciseSwapDB[finalName];
    if (!Array.isArray(alternatives) || alternatives.length === 0) return null;
    const sorted = _sortSwapAlternativesForPlayer(alternatives, player, dayIndex, finalName);
    if (!Array.isArray(sorted) || sorted.length === 0) return null;
    const context = _getSwapScoreContext(player, dayIndex, finalName);
    for (const candidate of sorted) {
        if (typeof candidate !== 'string') continue;
        if (candidate === finalName) continue;
        if (restNames.has(candidate)) continue;
        if (seenNames instanceof Set && seenNames.has(candidate)) continue;
        const data = exerciseDB[candidate];
        if (!data) continue;
        if (data.autoSwapVolumeSafe !== true) continue;
        if (data.volumeType !== originalData.volumeType) continue;
        const result = _scoreExerciseForPlayer(candidate, data, player, context);
        if (!result) continue;
        if (result.excluded === true) continue;
        if (!(result.score > 0)) continue;
        return { name: candidate, scoreResult: result };
    }
    return null;
}

function _getWorkloadExerciseSnapshot(dayIndex, loadEntry) {
    if (loadEntry && Array.isArray(loadEntry.exercises) && loadEntry.exercises.length > 0) {
        return loadEntry.exercises;
    }
    const cached = _cachedDayExercises[dayIndex];
    return Array.isArray(cached) ? cached : [];
}

function _renderWorkloadExerciseChecklist(dayIndex, loadEntry) {
    const wrap = document.getElementById('wlExerciseChecklistWrap');
    const list = document.getElementById('wlExerciseChecklist');
    if (!wrap || !list) return;
    list.replaceChildren();

    const snapshot = _getWorkloadExerciseSnapshot(dayIndex, loadEntry);
    const renderable = snapshot.filter(ex => ex && ex.name && ex.name !== '휴식');
    if (renderable.length === 0) {
        wrap.style.display = 'none';
        return;
    }
    wrap.style.display = 'block';

    snapshot.forEach((ex, idx) => {
        if (!ex || !ex.name || ex.name === '휴식') return;
        const li = document.createElement('li');
        li.className = 'wl-exercise-checklist-item';
        li.dataset.exerciseIndex = String(idx);

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'wl-exercise-checklist-checkbox';
        checkbox.checked = _normalizeExerciseCompletionFlag(ex);

        const label = document.createElement('span');
        label.className = 'wl-exercise-checklist-item-label';
        label.textContent = String(ex.name);

        const vol = document.createElement('span');
        vol.className = 'wl-exercise-checklist-item-vol';
        const sets = ex.sets !== undefined && ex.sets !== '' ? ex.sets : '';
        const reps = ex.reps !== undefined && ex.reps !== '' ? ex.reps : '';
        vol.textContent = sets || reps ? `${sets}세트 × ${reps}` : '';

        const labelWrap = document.createElement('label');
        labelWrap.className = 'wl-exercise-checklist-label';
        labelWrap.appendChild(checkbox);
        labelWrap.appendChild(label);
        if (vol.textContent) labelWrap.appendChild(vol);
        li.appendChild(labelWrap);

        const reasonSelect = document.createElement('select');
        reasonSelect.className = 'wl-exercise-skip-reason';
        ALLOWED_SKIPPED_REASONS.forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value === '' ? '사유 선택 안 함' : SKIPPED_REASON_LABELS[value];
            reasonSelect.appendChild(option);
        });
        reasonSelect.value = _normalizeSkippedReason(ex && ex.skippedReason);
        reasonSelect.disabled = checkbox.checked;
        checkbox.addEventListener('change', () => {
            reasonSelect.disabled = checkbox.checked;
            if (checkbox.checked) reasonSelect.value = '';
        });
        li.appendChild(reasonSelect);

        list.appendChild(li);
    });
}

function _collectWorkloadExerciseSnapshot(dayIndex, loadEntry) {
    const base = _getWorkloadExerciseSnapshot(dayIndex, loadEntry).map(ex => ({
        name: ex && ex.name !== undefined ? ex.name : '',
        sets: ex && ex.sets !== undefined ? ex.sets : '',
        reps: ex && ex.reps !== undefined ? ex.reps : '',
        completed: _normalizeExerciseCompletionFlag(ex),
        skippedReason: ''
    }));

    const list = document.getElementById('wlExerciseChecklist');
    if (!list) {
        base.forEach(item => {
            if (item.completed) item.skippedReason = '';
        });
        return base;
    }
    const items = list.querySelectorAll('.wl-exercise-checklist-item');
    items.forEach(item => {
        const idx = Number(item.dataset.exerciseIndex);
        if (!Number.isInteger(idx) || idx < 0 || idx >= base.length) return;
        const checkbox = item.querySelector('input[type="checkbox"]');
        if (!checkbox) return;
        base[idx].completed = !!checkbox.checked;
        const reasonSelect = item.querySelector('.wl-exercise-skip-reason');
        if (!checkbox.checked && reasonSelect) {
            base[idx].skippedReason = _normalizeSkippedReason(reasonSelect.value);
        } else {
            base[idx].skippedReason = '';
        }
    });
    return base;
}

function openWorkloadModal(playerId, dayIndex, editDateStr = null) {
    currentId = playerId;
    currentWorkloadDayIndex = dayIndex;
    currentWorkloadEditDate = editDateStr || null;
    currentWorkloadEditMode = editDateStr ? 'history' : 'current-day';

    const p = players.find(p => String(p.id) === String(playerId));

    const pType = (p && p.type) || '투수';
    const mainLabel = document.getElementById('wlMainLabel');
    const countLabel = document.getElementById('wlCountLabel');
    const noBtn = document.getElementById('wlNoBtn');
    const rpeGuide = document.getElementById('wlRpeGuide');

    // 모달 제목/부제 수정 모드 반영
    const modalTitle = document.getElementById('wlModalTitle');
    const modalSubtitle = document.getElementById('wlModalSubtitle');
    if (currentWorkloadEditMode === 'history') {
        if (modalTitle) modalTitle.innerText = '기록 수정';
        if (modalSubtitle) { modalSubtitle.innerText = `수정 날짜: ${editDateStr}`; modalSubtitle.style.display = 'block'; }
    } else {
        if (modalTitle) modalTitle.innerText = '사후 워크로드 입력 (Post-Training)';
        if (modalSubtitle) modalSubtitle.style.display = 'none';
    }

    if (mainLabel) mainLabel.innerText = pType === '타자' ? '오늘의 타격 워크로드 (RPE x 스윙 수)' : '오늘의 투구 워크로드 (RPE x 투구 수)';
    if (countLabel) countLabel.innerText = pType === '타자' ? '총 타격(스윙) 수' : '총 투구 수';
    if (noBtn) noBtn.innerText = pType === '타자' ? '🚫 오늘 타격하지 않음' : '🚫 오늘 투구하지 않음';

    if (rpeGuide) {
        const guideTitle = '<strong class="wl-rpe-guide-title">RPE(운동 자각도)란?</strong>선수 본인이 느끼는 세션 전체의 힘든 정도를 0~10으로 기록합니다.<br>';
        const youthNote = '<br>유소년·학생 선수는 숫자보다 가볍게 / 보통 / 힘듦 같은 느낌 설명을 먼저 참고하고, 필요하면 0~10 기록을 함께 확인할 수 있습니다.';
        if (pType === '타자') {
            rpeGuide.innerHTML = guideTitle +
                '• <strong>0~3:</strong> 가볍게 (가벼운 스윙·웜업 수준)<br>' +
                '• <strong>4~6:</strong> 보통 (일반적인 티 배팅 수준)<br>' +
                '• <strong>7~8:</strong> 힘듦 (라이브 배팅 수준)<br>' +
                '• <strong>9~10:</strong> 매우 힘듦 ~ 최대 노력 (전력 타격 수준)<br>' +
                '타격 훈련은 세션 전체의 느낌을 기록할 수 있습니다.' +
                youthNote;
        } else {
            rpeGuide.innerHTML = guideTitle +
                '• <strong>0~3:</strong> 가볍게 (가벼운 캐치볼·웜업 수준)<br>' +
                '• <strong>4~6:</strong> 보통 (일반적인 불펜 피칭 수준)<br>' +
                '• <strong>7~8:</strong> 힘듦 (실전 등판 수준)<br>' +
                '• <strong>9~10:</strong> 매우 힘듦 ~ 최대 노력 (전력 투구 수준)<br>' +
                '피칭 훈련은 투구 수, 불펜 강도, 전력 투구 비율을 함께 떠올리며 세션 전체 느낌을 기록할 수 있습니다.' +
                youthNote;
        }
    }

    // 기존 값 불러오기
    let loadEntry = null;
    if (currentWorkloadEditMode === 'history' && p) {
        loadEntry = getCompletionEntryByDate(p, editDateStr);
        // 레거시 데이터: completionHistory 없고 dailyCompletion만 있는 경우 폴백
        if (!loadEntry && dayIndex >= 0 && p.dailyCompletion && p.dailyCompletion[dayIndex] && p.dailyCompletion[dayIndex].completed) {
            loadEntry = p.dailyCompletion[dayIndex];
        }
    } else if (p && p.dailyCompletion && p.dailyCompletion[dayIndex] && p.dailyCompletion[dayIndex].completed) {
        loadEntry = p.dailyCompletion[dayIndex];
    }

    document.getElementById('wlRPE').value = loadEntry ? (loadEntry.rpe ?? '') : '';
    document.getElementById('wlPitchCount').value = loadEntry ? (loadEntry.pitchCount ?? '') : '';

    _renderWorkloadExerciseChecklist(dayIndex, loadEntry);
    calculateLiveWorkload();
    _syncRpeBarSelection(document.getElementById('wlRPE').value);
    openModal('workloadModal');
}

function _getActiveWorkloadLoadEntry() {
    const p = players.find(pl => String(pl.id) === String(currentId));
    if (!p) return null;
    if (currentWorkloadEditMode === 'history' && currentWorkloadEditDate) {
        const entry = getCompletionEntryByDate(p, currentWorkloadEditDate);
        if (entry) return entry;
        if (currentWorkloadDayIndex >= 0 && p.dailyCompletion && p.dailyCompletion[currentWorkloadDayIndex] && p.dailyCompletion[currentWorkloadDayIndex].completed) {
            return p.dailyCompletion[currentWorkloadDayIndex];
        }
        return null;
    }
    if (p.dailyCompletion && p.dailyCompletion[currentWorkloadDayIndex] && p.dailyCompletion[currentWorkloadDayIndex].completed) {
        return p.dailyCompletion[currentWorkloadDayIndex];
    }
    return null;
}

function saveDailyWorkload() {
    const p = players.find(p => String(p.id) === String(currentId));
    if (!p) return;

    const rpeInput = document.getElementById('wlRPE').value;
    const pitchCountInput = document.getElementById('wlPitchCount').value;

    const pType = (p && p.type) || '투수';
    const countName = pType === '타자' ? '타격(스윙) 수' : '투구 수';

    const _rpeRaw = String(rpeInput).trim();
    const _pitchRaw = String(pitchCountInput).trim();

    if (_rpeRaw === '' || _pitchRaw === '') {
        customAlert(`RPE와 ${countName}를 모두 입력해주세요. (${pType === '타자' ? '타격' : '투구'}를 하지 않았다면 0을 입력하세요)`);
        return;
    }

    const rpeFloat = Number(_rpeRaw);
    const pitchFloat = Number(_pitchRaw);
    if (!Number.isFinite(rpeFloat) || !Number.isFinite(pitchFloat)) return customAlert(`RPE와 ${countName}는 숫자만 입력 가능합니다.`);
    if (!Number.isInteger(rpeFloat) || !Number.isInteger(pitchFloat)) return customAlert(`RPE와 ${countName}는 정수만 입력 가능합니다.`);
    if (rpeFloat < 0 || pitchFloat < 0) return customAlert(`RPE와 ${countName}는 0 이상이어야 합니다.`);
    if (rpeFloat > 10) return customAlert('RPE는 0~10 범위만 허용됩니다.');
    const maxCount = (pType === '타자') ? 500 : 300;
    if (pitchFloat > maxCount) return customAlert(`${countName}는 최대 ${maxCount}까지만 허용됩니다.`);
    if (pitchFloat >= 1 && rpeFloat === 0) return customAlert(`${countName}가 1 이상이면 RPE는 1~10이어야 합니다.`);

    const rpe = rpeFloat;
    const pitchCount = pitchFloat;
    const workload = rpe * pitchCount;

    const activeLoadEntry = _getActiveWorkloadLoadEntry();
    const exerciseSnapshot = _collectWorkloadExerciseSnapshot(currentWorkloadDayIndex, activeLoadEntry);
    const performableExercises = exerciseSnapshot.filter(ex => ex && ex.name && ex.name !== '휴식');
    if (performableExercises.length > 0 && !performableExercises.some(ex => ex.completed)) {
        customAlert('최소 1개 운동은 수행으로 체크해주세요.');
        return;
    }

    const prevPlayerSnapshot = typeof structuredClone === 'function'
        ? structuredClone(p)
        : JSON.parse(JSON.stringify(p));

    if (currentWorkloadEditMode === 'history' && currentWorkloadEditDate) {
        // 과거 기록 수정 모드 — 날짜 기준으로 저장
        const dateStr = currentWorkloadEditDate;
        const existing = getCompletionEntryByDate(p, dateStr);
        const existingDayIndex = (existing && existing.dayIndex !== undefined) ? existing.dayIndex : currentWorkloadDayIndex;
        const payload = { dayIndex: existingDayIndex, rpe, pitchCount, workload, exercises: exerciseSnapshot };
        upsertCompletionHistoryEntry(p, dateStr, payload);
        upsertWorkloadHistoryEntry(p, dateStr, workload);
        syncDailyCompletionForDate(p, dateStr, { rpe, pitchCount, workload, exercises: exerciseSnapshot });
    } else {
        // 신규 저장 (기존 로직)
        if (!p.dailyCompletion) p.dailyCompletion = {};
        p.dailyCompletion[currentWorkloadDayIndex] = {
            completed: true,
            rpe,
            pitchCount,
            workload,
            exercises: exerciseSnapshot
        };
        const todayStr = getTodayStr();
        upsertWorkloadHistoryEntry(p, todayStr, workload);
        upsertCompletionHistoryEntry(p, todayStr, {
            dayIndex: currentWorkloadDayIndex,
            rpe,
            pitchCount,
            workload,
            exercises: exerciseSnapshot
        });
    }

    if (!saveDB()) {
        Object.keys(p).forEach(key => delete p[key]);
        Object.assign(p, prevPlayerSnapshot);
        renderBackupStorageStatus();
        return;
    }
    closeModal('workloadModal');
    renderResult();
}

function normalizeGuideExerciseName(exName) {
    return exName.replace(/\s*\([^)]+\)\s*$/, '').trim();
}

const TRUSTED_SOURCE_HOSTS = Object.freeze([
    'www.nsca.com',
    'www.asmi.org',
    'www.mytpi.com',
    'www.drivelinebaseball.com',
    'www.posturalrestoration.com'
]);

function _isTrustedSourceUrl(value) {
    if (typeof value !== 'string') return false;
    const trimmed = value.trim();
    if (!trimmed) return false;
    let parsed;
    try {
        parsed = new URL(trimmed);
    } catch (err) {
        return false;
    }
    if (parsed.protocol !== 'https:') return false;
    if (parsed.username !== '' || parsed.password !== '') return false;
    return TRUSTED_SOURCE_HOSTS.includes(parsed.hostname.toLowerCase());
}

function _isSafeYoutubeWatchUrl(url) {
    if (typeof url !== 'string') return false;
    try {
        const parsed = new URL(url.trim());
        const videoId = parsed.searchParams.get('v');
        return parsed.protocol === 'https:' &&
            parsed.hostname === 'www.youtube.com' &&
            parsed.pathname === '/watch' &&
            !!videoId &&
            !parsed.searchParams.has('list');
    } catch (err) {
        return false;
    }
}

const VALID_EVIDENCE_LEVELS = ['A', 'B', 'C'];

function _normalizeEvidenceLevel(level) {
    if (typeof level !== 'string') return '';
    const normalized = level.trim().toUpperCase();
    return VALID_EVIDENCE_LEVELS.includes(normalized) ? normalized : '';
}

function _validateExerciseEvidenceLevels() {
    if (typeof exerciseDB !== 'object' || exerciseDB === null) return;
    Object.entries(exerciseDB).forEach(([name, data]) => {
        if (!data || !Object.prototype.hasOwnProperty.call(data, 'evidenceLevel')) return;
        const level = data.evidenceLevel;
        const normalized = typeof level === 'string' ? level.trim().toUpperCase() : '';
        if (!VALID_EVIDENCE_LEVELS.includes(normalized)) {
            console.warn('[Baseball Lab] Invalid evidenceLevel:', name, level);
        }
    });
}

function _renderGuideTextSection(sectionId, textId, value) {
    const section = document.getElementById(sectionId);
    const el = document.getElementById(textId);
    if (!section || !el) return;
    if (value) {
        el.innerText = value;
        section.style.display = 'block';
    } else {
        section.style.display = 'none';
    }
}

function _renderGuideListSection(sectionId, listId, items, itemClass) {
    const section = document.getElementById(sectionId);
    const list = document.getElementById(listId);
    if (!section || !list) return;
    if (items && items.length > 0) {
        list.innerHTML = items.map(s => `<li${itemClass ? ' class="' + itemClass + '"' : ''}>${escapeHTML(s)}</li>`).join('');
        section.style.display = 'block';
    } else {
        section.style.display = 'none';
    }
}

function _renderGuideSourceSection(data) {
    const sourceSection = document.getElementById('gSource');
    const evidenceBadge = document.getElementById('gEvidenceBadge');
    const sourceText = document.getElementById('gSourceText');
    if (!sourceSection || !evidenceBadge || !sourceText) return;
    const sourceUrlEl = document.getElementById('gSourceUrl');
    if (data.sourceOrg) {
        const safeLevel = _normalizeEvidenceLevel(data.evidenceLevel);
        if (safeLevel) {
            evidenceBadge.innerText = '근거 등급 ' + safeLevel;
            evidenceBadge.className = 'evidence-badge grade-' + safeLevel;
            evidenceBadge.style.display = 'inline-flex';
        } else {
            evidenceBadge.innerText = '';
            evidenceBadge.className = 'evidence-badge';
            evidenceBadge.style.display = 'none';
        }
        sourceText.innerText = `출처: ${data.sourceOrg}${data.sourceTitle ? ' · ' + data.sourceTitle : ''}`;
        sourceSection.style.display = 'flex';
        if (sourceUrlEl) {
            if (_isTrustedSourceUrl(data.sourceUrl)) {
                sourceUrlEl.href = data.sourceUrl.trim();
                sourceUrlEl.style.display = 'inline';
            } else {
                sourceUrlEl.href = '#';
                sourceUrlEl.style.display = 'none';
            }
        }
    } else {
        evidenceBadge.innerText = '';
        evidenceBadge.className = 'evidence-badge';
        evidenceBadge.style.display = 'none';
        sourceText.innerText = '';
        if (sourceUrlEl) {
            sourceUrlEl.href = '#';
            sourceUrlEl.style.display = 'none';
        }
        sourceSection.style.display = 'none';
    }
}

function _isSafeGuideImageSrc(src) {
    if (typeof src !== 'string') return false;
    const value = src.trim();
    if (!value) return false;
    if (value.includes('..')) return false;
    return /^assets\/guides\/generated\/[a-z0-9-]+\.(webp|png)$/.test(value);
}

function _renderGuideMedia(data, displayTitle) {
    var card = document.getElementById('guideMediaCard');
    var img = document.getElementById('guideMediaImage');
    var caption = document.getElementById('guideMediaCaption');
    var credit = document.getElementById('guideMediaCredit');
    if (!card || !img || !caption || !credit) return;

    function hideGuideMedia() {
        img.onerror = null;
        img.removeAttribute('src');
        img.alt = '';
        caption.textContent = '';
        caption.style.display = 'none';
        credit.textContent = '';
        credit.style.display = 'none';
        card.style.display = 'none';
    }

    if (!data || data.guideMediaType !== 'image' || !_isSafeGuideImageSrc(data.guideMediaSrc)) {
        hideGuideMedia();
        return;
    }

    var src = data.guideMediaSrc.trim();
    var altRaw = typeof data.guideMediaAlt === 'string' ? data.guideMediaAlt.trim() : '';
    var captionText = typeof data.guideMediaCaption === 'string' ? data.guideMediaCaption.trim() : '';
    var creditText = typeof data.guideMediaCredit === 'string' ? data.guideMediaCredit.trim() : '';

    img.onerror = hideGuideMedia;
    img.src = src;
    img.alt = altRaw || ((displayTitle || '운동') + ' 동작 이미지');

    caption.textContent = captionText;
    caption.style.display = captionText ? 'block' : 'none';
    credit.textContent = creditText;
    credit.style.display = creditText ? 'block' : 'none';

    card.style.display = 'block';
}

function _renderGuideYoutubeCta(data) {
    var ytWrap = document.getElementById('guideYoutubeCtaWrap');
    var ytLink = document.getElementById('guideYoutubeLink');
    var ytLabel = document.getElementById('guideYoutubeLabelText');
    var ytChannel = document.getElementById('guideYoutubeChannelText');
    if (!ytWrap || !ytLink) return;
    if (_isSafeYoutubeWatchUrl(data.guideYoutubeUrl)) {
        ytLink.href = data.guideYoutubeUrl.trim();
        if (ytLabel) ytLabel.innerText = data.guideYoutubeLabel || '참고 영상 보기';
        if (ytChannel) ytChannel.innerText = data.guideYoutubeChannel ? '— ' + data.guideYoutubeChannel : '';
        ytWrap.style.display = 'block';
    } else {
        ytLink.href = '#';
        if (ytLabel) ytLabel.innerText = '';
        if (ytChannel) ytChannel.innerText = '';
        ytWrap.style.display = 'none';
    }
}

function openGuide(exName, displayTitle) {
    const lookupName = normalizeGuideExerciseName(exName);
    const data = exerciseDB[lookupName] || exerciseDB[exName] || {};
    document.getElementById('gTitle').innerText = displayTitle || exName;

    document.getElementById('gDesc').innerText = data.desc || '상세 설명이 준비 중입니다.';
    _renderGuideTextSection('gSetup', 'gSetupText', data.setup);
    _renderGuideListSection('gSteps', 'gStepsList', data.steps, 'guide-list-item-spaced');
    _renderGuideListSection('gCues', 'gCuesList', data.cues, null);

    document.getElementById('gFocus').innerText = data.focus || '정확한 자세에 집중하세요.';

    // 피해야 할 부위 정보
    const avoidEl = document.getElementById('gAvoid');
    if (avoidEl) {
        if (data.avoid && data.avoid !== '없음') {
            avoidEl.textContent = '주의 부위: ' + data.avoid;
            avoidEl.style.color = 'var(--danger)';
            avoidEl.style.fontWeight = '600';
            avoidEl.style.display = 'block';
        } else {
            avoidEl.textContent = '';
            avoidEl.style.display = 'none';
        }
    }

    _renderGuideTextSection('gPurpose', 'gPurposeText', data.purpose);
    _renderGuideListSection('gMistakes', 'gMistakesList', data.mistakes, null);
    _renderGuideSourceSection(data);
    _renderGuideMedia(data, displayTitle || exName);
    _renderGuideYoutubeCta(data);

    lucide.createIcons();
    openModal('guideModal');
}

function captureSchedule(event) {
    const target = document.getElementById('captureArea');
    const btn = event ? event.currentTarget : document.getElementById('captureScheduleBtn');
    const originalHtml = btn ? btn.innerHTML : '<i data-lucide="camera"></i> 이 스케줄 이미지로 저장하기';
    if (btn) btn.innerHTML = "⏳ 캡처 중...";
    html2canvas(target, { scale: 2, backgroundColor: '#ffffff' }).then(canvas => {
        const link = document.createElement('a');
        link.download = `BaseballLab_Schedule_${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        if (btn) { btn.innerHTML = originalHtml; lucide.createIcons(); }
    }).catch(err => {
        console.error(err); customAlert('이미지 저장에 실패했습니다.');
        if (btn) { btn.innerHTML = originalHtml; lucide.createIcons(); }
    });
}

function _handleCaptureScheduleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    captureSchedule(e);
}

function _bindCaptureScheduleClickHandler() {
    const btn = document.getElementById('captureScheduleBtn');
    if (!btn) return;
    if (_captureScheduleClickHandler) {
        btn.removeEventListener('click', _captureScheduleClickHandler);
    }
    _captureScheduleClickHandler = _handleCaptureScheduleClick;
    btn.addEventListener('click', _captureScheduleClickHandler);
}

// === 운동 대체(스왑) 함수들 ===

function getEquipmentTagClass(equip) {
    const map = {
        '맨몸': 'bodyweight', '밴드': 'band', '덤벨': 'dumbbell', '바벨': 'barbell',
        '케틀벨': 'kettlebell', '케이블': 'cable', '박스': 'box', '벤치': 'bench',
        '메디신볼': 'ball', '폼롤러': 'roller', '철봉': 'other'
    };
    return map[equip] || 'other';
}

function getEquipmentIcon(equip) {
    return '';
}

function getEquipmentTags(exName) {
    const exData = exerciseDB[exName];
    if (!exData || !exData.equipment) return '';
    const equipHtml = exData.equipment.map(eq =>
        `<span class="equip-tag ${getEquipmentTagClass(eq)}">${escapeHTML(eq)}</span>`
    ).join('');
    const safeLevel = exData.evidenceLevel ? _normalizeEvidenceLevel(exData.evidenceLevel) : '';
    const evidenceHtml = safeLevel
        ? `<span class="evidence-badge evidence-badge-compact grade-${safeLevel}">근거 ${safeLevel}</span>`
        : '';
    return equipHtml + (evidenceHtml ? ' ' + evidenceHtml : '');
}

function openSwapModal(playerId, dayIndex, exName, event) {
    if (event) event.stopPropagation();

    swapState = {
        playerId: playerId,
        dayIndex: dayIndex,
        originalExName: exName,
        selectedSwapName: null
    };

    const exData = exerciseDB[exName];
    const equipHtml = exData && exData.equipment
        ? exData.equipment.map(eq => `<span class="equip-tag ${getEquipmentTagClass(eq)}">${getEquipmentIcon(eq)} ${escapeHTML(eq)}</span>`).join(' ')
        : '<span class="equip-tag bodyweight">맨몸</span>';

    const contextLabel = { pain: '통증 안전', recovery: '회복', normal: '일반' };
    const ctxTag = exData && exData.contextCondition
        ? `<span class="swap-ctx-tag">${escapeHTML(contextLabel[exData.contextCondition] || exData.contextCondition)}</span>`
        : '';
    const evLevelRaw = exData && exData.evidenceLevel;
    const evSafeLevel = evLevelRaw ? _normalizeEvidenceLevel(evLevelRaw) : '';
    const evTag = evSafeLevel
        ? `<span class="evidence-badge grade-${evSafeLevel} swap-evidence-inline">근거 ${evSafeLevel}</span>`
        : '';
    document.getElementById('swapOriginalInfo').innerHTML = `
        <div class="swap-original-name">현재 운동: ${escapeHTML(exName)}${ctxTag}${evTag}</div>
        <div class="swap-original-equip">필요 장비: ${equipHtml}</div>
    `;

    // 대체 운동 목록 생성
    const swapList = document.getElementById('swapOptionsList');
    const alternatives = exerciseSwapDB[exName] || [];

    // 이미 사용자가 이 운동을 대체한 적이 있는지
    const p = players.find(p => String(p.id) === String(playerId));
    const hasExistingSwap = p && p.exerciseSwaps && p.exerciseSwaps[`${dayIndex}_${exName}`];
    const sortedAlternatives = _sortSwapAlternativesForPlayer(alternatives, p, dayIndex, exName);
    const scoreContext = _getSwapScoreContext(p, dayIndex, exName);
    const scoreResultMap = new Map();
    sortedAlternatives.forEach(name => {
        const altData = exerciseDB[name];
        if (altData) {
            scoreResultMap.set(name, _scoreExerciseForPlayer(name, altData, p, scoreContext));
        }
    });

    const safeAnnounced = _getScheduleAutoSwapCandidate(p, dayIndex, exName, new Set());
    const announcedSwap = safeAnnounced || _getScheduleSuggestedSwapCandidate(p, dayIndex, exName);
    const announcedName = announcedSwap && announcedSwap.name ? announcedSwap.name : null;

    const resetBtn = document.getElementById('swapResetBtn');
    if (hasExistingSwap) {
        resetBtn.style.display = 'block';
    } else {
        resetBtn.style.display = 'none';
    }

    if (sortedAlternatives.length === 0) {
        swapList.innerHTML = `
            <div class="swap-empty">
                <div class="swap-empty-icon"><i data-lucide="check-circle-2" class="ui-icon-32 text-success"></i></div>
                <div class="swap-empty-title">이 운동은 맨몸으로 수행 가능합니다.</div>
                <div class="swap-empty-desc">별도의 장비가 필요하지 않아 대체 운동이 없습니다.</div>
            </div>
        `;
        document.getElementById('swapConfirmBtn').disabled = true;
        document.getElementById('swapConfirmBtn').style.opacity = '0.5';
    } else {
        // 맨몸 운동과 장비 필요 운동으로 분류
        let bodyweightAlts = [];
        let equipAlts = [];

        sortedAlternatives.forEach(altName => {
            const altData = exerciseDB[altName];
            if (altData) {
                const isBodyweight = altData.equipment && altData.equipment.length === 1 && altData.equipment[0] === '맨몸';
                if (isBodyweight) bodyweightAlts.push(altName);
                else equipAlts.push(altName);
            }
        });

        let html = '';

        if (bodyweightAlts.length > 0) {
            html += `<div class="swap-category-label">맨몸 대체 (장비 불필요)</div>`;
            bodyweightAlts.forEach(altName => {
                html += renderSwapOption(altName, scoreResultMap.get(altName), announcedName);
            });
        }

        if (equipAlts.length > 0) {
            html += `<div class="swap-category-label">다른 장비 대체</div>`;
            equipAlts.forEach(altName => {
                html += renderSwapOption(altName, scoreResultMap.get(altName), announcedName);
            });
        }

        swapList.innerHTML = html;
        _bindSwapOptionClickHandlers();
        document.getElementById('swapConfirmBtn').disabled = true;
        document.getElementById('swapConfirmBtn').style.opacity = '0.5';
    }

    openModal('swapModal');
}

function renderSwapOption(altName, scoreResult, announcedName) {
    const altData = exerciseDB[altName];
    if (!altData) return '';

    const equipTags = altData.equipment
        ? altData.equipment.map(eq => `<span class="equip-tag ${getEquipmentTagClass(eq)}">${getEquipmentIcon(eq)} ${escapeHTML(eq)}</span>`).join(' ')
        : '';

    const shortDesc = altData.desc.length > 60 ? altData.desc.substring(0, 60) + '...' : altData.desc;
    const ctxLabels = { pain: '통증 안전', recovery: '회복', normal: '일반' };
    const ctxBadge = altData.contextCondition
        ? `<span class="swap-option-ctx-tag">${escapeHTML(ctxLabels[altData.contextCondition] || altData.contextCondition)}</span>`
        : '';
    const safeEvLevel = altData.evidenceLevel ? _normalizeEvidenceLevel(altData.evidenceLevel) : '';
    const evBadge = safeEvLevel
        ? `<span class="evidence-badge grade-${safeEvLevel} swap-option-evidence-tag">근거 ${safeEvLevel}</span>`
        : '';
    const announcedBadge = (typeof announcedName === 'string' && announcedName.length > 0 && altName === announcedName)
        ? `<span class="swap-option-announced-tag">스케줄 안내 후보</span>`
        : '';
    const metaBadges = (ctxBadge || evBadge || announcedBadge) ? `<div class="swap-option-meta-row">${announcedBadge}${ctxBadge}${evBadge}</div>` : '';

    const reasonLabels = _getExerciseMatchReasonLabels(scoreResult);
    const reasonBadges = reasonLabels.length > 0
        ? `<div class="swap-match-reasons">${reasonLabels.map(label => `<span class="swap-match-reason">${escapeHTML(label)}</span>`).join('')}</div>`
        : '';

    return `
        <div class="swap-option cl-swap-card" data-name="${escapeHTML(altName)}">
            <div class="swap-option-main">
                <div class="swap-option-name">${escapeHTML(altName)}</div>
                <div class="swap-option-desc">${escapeHTML(shortDesc)}</div>
                <div class="swap-option-tags">${equipTags}</div>
                ${metaBadges}
                ${reasonBadges}
            </div>
            <div class="swap-option-right">
                <div class="swap-check cl-swap-radio">✓</div>
            </div>
        </div>
    `;
}

function _bindSwapOptionClickHandlers() {
    const swapList = document.getElementById('swapOptionsList');
    if (!swapList) return;
    swapList.querySelectorAll('.swap-option').forEach(option => {
        option.addEventListener('click', function() {
            selectSwapOption(option.dataset.name, option);
        });
    });
}

function selectSwapOption(altName, el) {
    // 기존 선택 해제
    document.querySelectorAll('.swap-option').forEach(opt => opt.classList.remove('selected'));
    // 새 선택
    el.classList.add('selected');
    swapState.selectedSwapName = altName;

    // 확인 버튼 활성화
    const btn = document.getElementById('swapConfirmBtn');
    btn.disabled = false;
    btn.style.opacity = '1';
}

function confirmSwap() {
    if (!swapState.selectedSwapName || !swapState.playerId) return;

    const p = players.find(p => String(p.id) === String(swapState.playerId));
    if (!p) return;

    // 선수 데이터에 스왑 기록 저장
    const prevPlayerSnapshot = typeof structuredClone === 'function'
        ? structuredClone(p)
        : JSON.parse(JSON.stringify(p));
    if (!p.exerciseSwaps) p.exerciseSwaps = {};
    const key = `${swapState.dayIndex}_${swapState.originalExName}`;
    p.exerciseSwaps[key] = {
        original: swapState.originalExName,
        replacement: swapState.selectedSwapName,
        dayIndex: swapState.dayIndex,
        date: getTodayStr()
    };

    if (!saveDB()) {
        Object.keys(p).forEach(key => delete p[key]);
        Object.assign(p, prevPlayerSnapshot);
        renderBackupStorageStatus();
        return;
    }
    closeModal('swapModal');
    renderResult();

    customAlert(`"${swapState.originalExName}"이(가) "${swapState.selectedSwapName}"(으)로 대체되었습니다.`);
}

function resetSwap() {
    if (!swapState.playerId || !swapState.originalExName) return;

    const p = players.find(p => String(p.id) === String(swapState.playerId));
    if (!p || !p.exerciseSwaps) return;

    const key = `${swapState.dayIndex}_${swapState.originalExName}`;

    customConfirm(`"${swapState.originalExName}"을 원래 운동으로 복원하시겠습니까?`, () => {
        const prevPlayerSnapshot = typeof structuredClone === 'function'
            ? structuredClone(p)
            : JSON.parse(JSON.stringify(p));
        delete p.exerciseSwaps[key];
        if (!saveDB()) {
            Object.keys(p).forEach(key => delete p[key]);
            Object.assign(p, prevPlayerSnapshot);
            renderBackupStorageStatus();
            return;
        }
        closeModal('swapModal');
        renderResult();
        customAlert('원래 운동으로 복원되었습니다.');
    });
}

// 스왑 적용 여부 확인 헬퍼
function getSwappedExercise(playerId, dayIndex, exName) {
    const p = players.find(p => String(p.id) === String(playerId));
    if (!p || !p.exerciseSwaps) return null;
    const key = `${dayIndex}_${exName}`;
    return p.exerciseSwaps[key] || null;
}

// ───────────────────────────────────────
// 데이터 백업 / 복원
// ───────────────────────────────────────

function buildBackupPayload() {
    return {
        app: 'Baseball Lab S&C',
        appVersion: 'V5.3',
        backupVersion: 'pldb-backup-v1',
        storageKey: 'pLDB_v4_5',
        exportedAt: new Date().toISOString(),
        playerCount: players.length,
        players: players
    };
}

function downloadBackup() {
    if (isBackupDownloadInProgress) {
        customAlert('백업 다운로드를 준비 중입니다. 잠시 후 다시 시도해주세요.');
        return;
    }
    isBackupDownloadInProgress = true;

    try {
        const payload = buildBackupPayload();
        const json = JSON.stringify(payload, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const now = new Date();
        const pad = n => String(n).padStart(2, '0');
        const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
        const timeStr = `${pad(now.getHours())}${pad(now.getMinutes())}`;
        const filename = `BaseballLab_Backup_${dateStr}_${timeStr}.json`;

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => {
            URL.revokeObjectURL(url);
            isBackupDownloadInProgress = false;
        }, 1000);
        customAlert(`백업 다운로드를 시작했습니다.\n\n파일명: ${filename}\n파일 크기: 약 ${_formatStorageSize(blob.size)}\n선수 데이터: ${payload.playerCount}명\n\n브라우저 다운로드 폴더를 확인하세요.`);
    } catch (e) {
        console.error('Backup download failed:', e);
        isBackupDownloadInProgress = false;
        customAlert('백업 다운로드를 준비하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        return;
    }
}

function triggerRestoreInput() {
    const input = document.getElementById('backupRestoreInput');
    input.value = '';
    input.click();
}

function _isValidEnvelope(parsed) {
    return (
        parsed !== null &&
        typeof parsed === 'object' &&
        !Array.isArray(parsed) &&
        Array.isArray(parsed.players) &&
        parsed.backupVersion === 'pldb-backup-v1' &&
        parsed.storageKey === 'pLDB_v4_5'
    );
}

function _isValidPlayerShape(p) {
    const ALLOWED_AGES = ['U-12', 'U-15', 'U-18', '성인'];
    const ALLOWED_TYPES = ['투수', '타자'];
    if (p === null || typeof p !== 'object' || Array.isArray(p)) return false;
    // id는 normalizePlayerIds()로 복구하므로 여기서 거부하지 않음
    if (typeof p.name !== 'string' || p.name.trim() === '') return false;
    if (typeof p.week !== 'number' || p.week < 1) return false;
    if (!ALLOWED_AGES.includes(p.age)) return false;
    if (p.type !== undefined && p.type !== null && !ALLOWED_TYPES.includes(p.type)) return false;
    return true;
}

const RESTORE_MAX_PLAYERS = 50;
const RESTORE_MAX_PLAYER_NAME_LENGTH = 80;
const RESTORE_MAX_WEEK = 520;
const RESTORE_META_MAX_LENGTH = 80;
const RESTORE_MAX_OBJECT_KEYS = 1500;
const RESTORE_MAX_ARRAY_LENGTH = 1500;
const RESTORE_MAX_NESTED_DEPTH = 6;

function _isOverMetaLimit(value) {
    return typeof value === 'string' && value.length > RESTORE_META_MAX_LENGTH;
}

function _exceedsRestoreShapeLimits(value, depth) {
    if (depth > RESTORE_MAX_NESTED_DEPTH) return true;
    if (value === null) return false;
    if (Array.isArray(value)) {
        if (value.length > RESTORE_MAX_ARRAY_LENGTH) return true;
        for (let i = 0; i < value.length; i++) {
            if (_exceedsRestoreShapeLimits(value[i], depth + 1)) return true;
        }
        return false;
    }
    if (typeof value === 'object') {
        const keys = Object.keys(value);
        if (keys.length > RESTORE_MAX_OBJECT_KEYS) return true;
        for (let i = 0; i < keys.length; i++) {
            if (_exceedsRestoreShapeLimits(value[keys[i]], depth + 1)) return true;
        }
        return false;
    }
    return false;
}

// 허용 포맷 판별 및 players 배열 추출 (레거시 raw array / 현재 envelope 포맷 모두 지원)
function extractRestorePlayers(parsed) {
    if (Array.isArray(parsed)) {
        return { players: parsed, exportedAt: null, appVersion: '', storageKey: '', legacy: true };
    }
    if (_isValidEnvelope(parsed)) {
        const appVersion = typeof parsed.appVersion === 'string' ? parsed.appVersion : '';
        const storageKey = typeof parsed.storageKey === 'string' ? parsed.storageKey : '';
        const exportedAt = typeof parsed.exportedAt === 'string' ? parsed.exportedAt : '';
        if (_isOverMetaLimit(appVersion) || _isOverMetaLimit(storageKey) || _isOverMetaLimit(exportedAt)) {
            return null;
        }
        return {
            players: parsed.players,
            exportedAt: parsed.exportedAt || null,
            appVersion,
            storageKey,
            legacy: false
        };
    }
    return null;
}

// 비객체 제거 → id UUID 정규화 → 0명 거부 → shape 검증 → 보수적 상한 검증
function validateRestorePlayers(restoredPlayers) {
    restoredPlayers = restoredPlayers.filter(p => p !== null && typeof p === 'object' && !Array.isArray(p));
    if (restoredPlayers.length === 0) {
        return { error: '백업 파일에 유효한 선수 데이터가 없어 복원할 수 없습니다.' };
    }
    if (restoredPlayers.length > RESTORE_MAX_PLAYERS) {
        return { error: `백업 파일의 선수 수가 허용 범위(${RESTORE_MAX_PLAYERS}명)를 초과해 복원할 수 없습니다.` };
    }
    _normalizePlayerIds(restoredPlayers);
    const allValid = restoredPlayers.every(p => _isValidPlayerShape(p));
    if (!allValid) {
        return { error: '백업 파일에 손상된 선수 데이터가 포함되어 있어 복원할 수 없습니다.' };
    }
    for (let i = 0; i < restoredPlayers.length; i++) {
        const p = restoredPlayers[i];
        if (typeof p.name === 'string' && p.name.length > RESTORE_MAX_PLAYER_NAME_LENGTH) {
            return { error: '백업 파일에 선수 이름이 너무 길어 복원할 수 없습니다.' };
        }
        if (typeof p.week === 'number' && p.week > RESTORE_MAX_WEEK) {
            return { error: '백업 파일의 주차 값이 허용 범위를 초과해 복원할 수 없습니다.' };
        }
        if (_exceedsRestoreShapeLimits(p, 1)) {
            return { error: '백업 파일의 데이터 구조가 너무 크거나 깊어 복원할 수 없습니다.' };
        }
    }
    return { players: restoredPlayers };
}

// 복원 확인 메시지 구성 (Invalid Date 방어)
function _formatRestoreStatsLabel(label, stats) {
    return `${label}: 선수 ${stats.players}명 · 훈련기록 ${stats.completion}건 · 워크로드 ${stats.workload}건 · 퍼포먼스 ${stats.performance}건`;
}

function _normalizeRestoreMetaLabel(value, maxLength = 40) {
    if (typeof value !== 'string') return '';
    const normalized = value.trim().replace(/\s+/g, ' ');
    if (!normalized) return '';
    if (normalized.length <= maxLength) return normalized;
    return `${normalized.slice(0, maxLength)}...`;
}

function _formatRestoreBackupDate(value) {
    if (!value) return '';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '';
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function buildRestoreConfirmMessage(restoredPlayers, exportedAt, fileSizeLabel = '', appVersionLabel = '', storageKeyLabel = '', legacy = false) {
    const countLabel = `선수 ${restoredPlayers.length}명`;
    const currentStats = _getPlayerHistoryStats(players);
    const restoreStats = _getPlayerHistoryStats(restoredPlayers);
    const currentCountLabel = _formatRestoreStatsLabel('현재 저장 데이터', currentStats);
    const restoreCountLabel = _formatRestoreStatsLabel('복원 후 데이터', restoreStats);
    const backupDateLabel = _formatRestoreBackupDate(exportedAt);
    const backupDateText = backupDateLabel ? `\n백업 생성일: ${backupDateLabel}` : '';
    const fileSizeText = fileSizeLabel ? `\n백업 파일 크기: 약 ${fileSizeLabel}` : '';
    const safeAppVersionLabel = _normalizeRestoreMetaLabel(appVersionLabel);
    const appVersionText = safeAppVersionLabel ? `\n백업 앱 버전: ${safeAppVersionLabel}` : '';
    const safeStorageKeyLabel = _normalizeRestoreMetaLabel(storageKeyLabel);
    const storageKeyText = safeStorageKeyLabel ? `\n백업 저장소: ${safeStorageKeyLabel}` : '';
    const legacyText = legacy === true ? `\n백업 형식: 구버전 백업 — 생성일·앱 버전·저장소 정보가 없어 파일 내용만 검증 후 복원합니다. 신뢰할 수 있는 직접 백업 파일인지 확인하세요.` : '';
    const allowlistNotice = `\n안내: Baseball Lab 정식 백업 외 필드는 복원 중 제외될 수 있습니다.`;
    return `백업 파일에서 ${countLabel}의 데이터를 불러옵니다.${fileSizeText}${appVersionText}${backupDateText}${storageKeyText}${legacyText}${allowlistNotice}\n\n${currentCountLabel}\n${restoreCountLabel}\n\n주의: 현재 저장된 모든 데이터가 이 백업 파일 내용으로 교체됩니다.\n확인을 누르는 시점의 현재 데이터가 교체 대상입니다.\n현재 상태를 아직 백업하지 않았다면 취소 후 백업 다운로드를 먼저 실행하세요.\n\n계속하시겠습니까?`;
}

const PLAYER_TOP_ALLOWED_KEYS = [
    'id', 'name', 'type', 'age', 'realAge', 'exp', 'height', 'weight',
    'season', 'goal', 'role', 'batterPos',
    'week', 'weekStartDate', 'lastPromptDate', 'pitchDate', 'trainingTime',
    'userType', 'usagePerspective', 'trainingFocus',
    'maxVelo', 'avgVelo', 'rpm', 'exitVelo', 'batSpeed',
    'prevMaxVelo', 'prevRPM', 'prevExitVelo',
    'prevWeekMissed', 'isUpgraded', 'upgradeMsg',
    'lateralBoundCleanupVersion',
    'dailyCompletion', 'completionHistory', 'workloadHistory', 'performanceHistory', 'exerciseSwaps',
    'scores', 'wellness'
];

function _dropUnknownPlayerFields(playerList) {
    if (!Array.isArray(playerList)) return;
    const allowed = new Set(PLAYER_TOP_ALLOWED_KEYS);
    playerList.forEach(p => {
        if (!p || typeof p !== 'object' || Array.isArray(p)) return;
        Object.keys(p).forEach(key => {
            if (!allowed.has(key)) delete p[key];
        });
    });
}

// runtime normalize + 타입 보정 + save
function finalizeRestorePlayers(restoredPlayers) {
    const prevPlayersSnapshot = typeof structuredClone === 'function'
        ? structuredClone(players)
        : JSON.parse(JSON.stringify(players));
    const prevCurrentId = currentId;
    _normalizePlayerRuntimeState(restoredPlayers);
    _ensureWellnessShape(restoredPlayers);
    let normalized = migratePlayerDates(restoredPlayers);
    normalized = normalized.map(p => {
        if (!p.type) p.type = '투수';
        return p;
    });
    _dropUnknownPlayerFields(normalized);
    players = normalized;
    currentId = null;
    if (!saveDB()) {
        players = prevPlayersSnapshot;
        currentId = prevCurrentId;
        renderBackupStorageStatus();
        return;
    }
    showScreen('s1');
    renderPlayerList();
    customAlert(`백업 복원이 완료되었습니다. ${players.length}명의 선수 데이터를 불러왔습니다.`);
}

const RESTORE_FILE_MAX_BYTES = 5 * 1024 * 1024;

function _resetRestoreInput(event) {
    const input = event && event.target;
    if (input) input.value = '';
}

function _isLikelyJsonFile(file) {
    if (!file) return false;
    const name = String(file.name || '').toLowerCase();
    const type = String(file.type || '').toLowerCase();
    const hasJsonExtension = name.endsWith('.json');
    if (hasJsonExtension) return true;
    if (type === '') return true;
    return type === 'application/json' || type === 'text/json' || type === 'application/octet-stream';
}

function _isAllowedRestoreFileSize(file) {
    return file && file.size > 0 && file.size <= RESTORE_FILE_MAX_BYTES;
}

function handleRestoreFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!_isLikelyJsonFile(file)) {
        customAlert('JSON 백업 파일만 복원할 수 있습니다.');
        _resetRestoreInput(event);
        return;
    }

    if (!_isAllowedRestoreFileSize(file)) {
        customAlert('백업 파일이 비어 있거나 너무 큽니다. 5MB 이하의 JSON 파일을 선택해주세요.');
        _resetRestoreInput(event);
        return;
    }

    const reader = new FileReader();
    reader.onerror = function () {
        customAlert('JSON 파일을 읽는 중 오류가 발생했습니다.');
        _resetRestoreInput(event);
    };
    reader.onload = function (e) {
        const rawText = e && e.target ? e.target.result : '';
        if (typeof rawText !== 'string' || rawText.trim() === '') {
            customAlert('백업 파일이 비어 있거나 읽을 수 없습니다.');
            _resetRestoreInput(event);
            return;
        }

        let parsed;
        try {
            parsed = JSON.parse(rawText);
        } catch (_) {
            customAlert('백업 파일 형식이 올바르지 않습니다.');
            _resetRestoreInput(event);
            return;
        }

        const extracted = extractRestorePlayers(parsed);
        if (!extracted) {
            customAlert('유효한 Baseball Lab 백업 파일이 아닙니다.');
            _resetRestoreInput(event);
            return;
        }

        const validated = validateRestorePlayers(extracted.players);
        if (validated.error) {
            customAlert(validated.error);
            _resetRestoreInput(event);
            return;
        }

        const fileSizeLabel = _formatStorageSize(file.size);
        const confirmMsg = buildRestoreConfirmMessage(validated.players, extracted.exportedAt, fileSizeLabel, extracted.appVersion, extracted.storageKey, extracted.legacy);
        _resetRestoreInput(event);
        customConfirm(confirmMsg, function () {
            finalizeRestorePlayers(validated.players);
        });
    };
    reader.readAsText(file);
}
