export var ErrorOutcome;
(function (ErrorOutcome) {
    ErrorOutcome["RETRY"] = "retry";
    ErrorOutcome["DLQ"] = "dlq";
    ErrorOutcome["NACK"] = "nack";
    ErrorOutcome["ACK"] = "ack";
})(ErrorOutcome || (ErrorOutcome = {}));
