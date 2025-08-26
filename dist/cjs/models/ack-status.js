"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AckStatus = void 0;
var AckStatus;
(function (AckStatus) {
    AckStatus["ACK"] = "ack";
    AckStatus["NACK"] = "nack";
    AckStatus["RETRY"] = "retry";
    AckStatus["DLQ"] = "dlq";
})(AckStatus || (exports.AckStatus = AckStatus = {}));
