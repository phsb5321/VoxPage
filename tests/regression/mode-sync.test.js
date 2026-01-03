/**
 * Regression Test: Mode Sync Bug (007)
 *
 * This test prevents regression of the bug where different components
 * had different default modes, causing inconsistent behavior.
 *
 * Root cause: Hardcoded defaults in multiple places that got out of sync.
 * Fix: SSOT pattern - all defaults in shared/config/defaults.js
 *
 * Note: Popup was removed in 021-comprehensive-overhaul.
 * This test now only verifies background uses SSOT defaults.
 *
 * @module tests/regression/mode-sync
 */

import { describe, test, expect, beforeAll } from '@jest/globals';
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

/**
 * Read file content
 */
function readFile(filePath) {
  const fullPath = path.resolve(projectRoot, filePath);
  if (!existsSync(fullPath)) {
    return null;
  }
  return readFileSync(fullPath, 'utf8');
}

describe('Mode Sync Regression Test (Issue 007)', () => {
  let defaults;

  beforeAll(async () => {
    // Import the SSOT defaults
    const module = await import('../../shared/config/defaults.js');
    defaults = module.defaults;
  });

  describe('SSOT defaults are consistent', () => {
    test('defaults.mode is article (not full)', () => {
      // The bug was mode defaulting to 'full' in popup but 'article' in background
      expect(defaults.mode).toBe('article');
      expect(defaults.mode).not.toBe('full');
    });

    test('defaults object is frozen (immutable)', () => {
      expect(Object.isFrozen(defaults)).toBe(true);
    });
  });

  describe('playback-controller.js uses SSOT defaults', () => {
    test('imports from shared/config/defaults.js', () => {
      const content = readFile('background/playback-controller.js');
      expect(content).not.toBeNull();

      expect(content).toMatch(/import\s*{[^}]*defaults[^}]*}\s*from\s*['"]\.\.\/shared\/config/);
    });

    test('state.mode uses defaults.mode', () => {
      const content = readFile('background/playback-controller.js');
      expect(content).not.toBeNull();

      // Should use defaults.mode for mode
      expect(content).toMatch(/mode:\s*defaults\.mode/);
    });
  });

  describe('The specific bug scenario is prevented', () => {
    test('background uses SSOT default mode', async () => {
      // Import defaults (this is the SSOT)
      const { defaults } = await import('../../shared/config/defaults.js');

      // Read background file
      const bgContent = readFile('background/playback-controller.js');
      expect(bgContent).not.toBeNull();

      // Should reference defaults.mode
      expect(bgContent).toMatch(/defaults\.mode/);

      // The actual default should be 'article' (not 'full')
      expect(defaults.mode).toBe('article');
    });

    test('fresh install would use article mode', async () => {
      const { defaults } = await import('../../shared/config/defaults.js');
      expect(defaults.mode).toBe('article');
    });
  });
});
