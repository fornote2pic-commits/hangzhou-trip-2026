/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Wallet, 
  Home as HomeIcon, 
  MapPin, 
  Clock, 
  CloudRain, 
  Sun, 
  ChevronRight, 
  Plus,
  TrendingUp,
  Map as MapIcon,
  Cloud,
  Navigation,
  ExternalLink,
  Info,
  PieChart as PieChartIcon,
  DollarSign,
  Utensils,
  Car,
  Hotel,
  Camera,
  X,
  ArrowRight
} from 'lucide-react';
import { format, differenceInSeconds } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { 
  onSnapshot, 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy,
  getDocFromServer,
  updateDoc,
  setDoc
} from 'firebase/firestore';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User
} from 'firebase/auth';
import { db, auth } from './firebase';
import { HANGZHOU_ITINERARY, MOCK_EXPENSES, EXCHANGE_RATE, RETURN_DATE } from './constants';
import { ScheduleItem, DailyItinerary, Expense } from './types';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type TabType = 'schedule' | 'weather' | 'map' | 'expense' | 'live' | 'guide';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

const TRIP_ID = 'hangzhou-2026';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('schedule');
  const [itinerary, setItinerary] = useState<DailyItinerary[]>(HANGZHOU_ITINERARY);
  const [bannerImage, setBannerImage] = useState('https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?q=80&w=1200');
  const [selectedDate, setSelectedDate] = useState(HANGZHOU_ITINERARY[0].date);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0 });
  const [cnyInput, setCnyInput] = useState('');
  const [liveSig, setLiveSig] = useState(Date.now());
  const [realWeather, setRealWeather] = useState<{ temp: string; condition: string } | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isItineraryModalOpen, setIsItineraryModalOpen] = useState(false);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingItineraryItem, setEditingItineraryItem] = useState<{ dayDate: string, item: ScheduleItem } | null>(null);
  const [selectedScheduleItem, setSelectedScheduleItem] = useState<ScheduleItem | null>(null);
  const [selectedWeatherDay, setSelectedWeatherDay] = useState<DailyItinerary | null>(null);
  const [newExpense, setNewExpense] = useState({ title: '', amount: '', category: '其他' });
  const [user, setUser] = useState<User | null>(null);
  const [currentExchangeRate, setCurrentExchangeRate] = useState(EXCHANGE_RATE);

  useEffect(() => {
    const fetchTripData = async () => {
      try {
        const tripDoc = await getDocFromServer(doc(db, 'trips', TRIP_ID));
        if (tripDoc.exists()) {
          const data = tripDoc.data();
          if (data.itinerary) setItinerary(data.itinerary);
          if (data.bannerImage) setBannerImage(data.bannerImage);
        }
      } catch (err) { console.error(err); }
    };
    fetchTripData();
  }, []);

  const saveItineraryToFirestore = async (newItinerary: DailyItinerary[]) => {
    try { await setDoc(doc(db, 'trips', TRIP_ID), { itinerary: newItinerary }, { merge: true }); } catch (err) { console.error(err); }
  };

  const saveBannerToFirestore = async (newBanner: string) => {
    try { await setDoc(doc(db, 'trips', TRIP_ID), { bannerImage: newBanner }, { merge: true }); } catch (err) { console.error(err); }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const path = `trips/${TRIP_ID}/expenses`;
    const q = query(collection(db, path), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedExpenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Expense[];
      setExpenses(fetchedExpenses);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const getWeather = async () => {
      try {
        const res = await fetch('https://wttr.in/Hangzhou?format=j1');
        const data = await res.json();
        if (data?.current_condition?.[0]) {
          const current = data.current_condition[0];
          setRealWeather({
            temp: `${current.temp_C}°C`,
            condition: current.lang_zh?.[0]?.value || current.weatherDesc?.[0]?.value || '未知'
          });
        }
      } catch (err) { console.error(err); }
    };
    getWeather();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = differenceInSeconds(new Date(RETURN_DATE), new Date());
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0 }); return; }
      setTimeLeft({ days: Math.floor(diff / 86400), hours: Math.floor((diff % 86400) / 3600) });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalCNY = expenses.reduce((acc, curr) => acc + curr.amountCNY, 0);
  const totalTWD = totalCNY * currentExchangeRate;

  const expenseData = [
    { name: '交通', value: expenses.filter(e => e.category === '交通').reduce((a, b) => a + b.amountCNY, 0) },
    { name: '餐飲', value: expenses.filter(e => e.category === '餐飲').reduce((a, b) => a + b.amountCNY, 0) },
    { name: '景點', value: expenses.filter(e => e.category === '景點').reduce((a, b) => a + b.amountCNY, 0) },
    { name: '其他', value: expenses.filter(e => e.category === '其他').reduce((a, b) => a + b.amountCNY, 0) },
  ].filter(d => d.value > 0);

  const handleAddExpense = async () => {
    if (!newExpense.title || !newExpense.amount) return;
    const path = `trips/${TRIP_ID}/expenses`;
    try {
      if (editingExpense) {
        await updateDoc(doc(db, path, editingExpense.id), {
          title: newExpense.title, amountCNY: parseFloat(newExpense.amount), category: newExpense.category,
        });
      } else {
        await addDoc(collection(db, path), {
          tripId: TRIP_ID, date: format(new Date(), 'yyyy-MM-dd'), title: newExpense.title,
          amountCNY: parseFloat(newExpense.amount), category: newExpense.category, payerUid: user?.uid || 'anonymous'
        });
      }
      setIsExpenseModalOpen(false);
      setEditingExpense(null);
      setNewExpense({ title: '', amount: '', category: '其他' });
    } catch (error) { console.error(error); }
  };

  const currentDayData = itinerary.find(d => d.date === selectedDate) || itinerary[0];

  return (
    <APIProvider apiKey={API_KEY}>
      <div className="min-h-screen pb-32 max-w-md mx-auto relative bg-[#FDFCFB] font-sans text-ink">
        <header className="sticky top-0 z-50 glass px-6 py-5 flex items-center justify-between rounded-b-[2.5rem] shadow-sm border-b border-white/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-morandi-blue/10 flex items-center justify-center text-morandi-blue">
              <MapPin className="size-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">杭州西湖 Family Trip</h1>
              <p className="text-[10px] text-accent uppercase tracking-widest font-medium">Spring Journey</p>
            </div>
          </div>
        </header>

        <div className="px-6 mt-6 space-y-8">
          <div className="relative aspect-[4/3] rounded-xl shadow-2xl group overflow-hidden border border-white/10">
            <img src={bannerImage} alt="Banner" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute top-6 right-6">
              <div className="bg-black/20 backdrop-blur-sm px-4 py-2 rounded-sm text-[9px] font-bold text-white/90">
                回台倒數: {timeLeft.days}D {timeLeft.hours}H
              </div>
            </div>
            <div className="absolute bottom-8 left-8 text-white">
              <div className="text-[10px] uppercase tracking-[0.3em] opacity-60 mb-1">目前支出</div>
              <div className="text-3xl font-bold">¥{totalCNY.toLocaleString()}</div>
            </div>
          </div>

          <div className="p-8 bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2.5rem] shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-7xl font-light text-morandi-blue">{realWeather?.temp.replace('°C', '') || '18'}<span className="text-3xl align-top">°</span></div>
              <div className="text-right">
                <div className="text-sm font-bold uppercase">{realWeather?.condition || '晴朗'}</div>
                <div className="text-[10px] opacity-60">杭州 · 西湖</div>
              </div>
            </div>
          </div>
        </div>

        <main className="px-6 mt-8">
          <AnimatePresence mode="wait">
            {activeTab === 'schedule' && (
              <motion.div key="schedule" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar">
                  {itinerary.map((day) => (
                    <button key={day.date} onClick={() => setSelectedDate(day.date)} className={cn("flex-shrink-0 w-16 h-20 flex flex-col items-center justify-center rounded-2xl transition-all", selectedDate === day.date ? "bg-morandi-blue text-white shadow-2xl" : "bg-white text-ink/40")}>
                      <div className="text-[8px] uppercase mb-2">{format(new Date(day.date), 'EEE')}</div>
                      <div className="text-2xl font-light">{format(new Date(day.date), 'd')}</div>
                    </button>
                  ))}
                </div>

                <div className="space-y-6 relative before:absolute before:left-8 before:top-4 before:bottom-4 before:w-px before:bg-morandi-blue/10">
                  {currentDayData.items.map((item, idx) => (
                    <motion.div key={item.id} onClick={() => setSelectedScheduleItem(item)} className="relative pl-16 cursor-pointer group">
                      <div className="absolute left-7 top-6 w-2 h-2 rounded-full bg-morandi-blue" />
                      <div className="modern-card p-0 overflow-hidden flex flex-col shadow-sm border-none">
                        <div className="h-44 relative overflow-hidden">
                          <img src={item.imageUrl} className="w-full h-full object-cover" />
                          <div className="absolute top-3 right-3 glass px-2 py-1 rounded-lg text-[10px] font-bold text-morandi-blue">{item.time}</div>
                        </div>
                        <div className="p-4">
                          <div className="text-sm font-bold mb-1">{item.title}</div>
                          <div className="flex items-center text-[10px] text-accent"><MapPin className="w-3 h-3 mr-1" />{item.location}</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'expense' && (
              <motion.div key="expense" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="modern-card p-8 bg-morandi-blue text-white rounded-[3rem] text-center">
                  <div className="text-5xl font-bold mb-2">¥{totalCNY.toLocaleString()}</div>
                  <div className="opacity-80">≈ NT${totalTWD.toLocaleString()}</div>
                </div>
                <div className="space-y-4">
                  {expenses.map((exp) => (
                    <div key={exp.id} className="modern-card p-5 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-sm font-bold">{exp.title}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-bold text-morandi-blue">¥{exp.amountCNY}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <nav className="fixed bottom-8 left-6 right-6 glass rounded-[2.5rem] p-2 shadow-2xl flex justify-between items-center z-50">
          {[
            { id: 'schedule', icon: <Calendar className="w-5 h-5" />, label: '行程' },
            { id: 'weather', icon: <Cloud className="w-5 h-5" />, label: '天氣' },
            { id: 'map', icon: <MapIcon className="w-5 h-5" />, label: '地圖' },
            { id: 'expense', icon: <Wallet className="w-5 h-5" />, label: '支出' },
            { id: 'live', icon: <Camera className="w-5 h-5" />, label: '即時' },
            { id: 'guide', icon: <Info className="w-5 h-5" />, label: '指南' }
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as TabType)} className={cn("flex flex-col items-center justify-center w-12 py-2 rounded-2xl", activeTab === tab.id ? "bg-morandi-blue text-white" : "text-accent")}>
              {tab.icon}<span className="text-[8px] mt-1">{tab.label}</span>
            </button>
          ))}
        </nav>

        <AnimatePresence>
          {selectedScheduleItem && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedScheduleItem(null)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="relative w-full max-w-sm bg-white rounded-[3rem] overflow-hidden shadow-2xl">
                <div className="grid grid-cols-2 gap-1 h-64 relative">
                  {selectedScheduleItem.images.slice(0, 4).map((img, i) => (
                    <img key={i} src={img} className="w-full h-32 object-cover" />
                  ))}
                  <button onClick={() => setSelectedScheduleItem(null)} className="absolute top-4 right-4 w-8 h-8 bg-black/40 text-white rounded-full flex items-center justify-center"><X className="w-4 h-4" /></button>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-4">{selectedScheduleItem.title}</h3>
                  <p className="text-sm text-accent leading-relaxed">{selectedScheduleItem.description}</p>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </APIProvider>
  );
}
