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
Object.defineProperty(exports, "__esModule", { value: true });
// This is an empty implementation of the NodeHttpClient that will be included in browser builds so the output file will be smaller
var HttpClient_1 = require("./HttpClient");
/** @private */
var NodeHttpClient = /** @class */ (function (_super) {
    __extends(NodeHttpClient, _super);
    // @ts-ignore: Need ILogger to compile, but unused variables generate errors
    function NodeHttpClient(logger) {
        return _super.call(this) || this;
    }
    NodeHttpClient.prototype.send = function () {
        return Promise.reject(new Error("If using Node either provide an XmlHttpRequest polyfill or consume the cjs or esm script instead of the browser/signalr.js one."));
    };
    return NodeHttpClient;
}(HttpClient_1.HttpClient));
exports.NodeHttpClient = NodeHttpClient;
//# sourceMappingURL=EmptyNodeHttpClient.js.map