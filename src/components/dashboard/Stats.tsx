import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../../lib/errorHandlers';
import { ScanResult } from '../../types';
import { motion } from 'motion/react';
import { Calendar, Shield, MapPin, ChevronRight, Activity, Trash2 } from 'lucide-react';

export default function Stats({ user }: { user: any }) {
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'scans'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const scansData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ScanResult[];
      setScans(scansData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'scans');
    });

    return () => unsubscribe();
  }, [user.uid]);

  return (
    <div className="space-y-8 pb-10">
      <header>
        <h2 className="text-3xl font-bold text-slate-900">Vos Statistiques</h2>
        <p className="text-slate-500">Historique complet de vos analyses et santé de vos parcelles</p>
      </header>

      <div className="grid md:grid-cols-3 gap-6">
        <StatsCard title="Total Scans" value={scans.length.toString()} icon={<Activity className="text-blue-500" />} />
        <StatsCard 
          title="Sains vs Malades" 
          value={`${scans.filter(s => s.diseaseName.toLowerCase().includes('healthy')).length} / ${scans.filter(s => !s.diseaseName.toLowerCase().includes('healthy')).length}`} 
          icon={<Shield className="text-green-500" />} 
        />
        <StatsCard title="Alertes Partagées" value={Math.floor(scans.length * 0.8).toString()} icon={<Activity className="text-amber-500" />} />
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xl font-bold">Historique Récent</h3>
          <button className="text-sm font-semibold text-brand-primary hover:underline">Tout voir</button>
        </div>
        
        {loading ? (
          <div className="p-20 flex justify-center"><Activity className="animate-spin text-slate-200" size={32} /></div>
        ) : scans.length === 0 ? (
          <div className="p-20 text-center space-y-4">
            <div className="inline-flex p-4 bg-slate-50 rounded-full text-slate-300">
              <Calendar size={48} />
            </div>
            <p className="text-slate-500 font-medium">Aucun scan enregistré pour le moment.</p>
            <button className="btn-primary mx-auto">Lancer votre premier scan</button>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {scans.map((scan) => (
              <motion.div 
                key={scan.id}
                whileHover={{ backgroundColor: 'rgba(248, 250, 252, 1)' }}
                className="p-6 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                    <img src={scan.imageUrl} alt="Scan preview" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">{scan.diseaseName}</h4>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Calendar size={14} />
                        {scan.createdAt && (scan.createdAt as any).toDate ? (scan.createdAt as any).toDate().toLocaleDateString() : 'N/A'}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Shield className={scan.diseaseName.toLowerCase().includes('healthy') ? 'text-green-500' : 'text-amber-500'} size={14} />
                        Confiance: {Math.round(scan.confidence * 100)}%
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={20} />
                  </button>
                  <ChevronRight className="text-slate-300 group-hover:text-brand-primary transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className="p-2 bg-slate-50 rounded-xl">{icon}</div>
      </div>
      <div className="text-4xl font-bold text-slate-900">{value}</div>
      <div className="flex items-center gap-2 text-xs font-medium text-green-600">
        <Activity size={12} />
        <span>+12% vs mois dernier</span>
      </div>
    </div>
  );
}
