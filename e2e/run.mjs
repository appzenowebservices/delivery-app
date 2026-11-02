#!/usr/bin/env node
/**
 * Android smoke run — plugs Appium into the test-suite contract.
 *
 *   npm run e2e:android
 *
 * Prereqs (one-time):
 *   - phone plugged in via USB with USB debugging enabled (authorize the PC)
 *   - debug APK built:  cd android; .\gradlew assembleDebug
 *   - drivers installed: npx appium driver install uiautomator2
 *
 * What it does: ensures the Appium server is up, opens a UiAutomator2
 * session against the connected device (installing/launching the APK),
 * asserts the app is in the foreground, saves a screenshot, and reports in
 * the suite's JOURNEY_JSON contract.
 */
import { execFile, spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { remote } from "webdriverio";
import { config } from "./config.mjs";

const started = Date.now();
const evidence = [];
const note = (s) => {
  evidence.push(s);
  console.log(`  - ${s}`);
};

function adb(args) {
  return new Promise((res) => {
    execFile(config.adb, args, { timeout: 20000, windowsHide: true }, (error, stdout, stderr) => {
      res({ code: error ? 1 : 0, out: String(stdout || stderr || error?.message || "") });
    });
  });
}

async function devices() {
  const { out } = await adb(["devices"]);
  return out
    .split(/\r?\n/)
    .slice(1)
    .map((l) => l.trim())
    .filter((l) => l.includes("\tdevice"))
    .map((l) => l.split("\t")[0]);
}

async function appiumUp() {
  try {
    const r = await fetch(`${config.appiumUrl}/status`, { signal: AbortSignal.timeout(2000) });
    return r.ok;
  } catch {
    return false;
  }
}

async function metroUp() {
  try {
    const r = await fetch("http://127.0.0.1:8081/status", { signal: AbortSignal.timeout(2000) });
    return r.ok;
  } catch {
    return false;
  }
}

/**
 * Debug builds load their JS from Metro over `adb reverse`; release builds
 * have the bundle inside. Make the debug path work unattended: set up the
 * reverse tunnel and start Metro if it isn't running.
 */
async function ensureDebugRuntime() {
  const isDebug = config.apk ? /debug/i.test(config.apk) : false;
  if (!isDebug) {
    note("release apk - JS bundled, no Metro needed");
    return;
  }
  await adb(["reverse", "tcp:8081", "tcp:8081"]);
  note("adb reverse tcp:8081 -> Metro");
  if (await metroUp()) {
    note("metro already running");
    return;
  }
  spawn("npm start", { cwd: config.root, stdio: "ignore", windowsHide: true, shell: true });
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    if (await metroUp()) {
      note("metro started on :8081 (left running)");
      return;
    }
  }
  note("metro did not start - the debug app will show the RN error screen");
}

async function ensureAppium() {
  if (await appiumUp()) {
    note("appium server already running");
    return null;
  }
  const port = String(config.appiumPort);
  // Windows: pass ONE command string through the shell — spawning npx.cmd
  // with an args array from Node is deprecated/broken (DEP0190).
  const cmd = `npx appium --port ${port}`;
  const child = spawn(cmd, {
    cwd: config.root,
    stdio: "ignore",
    windowsHide: true,
    shell: true,
  });
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    if (await appiumUp()) {
      note(`appium server started on :${port}`);
      return child;
    }
  }
  return child;
}

async function main() {
  // ---- preflight: a device must be connected ----
  const list = await devices();
  if (!list.length) {
    note("no Android device connected");
    note("plug your phone via USB, enable USB debugging, and authorize this PC");
    return { state: "fail", out: "no device connected", evidence };
  }
  note(`device connected: ${list[0]}`);
  const deviceName = config.deviceName || list[0];

  if (!config.apk) {
    note("no debug APK found - build it first: cd android; .\\gradlew assembleDebug");
    note("(or the app must already be installed on the phone)");
  } else {
    note(`apk: ${config.apk}`);
  }

  const appium = await ensureAppium();
  if (!(await appiumUp())) {
    return { state: "fail", out: "appium server did not start (is it installed? npx appium driver install uiautomator2)", evidence };
  }

  await ensureDebugRuntime();

  mkdirSync(config.artifactsDir, { recursive: true });

  let session;
  try {
    session = await remote({
      hostname: "127.0.0.1",
      port: config.appiumPort,
      logLevel: "error",
      connectionRetryCount: 1,
      capabilities: {
        platformName: "Android",
        "appium:automationName": "UiAutomator2",
        "appium:deviceName": deviceName,
        ...(config.platformVersion ? { "appium:platformVersion": config.platformVersion } : {}),
        ...(config.apk
          ? { "appium:app": config.apk }
          : { "appium:appPackage": config.appPackage }),
        "appium:autoGrantPermissions": true,
        "appium:newCommandTimeout": 180,
      },
    });
    note("session opened (UiAutomator2)");

    const pkg = await session.getCurrentPackage();
    note(`foreground package: ${pkg}`);
    if (pkg !== config.appPackage) {
      return { state: "fail", out: `app not in foreground (${pkg})`, evidence };
    }
    note(`app launched: ${config.appPackage}`);

    // The launch screen is not proof: a fresh debug app can sit on a blank
    // white screen for a while (first Metro bundle), and a debug build with
    // no Metro shows the RN red error screen while still "in the foreground".
    // Poll until the page source contains UI text (a rendered RN screen
    // always has some), aborting early on the RN error screen.
    const readyRegex = process.env.APP_READY_REGEX
      ? new RegExp(process.env.APP_READY_REGEX)
      : /text="[^"]{2,}"/;
    let rendered = false;
    for (let i = 0; i < 45; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      const src = await session.getPageSource();
      if (/Unable to load script|running Metro/i.test(src)) {
        await session.saveScreenshot(join(config.artifactsDir, "error-screen.png"));
        note("app shows the React Native error screen (JS bundle not loading)");
        note("fix: build a release APK (cd android; .\\gradlew assembleRelease) or start Metro + adb reverse tcp:8081 tcp:8081");
        return { state: "fail", out: "app loaded an error screen, not the app UI", evidence };
      }
      if (readyRegex.test(src)) {
        rendered = true;
        note(`app UI rendered after ~${(i + 1) * 2}s`);
        break;
      }
    }
    if (!rendered) {
      await session.saveScreenshot(join(config.artifactsDir, "not-rendered.png"));
      note("app stayed a blank screen for 90s (no UI text found)");
      note("check: is Metro bundling finished, and is adb reverse still active? (adb reverse --list)");
      return { state: "fail", out: "app did not render any UI", evidence };
    }

    const shot = join(config.artifactsDir, "launch.png");
    await session.saveScreenshot(shot);
    note(`media screenshot: ${shot.replace(config.root, "").replace(/\\/g, "/").replace(/^\//, "")}`);

    return { state: "pass", out: "android smoke passed (app launches into its UI)" };
  } catch (e) {
    const msg = String(e?.message || e);
    note(`session failed: ${msg.split("\n")[0]}`);
    if (/ECONNREFUSED/.test(msg)) note("is the Appium server running? try: npx appium");
    if (/device|UDID/i.test(msg)) note("check: adb devices - the phone must show as 'device', not 'unauthorized'");
    return { state: "fail", out: "android smoke failed", evidence };
  } finally {
    try {
      await session?.deleteSession();
    } catch {}
    if (appium) note(`appium server left running on :${config.appiumPort} (reused next run)`);
  }
}

const result = await main();
console.log(
  `JOURNEY_JSON ${JSON.stringify({
    id: "android-smoke",
    state: result.state,
    ms: Date.now() - started,
    safe: true,
    live: false,
    out: result.out,
    evidence,
  })}`,
);
process.exit(result.state === "pass" ? 0 : 1);
