import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  Map as MapIcon, 
  MessageSquare, 
  LayoutDashboard, 
  Settings,
  Leaf,
  LogOut,
  User as UserIcon,
  ShieldCheck
} from 'lucide-react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { googleProvider } from './lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './lib/errorHandlers';

// Components
import Hero from './components/home/Hero';
import DiagnosticCamera from './components/diagnostic/DiagnosticCamera';
import CommunityMap from './components/map/CommunityMap';
import AgriBot from './components/chat/AgriBot';
import Stats from './components/dashboard/Stats';
import { cn } from './lib/utils';

type Tab = 'home' | 'scan' | 'map' | 'chat' | 'stats';

export default function App() {
  const [user, setUser] = useState(auth.currentUser);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Sync user to firestore
        const userRef = doc(db, 'users', user.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              userId: user.uid,
              name: user.displayName || 'Farmer',
              email: user.email || '',
              createdAt: serverTimestamp(),
            });
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = () => signOut(auth);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Leaf className="w-12 h-12 text-brand-primary" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-brand-bg">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-8"
        >
          <div className="space-y-4">
            <div className="inline-flex p-4 bg-green-100 rounded-3xl animate-bounce">
              <Leaf className="w-10 h-10 text-brand-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Agri-Vision <span className="text-brand-primary">Diagnostics</span>
            </h1>
            <p className="text-slate-600 text-lg">
              La santé de vos cultures au creux de votre main. Diagnostic IA, cartes communautaires et conseils d'experts.
            </p>
          </div>

          <button 
            onClick={handleLogin}
            className="w-full btn-primary py-4 text-lg shadow-xl shadow-green-100"
          >
            <ShieldCheck className="w-5 h-5" />
            Commencer avec Google
          </button>
          
          <p className="text-xs text-slate-400">
            En continuant, vous rejoignez une communauté d'agriculteurs engagés pour une agriculture intelligente.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col pb-20 md:pb-0 md:pl-20">
      {/* Mobile Header / Sidebar */}
      <header className="md:hidden p-4 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Leaf className="w-6 h-6 text-brand-primary" />
          <span className="font-bold text-xl">Agri-Vision</span>
        </div>
        <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-brand-primary/20">
          <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} alt="User" />
        </div>
      </header>

      {/* Desktop Sidebar Navigation */}
      <nav className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-20 bg-white border-r border-slate-200 items-center py-8 justify-between z-50">
        <div className="space-y-8 flex flex-col items-center">
          <Leaf className="w-8 h-8 text-brand-primary mb-4" />
          <NavIcon icon={<LayoutDashboard />} active={activeTab === 'home'} onClick={() => setActiveTab('home')} label="Tableau de bord" />
          <NavIcon icon={<Camera />} active={activeTab === 'scan'} onClick={() => setActiveTab('scan')} label="Scanner" />
          <NavIcon icon={<MapIcon />} active={activeTab === 'map'} onClick={() => setActiveTab('map')} label="Communauté" />
          <NavIcon icon={<MessageSquare />} active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} label="Conseiller AI" />
          <NavIcon icon={<Settings />} active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} label="Statistiques" />
        </div>
        <button onClick={handleLogout} className="p-3 text-slate-400 hover:text-red-500 transition-colors">
          <LogOut size={24} />
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="p-4 md:p-8 max-w-6xl mx-auto w-full"
          >
            {activeTab === 'home' && <Hero user={user} setTab={setActiveTab} />}
            {activeTab === 'scan' && <DiagnosticCamera user={user} />}
            {activeTab === 'map' && <CommunityMap />}
            {activeTab === 'chat' && <AgriBot />}
            {activeTab === 'stats' && <Stats user={user} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-slate-200 flex items-center justify-around px-2 z-50">
        <NavIcon icon={<LayoutDashboard />} active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
        <NavIcon icon={<MapIcon />} active={activeTab === 'map'} onClick={() => setActiveTab('map')} />
        <NavIcon icon={<Camera />} active={activeTab === 'scan'} onClick={() => setActiveTab('scan')} />
        <NavIcon icon={<MessageSquare />} active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} />
        <NavIcon icon={<Settings />} active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} />
      </nav>
    </div>
  );
}

function NavIcon({ icon, active, onClick, label }: { icon: React.ReactNode, active: boolean, onClick: () => void, label?: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "relative p-3 rounded-2xl transition-all duration-300 group",
        active ? "bg-green-50 text-brand-primary" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
      )}
    >
      {icon}
      {label && (
        <span className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {label}
        </span>
      )}
      {active && (
        <motion.div 
          layoutId="nav-indicator"
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-primary rounded-full md:left-0 md:top-1/2 md:-translate-y-1/2 md:translate-x-[-10px] md:w-1 md:h-6"
        />
      )}
    </button>
  );
}
