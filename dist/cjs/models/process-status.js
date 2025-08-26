"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessStatus = void 0;
var ProcessStatus;
(function (ProcessStatus) {
    ProcessStatus["ACK"] = "ack";
    ProcessStatus["NACK"] = "nack";
    ProcessStatus["RETRY"] = "retry";
    ProcessStatus["DLQ"] = "dlq";
})(ProcessStatus || (exports.ProcessStatus = ProcessStatus = {}));
