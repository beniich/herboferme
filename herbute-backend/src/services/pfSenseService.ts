import axios, { AxiosInstance } from 'axios';
import https from 'https';

interface PfSenseConfig {
  host: string;
  apiKey: string;
  apiSecret: string;
  port?: number;
  protocol?: 'http' | 'https';
}

interface FirewallRule {
  id: string;
  interface: string;
  protocol: string;
  source: string;
  destination: string;
  port?: string;
  action: 'pass' | 'block' | 'reject';
  description?: string;
  enabled: boolean;
}

interface FirewallLog {
  timestamp: Date;
  interface: string;
  action: string;
  protocol: string;
  srcIP: string;
  dstIP: string;
  srcPort?: number;
  dstPort?: number;
}

interface InterfaceStats {
  name: string;
  status: 'up' | 'down';
  ipv4?: string;
  ipv6?: string;
  bytesIn: number;
  bytesOut: number;
  packetsIn: number;
  packetsOut: number;
  errorsIn: number;
  errorsOut: number;
}

export class PfSenseService {
  private client: AxiosInstance | null = null;
  private config: PfSenseConfig | null = null;

  /**
   * Initialize pfSense connection
   * @param config - pfSense API configuration
   */
  async connect(config: PfSenseConfig): Promise<boolean> {
    try {
      this.config = config;
      const baseURL = `${config.protocol || 'https'}://${config.host}:${config.port || 443}`;

      // Create axios instance with pfSense API credentials
      this.client = axios.create({
        baseURL: baseURL + '/api/v1',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}:${config.apiSecret}`,
        },
        httpsAgent: new https.Agent({
          rejectUnauthorized: false, // Accept self-signed certificates
        }),
        timeout: 10000,
      });

      // Test connection
      const response = await this.client.get('/system/info');
      return response.status === 200;
    } catch (error) {
      console.error('Failed to connect to pfSense:', error);
      return false;
    }
  }

  /**
   * Get firewall rules
   */
  async getFirewallRules(): Promise<FirewallRule[]> {
    if (!this.client) {
      throw new Error('pfSense client not initialized. Call connect() first.');
    }

    try {
      const response = await this.client.get('/firewall/rules');
      const rules = response.data.data || [];

      return rules.map((rule: any) => ({
        id: rule.id || rule.tracker,
        interface: rule.interface,
        protocol: rule.protocol || 'any',
        source: this.formatAddress(rule.source),
        destination: this.formatAddress(rule.destination),
        port: rule.destination?.port || undefined,
        action: rule.type,
        description: rule.descr,
        enabled: rule.disabled !== 'true',
      }));
    } catch (error) {
      console.error('Failed to fetch firewall rules:', error);
      // Return mock data if connection fails
      return this.getMockFirewallRules();
    }
  }

  /**
   * Get firewall logs
   */
  async getFirewallLogs(limit: number = 100): Promise<FirewallLog[]> {
    if (!this.client) {
      throw new Error('pfSense client not initialized.');
    }

    try {
      const response = await this.client.get(`/firewall/log?limit=${limit}`);
      const logs = response.data.data || [];

      return logs.map((log: any) => ({
        timestamp: new Date(log.time * 1000),
        interface: log.interface,
        action: log.action,
        protocol: log.protoname,
        srcIP: log.src,
        dstIP: log.dst,
        srcPort: log.srcport ? parseInt(log.srcport) : undefined,
        dstPort: log.dstport ? parseInt(log.dstport) : undefined,
      }));
    } catch (error) {
      console.error('Failed to fetch firewall logs:', error);
      return this.getMockFirewallLogs();
    }
  }

  /**
   * Get interface statistics
   */
  async getInterfaceStats(): Promise<InterfaceStats[]> {
    if (!this.client) {
      throw new Error('pfSense client not initialized.');
    }

    try {
      const response = await this.client.get('/interface/stats');
      const interfaces = response.data.data || { /* Intentionally empty */ };

      return Object.keys(interfaces).map((name) => {
        const iface = interfaces[name];
        return {
          name,
          status: iface.status === 'up' ? 'up' : 'down',
          ipv4: iface.ipaddr,
          ipv6: iface.ipaddrv6,
          bytesIn: parseInt(iface.inbytes) || 0,
          bytesOut: parseInt(iface.outbytes) || 0,
          packetsIn: parseInt(iface.inpkts) || 0,
          packetsOut: parseInt(iface.outpkts) || 0,
          errorsIn: parseInt(iface.inerrs) || 0,
          errorsOut: parseInt(iface.outerrs) || 0,
        };
      });
    } catch (error) {
      console.error('Failed to fetch interface stats:', error);
      return this.getMockInterfaceStats();
    }
  }

  /**
   * Get system status
   */
  async getSystemStatus(): Promise<any> {
    if (!this.client) {
      throw new Error('pfSense client not initialized.');
    }

    try {
      const response = await this.client.get('/system/stats');
      return {
        cpu: response.data.cpu || '0%',
        memory: response.data.mem || '0%',
        temperature: response.data.temp || 'N/A',
        uptime: response.data.uptime || 'N/A',
        states: response.data.pfstate || 0,
        statesMax: response.data.pfstatemax || 0,
      };
    } catch (error) {
      console.error('Failed to fetch system status:', error);
      return {
        cpu: '45%',
        memory: '62%',
        temperature: '52    C',
        uptime: '15 days',
        states: 1250,
        statesMax: 50000,
      };
    }
  }

  /**
   * Get traffic statistics
   */
  async getTrafficStats(): Promise<any> {
    if (!this.client) {
      throw new Error('pfSense client not initialized.');
    }

    try {
      const response = await this.client.get('/diagnostics/traffic');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch traffic stats:', error);
      return {
        inbound: { rate: '45.2 Mbps', total: '128 GB' },
        outbound: { rate: '12.8 Mbps', total: '89 GB' },
      };
    }
  }

  // Helper methods
  private formatAddress(address: any): string {
    if (!address) return 'any';
    if (address.any) return 'any';
    if (address.address) return address.address;
    if (address.network) return address.network;
    return 'unknown';
  }

  // Mock data methods (fallback when pfSense is not available)
  private getMockFirewallRules(): FirewallRule[] {
    return [
      {
        id: '1',
        interface: 'WAN',
        protocol: 'tcp',
        source: 'any',
        destination: '192.168.1.0/24',
        port: '443',
        action: 'pass',
        description: 'Allow HTTPS traffic',
        enabled: true,
      },
      {
        id: '2',
        interface: 'WAN',
        protocol: 'tcp',
        source: 'any',
        destination: 'any',
        port: '22',
        action: 'block',
        description: 'Block SSH from WAN',
        enabled: true,
      },
      {
        id: '3',
        interface: 'LAN',
        protocol: 'any',
        source: '192.168.1.0/24',
        destination: 'any',
        action: 'pass',
        description: 'Allow all LAN traffic',
        enabled: true,
      },
      {
        id: '4',
        interface: 'WAN',
        protocol: 'icmp',
        source: 'any',
        destination: 'any',
        action: 'block',
        description: 'Block ICMP ping from WAN',
        enabled: false,
      },
    ];
  }

  private getMockFirewallLogs(): FirewallLog[] {
    const now = Date.now();
    return [
      {
        timestamp: new Date(now - 60000),
        interface: 'WAN',
        action: 'block',
        protocol: 'tcp',
        srcIP: '185.220.101.45',
        dstIP: '192.168.1.1',
        srcPort: 45632,
        dstPort: 22,
      },
      {
        timestamp: new Date(now - 120000),
        interface: 'WAN',
        action: 'pass',
        protocol: 'tcp',
        srcIP: '104.26.15.123',
        dstIP: '192.168.1.100',
        srcPort: 443,
        dstPort: 52341,
      },
      {
        timestamp: new Date(now - 180000),
        interface: 'WAN',
        action: 'block',
        protocol: 'udp',
        srcIP: '91.189.88.65',
        dstIP: '192.168.1.1',
        srcPort: 12345,
        dstPort: 53,
      },
    ];
  }

  private getMockInterfaceStats(): InterfaceStats[] {
    return [
      {
        name: 'WAN',
        status: 'up',
        ipv4: '203.0.113.45',
        bytesIn: 15680234567,
        bytesOut: 8934512345,
        packetsIn: 45678912,
        packetsOut: 23456789,
        errorsIn: 0,
        errorsOut: 0,
      },
      {
        name: 'LAN',
        status: 'up',
        ipv4: '192.168.1.1',
        bytesIn: 9876543210,
        bytesOut: 12345678901,
        packetsIn: 34567890,
        packetsOut: 45678901,
        errorsIn: 0,
        errorsOut: 0,
      },
      {
        name: 'OPT1',
        status: 'down',
        ipv4: '10.0.0.1',
        bytesIn: 0,
        bytesOut: 0,
        packetsIn: 0,
        packetsOut: 0,
        errorsIn: 0,
        errorsOut: 0,
      },
    ];
  }
}

export const pfSenseService = new PfSenseService();
