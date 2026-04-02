import React, { useState, useEffect } from 'react';
import { User, Payment, LotteryResult } from './types';
import { 
  Users, 
  Calendar, 
  Trophy, 
  History, 
  Plus, 
  CheckCircle2,
  XCircle,
  TrendingUp,
  Wallet,
  UserPlus,
  RefreshCw,
  Settings,
  Moon,
  Sun,
  Trash2,
  AlertTriangle,
  Search,
  Phone,
  Edit,
  Trash,
  Banknote,
  Building2,
  Save,
  Palette,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, differenceInCalendarDays, addDays, isValid } from 'date-fns';
import { cn } from './lib/utils';
import confetti from 'canvas-confetti';

// --- Helpers ---

const safeGetDate = (date: any): Date => {
  if (!date) return new Date();
  if (typeof date === 'string') {
    const parsed = parseISO(date);
    return isValid(parsed) ? parsed : new Date();
  }
  if (date instanceof Date) return date;
  return new Date();
};

const safeFormatDate = (date: any, formatStr: string): string => {
  const d = safeGetDate(date);
  return format(d, formatStr);
};

// --- Components ---

const StatCard = ({ title, value, icon: Icon, color, darkMode, trend }: { title: string, value: string | number, icon: any, color: string, darkMode: boolean, trend?: string }) => (
  <motion.div 
    whileHover={{ y: -4 }}
    className={cn(
      "p-6 rounded-[2rem] border transition-all duration-300 group", 
      darkMode 
        ? "bg-slate-900 border-slate-800 hover:border-slate-700 hover:shadow-2xl hover:shadow-blue-900/10" 
        : "bg-white border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:border-slate-200"
    )}
  >
    <div className="flex justify-between items-start mb-4">
      <div className={cn("p-4 rounded-2xl transition-transform group-hover:scale-110 duration-300", color, "bg-opacity-10 dark:bg-opacity-20")}>
        <Icon className={cn("w-6 h-6", color.replace('bg-', 'text-'))} />
      </div>
      {trend && (
        <span className={cn(
          "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
          trend.startsWith('+') ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
        )}>
          {trend}
        </span>
      )}
    </div>
    <div>
      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
      <p className={cn("text-3xl font-black tracking-tight", darkMode ? "text-white" : "text-slate-900")}>{value}</p>
    </div>
  </motion.div>
);

// --- Main App ---

export default function App() {
  const [members, setMembers] = useState<User[]>(() => {
    const saved = localStorage.getItem('members');
    return saved ? JSON.parse(saved) : [];
  });
  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem('payments');
    return saved ? JSON.parse(saved) : [];
  });
  const [lotteryResults, setLotteryResults] = useState<LotteryResult[]>(() => {
    const saved = localStorage.getItem('lotteryResults');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'members' | 'deposits' | 'lottery' | 'history' | 'settings'>('dashboard');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isEditingMember, setIsEditingMember] = useState(false);
  const [editingMember, setEditingMember] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });
  const [newMember, setNewMember] = useState({ name: '', phone: '' });
  const [isLotteryRunning, setIsLotteryRunning] = useState(false);
  const [lotteryWinner, setLotteryWinner] = useState<User | null>(null);
  const [shufflingName, setShufflingName] = useState<string>('');
  const [societyName, setSocietyName] = useState(() => {
    return localStorage.getItem('societyName') || 'Sanchay Samity';
  });
  const [isSavingName, setIsSavingName] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [processingPayments, setProcessingPayments] = useState<Record<string, boolean>>({});
  const [wheelRotation, setWheelRotation] = useState(0);

  const [manualWinnerToConfirm, setManualWinnerToConfirm] = useState<User | null>(null);
  const [isManualSelectionOpen, setIsManualSelectionOpen] = useState(false);
  const [manualSearchTerm, setManualSearchTerm] = useState('');
  const [lastPrizeWon, setLastPrizeWon] = useState(0);
  const [isResettingCycle, setIsResettingCycle] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'danger' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'info'
  });

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('lotteryResults', JSON.stringify(lotteryResults));
  }, [lotteryResults]);

  useEffect(() => {
    localStorage.setItem('societyName', societyName);
  }, [societyName]);

  const updateSocietyName = (newName: string) => {
    setIsSavingName(true);
    setSocietyName(newName);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsSavingName(false);
    }, 1000);
  };

  const manualWinnerSelect = (winner: User) => {
    if (!winner) return;
    
    const unprocessedPayments = payments.filter(p => !p.isProcessed);
    const totalAmount = unprocessedPayments.reduce((sum, p) => sum + p.amount, 0);
    const currentPot = totalAmount;

    const newResult: LotteryResult = {
      id: Math.random().toString(36).substr(2, 9),
      winnerId: winner.id,
      amountWon: currentPot,
      drawDate: new Date().toISOString(),
      isProcessed: true
    };

    setLotteryResults(prev => [newResult, ...prev]);
    setPayments(prev => prev.map(p => ({ ...p, isProcessed: true })));
    setMembers(prev => {
      const updated = prev.map(m => m.id === winner.id ? { ...m, isWinner: true } : m);
      const remainingEligible = updated.filter(m => !m.isWinner);
      if (remainingEligible.length === 0) {
        return updated.map(m => ({ ...m, isWinner: false }));
      }
      return updated;
    });

    setLastPrizeWon(currentPot);
    setLotteryWinner(winner);
    setManualWinnerToConfirm(null);
    setManualSearchTerm('');
    
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2563eb', '#10b981', '#f59e0b']
    });
  };

  const resetCycle = () => {
    if (isResettingCycle) return;
    setIsResettingCycle(true);
    setMembers(prev => prev.map(m => ({ ...m, isWinner: false })));
    setIsResettingCycle(false);
  };

  const addMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name || !newMember.phone) return;
    const member: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: newMember.name,
      phone: newMember.phone,
      isWinner: false,
      createdAt: new Date().toISOString()
    };
    setMembers(prev => [...prev, member]);
    setNewMember({ name: '', phone: '' });
    setIsAddingMember(false);
  };

  const updateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    setMembers(prev => prev.map(m => m.id === editingMember.id ? editingMember : m));
    setIsEditingMember(false);
    setEditingMember(null);
  };

  const deleteMember = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Member',
      message: 'Are you sure you want to delete this member? This action cannot be undone.',
      type: 'danger',
      onConfirm: () => {
        setMembers(prev => prev.filter(m => m.id !== id));
        setPayments(prev => prev.filter(p => p.userId !== id));
        setLotteryResults(prev => prev.filter(r => r.winnerId !== id));
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const togglePayment = (userId: string, date: string) => {
    const key = `${userId}-${date}`;
    if (processingPayments[key]) return;

    setProcessingPayments(prev => ({ ...prev, [key]: true }));
    const existingIndex = payments.findIndex(p => p.userId === userId && p.date === date && !p.isProcessed);
    
    if (existingIndex > -1) {
      setPayments(prev => prev.filter((_, i) => i !== existingIndex));
    } else {
      const newPayment: Payment = {
        id: Math.random().toString(36).substr(2, 9),
        userId,
        amount: 100,
        date,
        createdAt: new Date().toISOString(),
        isProcessed: false
      };
      setPayments(prev => [...prev, newPayment]);
    }
    setProcessingPayments(prev => ({ ...prev, [key]: false }));
  };

  const runLottery = () => {
    if (members.length === 0) return;
    
    setIsLotteryRunning(true);
    setLotteryWinner(null);

    let eligible = members.filter(m => !m.isWinner);
    
    if (eligible.length === 0) {
      setMembers(prev => prev.map(m => ({ ...m, isWinner: false })));
      eligible = [...members];
    }

    const newRotation = wheelRotation + 1800 + Math.random() * 360;
    setWheelRotation(newRotation);

    const shuffleInterval = setInterval(() => {
      const randomMember = eligible[Math.floor(Math.random() * eligible.length)];
      setShufflingName(randomMember.name);
    }, 80);

    setTimeout(() => {
      clearInterval(shuffleInterval);
      const winner = eligible[Math.floor(Math.random() * eligible.length)];
      manualWinnerSelect(winner);
      setIsLotteryRunning(false);
      setShufflingName('');
    }, 1500);
  };

  const resetApp = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Reset Entire App',
      message: 'Are you sure you want to reset the entire app? This will delete all members, payments, and lottery results. This action cannot be undone!',
      type: 'danger',
      onConfirm: () => {
        setIsResetting(true);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        setTimeout(() => {
          setMembers([]);
          setPayments([]);
          setLotteryResults([]);
          setSocietyName('Sanchay Samity');
          localStorage.clear();
          setIsResetting(false);
          setActiveTab('dashboard');
        }, 1000);
      }
    });
  };

  const totalCollected = payments.filter(p => !p.isProcessed).reduce((sum, p) => sum + p.amount, 0);
  const totalPaidOut = lotteryResults.filter(r => !r.isProcessed).reduce((sum, r) => sum + r.amountWon, 0);
  const currentBalance = totalCollected - totalPaidOut;

  // 10-day Cycle Logic
  const lastLotteryDate = lotteryResults.length > 0 
    ? safeGetDate([...lotteryResults].sort((a, b) => {
        const dateA = safeGetDate(a.drawDate).getTime();
        const dateB = safeGetDate(b.drawDate).getTime();
        return dateB - dateA;
      })[0].drawDate)
    : members.length > 0 
      ? safeGetDate([...members].sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0].createdAt)
      : new Date();

  const nextLotteryDate = addDays(lastLotteryDate, 10);
  const daysPassed = Math.max(0, differenceInCalendarDays(new Date(), lastLotteryDate));
  const daysRemaining = Math.max(0, 10 - daysPassed);
  const cycleProgress = Math.min(100, (daysPassed / 10) * 100);

  return (
    <div className={cn("min-h-screen flex flex-col md:flex-row pb-20 md:pb-0 transition-colors duration-300", darkMode ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900")}>
        {/* Mobile Header */}
        <header className={cn("md:hidden border-b px-6 py-4 flex items-center justify-between sticky top-0 z-30 transition-colors", darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100")}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <h1 className={cn("text-lg font-bold truncate max-w-[150px]", darkMode ? "text-white" : "text-gray-900")}>{societyName}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setDarkMode(!darkMode)} className={cn("p-2 rounded-lg transition-colors", darkMode ? "bg-slate-800 text-yellow-400" : "bg-slate-100 text-slate-600")}>
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Sidebar (Desktop) */}
        <nav className={cn("hidden md:flex w-72 border-r p-6 flex-col gap-2 shrink-0 sticky top-0 h-screen transition-colors", darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100")}>
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <h1 className={cn("text-xl font-bold truncate", darkMode ? "text-white" : "text-gray-900")}>{societyName}</h1>
          </div>

          {[
            { id: 'dashboard', icon: TrendingUp, label: 'Dashboard' },
            { id: 'members', icon: Users, label: 'Member List' },
            { id: 'deposits', icon: Calendar, label: 'Deposit Tracker' },
            { id: 'lottery', icon: Trophy, label: 'Lottery Wheel' },
            { id: 'history', icon: History, label: 'History' },
            { id: 'settings', icon: Settings, label: 'Settings' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all",
                activeTab === tab.id 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                  : darkMode ? "text-slate-400 hover:bg-slate-800 hover:text-white" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}

          <div className={cn("mt-auto pt-6 border-t", darkMode ? "border-slate-800" : "border-gray-100")}>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium mb-2",
                darkMode ? "bg-slate-800 text-yellow-400 hover:bg-slate-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </nav>

        {/* Bottom Nav (Mobile) */}
        <nav className={cn("md:hidden fixed bottom-0 left-0 right-0 border-t px-2 py-2 flex justify-around items-center z-40 shadow-[0_-4px_10px_rgba(0,0,0,0.03)] transition-colors", darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100")}>
          {[
            { id: 'dashboard', icon: TrendingUp, label: 'Home' },
            { id: 'members', icon: Users, label: 'Members' },
            { id: 'deposits', icon: Calendar, label: 'Deposits' },
            { id: 'lottery', icon: Trophy, label: 'Lottery' },
            { id: 'settings', icon: Settings, label: 'Settings' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all",
                activeTab === tab.id ? "text-blue-600" : darkMode ? "text-slate-500" : "text-gray-400"
              )}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-tighter">{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-10 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8 pb-20 md:pb-0"
              >
                {/* Welcome Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-1">
                    <h2 className={cn("text-3xl md:text-4xl font-black tracking-tight", darkMode ? "text-white" : "text-slate-900")}>
                      Welcome to <span className="text-blue-600">{societyName}</span>! 👋
                    </h2>
                    <p className="text-slate-500 font-medium">Here's what's happening in your society today.</p>
                  </div>
                  <div className={cn("px-6 py-3 rounded-2xl border flex items-center gap-3 transition-colors", darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100 shadow-sm")}>
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span className={cn("font-bold", darkMode ? "text-white" : "text-slate-900")}>{format(new Date(), 'MMMM d, yyyy')}</span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard 
                    title="Total Members" 
                    value={members.length} 
                    icon={Users} 
                    color="bg-blue-500" 
                    darkMode={darkMode} 
                    trend={`+${members.filter(m => differenceInCalendarDays(new Date(), safeGetDate(m.createdAt)) < 30).length} new`}
                  />
                  <StatCard 
                    title="Total Collected" 
                    value={`৳${totalCollected}`} 
                    icon={Wallet} 
                    color="bg-emerald-500" 
                    darkMode={darkMode} 
                    trend="Lifetime"
                  />
                  <StatCard 
                    title="Current Pot" 
                    value={`৳${currentBalance}`} 
                    icon={TrendingUp} 
                    color="bg-indigo-500" 
                    darkMode={darkMode} 
                    trend="Active"
                  />
                  
                  {/* Lottery Countdown Card */}
                  <motion.div 
                    whileHover={{ y: -4 }}
                    className={cn(
                      "p-6 rounded-[2rem] border flex flex-col justify-between transition-all duration-300", 
                      darkMode 
                        ? "bg-slate-900 border-slate-800 hover:border-slate-700 hover:shadow-2xl hover:shadow-blue-900/10" 
                        : "bg-white border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:border-slate-200"
                    )}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Next Lottery</p>
                      <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-wider">
                        {daysRemaining} Days Left
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-end">
                        <p className={cn("text-3xl font-black tracking-tight", darkMode ? "text-white" : "text-slate-900")}>{Math.round(cycleProgress)}%</p>
                        <p className="text-xs text-slate-500 font-bold">Day {daysPassed}/10</p>
                      </div>
                      <div className={cn("w-full h-3 rounded-full overflow-hidden p-0.5", darkMode ? "bg-slate-800" : "bg-slate-100")}>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${cycleProgress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                        />
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button 
                    onClick={() => setActiveTab('deposits')}
                    className={cn(
                      "p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all hover:scale-105 active:scale-95",
                      darkMode ? "bg-slate-900 border-slate-800 hover:bg-slate-800" : "bg-white border-slate-100 hover:bg-slate-50 shadow-sm"
                    )}
                  >
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                      <Banknote className="w-5 h-5 text-emerald-600" />
                    </div>
                    <span className={cn("text-xs font-bold", darkMode ? "text-slate-300" : "text-slate-700")}>Collect Deposit</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('members')}
                    className={cn(
                      "p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all hover:scale-105 active:scale-95",
                      darkMode ? "bg-slate-900 border-slate-800 hover:bg-slate-800" : "bg-white border-slate-100 hover:bg-slate-50 shadow-sm"
                    )}
                  >
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                      <UserPlus className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className={cn("text-xs font-bold", darkMode ? "text-slate-300" : "text-slate-700")}>Add Member</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('lottery')}
                    className={cn(
                      "p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all hover:scale-105 active:scale-95",
                      darkMode ? "bg-slate-900 border-slate-800 hover:bg-slate-800" : "bg-white border-slate-100 hover:bg-slate-50 shadow-sm"
                    )}
                  >
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-amber-600" />
                    </div>
                    <span className={cn("text-xs font-bold", darkMode ? "text-slate-300" : "text-slate-700")}>Run Lottery</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('history')}
                    className={cn(
                      "p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all hover:scale-105 active:scale-95",
                      darkMode ? "bg-slate-900 border-slate-800 hover:bg-slate-800" : "bg-white border-slate-100 hover:bg-slate-50 shadow-sm"
                    )}
                  >
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                      <History className="w-5 h-5 text-indigo-600" />
                    </div>
                    <span className={cn("text-xs font-bold", darkMode ? "text-slate-300" : "text-slate-700")}>View History</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Recent Activity */}
                  <div className={cn("p-8 rounded-[2.5rem] border transition-colors", darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100 shadow-sm")}>
                    <div className="flex justify-between items-center mb-8">
                      <h3 className={cn("text-xl font-black tracking-tight", darkMode ? "text-white" : "text-slate-900")}>Recent Winners</h3>
                      <button onClick={() => setActiveTab('history')} className="text-blue-600 text-xs font-bold hover:underline">View All</button>
                    </div>
                    <div className="space-y-4">
                      {lotteryResults.slice(0, 4).map((res) => {
                        const winner = members.find(m => m.id === res.winnerId);
                        return (
                          <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            key={res.id} 
                            className={cn("flex items-center justify-between p-4 rounded-2xl transition-all hover:translate-x-1", darkMode ? "bg-slate-800/50 hover:bg-slate-800" : "bg-slate-50 hover:bg-slate-100/80")}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center shadow-inner">
                                <Trophy className="w-6 h-6 text-amber-600" />
                              </div>
                              <div className="min-w-0">
                                <p className={cn("font-bold truncate", darkMode ? "text-white" : "text-slate-900")}>{winner?.name}</p>
                                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{safeFormatDate(res.drawDate, 'MMM d, yyyy • h:mm a')}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-black text-emerald-600 text-lg">৳{res.amountWon}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">Prize</p>
                            </div>
                          </motion.div>
                        );
                      })}
                      {lotteryResults.length === 0 && (
                        <div className="text-center py-12 space-y-3">
                          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                            <Trophy className="w-8 h-8 text-slate-300" />
                          </div>
                          <p className="text-slate-400 font-medium italic">No lottery winners yet.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Collection Status */}
                  <div className={cn("p-8 rounded-[2.5rem] border transition-colors", darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100 shadow-sm")}>
                    <div className="flex justify-between items-center mb-8">
                      <h3 className={cn("text-xl font-black tracking-tight", darkMode ? "text-white" : "text-slate-900")}>Today's Collection</h3>
                      <button onClick={() => setActiveTab('deposits')} className="text-blue-600 text-xs font-bold hover:underline">Manage Deposits</button>
                    </div>
                    <div className="space-y-4">
                      {members.slice(0, 4).map((m) => {
                        const paidToday = payments.some(p => p.userId === m.id && p.date === format(new Date(), 'yyyy-MM-dd'));
                        return (
                          <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            key={m.id} 
                            className={cn("flex items-center justify-between p-4 rounded-2xl transition-all hover:translate-x-1", darkMode ? "bg-slate-800/50 hover:bg-slate-800" : "bg-slate-50 hover:bg-slate-100/80")}
                          >
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-inner",
                                darkMode ? "bg-slate-800 text-slate-400" : "bg-white text-slate-400"
                              )}>
                                {m.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className={cn("font-bold truncate", darkMode ? "text-white" : "text-slate-900")}>{m.name}</p>
                                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{m.phone}</p>
                              </div>
                            </div>
                            {paidToday ? (
                              <div className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                              </div>
                            ) : (
                              <div className="px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                                <XCircle className="w-3.5 h-3.5" /> Pending
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                      {members.length === 0 && (
                        <div className="text-center py-12 space-y-3">
                          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                            <Users className="w-8 h-8 text-slate-300" />
                          </div>
                          <p className="text-slate-400 font-medium italic">Add members to track collections.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'members' && (
              <motion.div 
                key="members"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className={cn("text-2xl md:text-3xl font-black tracking-tight", darkMode ? "text-white" : "text-slate-900")}>Member Directory</h2>
                    <p className="text-slate-500 text-sm mt-1">Manage and view all society members ({members.length})</p>
                  </div>
                  <button 
                    onClick={() => setIsAddingMember(true)}
                    className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                  >
                    <UserPlus className="w-5 h-5" />
                    Add New Member
                  </button>
                </div>

                {/* Search and Filters */}
                <div className={cn("p-4 rounded-3xl border flex flex-col sm:flex-row gap-4 transition-colors", darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100 shadow-sm")}>
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="text"
                      placeholder="Search by name or phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={cn(
                        "w-full pl-12 pr-4 py-3 rounded-2xl border outline-none transition-all focus:ring-2 focus:ring-blue-500",
                        darkMode ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" : "bg-slate-50 border-slate-100 text-slate-900"
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {members
                    .filter(m => 
                      m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      m.phone.includes(searchTerm)
                    )
                    .map((m) => (
                    <motion.div 
                      layout
                      key={m.id}
                      className={cn(
                        "p-5 rounded-3xl border transition-all hover:shadow-md group",
                        darkMode ? "bg-slate-900 border-slate-800 hover:border-slate-700" : "bg-white border-slate-100 shadow-sm hover:border-slate-200"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black transition-colors",
                          m.isWinner 
                            ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" 
                            : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                        )}>
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={cn("font-bold text-lg truncate", darkMode ? "text-white" : "text-slate-900")}>{m.name}</h3>
                          <div className="flex items-center gap-2 text-slate-500 text-sm">
                            <Phone className="w-3 h-3" />
                            <span>{m.phone}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {m.isWinner ? (
                            <div className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                              <Trophy className="w-3 h-3" />
                              Winner
                            </div>
                          ) : (
                            <div className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-wider">
                              Active
                            </div>
                          )}
                        </div>
                      </div>
                      <div className={cn("mt-4 pt-4 border-t flex items-center justify-between text-xs", darkMode ? "border-slate-800" : "border-slate-50")}>
                        <span className="text-slate-500">Joined {safeFormatDate(m.createdAt, 'MMM d, yyyy')}</span>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setEditingMember(m);
                              setIsEditingMember(true);
                            }}
                            className={cn("p-2 rounded-xl transition-colors", darkMode ? "bg-slate-800 text-blue-400 hover:bg-slate-700" : "bg-blue-50 text-blue-600 hover:bg-blue-100")}
                            title="Edit Member"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => deleteMember(m.id)}
                            className={cn("p-2 rounded-xl transition-colors", darkMode ? "bg-slate-800 text-red-400 hover:bg-slate-700" : "bg-red-50 text-red-600 hover:bg-red-100")}
                            title="Delete Member"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {members.filter(m => 
                  m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  m.phone.includes(searchTerm)
                ).length === 0 && (
                  <div className={cn("p-20 text-center rounded-3xl border-2 border-dashed transition-colors", darkMode ? "border-slate-800" : "border-slate-100")}>
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">No members found matching your search.</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'deposits' && (
              <motion.div 
                key="deposits"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center shadow-inner">
                      <History className="w-7 h-7 text-emerald-600" />
                    </div>
                    <div>
                      <h2 className={cn("text-2xl md:text-3xl font-black tracking-tight", darkMode ? "text-white" : "text-slate-900")}>Deposit Tracker</h2>
                      <p className="text-slate-500 text-sm font-medium">Track daily contributions for the current cycle</p>
                    </div>
                    <button 
                      onClick={() => {
                        // In localStorage mode, data is already in state
                      }}
                      className={cn("p-2.5 rounded-xl transition-all hover:rotate-180 duration-500", darkMode ? "bg-slate-800 text-slate-400 hover:bg-slate-700" : "bg-slate-100 text-slate-500 hover:bg-slate-200")}
                      title="Refresh Data"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <div className={cn("flex-1 lg:flex-none flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all shadow-sm", darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100")}>
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <span className={cn("font-bold text-sm", darkMode ? "text-white" : "text-slate-900")}>{format(new Date(), 'MMMM yyyy')}</span>
                    </div>
                  </div>
                </div>

                {/* Deposit Summary Cards */}
                <div className="grid grid-cols-1 gap-4">
                  <div className={cn("p-5 rounded-3xl border transition-all", darkMode ? "bg-slate-900/50 border-slate-800" : "bg-amber-50/50 border-amber-100")}>
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Cycle Progress</p>
                    <div className="flex items-center gap-3">
                      <p className={cn("text-2xl font-black", darkMode ? "text-white" : "text-slate-900")}>{daysPassed}/10</p>
                      <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500" style={{ width: `${cycleProgress}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search member in tracker..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={cn(
                        "w-full pl-12 pr-4 py-3.5 rounded-2xl border outline-none transition-all font-medium",
                        darkMode ? "bg-slate-900 border-slate-800 text-white focus:border-blue-500" : "bg-white border-slate-100 text-slate-900 focus:border-blue-500 shadow-sm"
                      )}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" /> Paid
                    <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-800 ml-2" /> Unpaid
                  </div>
                </div>

                <div className={cn("rounded-[2.5rem] shadow-xl border overflow-hidden transition-all", darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100")}>
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left min-w-[900px] border-collapse">
                      <thead>
                        <tr className={cn("transition-colors", darkMode ? "bg-slate-800/50" : "bg-slate-50/50")}>
                          <th className={cn("px-8 py-6 text-sm font-black text-slate-500 uppercase tracking-widest sticky left-0 z-20 transition-colors border-b", darkMode ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-100")}>
                            Member Name
                          </th>
                          {Array.from({ length: 10 }).map((_, i) => {
                            const d = addDays(lastLotteryDate, i + 1);
                            const isToday = isSameDay(d, new Date());
                            return (
                              <th key={i} className={cn("px-4 py-6 text-center border-b transition-colors", darkMode ? "border-slate-700" : "border-slate-100", isToday && "bg-blue-500/5")}>
                                <div className={cn("flex flex-col items-center", isToday ? "text-blue-600" : "text-slate-500")}>
                                  <span className="text-[10px] font-black uppercase tracking-tighter">{format(d, 'EEE')}</span>
                                  <span className="text-lg font-black leading-none">{format(d, 'd')}</span>
                                  {isToday && <div className="w-1 h-1 bg-blue-600 rounded-full mt-1" />}
                                </div>
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody className={cn("divide-y transition-colors", darkMode ? "divide-slate-800" : "divide-slate-100")}>
                        {members.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase())).map((m) => (
                          <tr key={m.id} className={cn("group transition-colors", darkMode ? "hover:bg-slate-800/30" : "hover:bg-blue-50/30")}>
                            <td className={cn("px-8 py-5 font-bold sticky left-0 z-10 transition-colors border-r", darkMode ? "bg-slate-900 text-white border-slate-800" : "bg-white text-slate-900 border-slate-50")}>
                              <div className="flex items-center gap-3">
                                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-black", darkMode ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500")}>
                                  {m.name.charAt(0)}
                                </div>
                                {m.name}
                              </div>
                            </td>
                            {Array.from({ length: 10 }).map((_, i) => {
                              const d = addDays(lastLotteryDate, i + 1);
                              const dateStr = format(d, 'yyyy-MM-dd');
                              const isPaid = payments.some(p => p.userId === m.id && p.date === dateStr && !p.isProcessed);
                              const isProcessing = processingPayments[`${m.id}-${dateStr}`];
                              const isToday = isSameDay(d, new Date());
                              
                              return (
                                <td key={i} className={cn("px-4 py-5 text-center transition-colors", isToday && "bg-blue-500/5")}>
                                  <button 
                                    disabled={isProcessing}
                                    onClick={() => togglePayment(m.id, dateStr)}
                                    className={cn(
                                      "w-12 h-12 rounded-2xl flex items-center justify-center mx-auto transition-all duration-500 transform active:scale-95 group/btn",
                                      isPaid 
                                        ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/40 ring-2 ring-emerald-500/20" 
                                        : darkMode 
                                          ? "bg-slate-800/50 text-slate-700 hover:bg-slate-800 hover:text-slate-500 border border-slate-800" 
                                          : "bg-slate-50 text-slate-200 hover:bg-slate-100 hover:text-slate-400 border border-slate-100",
                                      isProcessing && "animate-pulse opacity-50"
                                    )}
                                  >
                                    {isProcessing ? (
                                      <RefreshCw className="w-5 h-5 animate-spin" />
                                    ) : isPaid ? (
                                      <div className="flex flex-col items-center justify-center">
                                        <Banknote className="w-5 h-5 mb-0.5 drop-shadow-sm" />
                                        <span className="text-[8px] font-black tracking-tighter leading-none">৳100</span>
                                      </div>
                                    ) : (
                                      <div className="relative">
                                        <Plus className="w-6 h-6 transition-transform group-hover/btn:rotate-90" />
                                        <div className="absolute -inset-1 bg-blue-500/0 group-hover/btn:bg-blue-500/5 rounded-full transition-all" />
                                      </div>
                                    )}
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                    {members.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase())).map((m) => (
                      <div key={m.id} className="p-6 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black", darkMode ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500")}>
                            {m.name.charAt(0)}
                          </div>
                          <h3 className={cn("font-bold text-lg", darkMode ? "text-white" : "text-slate-900")}>{m.name}</h3>
                        </div>
                        
                        <div className="grid grid-cols-5 gap-2">
                          {Array.from({ length: 10 }).map((_, i) => {
                            const d = addDays(lastLotteryDate, i + 1);
                            const dateStr = format(d, 'yyyy-MM-dd');
                            const isPaid = payments.some(p => p.userId === m.id && p.date === dateStr && !p.isProcessed);
                            const isProcessing = processingPayments[`${m.id}-${dateStr}`];
                            const isToday = isSameDay(d, new Date());
                            
                            return (
                              <div key={i} className="flex flex-col items-center gap-1">
                                <span className={cn("text-[9px] font-bold uppercase", isToday ? "text-blue-600" : "text-slate-400")}>
                                  {format(d, 'd')}
                                </span>
                                <button 
                                  disabled={isProcessing}
                                  onClick={() => togglePayment(m.id, dateStr)}
                                  className={cn(
                                    "w-full aspect-square rounded-xl flex items-center justify-center transition-all duration-500 transform active:scale-90",
                                    isPaid 
                                      ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-md shadow-emerald-500/20" 
                                      : darkMode 
                                        ? "bg-slate-800/50 text-slate-700 border border-slate-800" 
                                        : "bg-slate-50 text-slate-200 border border-slate-100",
                                    isProcessing && "animate-pulse opacity-50",
                                    isToday && !isPaid && "ring-2 ring-blue-500/30"
                                  )}
                                >
                                  {isProcessing ? (
                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                  ) : isPaid ? (
                                    <Banknote className="w-4 h-4" />
                                  ) : (
                                    <Plus className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                  {members.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                    <div className="py-20 text-center">
                      <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500 font-medium">No members found matching your search.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'lottery' && (
              <motion.div 
                key="lottery"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="h-full flex flex-col items-center justify-center gap-6 sm:gap-10 py-6 sm:py-10"
              >
                <div className="text-center space-y-2 sm:space-y-4">
                  <h2 className={cn("text-2xl sm:text-3xl md:text-4xl font-black", darkMode ? "text-white" : "text-gray-900")}>Lottery Wheel</h2>
                  <div className="flex flex-col items-center gap-1 sm:gap-2">
                    <p className="text-gray-500 text-base sm:text-lg">Current Pot: <span className="text-blue-600 font-bold">৳{currentBalance}</span></p>
                    <div className="px-3 py-1 sm:px-4 sm:py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs sm:text-sm font-bold border border-blue-100 dark:border-blue-800">
                      Cycle: Day {daysPassed} of 10
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <motion.div 
                    animate={{ rotate: wheelRotation }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className={cn(
                      "w-64 h-64 sm:w-72 sm:h-72 md:w-96 md:h-96 rounded-full border-[8px] sm:border-[12px] shadow-2xl flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500",
                      darkMode ? "border-slate-800 bg-slate-900" : "border-white bg-white",
                      isLotteryRunning && "scale-105 shadow-blue-500/20"
                    )}
                  >
                    {/* Wheel Segments Decoration */}
                    <div className="absolute inset-0 opacity-20">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div 
                          key={i}
                          className="absolute top-1/2 left-1/2 w-full h-0.5 bg-blue-500 origin-left"
                          style={{ transform: `rotate(${i * 30}deg)` }}
                        />
                      ))}
                    </div>

                    <div className={cn(
                      "w-full h-full rounded-full flex flex-col items-center justify-center relative z-10 bg-gradient-to-br from-blue-600 to-indigo-700 text-white",
                      !isLotteryRunning && "bg-none"
                    )}>
                      {!isLotteryRunning && (
                        <div className={cn(
                          "absolute inset-1.5 sm:inset-2 rounded-full flex flex-col items-center justify-center",
                          darkMode ? "bg-slate-900" : "bg-slate-50"
                        )}>
                          <Trophy className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-amber-500 mb-2 sm:mb-4 drop-shadow-lg" />
                          <p className={cn("text-[10px] sm:text-xs font-black uppercase tracking-widest opacity-60", darkMode ? "text-slate-400" : "text-slate-500")}>
                            {daysRemaining > 0 ? `${daysRemaining} Days Remaining` : 'Ready for Draw'}
                          </p>
                        </div>
                      )}

                      {isLotteryRunning && (
                        <div className="text-center px-4 sm:px-8">
                          <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] mb-1 sm:mb-2 text-blue-200 animate-pulse">Selecting Winner</p>
                          <p className="text-xl sm:text-2xl md:text-4xl font-black truncate max-w-full drop-shadow-md">{shufflingName}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Pointer */}
                  <div className={cn(
                    "absolute -top-4 sm:-top-6 left-1/2 -translate-x-1/2 w-8 h-10 sm:w-10 sm:h-14 bg-amber-500 rounded-b-2xl sm:rounded-b-3xl shadow-xl z-30 border-x-2 sm:border-x-4 flex items-end justify-center pb-1 sm:pb-2",
                    darkMode ? "border-slate-800" : "border-white"
                  )}>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-ping" />
                  </div>

                  {/* Outer Ring Decoration */}
                  <div className="absolute -inset-4 border-2 border-dashed border-blue-500/20 rounded-full animate-[spin_20s_linear_infinite]" />
                </div>

                <div className="flex flex-col items-center gap-3 sm:gap-4">
                  <button 
                    disabled={isLotteryRunning || members.length === 0}
                    onClick={runLottery}
                    className="px-8 py-4 sm:px-12 sm:py-5 bg-blue-600 text-white rounded-2xl font-black text-lg sm:text-xl shadow-xl shadow-blue-900/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100"
                  >
                    {isLotteryRunning ? 'Drawing Winner...' : 'Draw Lottery Now'}
                  </button>
                  {daysRemaining > 0 ? (
                    <p className="text-amber-600 font-bold text-xs sm:text-sm flex items-center gap-2">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                      Normal cycle: {daysRemaining} days remaining
                    </p>
                  ) : (
                    <p className="text-emerald-600 font-bold text-xs sm:text-sm flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      Lottery is ready for draw!
                    </p>
                  )}

                  {/* Manual Winner Selection */}
                  <div className="mt-6 w-full max-w-xs text-center">
                    <label className={cn("block text-[10px] font-black mb-2 uppercase tracking-[0.2em] opacity-60", darkMode ? "text-slate-400" : "text-slate-500")}>
                      Manual Winner Selection
                    </label>
                    {members.filter(m => !m.isWinner).length > 0 ? (
                      <button 
                        onClick={() => setIsManualSelectionOpen(true)}
                        disabled={isLotteryRunning}
                        className={cn(
                          "w-full px-4 py-3 rounded-2xl border font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50",
                          darkMode ? "bg-slate-800 border-slate-700 text-blue-400 hover:bg-slate-700" : "bg-white border-slate-100 text-blue-600 hover:bg-blue-50"
                        )}
                      >
                        <Users className="w-4 h-4" />
                        Select Winner Manually
                      </button>
                    ) : (
                      <button 
                        onClick={resetCycle}
                        disabled={isResettingCycle}
                        className={cn(
                          "w-full px-4 py-3 rounded-2xl border font-bold text-sm transition-all flex items-center justify-center gap-2",
                          darkMode ? "bg-slate-800 border-slate-700 text-blue-400 hover:bg-slate-700" : "bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-100"
                        )}
                      >
                        {isResettingCycle ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        Reset Cycle for New Draw
                      </button>
                    )}
                    <p className="text-[10px] text-slate-400 mt-2 italic">Only members who haven't won this cycle are listed.</p>
                  </div>
                </div>

                {/* Manual Selection Modal */}
                <AnimatePresence>
                  {isManualSelectionOpen && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    >
                      <motion.div 
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        className={cn("p-6 sm:p-8 rounded-[2.5rem] shadow-2xl max-w-md w-full transition-colors relative overflow-hidden flex flex-col max-h-[80vh]", darkMode ? "bg-slate-900 border border-slate-800" : "bg-white")}
                      >
                        <div className="absolute top-0 left-0 w-full h-2 bg-blue-600" />
                        <div className="flex justify-between items-center mb-6">
                          <div>
                            <h3 className={cn("text-xl sm:text-2xl font-black tracking-tight", darkMode ? "text-white" : "text-slate-900")}>Select Winner</h3>
                            <p className="text-slate-500 text-xs sm:text-sm">Choose a member to manually assign the pot</p>
                          </div>
                          <button 
                            onClick={() => setIsManualSelectionOpen(false)}
                            className={cn("p-2 rounded-xl transition-colors", darkMode ? "bg-slate-800 text-slate-400 hover:text-white" : "bg-slate-100 text-slate-500 hover:text-slate-900")}
                          >
                            <XCircle className="w-6 h-6" />
                          </button>
                        </div>

                        <div className="relative mb-4">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input 
                            type="text"
                            placeholder="Search members..."
                            value={manualSearchTerm}
                            onChange={(e) => setManualSearchTerm(e.target.value)}
                            className={cn(
                              "w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all focus:ring-2 focus:ring-blue-500 text-sm",
                              darkMode ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" : "bg-slate-50 border-slate-100 text-slate-900"
                            )}
                          />
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                          {members
                            .filter(m => !m.isWinner)
                            .filter(m => m.name.toLowerCase().includes(manualSearchTerm.toLowerCase()) || m.phone.includes(manualSearchTerm))
                            .map((m) => (
                              <button
                                key={m.id}
                                onClick={() => {
                                  setManualWinnerToConfirm(m);
                                  setIsManualSelectionOpen(false);
                                }}
                                className={cn(
                                  "w-full flex items-center justify-between p-4 rounded-2xl transition-all border",
                                  darkMode ? "bg-slate-800/50 border-slate-800 hover:bg-slate-800 hover:border-slate-700" : "bg-slate-50 border-slate-100 hover:bg-white hover:border-blue-200 hover:shadow-md"
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm", darkMode ? "bg-slate-900 text-slate-400" : "bg-white text-slate-400 shadow-sm")}>
                                    {m.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="text-left">
                                    <p className={cn("font-bold text-sm", darkMode ? "text-white" : "text-slate-900")}>{m.name}</p>
                                    <p className="text-[10px] text-slate-500 font-medium">{m.phone}</p>
                                  </div>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center">
                                  <Plus className="w-4 h-4 text-blue-600" />
                                </div>
                              </button>
                            ))}
                          {members.filter(m => !m.isWinner).length === 0 && (
                            <div className="text-center py-10">
                              <p className="text-slate-500 italic text-sm">No eligible members found.</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {manualWinnerToConfirm && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    >
                      <motion.div 
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        className={cn("p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center transition-colors", darkMode ? "bg-slate-900 border border-slate-800" : "bg-white")}
                      >
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                          <Trophy className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className={cn("text-xl font-black mb-2", darkMode ? "text-white" : "text-slate-900")}>Confirm Winner</h3>
                        <p className="text-slate-500 text-sm mb-8">
                          Are you sure you want to manually select <span className="font-bold text-blue-600">{manualWinnerToConfirm.name}</span> as the winner?
                        </p>
                        <div className="flex gap-3">
                          <button 
                            onClick={() => setManualWinnerToConfirm(null)}
                            className={cn("flex-1 py-4 rounded-2xl font-bold transition-all", darkMode ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200")}
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={() => {
                              if (manualWinnerToConfirm) {
                                manualWinnerSelect(manualWinnerToConfirm);
                              }
                            }}
                            className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20"
                          >
                            Confirm
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {lotteryWinner && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    >
                      <div className={cn("p-6 sm:p-10 rounded-3xl shadow-2xl max-w-md w-full text-center relative overflow-hidden transition-colors", darkMode ? "bg-slate-900" : "bg-white")}>
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400" />
                        <Trophy className="w-12 h-12 sm:w-20 sm:h-20 text-amber-500 mx-auto mb-4 sm:mb-6" />
                        <h3 className="text-lg sm:text-2xl font-bold text-gray-500 uppercase tracking-widest mb-1 sm:mb-2">Winner!</h3>
                        <p className={cn("text-2xl sm:text-4xl font-black mb-3 sm:mb-4", darkMode ? "text-white" : "text-gray-900")}>{lotteryWinner.name}</p>
                        <div className="bg-emerald-50 dark:bg-emerald-900/30 p-4 sm:p-6 rounded-2xl mb-4 sm:mb-6">
                          <p className="text-[10px] sm:text-sm text-emerald-600 dark:text-emerald-400 font-bold uppercase mb-1">Prize Amount</p>
                          <p className="text-3xl sm:text-5xl font-black text-emerald-700 dark:text-emerald-300">৳{lastPrizeWon}</p>
                        </div>
                        <div className="mb-6 sm:mb-8 p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-100 dark:border-blue-800">
                          <p className="text-blue-600 dark:text-blue-400 font-bold text-xs sm:text-sm">🔄 New 10-day cycle has started!</p>
                          <p className="text-gray-400 text-[10px] sm:text-xs mt-1">Next draw in 10 days</p>
                        </div>
                        <button 
                          onClick={() => setLotteryWinner(null)}
                          className={cn("w-full py-3 sm:py-4 rounded-2xl font-bold transition-all", darkMode ? "bg-slate-800 text-white hover:bg-slate-700" : "bg-gray-900 text-white hover:bg-gray-800")}
                        >
                          Awesome!
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div 
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 sm:space-y-8"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className={cn("text-2xl sm:text-3xl font-black tracking-tight", darkMode ? "text-white" : "text-slate-900")}>Transaction History</h2>
                  <div className={cn("px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-wider", darkMode ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-white border-slate-100 text-slate-500 shadow-sm")}>
                    Total Draws: {lotteryResults.length}
                  </div>
                </div>

                <div className={cn("rounded-[2rem] shadow-xl border overflow-hidden transition-all", darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100")}>
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className={cn("transition-colors border-b", darkMode ? "bg-slate-800/50 border-slate-700" : "bg-slate-50/50 border-slate-100")}>
                          <th className="px-8 py-6 text-sm font-black text-slate-500 uppercase tracking-widest">Winner</th>
                          <th className="px-8 py-6 text-sm font-black text-slate-500 uppercase tracking-widest">Amount Won</th>
                          <th className="px-8 py-6 text-sm font-black text-slate-500 uppercase tracking-widest text-right">Draw Date</th>
                        </tr>
                      </thead>
                      <tbody className={cn("divide-y transition-colors", darkMode ? "divide-slate-800" : "divide-gray-100")}>
                        {lotteryResults.map((res) => {
                          const winner = members.find(m => m.id === res.winnerId);
                          return (
                            <tr key={res.id} className={cn("group transition-colors", darkMode ? "hover:bg-slate-800/30" : "hover:bg-blue-50/30")}>
                              <td className="px-8 py-5">
                                <div className="flex items-center gap-3">
                                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black", darkMode ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500")}>
                                    {winner?.name.charAt(0).toUpperCase() || '?'}
                                  </div>
                                  <span className={cn("font-bold", darkMode ? "text-white" : "text-slate-900")}>{winner?.name || 'Unknown Member'}</span>
                                </div>
                              </td>
                              <td className="px-8 py-5">
                                <span className="text-emerald-600 font-black text-lg">৳{res.amountWon}</span>
                              </td>
                              <td className="px-8 py-5 text-right">
                                <span className="text-slate-500 text-sm font-medium">{safeFormatDate(res.drawDate, 'PPp')}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                    {lotteryResults.map((res) => {
                      const winner = members.find(m => m.id === res.winnerId);
                      return (
                        <div key={res.id} className="p-6 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center shadow-inner flex-shrink-0">
                              <Trophy className="w-6 h-6 text-amber-600" />
                            </div>
                            <div className="min-w-0">
                              <p className={cn("font-black truncate", darkMode ? "text-white" : "text-slate-900")}>{winner?.name || 'Unknown'}</p>
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{safeFormatDate(res.drawDate, 'MMM d, yyyy')}</p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-black text-emerald-600 text-lg leading-none mb-1">৳{res.amountWon}</p>
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">Amount Won</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {lotteryResults.length === 0 && (
                    <div className="py-20 text-center">
                      <History className="w-16 h-16 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
                      <p className="text-slate-500 font-medium">No transactions found yet.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
            {activeTab === 'settings' && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-4xl mx-auto w-full space-y-8 pb-10"
              >
                <div className="flex flex-col gap-1">
                  <h2 className={cn("text-3xl font-black tracking-tight", darkMode ? "text-white" : "text-slate-900")}>Settings</h2>
                  <p className="text-slate-500 font-medium">Manage your society preferences</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Society Info */}
                    <div className={cn("p-8 rounded-[2.5rem] shadow-xl border transition-all", darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100")}>
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center shadow-inner">
                          <Building2 className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className={cn("text-xl font-black", darkMode ? "text-white" : "text-slate-900")}>Society Info</h3>
                          <p className="text-slate-500 text-xs font-medium">Identity of your samity</p>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <div>
                          <label className={cn("block text-[10px] font-black mb-2 uppercase tracking-widest opacity-60", darkMode ? "text-slate-400" : "text-slate-500")}>Society Name</label>
                          <div className="relative">
                            <input 
                              type="text" 
                              value={societyName}
                              onChange={(e) => setSocietyName(e.target.value)}
                              placeholder="Enter society name..."
                              className={cn(
                                "w-full pl-4 pr-12 py-4 rounded-2xl border outline-none transition-all font-bold text-lg",
                                darkMode ? "bg-slate-800 border-slate-700 text-white focus:border-blue-500" : "bg-slate-50 border-slate-100 text-slate-900 focus:border-blue-500"
                              )}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                              <Wallet className="w-5 h-5 text-slate-400" />
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => updateSocietyName(societyName)}
                          disabled={isSavingName}
                          className={cn(
                            "w-full py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3 shadow-lg",
                            saveSuccess 
                              ? "bg-emerald-500 text-white shadow-emerald-500/20" 
                              : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20 active:scale-[0.98]"
                          )}
                        >
                          {isSavingName ? (
                            <RefreshCw className="w-5 h-5 animate-spin" />
                          ) : saveSuccess ? (
                            <>
                              <CheckCircle2 className="w-5 h-5" />
                              Changes Saved!
                            </>
                          ) : (
                            <>
                              <Save className="w-5 h-5" />
                              Update Society Name
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Appearance */}
                    <div className={cn("p-8 rounded-[2.5rem] shadow-xl border transition-all", darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100")}>
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center shadow-inner">
                          <Palette className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className={cn("text-xl font-black", darkMode ? "text-white" : "text-slate-900")}>Appearance</h3>
                          <p className="text-slate-500 text-xs font-medium">Visual preferences</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className={cn("flex items-center justify-between p-5 rounded-3xl border transition-all", darkMode ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-100")}>
                          <div className="flex items-center gap-4">
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", darkMode ? "bg-slate-700" : "bg-white shadow-sm")}>
                              {darkMode ? <Moon className="w-5 h-5 text-yellow-400" /> : <Sun className="w-5 h-5 text-orange-500" />}
                            </div>
                            <div>
                              <p className={cn("font-black text-sm", darkMode ? "text-white" : "text-slate-900")}>Dark Theme</p>
                              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-tighter">Toggle dark mode</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => setDarkMode(!darkMode)}
                            className={cn(
                              "w-14 h-8 rounded-full relative transition-all duration-500 p-1",
                              darkMode ? "bg-blue-600" : "bg-slate-300"
                            )}
                          >
                            <div className={cn(
                              "w-6 h-6 bg-white rounded-full transition-all duration-500 shadow-lg transform",
                              darkMode ? "translate-x-6" : "translate-x-0"
                            )} />
                          </button>
                        </div>

                        <div className="p-5 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center">
                          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">More themes coming soon</p>
                        </div>
                      </div>
                    </div>

                    {/* Danger Zone */}
                    <div className={cn("p-8 rounded-[2.5rem] shadow-xl border transition-all md:col-span-2 relative overflow-hidden", darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100")}>
                      <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center shadow-inner">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                          </div>
                          <div className="text-center sm:text-left">
                            <h3 className={cn("text-xl font-black", darkMode ? "text-white" : "text-slate-900")}>Danger Zone</h3>
                            <p className="text-slate-500 text-xs font-medium">Irreversible actions for your society data</p>
                          </div>
                        </div>
                        <button 
                          disabled={isResetting}
                          onClick={resetApp}
                          className="w-full sm:w-auto px-8 py-4 bg-red-500 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 active:scale-95 disabled:opacity-50"
                        >
                          {isResetting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                          Reset Entire Application
                        </button>
                      </div>
                      <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20">
                        <p className="text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2">
                          <Info className="w-4 h-4" />
                          Warning: This will permanently delete all members, payments, and lottery results.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Edit Member Modal */}
        <AnimatePresence>
          {isEditingMember && editingMember && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className={cn("p-8 rounded-[2.5rem] shadow-2xl max-w-md w-full transition-colors relative overflow-hidden", darkMode ? "bg-slate-900 border border-slate-800" : "bg-white")}
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-blue-600" />
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                    <Edit className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className={cn("text-2xl font-black tracking-tight", darkMode ? "text-white" : "text-slate-900")}>Edit Member</h3>
                    <p className="text-slate-500 text-sm">Update member information</p>
                  </div>
                </div>

                <form onSubmit={updateMember} className="space-y-5">
                  <div className="space-y-2">
                    <label className={cn("block text-sm font-bold ml-1", darkMode ? "text-slate-400" : "text-slate-700")}>Full Name</label>
                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        required
                        type="text" 
                        value={editingMember.name}
                        onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                        className={cn(
                          "w-full pl-12 pr-4 py-4 border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium",
                          darkMode ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-600" : "bg-slate-50 border-slate-100 text-slate-900"
                        )}
                        placeholder="e.g. Rahim Ahmed"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className={cn("block text-sm font-bold ml-1", darkMode ? "text-slate-400" : "text-slate-700")}>Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        required
                        type="tel" 
                        value={editingMember.phone}
                        onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                        className={cn(
                          "w-full pl-12 pr-4 py-4 border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium",
                          darkMode ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-600" : "bg-slate-50 border-slate-100 text-slate-900"
                        )}
                        placeholder="017XXXXXXXX"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-6">
                    <button 
                      type="button"
                      onClick={() => {
                        setIsEditingMember(false);
                        setEditingMember(null);
                      }}
                      className={cn(
                        "flex-1 py-4 rounded-2xl font-bold transition-all",
                        darkMode ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      )}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/30 active:scale-95"
                    >
                      Update Member
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Member Modal */}
        <AnimatePresence>
          {isAddingMember && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className={cn("p-8 rounded-[2.5rem] shadow-2xl max-w-md w-full transition-colors relative overflow-hidden", darkMode ? "bg-slate-900 border border-slate-800" : "bg-white")}
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-blue-600" />
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                    <UserPlus className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className={cn("text-2xl font-black tracking-tight", darkMode ? "text-white" : "text-slate-900")}>New Member</h3>
                    <p className="text-slate-500 text-sm">Add a new person to the society</p>
                  </div>
                </div>

                <form onSubmit={addMember} className="space-y-5">
                  <div className="space-y-2">
                    <label className={cn("block text-sm font-bold ml-1", darkMode ? "text-slate-400" : "text-slate-700")}>Full Name</label>
                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        required
                        type="text" 
                        value={newMember.name}
                        onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                        className={cn(
                          "w-full pl-12 pr-4 py-4 border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium",
                          darkMode ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-600" : "bg-slate-50 border-slate-100 text-slate-900"
                        )}
                        placeholder="e.g. Rahim Ahmed"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className={cn("block text-sm font-bold ml-1", darkMode ? "text-slate-400" : "text-slate-700")}>Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        required
                        type="tel" 
                        value={newMember.phone}
                        onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                        className={cn(
                          "w-full pl-12 pr-4 py-4 border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium",
                          darkMode ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-600" : "bg-slate-50 border-slate-100 text-slate-900"
                        )}
                        placeholder="017XXXXXXXX"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-6">
                    <button 
                      type="button"
                      onClick={() => setIsAddingMember(false)}
                      className={cn(
                        "flex-1 py-4 rounded-2xl font-bold transition-all",
                        darkMode ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      )}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/30 active:scale-95"
                    >
                      Save Member
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Confirmation Modal */}
        <AnimatePresence>
          {confirmDialog.isOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className={cn("p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center transition-colors", darkMode ? "bg-slate-900 border border-slate-800" : "bg-white")}
              >
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6",
                  confirmDialog.type === 'danger' ? "bg-red-100 dark:bg-red-900/30" : "bg-blue-100 dark:bg-blue-900/30"
                )}>
                  {confirmDialog.type === 'danger' ? (
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  ) : (
                    <CheckCircle2 className="w-8 h-8 text-blue-600" />
                  )}
                </div>
                <h3 className={cn("text-xl font-black mb-2", darkMode ? "text-white" : "text-slate-900")}>{confirmDialog.title}</h3>
                <p className="text-slate-500 text-sm mb-8">{confirmDialog.message}</p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                    className={cn("flex-1 py-4 rounded-2xl font-bold transition-all", darkMode ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200")}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmDialog.onConfirm}
                    className={cn(
                      "flex-1 py-4 text-white rounded-2xl font-bold transition-all shadow-lg",
                      confirmDialog.type === 'danger' ? "bg-red-500 hover:bg-red-600 shadow-red-900/20" : "bg-blue-600 hover:bg-blue-700 shadow-blue-900/20"
                    )}
                  >
                    Confirm
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
}
