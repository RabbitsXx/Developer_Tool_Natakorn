import { randomUUID } from 'node:crypto';
import { lstat, mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

export function containedPath(root, relative) {
  if (typeof relative !== 'string' || !relative || relative.includes('\\') || relative.includes(':') || relative.includes('\0') || path.posix.isAbsolute(relative)) {
    throw new Error('Expected a relative path using forward slashes');
  }
  if (relative.split('/').some((part) => !part || part === '..' || part === '.')) throw new Error('Path traversal is forbidden');
  const file = path.resolve(root, relative);
  const fromRoot = path.relative(path.resolve(root), file);
  if (!fromRoot || fromRoot.startsWith(`..${path.sep}`) || path.isAbsolute(fromRoot)) throw new Error('Path escapes the project');
  return file;
}

export async function assertSafePath(root, relative) {
  const destination = containedPath(root, relative);
  let current = path.resolve(root);
  const rootStat = await lstat(current);
  if (!rootStat.isDirectory() || rootStat.isSymbolicLink()) throw new Error('Project root must be a real directory');
  for (const part of relative.split('/')) {
    current = path.join(current, part);
    try {
      const info = await lstat(current);
      if (info.isSymbolicLink()) throw new Error(`Refusing symbolic link: ${relative}`);
      if (current !== destination && !info.isDirectory()) throw new Error(`Parent is not a directory: ${relative}`);
      if (current === destination && !info.isFile()) throw new Error(`Destination is not a regular file: ${relative}`);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  return destination;
}

export async function readOptional(file) {
  try { return await readFile(file); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}

// Atomically replace metadata; exclusive writes are used separately for first-time installs.
export async function atomicWrite(root, relative, content) {
  const file = await assertSafePath(root, relative);
  await mkdir(path.dirname(file), { recursive: true });
  const temporary = `${file}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, content, { flag: 'wx' });
    await assertSafePath(root, relative);
    await rename(temporary, file);
  } finally {
    await unlink(temporary).catch((error) => { if (error.code !== 'ENOENT') throw error; });
  }
}
