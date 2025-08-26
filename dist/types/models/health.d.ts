export declare enum HealthStatus {
    HEALTHY = "healthy",
    DEGRADED = "degraded",
    UNHEALTHY = "unhealthy"
}
export interface HealthReport {
    status: HealthStatus;
    details?: Record<string, unknown>;
    transportName?: string;
    timestamp: number;
}
