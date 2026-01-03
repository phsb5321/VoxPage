export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',

  main() {
    console.log('VoxPage content script loaded');

    // Content script is running
    // This is a minimal entrypoint for WXT initialization
    // TODO: Import and initialize content utilities from utils/ in Phase 2
  },
});
