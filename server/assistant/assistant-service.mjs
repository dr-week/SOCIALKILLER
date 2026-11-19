import {
  AssistantProviderError,
  createGeminiAdapter,
  getGeminiStatus
} from '../integrations/ai/gemini-adapter.mjs'

export const MAX_ASSISTANT_PROMPT_CHARS = 2000

const SYSTEM_INSTRUCTION = 'Answer only the current user question, briefly. Use no workspace context or memory. Do not retrieve data or perform actions such as publishing, scheduling, deletion, account changes, or code execution. If project facts are needed, ask the user to provide the relevant excerpt.'
const COMMENT_REPLY_INSTRUCTION = 'Write one concise, warm, brand-safe reply to the supplied social comment or customer message. Use only facts present in the message. Do not invent prices, policies, promises, personal data, or claim an action was completed. If the message is sensitive, a complaint, asks for account-specific help, or needs missing facts, draft a polite acknowledgement and invite a human to follow up. Return only the reply text. Do not publish or send anything.'

export class AssistantInputError extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'AssistantInputError'
    this.code = code
    this.status = 400
  }
}

export function createAssistantService({ env = process.env, generateText = createGeminiAdapter({ env }) } = {}) {
  return {
    getStatus() {
      return { ...getGeminiStatus(env), maxPromptChars: MAX_ASSISTANT_PROMPT_CHARS }
    },
    async reply(prompt) {
      if (typeof prompt !== 'string') throw new AssistantInputError('invalid_prompt', 'prompt must be a string.')
      const trimmedPrompt = prompt.trim()
      if (!trimmedPrompt) throw new AssistantInputError('empty_prompt', 'Enter a prompt first.')
      if (trimmedPrompt.length > MAX_ASSISTANT_PROMPT_CHARS) {
        throw new AssistantInputError('prompt_too_long', `Keep each prompt under ${MAX_ASSISTANT_PROMPT_CHARS} characters and split larger tasks into smaller questions.`)
      }
      if (typeof generateText !== 'function') {
        throw new AssistantProviderError('provider_unavailable', 'The AI provider is not available.', 503)
      }
      return generateText({ prompt: trimmedPrompt, systemInstruction: SYSTEM_INSTRUCTION })
    },
    async draftCommentReply({ message, kind = 'comment', platformId = '', tone = '' } = {}) {
      if (typeof message !== 'string' || !message.trim()) throw new AssistantInputError('empty_message', 'A comment or message is required.')
      if (message.length > MAX_ASSISTANT_PROMPT_CHARS) throw new AssistantInputError('message_too_long', `Keep the source message under ${MAX_ASSISTANT_PROMPT_CHARS} characters.`)
      if (typeof generateText !== 'function') throw new AssistantProviderError('provider_unavailable', 'The AI provider is not available.', 503)
      const prompt = `Channel: ${String(platformId).slice(0, 40)}\nType: ${kind === 'message' ? 'private message' : 'public comment'}\nBrand tone: ${String(tone).slice(0, 300) || 'friendly and clear'}\nIncoming text:\n${message.trim()}`
      return generateText({ prompt, systemInstruction: COMMENT_REPLY_INSTRUCTION })
    }
  }
}

export const assistantService = createAssistantService()
