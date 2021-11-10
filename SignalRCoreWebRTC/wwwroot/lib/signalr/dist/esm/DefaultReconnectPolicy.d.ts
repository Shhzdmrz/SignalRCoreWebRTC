import { IRetryPolicy, RetryContext } from "./IRetryPolicy";
/** @private */
export declare class DefaultReconnectPolicy implements IRetryPolicy {
    private readonly retryDelays;
    constructor(retryDelays?: number[]);
    nextRetryDelayInMilliseconds(retryContext: RetryContext): number | null;
}
