import { spawnSync } from 'node:child_process';
import { build } from 'vite';

const cleanEnv = { ...process.env };
for (const key of Object.keys(cleanEnv)) {
  if (key.toLowerCase().startsWith('npm_')) delete cleanEnv[key];
}

run('tsc');
await build({
  configFile: false,
  base: './',
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
});
run('node scripts/package-itch-build.mjs');

function run(commandLine) {
  const result = spawnSync(process.env.ComSpec ?? 'cmd.exe', ['/d', '/s', '/c', commandLine], {
    cwd: process.cwd(),
    env: cleanEnv,
    shell: false,
    stdio: 'inherit',
  });
  if (result.error) {
    console.error(result.error.message);
    process.exit(result.status ?? 1);
  }
  if (result.status !== 0) process.exit(result.status ?? 1);
}
