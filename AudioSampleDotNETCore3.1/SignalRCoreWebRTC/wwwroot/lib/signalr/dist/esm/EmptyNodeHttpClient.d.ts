import { HttpClient, HttpResponse } from "./HttpClient";
import { ILogger } from "./ILogger";
/** @private */
export declare class NodeHttpClient extends HttpClient {
    constructor(logger: ILogger);
    send(): Promise<HttpResponse>;
}
