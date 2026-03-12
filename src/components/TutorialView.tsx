import React from 'react';
import { Camera, Upload, LayoutDashboard, History, BookOpen, Sparkles, CheckCircle2, Shield } from 'lucide-react';
import { motion } from 'motion/react';

export default function TutorialView() {
  const steps = [
    {
      title: "Rilevamento Webcam",
      desc: "Avvia la camera per analizzare le tue emozioni in tempo reale. L'AI identificherà il tuo volto e mostrerà le percentuali di felicità, rabbia, tristezza, disgusto e paura.",
      icon: Camera,
      color: "indigo"
    },
    {
      title: "Caricamento Foto",
      desc: "Puoi caricare immagini statiche per un'analisi dettagliata. Utile per foto di gruppo o selfie salvati.",
      icon: Upload,
      color: "emerald"
    },
    {
      title: "Dashboard & Grafici",
      desc: "Visualizza i dati aggregati. Scopri qual è la tua emozione prevalente e come cambia nel tempo attraverso grafici interattivi.",
      icon: LayoutDashboard,
      color: "amber"
    },
    {
      title: "Diario Emotivo",
      desc: "Il sistema analizzerà il tuo storico per fornirti frasi motivazionali personalizzate e un riassunto del tuo benessere.",
      icon: BookOpen,
      color: "rose"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h3 className="text-3xl font-bold text-slate-800">Benvenuto su EmoSense AI</h3>
        <p className="text-slate-500 max-w-2xl mx-auto">
          La tua piattaforma avanzata per il monitoraggio del benessere emotivo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {steps.map((step, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-8 rounded-3xl space-y-4 hover:shadow-2xl transition-all border-b-4"
            style={{ borderBottomColor: `var(--color-${step.color}-500)` }}
          >
            <div className={`w-14 h-14 rounded-2xl bg-${step.color}-100 flex items-center justify-center text-${step.color}-600`}>
              <step.icon size={28} />
            </div>
            <h4 className="text-xl font-bold text-slate-800">{step.title}</h4>
            <p className="text-slate-600 text-sm leading-relaxed">
              {step.desc}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="glass p-8 rounded-3xl bg-indigo-600 text-white overflow-hidden relative">
        <div className="relative z-10 space-y-4">
          <h4 className="text-2xl font-bold flex items-center gap-2">
            <Shield size={24} />
            La tua Privacy è Priorità
          </h4>
          <p className="text-indigo-100 max-w-xl">
            Puoi attivare la <strong>Privacy Mode</strong> in qualsiasi momento dalla sidebar. 
            In questa modalità, nessun dato verrà salvato nel database e l'analisi avverrà esclusivamente in locale sul tuo browser.
          </p>
          <div className="flex items-center gap-2 text-sm font-bold bg-white/10 w-fit px-4 py-2 rounded-full">
            <CheckCircle2 size={16} />
            Nessuna immagine viene mai inviata ai nostri server.
          </div>
        </div>
        <Sparkles className="absolute -right-8 -bottom-8 text-white/10 w-64 h-64 rotate-12" />
      </div>

      <div className="text-center py-8">
        <p className="text-slate-400 text-sm">
          EmoSense AI utilizza modelli di Deep Learning (TensorFlow.js) per il riconoscimento facciale.
        </p>
      </div>
    </div>
  );
}
