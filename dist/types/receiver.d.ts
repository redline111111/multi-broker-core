import { MessagingService } from "./messaging.service";
import { Receiver, ReceiverSubscription } from "./interfaces/receiver";
export declare class DefaultReceiver implements Receiver {
    private readonly svc;
    private readonly subs;
    private running;
    private inFlightCount;
    private readonly inflightControllers;
    constructor(svc: MessagingService);
    addSubscription<T>(sub: ReceiverSubscription<T>): void;
    start(): Promise<void>;
    stop(opts?: {
        drain?: boolean;
        timeoutMs?: number;
    }): Promise<void>;
    isRunning(): boolean;
    inFlight(): number;
    private attach;
}
