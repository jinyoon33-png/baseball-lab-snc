// ============================================================
//  app.js  —  전역 변수, 전체 함수 로직, 이벤트 핸들러
//  로드 순서: data.js → app.js
// ============================================================

// 보안: XSS 방지용 HTML 이스케이프 함수
function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/[&<>'"]/g, tag => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag]));
}

function selectPlayerType(type, formType) {
    if (formType === 'add') {
        document.getElementById('pType').value = type;
        document.getElementById('addTypePitcher').classList.toggle('active', type === '투수');
        document.getElementById('addTypeBatter').classList.toggle('active', type === '타자');
        document.getElementById('addPitcherFields').style.display = type === '투수' ? '' : 'none';
        document.getElementById('addBatterFields').style.display = type === '타자' ? '' : 'none';
    } else if (formType === 'edit') {
        document.getElementById('eType').value = type;
        document.getElementById('editTypePitcher').classList.toggle('active', type === '투수');
        document.getElementById('editTypeBatter').classList.toggle('active', type === '타자');
        document.getElementById('editPitcherFields').style.display = type === '투수' ? '' : 'none';
        document.getElementById('editBatterFields').style.display = type === '타자' ? '' : 'none';
    }
}

// 스왑 상태 관리
let swapState = {
    playerId: null,
    dayIndex: null,
    originalExName: null,
    selectedSwapName: null
};

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
        if (p.weekStartDate && p.weekStartDate.includes(' ')) {
            try { p.weekStartDate = new Date(p.weekStartDate).toISOString().split('T')[0]; } catch (e) { p.weekStartDate = getTodayStr(); }
        }
        if (p.wellness && p.wellness.date && p.wellness.date.includes(' ')) {
            try { p.wellness.date = new Date(p.wellness.date).toISOString().split('T')[0]; } catch (e) { p.wellness.date = getTodayStr(); }
        }
        if (p.lastPromptDate && p.lastPromptDate.includes(' ')) {
            try { p.lastPromptDate = new Date(p.lastPromptDate).toISOString().split('T')[0]; } catch (e) { p.lastPromptDate = getTodayStr(); }
        }
    });
    return playerList;
}

let players = [];
try {
    const raw = localStorage.getItem('pLDB_v4_5');
    if (raw) {
        players = JSON.parse(raw);
        if (!Array.isArray(players)) players = [];
        players = migratePlayerDates(players);
        players.forEach(p => { if (!p.type) p.type = '투수'; });
    }
} catch (e) {
    console.error('데이터 로드 실패, 초기화합니다:', e);
    players = [];
}

let currentId = null;
let radarChartInstance = null;
let currentViewMode = 'card'; // 'card' | 'calendar' | 'monthly'
let currentCalendarDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let _monthlyClickHandler = null;

window.onload = () => {
    renderPlayerList();
    lucide.createIcons();
};

function saveDB() { localStorage.setItem('pLDB_v4_5', JSON.stringify(players)); }
function showScreen(id) { document.querySelectorAll('.screen').forEach(s => s.classList.remove('active')); document.getElementById(id).classList.add('active'); }
function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

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
    btn.onclick = () => {
        if (callback) callback();
        closeModal('confirmModal');
    };
    openModal('confirmModal');
}

function openGuideModal() {
    openModal('appGuideModal');
}

function handlePainCheck(checkbox, groupName) {
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

    // 통증 없음 선택 시 회복 수준 숨기기, 그 외에는 통증 부위별 슬라이더 생성
    const isNone = document.querySelector(`input[name="${groupName}"][value="없음"]`).checked;
    const recoveryGroup = groupName === 'pPain' ? document.getElementById('initialRecoveryGroup') : document.getElementById('wellnessRecoveryGroup');

    if (recoveryGroup) {
        if (isNone) {
            recoveryGroup.style.display = 'none';
            recoveryGroup.innerHTML = '';
        } else {
            recoveryGroup.style.display = 'block';
            const checkedAreas = Array.from(document.querySelectorAll(`input[name="${groupName}"]:checked`)).map(cb => cb.value);
            let slidersHtml = `<label class="form-label" style="margin-bottom: 12px; display: block;">통증 부위별 현재 회복 수준 (1:최악 ~ 10:최상)</label>`;

            checkedAreas.forEach(area => {
                // 기존 값이 있으면 유지, 없으면 5
                let currentValue = 5;
                const existingSlider = document.getElementById(`rLv_${groupName}_${area}`);
                if (existingSlider) {
                    currentValue = existingSlider.value;
                } else if (groupName === 'wPain' && currentId) {
                    // 웰니스 모달을 열 때 기존 데이터가 있다면 가져오기
                    const p = players.find(p => String(p.id) === String(currentId));
                    if (p && p.wellness && p.wellness.recovery && typeof p.wellness.recovery === 'object' && p.wellness.recovery[area]) {
                        currentValue = p.wellness.recovery[area];
                    }
                }

                slidersHtml += `
                    <div style="margin-bottom: 16px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 13px; color: var(--text-color);">
                            <span>${area} 회복 수준</span>
                            <span class="range-val" id="rLvVal_${groupName}_${area}" style="font-size: 14px;">${currentValue}</span>
                        </div>
                        <div class="range-wrap" style="margin-top: 0;">
                            <input type="range" id="rLv_${groupName}_${area}" class="dynamic-recovery-slider" data-area="${area}" min="1" max="10" step="1" value="${currentValue}" oninput="document.getElementById('rLvVal_${groupName}_${area}').innerText=this.value">
                        </div>
                    </div>
                `;
            });
            recoveryGroup.innerHTML = slidersHtml;
        }
    }
}

function addPlayer() {
    const name = document.getElementById('pName').value.trim();
    const ageInput = parseInt(document.getElementById('pAge').value);
    const expInput = parseInt(document.getElementById('pExp').value) || 0;
    const heightInput = parseInt(document.getElementById('pHeight').value) || 0;
    const weightInput = parseInt(document.getElementById('pWeight').value) || 0;
    const playerType = document.getElementById('pType').value;

    if (expInput > ageInput) {
        return customAlert('구력이 나이보다 높을 수 없습니다.');
    }
    if (!name) return customAlert('선수 이름을 입력하세요.');
    if (isNaN(ageInput) || ageInput <= 0) return customAlert('올바른 나이를 입력하세요.');

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
                recoveryData[area] = parseInt(slider.value);
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
        const trainingTime = document.getElementById('pBatterTime').value;
        const exitVelo = document.getElementById('pExitVelo').value;
        const batSpeed = document.getElementById('pBatSpeed').value;

        newPlayer = {
            id: generateUUID(), name, type: '타자', age: ageGroup, realAge: ageInput, exp: expInput, height: heightInput, weight: weightInput,
            batterPos, season, goal, week: 1, exitVelo, batSpeed, trainingTime: parseInt(trainingTime),
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
        const maxVelo = document.getElementById('pMaxVelo').value;
        const avgVelo = document.getElementById('pAvgVelo').value;
        const rpm = document.getElementById('pRPM').value;
        const pitchDate = document.getElementById('pPitchDate').value;
        const trainingTime = document.getElementById('pTime').value;

        if (parseFloat(avgVelo) > parseFloat(maxVelo)) {
            return customAlert('평균구속이 최고구속보다 높을 수 없습니다.');
        }

        newPlayer = {
            id: generateUUID(), name, type: '투수', age: ageGroup, realAge: ageInput, exp: expInput, height: heightInput, weight: weightInput, role, season, goal, week: 1, maxVelo, avgVelo, rpm, pitchDate, trainingTime: parseInt(trainingTime),
            scores: null, wellness: { sleep: 7, fatigue: 3, soreness: 2, pain: painAreas, recovery: recoveryData, date: getTodayStr() },
            isUpgraded: false, prevMaxVelo: maxVelo, prevRPM: rpm,
            weekStartDate: getTodayStr(), dailyCompletion: {},
            performanceHistory: [{ date: new Date().toISOString().split('T')[0], maxVelo, avgVelo, rpm }],
            workloadHistory: []
        };
    }

    players.push(newPlayer);
    saveDB();

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
        players = players.filter(p => String(p.id) !== String(id));
        saveDB();
        renderPlayerList();
    });
}

function getWeekAdvanceStatus(player) {
    const dailyCompletion = player && player.dailyCompletion ? player.dailyCompletion : {};
    const completedDays = Array.from({ length: 7 }, (_, index) => {
        const entry = dailyCompletion[index];
        return !!(entry && entry.completed);
    }).filter(Boolean).length;

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
        weekElapsed,
        allDaysCompleted,
        canAdvance: weekElapsed || allDaysCompleted
    };
}

function advancePlayerWeek(player) {
    player.week += 1;
    player.weekStartDate = getTodayStr();
    player.dailyCompletion = {};
}

function levelUp(id) {
    const p = players.find(p => String(p.id) === String(id));
    if (!p) return;

    if (!p.weekStartDate) {
        p.weekStartDate = getTodayStr();
        p.dailyCompletion = {};
        saveDB();
    }

    const progress = getWeekAdvanceStatus(p);
    if (!progress.canAdvance) {
        return customAlert(`❗️ 아직 ${p.week}주차를 마칠 수 없습니다. 7일이 지나거나 Day 1~7 훈련을 모두 완료한 뒤 다음 주차로 넘어갈 수 있습니다. (현재 완료 ${progress.completedDays}/7일)`);
    }

    advancePlayerWeek(p);
    saveDB();
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

function renderPlayerList() {
    const list = document.getElementById('playerList');
    if (players.length === 0) { list.innerHTML = '<div class="empty-state">등록된 선수가 없습니다.</div>'; return; }

    list.innerHTML = players.map(p => {
        const isEvenWeek = p.week % 2 === 0;
        const is4thWeek = p.week > 0 && p.week % 4 === 0;
        const pType = p.type || '투수';
        const typeBadge = pType === '타자'
            ? '<span class="player-type-badge batter">🏏 타자</span>'
            : '<span class="player-type-badge pitcher">⚾ 투수</span>';

        // 압축 행용: 오늘 컨디션 상태 및 위험 배지
        const isRowToday = p.wellness && p.wellness.date === getTodayStr();
        const rowPainAreas = p.wellness ? (Array.isArray(p.wellness.pain) ? p.wellness.pain : [p.wellness.pain]) : ['없음'];
        const rowHasPain = !rowPainAreas.includes('없음');
        const rowAcwr = p.scores ? calculateACWRMetrics(p).ratio : 0;
        const rowHasFatigue = isRowToday && p.wellness && (p.wellness.fatigue >= 4 || p.wellness.soreness >= 4);
        const rowStatusIcon = !isRowToday ? '⬜' : rowHasPain ? '🚨' : rowHasFatigue ? '⚠️' : '✅';
        let rowRiskHtml = '';
        if (!isRowToday && p.scores) rowRiskHtml += '<span class="player-risk-badge info">컨디션 미입력</span>';
        if (rowHasPain) rowRiskHtml += '<span class="player-risk-badge danger">통증</span>';
        if (rowAcwr > 1.5) rowRiskHtml += '<span class="player-risk-badge danger">ACWR위험</span>';
        else if (rowAcwr > 1.3) rowRiskHtml += '<span class="player-risk-badge warning">ACWR주의</span>';

        let veloBoxHtml = '';
        let statsGridHtml = '';
        let infoRowHtml = '';

        if (pType === '타자') {
            veloBoxHtml = `
            <div class="player-velo-box batter">
                <div class="player-velo-item">
                    <span class="player-velo-label">타구속도</span>
                    <span class="player-velo-value">${escapeHTML(p.exitVelo) || '-'}<small>km/h</small></span>
                </div>
                <div class="player-velo-divider"></div>
                <div class="player-velo-item">
                    <span class="player-velo-label">배트스피드</span>
                    <span class="player-velo-value">${escapeHTML(p.batSpeed) || '-'}<small>km/h</small></span>
                </div>
            </div>`;
            statsGridHtml = `
            <div class="player-stats-grid">
                <div class="player-stat-item"><span class="player-stat-label">키</span><span class="player-stat-value">${p.height ? p.height + 'cm' : '-'}</span></div>
                <div class="player-stat-item"><span class="player-stat-label">체중</span><span class="player-stat-value">${p.weight ? p.weight + 'kg' : '-'}</span></div>
                <div class="player-stat-item"><span class="player-stat-label">구력</span><span class="player-stat-value">${p.exp || 0}년</span></div>
                <div class="player-stat-item"><span class="player-stat-label">포지션</span><span class="player-stat-value">${escapeHTML(p.batterPos || '내야수')}</span></div>
            </div>`;
            infoRowHtml = `
            <div class="player-info-row">
                <span class="player-goal-tag">🎯 ${escapeHTML(p.goal)}</span>
                <span class="player-season-tag">${p.season === '시즌중' ? '⚾ 시즌중' : '🏋️ 비시즌'}</span>
            </div>`;
        } else {
            veloBoxHtml = `
            <div class="player-velo-box">
                <div class="player-velo-item">
                    <span class="player-velo-label">최고 구속</span>
                    <span class="player-velo-value">${escapeHTML(p.maxVelo) || '-'}<small>km/h</small></span>
                </div>
                <div class="player-velo-divider"></div>
                <div class="player-velo-item">
                    <span class="player-velo-label">평균 구속</span>
                    <span class="player-velo-value">${escapeHTML(p.avgVelo) || '-'}<small>km/h</small></span>
                </div>
                <div class="player-velo-divider"></div>
                <div class="player-velo-item">
                    <span class="player-velo-label">RPM</span>
                    <span class="player-velo-value">${escapeHTML(p.rpm) || '-'}</span>
                </div>
            </div>`;
            statsGridHtml = `
            <div class="player-stats-grid">
                <div class="player-stat-item"><span class="player-stat-label">키</span><span class="player-stat-value">${p.height ? p.height + 'cm' : '-'}</span></div>
                <div class="player-stat-item"><span class="player-stat-label">체중</span><span class="player-stat-value">${p.weight ? p.weight + 'kg' : '-'}</span></div>
                <div class="player-stat-item"><span class="player-stat-label">구력</span><span class="player-stat-value">${p.exp || 0}년</span></div>
                <div class="player-stat-item"><span class="player-stat-label">보직</span><span class="player-stat-value">${escapeHTML(p.role || '선발')}</span></div>
            </div>`;
            infoRowHtml = `
            <div class="player-info-row">
                <span class="player-goal-tag">🎯 ${escapeHTML(p.goal)}</span>
                <span class="player-season-tag">${p.season === '시즌중' ? '⚾ 시즌중' : '🏋️ 비시즌'}</span>
                <span class="player-pitch-date">📅 등판: ${escapeHTML(p.pitchDate) || '미정'}</span>
            </div>`;
        }

        return `
        <div class="player-row" id="player-row-${p.id}">
            <div class="player-row-header" onclick="togglePlayerDetail('${p.id}')">
                <div style="display:flex; align-items:center; gap:8px; min-width:0; flex:1;">
                    <span style="font-weight:700; font-size:16px; white-space:nowrap;">${escapeHTML(p.name)}</span>
                    ${typeBadge}
                </div>
                <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
                    <span class="player-week-badge">${p.week}주차</span>
                    <span style="font-size:16px;">${rowStatusIcon}</span>
                    ${rowRiskHtml}
                    <span class="player-row-chevron" id="chevron-${p.id}">▼</span>
                </div>
            </div>
            <div class="player-row-detail" id="detail-${p.id}">
                ${veloBoxHtml}
                ${statsGridHtml}
                ${infoRowHtml}
                <div class="player-actions" style="margin-top:12px;">
                    <button class="btn btn-primary btn-sm ${!p.scores ? 'btn-block' : ''}" onclick="goAssessOrResult('${p.id}')"><i data-lucide="${p.scores ? 'bar-chart-2' : 'clipboard-edit'}"></i> ${p.scores ? '결과/스케줄' : '초기 평가하기'}</button>
                    <button class="btn btn-sm" style="background:#e5e7eb; color:#374151;" onclick="editPlayer('${p.id}')"><i data-lucide="edit"></i> 정보 수정</button>
                    ${p.scores ? `<button class="btn btn-sm" style="background:var(--success-light); color:var(--success);" onclick="openWellness('${p.id}')"><i data-lucide="heart-pulse"></i> 컨디션</button>
                    <button class="btn btn-sm" style="background:var(--warning-light); color:#b45309;" onclick="levelUp('${p.id}')"><i data-lucide="arrow-up-circle"></i> +1주</button>` : ''}
                    ${isEvenWeek && p.scores ? `<button class="btn btn-sm btn-block" style="background:#e0e7ff; color:#4338ca; font-weight:700;" onclick="openPerformance('${p.id}')"><i data-lucide="trending-up"></i> 퍼포먼스 재측정</button>` : ''}
                    ${is4thWeek && p.scores ? `<button class="btn btn-sm btn-block" style="background:#fce7f3; color:#be185d; font-weight:700;" onclick="reAssessPlayer('${p.id}')"><i data-lucide="clipboard-list"></i> 정밀 재평가</button>` : ''}
                    <button class="btn btn-danger btn-sm ${!p.scores ? 'btn-block' : ''}" onclick="deletePlayer('${p.id}')"><i data-lucide="trash-2"></i> 삭제</button>
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
        checkWeekProgression(p);
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
        p.weekStartDate = getTodayStr();
        p.dailyCompletion = {};
        saveDB();
        return;
    }

    const progress = getWeekAdvanceStatus(p);
    if (progress.canAdvance) {
        if (p.lastPromptDate !== getTodayStr()) {
            p.lastPromptDate = getTodayStr();
            saveDB();
            setTimeout(() => {
                const promptReason = progress.weekElapsed
                    ? `${p.week}주차 훈련 기간(7일)이 지났습니다.`
                    : `${p.week}주차 Day 1~7 훈련을 모두 완료했습니다.`;
                customConfirm(`${p.name} 선수님, ${promptReason}\n다음 주차(${p.week + 1}주차) 훈련 프로그램으로 넘어가시겠습니까?`, () => {
                    advancePlayerWeek(p);
                    saveDB();
                    renderResult();
                });
            }, 500);
        }
    }
}

function editPlayer(id) {
    currentId = id;
    const p = players.find(p => String(p.id) === String(id));
    if (!p) return;

    const pType = p.type || '투수';
    selectPlayerType(pType, 'edit');

    document.getElementById('eName').value = p.name || '';
    document.getElementById('eAge').value = p.realAge || '';
    document.getElementById('eExp').value = p.exp || '';
    document.getElementById('eHeight').value = p.height || '';
    document.getElementById('eWeight').value = p.weight || '';

    if (pType === '타자') {
        document.getElementById('eBatterPos').value = p.batterPos || '내야수';
        document.getElementById('eBatterSeason').value = p.season || '비시즌';
        document.getElementById('eBatterGoal').value = p.goal || '타구속도 향상';
        document.getElementById('eBatterTime').value = p.trainingTime || '60';
        document.getElementById('eExitVelo').value = p.exitVelo || '';
        document.getElementById('eBatSpeed').value = p.batSpeed || '';
    } else {
        document.getElementById('eRole').value = p.role || '선발';
        document.getElementById('eSeason').value = p.season || '비시즌';
        document.getElementById('eGoal').value = p.goal || '구속 향상';
        document.getElementById('eTime').value = p.trainingTime || '60';
        document.getElementById('eMaxVelo').value = p.maxVelo || '';
        document.getElementById('eAvgVelo').value = p.avgVelo || '';
        document.getElementById('eRPM').value = p.rpm || '';
        document.getElementById('ePitchDate').value = p.pitchDate || '';
    }

    openModal('editPlayerModal');
}

function savePlayerEdit() {
    const p = players.find(p => String(p.id) === String(currentId));
    if (!p) return;

    const name = document.getElementById('eName').value.trim();
    const ageInput = parseInt(document.getElementById('eAge').value);
    const playerType = document.getElementById('eType').value;

    const expInput = parseInt(document.getElementById('eExp').value) || 0;
    if (expInput > ageInput) {
        return customAlert('구력이 나이보다 높을 수 없습니다.');
    }
    if (!name) return customAlert('선수 이름을 입력하세요.');
    if (isNaN(ageInput) || ageInput <= 0) return customAlert('올바른 나이를 입력하세요.');

    let ageGroup = '성인';
    if (ageInput <= 12) ageGroup = 'U-12';
    else if (ageInput <= 15) ageGroup = 'U-15';
    else if (ageInput <= 18) ageGroup = 'U-18';

    p.name = name;
    p.realAge = ageInput;
    p.age = ageGroup;
    p.exp = expInput;
    p.height = parseInt(document.getElementById('eHeight').value) || 0;
    p.weight = parseInt(document.getElementById('eWeight').value) || 0;
    p.type = playerType;

    if (playerType === '타자') {
        p.batterPos = document.getElementById('eBatterPos').value;
        p.season = document.getElementById('eBatterSeason').value;
        p.goal = document.getElementById('eBatterGoal').value;
        p.trainingTime = parseInt(document.getElementById('eBatterTime').value) || 60;

        const newExitVelo = document.getElementById('eExitVelo').value;
        const newBatSpeed = document.getElementById('eBatSpeed').value;

        if (p.exitVelo !== newExitVelo || p.batSpeed !== newBatSpeed) {
            if (!p.performanceHistory) p.performanceHistory = [{ date: new Date().toISOString().split('T')[0], exitVelo: p.exitVelo, batSpeed: p.batSpeed }];
            p.performanceHistory.push({ date: new Date().toISOString().split('T')[0], exitVelo: newExitVelo, batSpeed: newBatSpeed });
        }
        p.exitVelo = newExitVelo;
        p.batSpeed = newBatSpeed;
    } else {
        const newMax = document.getElementById('eMaxVelo').value;
        const newAvg = document.getElementById('eAvgVelo').value;

        if (parseFloat(newAvg) > parseFloat(newMax)) {
            return customAlert('평균구속이 최고구속보다 높을 수 없습니다.');
        }

        p.role = document.getElementById('eRole').value;
        p.season = document.getElementById('eSeason').value;
        p.goal = document.getElementById('eGoal').value;
        p.trainingTime = parseInt(document.getElementById('eTime').value) || 60;

        const newRPM = document.getElementById('eRPM').value;

        if (p.maxVelo !== newMax || p.avgVelo !== newAvg || p.rpm !== newRPM) {
            if (!p.performanceHistory) p.performanceHistory = [{ date: new Date().toISOString().split('T')[0], maxVelo: p.maxVelo, avgVelo: p.avgVelo, rpm: p.rpm }];
            p.performanceHistory.push({ date: new Date().toISOString().split('T')[0], maxVelo: newMax, avgVelo: newAvg, rpm: newRPM });
        }

        p.maxVelo = newMax;
        p.avgVelo = newAvg;
        p.rpm = newRPM;
        p.pitchDate = document.getElementById('ePitchDate').value;
    }

    saveDB();
    closeModal('editPlayerModal');
    renderPlayerList();
    customAlert('선수 정보가 수정되었습니다.');
}

function renderAssessmentForm(p) {
    document.getElementById('assessPlayerName').innerText = `${escapeHTML(p.name)} (${escapeHTML(p.age)})`;
    const form = document.getElementById('assessmentForm');
    const pType = p.type || '투수';

    const keys = pType === '타자'
        ? ['sprint', 'squat', 'deadlift', 'lateralBound', 'broadJump', 'thoracic', 'hip', 'core']
        : ['sprint', 'squat', 'deadlift', 'pullup', 'broadJump', 'thoracic', 'hip', 'core'];

    form.innerHTML = keys.map(key => {
        const c = criteriaDB[key];
        const options = c[p.age].map((opt, i) => `<option value="${i + 1}">${opt}</option>`).join('');
        return `
            <div class="assess-item">
                <div class="assess-title">${c.name}</div>
                <div class="assess-desc">${c.desc}</div>
                <select id="score_${key}" class="form-control">
                    ${options}
                </select>
            </div>
        `;
    }).join('');
}

function saveAssessment() {
    const p = players.find(p => String(p.id) === String(currentId));
    if (!p) return;
    const pType = p.type || '투수';

    const keys = pType === '타자'
        ? ['sprint', 'squat', 'deadlift', 'lateralBound', 'broadJump', 'thoracic', 'hip', 'core']
        : ['sprint', 'squat', 'deadlift', 'pullup', 'broadJump', 'thoracic', 'hip', 'core'];

    p.scores = {};
    keys.forEach(key => {
        p.scores[key] = parseInt(document.getElementById(`score_${key}`).value);
    });

    p.week = 1;
    p.weekStartDate = getTodayStr();
    p.dailyCompletion = {};

    saveDB();
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

    if (rpeInput !== '' && pitchCountInput !== '') {
        displayEl.style.display = 'block';
        if (workload === 0) {
            displayEl.style.background = '#f1f5f9';
            displayEl.style.color = '#475569';
            displayEl.style.border = '1px solid #e2e8f0';
            const noActionLabel = (p && p.type === '타자') ? '타격' : '투구';
            displayEl.innerHTML = `✅ 오늘 ${noActionLabel}하지 않음 (워크로드: 0)`;
        } else if (workload > threshold) {
            displayEl.style.background = 'rgba(239, 68, 68, 0.1)';
            displayEl.style.color = 'var(--danger)';
            displayEl.style.border = '1px solid rgba(239, 68, 68, 0.2)';
            displayEl.innerHTML = `🚨 주의: ${ageLabel} 권장 워크로드(${threshold}) 초과! (${workload})`;
        } else {
            displayEl.style.background = 'rgba(49, 130, 246, 0.1)';
            displayEl.style.color = 'var(--primary)';
            displayEl.style.border = '1px solid rgba(49, 130, 246, 0.2)';
            displayEl.innerHTML = `📊 실시간 예상 워크로드: ${workload} (안전 범위: ~${threshold})`;
        }
    } else {
        displayEl.style.display = 'none';
        displayEl.innerHTML = '';
    }
}

function setNoWorkloadToday() {
    document.getElementById('wlRPE').value = 0;
    document.getElementById('wlPitchCount').value = 0;
    calculateLiveWorkload();
}

function openWellness(id) {
    currentId = id;
    const p = players.find(p => String(p.id) === String(id));
    if (p.wellness.date !== getTodayStr()) {
        p.wellness = { sleep: 7, fatigue: 3, soreness: 2, pain: ['없음'], recovery: { '없음': 10 }, date: getTodayStr() };
    }
    document.getElementById('wSleep').value = p.wellness.sleep; document.getElementById('wSleepVal').innerText = p.wellness.sleep;
    document.getElementById('wFatigue').value = p.wellness.fatigue; document.getElementById('wFatigueVal').innerText = p.wellness.fatigue;
    document.getElementById('wSoreness').value = p.wellness.soreness; document.getElementById('wSorenessVal').innerText = p.wellness.soreness;

    const painAreas = Array.isArray(p.wellness.pain) ? p.wellness.pain : [p.wellness.pain];
    document.querySelectorAll('input[name="wPain"]').forEach(cb => {
        cb.checked = painAreas.includes(cb.value);
    });

    // 모달 열 때 통증 상태에 따라 회복 수준 바 표시 여부 업데이트
    const isNone = painAreas.includes('없음');
    const recoveryGroup = document.getElementById('wellnessRecoveryGroup');
    if (recoveryGroup) {
        if (isNone) {
            recoveryGroup.style.display = 'none';
            recoveryGroup.innerHTML = '';
        } else {
            recoveryGroup.style.display = 'block';
            let slidersHtml = `<label class="form-label" style="margin-bottom: 12px; display: block;">통증 부위별 현재 회복 수준 (1:최악 ~ 10:최상)</label>`;

            painAreas.forEach(area => {
                let currentValue = 5;
                if (p.wellness.recovery && typeof p.wellness.recovery === 'object' && p.wellness.recovery[area]) {
                    currentValue = p.wellness.recovery[area];
                }

                slidersHtml += `
                    <div style="margin-bottom: 16px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 13px; color: var(--text-color);">
                            <span>${area} 회복 수준</span>
                            <span class="range-val" id="rLvVal_wPain_${area}" style="font-size: 14px;">${currentValue}</span>
                        </div>
                        <div class="range-wrap" style="margin-top: 0;">
                            <input type="range" id="rLv_wPain_${area}" class="dynamic-recovery-slider" data-area="${area}" min="1" max="10" step="1" value="${currentValue}" oninput="document.getElementById('rLvVal_wPain_${area}').innerText=this.value">
                        </div>
                    </div>
                `;
            });
            recoveryGroup.innerHTML = slidersHtml;
        }
    }

    openModal('wellnessModal');
}

function saveWellness() {
    const p = players.find(p => String(p.id) === String(currentId));

    const painCheckboxes = document.querySelectorAll('input[name="wPain"]:checked');
    let painAreas = Array.from(painCheckboxes).map(cb => cb.value);
    if (painAreas.length === 0 || painAreas.includes('없음')) painAreas = ['없음'];

    let recoveryData = {};
    if (!painAreas.includes('없음')) {
        painAreas.forEach(area => {
            const slider = document.getElementById(`rLv_wPain_${area}`);
            if (slider) {
                recoveryData[area] = parseInt(slider.value);
            } else {
                recoveryData[area] = 5; // default
            }
        });
    } else {
        recoveryData = { '없음': 10 };
    }

    p.wellness = {
        sleep: parseFloat(document.getElementById('wSleep').value),
        fatigue: parseInt(document.getElementById('wFatigue').value),
        soreness: parseInt(document.getElementById('wSoreness').value),
        recovery: recoveryData,
        pain: painAreas,
        date: getTodayStr()
    };
    saveDB(); closeModal('wellnessModal'); customAlert(`컨디션이 저장되었습니다. 스케줄에 실시간 반영됩니다.`);
    if (document.getElementById('s3').classList.contains('active')) renderResult();
}

function openPerformance(id) {
    currentId = id;
    const p = players.find(p => String(p.id) === String(id));
    const pType = p.type || '투수';
    if (pType === '타자') {
        document.getElementById('perfPitcherFields').style.display = 'none';
        document.getElementById('perfBatterFields').style.display = '';
        document.getElementById('newExitVelo').value = p.exitVelo || '';
        document.getElementById('newBatSpeed').value = p.batSpeed || '';
    } else {
        document.getElementById('perfPitcherFields').style.display = '';
        document.getElementById('perfBatterFields').style.display = 'none';
        document.getElementById('newMaxVelo').value = p.maxVelo || '';
        document.getElementById('newAvgVelo').value = p.avgVelo || '';
        document.getElementById('newRPM').value = p.rpm || '';
    }
    openModal('perfModal');
}

function savePerformance() {
    const p = players.find(p => String(p.id) === String(currentId));
    const pType = p.type || '투수';

    if (pType === '타자') {
        const newExitVelo = parseFloat(document.getElementById('newExitVelo').value) || 0;
        const newBatSpeed = parseFloat(document.getElementById('newBatSpeed').value) || 0;
        const oldExitVelo = parseFloat(p.exitVelo) || 0;

        p.prevExitVelo = p.exitVelo;
        if (!p.performanceHistory) p.performanceHistory = [{ date: new Date().toISOString().split('T')[0], exitVelo: oldExitVelo, batSpeed: p.batSpeed }];
        p.performanceHistory.push({ date: new Date().toISOString().split('T')[0], exitVelo: newExitVelo, batSpeed: newBatSpeed });
        p.exitVelo = newExitVelo;
        p.batSpeed = newBatSpeed;

        if (newExitVelo > oldExitVelo) {
            p.isUpgraded = true;
            p.upgradeMsg = `🎉 축하합니다! 퍼포먼스 향상 (타구속도: ${oldExitVelo} -> ${newExitVelo}km/h)`;
        } else {
            p.isUpgraded = false;
            p.upgradeMsg = `💪 꾸준함이 정답입니다! 다음 측정까지 파이팅!`;
        }
    } else {
        const newMax = parseFloat(document.getElementById('newMaxVelo').value) || 0;
        const newAvg = parseFloat(document.getElementById('newAvgVelo').value) || 0;
        const newRPM = parseFloat(document.getElementById('newRPM').value) || 0;

        if (newAvg > newMax) {
            return customAlert('평균구속이 최고구속보다 높을 수 없습니다.');
        }

        const oldMax = parseFloat(p.maxVelo) || 0;
        const oldRPM = parseFloat(p.rpm) || 0;

        p.prevMaxVelo = p.maxVelo;
        p.prevRPM = p.rpm;

        if (!p.performanceHistory) p.performanceHistory = [{ date: new Date().toISOString().split('T')[0], maxVelo: oldMax, avgVelo: p.avgVelo, rpm: oldRPM }];
        p.performanceHistory.push({ date: new Date().toISOString().split('T')[0], maxVelo: newMax, avgVelo: newAvg, rpm: newRPM });

        p.maxVelo = newMax;
        p.avgVelo = newAvg;
        p.rpm = newRPM;

        if (newMax > oldMax || newRPM > oldRPM) {
            p.isUpgraded = true;
            p.upgradeMsg = `🎉 축하합니다! 퍼포먼스 향상 (구속: ${oldMax} -> ${newMax}km/h, RPM: ${oldRPM} -> ${newRPM})`;
        } else {
            p.isUpgraded = false;
            p.upgradeMsg = `💪 꾸준함이 정답입니다! 다음 측정까지 파이팅!`;
        }
    }

    saveDB();
    closeModal('perfModal');
    renderPlayerList();
    customAlert('퍼포먼스 재측정 결과가 저장되었습니다.');
}

function renderResult() {
    const p = players.find(p => String(p.id) === String(currentId));
    document.getElementById('resName').innerText = `${escapeHTML(p.name)} 선수 리포트`;
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
                backgroundColor: 'rgba(37, 99, 235, 0.2)', borderColor: 'rgba(37, 99, 235, 1)',
                pointBackgroundColor: 'rgba(37, 99, 235, 1)', borderWidth: 2, pointRadius: 4
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: { r: { min: 0, max: 5, ticks: { stepSize: 1, display: false }, pointLabels: { font: { family: 'Pretendard', size: 12, weight: 'bold' }, color: '#475569' } } },
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
                    { label: '타구속도 (km/h)', data: exitVeloData, borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.1)', yAxisID: 'y', tension: 0.3, fill: true },
                    { label: '배트스피드 (km/h)', data: batSpeedData, borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', yAxisID: 'y', tension: 0.3, fill: true }
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
                    { label: '최고 구속 (km/h)', data: maxVeloData, borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', yAxisID: 'y', tension: 0.3, fill: true },
                    { label: '평균 구속 (km/h)', data: avgVeloData, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', yAxisID: 'y', tension: 0.3, fill: true },
                    { label: 'RPM', data: rpmData, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', yAxisID: 'y1', tension: 0.3, fill: true }
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
    if (!isReady) {
        document.getElementById('acuteLoad').innerText = '0';
        document.getElementById('chronicLoad').innerText = '0';
        document.getElementById('acwrRatio').innerText = '0.00';
        document.getElementById('acwrStatus').innerText = '데이터 수집 중 (최소 7일 필요)';
        document.getElementById('acwrStatus').style.backgroundColor = '#f1f5f9';
        document.getElementById('acwrStatus').style.color = '#475569';
        return;
    }

    document.getElementById('acuteLoad').innerText = acuteLoad;
    document.getElementById('chronicLoad').innerText = chronicLoad.toFixed(1);
    document.getElementById('acwrRatio').innerText = acwr.toFixed(2);

    const statusEl = document.getElementById('acwrStatus');
    if (acwr === 0) {
        statusEl.innerText = '데이터 부족';
        statusEl.style.backgroundColor = '#f1f5f9';
        statusEl.style.color = '#475569';
    } else if (acwr >= 0.8 && acwr <= 1.3) {
        statusEl.innerText = '안전 영역 (최적의 부하)';
        statusEl.style.backgroundColor = '#dcfce7';
        statusEl.style.color = '#166534';
    } else if (acwr > 1.3 && acwr <= 1.5) {
        statusEl.innerText = '주의 영역 (부상 위험 증가)';
        statusEl.style.backgroundColor = '#fef08a';
        statusEl.style.color = '#854d0e';
    } else if (acwr > 1.5) {
        statusEl.innerText = '위험 영역 (부상 위험 매우 높음)';
        statusEl.style.backgroundColor = '#fecaca';
        statusEl.style.color = '#991b1b';
    } else {
        statusEl.innerText = '훈련 부족 (부하 미달)';
        statusEl.style.backgroundColor = '#e0e7ff';
        statusEl.style.color = '#3730a3';
    }
}

function renderWeeklyCalendar(p) {
    const container = document.getElementById('calendarContainer');
    const cardContainer = document.getElementById('scheduleContainer');
    const guideText = document.getElementById('scheduleGuideText');
    const summarySection = document.getElementById('todaySummarySection');
    if (summarySection) summarySection.style.display = 'none';

    container.style.display = 'grid';
    cardContainer.style.display = 'none';
    if (guideText) guideText.innerText = "💡 날짜를 클릭하여 해당 일차의 운동 목록과 워크로드를 확인하세요.";

    // 기준일 계산 (Day 1)
    const baseDate = p.weekStartDate ? parseLocalDate(p.weekStartDate) : new Date();
    const startDay = baseDate.getDay(); // 0(일) ~ 6(토)

    // 현재 진행 일차 계산
    let currentDayIdx = 0;
    if (p.weekStartDate) {
        const diff = Math.floor((new Date() - parseLocalDate(p.weekStartDate)) / (1000 * 60 * 60 * 24));
        currentDayIdx = Math.max(0, diff);
    }

    let html = `<div class="calendar-grid">`;
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

        let statusClass = '';
        let statusText = '미완료';
        if (isCompleted) { statusClass = 'completed'; statusText = '완료'; }
        else if (isToday) { statusClass = 'today'; statusText = '오늘'; }
        else if (isFuture) { statusClass = 'locked'; statusText = '잠금'; }
        else if (isMissed) { statusClass = 'missed'; statusText = '미완료'; }

        html += `
            <div class="calendar-cell ${statusClass}" onclick="toggleViewMode('card')">
                <div class="cal-day-label">Day ${i + 1}</div>
                <div class="cal-date">${dateStr}(${dayName})</div>
                <div class="cal-status-badge">${statusText}</div>
                ${isCompleted ? `<div class="cal-workload">WL: ${p.dailyCompletion[i].workload}</div>` : ''}
            </div>
        `;
    }
    html += `</div>`;
    container.innerHTML = html;
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
    if (guideText) guideText.innerText = '💡 날짜를 클릭하면 해당 일차의 상세 정보를 확인할 수 있습니다.';

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

        if (hasSchedule) {
            const exs = _cachedDayExercises[dayIndex];
            const status = getScheduleStatus(p, dayIndex, exs);
            const statusClassMap = { '완료': 'mc-completed', '오늘': 'mc-today', '잠금': 'mc-locked', '미완료': 'mc-missed', '휴식': 'mc-rest' };
            cellClass += ` ${statusClassMap[status] || ''}`;
            statusText = status;
            if (status === '완료' && p.dailyCompletion[dayIndex]) {
                workloadText = `WL: ${p.dailyCompletion[dayIndex].workload}`;
            }
        } else {
            cellClass += ' mc-none';
            statusText = '비배정';
        }

        html += `
            <div class="${cellClass}" data-date="${dateStr}" data-day-index="${hasSchedule ? dayIndex : ''}" data-player-id="${p.id}">
                <div class="mc-date">${date}</div>
                ${hasSchedule ? `<div class="mc-day-label">Day ${dayIndex + 1}</div>` : ''}
                ${statusText ? `<div class="mc-status">${statusText}</div>` : ''}
                ${workloadText ? `<div class="mc-workload">${workloadText}</div>` : ''}
            </div>
        `;
    }

    html += `</div>`;
    html += `<div id="dayDetailPanel" class="day-detail-panel" style="display:none;"></div>`;
    container.innerHTML = html;

    // 이벤트 위임 - 누적 방지: 기존 핸들러 제거 후 새 핸들러 등록
    if (_monthlyClickHandler) {
        container.removeEventListener('click', _monthlyClickHandler);
    }
    _monthlyClickHandler = function (e) {
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

        const cell = e.target.closest('.monthly-cell[data-day-index]');
        if (!cell || cell.dataset.dayIndex === '') return;

        const dayIdx = parseInt(cell.dataset.dayIndex);
        const panel = document.getElementById('dayDetailPanel');
        const cached = _cachedDayExercises[dayIdx];
        const status = getScheduleStatus(p, dayIdx, cached);
        const dc = p.dailyCompletion && p.dailyCompletion[dayIdx];
        const dateLabel = cell.dataset.date;

        const pType = (p.type || '투수');
        const countLabel = pType === '타자' ? '타격(스윙) 수' : '투구 수';

        let detailHtml = `<div class="detail-header"><strong>Day ${dayIdx + 1}</strong> <span>${dateLabel}</span> <span class="detail-status ${status}">${status}</span></div>`;

        if (status === '완료' && dc) {
            detailHtml += `<div class="detail-row">RPE ${dc.rpe} × ${countLabel} ${dc.pitchCount} = <strong>WL ${dc.workload}</strong></div>`;
        }

        if (cached && cached.length > 0) {
            detailHtml += `<ul class="detail-exercise-list">`;
            cached.forEach(ex => {
                const li = document.createElement('li');
                li.textContent = `${ex.name} — ${ex.sets}세트 × ${ex.reps}`;
                detailHtml += li.outerHTML;
            });
            detailHtml += `</ul>`;
        } else {
            detailHtml += `<p class="detail-hint">운동 목록은 카드형 뷰에서 먼저 로드해주세요.</p>`;
        }

        if (status === '오늘' || status === '완료') {
            detailHtml += `<button class="btn btn-primary btn-sm" style="margin-top:8px;" onclick="openWorkloadModal('${p.id}', ${dayIdx})">워크로드 입력</button>`;
        }

        panel.innerHTML = detailHtml;
        panel.style.display = 'block';
        lucide.createIcons();
    };
    container.addEventListener('click', _monthlyClickHandler);
}

function renderTeamDashboard() {
    const statsGrid = document.getElementById('teamStatsGrid');
    const riskList = document.getElementById('riskPlayerList');

    const total = players.length;
    const assessed = players.filter(p => p.scores).length;
    const missingWellness = players.filter(p => p.scores && p.wellness.date !== getTodayStr()).length;
    const highRiskACWR = players.filter(p => {
        const metrics = calculateACWRMetrics(p);
        return metrics.isReady && metrics.ratio > 1.3;
    }).length;

    statsGrid.innerHTML = `
        <div class="stat-card">
            <div class="label">전체 선수</div>
            <div class="value">${total}</div>
        </div>
        <div class="stat-card">
            <div class="label">평가 완료</div>
            <div class="value">${assessed}</div>
        </div>
        <div class="stat-card warning">
            <div class="label">웰니스 미입력</div>
            <div class="value">${missingWellness}</div>
        </div>
        <div class="stat-card danger">
            <div class="label">ACWR 주의</div>
            <div class="value">${highRiskACWR}</div>
        </div>
    `;

    // 위험군 선수 추출
    const riskPlayers = players.filter(p => {
        if (!p.scores) return false;
        const hasPain = p.wellness.date === getTodayStr() && !p.wellness.pain.includes('없음');
        const hasLowRecovery = p.wellness.date === getTodayStr() && Object.values(p.wellness.recovery || {}).some(v => v <= 3);
        return hasPain || hasLowRecovery;
    });

    if (riskPlayers.length === 0) {
        riskList.innerHTML = '<div class="empty-state">현재 집중 관리 대상 선수가 없습니다.</div>';
    } else {
        riskList.innerHTML = riskPlayers.map(p => {
            const painMsg = p.wellness.pain.filter(v => v !== '없음').join(', ');
            return `
                <div class="mini-player-card" onclick="goAssessOrResult('${p.id}')">
                    <div class="info">
                        <span class="name">${escapeHTML(p.name)}</span>
                        <span class="type">${p.type === '타자' ? '🏏' : '⚾'}</span>
                    </div>
                    <div class="risk-tags">
                        ${painMsg ? `<span class="tag pain">통증: ${painMsg}</span>` : ''}
                        ${Object.values(p.wellness.recovery || {}).some(v => v <= 3) ? `<span class="tag recovery">회복저하</span>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }
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
    if (guideText) guideText.innerText = "💡 운동 항목을 클릭하면 상세 가이드를 볼 수 있습니다.";

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
            volDown = true; badgesHtml += `<div class="badge badge-warning">⚠️ 피로/근육통 높음 또는 회복 부족: 오늘 세트 수 1 하향 조정</div>`;
        }

        painAreas = Array.isArray(p.wellness.pain) ? p.wellness.pain : [p.wellness.pain];
        if (!painAreas.includes('없음')) {
            badgesHtml += `<div class="badge badge-danger">🚨 통증(${painAreas.join(', ')}): 관련 운동 대체 프로그램 적용</div>`;
        }

        if (!volDown && painAreas.includes('없음')) badgesHtml += `<div class="badge badge-success">✅ 컨디션 양호: 정상 스케줄 진행</div>`;
    } else {
        badgesHtml += `<div class="badge" style="background:#f1f5f9; color:#475569; border:1px solid #e2e8f0;">ℹ️ 오늘의 컨디션이 입력되지 않았습니다. (기본 스케줄)</div>`;
    }

    // 어제 워크로드 확인 (highWorkload 로직)
    let currentDayIndex = 0;
    if (p.weekStartDate) {
        const start = parseLocalDate(p.weekStartDate);
        const now = new Date();
        const diffTime = now - start;
        currentDayIndex = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (currentDayIndex < 0) currentDayIndex = 0;
    }

    if (currentDayIndex > 0 && p.dailyCompletion && p.dailyCompletion[currentDayIndex - 1]) {
        const yesterdayWorkload = p.dailyCompletion[currentDayIndex - 1].workload;
        if (yesterdayWorkload && yesterdayWorkload > threshold) {
            highWorkload = true;
            volDown = true;
            badgesHtml += `<div class="badge badge-warning">⚠️ 어제 ${p.age} 권장 워크로드(${threshold}) 초과: 오늘 부상 방지 스케줄 자동 적용</div>`;
        }
    }

    if (p.dailyCompletion && p.dailyCompletion[currentDayIndex] && p.dailyCompletion[currentDayIndex].completed) {
        const todayWorkload = p.dailyCompletion[currentDayIndex].workload;
        const workloadLabel = (p.type || '투수') === '타자' ? '오늘의 타격 워크로드' : '오늘의 투구 워크로드';
        const countLabel = (p.type || '투수') === '타자' ? '타격(스윙) 수' : '투구 수';
        const noWorkloadLabel = (p.type || '투수') === '타자' ? '오늘 타격하지 않음' : '오늘 투구하지 않음';
        if (todayWorkload > 0) {
            badgesHtml += `<div class="badge badge-info">📊 ${workloadLabel}: ${todayWorkload} (RPE ${p.dailyCompletion[currentDayIndex].rpe} x ${countLabel} ${p.dailyCompletion[currentDayIndex].pitchCount})</div>`;
        } else {
            badgesHtml += `<div class="badge" style="background:#f1f5f9; color:#475569; border:1px solid #e2e8f0;">✅ ${noWorkloadLabel} (워크로드: 0)</div>`;
        }
    }

    if (p.upgradeMsg) {
        if (p.isUpgraded) {
            badgesHtml += `<div class="badge" style="background:#e0e7ff; color:#4338ca; border:none;">${p.upgradeMsg}</div>`;
        } else {
            badgesHtml += `<div class="badge" style="background:#f3f4f6; color:#4b5563; border:none;">${p.upgradeMsg}</div>`;
        }
    }

    // ACWR 배지 추가
    if (acwr > 1.5) {
        badgesHtml += `<div class="badge badge-danger">🚨 ACWR 위험 (${acwr.toFixed(2)}): 부상 위험이 매우 높습니다. 휴식이 필요합니다.</div>`;
    } else if (acwr > 1.3) {
        badgesHtml += `<div class="badge badge-warning">⚠️ ACWR 주의 (${acwr.toFixed(2)}): 상체 운동 볼륨이 50% 감소합니다.</div>`;
    }

    badgeContainer.innerHTML = badgesHtml;

    const scheduleTitleEl = document.getElementById('scheduleTitle');
    if (scheduleTitleEl) {
        if (p.isUpgraded) {
            scheduleTitleEl.innerHTML = `맞춤형 1주일(7일) 스케줄 <span style="color:var(--danger); font-size:14px;">[🔥성장 레벨업 스케줄 적용]</span>`;
        } else {
            scheduleTitleEl.innerHTML = `맞춤형 1주일(7일) 스케줄`;
        }
    }

    // 7일치 전체 스케줄 확장 로직
    let baseSchedule = [];
    if (p.goal === '구속 향상') {
        baseSchedule = [
            { day: 'Day 1 (파워 & 지면반발력)', exercises: [{ name: '스파이더맨 런지 & 흉추 회전', sets: 2, reps: '각 5회' }, { name: '데스 점프', sets: 3, reps: '5회' }, { name: '트랩바(또는 덤벨) 데드리프트', sets: 3, reps: '5-8회' }, { name: '메디신볼 샷풋 스로우', sets: 3, reps: '각 6회' }] },
            { day: 'Day 2 (상체 파워 & 감속)', exercises: [{ name: '스파이더맨 런지 & 흉추 회전', sets: 2, reps: '각 5회' }, { name: '푸시업', sets: 3, reps: '최대' }, { name: '메디신볼 로테이셔널 스로우', sets: 3, reps: '각 8회' }, { name: '편심성 이두근 컬', sets: 3, reps: '10회' }] },
            { day: 'Day 3 (적극적 회복 & 모빌리티)', exercises: [{ name: '브렛젤 스트레칭', sets: 2, reps: '각 60초' }, { name: '90/90 자세', sets: 2, reps: '각 60초' }, { name: '폼롤러 흉추 신전', sets: 2, reps: '15회' }, { name: '버드독', sets: 2, reps: '각 10회' }] },
            { day: 'Day 4 (편측성 폭발력)', exercises: [{ name: '스파이더맨 런지 & 흉추 회전', sets: 2, reps: '각 5회' }, { name: '불가리안 스플릿 스쿼트 점프', sets: 3, reps: '각 6회' }, { name: '덤벨 스내치', sets: 3, reps: '각 6회' }, { name: '스케이터 점프', sets: 3, reps: '각 8회' }] },
            { day: 'Day 5 (회전 코어 & 힙 드라이브)', exercises: [{ name: '스파이더맨 런지 & 흉추 회전', sets: 2, reps: '각 5회' }, { name: '박스 점프', sets: 3, reps: '5회' }, { name: '케틀벨 스윙', sets: 3, reps: '12회' }, { name: '사이드 플랭크', sets: 3, reps: '각 45초' }] },
            { day: 'Day 6 (밸런스 & 안정성)', exercises: [{ name: '스파이더맨 런지 & 흉추 회전', sets: 2, reps: '각 5회' }, { name: '싱글레그 아이소메트릭 홀드', sets: 3, reps: '각 20초' }, { name: 'Y-레이즈', sets: 3, reps: '15회' }, { name: 'DNS 스타 플랭크', sets: 3, reps: '각 30초' }] },
            { day: 'Day 7 (완전 휴식)', exercises: [{ name: '휴식', sets: 0, reps: '0회' }] }
        ];
    } else if (p.goal === '제구 안정') {
        baseSchedule = [
            { day: 'Day 1 (지지발 안정성 & 항회전 코어)', exercises: [{ name: '스파이더맨 런지 & 흉추 회전', sets: 2, reps: '각 5회' }, { name: '싱글레그 아이소메트릭 홀드', sets: 3, reps: '각 20초' }, { name: '밴드 촙 & 리프트', sets: 3, reps: '각 10회' }, { name: '데드버그', sets: 3, reps: '20회' }] },
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

    if (p.role === '선발') {
        // 선발 투수: 하체 지구력 및 러닝 추가
        baseSchedule[0].exercises.push({ name: '폴투폴 러닝', sets: 5, reps: '왕복' });
        baseSchedule[4].exercises.push({ name: '인터벌 러닝', sets: 5, reps: '30초 전력/30초 걷기' });
    } else if (p.role === '구원' || p.role === '마무리') {
        // 구원 투수: 단기 폭발력 및 연투 회복
        baseSchedule[0].exercises.push({ name: '메디신볼 슬램', sets: 3, reps: '10회' });
        baseSchedule[2].exercises.push({ name: '튜빙 밴드 회전근개', sets: 3, reps: '15회' });
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
                day.exercises.unshift({ name: '전완근 아이소메트릭 홀드 (재활)', sets: 2, reps: '30초' });
            }
            if (painAreas.includes('허리')) {
                day.exercises.unshift({ name: '맥길 빅3 (버드독/사이드플랭크/컬업)', sets: 1, reps: '각 10회' });
            }
            if (painAreas.includes('무릎')) {
                day.exercises.unshift({ name: 'TKE (Terminal Knee Extension)', sets: 2, reps: '15회' });
            }
        });
    }

    // 투구 워크로드 초과 시 오늘 부상 방지 및 회복 스케줄로 대체
    let isHighWorkloadReplaced = false;
    if (highWorkload && baseSchedule.length > currentDayIndex) {
        baseSchedule[currentDayIndex].day = `Day ${currentDayIndex + 1} 🚨 (부상 방지 및 적극적 회복)`;
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

    // ── 오늘 요약 섹션 렌더 ──
    const summarySection = document.getElementById('todaySummarySection');
    if (summarySection) {
        const todayPlan = baseSchedule[currentDayIndex];
        const todayExerciseNames = todayPlan
            ? todayPlan.exercises.filter(e => e.name !== '휴식').map(e => escapeHTML(e.name)).join(', ')
            : '휴식';
        const isTodayDone = p.dailyCompletion[currentDayIndex] && p.dailyCompletion[currentDayIndex].completed;
        const todayDoneText = isTodayDone ? '✅ 완료' : '⬜ 미완료';
        const painStatusText = !painAreas.includes('없음') ? `🚨 통증: ${painAreas.join(', ')}` : '통증 없음';
        const acwrStatusText = acwr > 1.5 ? '🚨 ACWR 위험' : acwr > 1.3 ? '⚠️ ACWR 주의' : 'ACWR 정상';
        const workloadBtnId = `todaySummaryWlBtn_${currentDayIndex}`;

        summarySection.style.display = 'block';
        summarySection.innerHTML = `
            <div class="today-summary-card">
                <div style="font-size:13px; font-weight:700; color:var(--primary); margin-bottom:10px;">📋 오늘(Day ${currentDayIndex + 1}) 요약</div>
                <div style="font-size:13px; color:var(--text-main); margin-bottom:6px;"><strong>운동:</strong> ${todayExerciseNames}</div>
                <div style="display:flex; gap:10px; flex-wrap:wrap; font-size:12px; font-weight:600; margin-bottom:10px;">
                    <span>${todayDoneText}</span>
                    <span>|</span>
                    <span>${painStatusText}</span>
                    <span>|</span>
                    <span>${acwrStatusText}</span>
                </div>
                <button id="${workloadBtnId}" class="btn btn-primary btn-sm" style="font-size:13px; padding:8px 14px;" onclick="openWorkloadModal('${p.id}', ${currentDayIndex})">
                    🎯 워크로드 입력
                </button>
            </div>
        `;
    }

    // ── activeTab 초기값: currentDayIndex ──
    let activeDayTab = Math.min(currentDayIndex, 6);

    let scheduleHtml = `
        <div style="margin-bottom: 20px; background: white; padding: 16px; border-radius: 12px; border: 1px solid var(--border-color);">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-weight: 600; color: var(--text-color);">
                <span>이번 주 훈련 달성률</span>
                <span style="color: var(--primary);">${completedDays} / ${totalDays}일 (${progressPercent}%)</span>
            </div>
            <div style="width: 100%; background: #e2e8f0; border-radius: 8px; height: 10px; overflow: hidden;">
                <div style="width: ${progressPercent}%; background: var(--primary); height: 100%; transition: width 0.3s ease;"></div>
            </div>
        </div>
    `;

    // ── Day 탭 바 빌드 ──
    let tabBarHtml = `<div class="day-tab-bar" id="dayTabBar">`;
    baseSchedule.forEach((_, i) => {
        const isCompleted = p.dailyCompletion[i] && p.dailyCompletion[i].completed;
        const isTabToday = i === currentDayIndex;
        const isFutureTab = i > currentDayIndex;
        let mark = isFutureTab ? '🔒' : isCompleted ? '✅' : isTabToday ? '📍' : '⬜';
        tabBarHtml += `<button class="day-tab-btn${i === activeDayTab ? ' active' : ''}" id="dayTab_${i}" onclick="switchDayTab('${p.id}', ${i})"><span class="day-tab-num">D${i + 1}</span><span class="day-tab-mark">${mark}</span></button>`;
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
                const eqTags = getEquipmentTags(ex.name);
                let volHtml = ex.name === '휴식' ? '' : `${ex.sets}세트 x ${ex.reps}`;
                exHtml += `
                    <li class="exercise-item" onclick="openGuide('${ex.name}')">
                        <div class="ex-name">
                            <div class="exercise-item-wrapper">
                                <div style="display:flex; align-items:center; flex:1; min-width:0; gap:4px; flex-wrap:wrap;">
                                    <span class="ex-icon">▶</span> ${ex.name} ${eqTags}
                                </div>
                            </div>
                        </div>
                        <div class="ex-vol">${volHtml}</div>
                    </li>
                `;
                return;
            }
            let originalName = ex.name;
            let finalName = ex.name;
            let finalSets = ex.sets;
            let finalReps = ex.reps;
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
            if (!isReplaced && acwr > 1.3) {
                const exData = exerciseDB[finalName];
                if (exData && exData.contextCondition === 'normal') {
                    const swapOptions = exerciseSwapDB[finalName];
                    if (swapOptions) {
                        const recoverySwap = swapOptions.find(name => exerciseDB[name] && (exerciseDB[name].contextCondition === 'recovery' || exerciseDB[name].contextCondition === 'pain') && !seenNames.has(name));
                        if (recoverySwap) {
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

            let nameHtml = `<span class="ex-icon">▶</span> ${finalName}`;
            if (isReplaced && isAcwrReplaced) {
                nameHtml = `
                    <span class="ex-icon">▶</span>
                    <del style="color: #94a3b8; font-size: 11px; margin-right: 6px;">${originalName}</del>
                    <span style="color: #d97706; font-weight: 600;">[ACWR 부하 조정] ${finalName}</span>
                `;
            } else if (isReplaced) {
                nameHtml = `
                    <span class="ex-icon">▶</span>
                    <del style="color: #94a3b8; font-size: 11px; margin-right: 6px;">${originalName}</del>
                    <span style="color: var(--danger); font-weight: 600;">[${matchedPain} 보호] ${finalName}</span>
                `;
            } else if (isSwapped) {
                nameHtml = `
                    <span class="ex-icon">▶</span>
                    <del style="color: #94a3b8; font-size: 11px; margin-right: 6px;">${originalName}</del>
                    <span style="color: #7c3aed; font-weight: 600;">${finalName}</span>
                    <span class="swapped-indicator">🔄 대체됨</span>
                `;
            }

            const eqTags = getEquipmentTags(finalName);
            const canSwap = !isReplaced && finalName !== '휴식' && index >= currentDayIndex;
            const swapBtn = canSwap ? `<button class="ex-swap-btn" onclick="openSwapModal('${p.id}', ${index}, '${originalName}', event)">🔄 대체</button>` : '';

            nameHtml = `
                <div class="exercise-item-wrapper">
                    <div style="display:flex; align-items:center; flex:1; min-width:0; gap:4px; flex-wrap:wrap;">
                        ${nameHtml} ${eqTags}
                    </div>
                    ${swapBtn}
                </div>
            `;

            let volHtml = finalName === '휴식' ? '' : `${finalSets}세트 x ${finalReps}`;
            if (isAcwrDeloaded && !isReplaced && finalName !== '휴식') {
                volHtml = `
                    <del style="color: #94a3b8; font-size: 11px; margin-right: 4px;">${preAcwrSets}세트</del>
                    <span style="color: #854d0e; font-weight: 600;">${finalSets}세트 (ACWR 디로딩)</span> x ${finalReps}
                `;
            } else if (isVolDownApplied && !isReplaced && finalName !== '휴식') {
                volHtml = `
                    <del style="color: #94a3b8; font-size: 11px; margin-right: 4px;">${preVolDownSets}세트</del>
                    <span style="color: #f59e0b; font-weight: 600;">${finalSets}세트</span> x ${finalReps}
                `;
            }

            exHtml += `
                <li class="exercise-item" onclick="openGuide('${finalName}')">
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

        let cardStyle = '';
        let titleColor = '';
        let btnClass = '';
        let btnText = '';
        let btnDisabled = '';
        let btnAction = `onclick="openWorkloadModal('${p.id}', ${index})"`;
        let dayHeaderExtra = '';

        if (index > currentDayIndex) {
            // 미래의 훈련
            btnClass = 'btn-outline';
            btnText = '🔒 내일 이후 오픈';
            btnDisabled = 'disabled style="opacity: 0.5; cursor: not-allowed; padding: 6px 12px; font-size: 12px; border-radius: 6px;"';
            btnAction = '';
        } else if (index === currentDayIndex) {
            // 오늘의 훈련
            if (isCompleted) {
                cardStyle = 'background: #f0fdf4; border: 1px solid #86efac;';
                titleColor = 'color: #166534;';
                btnClass = 'btn-primary';
                btnText = '✅ 완료됨 (수정)';
                dayHeaderExtra = '<span style="background: var(--primary); color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-left: 8px;">🎯 오늘의 훈련</span>';
            } else {
                cardStyle = 'border: 2px solid var(--primary); box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);';
                btnClass = 'btn-primary';
                btnText = '🎯 오늘 훈련 완료하기';
                dayHeaderExtra = '<span style="background: var(--primary); color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-left: 8px;">🎯 오늘의 훈련</span>';
            }
        } else {
            // 과거의 훈련
            if (isCompleted) {
                cardStyle = 'background: #f0fdf4; border: 1px solid #86efac;';
                titleColor = 'color: #166534;';
                btnClass = 'btn-primary';
                btnText = '✅ 완료됨 (수정)';
            } else {
                cardStyle = 'border: 1px solid var(--danger);';
                btnClass = 'btn-outline';
                btnText = '⚠️ 뒤늦게 완료하기';
                titleColor = 'color: var(--danger);';
            }
        }

        let bannerHtml = '';
        if (index === currentDayIndex) {
            if (isHighWorkloadReplaced) {
                bannerHtml = `
                    <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: var(--danger); padding: 8px 12px; border-radius: 6px; font-size: 12px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 16px;">🔄</span>
                        <div><strong>스케줄 전면 대체됨:</strong> 어제 투구 워크로드 초과로 인해 오늘 훈련이 '부상 방지 및 회복' 프로그램으로 변경되었습니다.</div>
                    </div>
                `;
            } else if (isToday && (!painAreas.includes('없음') || volDown)) {
                let reasons = [];
                if (!painAreas.includes('없음')) reasons.push(`통증(${painAreas.join(', ')})으로 인한 운동 대체`);
                if (volDown) reasons.push(`컨디션 저하로 인한 세트 수 감소`);

                if (reasons.length > 0) {
                    bannerHtml = `
                        <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.2); color: #d97706; padding: 8px 12px; border-radius: 6px; font-size: 12px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 16px;">💡</span>
                            <div><strong>스케줄 부분 조정됨:</strong> ${reasons.join(' 및 ')}가 적용되었습니다.</div>
                        </div>
                    `;
                }
            }
        }

        const tabHidden = index !== activeDayTab ? 'display:none;' : '';
        scheduleHtml += `
            <div class="schedule-day" id="scheduleDay_${index}" style="${cardStyle} ${tabHidden} transition: all 0.2s ease;">
                <div class="day-header" style="display: flex; justify-content: space-between; align-items: center; ${titleColor}">
                    <div><span>${dayPlan.day}</span>${dayHeaderExtra}</div>
                    <button ${btnAction} class="btn ${btnClass}" ${btnDisabled ? btnDisabled : 'style="padding: 6px 12px; font-size: 12px; border-radius: 6px;"'}>
                        ${btnText}
                    </button>
                </div>
                ${bannerHtml}
                <ul class="exercise-list">${exHtml}</ul>
            </div>
        `;
    });
    scheduleContainer.innerHTML = scheduleHtml;
}

let currentWorkloadDayIndex = 0;
let _cachedDayExercises = {};

function openWorkloadModal(playerId, dayIndex) {
    currentId = playerId;
    currentWorkloadDayIndex = dayIndex;
    const p = players.find(p => String(p.id) === String(playerId));

    const pType = (p && p.type) || '투수';
    const mainLabel = document.getElementById('wlMainLabel');
    const countLabel = document.getElementById('wlCountLabel');
    const noBtn = document.getElementById('wlNoBtn');
    const rpeGuide = document.getElementById('wlRpeGuide');

    if (mainLabel) mainLabel.innerText = pType === '타자' ? '오늘의 타격 워크로드 (RPE x 스윙 수)' : '오늘의 투구 워크로드 (RPE x 투구 수)';
    if (countLabel) countLabel.innerText = pType === '타자' ? '총 타격(스윙) 수' : '총 투구 수';
    if (noBtn) noBtn.innerText = pType === '타자' ? '🚫 오늘 타격하지 않음' : '🚫 오늘 투구하지 않음';

    if (rpeGuide) {
        const guideTitle = '<strong style="color: var(--text-main); display: block; margin-bottom: 4px;">💡 RPE(운동 자각도)란?</strong>선수 본인이 느끼는 훈련의 힘든 정도를 1~10으로 나타낸 수치입니다.<br>';
        if (pType === '타자') {
            rpeGuide.innerHTML = guideTitle +
                '• <strong>1~3:</strong> 매우 쉬움 (가벼운 스윙, 웜업)<br>' +
                '• <strong>4~6:</strong> 보통 ~ 약간 힘듦 (일반적인 티 배팅)<br>' +
                '• <strong>7~8:</strong> 힘듦 (라이브 배팅, 강도 높은 타격)<br>' +
                '• <strong>9~10:</strong> 매우 힘듦 ~ 최대 노력 (전력 타격, 한계치)';
        } else {
            rpeGuide.innerHTML = guideTitle +
                '• <strong>1~3:</strong> 매우 쉬움 (가벼운 캐치볼, 웜업)<br>' +
                '• <strong>4~6:</strong> 보통 ~ 약간 힘듦 (일반적인 불펜 피칭)<br>' +
                '• <strong>7~8:</strong> 힘듦 (실전 등판, 강도 높은 피칭)<br>' +
                '• <strong>9~10:</strong> 매우 힘듦 ~ 최대 노력 (전력 투구, 한계치)';
        }
    }

    if (p && p.dailyCompletion && p.dailyCompletion[dayIndex] && p.dailyCompletion[dayIndex].completed) {
        document.getElementById('wlRPE').value = p.dailyCompletion[dayIndex].rpe ?? '';
        document.getElementById('wlPitchCount').value = p.dailyCompletion[dayIndex].pitchCount ?? '';
    } else {
        document.getElementById('wlRPE').value = '';
        document.getElementById('wlPitchCount').value = '';
    }

    calculateLiveWorkload(); // 초기화 또는 기존 값으로 계산
    openModal('workloadModal');
}

function saveDailyWorkload() {
    const p = players.find(p => String(p.id) === String(currentId));
    if (!p) return;

    const rpeInput = document.getElementById('wlRPE').value;
    const pitchCountInput = document.getElementById('wlPitchCount').value;

    const pType = (p && p.type) || '투수';
    const countName = pType === '타자' ? '타격(스윙) 수' : '투구 수';

    if (rpeInput === '' || pitchCountInput === '') {
        customAlert(`RPE와 ${countName}를 모두 입력해주세요. (${pType === '타자' ? '타격' : '투구'}를 하지 않았다면 0을 입력하세요)`);
        return;
    }

    const rpe = parseInt(rpeInput) || 0;
    const pitchCount = parseInt(pitchCountInput) || 0;

    if (!p.dailyCompletion) p.dailyCompletion = {};

    p.dailyCompletion[currentWorkloadDayIndex] = {
        completed: true,
        rpe: rpe,
        pitchCount: pitchCount,
        workload: rpe * pitchCount,
        exercises: _cachedDayExercises[currentWorkloadDayIndex] || []
    };

    if (!p.workloadHistory) p.workloadHistory = [];
    const todayStr = new Date().toISOString().split('T')[0];
    const existingEntry = p.workloadHistory.find(w => w.date === todayStr);
    if (existingEntry) {
        existingEntry.workload = rpe * pitchCount;
    } else {
        p.workloadHistory.push({ date: todayStr, workload: rpe * pitchCount });
    }

    saveDB();
    closeModal('workloadModal');
    renderResult();
}

function openGuide(exName) {
    const data = exerciseDB[exName] || {};
    document.getElementById('gTitle').innerText = exName;
    document.getElementById('gDesc').innerText = data.desc || '상세 설명이 준비 중입니다.';

    // 시작 자세 (setup) — 신규 필드
    const setupSection = document.getElementById('gSetup');
    const setupText = document.getElementById('gSetupText');
    if (setupSection && setupText) {
        if (data.setup) {
            setupText.innerText = data.setup;
            setupSection.style.display = 'block';
        } else {
            setupSection.style.display = 'none';
        }
    }

    // 동작 단계 (steps) — 신규 필드
    const stepsSection = document.getElementById('gSteps');
    const stepsList = document.getElementById('gStepsList');
    if (stepsSection && stepsList) {
        if (data.steps && data.steps.length > 0) {
            stepsList.innerHTML = data.steps.map(s => `<li style="margin-bottom: 4px;">${escapeHTML(s)}</li>`).join('');
            stepsSection.style.display = 'block';
        } else {
            stepsSection.style.display = 'none';
        }
    }

    // 코칭 큐 (cues) — 신규 필드
    const cuesSection = document.getElementById('gCues');
    const cuesList = document.getElementById('gCuesList');
    if (cuesSection && cuesList) {
        if (data.cues && data.cues.length > 0) {
            cuesList.innerHTML = data.cues.map(c => `<li>${escapeHTML(c)}</li>`).join('');
            cuesSection.style.display = 'block';
        } else {
            cuesSection.style.display = 'none';
        }
    }

    document.getElementById('gFocus').innerText = data.focus || '정확한 자세에 집중하세요.';

    // 피해야 할 부위 정보 추가
    const avoidEl = document.getElementById('gAvoid');
    if (avoidEl) {
        if (data.avoid && data.avoid !== '없음') {
            avoidEl.innerHTML = `<span style="color: var(--danger); font-weight: 600;">⚠️ 주의 부위: ${data.avoid}</span>`;
            avoidEl.style.display = 'block';
        } else {
            avoidEl.style.display = 'none';
        }
    }

    // 훈련 목적 (purpose) — 신규 필드
    const purposeSection = document.getElementById('gPurpose');
    const purposeText = document.getElementById('gPurposeText');
    if (purposeSection && purposeText) {
        if (data.purpose) {
            purposeText.innerText = data.purpose;
            purposeSection.style.display = 'block';
        } else {
            purposeSection.style.display = 'none';
        }
    }

    // 흔한 실수 (mistakes) — 신규 필드
    const mistakesSection = document.getElementById('gMistakes');
    const mistakesList = document.getElementById('gMistakesList');
    if (mistakesSection && mistakesList) {
        if (data.mistakes && data.mistakes.length > 0) {
            mistakesList.innerHTML = data.mistakes.map(m => `<li>${escapeHTML(m)}</li>`).join('');
            mistakesSection.style.display = 'block';
        } else {
            mistakesSection.style.display = 'none';
        }
    }

    // 출처 및 신뢰도 배지 (source) — 신규 필드
    const sourceSection = document.getElementById('gSource');
    const evidenceBadge = document.getElementById('gEvidenceBadge');
    const sourceText = document.getElementById('gSourceText');
    if (sourceSection && evidenceBadge && sourceText) {
        if (data.sourceOrg) {
            evidenceBadge.innerText = `근거 등급 ${data.evidenceLevel || 'C'}`;
            evidenceBadge.className = `evidence-badge grade-${data.evidenceLevel || 'C'}`;
            sourceText.innerText = `출처: ${data.sourceOrg}${data.sourceTitle ? ' · ' + data.sourceTitle : ''}`;
            sourceSection.style.display = 'flex';
            const sourceUrlEl = document.getElementById('gSourceUrl');
            if (sourceUrlEl) {
                if (data.sourceUrl) {
                    sourceUrlEl.href = data.sourceUrl;
                    sourceUrlEl.style.display = 'inline';
                } else {
                    sourceUrlEl.style.display = 'none';
                }
            }
        } else {
            sourceSection.style.display = 'none';
        }
    }

    lucide.createIcons();
    openModal('guideModal');
}

function captureSchedule(event) {
    const target = document.getElementById('captureArea');
    const btn = event ? event.currentTarget : document.querySelector('button[onclick="captureSchedule(event)"]');
    const originalHtml = btn ? btn.innerHTML : '<i data-lucide="camera"></i> 이 스케줄 이미지로 저장하기';
    if (btn) btn.innerHTML = "⏳ 캡처 중...";
    html2canvas(target, { scale: 2, backgroundColor: '#ffffff' }).then(canvas => {
        const link = document.createElement('a');
        link.download = `PitcherLab_Schedule_${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        if (btn) { btn.innerHTML = originalHtml; lucide.createIcons(); }
    }).catch(err => {
        console.error(err); customAlert('이미지 저장에 실패했습니다.');
        if (btn) { btn.innerHTML = originalHtml; lucide.createIcons(); }
    });
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
    const map = {
        '맨몸': '🏃', '밴드': '🔗', '덤벨': '🏋️', '바벨': '🏋️‍♂️',
        '케틀벨': '⚙️', '케이블': '🔌', '박스': '📦', '벤치': '🪑',
        '메디신볼': '🏀', '폼롤러': '🧴', '철봉': '🔩'
    };
    return map[equip] || '🔧';
}

function getEquipmentTags(exName) {
    const exData = exerciseDB[exName];
    if (!exData || !exData.equipment) return '';
    const equipHtml = exData.equipment.map(eq =>
        `<span class="equip-tag ${getEquipmentTagClass(eq)}">${getEquipmentIcon(eq)} ${eq}</span>`
    ).join('');
    const evidenceHtml = exData.evidenceLevel
        ? `<span class="evidence-badge grade-${exData.evidenceLevel}" style="font-size:10px; padding:1px 5px;">근거 ${exData.evidenceLevel}</span>`
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
        ? exData.equipment.map(eq => `<span class="equip-tag ${getEquipmentTagClass(eq)}">${getEquipmentIcon(eq)} ${eq}</span>`).join(' ')
        : '<span class="equip-tag bodyweight">🏃 맨몸</span>';

    const contextLabel = { pain: '🚨 통증 안전', recovery: '♻️ 회복', normal: '💪 일반' };
    const ctxTag = exData && exData.contextCondition
        ? `<span style="font-size:11px; background:#e0e7ff; color:#4338ca; border-radius:4px; padding:1px 6px; margin-left:4px;">${contextLabel[exData.contextCondition] || exData.contextCondition}</span>`
        : '';
    const evTag = exData && exData.evidenceLevel
        ? `<span class="evidence-badge grade-${exData.evidenceLevel}" style="font-size:10px; padding:1px 5px; margin-left:4px;">근거 ${exData.evidenceLevel}</span>`
        : '';
    document.getElementById('swapOriginalInfo').innerHTML = `
        <div class="swap-original-name">현재 운동: ${exName}${ctxTag}${evTag}</div>
        <div class="swap-original-equip" style="margin-top:6px;">필요 장비: ${equipHtml}</div>
    `;

    // 대체 운동 목록 생성
    const swapList = document.getElementById('swapOptionsList');
    const alternatives = exerciseSwapDB[exName] || [];

    // 이미 사용자가 이 운동을 대체한 적이 있는지
    const p = players.find(p => String(p.id) === String(playerId));
    const hasExistingSwap = p && p.exerciseSwaps && p.exerciseSwaps[`${dayIndex}_${exName}`];

    const resetBtn = document.getElementById('swapResetBtn');
    if (hasExistingSwap) {
        resetBtn.style.display = 'block';
    } else {
        resetBtn.style.display = 'none';
    }

    if (alternatives.length === 0) {
        swapList.innerHTML = `
            <div style="text-align:center; padding:30px; color:var(--text-muted);">
                <div style="font-size:32px; margin-bottom:8px;">✅</div>
                <div style="font-weight:600;">이 운동은 맨몸으로 수행 가능합니다.</div>
                <div style="font-size:13px; margin-top:4px;">별도의 장비가 필요하지 않아 대체 운동이 없습니다.</div>
            </div>
        `;
        document.getElementById('swapConfirmBtn').disabled = true;
        document.getElementById('swapConfirmBtn').style.opacity = '0.5';
    } else {
        // 맨몸 운동과 장비 필요 운동으로 분류
        let bodyweightAlts = [];
        let equipAlts = [];

        alternatives.forEach(altName => {
            const altData = exerciseDB[altName];
            if (altData) {
                const isBodyweight = altData.equipment && altData.equipment.length === 1 && altData.equipment[0] === '맨몸';
                if (isBodyweight) bodyweightAlts.push(altName);
                else equipAlts.push(altName);
            }
        });

        let html = '';

        if (bodyweightAlts.length > 0) {
            html += `<div class="swap-category-label">🏃 맨몸 대체 (장비 불필요)</div>`;
            bodyweightAlts.forEach(altName => {
                html += renderSwapOption(altName);
            });
        }

        if (equipAlts.length > 0) {
            html += `<div class="swap-category-label">🏋️ 다른 장비 대체</div>`;
            equipAlts.forEach(altName => {
                html += renderSwapOption(altName);
            });
        }

        swapList.innerHTML = html;
        document.getElementById('swapConfirmBtn').disabled = true;
        document.getElementById('swapConfirmBtn').style.opacity = '0.5';
    }

    openModal('swapModal');
}

function renderSwapOption(altName) {
    const altData = exerciseDB[altName];
    if (!altData) return '';

    const equipTags = altData.equipment
        ? altData.equipment.map(eq => `<span class="equip-tag ${getEquipmentTagClass(eq)}">${getEquipmentIcon(eq)} ${eq}</span>`).join(' ')
        : '';

    const shortDesc = altData.desc.length > 60 ? altData.desc.substring(0, 60) + '...' : altData.desc;
    const ctxLabels = { pain: '🚨 통증 안전', recovery: '♻️ 회복', normal: '💪 일반' };
    const ctxBadge = altData.contextCondition
        ? `<span style="font-size:10px; background:#e0e7ff; color:#4338ca; border-radius:4px; padding:1px 5px;">${ctxLabels[altData.contextCondition] || altData.contextCondition}</span>`
        : '';
    const evBadge = altData.evidenceLevel
        ? `<span class="evidence-badge grade-${altData.evidenceLevel}" style="font-size:10px; padding:1px 5px;">근거 ${altData.evidenceLevel}</span>`
        : '';
    const metaBadges = (ctxBadge || evBadge) ? `<div style="margin-top:3px; display:flex; gap:4px; flex-wrap:wrap;">${ctxBadge}${evBadge}</div>` : '';

    return `
        <div class="swap-option" onclick="selectSwapOption('${altName}', this)" data-name="${altName}">
            <div style="flex:1; min-width:0;">
                <div class="swap-option-name">${altName}</div>
                <div class="swap-option-desc">${shortDesc}</div>
                <div class="swap-option-tags">${equipTags}</div>
                ${metaBadges}
            </div>
            <div class="swap-option-right">
                <div class="swap-check">✓</div>
            </div>
        </div>
    `;
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
    if (!p.exerciseSwaps) p.exerciseSwaps = {};
    const key = `${swapState.dayIndex}_${swapState.originalExName}`;
    p.exerciseSwaps[key] = {
        original: swapState.originalExName,
        replacement: swapState.selectedSwapName,
        dayIndex: swapState.dayIndex,
        date: getTodayStr()
    };

    saveDB();
    closeModal('swapModal');
    renderResult();

    customAlert(`✅ "${swapState.originalExName}"이(가) "${swapState.selectedSwapName}"(으)로 대체되었습니다.`);
}

function resetSwap() {
    if (!swapState.playerId || !swapState.originalExName) return;

    const p = players.find(p => String(p.id) === String(swapState.playerId));
    if (!p || !p.exerciseSwaps) return;

    const key = `${swapState.dayIndex}_${swapState.originalExName}`;

    customConfirm(`"${swapState.originalExName}"을 원래 운동으로 복원하시겠습니까?`, () => {
        delete p.exerciseSwaps[key];
        saveDB();
        closeModal('swapModal');
        renderResult();
        customAlert('✅ 원래 운동으로 복원되었습니다.');
    });
}

// 스왑 적용 여부 확인 헬퍼
function getSwappedExercise(playerId, dayIndex, exName) {
    const p = players.find(p => String(p.id) === String(playerId));
    if (!p || !p.exerciseSwaps) return null;
    const key = `${dayIndex}_${exName}`;
    return p.exerciseSwaps[key] || null;
}
