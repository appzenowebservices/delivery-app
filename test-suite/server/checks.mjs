/**
 * The check catalog — single source of truth for the server and the UI.
 *
 * The Android smoke is auto-discovered: when the app has `e2e/run.mjs`
 * (the Appium runner), it becomes one cockpit row. Also no editing here to
 * add coverage — extend the app's runner instead.
 *
 * The static CHECKS list is intentionally empty: per the suite guardrails,
 * a hardcoded check is added only when a real bug escapes and deserves a
 * permanent guard.
 */
import { existsSync } from "node:fs";
import { basename, join } from "node:path";

/** Kept for a generic `counts` handler; unused until a project adds one. */
export const BASELINE = {};

export const CHECKS = [];

/**
 * Auto-discover the app's Android smoke (`e2e/run.mjs`, Appium on a USB
 * phone) as one cockpit row.
 */
export function discoverMobileChecks(appDir) {
  const runner = join(appDir, "e2e", "run.mjs");
  if (!existsSync(runner)) return [];
  const appName = basename(appDir) || "app";
  return [
    {
      id: "android-smoke",
      group: `UI — ${appName} (Android)`,
      label: "Android smoke (Appium)",
      desc: "Phone smoke: installs/launches the app and waits for real UI",
      badge: "LIVE",
      live: true,
      cmd: "npm run e2e:android    (in the app)",
      journey: true,
      args: ["scripts/mobile-run.mjs"],
      timeout: 900000,
    },
  ];
}
