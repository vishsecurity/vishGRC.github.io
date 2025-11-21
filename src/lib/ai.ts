import { db, Settings } from './db';

export class AIService {
  private static async getSettings(): Promise<Settings | undefined> {
    const settings = await db.getAll<Settings>('settings');
    return settings[0];
  }

  static async generateText(prompt: string, context?: string): Promise<string> {
    const settings = await this.getSettings();
    
    if (!settings?.aiApiKey || !settings?.aiProvider) {
      return 'AI integration not configured. Please add your API key in Settings.';
    }

    try {
      if (settings.aiProvider === 'openai') {
        return await this.callOpenAI(prompt, context, settings.aiApiKey);
      } else if (settings.aiProvider === 'anthropic') {
        return await this.callAnthropic(prompt, context, settings.aiApiKey);
      } else if (settings.aiProvider === 'local') {
        return await this.callLocalAI(prompt, context);
      }
    } catch (error) {
      console.error('AI generation error:', error);
      return 'Error generating AI response. Please check your API key and try again.';
    }

    return 'AI provider not supported.';
  }

  private static async callOpenAI(prompt: string, context: string | undefined, apiKey: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a GRC (Governance, Risk, and Compliance) expert assistant helping with security assessments, compliance documentation, and risk analysis.',
          },
          {
            role: 'user',
            content: context ? `${context}\n\n${prompt}` : prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private static async callAnthropic(prompt: string, context: string | undefined, apiKey: string): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: context ? `${context}\n\n${prompt}` : prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  private static async callLocalAI(prompt: string, context: string | undefined): Promise<string> {
    // This would connect to a local LLM API (like Ollama, LM Studio, etc.)
    // For now, return a placeholder
    return 'Local AI: Please configure your local AI endpoint. This feature requires a local LLM server running.';
  }

  // Helper methods for specific GRC tasks
  static async generateRemediationSteps(vulnerability: string, severity: string): Promise<string> {
    const prompt = `Generate detailed remediation steps for the following security vulnerability:

Vulnerability: ${vulnerability}
Severity: ${severity}

Provide:
1. Immediate actions to take
2. Long-term fixes
3. Verification steps
4. Prevention measures

Format the response as a clear, actionable list.`;

    return await this.generateText(prompt);
  }

  static async generateComplianceSummary(framework: string, controls: any[]): Promise<string> {
    const compliantCount = controls.filter(c => c.status === 'compliant').length;
    const totalCount = controls.length;
    
    const prompt = `Generate an executive summary for ${framework} compliance assessment:

Total Controls: ${totalCount}
Compliant: ${compliantCount}
Compliance Rate: ${((compliantCount / totalCount) * 100).toFixed(1)}%

Provide:
1. Overall compliance status
2. Key achievements
3. Areas requiring attention
4. Recommended next steps

Keep it concise and executive-friendly.`;

    return await this.generateText(prompt);
  }

  static async generateVAPTSummary(findings: any[]): Promise<string> {
    const critical = findings.filter(f => f.severity === 'critical').length;
    const high = findings.filter(f => f.severity === 'high').length;
    const medium = findings.filter(f => f.severity === 'medium').length;
    
    const prompt = `Generate an executive summary for a VAPT (Vulnerability Assessment and Penetration Testing) report:

Critical Findings: ${critical}
High Severity: ${high}
Medium Severity: ${medium}

Provide:
1. Overall security posture assessment
2. Critical risks identified
3. Business impact
4. Priority recommendations

Keep it professional and suitable for executive presentation.`;

    return await this.generateText(prompt);
  }

  static async enhanceRiskDescription(riskTitle: string, currentDescription: string): Promise<string> {
    const prompt = `Enhance this risk description to make it more comprehensive:

Risk: ${riskTitle}
Current Description: ${currentDescription}

Provide an enhanced description that includes:
1. Detailed explanation of the risk
2. Potential business impact
3. Common scenarios where this risk materializes
4. Risk indicators

Keep it professional and technical.`;

    return await this.generateText(prompt);
  }
}
