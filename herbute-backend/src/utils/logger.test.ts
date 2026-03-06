// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { describe, it, expect, vi } from 'vitest';

// Mock winston
vi.mock('winston', () => {
    const formatMock = {
        combine: vi.fn(),
        timestamp: vi.fn(),
        printf: vi.fn(),
        colorize: vi.fn(),
        errors: vi.fn(),
        json: vi.fn(),
    };

    const formatCreator = vi.fn((fn) => {
        const mockFormat = vi.fn((info) => (fn ? fn(info) : info));
        Object.assign(mockFormat, formatMock);
        return mockFormat;
    });
    Object.assign(formatCreator, formatMock);

    const transports = {
        Console: vi.fn(),
        File: vi.fn(),
    };

    const loggerMock = {
        info: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
        child: vi.fn().mockReturnThis(),
    };

    return {
        default: {
            format: formatCreator,
            transports,
            createLogger: vi.fn().mockReturnValue(loggerMock),
        },
        format: formatCreator,
        transports,
        createLogger: vi.fn().mockReturnValue(loggerMock),
    };
});

import { logger } from './logger';

describe('Logger Utility', () => {
    it('should be defined', () => {
        expect(logger).toBeDefined();
    });

    it('should have standard logging methods', () => {
        expect(logger.info).toBeDefined();
        expect(logger.error).toBeDefined();
        expect(logger.debug).toBeDefined();
    });
});
