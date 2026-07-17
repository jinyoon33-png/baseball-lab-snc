# Android TWA Project Creation Plan

> **For agentic workers:** This plan is for the `Android TWA 프로젝트 생성 1차` ticket. The code worker owns `android/**` only. Do not copy `site/**` into the Android project.

**Goal:** Create a minimal Android Trusted Web Activity wrapper project for Baseball Lab S&C while preserving the existing `site/` web app as the shared source of truth.

**Architecture:** The Android app is a native wrapper that opens `https://www.baseballlabsnc.com/` through TWA. The production web app remains in `site/`. Digital Asset Links are already published under `site/.well-known/assetlinks.json` for package `com.baseballlabsnc.app`.

**Inputs:**
- Manifest URL: `https://www.baseballlabsnc.com/manifest.webmanifest`
- Package name: `com.baseballlabsnc.app`
- Web origin: `https://www.baseballlabsnc.com`
- Scope/start URL: `/`
- Signing key: `.local-secrets/android/baseballlabsnc-release.jks`
- Key alias file: `.local-secrets/android/key-alias.txt`
- Password file: `.local-secrets/android/keystore-password.txt`

**Secrets rule:** Never print keystore passwords. Never commit `.local-secrets/**`, `.jks`, `.keystore`, APK, or AAB artifacts.

---

## Task 1: Confirm Local TWA Tooling

- [ ] Run `NPM_CONFIG_CACHE=/tmp/baseball-lab-npm-cache npx @bubblewrap/cli doctor`.
- [ ] Confirm JDK 17 and Android SDK paths are valid.
- [ ] Confirm `~/.bubblewrap/config.json` is not committed.

## Task 2: Generate Android Wrapper

- [ ] Create or reuse `/Users/jinyoon/Desktop/Baseball Lab S&C/android`.
- [ ] Initialize the Bubblewrap project from `https://www.baseballlabsnc.com/manifest.webmanifest`.
- [ ] Use package name `com.baseballlabsnc.app`.
- [ ] Use the existing local signing key path under `.local-secrets/android/`; do not create a new key.
- [ ] Keep generated source/config files under `android/**`.

## Task 3: Guard Build Outputs And Secrets

- [ ] Ensure generated APK/AAB/build output directories are ignored or absent.
- [ ] Ensure `.local-secrets/**` remains ignored.
- [ ] Ensure no password or keystore file is inside `android/**`.

## Task 4: Static Verification

- [ ] `python3 -m json.tool site/.well-known/assetlinks.json`
- [ ] `NPM_CONFIG_CACHE=/tmp/baseball-lab-npm-cache npx @bubblewrap/cli doctor`
- [ ] Android project validation/build command available from generated project.
- [ ] `node --check site/app.js`
- [ ] `node --check site/data.js`
- [ ] `git diff -- site`
- [ ] `git status --short --ignored .local-secrets android site/.well-known`
- [ ] `git diff --check`

## Completion Gate

The ticket is complete only when the Android wrapper project exists under `android/**`, protected files are untouched, secrets are ignored, and the project can be validated or built enough to prove the generated configuration is usable.
