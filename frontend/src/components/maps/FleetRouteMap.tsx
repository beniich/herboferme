'use client';

import { complaintsApi, teamsApi } from '@/lib/api';
import {
    DirectionsRenderer,
    GoogleMap,
    InfoWindow,
    Marker,
    useJsApiLoader
} from '@react-google-maps/api';
import { Loader2, MapPin, Truck } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const center = {
  lat: 34.0209,
  lng: -6.8416
};

interface Team {
  _id: string;
  name: string;
  status: string;
  color: string;
  location?: { lat: number; lng: number };
}

interface Complaint {
  _id: string;
  number: string;
  title: string;
  priority: string;
  status: string;
  assignedTeamId?: string;
  latitude?: number;
  longitude?: number;
}

export function FleetRouteMap() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  });

  const [teams, setTeams] = useState<Team[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [directions, setDirections] = useState<google.maps.DirectionsResult[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<({ type: 'team' } & Team) | ({ type: 'complaint' } & Complaint) | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [teamsData, complaintsData] = await Promise.all([
        teamsApi.getAll(),
        complaintsApi.getAll({ status: 'en cours' })
      ]);
      setTeams(teamsData || []);
      setComplaints(complaintsData || []);
    } catch (error) {
      console.error('Error fetching fleet data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); // Update every 15s
    return () => clearInterval(interval);
  }, []);

  const calculateResults = useCallback(() => {
    if (!isLoaded || !teams.length || !complaints.length) return;

    const directionsService = new google.maps.DirectionsService();

    teams.forEach(team => {
      if (team.location && team.status === 'intervention') {
        const teamAssignedComplaints = complaints.filter(c =>
          c.assignedTeamId === team._id && c.latitude && c.longitude
        );

        teamAssignedComplaints.forEach(complaint => {
          directionsService.route(
            {
              origin: team.location!,
              destination: { lat: complaint.latitude!, lng: complaint.longitude! },
              travelMode: google.maps.TravelMode.DRIVING
            },
            (result, status) => {
              if (status === google.maps.DirectionsStatus.OK && result) {
                setDirections(prev => [...prev, result]);
              }
            }
          );
        });
      }
    });
  }, [isLoaded, teams, complaints]);

  useEffect(() => {
    setDirections([]);
    calculateResults();
  }, [teams, complaints, calculateResults]);

  const onLoad = useCallback(function callback() {
    // Map loaded
  }, []);

  const onUnmount = useCallback(function callback() {
    // Map unmounted
  }, []);

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          styles: [
            {
              featureType: "all",
              elementType: "labels.text.fill",
              stylers: [{ color: "#ffffff" }]
            },
            {
              featureType: "all",
              elementType: "labels.text.stroke",
              stylers: [{ visibility: "off" }]
            }
          ],
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true
        }}
      >
        {/* Teams Markers */}
        {teams.map(team => team.location && (
          <Marker
            key={team._id}
            position={team.location}
            onClick={() => setSelectedMarker({ type: 'team', ...team })}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: team.color || '#3b82f6',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2,
              scale: 10
            }}
          />
        ))}

        {/* Complaints Markers */}
        {complaints.map(complaint => complaint.latitude && complaint.longitude && (
          <Marker
            key={complaint._id}
            position={{ lat: complaint.latitude, lng: complaint.longitude }}
            onClick={() => setSelectedMarker({ type: 'complaint', ...complaint })}
            icon={{
              url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
            }}
          />
        ))}

        {/* Routes */}
        {directions.map((direction, idx) => (
          <DirectionsRenderer
            key={idx}
            directions={direction}
            options={{
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: '#3b82f6',
                strokeWeight: 4,
                strokeOpacity: 0.8
              }
            }}
          />
        ))}

        {selectedMarker && (
          <InfoWindow
            position={
              selectedMarker.type === 'team'
                ? (selectedMarker.location as google.maps.LatLngLiteral)
                : { lat: selectedMarker.latitude!, lng: selectedMarker.longitude! }
            }
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div className="p-2 min-w-[200px]">
              {selectedMarker.type === 'team' ? (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-4 h-4 text-blue-500" />
                    <span className="font-bold">{selectedMarker.name}</span>
                  </div>
                  <div className="text-xs space-y-1">
                    <p><span className="text-gray-500">Statut:</span> {selectedMarker.status}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <span className="font-bold">{selectedMarker.number}</span>
                  </div>
                  <div className="text-xs space-y-1">
                    <p className="font-medium">{selectedMarker.title}</p>
                    <p><span className="text-gray-500">Priorit  :</span> {selectedMarker.priority}</p>
                    <p><span className="text-gray-500">Statut:</span> {selectedMarker.status}</p>
                  </div>
                </>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Legend Overlay */}
      <div className="absolute bottom-6 right-6 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 z-10 w-64">
        <h3 className="font-bold text-sm mb-3 uppercase tracking-wider text-slate-500">Flotte & Op  rations</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-xs font-medium">  quipe de maintenance</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-sm" />
            <span className="text-xs font-medium">Intervention en cours</span>
          </div>
          <div className="h-0.5 bg-blue-500/30 rounded-full w-full my-1" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-1 bg-blue-500 rounded-full" />
            <span className="text-xs font-medium italic">Itin  raire optimis  </span>
          </div>
        </div>
      </div>
    </div>
  );
}
