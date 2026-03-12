import React, { useState, useEffect, useRef } from 'react';
import { Camera, Upload, LayoutDashboard, History, BookOpen, Settings, LogOut, Shield, Info, Download, Trash2, Sparkles, ChevronRight, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Components
import WebcamView from './components/WebcamView';
import UploadView from './components/UploadView';
import DashboardView from './components/DashboardView';
import HistoryView from './components/HistoryView';
import DiaryView from './components/DiaryView';
import TutorialView from './components/TutorialView';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(false);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'webcam', label: 'Webcam Live', icon: Camera },
    { id: 'upload', label: 'Carica Foto', icon: Upload },
    { id: 'history', label: 'Storico', icon: History },
    { id: 'diary', label: 'Diario Emotivo', icon: BookOpen },
    { id: 'tutorial', label: 'Guida', icon: Info },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        className="glass border-r border-slate-200 z-50 flex flex-col"
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          {isSidebarOpen && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-xl tracking-tight text-slate-800"
            >
              EmoSense
            </motion.span>
          )}
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                activeTab === tab.id 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" 
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <tab.icon className={cn("w-5 h-5", activeTab === tab.id ? "text-white" : "text-slate-400 group-hover:text-slate-600")} />
              {isSidebarOpen && <span className="font-medium">{tab.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={() => setPrivacyMode(!privacyMode)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
              privacyMode ? "bg-emerald-50 text-emerald-700" : "text-slate-500 hover:bg-slate-100"
            )}
          >
            <Shield className={cn("w-5 h-5", privacyMode ? "text-emerald-600" : "text-slate-400")} />
            {isSidebarOpen && (
              <div className="flex flex-col items-start text-xs">
                <span className="font-semibold">Privacy Mode</span>
                <span>{privacyMode ? "Attiva" : "Disattiva"}</span>
              </div>
            )}
          </button>
          
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="mt-2 w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            {isSidebarOpen && <span className="text-sm font-medium">Riduci Sidebar</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto">
        <header className="sticky top-0 z-40 glass border-b border-slate-100 px-8 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800 capitalize">
            {tabs.find(t => t.id === activeTab)?.label}
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                  <img src={`https://picsum.photos/seed/${i+10}/32/32`} alt="user" />
                </div>
              ))}
            </div>
            <div className="h-8 w-[1px] bg-slate-200" />
            <button className="text-slate-400 hover:text-indigo-600 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'dashboard' && <DashboardView privacyMode={privacyMode} />}
              {activeTab === 'webcam' && <WebcamView privacyMode={privacyMode} />}
              {activeTab === 'upload' && <UploadView privacyMode={privacyMode} />}
              {activeTab === 'history' && <HistoryView />}
              {activeTab === 'diary' && <DiaryView />}
              {activeTab === 'tutorial' && <TutorialView />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
