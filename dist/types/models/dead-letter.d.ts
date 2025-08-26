export interface DeadLetterInfo {
    originalTopic: string;
    reason: string;
    attempts: number;
    timestamp: number;
    source: string;
    messageId: string;
    correlationId?: string;
}
