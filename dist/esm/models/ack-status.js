export var AckStatus;
(function (AckStatus) {
    AckStatus["ACK"] = "ack";
    AckStatus["NACK"] = "nack";
    AckStatus["RETRY"] = "retry";
    AckStatus["DLQ"] = "dlq";
})(AckStatus || (AckStatus = {}));
