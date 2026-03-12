import React, { useRef, useEffect, useState } from 'react';
import { Camera, RefreshCw, Shield, ShieldOff, Save, LayoutDashboard, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { detectEmotions, loadModels } from '../services/faceService';
import { EMOTION_LABELS, EMOTION_COLORS } from '../types';
import { MOTIVATIONAL_PHRASES, GENERAL_MOTIVATION } from '../constants';

interface Props {
  privacyMode: boolean;
}

export default function WebcamView({ privacyMode }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [detections, setDetections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [motivation, setMotivation] = useState<string>("Inizia l'analisi per ricevere un consiglio.");

  useEffect(() => {
    const init = async () => {
      await loadModels();
      setLoading(false);
      startVideo();
    };
    init();
    return () => stopVideo();
  }, []);

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      console.error("Error accessing webcam:", err);
    }
  };

  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsStreaming(false);
    }
  };

  useEffect(() => {
    let interval: any;
    if (isStreaming && videoRef.current) {
      interval = setInterval(async () => {
        if (videoRef.current) {
          const results = await detectEmotions(videoRef.current);
          
          // Filter results to only include requested emotions
          const filteredResults = results.map(det => ({
            ...det,
            expressions: Object.fromEntries(
              Object.entries(det.expressions).filter(([emotion]) => EMOTION_LABELS[emotion])
            )
          }));

          setDetections(filteredResults);
          drawDetections(filteredResults);
          
          if (filteredResults.length > 0) {
            const top = filteredResults[0].expressions;
            const sorted = Object.entries(top).sort((a: any, b: any) => b[1] - a[1]);
            if (sorted.length > 0) {
              const [emotion, confidence] = sorted[0];
              const italianLabel = EMOTION_LABELS[emotion as string] || emotion;
              
              // Update motivation based on emotion
              if (confidence > 0.5) {
                const phrases = MOTIVATIONAL_PHRASES[italianLabel] || GENERAL_MOTIVATION;
                const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
                setMotivation(randomPhrase);
              }

              if (!privacyMode && confidence > 0.7 && Math.random() > 0.95) {
                 saveLog(emotion as string, confidence as number);
              }
            }
          }
        }
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isStreaming, privacyMode]);

  const drawDetections = (results: any[]) => {
    if (!canvasRef.current || !videoRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    results.forEach(det => {
      const { x, y, width, height } = det.detection.box;
      const expressions = det.expressions;
      const sorted = Object.entries(expressions).sort((a: any, b: any) => b[1] - a[1]);
      
      if (sorted.length === 0) return;

      const [emotion, confidence] = sorted[0];
      const italianLabel = EMOTION_LABELS[emotion as string] || emotion;
      const color = EMOTION_COLORS[italianLabel] || '#fff';

      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, width, height);

      ctx.fillStyle = color;
      ctx.font = 'bold 20px sans-serif';
      const text = `${italianLabel} (${Math.round((confidence as number) * 100)}%)`;
      ctx.fillText(text, x, y > 30 ? y - 10 : y + height + 25);
    });
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
          source: 'webcam'
        })
      });
    } catch (err) {
      console.error("Failed to save log:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Rilevamento Live</h3>
          <p className="text-slate-500">Analisi in tempo reale delle espressioni facciali.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => isStreaming ? stopVideo() : startVideo()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            <RefreshCw className={isStreaming ? "animate-spin" : ""} size={18} />
            {isStreaming ? "Ferma Camera" : "Avvia Camera"}
          </button>
        </div>
      </div>

      <div className="relative aspect-video bg-slate-900 rounded-3xl overflow-hidden shadow-2xl">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-slate-900 z-50">
            <Sparkles className="animate-pulse text-indigo-400 mb-4" size={48} />
            <p className="text-lg font-medium">Caricamento modelli AI...</p>
          </div>
        )}
        
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          playsInline 
          className="w-full h-full object-cover"
        />
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        <div className="absolute bottom-6 left-6 flex gap-4">
          <div className="glass px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium">
            <div className={cn("w-2 h-2 rounded-full", isStreaming ? "bg-emerald-500 animate-pulse" : "bg-red-500")} />
            {isStreaming ? "Live" : "Offline"}
          </div>
          <div className="glass px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium">
            {privacyMode ? <Shield className="text-emerald-600" size={16} /> : <ShieldOff className="text-amber-600" size={16} />}
            {privacyMode ? "Privacy Attiva" : "Salvataggio Attivo"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-3xl">
          <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <LayoutDashboard size={18} className="text-indigo-600" />
            Statistiche Live
          </h4>
          <div className="space-y-4">
            {detections.length > 0 ? (
              detections.map((det, i) => {
                const sorted = Object.entries(det.expressions).sort((a: any, b: any) => b[1] - a[1]);
                return (
                  <div key={i} className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Volto #{i+1}</p>
                    {sorted.slice(0, 3).map(([emotion, confidence]: any) => (
                      <div key={emotion} className="mb-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize">{EMOTION_LABELS[emotion] || emotion}</span>
                          <span className="font-bold">{Math.round(confidence * 100)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${confidence * 100}%` }}
                            className="h-full bg-indigo-600"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })
            ) : (
              <p className="text-slate-400 text-sm italic">Nessun volto rilevato...</p>
            )}
          </div>
        </div>

        <div className="md:col-span-2 glass p-6 rounded-3xl">
          <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-amber-500" />
            Frase Motivazionale
          </h4>
          <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl min-h-[100px] flex items-center">
             <motion.p 
               key={motivation}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="text-indigo-900 text-lg font-medium leading-relaxed italic"
             >
               "{motivation}"
             </motion.p>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
