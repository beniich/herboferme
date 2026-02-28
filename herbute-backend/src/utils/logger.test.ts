// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { describe, it, expect, vi } from 'vitest';

// Mock winston
vi.mock('winston', () => {
    const format = vi.fn((fn) => {
        return () => ({ transform: (info) => (typeof fn === 'function' ? fn(info) : info) });
    });
    format.combine = vi.fn();
    format.timestamp = vi.fn();
    format.printf = vi.fn();
    format.colorize = vi.fn();
    format.errors = vi.fn();
    format.json = vi.fn();
    const transports = {
        Console: vi.fn(),
        File: vi.fn(),
    };
    const winston = {
        format,
        transports,
        createLogger: vi.fn().mockReturnValue({
            info: vi.fn(),
            error: vi.fn(),
            debug: vi.fn(),
        }),
    };
    return {
        ...winston,
        default: winston
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
