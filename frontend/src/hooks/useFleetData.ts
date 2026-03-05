import useSWR from 'swr';

export interface FleetStats {
  totalVehicles: number;
  activeVehicles: number;
  maintenanceCount: number;
  horsServiceCount: number;
}

export interface Vehicle {
  _id: string;
  name: string;
  model: string;
  kmPerYear: number;
  status: 'active' | 'maintenance' | 'hors_service';
  lastMaintenance?: Date;
  nextMaintenance?: Date;
}

export interface FleetData {
  stats: FleetStats;
  vehicles: Vehicle[];
  lastUpdated: Date;
}

export interface UseFleetDataResponse {
  data: FleetData | undefined;
  isLoading: boolean;
  error: Error | null;
  mutate: any;
}

const fetcher = async (): Promise<FleetData> => {
  try {
    const statsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2065'}/api/fleet/stats`, {
      headers: { 'x-organization-id': localStorage.getItem('orgId') || '' }
    });
    
    const vehiclesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2065'}/api/fleet/vehicles`, {
      headers: { 'x-organization-id': localStorage.getItem('orgId') || '' }
    });

    if (!statsRes.ok || !vehiclesRes.ok) {
      throw new Error('Failed to fetch fleet data');
    }

    const statsData = await statsRes.json();
    const vehiclesData = await vehiclesRes.json();

    return {
      stats: statsData.data || {
        totalVehicles: 0,
        activeVehicles: 0,
        maintenanceCount: 0,
        horsServiceCount: 0,
      },
      vehicles: vehiclesData.data || [],
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error('Fleet data fetch error:', error);
    throw error;
  }
};

export function useFleetData(): UseFleetDataResponse {
  const { data, error, mutate } = useSWR('fleet-data', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // 1 min cache
    focusThrottleInterval: 300000, // 5 min throttle
    errorRetryCount: 2,
    errorRetryInterval: 5000,
  });

  return {
    data,
    isLoading: !error && !data,
    error: error as Error | null,
    mutate,
  };
}
