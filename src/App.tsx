/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './components/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  MapPin, 
  Calendar, 
  Users, 
  Wallet, 
  ChevronRight, 
  LogOut, 
  Compass, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  FileText,
  TrendingUp,
  Share2,
  Shield,
  ListChecks
} from 'lucide-react';
import { db, handleFirestoreError, OperationType, normalizeData } from './lib/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  doc, 
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs
} from 'firebase/firestore';
import { 
  Trip, 
  TripStatus, 
  ParticipantRole, 
  ParticipantStatus,
  Participant,
  Message,
  Task 
} from './types';
import { cn } from './lib/utils';
import { format, isValid } from 'date-fns';
import { APP_CONFIG } from './constants';
import { getTripRecommendations, Recommendation } from './services/geminiService';

// --- Components ---

function Toast({ message, type = 'info', onClear }: { message: string, type?: 'info' | 'success' | 'error', onClear: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClear, 3000);
    return () => clearTimeout(timer);
  }, [onClear]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: 50, x: '-50%' }}
      className={cn(
        "fixed bottom-12 left-1/2 z-[100] px-6 py-3 rounded-full text-xs font-mono uppercase tracking-widest shadow-2xl flex items-center gap-3 border backdrop-blur-xl",
        type === 'error' ? "bg-red-900/80 border-red-500 text-white" : 
        type === 'success' ? "bg-green-900/80 border-green-500 text-white" :
        "bg-brand/80 border-brand text-white"
      )}
    >
      {type === 'error' ? <AlertCircle className="w-4 h-4" /> : 
       type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : 
       <Compass className="w-4 h-4" />}
      {message}
    </motion.div>
  );
}

function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#050505] z-50">
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="text-brand flex flex-col items-center gap-4"
      >
        <Compass className="w-12 h-12" />
        <span className="font-serif italic text-2xl tracking-tighter">Tripgroup</span>
      </motion.div>
    </div>
  );
}

function Landing() {
  const { signIn } = useAuth();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-6">
      <div className="absolute inset-0 atmosphere opacity-30 pointer-events-none" />
      
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center max-w-4xl z-10"
      >
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="w-12 h-[1px] bg-white/20" />
          <span className="uppercase text-[10px] tracking-[0.4em] text-white/50 font-medium">Elevating Group Travel</span>
          <span className="w-12 h-[1px] bg-white/20" />
        </div>

        <h1 className="font-serif text-[15vw] md:text-[10vw] leading-[0.8] tracking-tighter mb-8">
          Trip<span className="italic text-brand text-gradient">group</span>
        </h1>

        <p className="text-white/60 md:text-xl font-light mb-12 max-w-2xl mx-auto leading-relaxed">
          The closed-loop ecosystem for group bookings. Handle payments, coordination, and documents without the chaos.
        </p>

        <button 
          onClick={signIn}
          className="group relative px-12 py-4 bg-white text-black font-medium overflow-hidden transition-transform active:scale-95"
        >
          <div className="absolute inset-0 bg-brand translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <span className="relative z-10 flex items-center gap-2">
            Start Your Adventure
            <ChevronRight className="w-4 h-4" />
          </span>
        </button>
      </motion.div>

      <div className="absolute bottom-12 flex flex-col items-center gap-2 text-white/20 uppercase text-[8px] tracking-[0.5em]">
        <span>Member of the Travel Guild</span>
        <div className="flex gap-4">
          <div className="w-2 h-2 rounded-full bg-white/10" />
          <div className="w-2 h-2 rounded-full bg-white/10" />
          <div className="w-2 h-2 rounded-full bg-white/10" />
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const { user, logout } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'info' | 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!user) return;
    
    // In production, we'd use a composite index and filter by participant userId
    // For this MVP, we fetch trips where user is admin or listen to all for visibility
    const q = query(
      collection(db, 'trips'),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTrips = snapshot.docs
        .map(doc => normalizeData<Trip>({ id: doc.id, ...doc.data() }))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setTrips(fetchedTrips);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'trips');
    });

    return () => unsubscribe();
  }, [user]);

  const copyTripLink = (id: string) => {
    const link = `${window.location.origin}/join/${id}`;
    navigator.clipboard.writeText(link);
    setToast({ message: "Invite Link Copied", type: 'success' });
  };

  if (selectedTrip) return <TripDetail trip={selectedTrip} onBack={() => setSelectedTrip(null)} />;

  return (
    <div className="min-h-screen px-6 py-12 max-w-7xl mx-auto border-grid">
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClear={() => setToast(null)} />}
      </AnimatePresence>

      <header className="flex justify-between items-end mb-24 relative">
        <div className="absolute -left-24 top-0 atmosphere opacity-20 w-96 h-96 blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-[1px] bg-brand/40" />
            <span className="micro-label">Welcome back, Captain</span>
          </div>
          <h2 className="editorial-title text-5xl md:text-8xl">{user?.displayName?.split(' ')[0]}</h2>
        </div>
        <div className="flex gap-4 relative z-10">
          <button 
            onClick={() => setIsCreating(true)}
            className="w-14 h-14 md:w-20 md:h-20 rounded-full border border-white/20 flex items-center justify-center hover:bg-brand hover:border-brand transition-all group shadow-xl shadow-brand/10"
          >
            <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
          </button>
          <button 
            onClick={logout}
            className="w-14 h-14 md:w-20 md:h-20 rounded-full border border-white/20 flex items-center justify-center hover:border-white/40 hover:bg-white/5 transition-all"
          >
            <LogOut className="w-5 h-5 opacity-40 hover:opacity-100" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        <AnimatePresence mode="popLayout">
          {trips.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-48 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-[3rem] bg-white/2"
            >
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 animate-float">
                <Compass className="w-10 h-10 text-brand" />
              </div>
              <p className="micro-label">No horizons discovered</p>
              <button 
                onClick={() => setIsCreating(true)}
                className="mt-8 px-8 py-3 bg-white text-black rounded-full font-bold uppercase text-[10px] tracking-widest hover:bg-brand hover:text-white transition-all shadow-2xl"
              >
                + Forge Your Path
              </button>
            </motion.div>
          ) : (
            trips.map((trip, idx) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: idx * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => setSelectedTrip(trip)}
                className="glass-card group cursor-pointer overflow-hidden p-10 flex flex-col gap-10 hover:border-brand/40 shadow-2xl"
              >
                <div className="flex justify-between items-start">
                  <div className="px-4 py-1.5 rounded-full bg-brand/10 border border-brand/20 text-brand text-[9px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-brand/5">
                    {trip.status}
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      copyTripLink(trip.id);
                    }}
                    className="p-2 text-white/20 hover:text-white transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex-1">
                  <h3 className="editorial-title text-4xl mb-4 group-hover:text-brand transition-all duration-500">{trip.name}</h3>
                  <div className="flex items-center gap-3 text-white/40 text-xs font-mono uppercase tracking-widest">
                    <MapPin className="w-3.5 h-3.5 text-brand" />
                    {trip.destination}
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex justify-between items-center text-[10px] uppercase tracking-[0.3em] font-mono font-bold">
                  <div className="flex items-center gap-2 text-white/30">
                    <Users className="w-3.5 h-3.5" />
                    <span>Group</span>
                  </div>
                  <div className="flex items-center gap-2 text-brand">
                    <Wallet className="w-3.5 h-3.5" />
                    <span>${trip.budget}pp</span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isCreating && (
          <CreateTripModal onClose={() => setIsCreating(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function CreateTripModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    destination: '',
    budget: 500,
    groupSize: 4,
    preferences: ''
  });
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);

  const handleNext = async () => {
    if (step === 1) {
      setLoadingAI(true);
      const suggestions = await getTripRecommendations(formData.groupSize, formData.budget, formData.destination || 'anywhere warm');
      setRecommendations(suggestions);
      setLoadingAI(false);
      setStep(2);
    }
  };

  const handleCreate = async (chosen?: Recommendation) => {
    if (!user) return;
    
    // Frontend validation
    if (formData.groupSize < APP_CONFIG.MIN_GROUP_SIZE || formData.groupSize > APP_CONFIG.MAX_GROUP_SIZE) {
      setError(`Group size must be between ${APP_CONFIG.MIN_GROUP_SIZE} and ${APP_CONFIG.MAX_GROUP_SIZE}`);
      return;
    }

    try {
      const tripData = {
        name: formData.name || (chosen ? `Trip to ${chosen.destination}` : 'New Adventure'),
        destination: chosen ? chosen.destination : formData.destination,
        budget: chosen ? chosen.estimatedCost : Number(formData.budget),
        groupSize: Number(formData.groupSize),
        participantCount: 1, // Start with admin
        status: TripStatus.PLANNING,
        adminId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        paidAmount: 0,
        totalAmountDue: 0
      };

      const docRef = await addDoc(collection(db, 'trips'), tripData);
      
      // Add admin as first participant
      await setDoc(doc(db, 'trips', docRef.id, 'participants', user.uid), {
        userId: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: ParticipantRole.ADMIN,
        status: ParticipantStatus.JOINED,
        paid: false,
        amountPaid: 0,
        joinedAt: serverTimestamp()
      });

      onClose();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'trips');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-xl"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-2xl glass-card overflow-hidden"
      >
        <div className="p-8 md:p-12">
          {step === 1 ? (
            <div className="space-y-10">
              <div>
                <h2 className="editorial-title text-5xl mb-4 italic">Design Your Journey</h2>
                <p className="text-white/30 text-sm max-w-md font-light leading-relaxed">Establish the core parameters of your exploration. Our intelligence layer will assist with the logistics.</p>
              </div>

              <div className="space-y-6">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs font-mono animate-pulse">
                    [ERROR] {error}
                  </div>
                )}
                <div className="relative">
                  <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-1 h-8 bg-brand rounded-full" />
                  <input 
                    autoFocus
                    placeholder="Journey Title (e.g. Aegean Sanctuary)"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 outline-none focus:border-brand focus:bg-brand/5 transition-all text-xl font-serif italic"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <input 
                  placeholder="Target Coordinate (or anywhere exotic)"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 outline-none focus:border-brand transition-all font-mono uppercase text-xs tracking-widest"
                  value={formData.destination}
                  onChange={e => setFormData({ ...formData, destination: e.target.value })}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="micro-label">Budget Allocation</span>
                      <span className="text-xl font-serif italic text-brand text-gradient tracking-tighter">${formData.budget}pp</span>
                    </div>
                    <div className="relative pt-2">
                      <input 
                        type="range" 
                        min="100" 
                        max="5000" 
                        step="100"
                        className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-brand"
                        value={formData.budget}
                        onChange={e => setFormData({ ...formData, budget: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="micro-label">Group Capacity</span>
                      <span className="text-xl font-serif italic text-brand text-gradient tracking-tighter">{formData.groupSize} People</span>
                    </div>
                    <div className="relative pt-2">
                      <input 
                        type="range" 
                        min={APP_CONFIG.MIN_GROUP_SIZE} 
                        max={APP_CONFIG.MAX_GROUP_SIZE} 
                        step="1"
                        className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-brand"
                        value={formData.groupSize}
                        onChange={e => setFormData({ ...formData, groupSize: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <button onClick={onClose} className="micro-label hover:text-white transition-colors">Abort Mission</button>
                <button 
                  onClick={handleNext}
                  disabled={loadingAI}
                  className="bg-brand text-white px-10 py-4 rounded-full font-bold uppercase text-[10px] tracking-[0.3em] hover:bg-brand/80 transition-all disabled:opacity-50 shadow-2xl shadow-brand/20 active:scale-95"
                >
                  {loadingAI ? 'Calculating...' : 'Scan For Suggestions'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div>
                <h2 className="font-serif text-4xl tracking-tighter mb-2 italic">AI Suggestions</h2>
                <p className="text-white/40 text-sm font-mono uppercase tracking-[0.2em]">Based on your budget and preferences</p>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {recommendations.map((rec, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => handleCreate(rec)}
                    className="p-6 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:border-brand hover:bg-brand/5 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-xl font-medium tracking-tight group-hover:text-brand transition-colors">{rec.destination}</h4>
                      <span className="text-brand font-mono text-sm">${rec.estimatedCost}pp</span>
                    </div>
                    <p className="text-white/50 text-sm mb-4 leading-relaxed">{rec.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {rec.activities.map((a, j) => (
                        <span key={j} className="text-[9px] uppercase tracking-wider bg-white/5 px-2 py-1 rounded text-white/30">{a}</span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <button onClick={() => setStep(1)} className="text-white/40 hover:text-white underline text-sm transition-colors font-mono uppercase tracking-widest">Back</button>
                <button 
                  onClick={() => handleCreate()}
                  className="text-white/60 hover:text-white transition-colors text-sm font-mono uppercase tracking-widest"
                >
                  Use my own plan
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function InsuranceUpsellModal({ onConfirm, onCancel, price }: { onConfirm: (withInsurance: boolean) => void, onCancel: () => void, price: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-md glass-card overflow-hidden"
      >
        <div className="p-8 md:p-10 text-center">
          <div className="w-20 h-20 bg-brand/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-brand" />
          </div>
          <h3 className="font-serif text-3xl tracking-tighter mb-4 italic">Protect Your Journey</h3>
          <p className="text-white/50 text-sm mb-4 leading-relaxed">
            Add comprehensive trip insurance for just <span className="text-white font-mono">${price}</span>.
            Covers cancellations, medical emergencies, and lost luggage.
          </p>
          <a 
            href="https://www.worldnomads.com/travel-insurance" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block mb-8 text-[10px] text-brand hover:underline font-mono uppercase tracking-widest"
          >
            View Policy Details
          </a>
          
          <div className="grid grid-cols-1 gap-3">
            <button 
              onClick={() => onConfirm(true)}
              className="w-full py-4 bg-brand text-white font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-brand/80 transition-all shadow-xl shadow-brand/20"
            >
              Add Protection (+${price})
            </button>
            <button 
              onClick={() => onConfirm(false)}
              className="w-full py-4 bg-white/5 text-white/40 font-bold uppercase text-[10px] tracking-widest rounded-xl hover:text-white transition-all"
            >
              No thanks, I'll take the risk
            </button>
          </div>
          <button onClick={onCancel} className="mt-6 text-[9px] uppercase tracking-widest text-white/20 hover:text-white/40 transition-colors">Go Back</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function TripDetail({ trip, onBack }: { trip: Trip, onBack: () => void }) {
  const { user } = useAuth();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'chat' | 'docs'>('overview');
  const [newMessage, setNewMessage] = useState('');
  const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskData, setTaskData] = useState({ title: '', description: '', dueDate: '' });
  const [toast, setToast] = useState<{ message: string, type: 'info' | 'success' | 'error' } | null>(null);

  useEffect(() => {
    const pUnsubscribe = onSnapshot(collection(db, 'trips', trip.id, 'participants'), (snap) => {
      setParticipants(snap.docs.map(d => normalizeData<Participant>({ id: d.id, ...d.data() })));
    });
    const mUnsubscribe = onSnapshot(
      query(collection(db, 'trips', trip.id, 'messages')), 
      (snap) => {
        setMessages(snap.docs.map(d => normalizeData<Message>({ id: d.id, ...d.data() })).sort((a,b) => (a.createdAt as number || 0) - (b.createdAt as number || 0)));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `trips/${trip.id}/messages`)
    );
    const tUnsubscribe = onSnapshot(collection(db, 'trips', trip.id, 'tasks'), (snap) => {
      setTasks(snap.docs.map(d => normalizeData<Task>({ id: d.id, ...d.data() })).sort((a,b) => (b.createdAt as number || 0) - (a.createdAt as number || 0)));
    });

    return () => {
      pUnsubscribe();
      mUnsubscribe();
      tUnsubscribe();
    };
  }, [trip.id]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;
    try {
      await addDoc(collection(db, 'trips', trip.id, 'messages'), {
        text: newMessage,
        userId: user.uid,
        userName: user.displayName,
        createdAt: serverTimestamp()
      });
      setNewMessage('');
    } catch (e) {
      console.error(e);
      setToast({ message: "Failed to send", type: 'error' });
    }
  };

  const createTask = async () => {
    if (!taskData.title.trim() || !user) return;
    try {
      await addDoc(collection(db, 'trips', trip.id, 'tasks'), {
        ...taskData,
        completed: false,
        createdBy: user.uid,
        createdAt: serverTimestamp()
      });
      setIsTaskModalOpen(false);
      setTaskData({ title: '', description: '', dueDate: '' });
      setToast({ message: "Task Created", type: 'success' });
    } catch (e) {
      console.error(e);
      setToast({ message: "Failed to create task", type: 'error' });
    }
  };

  const toggleTask = async (task: Task) => {
    try {
      await updateDoc(doc(db, 'trips', trip.id, 'tasks', task.id), {
        completed: !task.completed
      });
    } catch (e) {
      console.error(e);
    }
  };

  const joinTrip = async () => {
    if (!user) return;
    try {
      const { runTransaction, increment } = await import('firebase/firestore');
      await runTransaction(db, async (transaction) => {
        const tripRef = doc(db, 'trips', trip.id);
        const tripSnap = await transaction.get(tripRef);
        
        if (!tripSnap.exists()) throw new Error("Trip not found");
        const currentTrip = tripSnap.data() as Trip;
        
        // Use denormalized count for efficient scaling
        if ((currentTrip.participantCount || 0) >= currentTrip.groupSize) {
          throw new Error("This mission has reached maximum capacity.");
        }

        const participantRef = doc(db, 'trips', trip.id, 'participants', user.uid);
        
        // Atomically increment the count and create the participant record
        transaction.update(tripRef, { 
          participantCount: increment(1),
          updatedAt: serverTimestamp()
        });
        
        transaction.set(participantRef, {
          userId: user.uid,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: ParticipantRole.MEMBER,
          status: ParticipantStatus.JOINED,
          paid: false,
          amountPaid: 0,
          joinedAt: serverTimestamp()
        });
      });
      setToast({ message: "Welcome to the crew", type: 'success' });
    } catch (e: any) {
      if (e.code === 'permission-denied') {
        handleFirestoreError(e, OperationType.WRITE, `trips/${trip.id}/participants`);
      } else {
        setToast({ message: e.message || "Failed to join", type: 'error' });
      }
    }
  };

  const finalizeTrip = async () => {
    if (trip.adminId !== user?.uid) return;
    try {
      await updateDoc(doc(db, 'trips', trip.id), {
        status: TripStatus.CONFIRMED,
        updatedAt: serverTimestamp()
      });
      setToast({ message: "Journey Finalized", type: 'success' });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `trips/${trip.id}`);
    }
  };

  const copyTripLink = () => {
    const link = `${window.location.origin}/join/${trip.id}`;
    navigator.clipboard.writeText(link);
    setToast({ message: "Invite Link Copied", type: 'success' });
  };

  const handlePayment = async (withInsurance: boolean = false) => {
    if (!user) return;
    try {
      const pRef = doc(db, 'trips', trip.id, 'participants', user.uid);
      await updateDoc(pRef, {
        paid: true,
        amountPaid: trip.budget + (withInsurance ? 45 : 0),
        insuranceSelected: withInsurance,
        status: ParticipantStatus.JOINED
      });
      setIsInsuranceModalOpen(false);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'participant');
    }
  };

  const currentUserParticipant = participants.find(p => p.userId === user?.uid);

    const inviteLink = `${window.location.origin}/join/${trip.id}`;

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="min-h-screen bg-[#050505] border-grid">
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClear={() => setToast(null)} />}
      </AnimatePresence>
      
      {/* Editorial Header */}
      <div className="relative h-[50vh] md:h-[70vh] overflow-hidden flex items-end px-6 pb-20">
        <div className="absolute inset-0 atmosphere opacity-60" />
        <div className="absolute inset-0 bg-linear-to-t from-[#050505] via-[#050505]/40 to-transparent" />
        
        <div className="max-w-7xl mx-auto w-full z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <button 
              onClick={onBack}
              className="mb-12 flex items-center gap-3 text-white/40 hover:text-white transition-colors micro-label group"
            >
              <Plus className="w-3 h-3 rotate-45 group-hover:text-brand transition-colors" /> Back to Explorations
            </button>
            <h2 className="editorial-title text-7xl md:text-[8vw] text-gradient mb-8">
              {trip.name}
            </h2>
            <div className="flex flex-wrap items-center gap-8 micro-label font-bold">
              <div className="flex items-center gap-3 bg-white/5 py-2 px-4 rounded-full border border-white/10">
                <MapPin className="w-3.5 h-3.5 text-brand" />
                {trip.destination}
              </div>
              <div className="flex items-center gap-3 bg-white/5 py-2 px-4 rounded-full border border-white/10 text-white/60">
                <Calendar className="w-3.5 h-3.5 text-brand" />
                {trip.startDate ? format(new Date(trip.startDate), 'MMM dd, yyyy') : 'TBD'}
              </div>
              <div className="flex items-center gap-3 bg-brand/10 py-2 px-4 rounded-full border border-brand/20 text-brand">
                <Users className="w-3.5 h-3.5" />
                {participants.length} / {trip.groupSize} Members
              </div>
            </div>
          </motion.div>

          <div className="flex gap-4">
            {!currentUserParticipant ? (
              <button 
                onClick={joinTrip}
                disabled={trip.status !== TripStatus.PLANNING}
                className={cn(
                  "px-12 py-4 rounded-full font-bold uppercase text-[10px] tracking-[0.4em] transition-all shadow-2xl active:scale-95 flex items-center gap-2",
                  trip.status === TripStatus.PLANNING 
                    ? "bg-brand text-white hover:bg-brand/80 shadow-brand/30" 
                    : "bg-white/5 text-white/20 border border-white/5 cursor-not-allowed shadow-none"
                )}
              >
                {trip.status === TripStatus.PLANNING ? (
                  <><Plus className="w-4 h-4" /> Join Initiative</>
                ) : (
                  "Manifest Locked"
                )}
              </button>
            ) : (
              <>
                <button 
                  onClick={copyTripLink}
                  className="h-16 w-16 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-white/20 transition-all group"
                  title="Copy Invite Link"
                >
                  <Share2 className="w-6 h-6 text-white/40 group-hover:text-white transition-colors" />
                </button>
                {trip.adminId === user?.uid && trip.status === TripStatus.PLANNING && (
                  <button 
                    onClick={finalizeTrip}
                    className="px-10 py-4 bg-brand text-white rounded-full font-bold uppercase text-[10px] tracking-[0.3em] hover:bg-brand/80 transition-all shadow-2xl shadow-brand/30 active:scale-95"
                  >
                    Lock & Finalize
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex border-b border-white/5 mb-12">
          {[
            { id: 'overview', icon: TrendingUp, label: 'Overview' },
            { id: 'chat', icon: MessageSquare, label: 'Coordination' },
            { id: 'docs', icon: FileText, label: 'Documents' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-8 py-6 flex items-center gap-2 border-b-2 transition-all relative text-xs uppercase tracking-widest font-mono",
                activeTab === tab.id ? "border-brand text-white" : "border-transparent text-white/30 hover:text-white/60"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <motion.div
           key={activeTab}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           className="pb-24"
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-12">
                {/* Mission Checklist */}
                <div className="glass-card p-10 border-grid">
                  <div className="flex justify-between items-baseline mb-10">
                    <div>
                      <h3 className="editorial-title text-4xl italic mb-2 tracking-tighter">Mission Checklist</h3>
                      <p className="micro-label">Status: {tasks.filter(t => t.completed).length}/{tasks.length} Resolved</p>
                    </div>
                    <button 
                      onClick={() => setIsTaskModalOpen(true)}
                      className="text-brand hover:text-white transition-colors micro-label font-bold flex items-center gap-2"
                    >
                      <Plus className="w-3 h-3" /> Add Objective
                    </button>
                  </div>

                  <div className="space-y-4">
                    {tasks.length === 0 ? (
                      <div className="py-20 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-3xl bg-white/1 text-white/20">
                        <ListChecks className="w-8 h-8 mb-4 opacity-50" />
                        <p className="micro-label">No active objectives</p>
                      </div>
                    ) : (
                      tasks.map((task, idx) => (
                        <motion.div 
                          key={task.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => toggleTask(task)}
                          className={cn(
                            "group p-6 rounded-2xl border transition-all cursor-pointer flex items-center gap-6",
                            task.completed ? "bg-white/2 border-white/5 opacity-50" : "bg-white/5 border-white/10 hover:border-brand/40"
                          )}
                        >
                          <div className={cn(
                            "w-6 h-6 rounded-full border flex items-center justify-center transition-all",
                            task.completed ? "bg-brand border-brand text-white" : "border-white/20 group-hover:border-brand"
                          )}>
                            {task.completed && <CheckCircle2 className="w-4 h-4" />}
                          </div>
                          <div className="flex-1">
                            <h4 className={cn("text-lg font-light tracking-tight", task.completed && "line-through text-white/40")}>{task.title}</h4>
                            {task.dueDate && (
                              <div className="flex items-center gap-2 mt-1 micro-label text-[8px] opacity-40">
                                <Calendar className="w-2.5 h-2.5" /> Due: {isValid(new Date(task.dueDate)) ? format(new Date(task.dueDate), 'MMM dd') : 'Soon'}
                              </div>
                            )}
                          </div>
                          {task.description && (
                            <div className="text-[10px] text-white/30 font-mono italic max-w-[200px] truncate">
                              {task.description}
                            </div>
                          )}
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="glass-card p-6 border-l-4 border-l-brand">
                    <div className="text-white/40 text-[9px] font-mono uppercase tracking-widest mb-4">Group Budget</div>
                    <div className="text-3xl font-light">${trip.budget * participants.length}</div>
                    <div className="text-[10px] text-white/20 font-mono mt-2">${trip.budget} per person</div>
                  </div>
                  <div className="glass-card p-6 border-l-4 border-l-blue-500">
                    <div className="text-white/40 text-[9px] font-mono uppercase tracking-widest mb-4">Paid & Ready</div>
                    <div className="text-3xl font-light">{participants.filter(p => p.paid).length}/{participants.length}</div>
                    <div className="text-[10px] text-white/20 font-mono mt-2">People committed</div>
                  </div>
                  <div className="glass-card p-6 border-l-4 border-l-green-500">
                    <div className="text-white/40 text-[9px] font-mono uppercase tracking-widest mb-4">Status</div>
                    <div className="text-3xl font-light uppercase text-sm tracking-widest pt-2">{trip.status}</div>
                  </div>
                </div>

                {/* Insurance Upsell Banner */}
                {!currentUserParticipant?.paid && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-card p-8 bg-brand/10 border-brand/20 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative"
                  >
                    <div className="absolute -right-8 -top-8 text-brand/5">
                      <Shield className="w-48 h-48 rotate-12" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 text-brand font-mono text-[10px] uppercase tracking-[0.3em] mb-4">
                        <Shield className="w-4 h-4" /> Recommended Add-on
                      </div>
                      <h4 className="font-serif text-3xl tracking-tighter mb-2 italic">Travel with Confidence</h4>
                      <p className="text-white/50 text-sm max-w-md mb-4">Our premium Tripgroup Insurance covers everything from 100% cancellation refunds to medical care abroad.</p>
                      <a 
                        href="https://www.worldnomads.com/travel-insurance" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block text-[10px] text-brand hover:underline font-mono uppercase tracking-widest"
                      >
                        View Policy Details
                      </a>
                    </div>
                    <button 
                      onClick={() => setIsInsuranceModalOpen(true)}
                      className="relative z-10 px-8 py-3 bg-brand text-white rounded-full font-bold uppercase text-[10px] tracking-widest hover:bg-brand/80 transition-all whitespace-nowrap"
                    >
                      Insure for $45
                    </button>
                  </motion.div>
                )}


                {/* Progress */}
                <div className="glass-card p-8">
                  <div className="flex justify-between items-end mb-6">
                    <h4 className="font-serif text-2xl italic tracking-tight">Financial Health</h4>
                    <span className="text-brand font-mono text-sm">{Math.round((participants.filter(p => p.paid).length / participants.length) * 100 || 0)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-8">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(participants.filter(p => p.paid).length / participants.length) * 100 || 5}%` }}
                      className="h-full bg-brand shadow-[0_0_15px_rgba(255,99,33,0.5)]"
                    />
                  </div>
                  <div className="flex items-center gap-4 text-white/40 text-xs font-mono tracking-wider">
                    <AlertCircle className="w-4 h-4 text-brand" />
                    Deadline for split payments is 22nd July, 2026.
                  </div>
                </div>

                {/* Itinerary Preview (Static in MVP) */}
                <div>
                  <h4 className="text-white/20 uppercase text-[10px] tracking-[0.4em] font-mono mb-8">Proposed Itinerary</h4>
                  <div className="space-y-4">
                    {[1, 2, 3].map(day => (
                      <div key={day} className="flex gap-8 group">
                        <div className="text-brand font-mono text-xl pt-1">0{day}</div>
                        <div className="pb-8 border-b border-white/5 flex-1">
                          <h5 className="text-lg font-medium mb-2 group-hover:text-brand transition-colors">Morning at the Cathedral & Markets</h5>
                          <p className="text-white/40 text-sm leading-relaxed">Relaxed breakfast followed by a guided tour of the historical district. Meeting at 9:00 AM in the lobby.</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-12">
                {/* Participants */}
                <div>
                  <h4 className="text-white/20 uppercase text-[10px] tracking-[0.4em] font-mono mb-6">Explorers</h4>
                  <div className="space-y-4">
                    {participants.map(p => (
                      <div key={p.userId} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-transparent hover:border-white/10 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/10">
                            {p.photoURL ? <img src={p.photoURL} alt={p.displayName} /> : <Users className="w-4 h-4 text-white/20" />}
                          </div>
                          <div>
                            <div className="text-sm font-medium">{p.displayName}</div>
                            <div className={cn("text-[9px] uppercase tracking-widest font-mono", p.role === 'admin' ? 'text-brand' : 'text-white/30')}>
                              {p.role}
                            </div>
                          </div>
                        </div>
                        {p.paid ? (
                          <div className="flex items-center gap-2">
                            {p.insuranceSelected && <Shield className="w-4 h-4 text-brand" title="Insured" />}
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            {p.userId === user?.uid && (
                              <button 
                                onClick={() => setIsInsuranceModalOpen(true)}
                                className="text-[9px] uppercase tracking-widest font-bold text-brand hover:underline"
                              >
                                Pay Now
                              </button>
                            )}
                            <Clock className="w-4 h-4 text-white/10" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Admin Quick Action */}
                <div className="p-8 bg-brand/5 border border-brand/20 rounded-3xl">
                  <h5 className="font-serif text-xl italic mb-4">Trip Admin Tools</h5>
                  <p className="text-white/50 text-xs mb-6 leading-relaxed">As the organizer, you can finalize bookings and trigger automated payment collection once the group threshold is met.</p>
                  <button className="w-full py-3 bg-white text-black font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-brand hover:text-white transition-all">
                    Finalize Bookings
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="flex flex-col h-[70vh] glass-card overflow-hidden">
               <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-white/2 border-grid">
                 <div className="flex justify-center mb-8">
                    <button 
                      onClick={() => setIsTaskModalOpen(true)}
                      className="px-6 py-2 bg-brand/10 border border-brand/20 text-brand rounded-full micro-label font-bold hover:bg-brand hover:text-white transition-all shadow-xl shadow-brand/10"
                    >
                      + Create Mission Objective
                    </button>
                 </div>
                 {messages.length === 0 && (
                   <div className="h-full flex flex-col items-center justify-center text-white/10 italic">
                     <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 animate-float">
                       <MessageSquare className="w-6 h-6 text-brand" />
                     </div>
                     <p className="micro-label">Channel secured. Waiting for data.</p>
                   </div>
                 )}
                 {messages.map((m, idx) => (
                   <motion.div 
                    key={m.id} 
                    initial={{ opacity: 0, x: m.userId === user?.uid ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={cn("flex flex-col max-w-[70%]", m.userId === user?.uid ? "ml-auto items-end" : "items-start")}
                   >
                     <div className="flex items-center gap-3 mb-2 px-2">
                        {m.userId !== user?.uid && (
                          <div className="w-6 h-6 rounded-full bg-brand/20 flex items-center justify-center text-[10px] font-bold text-brand border border-brand/20">
                            {getInitials(m.userName || 'U')}
                          </div>
                        )}
                        <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">{m.userName}</span>
                        {m.createdAt && (
                          <span className="text-[8px] font-mono text-white/10 uppercase">
                            {format(m.createdAt as number || Date.now(), 'HH:mm')}
                          </span>
                        )}
                     </div>
                     <div className={cn(
                       "px-6 py-4 rounded-3xl text-sm leading-relaxed shadow-xl",
                       m.userId === user?.uid ? "bg-brand text-white rounded-tr-none shadow-brand/10" : "bg-white/10 text-white/80 rounded-tl-none"
                     )}>
                       {m.text}
                     </div>
                   </motion.div>
                 ))}
               </div>
               <div className="p-8 border-t border-white/5 bg-white/5 flex gap-6">
                  <input 
                    placeholder="Establish secure connection..."
                    className="flex-1 bg-transparent outline-none text-sm font-light tracking-wide placeholder:text-white/20"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  />
                  <button 
                    onClick={sendMessage}
                    className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:bg-brand hover:text-white transition-all shadow-xl active:scale-90"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
               </div>
            </div>
          )}

          {activeTab === 'docs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="glass-card p-12 border-dashed border-white/10 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-brand/40 transition-all">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:bg-brand/10 transition-colors">
                  <Plus className="w-6 h-6 text-white/20 group-hover:text-brand transition-colors" />
                </div>
                <h5 className="font-serif text-xl mb-2 italic">Upload Documents</h5>
                <p className="text-white/30 text-xs max-w-[200px]">Add tickets, hotel vouchers, or excursion confirmations.</p>
              </div>
              
              {/* Fake doc example */}
              <div className="glass-card p-8 group overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
                <FileText className="w-8 h-8 text-brand mb-6" />
                <h5 className="text-lg font-medium mb-1">Flight ET-882</h5>
                <p className="text-white/40 text-[10px] uppercase tracking-widest font-mono mb-6">Boarding Pass PDF</p>
                <button className="w-full py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                  Download
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {isTaskModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-black/60"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="glass-card w-full max-w-md p-10 shadow-2xl relative overflow-hidden bg-[#050505] border-white/10"
            >
              <div className="absolute inset-0 atmosphere opacity-20" />
              <div className="relative z-10">
                <h3 className="editorial-title text-4xl mb-6 italic">New Objective</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="micro-label">Title</label>
                    <input 
                      autoFocus
                      placeholder="e.g. Confirm Flight Transfers"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 outline-none focus:border-brand transition-all text-white"
                      value={taskData.title}
                      onChange={e => setTaskData({ ...taskData, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="micro-label">Details</label>
                    <textarea 
                      placeholder="Add specific instructions..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 outline-none focus:border-brand transition-all h-24 resize-none text-white"
                      value={taskData.description}
                      onChange={e => setTaskData({ ...taskData, description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="micro-label">Deadline</label>
                    <input 
                      type="date"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 outline-none focus:border-brand transition-all font-mono uppercase text-xs text-white"
                      value={taskData.dueDate}
                      onChange={e => setTaskData({ ...taskData, dueDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center pt-10">
                  <button onClick={() => setIsTaskModalOpen(false)} className="micro-label hover:text-white transition-colors">Abort</button>
                  <button 
                    onClick={createTask}
                    className="bg-brand text-white px-10 py-4 rounded-full font-bold uppercase text-[10px] tracking-widest hover:bg-brand/80 transition-all shadow-xl shadow-brand/20 active:scale-95"
                  >
                    Forge Task
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        {isInsuranceModalOpen && (
          <InsuranceUpsellModal 
            price={APP_CONFIG.INSURANCE_PRICE} 
            onConfirm={(withInsurance) => handlePayment(withInsurance)} 
            onCancel={() => setIsInsuranceModalOpen(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Main() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <div className="selection:bg-brand selection:text-white">
      {!user ? <Landing /> : <Dashboard />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Main />
    </AuthProvider>
  );
}
