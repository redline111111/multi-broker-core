export var ProcessStatus;
(function (ProcessStatus) {
    ProcessStatus["ACK"] = "ack";
    ProcessStatus["NACK"] = "nack";
    ProcessStatus["RETRY"] = "retry";
    ProcessStatus["DLQ"] = "dlq";
})(ProcessStatus || (ProcessStatus = {}));
