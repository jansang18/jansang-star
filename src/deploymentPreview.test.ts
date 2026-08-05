// @vitest-environment node
import { spawn, type ChildProcess } from 'node:child_process';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function npmCli() {
  if (!process.env.npm_execpath) throw new Error('npm_execpath is required to exercise package scripts');
  return process.env.npm_execpath;
}

function spawnNpm(args: string[], options: { detached?: boolean; stdio?: 'ignore' | 'pipe' } = {}) {
  return spawn(process.execPath, [npmCli(), ...args], {
    cwd: process.cwd(),
    windowsHide: true,
    detached: options.detached,
    stdio: options.stdio ?? 'pipe',
  });
}

async function runNpm(args: string[]) {
  const child = spawnNpm(args);
  let stdout = '';
  let stderr = '';
  child.stdout?.on('data', (chunk) => { stdout += chunk; });
  child.stderr?.on('data', (chunk) => { stderr += chunk; });
  const code = await new Promise<number>((resolve, reject) => {
    child.once('error', reject);
    child.once('exit', (exitCode) => resolve(exitCode ?? -1));
  });
  if (code !== 0) throw new Error(`npm ${args.join(' ')} failed (${code})\n${stdout}\n${stderr}`);
}

async function freePort() {
  const server = createServer();
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Could not reserve a preview port');
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  return address.port;
}

async function waitForResponse(url: string) {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    try {
      return await fetch(url);
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  throw new Error(`Preview did not become ready at ${url}`);
}

async function waitForExit(child: ChildProcess, timeoutMs: number) {
  if (child.exitCode !== null || child.signalCode !== null) return true;
  return new Promise<boolean>((resolve) => {
    const onExit = () => {
      clearTimeout(timer);
      resolve(true);
    };
    const timer = setTimeout(() => {
      child.off('exit', onExit);
      resolve(false);
    }, timeoutMs);
    child.once('exit', onExit);
  });
}

async function stopProcessTree(child: ChildProcess) {
  if (!child.pid || child.exitCode !== null || child.signalCode !== null) return;
  if (process.platform === 'win32') {
    const killer = spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
    await new Promise<void>((resolve) => {
      killer.once('error', () => resolve());
      killer.once('exit', () => resolve());
    });
  } else {
    try {
      process.kill(-child.pid, 'SIGTERM');
    } catch {
      child.kill('SIGTERM');
    }
  }

  if (await waitForExit(child, 2_000)) return;
  if (process.platform === 'win32') {
    child.kill('SIGKILL');
  } else {
    try {
      process.kill(-child.pid, 'SIGKILL');
    } catch {
      child.kill('SIGKILL');
    }
  }
  await waitForExit(child, 2_000);
}

async function listFiles(root: string, relative = ''): Promise<string[]> {
  const entries = await readdir(join(root, relative), { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const child = relative ? `${relative}/${entry.name}` : entry.name;
    return entry.isDirectory() ? listFiles(root, child) : [child];
  }));
  return files.flat().sort();
}

describe('Pages preview workflow', () => {
  it('serves every emitted Pages resource through the package preview command', async () => {
    const outputRoot = await mkdtemp(join(tmpdir(), 'jansang-pages-preview-'));
    const port = await freePort();
    let preview: ChildProcess | undefined;

    try {
      await runNpm(['run', 'build', '--', '--mode', 'pages', '--outDir', outputRoot]);
      const indexHtml = await readFile(join(outputRoot, 'index.html'), 'utf8');
      const absoluteReferences = [...indexHtml.matchAll(/\b(?:href|src)="(\/[^"#?]+)"/g)].map((match) => match[1]);
      expect(absoluteReferences.length).toBeGreaterThan(0);
      absoluteReferences.forEach((reference) => expect(reference).toMatch(/^\/jansang-star\//));

      preview = spawnNpm([
        'run', 'preview', '--',
        '--host', '127.0.0.1',
        '--port', String(port),
        '--strictPort',
        '--outDir', outputRoot,
      ], {
        detached: process.platform !== 'win32',
        stdio: 'ignore',
      });

      const origin = `http://127.0.0.1:${port}`;
      const routeResponse = await waitForResponse(`${origin}/jansang-star/`);
      expect(routeResponse.status).toBe(200);
      expect(routeResponse.headers.get('content-type')).toContain('text/html');
      expect(await routeResponse.text()).toBe(indexHtml);

      const emittedFiles = await listFiles(outputRoot);
      expect(emittedFiles).toEqual(expect.arrayContaining([
        '.nojekyll',
        'index.html',
        'manifest.webmanifest',
        'registerSW.js',
        'sw.js',
        'wasm/swisseph.data',
        'wasm/swisseph.wasm',
      ]));
      const underscoreChunk = emittedFiles.find((relativePath) =>
        relativePath.split('/').at(-1)?.startsWith('_') && relativePath.endsWith('.js'));
      expect(underscoreChunk, 'Vite underscore-prefixed runtime chunk').toBeDefined();

      for (const relativePath of emittedFiles.filter((path) => path !== '.nojekyll')) {
        const encodedPath = relativePath.split('/').map(encodeURIComponent).join('/');
        const response = await fetch(`${origin}/jansang-star/${encodedPath}`);
        expect(response.status, relativePath).toBe(200);
        const contentType = response.headers.get('content-type') ?? '';
        if (relativePath.endsWith('.html')) {
          expect(contentType, relativePath).toContain('text/html');
        } else {
          expect(contentType, `${relativePath} fell through to index.html`).not.toContain('text/html');
        }
        if (relativePath.endsWith('.js')) expect(contentType, relativePath).toContain('javascript');
        if (relativePath.endsWith('.css')) expect(contentType, relativePath).toContain('text/css');
        if (relativePath.endsWith('.wasm')) expect(contentType, relativePath).toContain('application/wasm');
        if (relativePath.endsWith('.webmanifest')) expect(contentType, relativePath).toContain('application/manifest+json');
      }
    } finally {
      if (preview) await stopProcessTree(preview);
      await rm(outputRoot, { recursive: true, force: true });
    }
  }, 60_000);
});
