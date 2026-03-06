import mongoose from 'mongoose';
import os from 'os';
import { performance } from 'perf_hooks';

interface ServiceHealth {
  id: string;
  name: string;
  status: 'operational' | 'degraded' | 'down';
  uptime: number; // percentage
  latency: number; // ms
  lastCheck: Date;
  version: string;
  type: 'database' | 'api' | 'cache' | 'storage' | 'external';
}

interface SystemMetrics {
  cpu: number; // percentage
  memory: {
    total: number;
    free: number;
    used: number;
    usagePercentage: number;
  };
  uptime: number; // seconds
  os: string;
}

export class HealthService {
  /**
   * Get health status of all monitored services
   */
  async getServicesHealth(): Promise<ServiceHealth[]> {
    const services: ServiceHealth[] = [];

    // 1. Check MongoDB
    const mongoHealth = await this.checkMongoDB();
    services.push(mongoHealth);

    // 2. Check Backend API (Self)
    services.push({
      id: 'backend-api',
      name: 'ReclamTrack API',
      status: 'operational',
      uptime: 100, // Since server is running
      latency: 0,
      lastCheck: new Date(),
      version: '1.0.0',
      type: 'api',
    });

    // 3. Mock External Services (Simulated for demo)
    services.push({
      id: 'auth-service',
      name: 'Auth Provider',
      status: 'operational',
      uptime: 99.99,
      latency: Math.floor(Math.random() * 50) + 10,
      lastCheck: new Date(),
      version: '2.1.0',
      type: 'external',
    });

    services.push({
      id: 'email-service',
      name: 'Email Gateway',
      status: Math.random() > 0.9 ? 'degraded' : 'operational',
      uptime: 98.5,
      latency: Math.floor(Math.random() * 200) + 50,
      lastCheck: new Date(),
      version: '1.5.2',
      type: 'external',
    });

    return services;
  }

  /**
   * Get system metrics (CPU, Memory, Uptime)
   */
  getSystemMetrics(): SystemMetrics {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    return {
      cpu: Math.floor(Math.random() * 30) + 10, // Simulated CPU load
      memory: {
        total: totalMem,
        free: freeMem,
        used: usedMem,
        usagePercentage: Math.round((usedMem / totalMem) * 100),
      },
      uptime: os.uptime(),
      os: `${os.type()} ${os.release()}`,
    };
  }

  /**
   * Check MongoDB connection health
   */
  private async checkMongoDB(): Promise<ServiceHealth> {
    const start = performance.now();
    let status: 'operational' | 'down' = 'down';

    try {
      if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
        await mongoose.connection.db.admin().ping();
        status = 'operational';
      }
    } catch (error) {
      console.error('MongoDB health check failed:', error);
    }

    const latency = Math.round(performance.now() - start);

    return {
      id: 'mongodb',
      name: 'MongoDB Primary',
      status,
      uptime: status === 'operational' ? 99.95 : 0,
      latency,
      lastCheck: new Date(),
      version: mongoose.version,
      type: 'database',
    };
  }
}

export const healthService = new HealthService();
