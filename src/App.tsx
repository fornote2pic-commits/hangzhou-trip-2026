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
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

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

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const TRIP_ID = 'hangzhou-2026'; // Fixed trip ID for this app

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
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [currentExchangeRate, setCurrentExchangeRate] = useState(EXCHANGE_RATE);

  // Fetch Itinerary and Banner from Firestore if available
  useEffect(() => {
    const fetchTripData = async () => {
      try {
        const tripDoc = await getDocFromServer(doc(db, 'trips', TRIP_ID));
        if (tripDoc.exists()) {
          const data = tripDoc.data();
          if (data.itinerary) setItinerary(data.itinerary);
          if (data.bannerImage) setBannerImage(data.bannerImage);
        }
      } catch (err) {
        console.error('Failed to fetch trip data:', err);
      }
    };
    fetchTripData();
  }, []);

  const saveItineraryToFirestore = async (newItinerary: DailyItinerary[]) => {
    try {
      await setDoc(doc(db, 'trips', TRIP_ID), { itinerary: newItinerary }, { merge: true });
    } catch (err) {
      console.error('Failed to save itinerary:', err);
    }
  };

  const saveBannerToFirestore = async (newBanner: string) => {
    try {
      await setDoc(doc(db, 'trips', TRIP_ID), { bannerImage: newBanner }, { merge: true });
    } catch (err) {
      console.error('Failed to save banner:', err);
    }
  };

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        // Mocking an API call to get latest exchange rate
        // In a real app, you'd use something like: await fetch('https://api.exchangerate-api.com/v4/latest/CNY')
        const mockRate = 4.52; 
        setCurrentExchangeRate(mockRate);
      } catch (err) {
        console.error('Failed to fetch exchange rate:', err);
      }
    };
    fetchExchangeRate();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. ");
        }
      }
    }
    testConnection();
  }, []);

  useEffect(() => {
    const path = `trips/${TRIP_ID}/expenses`;
    const q = query(collection(db, path), orderBy('date', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedExpenses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Expense[];
      setExpenses(fetchedExpenses);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        console.warn('Login popup closed or cancelled.');
      } else {
        console.error('Login failed:', error);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getDayOfWeek = (dateStr: string) => {
    const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    return days[new Date(dateStr).getDay()];
  };

  useEffect(() => {
    const getWeather = async () => {
      try {
        const res = await fetch('https://wttr.in/Hangzhou?format=j1');
        const data = await res.json();
        if (data && data.current_condition && data.current_condition.length > 0) {
          const current = data.current_condition[0];
          setRealWeather({
            temp: `${current.temp_C}°C`,
            condition: current.lang_zh?.[0]?.value || (current.weatherDesc && current.weatherDesc[0]?.value) || '未知'
          });
        }
      } catch (err) {
        console.error('Failed to fetch weather:', err);
      }
    };
    getWeather();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const diff = differenceInSeconds(new Date(RETURN_DATE), now);
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (60 * 60 * 24)),
        hours: Math.floor((diff % (60 * 60 * 24)) / (60 * 60))
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveSig(Date.now());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const totalCNY = expenses.reduce((acc, curr) => acc + curr.amountCNY, 0);
  const totalTWD = totalCNY * currentExchangeRate;

  const expenseData = [
    { name: '交通', value: expenses.filter(e => e.category === '交通').reduce((a, b) => a + b.amountCNY, 0) },
    { name: '餐飲', value: expenses.filter(e => e.category === '餐飲').reduce((a, b) => a + b.amountCNY, 0) },
    { name: '景點', value: expenses.filter(e => e.category === '景點').reduce((a, b) => a + b.amountCNY, 0) },
    { name: '其他', value: expenses.filter(e => e.category === '其他').reduce((a, b) => a + b.amountCNY, 0) },
  ].filter(d => d.value > 0);

  const COLORS = ['#4A4E69', '#9A8C98', '#C9ADA7', '#22223B'];

  const handleAddExpense = async () => {
    if (!newExpense.title || !newExpense.amount) return;
    const path = `trips/${TRIP_ID}/expenses`;
    try {
      if (editingExpense) {
        await updateDoc(doc(db, path, editingExpense.id), {
          title: newExpense.title,
          amountCNY: parseFloat(newExpense.amount),
          category: newExpense.category,
        });
      } else {
        await addDoc(collection(db, path), {
          tripId: TRIP_ID,
          date: format(new Date(), 'yyyy-MM-dd'),
          title: newExpense.title,
          amountCNY: parseFloat(newExpense.amount),
          category: newExpense.category,
          payerUid: user?.uid || 'anonymous'
        });
      }
      setIsExpenseModalOpen(false);
      setEditingExpense(null);
      setNewExpense({ title: '', amount: '', category: '其他' });
    } catch (error) {
      handleFirestoreError(error, editingExpense ? OperationType.UPDATE : OperationType.CREATE, path + (editingExpense ? `/${editingExpense.id}` : ''));
    }
  };

  const handleDeleteExpense = async (id: string) => {
    const path = `trips/${TRIP_ID}/expenses/${id}`;
    try {
      await deleteDoc(doc(db, `trips/${TRIP_ID}/expenses`, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const currentDayData = itinerary.find(d => d.date === selectedDate) || itinerary[0];

  const categoryIcons: Record<string, React.ReactNode> = {
    'transport': <Car className="size-5" />,
    'food': <Utensils className="size-5" />,
    'attraction': <Camera className="size-5" />,
    'hotel': <Hotel className="size-5" />,
  };

  const getCategoryIcon = (category: string) => {
    return categoryIcons[category] || <Info className="size-5" />;
  };

  return (
    <div className="min-h-screen pb-32 max-w-md mx-auto relative bg-[#FDFCFB] font-sans text-ink">
      <header className="sticky top-0 z-50 glass px-6 py-5 flex items-center justify-between rounded-b-[2.5rem] shadow-sm border-b border-white/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-morandi-blue/10 flex items-center justify-center text-morandi-blue">
            <MapPin className="size-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight serif">杭州西湖 Family Trip</h1>
            <p className="text-[10px] text-accent uppercase tracking-widest font-medium">Spring Journey</p>
          </div>
        </div>
        <div className="flex gap-3">
          {user ? (
            <button onClick={handleLogout} className="w-10 h-10 rounded-2xl glass overflow-hidden shadow-sm border border-white">
              <img src={user.photoURL || ''} alt="User" className="w-full h-full object-cover" />
            </button>
          ) : (
            <button onClick={handleLogin} className="w-10 h-10 rounded-2xl glass flex items-center justify-center text-morandi-blue shadow-sm border border-white">
              <Plus className="size-5" />
            </button>
          )}
        </div>
      </header>

      {/* Banner & Weather Section */}
      <div className="px-6 mt-6 space-y-8">
        {/* Banner 與倒數計時 */}
        <div className="relative aspect-[4/3] rounded-xl shadow-2xl group overflow-hidden border border-white/10">
          <img src={bannerImage} alt="West Lake" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Edit Banner Button */}
          <button 
            onClick={() => setIsBannerModalOpen(true)}
            className="absolute top-6 left-6 glass p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-all z-10 hover:scale-110 active:scale-95"
          >
            <Camera className="size-5 text-morandi-blue" />
          </button>

          <div className="absolute top-6 right-6">
            <div className="bg-black/20 backdrop-blur-sm px-4 py-2 rounded-sm text-[9px] font-bold text-white/90 flex items-center gap-3 border border-white/5 tracking-[0.2em] uppercase">
              <div className="w-1 h-1 bg-morandi-rose rounded-full animate-pulse" />
              回台倒數: {timeLeft.days}D {timeLeft.hours}H
            </div>
          </div>

          <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
            <div className="text-left text-white">
              <div className="text-[10px] uppercase tracking-[0.3em] opacity-60 mb-1 font-black">目前支出</div>
              <div className="text-3xl font-bold serif text-beige">¥{totalCNY.toLocaleString()}</div>
              <div className="text-[11px] opacity-70 font-medium">≈ NT${totalTWD.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Refined Weather Display */}
        <div className="p-8 bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2.5rem] flex flex-col gap-8 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="text-[10px] text-accent uppercase tracking-[0.4em] font-black mb-4 opacity-40">Weather</div>
                <div className="flex items-center gap-4">
                  <div className="text-7xl font-light serif text-morandi-blue tracking-tighter leading-none">
                    {realWeather?.temp.replace('°C', '') || '18'}
                    <span className="text-3xl align-top ml-1">°</span>
                  </div>
                  <div className="w-px h-12 bg-morandi-blue/10" />
                  <div className="space-y-1">
                    <div className="text-sm text-morandi-blue font-bold uppercase tracking-widest">{realWeather?.condition || '晴朗'}</div>
                    <div className="text-[10px] text-accent font-medium opacity-60">杭州 · 西湖</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="w-16 h-16 bg-white/60 rounded-full flex items-center justify-center shadow-inner border border-white/80">
                {realWeather?.condition.includes('雨') ? (
                  <CloudRain className="w-8 h-8 text-morandi-blue" />
                ) : (
                  <Sun className="w-8 h-8 text-morandi-rose" />
                )}
              </div>
            </div>
          </div>
          
          {/* Weather Suggestions & Alerts */}
          <div className="grid grid-cols-1 gap-6 pt-8 border-t border-morandi-blue/5 relative z-10">
            <div className="flex items-start gap-5">
              <div className="mt-1 p-2 bg-morandi-rose/10 rounded-full text-morandi-rose">
                <Info className="size-4" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-black text-accent uppercase tracking-widest mb-1.5 opacity-40">今日行程提醒</div>
                <p className="text-xs text-ink/80 font-medium leading-relaxed">
                  {realWeather?.condition.includes('雨') || currentDayData.weather.condition.includes('雨') 
                    ? '今日有雨，建議調整戶外行程。西湖邊風大，請務必注意保暖與雨具攜帶。' 
                    : '天氣晴朗，西湖景色正美。推薦前往曲院風荷或蘇堤漫步，享受春日暖陽。'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <HomeIcon className="size-3 text-morandi-blue opacity-40" />
                  <div className="text-[9px] font-black text-accent uppercase tracking-widest opacity-40">穿著建議</div>
                </div>
                <p className="text-[11px] text-ink/70 font-semibold leading-snug">
                  {parseInt(currentDayData.weather.temp) > 20 ? '氣溫偏高，建議短袖搭薄外套。' : '氣溫適中，建議長袖襯衫加薄夾克。'}
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CloudRain className="size-3 text-morandi-rose opacity-40" />
                  <div className="text-[9px] font-black text-accent uppercase tracking-widest opacity-40">雨具/建議</div>
                </div>
                <p className="text-[11px] text-ink/70 font-semibold leading-snug">
                  {currentDayData.weather.condition.includes('雨') ? '務必攜帶長傘，並穿著防水鞋。' : '建議隨身攜帶輕便傘以防萬一。'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-6 mt-8">
        <AnimatePresence mode="wait">
          {activeTab === 'schedule' && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 0.99, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Date Selector */}
              <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar px-2">
                {itinerary.map((day) => (
                  <button
                    key={day.date}
                    onClick={() => setSelectedDate(day.date)}
                    className={cn(
                      "flex-shrink-0 w-16 h-20 flex flex-col items-center justify-center rounded-2xl transition-all duration-500",
                      selectedDate === day.date 
                        ? "bg-morandi-blue text-white shadow-2xl scale-110 -translate-y-1" 
                        : "bg-white text-ink/40 hover:bg-white/80 border border-morandi-blue/5"
                    )}
                  >
                    <div className="text-[8px] font-black uppercase tracking-widest mb-2 opacity-60">
                      {format(new Date(day.date), 'EEE')}
                    </div>
                    <div className="text-2xl font-light serif leading-none">
                      {format(new Date(day.date), 'd')}
                    </div>
                  </button>
                ))}
              </div>

              {/* Timeline */}
              <div className="space-y-6 relative before:absolute before:left-8 before:top-4 before:bottom-4 before:w-px before:bg-morandi-blue/10">
                {currentDayData.items.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => setSelectedScheduleItem(item)}
                    className="relative pl-16 cursor-pointer group"
                  >
                    <div className="absolute left-7 top-6 w-2 h-2 rounded-full bg-morandi-blue shadow-[0_0_0_4px_rgba(74,78,105,0.1)] z-10 group-hover:scale-150 transition-transform" />
                    <div className="modern-card p-0 overflow-hidden flex flex-col group-hover:shadow-xl transition-all border-none relative">
                      {/* Edit Itinerary Item Button */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingItineraryItem({ dayDate: currentDayData.date, item });
                          setIsItineraryModalOpen(true);
                        }}
                        className="absolute top-3 left-3 glass p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-20"
                      >
                        <Plus className="size-3 text-morandi-blue rotate-45" />
                      </button>

                      <div className="h-32 relative">
                        <img src={item.imageUrl} className="w-full h-full object-cover" />
                        <div className="absolute top-3 right-3 glass px-2 py-1 rounded-lg text-[10px] font-bold text-morandi-blue">
                          {item.time}
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="text-sm font-bold serif mb-1">{item.title}</div>
                        <div className="flex items-center text-[10px] text-accent">
                          <MapPin className="w-3 h-3 mr-1" />
                          {item.location}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'expense' && (
            <motion.div
              key="expense"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {/* Summary Card */}
              <div className="modern-card p-8 bg-morandi-blue text-paper shadow-2xl relative overflow-hidden rounded-[3rem]">
                <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
                <div className="relative z-10 text-center">
                  <div className="text-[10px] uppercase tracking-[0.2em] opacity-60 mb-2">Total Expenses</div>
                  <div className="text-5xl font-bold serif text-beige mb-2">¥{totalCNY.toLocaleString()}</div>
                  <div className="text-lg font-medium opacity-80 text-paper/80">≈ NT${totalTWD.toLocaleString()}</div>
                </div>
              </div>

              {/* Chart */}
              <div className="modern-card p-8">
                <h3 className="text-sm font-bold serif mb-6 flex items-center">
                  <PieChartIcon className="w-4 h-4 mr-2 text-morandi-blue" />
                  支出類別分析
                </h3>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={8}
                        dataKey="value"
                        stroke="none"
                      >
                        {expenseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  {expenseData.map((item, idx) => (
                    <div key={idx} className="flex items-center p-3 bg-slate-50 rounded-2xl">
                      <div className="w-3 h-3 rounded-full mr-3 shadow-sm" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <div className="flex-1">
                        <div className="text-[10px] text-accent font-bold uppercase">{item.name}</div>
                        <div className="text-xs font-bold serif">¥{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Converter */}
              <div className="modern-card p-8 bg-gradient-to-br from-beige/10 to-transparent">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-[10px] font-bold text-accent uppercase tracking-widest">匯率換算器</div>
                  <div className="text-[10px] text-morandi-blue font-bold">1 CNY = {currentExchangeRate} TWD</div>
                </div>
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="number"
                      value={cnyInput}
                      onChange={(e) => setCnyInput(e.target.value)}
                      placeholder="輸入人民幣金額"
                      className="w-full bg-white border border-slate-100 rounded-2xl py-5 px-6 text-lg font-bold serif focus:ring-2 focus:ring-morandi-blue/10 transition-all"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-bold text-accent">CNY</div>
                  </div>
                  <div className="flex justify-center">
                    <div className="w-10 h-10 rounded-full bg-morandi-blue text-white flex items-center justify-center shadow-lg">
                      <TrendingUp className="size-4" />
                    </div>
                  </div>
                  <div className="w-full bg-morandi-blue text-paper rounded-2xl py-5 px-6 text-center">
                    <div className="text-[10px] uppercase opacity-60 mb-1">換算新台幣</div>
                    <div className="text-2xl font-bold serif">
                      {cnyInput ? `NT$ ${(parseFloat(cnyInput) * currentExchangeRate).toFixed(1)}` : 'NT$ 0.0'}
                    </div>
                  </div>
                </div>
              </div>

              {/* List */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                  <h3 className="text-sm font-bold serif">支出明細</h3>
                  <button 
                    onClick={() => {
                      setEditingExpense(null);
                      setNewExpense({ title: '', amount: '', category: '其他' });
                      setIsExpenseModalOpen(true);
                    }}
                    className="w-10 h-10 bg-morandi-blue text-white rounded-2xl flex items-center justify-center shadow-lg"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                {expenses.map((exp) => (
                  <div key={exp.id} className="modern-card p-5 flex items-center justify-between group border-none">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-morandi-blue">
                        {exp.category === '交通' ? <Car className="w-5 h-5" /> : 
                         exp.category === '餐飲' ? <Utensils className="w-5 h-5" /> : 
                         <DollarSign className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="text-sm font-bold serif">{exp.title}</div>
                        <div className="text-[10px] text-accent uppercase tracking-widest">{exp.date}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-base font-bold text-morandi-blue serif">¥{exp.amountCNY}</div>
                        <div className="text-[10px] text-accent">NT${(exp.amountCNY * currentExchangeRate).toFixed(0)}</div>
                      </div>
                      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => {
                            setEditingExpense(exp);
                            setNewExpense({ title: exp.title, amount: exp.amountCNY.toString(), category: exp.category });
                            setIsExpenseModalOpen(true);
                          }}
                          className="p-1.5 text-morandi-blue hover:bg-morandi-blue/10 rounded-lg transition-colors"
                          title="修改"
                        >
                          <Plus className="w-3 h-3 rotate-45" /> {/* Using Plus rotated as a simple edit-like icon or I could use Edit if imported */}
                        </button>
                        <button 
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                          title="刪除"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'weather' && (
            <motion.div
              key="weather"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="modern-card p-0 overflow-hidden relative aspect-square rounded-[3rem]">
                <img src="https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?q=80&w=800" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white">
                  <Sun className="w-20 h-20 text-morandi-rose mb-4 drop-shadow-lg" />
                  <h2 className="text-6xl font-bold serif">{realWeather?.temp || '18°C'}</h2>
                  <p className="text-xl font-medium mt-2 tracking-widest uppercase">{realWeather?.condition || '晴朗'}</p>
                  <div className="mt-8 glass px-6 py-2 rounded-full text-xs font-bold tracking-widest uppercase">
                    Hangzhou · West Lake
                  </div>
                </div>
              </div>

              <div className="modern-card p-6">
                <h3 className="text-sm font-bold serif mb-6 flex items-center justify-between">
                  未來 7 天預報
                  <span className="text-[10px] text-accent font-sans">點擊查看詳情</span>
                </h3>
                <div className="space-y-6">
                  {itinerary.map((day, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setSelectedWeatherDay(day)}
                      className="flex items-center justify-between cursor-pointer hover:bg-slate-50 p-2 rounded-2xl transition-colors"
                    >
                      <div className="text-xs font-bold w-16">{format(new Date(day.date), 'MM/dd')}</div>
                      <div className="flex items-center space-x-3 flex-1 justify-center">
                        <Sun className="w-5 h-5 text-morandi-rose" />
                        <span className="text-xs text-accent">{day.weather.condition}</span>
                      </div>
                      <div className="text-xs font-bold text-morandi-blue w-16 text-right serif">{day.weather.temp}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'map' && (
            <motion.div
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="modern-card overflow-hidden h-[450px] relative rounded-[3rem] shadow-2xl border-none">
                <iframe
                  src="https://m.amap.com/navi/?dest=120.153576,30.254053&destName=西湖景區&key=b53f65e49528e19e07211a7f0521e649"
                  className="w-full h-full border-none"
                  title="Amap"
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold serif px-2 flex items-center justify-between">
                  今日行程景點
                  <span className="text-[10px] text-accent font-sans">點擊開啟導航</span>
                </h3>
                {currentDayData.items.filter(i => i.category === 'attraction' || i.category === 'food').map((loc, idx) => (
                  <a 
                    key={idx} 
                    href={loc.mapUrl || `https://uri.amap.com/marker?name=${encodeURIComponent(loc.title)}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="modern-card p-5 flex items-center justify-between hover:bg-slate-50 transition-all border-none"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-morandi-rose/10 rounded-2xl flex items-center justify-center text-morandi-rose">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold serif">{loc.title}</div>
                        <div className="text-[10px] text-accent uppercase tracking-widest">{loc.location}</div>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-morandi-blue/5 flex items-center justify-center text-morandi-blue">
                      <Navigation className="w-4 h-4" />
                    </div>
                  </a>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'live' && (
            <motion.div
              key="live"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="modern-card overflow-hidden aspect-video relative bg-black rounded-[2rem] shadow-2xl">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/5_XSYlAfJZM?autoplay=1&mute=1&controls=0&loop=1&playlist=5_XSYlAfJZM"
                  title="Hangzhou Live"
                  allow="autoplay; encrypted-media"
                />
                <div className="absolute top-4 left-4 flex items-center space-x-2">
                  <div className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded animate-pulse">LIVE</div>
                  <div className="bg-black/40 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded">CAM 01 · 西湖湖畔</div>
                </div>
                <div className="absolute bottom-4 right-4 text-white/60 text-[10px] font-mono">
                  {format(new Date(liveSig), 'yyyy-MM-dd HH:mm:ss')}
                </div>
                {/* Scanline Effect */}
                <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold px-2">其他監控點</h3>
                {[
                  { name: '河坊街入口', status: '連線中', time: '10:24' },
                  { name: '靈隱寺廣場', status: '連線中', time: '10:25' },
                  { name: '杭州東站大廳', status: '連線中', time: '10:26' }
                ].map((cam, idx) => (
                  <div key={idx} className="modern-card p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-morandi-blue/10 p-2 rounded-xl text-morandi-blue">
                        <Camera className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">{cam.name}</div>
                        <div className="text-[10px] text-green-500 font-medium">{cam.status}</div>
                      </div>
                    </div>
                    <div className="text-[10px] font-mono text-ink/40">{cam.time}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'guide' && (
            <motion.div
              key="guide"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="modern-card p-8 bg-gradient-to-br from-morandi-blue to-morandi-rose text-white rounded-[3rem]">
                <h2 className="text-3xl font-bold serif mb-4">杭州旅遊指南</h2>
                <p className="text-sm opacity-80 leading-relaxed">
                  歡迎來到人間天堂。這份指南將幫助您更好地探索這座充滿詩意的城市。
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { title: '交通建議', content: '推薦使用支付寶內的「杭州地鐵」乘車碼，方便快捷。西湖周邊建議步行或騎行。', icon: <Car className="w-5 h-5" /> },
                  { title: '美食必吃', content: '西湖醋魚、東坡肉、龍井蝦仁、知味觀小籠包。', icon: <Utensils className="w-5 h-5" /> },
                  { title: '穿著指南', icon: <Sun className="w-5 h-5" />, content: '春季氣溫變化大，建議採用洋蔥式穿法，並隨身攜帶雨具。' },
                  { title: '網路與支付', icon: <Info className="w-5 h-5" />, content: '確保已開通支付寶或微信支付，並準備好漫遊數據。' }
                ].map((item, idx) => (
                  <div key={idx} className="modern-card p-6 flex gap-4 border-none">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-morandi-blue flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold serif mb-1">{item.title}</h4>
                      <p className="text-xs text-accent leading-relaxed">{item.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="modern-card p-8 bg-beige/10 border-none rounded-[2.5rem]">
                <h3 className="text-sm font-bold serif mb-4">緊急聯絡</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-accent">報警</span>
                    <span className="font-bold">110</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-accent">急救</span>
                    <span className="font-bold">120</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-accent">旅遊投訴</span>
                    <span className="font-bold">96123</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-8 left-6 right-6 glass rounded-[2.5rem] p-2 shadow-2xl border border-white/40 flex justify-between items-center z-50">
        {[
          { id: 'schedule', icon: <Calendar className="w-5 h-5" />, label: '行程' },
          { id: 'weather', icon: <Cloud className="w-5 h-5" />, label: '天氣' },
          { id: 'map', icon: <MapIcon className="w-5 h-5" />, label: '地圖' },
          { id: 'expense', icon: <Wallet className="w-5 h-5" />, label: '支出' },
          { id: 'live', icon: <Camera className="w-5 h-5" />, label: '即時' },
          { id: 'guide', icon: <Info className="w-5 h-5" />, label: '指南' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={cn(
              "flex flex-col items-center justify-center w-12 py-2 rounded-2xl transition-all duration-500",
              activeTab === tab.id 
                ? "bg-morandi-blue text-white shadow-lg -translate-y-1" 
                : "text-accent hover:text-morandi-blue"
            )}
          >
            {tab.icon}
            <span className="text-[8px] font-bold mt-1 tracking-tighter">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Modals */}
      <AnimatePresence>
        {isExpenseModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExpenseModalOpen(false)}
              className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold serif">{editingExpense ? '修改支出' : '新增支出'}</h3>
                <button onClick={() => setIsExpenseModalOpen(false)} className="p-2 bg-slate-100 rounded-full">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-ink/40 uppercase ml-2 mb-1 block">支出項目</label>
                  <input
                    type="text"
                    value={newExpense.title}
                    onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                    placeholder="例如：午餐"
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-morandi-blue/20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-ink/40 uppercase ml-2 mb-1 block">金額 (CNY)</label>
                    <input
                      type="number"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                      placeholder="0.00"
                      className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-morandi-blue/20"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-ink/40 uppercase ml-2 mb-1 block">分類</label>
                    <select
                      value={newExpense.category}
                      onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                      className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-morandi-blue/20 appearance-none"
                    >
                      <option value="交通">交通</option>
                      <option value="餐飲">餐飲</option>
                      <option value="景點">景點</option>
                      <option value="其他">其他</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleAddExpense}
                  className="w-full bg-morandi-blue text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all mt-4"
                >
                  {editingExpense ? '確認修改' : '確認新增'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {isBannerModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBannerModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-white rounded-[3rem] p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold serif">修改首圖</h3>
                <button onClick={() => setIsBannerModalOpen(false)} className="p-2 bg-slate-100 rounded-full">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-ink/40 uppercase ml-2 mb-1 block">圖片 URL</label>
                  <input
                    type="text"
                    value={bannerImage}
                    onChange={(e) => setBannerImage(e.target.value)}
                    placeholder="輸入圖片網址"
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-morandi-blue/20"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="file" 
                    id="banner-upload" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setBannerImage(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <label 
                    htmlFor="banner-upload"
                    className="flex-1 bg-slate-100 text-ink/60 py-4 rounded-2xl text-xs font-bold text-center cursor-pointer hover:bg-slate-200 transition-colors"
                  >
                    上傳照片
                  </label>
                </div>
                <button
                  onClick={() => {
                    saveBannerToFirestore(bannerImage);
                    setIsBannerModalOpen(false);
                  }}
                  className="w-full bg-morandi-blue text-white py-4 rounded-2xl font-bold shadow-lg"
                >
                  儲存修改
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {isItineraryModalOpen && editingItineraryItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsItineraryModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-white rounded-[3rem] p-8 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold serif">修改行程</h3>
                <button onClick={() => setIsItineraryModalOpen(false)} className="p-2 bg-slate-100 rounded-full">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-ink/40 uppercase ml-2 mb-1 block">標題</label>
                  <input
                    type="text"
                    value={editingItineraryItem.item.title}
                    onChange={(e) => setEditingItineraryItem({
                      ...editingItineraryItem,
                      item: { ...editingItineraryItem.item, title: e.target.value }
                    })}
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-ink/40 uppercase ml-2 mb-1 block">描述</label>
                  <textarea
                    value={editingItineraryItem.item.description}
                    onChange={(e) => setEditingItineraryItem({
                      ...editingItineraryItem,
                      item: { ...editingItineraryItem.item, description: e.target.value }
                    })}
                    rows={3}
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-ink/40 uppercase ml-2 mb-1 block">行程介紹 (Introduction)</label>
                  <textarea
                    value={editingItineraryItem.item.introduction || ''}
                    onChange={(e) => setEditingItineraryItem({
                      ...editingItineraryItem,
                      item: { ...editingItineraryItem.item, introduction: e.target.value }
                    })}
                    rows={3}
                    placeholder="輸入行程詳細介紹..."
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-morandi-blue/20"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-ink/40 uppercase ml-2 mb-1 block">備註詳情 (Details)</label>
                  <textarea
                    value={editingItineraryItem.item.details || ''}
                    onChange={(e) => setEditingItineraryItem({
                      ...editingItineraryItem,
                      item: { ...editingItineraryItem.item, details: e.target.value }
                    })}
                    rows={3}
                    placeholder="輸入交通、門票等備註..."
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-morandi-blue/20"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-ink/40 uppercase ml-2 mb-1 block">主圖 URL</label>
                  <input
                    type="text"
                    value={editingItineraryItem.item.imageUrl}
                    onChange={(e) => setEditingItineraryItem({
                      ...editingItineraryItem,
                      item: { ...editingItineraryItem.item, imageUrl: e.target.value }
                    })}
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm"
                  />
                </div>
                
                {/* Multi-image editing */}
                <div>
                  <label className="text-[10px] font-bold text-ink/40 uppercase ml-2 mb-1 block">其他照片 (最多4張)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[0, 1, 2, 3].map((idx) => {
                      const img = editingItineraryItem.item.images?.[idx] || '';
                      return (
                        <div key={idx} className="relative group">
                          <div className="w-full h-20 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden">
                            {img ? (
                              <img src={img} className="w-full h-full object-cover" />
                            ) : (
                              <Camera className="size-4 text-ink/20" />
                            )}
                          </div>
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/60 flex flex-col items-center justify-center gap-2 rounded-xl transition-opacity p-2">
                            <input 
                              type="file" 
                              id={`img-upload-${idx}`} 
                              className="hidden" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    const newImages = [...(editingItineraryItem.item.images || [])];
                                    // Fill with empty strings if needed
                                    while (newImages.length <= idx) newImages.push('');
                                    newImages[idx] = reader.result as string;
                                    setEditingItineraryItem({
                                      ...editingItineraryItem,
                                      item: { ...editingItineraryItem.item, images: newImages }
                                    });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                            <label 
                              htmlFor={`img-upload-${idx}`}
                              className="bg-white p-1.5 rounded-full cursor-pointer hover:scale-110 transition-transform"
                            >
                              <Camera className="size-3 text-morandi-blue" />
                            </label>
                            <input 
                              type="text" 
                              value={img.startsWith('data:') ? '已上傳' : img}
                              onChange={(e) => {
                                const newImages = [...(editingItineraryItem.item.images || [])];
                                while (newImages.length <= idx) newImages.push('');
                                newImages[idx] = e.target.value;
                                setEditingItineraryItem({
                                  ...editingItineraryItem,
                                  item: { ...editingItineraryItem.item, images: newImages }
                                });
                              }}
                              className="w-full bg-white/90 text-[8px] p-1 rounded border-none focus:ring-0"
                              placeholder="圖片網址"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="file" 
                    id="item-upload" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setEditingItineraryItem({
                            ...editingItineraryItem,
                            item: { ...editingItineraryItem.item, imageUrl: reader.result as string }
                          });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <label 
                    htmlFor="item-upload"
                    className="flex-1 bg-slate-100 text-ink/60 py-4 rounded-2xl text-xs font-bold text-center cursor-pointer"
                  >
                    上傳主圖
                  </label>
                </div>

                <button
                  onClick={() => {
                    const newItinerary = itinerary.map(day => {
                      if (day.date === editingItineraryItem.dayDate) {
                        return {
                          ...day,
                          items: day.items.map(it => it.id === editingItineraryItem.item.id ? editingItineraryItem.item : it)
                        };
                      }
                      return day;
                    });
                    setItinerary(newItinerary);
                    saveItineraryToFirestore(newItinerary);
                    setIsItineraryModalOpen(false);
                  }}
                  className="w-full bg-morandi-blue text-white py-4 rounded-2xl font-bold shadow-lg"
                >
                  儲存行程修改
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {selectedWeatherDay && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedWeatherDay(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-white rounded-[3rem] p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold serif">{format(new Date(selectedWeatherDay.date), 'MM/dd')} 每小時預報</h3>
                <button onClick={() => setSelectedWeatherDay(null)} className="p-2 bg-slate-100 rounded-full">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-6 max-h-[400px] overflow-y-auto no-scrollbar">
                {(selectedWeatherDay.hourlyForecast || [
                  { time: '09:00', temp: '14°C', condition: '晴' },
                  { time: '12:00', temp: '18°C', condition: '晴' },
                  { time: '15:00', temp: '17°C', condition: '多雲' },
                  { time: '18:00', temp: '15°C', condition: '多雲' },
                  { time: '21:00', temp: '13°C', condition: '陰天' }
                ]).map((h, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div className="text-sm font-bold text-accent">{h.time}</div>
                    <div className="flex items-center gap-3">
                      <Sun className="w-4 h-4 text-morandi-rose" />
                      <span className="text-sm font-medium">{h.condition}</span>
                    </div>
                    <div className="text-base font-bold text-morandi-blue serif">{h.temp}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {selectedScheduleItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedScheduleItem(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-white rounded-[3rem] overflow-hidden shadow-2xl"
            >
              <div className="grid grid-cols-2 gap-1 h-64 relative">
                {selectedScheduleItem.images.slice(0, 4).map((img, i) => (
                  <img 
                    key={i}
                    src={img} 
                    alt={`${selectedScheduleItem.title}-${i}`} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ))}
                <button 
                  onClick={() => setSelectedScheduleItem(null)}
                  className="absolute top-4 right-4 w-8 h-8 bg-black/40 backdrop-blur-md text-white rounded-full flex items-center justify-center z-10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-8">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-[10px] font-bold text-morandi-blue uppercase tracking-widest">{selectedScheduleItem.time}</div>
                  <div className="w-1 h-1 bg-morandi-blue/20 rounded-full" />
                  <div className="text-[10px] font-bold text-accent/40 uppercase tracking-widest">{selectedScheduleItem.location}</div>
                </div>
                <h3 className="text-2xl font-bold serif mb-4">{selectedScheduleItem.title}</h3>
                {selectedScheduleItem.introduction && (
                  <p className="text-sm text-ink/80 font-bold leading-relaxed mb-4 italic border-l-2 border-morandi-blue/20 pl-4 py-1">
                    {selectedScheduleItem.introduction}
                  </p>
                )}
                <p className="text-sm text-accent leading-relaxed mb-4">
                  {selectedScheduleItem.description}
                </p>
                
                {selectedScheduleItem.details && (
                  <div className="p-4 bg-slate-50 rounded-2xl mb-8">
                    <div className="text-[10px] font-bold text-morandi-blue uppercase tracking-widest mb-2">備註詳情</div>
                    <p className="text-xs text-accent/70 leading-relaxed whitespace-pre-line">
                      {selectedScheduleItem.details}
                    </p>
                  </div>
                )}
                
                <div className="flex space-x-4">
                  <button 
                    onClick={() => {
                      setEditingItineraryItem({ 
                        dayDate: itinerary.find(d => d.items.some(i => i.id === selectedScheduleItem.id))?.date || '', 
                        item: selectedScheduleItem 
                      });
                      setSelectedScheduleItem(null);
                      setIsItineraryModalOpen(true);
                    }}
                    className="flex-1 bg-white border border-morandi-blue/20 text-morandi-blue py-4 rounded-2xl text-xs font-bold flex items-center justify-center shadow-sm"
                  >
                    <Plus className="w-4 h-4 mr-2 rotate-45" /> 編輯行程
                  </button>
                  <a 
                    href={selectedScheduleItem.mapUrl || `https://uri.amap.com/marker?name=${encodeURIComponent(selectedScheduleItem.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-morandi-blue text-white py-4 rounded-2xl text-xs font-bold flex items-center justify-center shadow-lg"
                  >
                    <Navigation className="w-4 h-4 mr-2" /> 高德地圖
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
    </APIProvider>
  );
}
