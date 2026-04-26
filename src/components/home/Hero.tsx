import React from 'react';
import { motion } from 'motion/react';
import { Camera, Map, MessageSquare, TrendingUp, AlertTriangle } from 'lucide-react';
import { User } from 'firebase/auth';

export default function Hero({ user, setTab }: { user: User, setTab: (t: any) => void }) {
  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-sm font-semibold text-brand-primary uppercase tracking-wider">Bon retour, {user.displayName?.split(' ')[0]} 👋</h2>
        <h1 className="text-3xl font-bold text-slate-900 mt-1">Comment vont vos cultures aujourd'hui ?</h1>
      </header>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Scans" value="12" icon={<Camera className="text-blue-500" />} />
        <StatCard title="Santé Moy." value="92%" icon={<TrendingUp className="text-green-500" />} />
        <StatCard title="Alertes Locales" value="2" icon={<AlertTriangle className="text-amber-500" />} />
        <StatCard title="Communauté" value="150+" icon={<Map className="text-purple-500" />} />
      </div>

      {/* Main Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <ActionCard 
          title="Diagnostic Immédiat" 
          description="Prenez une photo d'une feuille ou d'un fruit pour identifier les maladies en quelques secondes."
          icon={<Camera size={32} />}
          color="bg-green-600"
          onClick={() => setTab('scan')}
        />
        <ActionCard 
          title="Carte des Risques" 
          description="Visualisez les foyers de maladies détectés par les agriculteurs de votre région."
          icon={<Map size={32} />}
          color="bg-amber-600"
          onClick={() => setTab('map')}
        />
      </div>

      {/* Recent Alerts / News */}
      <div className="glass-panel p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <AlertTriangle className="text-amber-500" size={20} />
          Alertes de votre région (Mahdia)
        </h3>
        <div className="space-y-4">
          <AlertItem 
            title="Mildiou détecté à proximité" 
            time="Il y a 2 heures" 
            distance="4 km" 
            severity="Medium"
          />
          <AlertItem 
            title="Sècheresse accentuée - Risque de stress" 
            time="Il y a 5 heures" 
            distance="Toute la zone" 
            severity="Low"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
      <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
      <div>
        <div className="text-xs text-slate-500 font-medium">{title}</div>
        <div className="text-xl font-bold text-slate-900">{value}</div>
      </div>
    </div>
  );
}

function ActionCard({ title, description, icon, color, onClick }: any) {
  return (
    <motion.button 
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`${color} p-8 rounded-3xl text-left text-white shadow-xl flex flex-col justify-between h-64 relative overflow-hidden group`}
    >
      <div className="flex justify-between items-start">
        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
          {icon}
        </div>
        <TrendingUp className="text-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div>
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-white/80 text-sm">{description}</p>
      </div>
      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
    </motion.button>
  );
}

function AlertItem({ title, time, distance, severity }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
      <div className="flex items-center gap-4">
        <div className={`w-2 h-2 rounded-full ${severity === 'High' ? 'bg-red-500' : severity === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'}`} />
        <div>
          <div className="font-semibold text-sm">{title}</div>
          <div className="text-xs text-slate-500">{time} • {distance}</div>
        </div>
      </div>
      <button className="text-xs font-bold text-brand-primary hover:underline">Voir détails</button>
    </div>
  );
}
