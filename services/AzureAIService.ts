import ModelClient, { isUnexpected } from '@azure-rest/ai-inference';
import { AzureKeyCredential } from '@azure/core-auth';

const token = process.env['EXPO_PUBLIC_GITHUB_TOKEN'] || '';
const endpoint = 'https://models.github.ai/inference';
const modelName = 'gpt-4o-mini'; // Changed from DeepSeek-R1 to a direct response model

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Function to clean AI response by removing thinking tags
function cleanAIResponse(content: string): string {
  if (!content) return content;

  // Remove <think>...</think> blocks
  const cleanedContent = content
    .replace(/<think>[\s\S]*?<\/think>/g, '')
    .trim();

  // If the content is empty after cleaning, return original
  return cleanedContent || content;
}

// Add delay function for rate limiting
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function main() {
  console.log('🔑 Token check:', token ? 'Token loaded' : 'Token is empty');
  console.log('🔑 Token length:', token.length);

  if (!token) {
    throw new Error(
      'EXPO_PUBLIC_GITHUB_TOKEN is not set in environment variables'
    );
  }

  const client = ModelClient(endpoint, new AzureKeyCredential(token));

  const response = await client.path('/chat/completions').post({
    body: {
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant. Provide direct, concise answers.',
        },
        { role: 'user', content: 'What is the capital of France?' },
      ],
      max_tokens: 150, // Reduced for faster response
      model: modelName,
      temperature: 0.3, // Lower temperature for more focused responses
    },
  });

  if (isUnexpected(response)) {
    throw response.body.error;
  }

  const rawContent = response.body.choices[0].message.content || '';
  const cleanedContent = cleanAIResponse(rawContent);

  console.log('Raw response:', rawContent);
  console.log('Cleaned response:', cleanedContent);

  return cleanedContent;
}

export async function chatWithAI(
  messages: Message[],
  retryCount = 0
): Promise<string> {
  const client = ModelClient(endpoint, new AzureKeyCredential(token));

  // Add system message for direct responses
  const systemMessage: Message = {
    role: 'system',
    content:
      'You are a helpful skincare assistant. Provide direct, practical answers. Be concise and helpful. Do not show your thinking process.',
  };

  const allMessages = [systemMessage, ...messages];

  try {
    const response = await client.path('/chat/completions').post({
      body: {
        messages: allMessages,
        max_tokens: 150, // Reduced for faster response
        model: modelName,
        temperature: 0.3, // Lower temperature for more direct responses
      },
    });

    if (isUnexpected(response)) {
      // Handle rate limiting
      if (response.body.error?.code === 'RateLimitReached' && retryCount < 3) {
        console.log(
          `Rate limited, waiting and retrying... (attempt ${retryCount + 1})`
        );
        await delay(2000); // Wait 2 seconds
        return chatWithAI(messages, retryCount + 1);
      }
      throw response.body.error;
    }

    const rawContent = response.body.choices[0].message.content || '';
    const cleanedContent = cleanAIResponse(rawContent);

    return cleanedContent || 'Sorry, I could not generate a proper response.';
  } catch (error: any) {
    // Handle rate limiting error
    if (error?.code === 'RateLimitReached' && retryCount < 3) {
      console.log(
        `Rate limited, waiting and retrying... (attempt ${retryCount + 1})`
      );
      await delay(2000);
      return chatWithAI(messages, retryCount + 1);
    }
    throw error;
  }
}
