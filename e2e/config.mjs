/**
 * Device/app config for the Android smoke tests.
 * Everything is overridable by env vars so another machine or CI can differ
 * without editing code.
 *
 *   APP_PATH         path to the APK (default: newest android debug build)
 *   DEVICE_NAME      Appium deviceName (default: whatever adb reports)
 *   PLATFORM_VERSION optional Android version string
 *   APP_PACKAGE      default com.apniride
 *   APPIUM_PORT      default 4723
 */
import { existsSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Newest APK: prefer a self-contained release build, fall back to debug. */
function findApk() {
  const base = join(ROOT, "android", "app", "build", "outputs", "apk");
  for (const kind of ["release", "debug"]) {
    const dir = join(base, kind);
    if (!existsSync(dir)) continue;
    const apks = readdirSync(dir)
      .filter((f) => f.endsWith(".apk"))
      .sort();
    if (apks.length) return join(dir, apks[apks.length - 1]);
  }
  return null;
}

const port = Number(process.env.APPIUM_PORT || 4723);

export const config = {
  root: ROOT,
  appiumPort: port,
  appiumUrl: `http://127.0.0.1:${port}`,
  appPackage: process.env.APP_PACKAGE || "com.apniride",
  apk: process.env.APP_PATH || findApk(),
  deviceName: process.env.DEVICE_NAME || null,
  platformVersion: process.env.PLATFORM_VERSION || null,
  artifactsDir: join(ROOT, "e2e", "artifacts"),
  adb: join(
    process.env.ANDROID_HOME || "C:\\Android\\Sdk",
    "platform-tools",
    process.platform === "win32" ? "adb.exe" : "adb",
  ),
};
