export interface ChatCourse {
    id: string;
    title: string;
    provider: string;
    url?: string;
    duration_hours?: number;
    rating?: number;
    user_count?: number;
    difficulty_level?: string;
    skills?: string[];
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    courses?: ChatCourse[];
}

export interface ChatResponse {
    message: string;
    role: 'assistant';
    courses?: ChatCourse[];
}

/**
 * Send a message to the chat API and get a response
 */
export async function sendMessage(messages: { role: string; content: string }[]): Promise<ChatResponse> {
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
    }

    return response.json();
}

/**
 * Generate a unique ID for messages
 */
export function generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format messages for API consumption
 */
export function formatMessagesForApi(messages: ChatMessage[]): { role: string; content: string }[] {
    return messages.map(msg => ({
        role: msg.role,
        content: msg.content
    }));
}
