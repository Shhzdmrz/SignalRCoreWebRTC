"use strict";
// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Errors_1 = require("./Errors");
var HttpClient_1 = require("./HttpClient");
var ILogger_1 = require("./ILogger");
var Utils_1 = require("./Utils");
var requestModule;
if (typeof XMLHttpRequest === "undefined") {
    // In order to ignore the dynamic require in webpack builds we need to do this magic
    // @ts-ignore: TS doesn't know about these names
    var requireFunc = typeof __webpack_require__ === "function" ? __non_webpack_require__ : require;
    requestModule = requireFunc("request");
}
/** @private */
var NodeHttpClient = /** @class */ (function (_super) {
    __extends(NodeHttpClient, _super);
    function NodeHttpClient(logger) {
        var _this = _super.call(this) || this;
        if (typeof requestModule === "undefined") {
            throw new Error("The 'request' module could not be loaded.");
        }
        _this.logger = logger;
        _this.cookieJar = requestModule.jar();
        _this.request = requestModule.defaults({ jar: _this.cookieJar });
        return _this;
    }
    NodeHttpClient.prototype.send = function (httpRequest) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var requestBody;
            if (Utils_1.isArrayBuffer(httpRequest.content)) {
                requestBody = Buffer.from(httpRequest.content);
            }
            else {
                requestBody = httpRequest.content || "";
            }
            var currentRequest = _this.request(httpRequest.url, {
                body: requestBody,
                // If binary is expected 'null' should be used, otherwise for text 'utf8'
                encoding: httpRequest.responseType === "arraybuffer" ? null : "utf8",
                headers: __assign({ 
                    // Tell auth middleware to 401 instead of redirecting
                    "X-Requested-With": "XMLHttpRequest" }, httpRequest.headers),
                method: httpRequest.method,
                timeout: httpRequest.timeout,
            }, function (error, response, body) {
                if (httpRequest.abortSignal) {
                    httpRequest.abortSignal.onabort = null;
                }
                if (error) {
                    if (error.code === "ETIMEDOUT") {
                        _this.logger.log(ILogger_1.LogLevel.Warning, "Timeout from HTTP request.");
                        reject(new Errors_1.TimeoutError());
                    }
                    _this.logger.log(ILogger_1.LogLevel.Warning, "Error from HTTP request. " + error);
                    reject(error);
                    return;
                }
                if (response.statusCode >= 200 && response.statusCode < 300) {
                    resolve(new HttpClient_1.HttpResponse(response.statusCode, response.statusMessage || "", body));
                }
                else {
                    reject(new Errors_1.HttpError(response.statusMessage || "", response.statusCode || 0));
                }
            });
            if (httpRequest.abortSignal) {
                httpRequest.abortSignal.onabort = function () {
                    currentRequest.abort();
                    reject(new Errors_1.AbortError());
                };
            }
        });
    };
    NodeHttpClient.prototype.getCookieString = function (url) {
        return this.cookieJar.getCookieString(url);
    };
    return NodeHttpClient;
}(HttpClient_1.HttpClient));
exports.NodeHttpClient = NodeHttpClient;
//# sourceMappingURL=NodeHttpClient.js.map