import snmp from 'snmp-native';
import ping from 'ping';
import NetworkDevice from '../models/NetworkDevice.js';
import ITAsset from '../models/ITAsset.js';

interface ScanResult {
  ip: string;
  isAlive: boolean;
  hostname?: string;
  mac?: string;
  type?: string;
  responseTime?: number;
}

interface SnmpMetrics {
  sysDescr?: string;
  sysUpTime?: number; // In hundredths of a second
  sysContact?: string;
  sysName?: string;
  sysLocation?: string;
  interfaces?: number;
  cpuUsage?: number; // Requires specific OID depending on device
  memoryUsage?: number; // Requires specific OID depending on device
}

export class NetworkService {
  private community: string;

  constructor(community: string = 'public') {
    this.community = community;
  }

  // Check if a host is reachable via Ping
  async pingHost(host: string): Promise<{ alive: boolean; time?: number }> {
    try {
      const res = await ping.promise.probe(host, { timeout: 2 });
      return { alive: res.alive, time: typeof res.time === 'number' ? res.time : undefined };
    } catch (error) {
      console.error(`Ping failed for ${host}:`, error);
      return { alive: false };
    }
  }

  // Scan a subnet (simplistic sequential scan for now, could be parallelized)
  async scanSubnet(subnet: string): Promise<ScanResult[]> {
    const results: ScanResult[] = [];
    const parts = subnet.split('.');
    if (parts.length !== 3) { // Expecting "192.168.1"
       throw new Error('Invalid subnet format. Expected format: "xxx.xxx.xxx"');
    }

    const baseIp = subnet;

    // Create an array of promises for parallel execution (batch of 255)
    const scanPromises: Promise<{ ip: string; alive: boolean; time?: number }>[] = [];
    for (let i = 1; i < 255; i++) {
      const ip = `${baseIp}.${i}`;
      scanPromises.push(this.pingHost(ip).then(res => ({ ip, ...res })));
    }

    const scanResults = await Promise.all(scanPromises);

    return scanResults
      .filter(r => r.alive)
      .map(r => ({
        ip: r.ip,
        isAlive: true,
        responseTime: r.time
      }));
  }

  // Get basic SNMP info (System Group)
  async getSnmpSystemInfo(host: string): Promise<SnmpMetrics> {
    return new Promise((resolve, reject) => {
      const session = new snmp.Session({ host, community: this.community });

      const oids = [
        [1, 3, 6, 1, 2, 1, 1, 1, 0], // sysDescr
        [1, 3, 6, 1, 2, 1, 1, 3, 0], // sysUpTime
        [1, 3, 6, 1, 2, 1, 1, 4, 0], // sysContact
        [1, 3, 6, 1, 2, 1, 1, 5, 0], // sysName
        [1, 3, 6, 1, 2, 1, 1, 6, 0], // sysLocation
        [1, 3, 6, 1, 2, 1, 2, 1, 0], // ifNumber
      ];

      session.getAll({ oids }, (error: any, varbinds: any[]) => {
        if (error) {
          session.close();
          // Don't reject, just return empty/partial data as SNMP might fail or timeout
          console.warn(`SNMP failed for ${host}:`, error);
          resolve({});
          return;
        }

        const metrics: SnmpMetrics = {};

        varbinds.forEach(vb => {
          const oidStr = vb.oid.join('.'); // Convert OID array to string for checking
           // Mapping based on standard OIDs (simplified)
           if (this.compareOid(vb.oid, [1, 3, 6, 1, 2, 1, 1, 1, 0])) metrics.sysDescr = vb.value;
           if (this.compareOid(vb.oid, [1, 3, 6, 1, 2, 1, 1, 3, 0])) metrics.sysUpTime = vb.value;
           if (this.compareOid(vb.oid, [1, 3, 6, 1, 2, 1, 1, 4, 0])) metrics.sysContact = vb.value;
           if (this.compareOid(vb.oid, [1, 3, 6, 1, 2, 1, 1, 5, 0])) metrics.sysName = vb.value;
           if (this.compareOid(vb.oid, [1, 3, 6, 1, 2, 1, 1, 6, 0])) metrics.sysLocation = vb.value;
           if (this.compareOid(vb.oid, [1, 3, 6, 1, 2, 1, 2, 1, 0])) metrics.interfaces = vb.value;
        });

        session.close();
        resolve(metrics);
      });
    });
  }

  // Helper to compare OID arrays
  private compareOid(oid1: number[], oid2: number[]): boolean {
    if (oid1.length !== oid2.length) return false;
    for (let i = 0; i < oid1.length; i++) {
        if (oid1[i] !== oid2[i]) return false;
    }
    return true;
  }
}

export default new NetworkService();
