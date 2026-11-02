# ApniRide Test Suite

Cockpit for the Android smoke test on a real phone over USB — its own app,
zero dependencies (Node's built-in server + `node:sqlite`).

## Run

```powershell
cd test-suite
npm start          # → http://127.0.0.1:4751
```

It auto-discovers the app's `e2e/run.mjs` (the Appium runner) and shows it as
one row. Pressing **run** (LIVE — it installs/launches the app on the
connected phone):

- checks a device is connected, starts the Appium server if needed
- prepares the JS runtime (release APK: nothing; debug APK: `adb reverse` +
  Metro, started automatically)
- launches the app, waits until **real UI text** appears (a blank white
  screen or the RN error screen fail the run)
- saves a screenshot and records evidence + history in `data/test-suite.db`
  with the screenshot linked (`open screenshot`)

Prereqs: phone connected with USB debugging enabled; Appium driver installed
(`npx appium driver install uiautomator2`); an APK built
(`cd android; .\gradlew assembleDebug` or `assembleRelease`).

## Guardrails

Same as every copy of this suite: add a check only when a real bug escapes,
keep it a localhost tool, no public artifact. The helper engines from the web
suite (db-audit, webhook replay, journeys) were intentionally left out of
this copy — this app's contract is the phone, not webhooks.
