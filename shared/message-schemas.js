/**
 * Message Schemas
 * Zod schemas for runtime validation of messages between extension components.
 * These schemas define the exact structure of messages for type-safe communication.
 *
 * @module shared/message-schemas
 * @see shared/message-types.js - JSDoc type definitions
 * @see background/constants.js - MessageType enum
 */

import { z } from 'zod';

// =============================================================================
// Base Types
// =============================================================================

/**
 * Provider IDs enum
 */
export const ProviderIdSchema = z.enum([
  'openai',
  'elevenlabs',
  'cartesia',
  'groq',
  'browser'
]);

/**
 * Playback status enum
 */
export const PlaybackStatusSchema = z.enum([
  'idle',
  'loading',
  'playing',
  'paused',
  'stopped',
  'error'
]);

/**
 * Reading mode enum
 */
export const ReadingModeSchema = z.enum([
  'full',
  'selection',
  'article'
]);

/**
 * Speed range (0.5 to 2.0)
 */
export const SpeedSchema = z.number().min(0.5).max(2.0);

// =============================================================================
// Playback Control Messages (popup/content → background)
// =============================================================================

/**
 * Play message - Start playback
 */
export const PlayMessageSchema = z.object({
  action: z.literal('play'),
  provider: ProviderIdSchema.optional(),
  voice: z.string().optional(),
  speed: SpeedSchema.optional(),
  mode: ReadingModeSchema.optional(),
  text: z.string().optional()
});

/**
 * Pause message - Pause current playback
 */
export const PauseMessageSchema = z.object({
  action: z.literal('pause')
});

/**
 * Resume message - Resume paused playback
 */
export const ResumeMessageSchema = z.object({
  action: z.literal('resume')
});

/**
 * Stop message - Stop playback and reset state
 */
export const StopMessageSchema = z.object({
  action: z.literal('stop')
});

/**
 * Previous paragraph message
 */
export const PrevMessageSchema = z.object({
  action: z.literal('prev')
});

/**
 * Next paragraph message
 */
export const NextMessageSchema = z.object({
  action: z.literal('next')
});

// =============================================================================
// Settings Messages (popup/options → background)
// =============================================================================

/**
 * Set provider message
 */
export const SetProviderMessageSchema = z.object({
  action: z.literal('setProvider'),
  provider: ProviderIdSchema
});

/**
 * Set voice message
 */
export const SetVoiceMessageSchema = z.object({
  action: z.literal('setVoice'),
  voice: z.string().min(1)
});

/**
 * Set speed message
 */
export const SetSpeedMessageSchema = z.object({
  action: z.literal('setSpeed'),
  speed: SpeedSchema
});

// =============================================================================
// State Query Messages (popup → background)
// =============================================================================

/**
 * Get state message
 */
export const GetStateMessageSchema = z.object({
  action: z.literal('getState')
});

/**
 * Get providers message
 */
export const GetProvidersMessageSchema = z.object({
  action: z.literal('getProviders')
});

/**
 * Get visualizer data message
 */
export const GetVisualizerDataMessageSchema = z.object({
  action: z.literal('getVisualizerData')
});

// =============================================================================
// Content Script Messages (content → background)
// =============================================================================

/**
 * Text content message - extracted text from page
 */
export const TextContentMessageSchema = z.object({
  action: z.literal('textContent'),
  paragraphs: z.array(z.string()),
  mode: ReadingModeSchema.optional()
});

/**
 * Jump to paragraph message
 */
export const JumpToParagraphMessageSchema = z.object({
  action: z.literal('jumpToParagraph'),
  index: z.number().int().min(0)
});

/**
 * Jump to word message
 */
export const JumpToWordMessageSchema = z.object({
  action: z.literal('jumpToWord'),
  paragraphIndex: z.number().int().min(0),
  wordIndex: z.number().int().min(0)
});

/**
 * Controller action message (from floating controller)
 */
export const ControllerActionMessageSchema = z.object({
  action: z.literal('controllerAction'),
  controllerAction: z.enum(['play', 'pause', 'stop', 'prev', 'next', 'close']),
  position: z.object({
    x: z.number(),
    y: z.number()
  }).optional()
});

/**
 * Visibility changed message
 */
export const VisibilityChangedMessageSchema = z.object({
  action: z.literal('visibilityChanged'),
  visible: z.boolean()
});

/**
 * Request resync message
 */
export const RequestResyncMessageSchema = z.object({
  action: z.literal('requestResync')
});

/**
 * Controller position changed message
 */
export const ControllerPositionChangedMessageSchema = z.object({
  action: z.literal('controllerPositionChanged'),
  position: z.object({
    x: z.number(),
    y: z.number()
  })
});

/**
 * Seek to position message
 */
export const SeekToPositionMessageSchema = z.object({
  action: z.literal('seekToPosition'),
  position: z.number().min(0).max(1)
});

// =============================================================================
// Background → Popup/Content Messages (notifications)
// =============================================================================

/**
 * Playback state notification
 */
export const PlaybackStateMessageSchema = z.object({
  type: z.literal('playbackState'),
  status: PlaybackStatusSchema,
  isPlaying: z.boolean(),
  isPaused: z.boolean(),
  progress: z.number().min(0).max(100).optional(),
  currentIndex: z.number().int().min(0).optional(),
  totalParagraphs: z.number().int().min(0).optional()
});

/**
 * Progress notification
 */
export const ProgressMessageSchema = z.object({
  type: z.literal('progress'),
  current: z.number().min(0),
  total: z.number().min(0),
  percent: z.number().min(0).max(100)
});

/**
 * Error notification
 */
export const ErrorMessageSchema = z.object({
  type: z.literal('error'),
  message: z.string(),
  code: z.string().optional()
});

/**
 * Paragraph changed notification
 */
export const ParagraphChangedMessageSchema = z.object({
  type: z.literal('paragraphChanged'),
  index: z.number().int().min(0),
  total: z.number().int().min(0),
  text: z.string().optional()
});

/**
 * Sync status notification
 */
export const SyncStatusMessageSchema = z.object({
  type: z.literal('syncStatus'),
  currentTimeMs: z.number().min(0),
  durationMs: z.number().min(0),
  driftMs: z.number(),
  isResync: z.boolean().optional()
});

// =============================================================================
// Timeline Synchronization Messages (FR-002, FR-023)
// =============================================================================

/**
 * Timeline ready acknowledgment - Content confirms receipt of word timeline
 * Direction: content → background
 * Used to prevent race condition during paragraph transitions
 */
export const TimelineReadyMessageSchema = z.object({
  type: z.literal('TIMELINE_READY'),
  paragraphIndex: z.number().int().min(0),
  timestamp: z.number()
});

// =============================================================================
// Footer Control Messages (FR-007, FR-009)
// =============================================================================

/**
 * Toggle footer settings panel visibility
 * Direction: background → content (triggered by toolbar icon click)
 */
export const ToggleFooterSettingsMessageSchema = z.object({
  type: z.literal('TOGGLE_FOOTER_SETTINGS')
});

/**
 * Footer show message
 * Direction: background → content
 */
export const FooterShowMessageSchema = z.object({
  type: z.literal('FOOTER_SHOW'),
  expanded: z.boolean().optional()
});

/**
 * Footer hide message
 * Direction: background → content
 */
export const FooterHideMessageSchema = z.object({
  type: z.literal('FOOTER_HIDE')
});

/**
 * Footer state update message
 * Direction: background → content
 */
export const FooterStateUpdateMessageSchema = z.object({
  type: z.literal('FOOTER_STATE_UPDATE'),
  isPlaying: z.boolean(),
  isPaused: z.boolean(),
  currentIndex: z.number().int().min(0),
  totalParagraphs: z.number().int().min(0),
  currentTime: z.number().min(0),
  duration: z.number().min(0),
  speed: z.number().min(0.5).max(2.0)
});

// =============================================================================
// Settings Sync Messages (FR-007)
// =============================================================================

/**
 * Settings changed message from quick settings panel
 * Direction: content → background
 */
export const SettingsChangedMessageSchema = z.object({
  type: z.literal('SETTINGS_CHANGED'),
  setting: z.enum(['provider', 'voice', 'speed', 'mode', 'language']),
  value: z.union([z.string(), z.number(), z.null()])
});

/**
 * Get settings message
 * Direction: content → background
 */
export const GetSettingsMessageSchema = z.object({
  type: z.literal('GET_SETTINGS')
});

/**
 * Get voices message
 * Direction: content → background
 */
export const GetVoicesMessageSchema = z.object({
  type: z.literal('GET_VOICES'),
  provider: z.string(),
  language: z.string().optional()
});

// =============================================================================
// Context Menu Messages (FR-008)
// =============================================================================

/**
 * Context menu action message
 * Direction: background → content
 */
export const ContextMenuActionMessageSchema = z.object({
  type: z.literal('CONTEXT_MENU_ACTION'),
  action: z.enum(['play-article', 'play-selection', 'pause', 'settings'])
});

// =============================================================================
// Content Script Actions (background → content)
// =============================================================================

/**
 * Highlight paragraph action
 */
export const HighlightMessageSchema = z.object({
  action: z.literal('highlight'),
  index: z.number().int().min(0),
  text: z.string().optional()
});

/**
 * Highlight word action
 */
export const HighlightWordMessageSchema = z.object({
  action: z.literal('highlightWord'),
  paragraphIndex: z.number().int().min(0),
  wordIndex: z.number().int().min(0),
  word: z.string()
});

/**
 * Set word timeline action
 */
export const SetWordTimelineMessageSchema = z.object({
  action: z.literal('setWordTimeline'),
  paragraphIndex: z.number().int().min(0),
  timeline: z.array(z.object({
    word: z.string(),
    startMs: z.number().min(0),
    endMs: z.number().min(0)
  }))
});

/**
 * Clear highlight action
 */
export const ClearHighlightMessageSchema = z.object({
  action: z.literal('clearHighlight')
});

/**
 * Show floating controller action
 */
export const ShowFloatingControllerMessageSchema = z.object({
  action: z.literal('showFloatingController')
});

/**
 * Hide floating controller action
 */
export const HideFloatingControllerMessageSchema = z.object({
  action: z.literal('hideFloatingController')
});

/**
 * Update playback state action (to content script)
 */
export const UpdatePlaybackStateMessageSchema = z.object({
  action: z.literal('updatePlaybackState'),
  status: PlaybackStatusSchema,
  progress: z.number().min(0).max(100).optional(),
  currentIndex: z.number().int().min(0).optional(),
  totalParagraphs: z.number().int().min(0).optional()
});

// =============================================================================
// Onboarding Messages
// =============================================================================

/**
 * Set onboarding complete message
 */
export const SetOnboardingCompleteMessageSchema = z.object({
  action: z.literal('setOnboardingComplete')
});

// =============================================================================
// Union of All Message Types
// =============================================================================

/**
 * All possible messages from popup/content to background
 */
export const IncomingMessageSchema = z.discriminatedUnion('action', [
  PlayMessageSchema,
  PauseMessageSchema,
  ResumeMessageSchema,
  StopMessageSchema,
  PrevMessageSchema,
  NextMessageSchema,
  SetProviderMessageSchema,
  SetVoiceMessageSchema,
  SetSpeedMessageSchema,
  GetStateMessageSchema,
  GetProvidersMessageSchema,
  GetVisualizerDataMessageSchema,
  TextContentMessageSchema,
  JumpToParagraphMessageSchema,
  JumpToWordMessageSchema,
  ControllerActionMessageSchema,
  VisibilityChangedMessageSchema,
  RequestResyncMessageSchema,
  ControllerPositionChangedMessageSchema,
  SeekToPositionMessageSchema,
  SetOnboardingCompleteMessageSchema
]);

/**
 * All possible messages from background to popup
 */
export const OutgoingPopupMessageSchema = z.discriminatedUnion('type', [
  PlaybackStateMessageSchema,
  ProgressMessageSchema,
  ErrorMessageSchema,
  ParagraphChangedMessageSchema,
  SyncStatusMessageSchema
]);

/**
 * All possible messages from background to content script
 */
export const OutgoingContentMessageSchema = z.discriminatedUnion('action', [
  HighlightMessageSchema,
  HighlightWordMessageSchema,
  SetWordTimelineMessageSchema,
  ClearHighlightMessageSchema,
  ShowFloatingControllerMessageSchema,
  HideFloatingControllerMessageSchema,
  UpdatePlaybackStateMessageSchema
]);

// =============================================================================
// Validation Helpers
// =============================================================================

/**
 * Validate an incoming message (popup/content → background)
 * @param {unknown} message - The message to validate
 * @returns {{ success: true, data: z.infer<typeof IncomingMessageSchema> } | { success: false, error: z.ZodError }}
 */
export function validateIncomingMessage(message) {
  return IncomingMessageSchema.safeParse(message);
}

/**
 * Validate an outgoing message to popup (background → popup)
 * @param {unknown} message - The message to validate
 * @returns {{ success: true, data: z.infer<typeof OutgoingPopupMessageSchema> } | { success: false, error: z.ZodError }}
 */
export function validateOutgoingPopupMessage(message) {
  return OutgoingPopupMessageSchema.safeParse(message);
}

/**
 * Validate an outgoing message to content script (background → content)
 * @param {unknown} message - The message to validate
 * @returns {{ success: true, data: z.infer<typeof OutgoingContentMessageSchema> } | { success: false, error: z.ZodError }}
 */
export function validateOutgoingContentMessage(message) {
  return OutgoingContentMessageSchema.safeParse(message);
}

/**
 * Type assertion helper for validated messages
 * Throws if validation fails
 * @template T
 * @param {z.ZodType<T>} schema - The schema to validate against
 * @param {unknown} message - The message to validate
 * @returns {T}
 */
export function assertMessage(schema, message) {
  return schema.parse(message);
}

// =============================================================================
// Generic Message Validation (FR-021)
// =============================================================================

/**
 * Message schema map - maps message type/action to schema
 * Used by validateMessage() for router-level validation
 */
export const MessageSchemas = {
  // Playback control (action-based)
  'play': PlayMessageSchema,
  'pause': PauseMessageSchema,
  'resume': ResumeMessageSchema,
  'stop': StopMessageSchema,
  'prev': PrevMessageSchema,
  'next': NextMessageSchema,

  // Settings (action-based)
  'setProvider': SetProviderMessageSchema,
  'setVoice': SetVoiceMessageSchema,
  'setSpeed': SetSpeedMessageSchema,
  'getState': GetStateMessageSchema,
  'getProviders': GetProvidersMessageSchema,
  'getVisualizerData': GetVisualizerDataMessageSchema,

  // Content script (action-based)
  'textContent': TextContentMessageSchema,
  'jumpToParagraph': JumpToParagraphMessageSchema,
  'jumpToWord': JumpToWordMessageSchema,
  'controllerAction': ControllerActionMessageSchema,
  'visibilityChanged': VisibilityChangedMessageSchema,
  'requestResync': RequestResyncMessageSchema,
  'controllerPositionChanged': ControllerPositionChangedMessageSchema,
  'seekToPosition': SeekToPositionMessageSchema,
  'setOnboardingComplete': SetOnboardingCompleteMessageSchema,

  // Highlight actions (action-based, background → content)
  'highlight': HighlightMessageSchema,
  'highlightWord': HighlightWordMessageSchema,
  'setWordTimeline': SetWordTimelineMessageSchema,
  'clearHighlight': ClearHighlightMessageSchema,
  'showFloatingController': ShowFloatingControllerMessageSchema,
  'hideFloatingController': HideFloatingControllerMessageSchema,
  'updatePlaybackState': UpdatePlaybackStateMessageSchema,

  // NEW: Timeline sync (type-based, FR-002/FR-023)
  'TIMELINE_READY': TimelineReadyMessageSchema,

  // NEW: Footer control (type-based, FR-007/FR-009)
  'TOGGLE_FOOTER_SETTINGS': ToggleFooterSettingsMessageSchema,
  'FOOTER_SHOW': FooterShowMessageSchema,
  'FOOTER_HIDE': FooterHideMessageSchema,
  'FOOTER_STATE_UPDATE': FooterStateUpdateMessageSchema,

  // NEW: Settings sync (type-based, FR-007)
  'SETTINGS_CHANGED': SettingsChangedMessageSchema,
  'GET_SETTINGS': GetSettingsMessageSchema,
  'GET_VOICES': GetVoicesMessageSchema,

  // NEW: Context menu (type-based, FR-008)
  'CONTEXT_MENU_ACTION': ContextMenuActionMessageSchema,

  // Notifications (type-based)
  'playbackState': PlaybackStateMessageSchema,
  'progress': ProgressMessageSchema,
  'error': ErrorMessageSchema,
  'paragraphChanged': ParagraphChangedMessageSchema,
  'syncStatus': SyncStatusMessageSchema
};

/**
 * Validate any message using the schema map
 * Supports both 'action' and 'type' discriminators
 *
 * @param {unknown} message - The message to validate
 * @returns {{ success: true, data: object } | { success: false, error: { issues: Array<{message: string, path: Array<string>}> } }}
 */
export function validateMessage(message) {
  if (!message || typeof message !== 'object') {
    return {
      success: false,
      error: { issues: [{ message: 'Message must be an object', path: [] }] }
    };
  }

  // Get the message type from either 'type' or 'action' property
  const messageType = message.type || message.action;

  if (!messageType) {
    return {
      success: false,
      error: { issues: [{ message: 'Message must have type or action property', path: [] }] }
    };
  }

  const schema = MessageSchemas[messageType];

  if (!schema) {
    // Unknown message types pass through (for extensibility)
    return { success: true, data: message };
  }

  return schema.safeParse(message);
}
