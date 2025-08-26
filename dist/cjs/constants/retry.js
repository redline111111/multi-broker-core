"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RETRY_DEFAULTS = void 0;
exports.RETRY_DEFAULTS = {
    MAX_ATTEMPTS: 3, // включая первую попытку
    BASE_DELAY_MS: 200, // базовая задержка
    FACTOR: 2, // множитель экспоненты
    JITTER_MS: 100, // добавочный джиттер [0..JITTER_MS]
};
