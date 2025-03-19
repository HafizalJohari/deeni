declare module '@xai/client' {
  interface XAIClientConfig {
    apiKey: string;
  }

  interface XAIGenerateOptions {
    prompt: string;
    maxTokens?: number;
    temperature?: number;
  }

  interface XAIResponse {
    text: string;
  }

  interface XAIClient {
    generate(options: XAIGenerateOptions): Promise<XAIResponse>;
  }

  export function createClient(config: XAIClientConfig): XAIClient;
} 