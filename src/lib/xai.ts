interface XAIConfig {
  apiKey: string | undefined;
}

interface XAIAnalyzeParams {
  text: string;
  context: {
    type: 'feeling-analysis';
    options: string[];
    perspective: 'islamic';
  };
}

interface XAIResponse {
  feeling?: string;
  error?: string;
}

export class XAI {
  private apiKey: string | undefined;

  constructor(config: XAIConfig) {
    this.apiKey = config.apiKey;
  }

  async analyze(params: XAIAnalyzeParams): Promise<XAIResponse> {
    if (!this.apiKey) {
      throw new Error('XAI API key is not configured');
    }

    try {
      const response = await fetch('https://api.xai.deeni.app/v1/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          text: params.text,
          context: params.context
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to analyze text');
      }

      return await response.json();
    } catch (error) {
      console.error('XAI API Error:', error);
      throw error;
    }
  }
} 