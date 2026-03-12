import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, YAxis, Tooltip, CartesianGrid, AreaChart, Area, XAxis } from 'recharts';
import { TrendingUp, Users, Activity, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { EMOTION_COLORS } from '../types';

interface Props {
  privacyMode: boolean;
}

export default function DashboardView({ privacyMode }: Props) {
  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      setHistory(data);
      
      // Calculate stats
      const counts: Record<string, number> = {};
      data.forEach((log: any) => {
        counts[log.emotion] = (counts[log.emotion] || 0) + 1;
      });
      
      const statsData = Object.entries(counts).map(([name, value]) => ({
        name,
        value,
        color: EMOTION_COLORS[name] || '#6366f1'
      }));
      setStats(statsData);
    } catch (err) {
      console.error(err);
    }
  };

  const cards = [
    { title: 'Sessioni Totali', value: history.length, icon: Activity, color: 'indigo' },
    { title: 'Emozione Prevalente', value: stats.sort((a, b) => b.value - a.value)[0]?.name || '-', icon: TrendingUp, color: 'emerald' },
    { title: 'Giorni Attivi', value: new Set(history.map(h => h.timestamp.split('T')[0])).size, icon: Calendar, color: 'amber' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-6 rounded-3xl flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-2xl bg-${card.color}-100 flex items-center justify-center text-${card.color}-600`}>
              <card.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{card.title}</p>
              <p className="text-2xl font-bold text-slate-800">{card.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass p-8 rounded-3xl">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Distribuzione Emozioni</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {stats.map(s => (
              <div key={s.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-sm font-medium text-slate-600 capitalize">{s.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass p-8 rounded-3xl">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Trend Settimanale</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {stats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass p-8 rounded-3xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-800">Timeline Recente</h3>
          <button onClick={fetchHistory} className="text-indigo-600 text-sm font-bold hover:underline">Aggiorna</button>
        </div>
        <div className="space-y-4">
          {history.slice(0, 5).map((log, i) => (
            <div key={log.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-2 h-10 rounded-full" style={{ backgroundColor: EMOTION_COLORS[log.emotion] }} />
              <div className="flex-1">
                <p className="font-bold text-slate-800 capitalize">{log.emotion}</p>
                <p className="text-xs text-slate-400">{new Date(log.timestamp).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-600">{Math.round(log.confidence * 100)}%</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{log.source}</p>
              </div>
            </div>
          ))}
          {history.length === 0 && <p className="text-center text-slate-400 py-8 italic">Nessun dato disponibile. Inizia una sessione webcam!</p>}
        </div>
      </div>
    </div>
  );
}
