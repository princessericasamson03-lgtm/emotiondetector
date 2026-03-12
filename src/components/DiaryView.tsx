import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, Quote, RefreshCw, BookOpen, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { getWellbeingAdvice, analyzeDiary } from '../services/motivationService';

export default function DiaryView() {
  const [history, setHistory] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [advices, setAdvices] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      setHistory(data);
      
      if (data.length > 0) {
        const lastEmotion = data[0].emotion;
        const [adviceData, analysisData] = await Promise.all([
          getWellbeingAdvice(lastEmotion),
          analyzeDiary(data.slice(0, 10))
        ]);
        setAdvices(adviceData);
        setAnalysis(analysisData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-slate-800">Diario Emotivo</h3>
          <p className="text-slate-500">Analisi del tuo benessere basata sulle rilevazioni.</p>
        </div>
        <button 
          onClick={fetchData}
          disabled={loading}
          className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-indigo-600 disabled:opacity-50"
        >
          <RefreshCw className={loading ? "animate-spin" : ""} size={20} />
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-16 h-16 bg-indigo-100 rounded-3xl flex items-center justify-center text-indigo-600 animate-bounce">
            <Brain size={32} />
          </div>
          <p className="text-lg font-bold text-slate-600">Analisi delle tue emozioni in corso...</p>
        </div>
      ) : history.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass p-8 rounded-3xl space-y-6"
          >
            <div className="flex items-center gap-3 text-indigo-600">
              <BookOpen size={24} />
              <h4 className="text-xl font-bold">Riassunto Settimanale</h4>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <p className="text-slate-700 leading-relaxed italic">
                "{analysis?.summary || "Analisi in corso..."}"
              </p>
            </div>
            <div className="space-y-4">
              <h5 className="font-bold text-slate-800 flex items-center gap-2">
                <Sparkles size={18} className="text-amber-500" />
                Il nostro Consiglio
              </h5>
              <p className="text-slate-600 text-sm leading-relaxed">
                {analysis?.advice}
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass p-8 rounded-3xl space-y-6"
          >
            <div className="flex items-center gap-3 text-rose-500">
              <Heart size={24} />
              <h4 className="text-xl font-bold">Suggerimenti di Benessere</h4>
            </div>
            <p className="text-slate-500 text-sm">Basati sulla tua ultima emozione rilevata: <span className="font-bold text-slate-800 capitalize">{history[0]?.emotion}</span></p>
            <div className="space-y-4">
              {advices.map((advice, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4 p-4 bg-rose-50/50 rounded-2xl border border-rose-100"
                >
                  <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 shrink-0">
                    <Quote size={14} />
                  </div>
                  <p className="text-rose-900 text-sm font-medium">{advice}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="glass p-12 rounded-3xl text-center space-y-4">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mx-auto">
            <BookOpen size={40} />
          </div>
          <h4 className="text-xl font-bold text-slate-800">Nessun dato per il diario</h4>
          <p className="text-slate-500 max-w-md mx-auto">
            Inizia a usare la webcam o a caricare foto per analizzare il tuo stato emotivo nel tempo.
          </p>
        </div>
      )}
    </div>
  );
}
