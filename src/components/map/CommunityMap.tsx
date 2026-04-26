import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Leaf, Info, AlertTriangle, Filter } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../../lib/errorHandlers';
import { CommunityAlert } from '../../types';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with React
const customIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2913/2913520.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

export default function CommunityMap() {
  const [alerts, setAlerts] = useState<CommunityAlert[]>([]);
  const center: [number, number] = [35.5024, 11.0457]; // Center of Mahdia, Tunisia

  useEffect(() => {
    const q = query(collection(db, 'communityAlerts'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const alertsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CommunityAlert[];
      setAlerts(alertsData);
      
      // If no alerts, add some mock ones for visualization
      if (alertsData.length === 0) {
        setAlerts([
          {
            id: 'mock1',
            diseaseName: 'Mildiou',
            location: { lat: 35.5024, lng: 11.0457 },
            intensity: 8,
            updatedAt: new Date().toISOString()
          },
          {
            id: 'mock2',
            diseaseName: 'Oïdium',
            location: { lat: 35.45, lng: 11.02 },
            intensity: 4,
            updatedAt: new Date().toISOString()
          },
          {
            id: 'mock3',
            diseaseName: 'Carence en Azote',
            location: { lat: 35.52, lng: 11.08 },
            intensity: 6,
            updatedAt: new Date().toISOString()
          }
        ]);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'communityAlerts');
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="h-[calc(100vh-200px)] md:h-[calc(100vh-100px)] flex flex-col gap-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Carte des Risques</h2>
          <p className="text-slate-500">Visualisation collaborative des foyers infectieux en temps réel</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary h-10 px-4 text-sm gap-2">
            <Filter size={16} /> Filter
          </button>
          <div className="bg-white border p-1 rounded-xl flex shadow-sm">
            <button className="px-3 py-1 bg-brand-primary text-white text-xs font-bold rounded-lg">Alertes</button>
            <button className="px-3 py-1 text-slate-500 text-xs font-bold">Climat</button>
          </div>
        </div>
      </div>

      <div className="flex-1 glass-panel overflow-hidden relative border-none">
        <MapContainer center={center} zoom={11} scrollWheelZoom={true}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {alerts.map((alert) => (
            <div key={alert.id}>
              <Marker 
                position={[alert.location.lat, alert.location.lng]} 
                icon={customIcon}
              >
                <Popup className="custom-popup">
                  <div className="p-2 space-y-2">
                    <h4 className="font-bold text-brand-primary text-lg">{alert.diseaseName}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <AlertTriangle size={14} className={alert.intensity > 7 ? 'text-red-500' : 'text-amber-500'} />
                      <span>Intensité de risque: {alert.intensity}/10</span>
                    </div>
                    <p className="text-xs text-slate-600">Dernière détection: {alert.updatedAt && (alert.updatedAt as any).toDate ? (alert.updatedAt as any).toDate().toLocaleDateString() : 'N/A'}</p>
                    <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-1 rounded-md text-xs font-bold transition-colors">
                      Détails du foyer
                    </button>
                  </div>
                </Popup>
              </Marker>
              <Circle 
                center={[alert.location.lat, alert.location.lng]}
                pathOptions={{ 
                  fillColor: alert.intensity > 7 ? 'red' : 'orange', 
                  color: 'transparent',
                  fillOpacity: 0.2
                }}
                radius={2000}
              />
            </div>
          ))}
        </MapContainer>

        {/* Legend Overlay */}
        <div className="absolute bottom-6 left-6 z-[1000] glass-panel p-4 max-w-xs space-y-3">
          <h4 className="font-bold text-sm">Légende</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500/20 border border-red-500 rounded-full" />
              <span className="text-xs text-slate-600">Risque Élevé (Foyer Actif)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-amber-500/20 border border-amber-500 rounded-full" />
              <span className="text-xs text-slate-600">Risque Modéré</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500/20 border border-blue-500 rounded-full" />
              <span className="text-xs text-slate-600">Observation communautaire</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 border-t pt-2 italic">
            Données basées sur les scans anonymes des utilisateurs de la région.
          </p>
        </div>
      </div>
    </div>
  );
}
