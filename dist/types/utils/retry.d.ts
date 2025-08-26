import { RetryPolicy } from "../models/retry-policy";
import { HandlerResult } from "../models/handler-result";
export declare function withRetry(handler: () => Promise<HandlerResult>, policy?: RetryPolicy): Promise<HandlerResult>;
