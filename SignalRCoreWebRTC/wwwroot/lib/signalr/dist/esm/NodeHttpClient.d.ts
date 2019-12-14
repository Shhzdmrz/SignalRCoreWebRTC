import { HttpClient, HttpRequest, HttpResponse } from "./HttpClient";
import { ILogger } from "./ILogger";
/** @private */
export declare class NodeHttpClient extends HttpClient {
    private readonly logger;
    private readonly request;
    private readonly cookieJar;
    constructor(logger: ILogger);
    send(httpRequest: HttpRequest): Promise<HttpResponse>;
    getCookieString(url: string): string;
}
