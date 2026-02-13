import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const eslintJs = path.join(projectRoot, 'node_modules', 'eslint', 'bin', 'eslint.js');

if (!existsSync(eslintJs)) {
  console.error('ESLint is not installed (missing node_modules).');
  console.error('Fix:');
  console.error('  1) Run: npm ci');
  console.error('  2) If you previously used --omit=dev/--production, reinstall without it.');
  console.error('  3) In PowerShell, if `npm` is blocked by execution policy, use: npm.cmd ci');
  process.exit(1);
}

const args = process.argv.slice(2);
const child = spawn(process.execPath, [eslintJs, ...args], { stdio: 'inherit' });

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
