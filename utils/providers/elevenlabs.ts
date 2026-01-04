/**
 * ElevenLabs TTS Provider
 * Implementation of ITTSProvider for ElevenLabs text-to-speech API with word timing support
 *
 * @module utils/providers/elevenlabs
 */

import { BaseTTSProvider, type TTSRequest, type TTSResponse, type VoiceOption } from './base';
import { ProviderPricing } from './pricing';

/**
 * ElevenLabs voice definitions
 * Note: multilingual_v2 model supports all 29+ languages with any voice
 */
const ELEVENLABS_VOICES: VoiceOption[] = [
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', language: 'en-US', gender: 'female' },
  { id: '29vD33N1CtxCmqQRPOHJ', name: 'Drew', language: 'en-US', gender: 'male' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', language: 'en-US', gender: 'female' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', language: 'en-US', gender: 'male' },
  { id: '2EiwWnXFnvU5JabPnv8n', name: 'Clyde', language: 'en-US', gender: 'male' },
  { id: '5Q0t7uMcjvnagumLfvZi', name: 'Paul', language: 'en-US', gender: 'male' },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', language: 'en-US', gender: 'female' },
  { id: 'CYw3kZ02Hs0563khs1Fj', name: 'Dave', language: 'en-GB', gender: 'male' },
  { id: 'D38z5RcWu1voky8WS1ja', name: 'Fin', language: 'en-IE', gender: 'male' },
  { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', language: 'en-US', gender: 'female' },
];

/**
 * ElevenLabs TTS Provider Implementation
 * Supports 29+ languages and word-level timing
 */
export class ElevenLabsProvider extends BaseTTSProvider {
  readonly id = 'elevenlabs';
  readonly name = 'ElevenLabs';
  readonly supportsWordTiming = true; // ElevenLabs provides character-level alignment
  readonly supportedLanguages: string[] = [
    'en', 'es', 'fr', 'de', 'it', 'pt', 'pl', 'tr', 'ru', 'nl',
    'cs', 'ar', 'zh', 'hu', 'ko', 'ja', 'hi', 'sv', 'id', 'fil',
    'uk', 'el', 'fi', 'ro', 'da', 'bg', 'ms', 'sk', 'hr', 'ta',
  ];

  private apiKey: string | null = null;

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  hasApiKey(): boolean {
    return !!this.apiKey && this.apiKey.trim().length > 0;
  }

  async generateAudio(request: TTSRequest): Promise<TTSResponse> {
    const validated = this.validateRequest(request);

    if (!this.hasApiKey()) {
      throw new Error('ElevenLabs API key not configured');
    }

    const voiceId = validated.voice || '21m00Tcm4TlvDq8ikWAM'; // Default to Rachel

    const requestBody: any = {
      text: validated.text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.5,
        use_speaker_boost: true,
      },
    };

    // Add language code if specified
    if (validated.language) {
      // ElevenLabs uses ISO 639-1 codes (e.g., 'en', 'es', 'fr')
      const langCode = validated.language.split('-')[0].toLowerCase();
      if (this.supportsLanguage(langCode)) {
        requestBody.language_code = langCode;
      }
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': this.apiKey!,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`ElevenLabs API error (${response.status}): ${errorText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const audioBlob = new Blob([arrayBuffer], { type: 'audio/mpeg' });

    // Estimate duration
    const estimatedDuration = validated.text.length / (150 * 5) * 60;

    return this.createResponse(audioBlob, estimatedDuration, null);
  }

  async getVoices(language?: string): Promise<VoiceOption[]> {
    // All voices support all languages via multilingual_v2 model
    return ELEVENLABS_VOICES;
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/user', {
        method: 'GET',
        headers: {
          'xi-api-key': apiKey,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('ElevenLabs key validation error:', error);
      return false;
    }
  }

  protected clampSpeed(speed: number): number {
    // ElevenLabs doesn't support speed in API - handled by playbackRate
    return 1.0;
  }
}
