/**
 * VoxPage Configuration Defaults
 * SINGLE SOURCE OF TRUTH for all default configuration values
 *
 * @module utils/config/defaults
 * @description All components MUST import defaults from this file.
 * No hardcoded default values should exist elsewhere in the codebase.
 */

import type { Settings, FooterState, Mode, Provider } from './schema';

/**
 * Default configuration values
 * These are applied when:
 * 1. Fresh extension install (no stored values)
 * 2. Invalid stored value (reset to default)
 * 3. Missing key in stored settings (merged with defaults)
 */
export const defaults: Readonly<Settings> = Object.freeze({
  mode: 'article' as Mode,
  provider: 'browser' as Provider,
  voice: null,
  speed: 1.0,
  showCostEstimate: true,
  cacheEnabled: true,
  maxCacheSize: 50,
  wordSyncEnabled: true,
  autoDetectLanguage: true,
});

/**
 * Default voice settings per provider
 * Separate from main defaults as these are provider-specific
 * null means use the first available voice from the provider
 */
export const defaultVoices: Readonly<Record<Provider, string | null>> = Object.freeze({
  openai: 'alloy',
  elevenlabs: null,
  cartesia: null,
  groq: 'hannah',
  browser: null,
});

/**
 * Boundary constraints for numeric settings
 */
export const constraints = Object.freeze({
  speed: { min: 0.5, max: 2.0 },
  maxCacheSize: { min: 10, max: 200 },
});

/**
 * Footer state defaults (018-ui-redesign)
 */
export const footerStateDefaults: Readonly<FooterState> = Object.freeze({
  isVisible: false,
  isMinimized: false,
  position: Object.freeze({
    x: 'center' as const,
    yOffset: 0,
  }),
});
