import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, RefreshCw, ChevronLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzePlant } from '../../services/geminiService';
import { db, auth } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../../lib/errorHandlers';
import ResultCard from './ResultCard';

export default function DiagnosticCamera({ user }: { user: any }) {
  const [mode, setMode] = useState<'selection' | 'result'>('selection');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcessImage = async (file: File) => {
    setAnalyzing(true);
    setError(null);
    try {
      // Get location if possible
      let location = null;
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      } catch (locErr) {
        console.warn("Could not get location", locErr);
      }

      const buffer = await file.arrayBuffer();
      const aiResult = await analyzePlant(buffer, file.type);
      
      // Save to Firebase
      const scanData = {
        userId: user.uid,
        diseaseName: aiResult.diseaseName,
        confidence: aiResult.confidence,
        treatment: aiResult.treatment,
        details: aiResult.details,
        riskLevel: aiResult.riskLevel,
        createdAt: serverTimestamp(),
        location: location,
        imageUrl: URL.createObjectURL(file), // Still temporary but works for the session
      };

      try {
        await addDoc(collection(db, 'scans'), scanData);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'scans');
      }

      // If it's a disease (not healthy), add to community alerts
      const isHealthy = aiResult.diseaseName?.toLowerCase().includes('healthy') || aiResult.diseaseName?.toLowerCase().includes('santé');
      if (!isHealthy && location) {
        try {
          await addDoc(collection(db, 'communityAlerts'), {
            diseaseName: aiResult.diseaseName,
            location: location,
            intensity: aiResult.riskLevel === 'High' ? 9 : aiResult.riskLevel === 'Medium' ? 6 : 3,
            updatedAt: serverTimestamp(),
            userId: user.uid, // For rule validation
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, 'communityAlerts');
        }
      }
      
      setResult(aiResult);
      setMode('result');
    } catch (err) {
      console.error(err);
      setError("Désolé, nous n'avons pas pu analyser l'image. Veuillez réessayer avec une photo plus claire.");
    } finally {
      setAnalyzing(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleProcessImage(file);
  };

  if (mode === 'result' && result) {
    return <ResultCard result={result} onReset={() => setMode('selection')} />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-slate-900">Diagnostic IA</h2>
        <p className="text-slate-500">Capturez une photo nette pour une analyse précise</p>
      </div>

      <div className="glass-panel aspect-square md:aspect-video flex flex-col items-center justify-center p-8 border-dashed border-2 border-slate-200 relative overflow-hidden">
        {analyzing ? (
          <div className="space-y-4 text-center">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block"
            >
              <RefreshCw size={48} className="text-brand-primary" />
            </motion.div>
            <p className="text-lg font-medium animate-pulse">L'IA analyse votre plante...</p>
            <p className="text-sm text-slate-400">Identification des symptômes et recherche de traitements</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="group flex flex-col items-center justify-center p-8 bg-green-50 rounded-3xl border border-green-100 hover:bg-green-100 transition-all gap-4"
            >
              <div className="p-4 bg-white rounded-2xl shadow-sm text-brand-primary group-hover:scale-110 transition-transform">
                <Camera size={32} />
              </div>
              <span className="font-bold text-green-900 text-lg">Appareil Photo</span>
            </button>

            <button 
              onClick={() => fileInputRef.current?.click()}
              className="group flex flex-col items-center justify-center p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-slate-100 transition-all gap-4"
            >
              <div className="p-4 bg-white rounded-2xl shadow-sm text-slate-600 group-hover:scale-110 transition-transform">
                <Upload size={32} />
              </div>
              <span className="font-bold text-slate-900 text-lg">Importer</span>
            </button>
          </div>
        )}

        {/* Scan lines decoration */}
        {analyzing && (
          <motion.div 
            initial={{ top: 0 }}
            animate={{ top: '100%' }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-primary/50 to-transparent shadow-[0_0_15px_rgba(21,128,61,0.5)] z-10"
          />
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700"
          >
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        <h4 className="font-bold text-slate-900 flex items-center gap-2">
          <CheckCircle2 size={18} className="text-brand-primary" />
          Conseils pour un bon diagnostic
        </h4>
        <ul className="text-sm text-slate-600 grid grid-cols-1 md:grid-cols-2 gap-3">
          <li className="flex items-center gap-2">• Évitez les ombres portées</li>
          <li className="flex items-center gap-2">• Focalisez sur les taches</li>
          <li className="flex items-center gap-2">• Prenez la photo à la lumière du jour</li>
          <li className="flex items-center gap-2">• Une seule feuille par photo</li>
        </ul>
      </div>

      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        ref={fileInputRef} 
        onChange={onFileChange} 
        className="hidden" 
      />
    </div>
  );
}
