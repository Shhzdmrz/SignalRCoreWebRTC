// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
// Version token that will be replaced by the prepack command
/** The version of the SignalR client. */
export var VERSION = "3.1.0";
export { AbortError, HttpError, TimeoutError } from "./Errors";
export { HttpClient, HttpResponse } from "./HttpClient";
export { DefaultHttpClient } from "./DefaultHttpClient";
export { HubConnection, HubConnectionState } from "./HubConnection";
export { HubConnectionBuilder } from "./HubConnectionBuilder";
export { MessageType } from "./IHubProtocol";
export { LogLevel } from "./ILogger";
export { HttpTransportType, TransferFormat } from "./ITransport";
export { NullLogger } from "./Loggers";
export { JsonHubProtocol } from "./JsonHubProtocol";
export { Subject } from "./Subject";
//# sourceMappingURL=index.js.map