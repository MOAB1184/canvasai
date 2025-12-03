'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutGrid, BookOpen, Calendar as CalendarIcon, Bell, Settings, Search, 
  Eye, EyeOff, Clock, ChevronRight, ArrowRight,
  MoreHorizontal, Brain, FileText, LogOut, Plus, RotateCw, 
  PenTool, Quote, ChevronLeft, Sparkles, AlertCircle, CheckCircle, PlayCircle,
  X, MapPin, AlignLeft, User, Mic, PanelLeftClose, PanelLeft, ChevronUp,
  Trophy, MessageSquare, Users, UserPlus
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Types
type StudentDashboardView = 'dashboard' | 'courses' | 'calendar' | 'decks' | 'workspace' | 'settings' | 'course-detail' | 'deck-player' | 'agent' | 'leaderboard' | 'messages';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  onboardingComplete?: boolean;
}

interface UserStats {
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
}

interface FlashcardSet {
  id: string;
  title: string;
  description?: string;
  cards: { front: string; back: string }[];
  createdAt: string;
}

interface Course {
  id: string;
  name: string;
  code: string;
  instructor?: string;
  term?: string;
  color?: string;
}

// Interfaces for Canvas data
interface CanvasCourse {
  id: string;
  name: string;
  code: string;
  instructor?: string;
  term?: string;
  grade?: string;
  color?: string;
}

interface CanvasAssignment {
  id: string;
  name: string;
  dueAt: string | null;
  courseName: string;
  courseCode: string;
  pointsPossible?: number;
}

interface AITask {
  id: string;
  title: string;
  description: string;
  type: 'study' | 'review' | 'practice' | 'preparation' | 'break';
  priority: 'high' | 'medium' | 'low';
  estimatedMinutes: number;
  relatedAssignment?: string;
  relatedCourse?: string;
  suggestedDate?: string;
  completed: boolean;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  type: string;
  course?: string;
  color: string;
}

// --- Sub-Components ---

const DashboardContent = ({ 
  setActiveView, 
  focusMode, 
  setFocusMode, 
  triggerToast,
  user,
  stats,
  assignments,
  aiTasks,
  calendarEvents,
  canvasConnected,
  generateAiTasks,
  toggleTask
}: {
  setActiveView: (view: StudentDashboardView) => void;
  focusMode: boolean;
  setFocusMode: (mode: boolean) => void;
  triggerToast: (msg: string) => void;
  user: UserData | null;
  stats: UserStats | null;
  assignments: CanvasAssignment[];
  aiTasks: AITask[];
  calendarEvents: CalendarEvent[];
  canvasConnected: boolean;
  generateAiTasks: () => void;
  toggleTask: (taskId: string) => void;
}) => {
    const timeOfDay = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';
    const userName = user?.name?.split(' ')[0] || 'Student';
    
    // Get upcoming assignments for display
    const upcomingAssignments = assignments.slice(0, 3);
    const upcomingTasks = aiTasks.filter(t => !t.completed).slice(0, 3);
    const todayEvents = calendarEvents.filter(e => {
      const eventDate = new Date(e.start);
      const today = new Date();
      return eventDate.toDateString() === today.toDateString();
    }).slice(0, 5);
    
    // Count due items
    const dueThisWeek = assignments.filter(a => {
      if (!a.dueAt) return false;
      const dueDate = new Date(a.dueAt);
      const now = new Date();
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return dueDate >= now && dueDate <= weekFromNow;
    }).length;

    const formatDueDate = (dueAt: string | null) => {
      if (!dueAt) return 'No due date';
      const date = new Date(dueAt);
      const now = new Date();
      const diffMs = date.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return 'Overdue';
      if (diffDays === 0) return 'Due today';
      if (diffDays === 1) return 'Due tomorrow';
      if (diffDays <= 7) return `${diffDays} days left`;
      return date.toLocaleDateString();
    };

    const getColorForCourse = (courseCode: string) => {
      const colors = ['green', 'orange', 'blue', 'purple', 'pink'];
      const hash = courseCode.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      return colors[hash % colors.length];
    };

    return (
    <div className="space-y-8 animate-fade-in pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-gradient-to-br from-red-600 to-red-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-[0_30px_60px_-15px_rgba(220,38,38,0.6)] border border-red-500/50 border-b-[8px] border-b-red-950 group transition-all duration-500 hover:translate-y-[-2px]">
                <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-b from-white/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl group-hover:translate-x-1/4 transition-transform duration-1000"></div>
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-xs font-bold mb-6 text-red-100 shadow-inner">
                        <Sparkles size={12} /> Student Dashboard
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif font-medium mb-4 tracking-tight leading-tight">{timeOfDay}, {userName}.</h1>
                    <p className="text-red-100 mb-10 max-w-lg text-lg font-light leading-relaxed">
                        {canvasConnected ? (
                          <>You have <strong className="text-white font-semibold">{dueThisWeek} assignment{dueThisWeek !== 1 ? 's' : ''}</strong> due this week{upcomingTasks.length > 0 && <> and <strong className="text-white font-semibold">{upcomingTasks.length} AI-suggested task{upcomingTasks.length !== 1 ? 's' : ''}</strong> to complete</>}.</>
                        ) : (
                          <>Connect your Canvas account in <strong className="text-white font-semibold">Settings</strong> to see your assignments and get AI-powered study suggestions.</>
                        )}
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <button onClick={() => setActiveView('agent')} className="bg-white text-red-900 px-6 py-3.5 rounded-xl font-bold shadow-xl hover:bg-neutral-100 transition-all flex items-center gap-2 border-b-[4px] border-neutral-300 active:border-b-0 active:translate-y-[4px]">
                            <Sparkles size={18} /> Ask AI Agent
                        </button>
                        <button onClick={() => setActiveView('calendar')} className="bg-red-900/40 backdrop-blur-md text-white border border-white/20 px-6 py-3.5 rounded-xl font-bold hover:bg-red-900/60 transition-all flex items-center gap-2 shadow-lg active:scale-95">
                            <CalendarIcon size={18} /> Full Schedule
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Card */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 border-b-[6px] border-b-black flex flex-col justify-between group relative overflow-hidden shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:bg-red-600/20 transition-all"></div>
                
                <div className="relative z-10">
                     <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center border border-yellow-500/20 shadow-lg shadow-yellow-500/10">
                                <Trophy size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg">Your Stats</h3>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Level {stats?.level || 1}</span>
                                </div>
                            </div>
                        </div>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-4 mb-6">
                         <div className="bg-neutral-800/50 p-4 rounded-lg border border-neutral-800">
                             <div className="text-2xl font-bold text-white">{stats?.xp || 0}</div>
                             <div className="text-xs text-neutral-500 font-medium">Total XP</div>
                         </div>
                         <div className="bg-neutral-800/50 p-4 rounded-lg border border-neutral-800">
                             <div className="text-2xl font-bold text-orange-400 flex items-center gap-1">
                                 🔥 {stats?.currentStreak || 0}
                             </div>
                             <div className="text-xs text-neutral-500 font-medium">Day Streak</div>
                         </div>
                     </div>
                </div>

                <button 
                    onClick={() => setActiveView('leaderboard')}
                    className="w-full text-left text-xs font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 hover:text-white px-4 py-3 rounded-lg transition-all border border-neutral-700 flex justify-between items-center group/btn hover:border-red-500/30"
                >
                    View Leaderboard <ArrowRight size={12} className="opacity-0 group-hover/btn:opacity-100 transition-all transform group-hover/btn:translate-x-1 text-red-400"/>
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="font-serif font-bold text-white text-2xl">Assignments & Tasks</h3>
                    <div className="flex gap-2">
                        <button onClick={generateAiTasks} className="text-sm text-purple-400 font-bold hover:bg-white/5 px-3 py-1.5 rounded-md transition-colors flex items-center gap-2">
                            <Sparkles size={14} /> Generate Tasks
                        </button>
                        <button onClick={() => triggerToast('Canvas LMS Synced Successfully!')} className="text-sm text-red-400 font-bold hover:bg-white/5 px-3 py-1.5 rounded-md transition-colors flex items-center gap-2">
                            <RotateCw size={14} /> Sync
                        </button>
                    </div>
                </div>
                <div className="space-y-4">
                    {/* Canvas Assignments */}
                    {upcomingAssignments.map((assignment, i) => {
                        const color = getColorForCourse(assignment.courseCode);
                        return (
                        <div key={`assign-${assignment.id}`} onClick={() => triggerToast('Opening Assignment Detail...')} className="bg-neutral-900 p-5 rounded-2xl border border-neutral-800 border-b-[4px] border-b-neutral-800 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-[2px] active:border-b-2 transition-all cursor-pointer group flex items-center gap-5 relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-neutral-700 to-transparent group-hover:via-red-500 transition-colors"></div>
                            <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0 bg-${color}-900/20 text-${color}-400 border border-${color}-500/20 shadow-inner`}>
                                <span className="text-[10px] font-black uppercase tracking-wider opacity-70">{assignment.courseCode.split(' ')[0] || 'COURSE'}</span>
                                <span className="text-sm font-bold">{assignment.courseCode.split(' ')[1] || ''}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-white text-base truncate group-hover:text-red-400 transition-colors">{assignment.name}</h4>
                                <div className="flex items-center gap-3 text-xs font-medium text-neutral-500 mt-1.5">
                                    <span className="flex items-center gap-1.5 bg-neutral-800 px-2 py-0.5 rounded text-neutral-400"><Clock size={12} /> {assignment.dueAt ? new Date(assignment.dueAt).toLocaleDateString() : 'No due date'}</span>
                                    <span className={`text-${color}-400 font-bold`}>{formatDueDate(assignment.dueAt)}</span>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-full border border-neutral-800 flex items-center justify-center text-neutral-600 group-hover:bg-red-900/50 group-hover:text-red-400 group-hover:border-red-500/30 transition-all">
                                <ChevronRight size={20} />
                            </div>
                        </div>
                    )})}
                    
                    {/* AI-Generated Tasks */}
                    {upcomingTasks.map((task) => (
                        <div key={`task-${task.id}`} onClick={() => toggleTask(task.id)} className="bg-neutral-900/70 p-5 rounded-2xl border border-purple-900/30 border-b-[4px] border-b-neutral-800 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-[2px] active:border-b-2 transition-all cursor-pointer group flex items-center gap-5 relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500/50 via-purple-500 to-purple-500/50"></div>
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-purple-900/20 text-purple-400 border border-purple-500/20 shadow-inner`}>
                                <Sparkles size={24} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-bold text-purple-400 bg-purple-900/30 px-2 py-0.5 rounded uppercase">AI Task</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${task.priority === 'high' ? 'text-red-400 bg-red-900/30' : task.priority === 'medium' ? 'text-yellow-400 bg-yellow-900/30' : 'text-green-400 bg-green-900/30'}`}>{task.priority}</span>
                                </div>
                                <h4 className="font-bold text-white text-base truncate group-hover:text-purple-400 transition-colors">{task.title}</h4>
                                <div className="flex items-center gap-3 text-xs font-medium text-neutral-500 mt-1.5">
                                    <span className="flex items-center gap-1.5 bg-neutral-800 px-2 py-0.5 rounded text-neutral-400"><Clock size={12} /> ~{task.estimatedMinutes} min</span>
                                    {task.relatedCourse && <span className="text-purple-400">{task.relatedCourse}</span>}
                                </div>
                            </div>
                            <div className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${task.completed ? 'bg-green-900/50 text-green-400 border-green-500/30' : 'border-neutral-800 text-neutral-600 group-hover:bg-purple-900/50 group-hover:text-purple-400 group-hover:border-purple-500/30'}`}>
                                {task.completed ? <CheckCircle size={20} /> : <ChevronRight size={20} />}
                            </div>
                        </div>
                    ))}
                    
                    {upcomingAssignments.length === 0 && upcomingTasks.length === 0 && (
                        <div className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800 text-center">
                            <AlertCircle size={32} className="mx-auto text-neutral-600 mb-3" />
                            <h4 className="font-bold text-white mb-2">No assignments or tasks</h4>
                            <p className="text-sm text-neutral-500 mb-4">Connect Canvas or generate AI tasks to get started.</p>
                            <button onClick={() => setActiveView('settings')} className="text-sm text-red-400 font-bold hover:underline">
                                Connect Canvas →
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="space-y-8">
                {/* Calendar Preview Widget */}
                <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-0 shadow-lg border-b-[6px] border-b-black overflow-hidden relative group hover:border-neutral-700 transition-colors">
                    <div className="p-5 border-b border-neutral-800 bg-neutral-800/30 flex justify-between items-center backdrop-blur-sm relative z-10">
                         <h4 className="font-serif font-bold text-white text-lg flex items-center gap-2">
                             <CalendarIcon size={16} className="text-neutral-400"/> Schedule
                         </h4>
                         <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider bg-red-900/20 px-2 py-1 rounded border border-red-500/20">Today</span>
                    </div>
                    <div className="p-5 relative z-10 min-h-[300px]">
                        <div className="relative pl-4 space-y-6 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-px before:bg-neutral-800">
                             {todayEvents.length > 0 ? todayEvents.map((evt, i) => {
                                 const eventTime = new Date(evt.start).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                                 return (
                                 <div key={evt.id} className="relative group/evt cursor-default">
                                     <div className={`absolute -left-[1.35rem] w-3 h-3 rounded-full border-2 border-neutral-900 transition-transform group-hover/evt:scale-125 ${evt.type === 'assignment' ? 'bg-red-500' : evt.type === 'task' ? 'bg-purple-500' : 'bg-green-500'}`}></div>
                                     <div className="text-xs font-bold text-neutral-500 mb-0.5">{eventTime}</div>
                                     <div className="text-sm font-bold text-white group-hover/evt:text-blue-400 transition-colors">{evt.title}</div>
                                     {evt.course && <div className="text-xs text-neutral-400 mt-0.5">{evt.course}</div>}
                                 </div>
                             )}) : (
                                 <div className="text-center py-8">
                                     <CalendarIcon size={32} className="mx-auto text-neutral-700 mb-3" />
                                     <p className="text-sm text-neutral-500">No events today</p>
                                     <p className="text-xs text-neutral-600 mt-1">Connect Canvas to see your schedule</p>
                                 </div>
                             )}
                        </div>
                    </div>
                    <button onClick={() => setActiveView('calendar')} className="w-full py-3 text-xs font-bold text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors border-t border-neutral-800 relative z-10">
                        View Full Calendar
                    </button>
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-900/10 blur-3xl rounded-full pointer-events-none group-hover:bg-purple-900/20 transition-all"></div>
                </div>

                <div>
                    <div className="flex items-center justify-between px-2 mb-4">
                        <h3 className="font-serif font-bold text-white text-lg">Study Decks</h3>
                        <button onClick={() => setActiveView('decks')} className="w-8 h-8 rounded-md bg-neutral-800 text-neutral-400 flex items-center justify-center hover:bg-neutral-700 transition-colors border border-neutral-700">
                            <Plus size={16} />
                        </button>
                    </div>
                    <div onClick={() => setActiveView('decks')} className="bg-neutral-900 p-5 rounded-2xl border border-neutral-800 border-b-[4px] border-b-black shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-900/10 rounded-bl-[3rem] -mr-4 -mt-4 z-0 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-neutral-800 border border-blue-900/30 text-blue-400 rounded-lg flex items-center justify-center shadow-sm">
                                    <Brain size={20} />
                                </div>
                                <span className="text-xs font-bold text-blue-400 bg-blue-900/20 px-2 py-1 rounded-md border border-blue-500/20">24 Cards</span>
                            </div>
                            <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors text-lg">Cellular Respiration</h4>
                            <p className="text-xs text-neutral-500 font-medium mt-1 mb-4">Last studied 2h ago</p>
                            <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                                <div className="w-[40%] bg-blue-500 h-full rounded-full shadow-[0_0_10px_rgba(59,130,246,0.4)]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    )
};

const AgentChatContent = ({ setActiveView }: { setActiveView: (view: StudentDashboardView) => void }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const handleSend = async (text: string = input) => {
        if (!text.trim()) return;
        
        const userMsg: ChatMessage = { role: 'user', text: text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/chat/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    conversationId: conversationId,
                    message: text,
                }),
            });

            const data = await res.json();
            
            if (data.conversationId && !conversationId) {
                setConversationId(data.conversationId);
            }

            setMessages(prev => [...prev, { role: 'model', text: data.response || 'Sorry, I could not process that request.' }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'model', text: 'Sorry, there was an error processing your request.' }]);
        }
        
        setLoading(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const suggestions = [
        { icon: Brain, text: "Quiz me on Cellular Respiration", sub: "Based on BIO 101" },
        { icon: CalendarIcon, text: "Plan my study schedule", sub: "For the upcoming week" },
        { icon: FileText, text: "Summarize this week's History notes", sub: "From Module 4" },
        { icon: PenTool, text: "Critique my essay thesis", sub: "Paste your thesis" },
    ];

    return (
        <div className="flex flex-col h-full relative">
             <div className="absolute inset-0 z-0">
                  <div className="absolute inset-0 bg-neutral-950"></div>
                  <div className="absolute top-[20%] right-[10%] w-[60%] h-[60%] bg-brand-900/10 rounded-full blur-[150px] mix-blend-screen pointer-events-none"></div>
                  <div className="absolute bottom-[20%] left-[10%] w-[40%] h-[40%] bg-red-900/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
                  <div className="absolute inset-0 opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
             </div>

             <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-30 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => setActiveView('dashboard')} className="w-10 h-10 rounded-full bg-neutral-900 hover:bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors border border-white/10 shadow-sm">
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2 font-serif">
                             <Sparkles size={20} className="text-red-500 fill-red-500/20 animate-pulse" /> 
                             CanvasAI Agent
                        </h2>
                        <div className="flex items-center gap-1.5 mt-0.5">
                             <span className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_5px_rgba(34,197,94,0.5)]"></span>
                             <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Online & Ready</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                     <button onClick={() => setMessages([])} className="px-4 py-2 rounded-lg bg-neutral-900 border border-white/5 text-xs font-bold text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors flex items-center gap-2 shadow-sm">
                         <RotateCw size={14}/> Clear Chat
                     </button>
                </div>
             </div>

             <div className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-64 py-8 space-y-8 custom-scrollbar relative z-10 scroll-smooth">
                 
                 {messages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-fade-in-up">
                           <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center shadow-[0_0_50px_rgba(220,38,38,0.4)] mb-8 ring-1 ring-white/10 relative overflow-hidden">
                               <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                               <Sparkles size={48} className="text-white relative z-10" />
                           </div>
                           <h1 className="text-4xl md:text-5xl font-serif font-medium text-white mb-4 tracking-tight">How can I help you today?</h1>
                           <p className="text-neutral-400 max-w-lg mb-12 text-lg leading-relaxed">I&apos;m connected to your courses. Ask me to quiz you, summarize lectures, or plan your study schedule.</p>
                           
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
                               {suggestions.map((s, i) => (
                                   <button 
                                     key={i} 
                                     onClick={() => handleSend(s.text)}
                                     className="bg-neutral-900/60 hover:bg-neutral-800 border border-white/5 hover:border-red-500/30 p-5 rounded-2xl text-left transition-all group flex items-start gap-4 backdrop-blur-sm shadow-sm"
                                   >
                                       <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center text-neutral-500 group-hover:text-red-400 group-hover:bg-red-900/10 transition-colors border border-white/5">
                                           <s.icon size={20} />
                                       </div>
                                       <div>
                                           <div className="text-sm font-bold text-neutral-200 group-hover:text-white mb-0.5">{s.text}</div>
                                           <div className="text-xs text-neutral-500">{s.sub}</div>
                                       </div>
                                   </button>
                               ))}
                           </div>
                      </div>
                 ) : (
                     <>
                         {messages.map((msg, i) => (
                             <div key={i} className={`flex gap-6 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in group`}>
                                 {msg.role === 'model' && (
                                     <div className="w-10 h-10 rounded-xl bg-black border border-white/10 flex-shrink-0 flex items-center justify-center shadow-lg mt-1 text-red-500">
                                         <Sparkles size={20} fill="currentColor" className="opacity-80" />
                                     </div>
                                 )}
                                 
                                 <div className={`max-w-[85%] md:max-w-[70%] space-y-2 ${msg.role === 'user' ? 'order-1' : 'order-2'}`}>
                                     <div className={`p-6 rounded-3xl text-sm md:text-base leading-relaxed shadow-lg relative ${
                                         msg.role === 'model' 
                                         ? 'bg-neutral-900/90 border border-white/5 text-neutral-100 rounded-tl-sm backdrop-blur-sm' 
                                         : 'bg-gradient-to-br from-brand-600 to-brand-700 text-white rounded-tr-sm shadow-[0_4px_20px_rgba(220,38,38,0.2)]'
                                     }`}>
                                         {msg.text.split('\n').map((line, idx) => {
                                             if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
                                                 return (
                                                     <div key={idx} className="flex gap-2 ml-1 mb-1">
                                                         <span className="text-white/60 mt-2 w-1.5 h-1.5 bg-current rounded-full shrink-0"></span>
                                                         <span>{line.substring(2)}</span>
                                                     </div>
                                                 );
                                             }
                                             if (line.trim().startsWith('#')) {
                                                 return <h4 key={idx} className="font-bold text-lg mb-2 mt-4 first:mt-0">{line.replace(/^#+\s/, '')}</h4>
                                             }
                                             const parts = line.split(/(\*\*.*?\*\*)/g);
                                             return (
                                                <p key={idx} className={`mb-3 last:mb-0 ${line.length === 0 ? 'h-0' : ''}`}>
                                                    {parts.map((part, pIdx) => 
                                                        part.startsWith('**') && part.endsWith('**') 
                                                            ? <strong key={pIdx} className="font-bold text-white">{part.slice(2, -2)}</strong> 
                                                            : part
                                                    )}
                                                </p>
                                             );
                                         })}
                                     </div>
                                     <div className={`text-[10px] font-medium opacity-40 px-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                         {msg.role === 'user' ? 'You' : 'CanvasAI Agent'}
                                     </div>
                                 </div>

                                 {msg.role === 'user' && (
                                     <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-white/10 flex-shrink-0 flex items-center justify-center mt-1 shadow-sm">
                                         <User size={20} className="text-neutral-400" />
                                     </div>
                                 )}
                             </div>
                         ))}
                         
                         {loading && (
                             <div className="flex gap-6 animate-fade-in">
                                 <div className="w-10 h-10 rounded-xl bg-black border border-white/10 flex-shrink-0 flex items-center justify-center shadow-lg mt-1 text-red-500">
                                      <Sparkles size={20} fill="currentColor" className="animate-pulse" />
                                 </div>
                                 <div className="bg-neutral-900 border border-white/5 rounded-3xl rounded-tl-sm p-6 flex items-center gap-2 w-32 h-16">
                                     <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce"></span>
                                     <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                                     <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                                 </div>
                             </div>
                         )}
                     </>
                 )}
                 <div ref={messagesEndRef} />
             </div>

             <div className="p-8 pt-4 z-20 flex-shrink-0 flex justify-center bg-transparent">
                 <div className="relative w-full max-w-4xl shadow-2xl rounded-2xl bg-neutral-900/80 backdrop-blur-xl border border-white/10 overflow-hidden group focus-within:ring-1 focus-within:ring-red-500/50 focus-within:border-red-500/50 transition-all">
                     <textarea 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask anything..."
                        className="w-full bg-transparent text-white rounded-2xl pl-6 pr-16 py-5 focus:outline-none border-none resize-none h-[80px] custom-scrollbar placeholder-neutral-500 text-lg"
                     />
                     <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                         <button 
                            className="p-2 text-neutral-500 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                            title="Voice Input (Coming Soon)"
                         >
                            <Mic size={20} />
                         </button>
                         <button 
                            onClick={() => handleSend()}
                            disabled={!input.trim() || loading}
                            className="w-10 h-10 bg-red-600 hover:bg-red-500 disabled:bg-neutral-800 disabled:text-neutral-600 text-white rounded-xl flex items-center justify-center transition-all shadow-lg active:scale-95"
                         >
                             <ArrowRight size={20} strokeWidth={2.5} />
                         </button>
                     </div>
                 </div>
             </div>
             <div className="absolute bottom-2 text-center w-full z-20 pointer-events-none">
                 <p className="text-[10px] text-neutral-600 font-medium">CanvasAI can make mistakes. Verify important info.</p>
             </div>
        </div>
    );
};

const CoursesContent = ({ setActiveView, triggerToast, setSelectedCourse, courses }: {
  setActiveView: (view: StudentDashboardView) => void;
  triggerToast: (msg: string) => void;
  setSelectedCourse: (course: any) => void;
  courses: CanvasCourse[];
}) => {
    
    return (
    <div className="space-y-8 animate-fade-in">
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-3xl font-serif font-bold text-white">My Courses</h2>
                <p className="text-neutral-500 mt-1 font-medium">Fall 2025 Semester</p>
            </div>
            <button onClick={() => triggerToast('Synced courses from Canvas!')} className="bg-neutral-900 border border-neutral-700 text-neutral-300 px-5 py-2.5 rounded-md font-bold shadow-sm text-sm flex items-center gap-2 hover:bg-neutral-800 border-b-[4px] border-neutral-800 active:border-b-0 active:translate-y-[4px] transition-all">
                <RotateCw size={16}/> Sync Canvas
            </button>
        </div>
        {courses.length === 0 ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center">
                <BookOpen size={48} className="mx-auto text-neutral-600 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No courses found</h3>
                <p className="text-neutral-500 mb-6">Connect your Canvas account to see your courses.</p>
                <button onClick={() => setActiveView('settings')} className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors">
                    Connect Canvas
                </button>
            </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, i) => (
                <div key={i} onClick={() => { setSelectedCourse(course); setActiveView('course-detail'); }} className="bg-neutral-900 rounded-lg border border-neutral-800 shadow-sm overflow-hidden group cursor-pointer hover:-translate-y-2 hover:shadow-xl transition-all duration-300 border-b-[6px] border-neutral-800">
                    <div className={`h-36 bg-gradient-to-br ${course.color || 'from-neutral-600 to-neutral-800'} relative p-6`}>
                         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                         <div className="absolute bottom-4 left-6 text-white font-black text-4xl opacity-20 tracking-tighter">{(course.code || '').split(' ')[0]}</div>
                         <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-sm text-xs font-bold border border-white/20">{course.grade || 'N/A'}</div>
                    </div>
                    <div className="p-6">
                        <div className="text-xs font-bold text-neutral-500 mb-2 uppercase tracking-wider">{course.code}</div>
                        <h3 className="font-bold text-white text-xl mb-2 leading-tight group-hover:text-red-400 transition-colors">{course.name}</h3>
                        <p className="text-sm text-neutral-400 mb-8 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] font-bold border border-neutral-700">{(course.instructor || 'T')[0]}</span>
                            {course.instructor || 'TBD'}
                        </p>
                        <div className="flex gap-3">
                             <button onClick={(e) => {e.stopPropagation(); triggerToast('Opening Assignments...')}} className="flex-1 py-2.5 bg-neutral-800 text-neutral-300 rounded-md text-xs font-bold hover:bg-neutral-700 transition-all border-b-[3px] border-neutral-900 active:border-b-0 active:translate-y-[3px]">Assignments</button>
                             <button onClick={(e) => {e.stopPropagation(); triggerToast('Opening Grades...')}} className="flex-1 py-2.5 bg-neutral-800 text-neutral-300 rounded-md text-xs font-bold hover:bg-neutral-700 transition-all border-b-[3px] border-neutral-900 active:border-b-0 active:translate-y-[3px]">Grades</button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
        )}
    </div>
)};

const CalendarContent = ({ 
    setActiveView, 
    triggerToast, 
    assignments, 
    aiTasks, 
    calendarEvents,
    toggleTask,
    generateAiTasks
}: {
    setActiveView: (view: StudentDashboardView) => void;
    triggerToast: (msg: string) => void;
    assignments: CanvasAssignment[];
    aiTasks: AITask[];
    calendarEvents: CalendarEvent[];
    toggleTask: (taskId: string) => void;
    generateAiTasks: () => void;
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month');
    
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };
    
    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };
    
    const getEventsForDate = (day: number) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dateStr = date.toDateString();
        
        return calendarEvents.filter(evt => {
            const evtDate = new Date(evt.start);
            return evtDate.toDateString() === dateStr;
        });
    };
    
    const isToday = (day: number) => {
        const today = new Date();
        return today.getDate() === day && 
               today.getMonth() === currentDate.getMonth() && 
               today.getFullYear() === currentDate.getFullYear();
    };
    
    // Combine all items for list view
    const allItems = [
        ...assignments.map(a => ({
            id: a.id,
            title: a.name,
            date: a.dueAt ? new Date(a.dueAt) : null,
            type: 'assignment' as const,
            course: a.courseCode,
            completed: false
        })),
        ...aiTasks.map(t => ({
            id: t.id,
            title: t.title,
            date: t.suggestedDate ? new Date(t.suggestedDate) : null,
            type: 'task' as const,
            course: t.relatedCourse,
            completed: t.completed,
            priority: t.priority,
            estimatedMinutes: t.estimatedMinutes
        }))
    ].sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return a.date.getTime() - b.date.getTime();
    });

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-white flex items-center gap-3">
                        <CalendarIcon className="text-red-500" /> Calendar
                    </h2>
                    <p className="text-neutral-500 mt-1">Your assignments and AI-generated study tasks</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-1 flex">
                        <button 
                            onClick={() => setViewMode('month')}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${viewMode === 'month' ? 'bg-red-600 text-white' : 'text-neutral-400 hover:text-white'}`}
                        >
                            Month
                        </button>
                        <button 
                            onClick={() => setViewMode('list')}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-red-600 text-white' : 'text-neutral-400 hover:text-white'}`}
                        >
                            List
                        </button>
                    </div>
                    <button onClick={generateAiTasks} className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-purple-700 transition-colors">
                        <Sparkles size={16} /> Generate Tasks
                    </button>
                </div>
            </div>
            
            {viewMode === 'month' ? (
                <>
                    {/* Month Navigation */}
                    <div className="flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                        <button onClick={prevMonth} className="w-10 h-10 rounded-lg bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white transition-colors">
                            <ChevronLeft size={20} />
                        </button>
                        <h3 className="text-xl font-bold text-white">{monthName}</h3>
                        <button onClick={nextMonth} className="w-10 h-10 rounded-lg bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white transition-colors">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                    
                    {/* Calendar Grid */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
                        {/* Day Headers */}
                        <div className="grid grid-cols-7 border-b border-neutral-800">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="p-3 text-center text-xs font-bold text-neutral-500 uppercase tracking-wider">
                                    {day}
                                </div>
                            ))}
                        </div>
                        
                        {/* Calendar Days */}
                        <div className="grid grid-cols-7">
                            {/* Empty cells for days before the 1st */}
                            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                                <div key={`empty-${i}`} className="min-h-[100px] p-2 border-b border-r border-neutral-800 bg-neutral-950/50"></div>
                            ))}
                            
                            {/* Actual days */}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const events = getEventsForDate(day);
                                const today = isToday(day);
                                
                                return (
                                    <div 
                                        key={day} 
                                        className={`min-h-[100px] p-2 border-b border-r border-neutral-800 hover:bg-neutral-800/30 transition-colors ${today ? 'bg-red-900/10' : ''}`}
                                    >
                                        <div className={`text-sm font-bold mb-2 ${today ? 'text-red-400' : 'text-neutral-400'}`}>
                                            {day}
                                            {today && <span className="ml-2 text-[10px] text-red-400 bg-red-900/30 px-1.5 py-0.5 rounded">TODAY</span>}
                                        </div>
                                        <div className="space-y-1">
                                            {events.slice(0, 3).map(evt => (
                                                <div 
                                                    key={evt.id}
                                                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded truncate ${
                                                        evt.type === 'assignment' ? 'bg-red-900/30 text-red-400' :
                                                        evt.type === 'task' ? 'bg-purple-900/30 text-purple-400' :
                                                        'bg-green-900/30 text-green-400'
                                                    }`}
                                                    title={evt.title}
                                                >
                                                    {evt.title}
                                                </div>
                                            ))}
                                            {events.length > 3 && (
                                                <div className="text-[10px] text-neutral-500 font-medium">
                                                    +{events.length - 3} more
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            ) : (
                /* List View */
                <div className="space-y-4">
                    {allItems.length === 0 ? (
                        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center">
                            <CalendarIcon size={48} className="mx-auto text-neutral-600 mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">No items yet</h3>
                            <p className="text-neutral-500 mb-6">Connect Canvas or generate AI tasks to see items here.</p>
                            <button onClick={() => setActiveView('settings')} className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors">
                                Connect Canvas
                            </button>
                        </div>
                    ) : (
                        allItems.map(item => (
                            <div 
                                key={item.id}
                                onClick={() => item.type === 'task' && toggleTask(item.id)}
                                className={`bg-neutral-900 p-5 rounded-xl border border-neutral-800 hover:border-neutral-700 transition-all ${item.type === 'task' ? 'cursor-pointer' : ''} ${item.completed ? 'opacity-50' : ''}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                        item.type === 'assignment' ? 'bg-red-900/20 text-red-400' : 'bg-purple-900/20 text-purple-400'
                                    }`}>
                                        {item.type === 'assignment' ? <FileText size={24} /> : <Sparkles size={24} />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                                item.type === 'assignment' ? 'bg-red-900/30 text-red-400' : 'bg-purple-900/30 text-purple-400'
                                            }`}>
                                                {item.type === 'assignment' ? 'Assignment' : 'AI Task'}
                                            </span>
                                            {item.course && <span className="text-[10px] text-neutral-500">{item.course}</span>}
                                        </div>
                                        <h4 className={`font-bold text-white ${item.completed ? 'line-through' : ''}`}>{item.title}</h4>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
                                            <span className="flex items-center gap-1">
                                                <Clock size={12} />
                                                {item.date ? item.date.toLocaleDateString() : 'No date'}
                                            </span>
                                            {'estimatedMinutes' in item && item.estimatedMinutes && (
                                                <span>~{item.estimatedMinutes} min</span>
                                            )}
                                        </div>
                                    </div>
                                    {item.type === 'task' && (
                                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${
                                            item.completed ? 'bg-green-900/50 text-green-400 border-green-500/30' : 'border-neutral-700 text-neutral-500'
                                        }`}>
                                            {item.completed ? <CheckCircle size={16} /> : <div className="w-3 h-3 rounded-full border border-neutral-600"></div>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
            
            {/* Legend */}
            <div className="flex items-center gap-6 justify-center text-xs text-neutral-500">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-red-500"></div>
                    <span>Assignments</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-purple-500"></div>
                    <span>AI Tasks</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-green-500"></div>
                    <span>Events</span>
                </div>
            </div>
        </div>
    );
};

const DecksContent = ({ setActiveView, triggerToast, setSelectedDeck, flashcardSets }: {
    setActiveView: (view: StudentDashboardView) => void;
    triggerToast: (msg: string) => void;
    setSelectedDeck: (deck: any) => void;
    flashcardSets: FlashcardSet[];
}) => {
    const displayDecks = flashcardSets.map((set, i) => ({
        id: set.id,
        title: set.title,
        count: set.cards?.length || 0,
        mastery: Math.floor(Math.random() * 100),
        color: ['blue', 'purple', 'green', 'orange', 'pink'][i % 5]
    }));

    return (
    <div className="space-y-8 animate-fade-in pb-12">
         <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-serif font-bold text-white">Study Decks</h2>
              <p className="text-neutral-500 mt-1">Master your subjects with AI-generated flashcards.</p>
            </div>
            <button onClick={() => triggerToast('Creating New Deck...')} className="bg-red-600 text-white px-5 py-3 rounded-md font-bold shadow-lg shadow-red-900/50 text-sm flex items-center gap-2 hover:bg-red-700 border-b-[4px] border-red-800 active:border-b-0 active:translate-y-[4px] transition-all">
                <Plus size={18}/> Create Deck
            </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayDecks.map((deck, i) => (
                  <div key={i} onClick={() => { setSelectedDeck(deck); setActiveView('deck-player'); }} className="bg-neutral-900 rounded-lg border border-neutral-800 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group border-b-[6px] border-neutral-800 relative overflow-hidden">
                       <div className={`absolute top-0 right-0 w-32 h-32 bg-${deck.color}-900/30 rounded-bl-[5rem] -mr-8 -mt-8 z-0 transition-transform group-hover:scale-110`}></div>
                       <div className="relative z-10">
                           <div className="flex justify-between items-start mb-8">
                               <div className={`w-14 h-14 bg-neutral-800 text-${deck.color}-400 rounded-md flex items-center justify-center shadow-sm border border-${deck.color}-900/30`}>
                                   <Brain size={28} />
                               </div>
                               <button onClick={(e) => {e.stopPropagation(); triggerToast('Options menu')}} className="text-neutral-600 hover:text-neutral-300"><MoreHorizontal size={24}/></button>
                           </div>
                           <h3 className="font-serif font-bold text-white text-2xl mb-2 group-hover:text-red-400 transition-colors">{deck.title}</h3>
                           <div className="flex items-center gap-2 text-sm text-neutral-500 mb-8 font-medium">
                               <FileText size={16}/> {deck.count} Cards
                           </div>
                           <div className="space-y-2">
                              <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-neutral-500">
                                  <span>Mastery</span>
                                  <span>{deck.mastery}%</span>
                              </div>
                              <div className="w-full bg-neutral-800 h-3 rounded-full overflow-hidden shadow-inner">
                                  <div className={`h-full bg-${deck.color}-500 rounded-r-full`} style={{width: `${deck.mastery}%`}}></div>
                              </div>
                           </div>
                       </div>
                       <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                           <div className={`w-10 h-10 rounded-full bg-${deck.color}-900/50 text-${deck.color}-400 flex items-center justify-center border border-${deck.color}-500/30`}>
                               <PlayCircle size={20} fill="currentColor" />
                           </div>
                       </div>
                  </div>
              ))}
        </div>
    </div>
)};

const LeaderboardContent = ({ setActiveView }: { setActiveView: (view: StudentDashboardView) => void }) => {
    const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<'xp' | 'streak'>('xp');
    const [scope, setScope] = useState<'friends' | 'global'>('friends');

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await fetch(`/api/leaderboard?scope=${scope}&sortBy=${sortBy}`, {
                    credentials: 'include'
                });
                const data = await res.json();
                if (data.leaderboard) {
                    setLeaderboardData(data.leaderboard);
                }
            } catch (error) {
                console.error('Failed to fetch leaderboard:', error);
            }
            setLoading(false);
        };
        fetchLeaderboard();
    }, [scope, sortBy]);

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-white flex items-center gap-3">
                        <Trophy className="text-yellow-400" /> Leaderboard
                    </h2>
                    <p className="text-neutral-500 mt-1">See how you rank against your friends and classmates.</p>
                </div>
                <div className="flex gap-2">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-1 flex">
                        <button 
                            onClick={() => setScope('friends')}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${scope === 'friends' ? 'bg-red-600 text-white' : 'text-neutral-400 hover:text-white'}`}
                        >
                            Friends
                        </button>
                        <button 
                            onClick={() => setScope('global')}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${scope === 'global' ? 'bg-red-600 text-white' : 'text-neutral-400 hover:text-white'}`}
                        >
                            Global
                        </button>
                    </div>
                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-1 flex">
                        <button 
                            onClick={() => setSortBy('xp')}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${sortBy === 'xp' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'}`}
                        >
                            XP
                        </button>
                        <button 
                            onClick={() => setSortBy('streak')}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${sortBy === 'streak' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'}`}
                        >
                            Streak
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full"></div>
                </div>
            ) : leaderboardData.length === 0 ? (
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center">
                    <Users size={48} className="mx-auto text-neutral-600 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No data yet</h3>
                    <p className="text-neutral-500">Add friends to see them on the leaderboard!</p>
                    <button 
                        onClick={() => setActiveView('messages')}
                        className="mt-6 bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors"
                    >
                        Find Friends
                    </button>
                </div>
            ) : (
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
                    {leaderboardData.map((user, i) => (
                        <div key={user.userId} className={`flex items-center gap-4 p-5 border-b border-neutral-800 last:border-0 hover:bg-neutral-800/50 transition-colors ${i < 3 ? 'bg-neutral-800/30' : ''}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                                i === 0 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                i === 1 ? 'bg-neutral-400/20 text-neutral-300 border border-neutral-400/30' :
                                i === 2 ? 'bg-orange-700/20 text-orange-400 border border-orange-700/30' :
                                'bg-neutral-800 text-neutral-500 border border-neutral-700'
                            }`}>
                                {i + 1}
                            </div>
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-purple-600 p-[2px]">
                                <div className="w-full h-full bg-neutral-900 rounded-full overflow-hidden">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt={user.name} className="w-full h-full" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-white">{user.name}</div>
                                <div className="text-xs text-neutral-500">Level {user.level}</div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-white">{sortBy === 'xp' ? `${user.xp} XP` : `🔥 ${user.currentStreak}`}</div>
                                <div className="text-xs text-neutral-500">{sortBy === 'xp' ? `🔥 ${user.currentStreak} streak` : `${user.xp} XP`}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const MessagesContent = ({ setActiveView, triggerToast }: { 
    setActiveView: (view: StudentDashboardView) => void;
    triggerToast: (msg: string) => void;
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [friends, setFriends] = useState<any[]>([]);
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        fetchFriends();
        fetchPendingRequests();
    }, []);

    const fetchFriends = async () => {
        try {
            const res = await fetch('/api/friends', { credentials: 'include' });
            const data = await res.json();
            if (data.friends) setFriends(data.friends);
        } catch (error) {
            console.error('Failed to fetch friends:', error);
        }
    };

    const fetchPendingRequests = async () => {
        try {
            const res = await fetch('/api/friends?type=pending', { credentials: 'include' });
            const data = await res.json();
            if (data.requests) setPendingRequests(data.requests);
        } catch (error) {
            console.error('Failed to fetch requests:', error);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setSearching(true);
        try {
            const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`, { credentials: 'include' });
            const data = await res.json();
            if (data.users) setSearchResults(data.users);
        } catch (error) {
            console.error('Search failed:', error);
        }
        setSearching(false);
    };

    const sendFriendRequest = async (userId: string) => {
        try {
            const res = await fetch('/api/friends', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ action: 'send', toUserId: userId })
            });
            if (res.ok) {
                triggerToast('Friend request sent!');
                setSearchResults(prev => prev.filter(u => u.id !== userId));
            }
        } catch (error) {
            console.error('Failed to send request:', error);
        }
    };

    const acceptRequest = async (fromUserId: string) => {
        try {
            const res = await fetch('/api/friends', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ action: 'accept', fromUserId })
            });
            if (res.ok) {
                triggerToast('Friend request accepted!');
                fetchFriends();
                fetchPendingRequests();
            }
        } catch (error) {
            console.error('Failed to accept request:', error);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <div>
                <h2 className="text-3xl font-serif font-bold text-white flex items-center gap-3">
                    <MessageSquare className="text-blue-400" /> Messages & Friends
                </h2>
                <p className="text-neutral-500 mt-1">Connect with classmates and study together.</p>
            </div>

            {/* Search */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <UserPlus size={18} /> Find Friends
                </h3>
                <div className="flex gap-3">
                    <div className="flex-1 relative">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Search by name or email..."
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
                        />
                    </div>
                    <button 
                        onClick={handleSearch}
                        disabled={searching}
                        className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                        {searching ? 'Searching...' : 'Search'}
                    </button>
                </div>

                {searchResults.length > 0 && (
                    <div className="mt-4 space-y-2">
                        {searchResults.map(user => (
                            <div key={user.id} className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-purple-600 p-[2px]">
                                        <div className="w-full h-full bg-neutral-900 rounded-full overflow-hidden">
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt={user.name} className="w-full h-full" />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="font-bold text-white">{user.name}</div>
                                        <div className="text-xs text-neutral-500">{user.email}</div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => sendFriendRequest(user.id)}
                                    className="bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
                                >
                                    <UserPlus size={16} /> Add
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                    <h3 className="font-bold text-white mb-4">Pending Requests ({pendingRequests.length})</h3>
                    <div className="space-y-2">
                        {pendingRequests.map(request => (
                            <div key={request.fromUserId} className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-[2px]">
                                        <div className="w-full h-full bg-neutral-900 rounded-full overflow-hidden">
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${request.fromUserName}`} alt={request.fromUserName} className="w-full h-full" />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="font-bold text-white">{request.fromUserName}</div>
                                        <div className="text-xs text-neutral-500">Wants to be friends</div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => acceptRequest(request.fromUserId)}
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                                    >
                                        Accept
                                    </button>
                                    <button className="bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                                        Decline
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Friends List */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <Users size={18} /> Your Friends ({friends.length})
                </h3>
                {friends.length === 0 ? (
                    <div className="text-center py-8">
                        <Users size={48} className="mx-auto text-neutral-600 mb-4" />
                        <p className="text-neutral-500">No friends yet. Search for classmates above!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {friends.map(friend => (
                            <div key={friend.id} className="flex items-center gap-3 p-4 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors cursor-pointer">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-purple-600 p-[2px]">
                                    <div className="w-full h-full bg-neutral-900 rounded-full overflow-hidden">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.name}`} alt={friend.name} className="w-full h-full" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-white">{friend.name}</div>
                                    <div className="text-xs text-neutral-500 flex items-center gap-1">
                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                        Online
                                    </div>
                                </div>
                                <button className="text-neutral-500 hover:text-white transition-colors">
                                    <MessageSquare size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const SettingsContent = ({ triggerToast, user }: { triggerToast: (msg: string) => void; user: UserData | null }) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [canvasToken, setCanvasToken] = useState('');
    const [canvasDomain, setCanvasDomain] = useState('');
    const [canvasConnected, setCanvasConnected] = useState(false);
    const [canvasEmail, setCanvasEmail] = useState('');
    const router = useRouter();

    useEffect(() => {
        checkCanvasConnection();
    }, []);

    const checkCanvasConnection = async () => {
        try {
            const res = await fetch('/api/canvas/courses', { credentials: 'include' });
            const data = await res.json();
            if (!data.needsSetup && data.courses) {
                setCanvasConnected(true);
                setCanvasEmail(user?.email || '');
            }
        } catch (error) {
            console.error('Failed to check Canvas connection:', error);
        }
    };

    const handleConnectCanvas = async () => {
        if (!canvasToken || !canvasDomain) {
            triggerToast('Please enter both Canvas token and domain');
            return;
        }

        // Log for debugging
        console.log('[Dashboard] Connecting to Canvas...');
        console.log('[Dashboard] Domain:', canvasDomain);
        console.log('[Dashboard] Token length:', canvasToken.length);

        try {
            const res = await fetch('/api/canvas/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ canvasToken: canvasToken.trim(), canvasDomain: canvasDomain.trim() })
            });

            const data = await res.json();
            console.log('[Dashboard] Response:', res.status, data);

            if (res.ok) {
                triggerToast('Canvas connected successfully!');
                setCanvasConnected(true);
                setCanvasEmail(user?.email || '');
                setCanvasToken('');
                setCanvasDomain('');
            } else {
                console.error('[Dashboard] Canvas connection failed:', data);
                triggerToast(data.error || 'Failed to connect Canvas');
                if (data.details) {
                    console.log('[Dashboard] Error details:', data.details);
                }
            }
        } catch (error) {
            console.error('Failed to connect Canvas:', error);
            triggerToast('Failed to connect Canvas - network error');
        }
    };

    const handleDisconnectCanvas = async () => {
        try {
            // Clear Canvas credentials from database
            await fetch('/api/canvas/courses', {
                method: 'DELETE',
                credentials: 'include'
            });
            setCanvasConnected(false);
            setCanvasEmail('');
            triggerToast('Canvas disconnected');
        } catch (error) {
            console.error('Failed to disconnect Canvas:', error);
            triggerToast('Failed to disconnect Canvas');
        }
    };

    const handleSignOut = async () => {
        try {
            await fetch('/api/auth/signout', { method: 'POST', credentials: 'include' });
            router.push('/');
        } catch (error) {
            console.error('Sign out failed:', error);
        }
    };

    return (
        <div className="animate-fade-in max-w-4xl mx-auto pb-12">
             <h2 className="text-3xl font-serif font-bold text-white mb-8">Settings</h2>
             <div className="flex gap-8">
                 <div className="w-64 shrink-0 space-y-2">
                     {['Profile', 'Notifications', 'Integrations', 'Billing'].map(tab => (
                         <button key={tab} onClick={() => setActiveTab(tab.toLowerCase())} className={`w-full text-left px-4 py-3 rounded-md font-bold text-sm transition-colors ${activeTab === tab.toLowerCase() ? 'bg-white text-black' : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'}`}>{tab}</button>
                     ))}
                     <div className="pt-4 border-t border-neutral-800 mt-4">
                         <button onClick={handleSignOut} className="w-full text-left px-4 py-3 rounded-md font-bold text-sm text-red-400 hover:bg-red-900/20 transition-colors flex items-center gap-2">
                             <LogOut size={16} /> Sign Out
                         </button>
                     </div>
                 </div>
                 <div className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl p-8">
                     {activeTab === 'profile' && (
                         <div className="space-y-8">
                             <div className="flex items-center gap-6">
                                  <div className="w-24 h-24 bg-neutral-800 rounded-full overflow-hidden border-4 border-neutral-700">
                                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`} alt="Avatar" />
                                  </div>
                                  <div>
                                      <button onClick={() => triggerToast('Avatar Updated!')} className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-bold shadow-md hover:bg-red-700 transition-colors mb-2">Change Avatar</button>
                                      <p className="text-xs text-neutral-500">JPG or PNG. Max 1MB.</p>
                                  </div>
                             </div>
                             <div className="space-y-4">
                                 <div>
                                     <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Full Name</label>
                                     <input type="text" defaultValue={user?.name || ''} className="w-full bg-black border border-neutral-800 rounded-md px-4 py-3 text-white focus:border-red-500 outline-none transition-colors" />
                                 </div>
                                 <div>
                                     <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Email Address</label>
                                     <input type="email" defaultValue={user?.email || ''} className="w-full bg-black border border-neutral-800 rounded-md px-4 py-3 text-white focus:border-red-500 outline-none transition-colors" />
                                 </div>
                             </div>
                             <div className="pt-4 border-t border-neutral-800">
                                 <button onClick={() => triggerToast('Settings Saved!')} className="bg-white text-black px-6 py-3 rounded-md font-bold shadow-lg hover:bg-neutral-200 transition-colors border-b-[4px] border-neutral-400 active:border-b-0 active:translate-y-[4px]">Save Changes</button>
                             </div>
                         </div>
                     )}
                    {activeTab === 'integrations' && (
                        <div className="space-y-6">
                            {canvasConnected ? (
                                <div className="bg-black border border-neutral-800 rounded-lg p-6 flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-red-500/20 text-red-500 rounded-lg flex items-center justify-center border border-red-500/20 font-bold text-xl">C</div>
                                        <div>
                                            <div className="font-bold text-white">Canvas LMS</div>
                                            <div className="text-xs text-neutral-500">Connected as {canvasEmail}</div>
                                        </div>
                                    </div>
                                    <button onClick={handleDisconnectCanvas} className="text-red-500 hover:text-red-400 font-bold text-sm border border-red-900 bg-red-900/20 px-4 py-2 rounded-md">Disconnect</button>
                                </div>
                            ) : (
                                <div className="bg-black border border-neutral-800 rounded-lg p-6">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 bg-red-500/20 text-red-500 rounded-lg flex items-center justify-center border border-red-500/20 font-bold text-xl">C</div>
                                        <div>
                                            <div className="font-bold text-white">Canvas LMS</div>
                                            <div className="text-xs text-neutral-500">Not connected</div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Canvas Domain</label>
                                            <input 
                                                type="text" 
                                                value={canvasDomain}
                                                onChange={(e) => setCanvasDomain(e.target.value)}
                                                placeholder="e.g., school.instructure.com"
                                                className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-4 py-3 text-white focus:border-red-500 outline-none transition-colors placeholder-neutral-600" 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Canvas API Token</label>
                                            <input 
                                                type="password" 
                                                value={canvasToken}
                                                onChange={(e) => setCanvasToken(e.target.value)}
                                                placeholder="Paste your Canvas API token"
                                                className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-4 py-3 text-white focus:border-red-500 outline-none transition-colors placeholder-neutral-600" 
                                            />
                                            <p className="text-xs text-neutral-500 mt-2">
                                                Get your token from Canvas → Account → Settings → New Access Token
                                            </p>
                                        </div>
                                        <button onClick={handleConnectCanvas} className="bg-red-600 text-white px-6 py-3 rounded-md font-bold shadow-lg hover:bg-red-700 transition-colors border-b-[4px] border-red-800 active:border-b-0 active:translate-y-[4px]">Connect Canvas</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                 </div>
             </div>
        </div>
    );
};

// --- Main Dashboard Component ---
export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<StudentDashboardView>('dashboard');
  const [focusMode, setFocusMode] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [selectedDeck, setSelectedDeck] = useState<any>(null);
  const [calendarEvent, setCalendarEvent] = useState<any>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [courses, setCourses] = useState<CanvasCourse[]>([]);
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [assignments, setAssignments] = useState<CanvasAssignment[]>([]);
  const [aiTasks, setAiTasks] = useState<AITask[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [canvasConnected, setCanvasConnected] = useState(false);
  
  const triggerToast = (msg: string) => {
      setToastMessage(msg);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
  };

  const fetchCanvasData = async () => {
    try {
      // Fetch courses
      const coursesRes = await fetch('/api/canvas/courses', { credentials: 'include' });
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        if (!coursesData.needsSetup && coursesData.courses) {
          setCourses(coursesData.courses);
          setCanvasConnected(true);
        }
      }

      // Fetch tasks (includes assignments and AI-generated tasks)
      const tasksRes = await fetch('/api/tasks', { credentials: 'include' });
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setAssignments(tasksData.assignments || []);
        setAiTasks(tasksData.tasks || []);
        setCalendarEvents(tasksData.calendarEvents || []);
      }
    } catch (error) {
      console.error('Failed to fetch Canvas data:', error);
    }
  };

  const generateAiTasks = async () => {
    try {
      triggerToast('Generating AI study tasks...');
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'generate' })
      });
      
      if (res.ok) {
        const data = await res.json();
        setAssignments(data.assignments || []);
        setAiTasks(data.tasks || []);
        setCalendarEvents(data.calendarEvents || []);
        triggerToast(`Generated ${data.generated || 0} new study tasks!`);
      } else {
        const error = await res.json();
        triggerToast(error.error || 'Failed to generate tasks');
      }
    } catch (error) {
      console.error('Failed to generate AI tasks:', error);
      triggerToast('Failed to generate tasks');
    }
  };

  const toggleTask = async (taskId: string) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'toggle', taskId })
      });
      
      if (res.ok) {
        const data = await res.json();
        setAiTasks(data.tasks || []);
      }
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        setUser(data.user);

        // Fetch stats
        const statsRes = await fetch('/api/stats', { credentials: 'include' });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.stats);
        }

        // Fetch flashcards
        const flashcardsRes = await fetch('/api/flashcards', { credentials: 'include' });
        if (flashcardsRes.ok) {
          const flashcardsData = await flashcardsRes.json();
          setFlashcardSets(flashcardsData.flashcardSets || []);
        }

        // Fetch Canvas data
        await fetchCanvasData();

      } catch (error) {
        console.error('Failed to fetch user:', error);
        router.push('/login');
      }
      setLoading(false);
    };

    fetchUserData();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST', credentials: 'include' });
      router.push('/');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex font-sans text-neutral-200 selection:bg-brand-500 selection:text-white relative overflow-hidden">
      
      {/* Toast */}
      <div className={`fixed top-4 right-4 z-50 transition-all duration-300 transform ${showToast ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'}`}>
          <div className="bg-white text-black px-6 py-4 rounded-lg shadow-2xl border-l-4 border-green-500 font-bold flex items-center gap-3">
              <CheckCircle size={20} className="text-green-600"/>
              {toastMessage}
          </div>
      </div>

      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-red-600/30 rounded-full blur-[150px] mix-blend-screen animate-pulse-slow"></div>
          <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-red-900/40 rounded-full blur-[150px] mix-blend-screen"></div>
          <div className="absolute top-[30%] right-[20%] w-[60%] h-[60%] bg-red-500/20 rounded-full blur-[120px] mix-blend-screen animate-float"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-black to-black pointer-events-none z-0"></div>
      </div>

      {/* Sidebar */}
      <aside 
        className={`${isSidebarCollapsed ? 'w-20' : 'w-72'} bg-[#0a0a0a] text-white flex flex-col flex-shrink-0 sticky top-0 h-screen z-30 shadow-[5px_0_30px_rgba(0,0,0,0.5)] border-r border-white/10 transition-all duration-300 ease-in-out`}
      >
        <div className={`p-6 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} mb-2`}>
          <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center font-serif font-bold text-2xl text-white shadow-[0_10px_20px_-5px_rgba(220,38,38,0.5),inset_0_2px_4px_rgba(255,255,255,0.3)] border-t border-red-400 border-b-[4px] border-b-red-950 active:border-b-0 active:translate-y-[4px] transition-all relative group shrink-0">
             <span className="relative z-10 drop-shadow-md">C</span>
             <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          {!isSidebarCollapsed && <span className="font-bold text-xl tracking-tight text-white animate-fade-in">CanvasAI</span>}
        </div>

        <nav className="flex-1 px-3 space-y-2 overflow-y-auto no-scrollbar">
          {!isSidebarCollapsed && <div className="px-4 py-2 text-xs font-bold text-neutral-500 uppercase tracking-wider mt-2 animate-fade-in">Main</div>}
          
          {[
            { id: 'dashboard', icon: LayoutGrid, label: 'Dashboard' },
            { id: 'agent', icon: Sparkles, label: 'AI Agent' },
            { id: 'courses', icon: BookOpen, label: 'Courses' },
            { id: 'calendar', icon: CalendarIcon, label: 'Calendar' },
            { id: 'decks', icon: Brain, label: 'Study Decks' },
            { id: 'leaderboard', icon: Trophy, label: 'Leaderboard' },
            { id: 'messages', icon: MessageSquare, label: 'Messages' },
          ].map((item) => (
            <button 
                key={item.id} 
                onClick={() => setActiveView(item.id as StudentDashboardView)} 
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-start gap-3'} px-3 py-3 rounded-md text-sm font-medium transition-all duration-200 group relative overflow-hidden ${activeView === item.id ? 'bg-red-600 text-white shadow-lg shadow-red-900/50 border-b-[3px] border-red-800' : 'text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
                title={isSidebarCollapsed ? item.label : ''}
            >
              <item.icon size={20} className={activeView === item.id ? 'text-white' : 'text-neutral-500 group-hover:text-white'} />
              {!isSidebarCollapsed && <span>{item.label}</span>}
              {isSidebarCollapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-2 bg-neutral-900 text-white text-xs font-bold rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none border border-white/10">
                      {item.label}
                  </div>
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 mt-auto border-t border-white/5 flex flex-col gap-4 relative bg-[#0a0a0a]">
             {/* Profile Menu */}
             {isProfileMenuOpen && (
                 <div className={`absolute bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.9)] overflow-hidden animate-fade-in-up z-50 ring-1 ring-white/5 ${isSidebarCollapsed ? 'left-full bottom-0 ml-4 w-60' : 'bottom-full left-0 mb-4 w-[calc(100%-2rem)] mx-4'}`}>
                      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
                      <div className="p-2 space-y-1 relative z-10">
                          <div className="px-3 py-2 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">My Account</div>
                          <button onClick={() => {setActiveView('settings'); setIsProfileMenuOpen(false)}} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold text-neutral-300 hover:text-white hover:bg-white/5 transition-all text-left group border border-transparent hover:border-white/5">
                              <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center text-neutral-400 group-hover:text-white group-hover:scale-110 transition-all border border-white/5">
                                  <Settings size={16} />
                              </div>
                              Settings
                          </button>
                          <div className="h-px bg-white/5 my-1"></div>
                          <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-900/10 transition-all text-left group border border-transparent hover:border-red-500/10">
                              <div className="w-8 h-8 rounded-lg bg-red-900/20 flex items-center justify-center text-red-500 group-hover:scale-110 transition-all border border-red-500/20">
                                  <LogOut size={16} />
                              </div>
                              Sign Out
                          </button>
                      </div>
                 </div>
             )}

             {/* Collapse Button */}
             <button 
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="w-full flex items-center justify-center p-2 rounded-md hover:bg-white/5 text-neutral-500 hover:text-white transition-colors"
             >
                 {isSidebarCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
             </button>

             {/* User Profile */}
            <button 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className={`w-full bg-[#111] rounded-lg border border-white/5 shadow-lg relative overflow-hidden group cursor-pointer hover:bg-[#1a1a1a] transition-colors border-b-4 border-black text-left ${isSidebarCollapsed ? 'p-2' : 'p-4'}`}
            >
                <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} relative z-10`}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-purple-600 p-[2px] shadow-lg shrink-0">
                         <div className="w-full h-full bg-black rounded-full overflow-hidden">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`} alt="User" className="w-full h-full object-cover" />
                         </div>
                    </div>
                    {!isSidebarCollapsed && (
                        <div className="min-w-0 flex-1">
                            <div className="text-sm font-bold text-white group-hover:text-red-400 transition-colors truncate">{user?.name || 'User'}</div>
                            <div className="text-[10px] font-bold text-neutral-500 bg-black/30 px-2 py-0.5 rounded inline-block mt-0.5">FREE</div>
                        </div>
                    )}
                    {!isSidebarCollapsed && <ChevronUp size={16} className={`text-neutral-500 transition-transform duration-300 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />}
                </div>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative bg-black/80 transition-all duration-300">
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none z-0"></div>
        
        {/* Header */}
        {activeView !== 'agent' && activeView !== 'calendar' && (
        <header className="bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5 h-20 flex items-center justify-between px-8 sticky top-0 z-20 shrink-0 shadow-sm">
           <div className="flex items-center gap-4 w-96 relative">
               <Search size={20} className="text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
               <input type="text" placeholder="Search assignments, flashcards..." className="w-full bg-[#111] border border-white/10 text-sm rounded-md pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder-neutral-600 text-neutral-300 shadow-inner" />
           </div>
           <div className="flex items-center gap-6">
               <div className="relative">
                   <button onClick={() => setShowNotifications(!showNotifications)} className={`relative w-10 h-10 rounded-md bg-[#111] border border-white/10 text-neutral-400 hover:text-neutral-200 hover:bg-[#1a1a1a] transition-all flex items-center justify-center shadow-sm ${showNotifications ? 'bg-neutral-800 text-white' : ''}`}>
                       <Bell size={20} />
                       <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-neutral-900 shadow-sm"></span>
                   </button>
                   {showNotifications && (
                       <div className="absolute top-12 right-0 w-80 bg-[#111] border border-white/10 rounded-xl shadow-2xl p-4 animate-fade-in-up z-50">
                           <h4 className="font-bold text-white mb-4 text-sm">Notifications</h4>
                           <div className="space-y-3">
                               <div className="flex gap-3 items-start border-b border-white/5 pb-3">
                                   <div className="mt-1 w-2 h-2 bg-blue-500 rounded-full shrink-0"></div>
                                   <div>
                                       <p className="text-xs text-neutral-300">Welcome to CanvasAI! Start by exploring the dashboard.</p>
                                       <p className="text-[10px] text-neutral-500 mt-1">Just now</p>
                                   </div>
                               </div>
                           </div>
                       </div>
                   )}
               </div>
               <div className="h-8 w-px bg-white/10"></div>
               <div className="flex items-center gap-2 text-sm font-bold text-neutral-400 bg-[#111] border border-white/10 px-3 py-1.5 rounded-md shadow-sm">
                   <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                   <span>System Active</span>
               </div>
           </div>
        </header>
        )}

        {/* Content Area */}
        <div className={`mx-auto w-full h-full relative z-10 ${
            (activeView === 'agent' || activeView === 'calendar') 
            ? 'p-0 overflow-hidden' 
            : 'p-8 pb-24 overflow-y-auto custom-scrollbar'
        }`}>
            {activeView === 'dashboard' && <DashboardContent setActiveView={setActiveView} focusMode={focusMode} setFocusMode={setFocusMode} triggerToast={triggerToast} user={user} stats={stats} assignments={assignments} aiTasks={aiTasks} calendarEvents={calendarEvents} canvasConnected={canvasConnected} generateAiTasks={generateAiTasks} toggleTask={toggleTask} />}
            {activeView === 'agent' && <AgentChatContent setActiveView={setActiveView} />}
            {activeView === 'courses' && <CoursesContent setActiveView={setActiveView} triggerToast={triggerToast} setSelectedCourse={setSelectedCourse} courses={courses} />}
            {activeView === 'calendar' && <CalendarContent setActiveView={setActiveView} triggerToast={triggerToast} assignments={assignments} aiTasks={aiTasks} calendarEvents={calendarEvents} toggleTask={toggleTask} generateAiTasks={generateAiTasks} />}
            {activeView === 'decks' && <DecksContent setActiveView={setActiveView} triggerToast={triggerToast} setSelectedDeck={setSelectedDeck} flashcardSets={flashcardSets} />}
            {activeView === 'leaderboard' && <LeaderboardContent setActiveView={setActiveView} />}
            {activeView === 'messages' && <MessagesContent setActiveView={setActiveView} triggerToast={triggerToast} />}
            {activeView === 'settings' && <SettingsContent triggerToast={triggerToast} user={user} />}
        </div>
      </main>
    </div>
  );
}
