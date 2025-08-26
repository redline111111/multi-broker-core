"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HEALTH_DETAIL_KEYS = exports.HEALTH_REASONS = void 0;
exports.HEALTH_REASONS = {
    TRANSPORT_NOT_INITIALIZED: "transport_not_initialized",
    TRANSPORT_REPORTED_UNHEALTHY: "transport_reported_unhealthy",
    TRANSPORT_NO_ISHEALTHY: "transport_does_not_implement_isHealthy",
    HEALTH_CHECK_FAILED: "health_check_failed",
};
exports.HEALTH_DETAIL_KEYS = {
    NOTE: "note",
    ERROR: "error",
    REASON: "reason",
};
