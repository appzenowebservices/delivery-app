#!/usr/bin/env node
/**
 * mobile-run — bridge between the cockpit and the app's Android smoke test.
 *
 * Runs `node e2e/run.mjs` in the app under test (APP_DIR = TARGET_DIR from
 * .env, default "..") and relays its output, including the JOURNEY_JSON line
 * the cockpit understands. If the runner fails to emit one, a fail result is
 * synthesized so the row is never silently empty.
 */
import { execFile } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv(key) {
  try {
    const env = readFileSync(resolve(ROOT, ".env"), "utf8").replace(/^\uFEFF/, "");
    const m = env.match(new RegExp(`^${key}=(.*)$`, "m"));
    return m ? m[1].trim().replace(/^["']|["']$/g, "") : null;
  } catch {
    return null;
  }
}

const APP_DIR = resolve(ROOT, process.env.APP_DIR ?? loadEnv("TARGET_DIR") ?? "..");

const { code, stdout, stderr } = await new Promise((res) => {
  execFile(
    process.execPath,
    ["e2e/run.mjs"],
    { cwd: APP_DIR, timeout: 900000, maxBuffer: 16 * 1024 * 1024, windowsHide: true },
    (error, out, err) =>
      res({
        code: error ? (typeof error.code === "number" ? error.code : 1) : 0,
        stdout: String(out || ""),
        stderr: String(err || error?.message || ""),
      }),
  );
});

// Relay the runner's own evidence lines, then its JOURNEY_JSON.
process.stdout.write(stdout);

const line = stdout.split("\n").find((l) => l.startsWith("JOURNEY_JSON "));
if (!line) {
  const detail = (stderr || stdout || "no output").split("\n")[0].slice(0, 300);
  console.log(
    `JOURNEY_JSON ${JSON.stringify({
      id: "android-smoke",
      state: "fail",
      ms: 0,
      safe: true,
      live: false,
      out: "mobile runner produced no JOURNEY_JSON",
      evidence: [detail],
    })}`,
  );
  process.exit(1);
}

process.exit(code);
