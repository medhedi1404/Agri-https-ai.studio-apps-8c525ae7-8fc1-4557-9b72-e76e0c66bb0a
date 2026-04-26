import { motion } from 'motion/react';
import { ChevronLeft, Share2, Clipboard, ShieldCheck, AlertCircle, Info, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function ResultCard({ result, onReset }: { result: any, onReset: () => void }) {
  const isHealthy = result.diseaseName?.toLowerCase().includes('healthy') || result.diseaseName?.toLowerCase().includes('santé');
  const confidencePercent = Math.round(result.confidence * 100);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      <div className="flex items-center justify-between">
        <button onClick={onReset} className="btn-secondary h-10 px-4 py-0 text-sm">
          <ChevronLeft size={18} />
          Nouveau Scan
        </button>
        <button className="p-2 text-slate-400 hover:text-brand-primary transition-colors">
          <Share2 size={20} />
        </button>
      </div>

      <div className="glass-panel overflow-hidden">
        {/* Confidence Header */}
        <div className={cn(
          "p-6 flex items-center justify-between",
          isHealthy ? "bg-green-600 text-white" : result.riskLevel === 'High' ? "bg-red-600 text-white" : "bg-amber-500 text-white"
        )}>
          <div className="flex items-center gap-3">
            {isHealthy ? <ShieldCheck size={32} /> : <AlertCircle size={32} />}
            <div>
              <h2 className="text-2xl font-bold">{result.diseaseName}</h2>
              <p className="text-white/80 text-sm font-medium">Confidence: {confidencePercent}%</p>
            </div>
          </div>
          <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm shadow-inner font-bold">
            {result.riskLevel || 'N/A'}
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Analysis Details */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Info className="text-brand-primary" size={20} />
              Détails du Diagnostic
            </h3>
            <p className="text-slate-600 leading-relaxed italic">
              "{result.details}"
            </p>
          </section>

          {/* Treatment */}
          {!isHealthy && (
            <section className="p-6 bg-green-50 rounded-2xl border border-green-100 space-y-3">
              <h3 className="text-lg font-bold text-green-900 flex items-center gap-2">
                <Sparkles className="text-brand-primary" size={20} />
                Traitement Recommandé
              </h3>
              <p className="text-green-800 font-medium">
                {result.treatment}
              </p>
              <div className="pt-4 flex gap-4">
                <button className="text-xs font-bold uppercase tracking-wider text-brand-primary flex items-center gap-1 hover:underline">
                  <Clipboard size={14} /> Acheter produits bio
                </button>
                <button className="text-xs font-bold uppercase tracking-wider text-brand-primary flex items-center gap-1 hover:underline">
                  Consulter un expert
                </button>
              </div>
            </section>
          )}

          {isHealthy && (
            <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
              <p className="text-blue-800 font-medium">
                Vos cultures semblent en excellente santé ! Continuez vos pratiques actuelles et scannez régulièrement pour la prévention.
              </p>
            </div>
          )}

          {/* Community Sync */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <Share2 size={20} className="text-slate-400" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-900">Anonymisé et partagé</p>
                <p className="text-slate-500">Mise à jour de la carte des risques</p>
              </div>
            </div>
            <div className="text-xs font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">
              EN LIGNE
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
