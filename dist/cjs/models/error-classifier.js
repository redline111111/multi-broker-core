"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorOutcome = void 0;
var ErrorOutcome;
(function (ErrorOutcome) {
    ErrorOutcome["RETRY"] = "retry";
    ErrorOutcome["DLQ"] = "dlq";
    ErrorOutcome["NACK"] = "nack";
    ErrorOutcome["ACK"] = "ack";
})(ErrorOutcome || (exports.ErrorOutcome = ErrorOutcome = {}));
