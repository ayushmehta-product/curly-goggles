import { spawn, execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync, readFileSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const lockPath = join(root, '.next', 'dev', 'lock');
const nextBin = require.resolve('next/dist/bin/next');
const DEV_PORT = 3000;

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function isProcessRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function stopProcess(pid) {
  if (!Number.isFinite(pid) || pid <= 0 || pid === process.pid) return;

  if (process.platform === 'win32') {
    try {
      execSync(`taskkill /PID ${pid} /F /T`, { stdio: 'ignore' });
    } catch {
      // Process may already be gone.
    }
    return;
  }

  try {
    process.kill(-pid, 'SIGTERM');
  } catch {
    try {
      process.kill(pid, 'SIGTERM');
    } catch {
      // Process already exited.
    }
  }
}

function waitForExit(pid, attempts = 30) {
  for (let i = 0; i < attempts; i += 1) {
    if (!isProcessRunning(pid)) return true;
    sleep(100);
  }
  return !isProcessRunning(pid);
}

function pidsListeningOnPort(port) {
  if (process.platform === 'win32') {
    try {
      const output = execSync(`netstat -ano | findstr :${port}`, {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      });
      const pids = new Set();
      for (const line of output.split(/\r?\n/)) {
        if (!/LISTENING/i.test(line)) continue;
        const parts = line.trim().split(/\s+/);
        const pid = Number(parts[parts.length - 1]);
        if (Number.isFinite(pid) && pid > 0) pids.add(pid);
      }
      return [...pids];
    } catch {
      return [];
    }
  }

  try {
    const output = execSync(`lsof -ti tcp:${port} -sTCP:LISTEN`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return output
      .split(/\s+/)
      .map((value) => Number(value))
      .filter((pid) => Number.isFinite(pid) && pid > 0);
  } catch {
    return [];
  }
}

function readLockPid() {
  if (!existsSync(lockPath)) return null;

  try {
    const lock = JSON.parse(readFileSync(lockPath, 'utf8'));
    const pid = Number(lock.pid);
    return Number.isFinite(pid) && pid > 0 ? pid : null;
  } catch {
    return null;
  }
}

function removeLock() {
  if (existsSync(lockPath)) {
    unlinkSync(lockPath);
  }
}

function clearExistingDevServer() {
  const lockPid = readLockPid();
  const portPids = pidsListeningOnPort(DEV_PORT);
  const pids = [...new Set([lockPid, ...portPids].filter(Boolean))];

  if (pids.length === 0) {
    removeLock();
    return;
  }

  for (const pid of pids) {
    if (!isProcessRunning(pid)) continue;
    console.log(`Stopping existing process on port ${DEV_PORT} (PID ${pid})...`);
    stopProcess(pid);
    waitForExit(pid);
  }

  // Port can stay occupied briefly after kill on Windows.
  for (let i = 0; i < 20; i += 1) {
    if (pidsListeningOnPort(DEV_PORT).length === 0) break;
    sleep(150);
  }

  removeLock();

  const remaining = pidsListeningOnPort(DEV_PORT);
  if (remaining.length > 0) {
    console.error(
      `Port ${DEV_PORT} is still in use by PID(s): ${remaining.join(', ')}. Free it and try again.`
    );
    process.exit(1);
  }
}

clearExistingDevServer();

const child = spawn(process.execPath, [nextBin, 'dev', '-p', String(DEV_PORT)], {
  cwd: root,
  stdio: 'inherit',
  env: {
    ...process.env,
    // Prevent Next from hopping to 3001 and then failing on the lock check.
    PORT: String(DEV_PORT),
  },
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
