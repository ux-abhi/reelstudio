// Re-exports from contentWriter — the canonical source of all prompt logic.
// This file is kept for backward compatibility with any imports that still reference it.

export {
  INSTAGRAM_SYSTEM,
  buildInstagramScriptPrompt  as buildScriptPrompt,
  buildInstagramHooksPrompt   as buildHooksOnlyPrompt,
  buildInstagramCaptionPrompt as buildCaptionPrompt,
  instagramGroqPayload,
} from './contentWriter'
