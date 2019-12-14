import { HttpClient } from "./HttpClient";
import { ILogger } from "./ILogger";
import { ITransport, TransferFormat } from "./ITransport";
/** @private */
export declare class LongPollingTransport implements ITransport {
    private readonly httpClient;
    private readonly accessTokenFactory;
    private readonly logger;
    private readonly logMessageContent;
    private readonly pollAbort;
    private url?;
    private running;
    private receiving?;
    private closeError?;
    onreceive: ((data: string | ArrayBuffer) => void) | null;
    onclose: ((error?: Error) => void) | null;
    readonly pollAborted: boolean;
    constructor(httpClient: HttpClient, accessTokenFactory: (() => string | Promise<string>) | undefined, logger: ILogger, logMessageContent: boolean);
    connect(url: string, transferFormat: TransferFormat): Promise<void>;
    private getAccessToken;
    private updateHeaderToken;
    private poll;
    send(data: any): Promise<void>;
    stop(): Promise<void>;
    private raiseOnClose;
}
