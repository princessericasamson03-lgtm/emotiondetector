import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { detectEmotions, loadModels } from '../services/faceService';
import { EMOTION_LABELS, EMOTION_COLORS } from '../types';

interface Props {
  privacyMode: boolean;
}

export default function UploadView({ privacyMode }: Props) {
  const [image, setImage] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setResults([]);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;
    setLoading(true);
    try {
      await loadModels();
      const img = new Image();
      img.src = image;
      await img.decode();
      
      const detections = await detectEmotions(img);
      
      // Filter results to only include requested emotions
      const filteredResults = detections.map(det => ({
        ...det,
        expressions: Object.fromEntries(
          Object.entries(det.expressions).filter(([emotion]) => EMOTION_LABELS[emotion])
        )
      }));

      setResults(filteredResults);
      
      if (filteredResults.length === 0) {
        setError("Nessun volto rilevato nell'immagine.");
      } else if (!privacyMode) {
        // Save the most prominent emotion of the first face
        const top = filteredResults[0].expressions;
        const sorted = Object.entries(top).sort((a: any, b: any) => b[1] - a[1]);
        if (sorted.length > 0) {
          const [emotion, confidence] = sorted[0];
          await saveLog(emotion as string, confidence as number);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Errore durante l'analisi dell'immagine.");
    } finally {
      setLoading(false);
    }
  };

  const saveLog = async (emotion: string, confidence: number) => {
    const italianLabel = EMOTION_LABELS[emotion] || emotion;
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emotion: italianLabel,
          confidence,
          source: 'upload'
        })
      });
    } catch (err) {
      console.error("Failed to save log:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-slate-800">Analisi Foto</h3>
        <p className="text-slate-500">Carica un'immagine per rilevare le emozioni dei volti presenti.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square glass border-2 border-dashed border-slate-300 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all overflow-hidden group"
          >
            {image ? (
              <img src={image} alt="Upload" className="w-full h-full object-cover" />
            ) : (
              <>
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-100 transition-all mb-4">
                  <Upload size={32} />
                </div>
                <p className="font-bold text-slate-600">Clicca per caricare</p>
                <p className="text-sm text-slate-400">PNG, JPG fino a 10MB</p>
              </>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*" 
            />
          </div>

          <div className="flex gap-4">
            <button
              disabled={!image || loading}
              onClick={analyzeImage}
              className="flex-1 bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Sparkles className="animate-spin" size={20} /> : <Sparkles size={20} />}
              {loading ? "Analisi in corso..." : "Analizza Foto"}
            </button>
            <button
              onClick={() => { setImage(null); setResults([]); setError(null); }}
              className="px-6 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass p-8 rounded-3xl h-full min-h-[400px]">
            <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <CheckCircle2 size={20} className="text-emerald-500" />
              Risultati Analisi
            </h4>

            {error && (
              <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-700 mb-6">
                <AlertCircle size={20} />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              {results.length > 0 ? (
                results.map((det, i) => {
                  const sorted = Object.entries(det.expressions).sort((a: any, b: any) => b[1] - a[1]);
                  return (
                    <div key={i} className="space-y-4">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Volto #{i+1}</p>
                      {sorted.slice(0, 5).map(([emotion, confidence]: any) => {
                        const label = EMOTION_LABELS[emotion] || emotion;
                        const color = EMOTION_COLORS[label] || '#6366f1';
                        return (
                          <div key={emotion}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-medium text-slate-700 capitalize">{label}</span>
                              <span className="font-bold text-slate-900">{Math.round(confidence * 100)}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${confidence * 100}%` }}
                                className="h-full"
                                style={{ backgroundColor: color }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })
              ) : !loading && !error && (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-4">
                  <ImageIcon size={48} strokeWidth={1} />
                  <p className="text-sm italic">Carica e analizza una foto per vedere i risultati</p>
                </div>
              )}
              
              {loading && (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                  <p className="text-sm font-medium text-slate-500">L'AI sta leggendo i volti...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
