# TWA Android Prep

This note records the safe defaults and the exact follow-up steps for the Android TWA ticket. It does **not** create a keystore, reveal a real password, or generate a real SHA-256 fingerprint.

## Confirmed Defaults

- Package name: `com.baseballlabsnc.app`
- Domain: `https://www.baseballlabsnc.com`
- Scope: `/`
- Local secret path: `.local-secrets/android/`

## Local Secret Policy

- `.local-secrets/` is already a gitignore target and must remain untracked.
- Do not create or commit `.jks` files, `.keystore` files, password files, or any real SHA-256 fingerprint in this ticket.
- A real SHA-256 certificate fingerprint may be published later when `assetlinks.json` is created, but this document uses placeholder values only.
- Keep every secret-related example scoped to `.local-secrets/android/` so the eventual local workflow is easy to follow without exposing credentials.

## Prerequisite

- Even if `keytool` appears to exist on the machine, `java` / `keytool` commands can still fail when no Java Runtime is installed.
- Install a Java Runtime or Android Studio first, then continue with the next step.
- This ticket stops at documentation and prep only; it does not require Android project creation.

## Commands To Run Later

Run these only on a machine that already has Java Runtime or Android Studio available.

```bash
mkdir -p .local-secrets/android
```

Example keystore generation command:

```bash
keytool -genkeypair \
  -alias <KEY_ALIAS> \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -keystore .local-secrets/android/<YOUR_KEYSTORE_FILE>.jks
```

Example SHA-256 fingerprint extraction command:

```bash
keytool -list -v \
  -keystore .local-secrets/android/<YOUR_KEYSTORE_FILE>.jks \
  -alias <KEY_ALIAS> \
  -storepass <KEYSTORE_PASSWORD>
```

Replace every path, alias, and password with placeholders until the real local secret is created on the target machine.

## assetlinks.json Template

When the real SHA-256 fingerprint is ready, create `site/.well-known/assetlinks.json` with the following structure:

```json
[
  {
    "relation": [
      "delegate_permission/common.handle_all_urls"
    ],
    "target": {
      "namespace": "android_app",
      "package_name": "com.baseballlabsnc.app",
      "sha256_cert_fingerprints": [
        "<SHA256_CERT_FINGERPRINT>"
      ]
    }
  }
]
```

Only the `<SHA256_CERT_FINGERPRINT>` placeholder should appear in this document for the fingerprint field.

## Play Console Checklist

- Developer account fee: confirm the current Google Play developer registration cost before creating the app listing.
- Closed testing requirement: confirm whether the current Play Console flow requires closed testing before production access.
- Privacy policy URL: verify the published privacy policy URL and make sure it is reachable from the store listing.
- Ads declaration: current public documents mention AdSense on the site, while the app body itself has no ads; review the declaration against the current product state before submission.
- App access: v1 has no login, so app access notes should state that no credentials are required.
- Target audience/content rating: review both student-athlete and adult-user use cases, and avoid any classification that could make the app look like it is aimed at children.
- Data safety: current behavior is centered on `localStorage`, with no account sync or cloud sync; rewrite this section later if login or subscriptions are added.

## Next Ticket Gate

- After Java or Android Studio is ready, create the local signing key on the target machine.
- After the real SHA-256 certificate fingerprint is captured, move to the ticket that creates `site/.well-known/assetlinks.json`.
- Android TWA project creation comes after that, as the following ticket.
