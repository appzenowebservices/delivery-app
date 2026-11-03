# Doot — Android e2e (Appium)

Smoke tests on a real phone over USB — no Android Studio needed.

## One-time setup

1. Install the Appium driver (already done on this machine):
   `npx appium driver install uiautomator2`
2. On the phone: Settings → Developer options → **USB debugging** on, then
   plug it in and **Allow** the computer when it asks.
   Check with: `adb devices` — it must say `device`, not `unauthorized`.
3. Build the debug APK (Java 17 + the SDK on this machine are enough):
   `cd android; .\gradlew assembleDebug`

## Run

```powershell
npm run e2e:android
```

Two ways the app gets on the phone — the runner handles both:

- **Release APK** (`cd android; .\gradlew assembleRelease`) — JS is bundled
  inside; nothing else needed. Preferred: the test is self-contained.
- **Debug APK** (what `npx react-native run-android` builds) — loads its JS
  from Metro; the runner sets up `adb reverse tcp:8081 tcp:8081` and starts
  Metro itself if it isn't running. Keep using `run-android` while developing;
  the test reuses it.

What it does: checks a device is connected → starts the Appium server on
:4723 if needed → prepares the JS runtime (Metro for debug builds) → opens a
UiAutomator2 session → installs and launches the APK → asserts the app is in
the foreground **and not showing the RN error screen** → saves
`e2e/artifacts/launch.png` → reports one `JOURNEY_JSON` line (same contract
the test-suite cockpit uses).

Overridable via env: `APP_PATH`, `DEVICE_NAME`, `PLATFORM_VERSION`,
`APP_PACKAGE`, `APPIUM_PORT`.

## Adding a flow

Extend `e2e/run.mjs` after the launch assertion — e.g. tap the login
button, fill fields, assert a home screen appears. Keep one flow per run
until it earns more (same guardrail as the web suite).
