'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import { CheckCircle, Radar, Search } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface ScanResult {
  ip: string;
  isAlive: boolean;
  responseTime?: number;
}

export default function NetworkScanPage() {
  const [subnet, setSubnet] = useState('192.168.1');
  const [results, setResults] = useState<ScanResult[]>([]);
  const [scanning, setScanning] = useState(false);
  const [hostsFound, setHostsFound] = useState(0);

  const handleScan = async () => {
    if (!subnet) return;

    setScanning(true);
    setResults([]);

    try {
      const res = await api.post('/api/monitoring/scan', { subnet });
      setResults(res.data.results);
      setHostsFound(res.data.hostsFound);

      if (res.data.hostsFound > 0) {
        toast.success(`Found ${res.data.hostsFound} active hosts`);
      } else {
        toast('No active hosts found', { icon: '      ' });
      }
    } catch (error: any) {
      console.error('Scan failed:', error);
      toast.error(error.response?.data?.error || 'Scan failed');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Network Discovery</h1>
          <p className="text-gray-600 mt-1">Scan subnets to find active devices</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-purple-600" />
            Scan Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 max-w-xl">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Subnet (e.g. 192.168.1)</label>
              <div className="flex items-center gap-2">
                 <span className="bg-gray-100 px-3 py-2 rounded border text-gray-500 font-mono">IPv4</span>
                 <Input
                   value={subnet}
                   onChange={(e) => setSubnet(e.target.value)}
                   placeholder="192.168.1"
                   className="font-mono"
                 />
              </div>
              <p className="text-xs text-gray-500 mt-1">Will scan from .1 to .254</p>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleScan}
                disabled={scanning || !subnet}
                className="bg-purple-600 hover:bg-purple-700 w-32"
              >
                {scanning ? (
                  <Radar className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Radar className="h-4 w-4 mr-2" />
                )}
                {scanning ? 'Scanning...' : 'Start Scan'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
             <CardTitle className="flex items-center justify-between">
                <span>Scan Results</span>
                <span className="text-sm font-normal bg-green-100 text-green-800 px-3 py-1 rounded-full">
                  {hostsFound} Hosts Found
                </span>
             </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                  <tr>
                    <th className="px-4 py-3">IP Address</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Response Time</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((host) => (
                    <tr key={host.ip} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono font-medium">{host.ip}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          Online
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {host.responseTime ? `${host.responseTime}ms` : '< 1ms'}
                      </td>
                      <td className="px-4 py-3">
                        <Button variant="outline" size="sm" className="text-xs">
                          Add to Inventory
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {!scanning && results.length === 0 && hostsFound === 0 && (
         <div className="text-center py-12 text-gray-500">
           <Radar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
           <p>Enter a subnet and start scanning to discover devices.</p>
         </div>
      )}
    </div>
  );
}
