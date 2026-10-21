/**
 * Node ESM loader hook that lets the source files keep Vite's extensionless
 * imports (`./date`) while still being importable from a plain Node script.
 *
 * When Node asks to resolve a relative specifier that has no extension, this
 * hook retries with `.ts` / `.tsx` (and `/index.ts`). Nothing else is changed.
 */
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const CANDIDATES = ['', '.ts', '.tsx', '/index.ts', '/index.tsx'];

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) {
    for (const ext of CANDIDATES) {
      const candidate = new URL(specifier + ext, context.parentURL);
      if (existsSync(fileURLToPath(candidate))) {
        return nextResolve(pathToFileURL(fileURLToPath(candidate)).href, context);
      }
    }
  }
  return nextResolve(specifier, context);
}
