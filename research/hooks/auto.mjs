/** Gate only the commentary of a main-chat WebSearch, preserving the unmodified result otherwise. */
export function shouldCompress({ tool, agentId, text, consent, enabled, twin, secret }) {
  return tool === 'WebSearch' && !agentId && typeof text === 'string' && Math.ceil(text.length / 4) > 800 && consent === true && enabled === true && twin === false && secret === false
}
