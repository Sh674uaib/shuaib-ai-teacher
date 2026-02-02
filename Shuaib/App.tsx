
import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, Send, User, Bot, RefreshCw, Trash2, HelpCircle, Plus, Camera, Image as ImageIcon, Mic, X, ChevronLeft, History, MessageSquare } from 'lucide-react';
import { Message, Attachment, ChatSession } from './types';
import { createChatSession, sendMessageStream } from './services/geminiService';
import MarkdownRenderer from './components/MarkdownRenderer';
import AboutModal from './components/AboutModal';

const App: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  
  const chatInstance = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Persistence: Load sessions from localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem('shuaib_v2_sessions');
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        const hydrated = parsed.map((s: any) => ({
          ...s,
          lastModified: new Date(s.lastModified),
          messages: s.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }))
        }));
        setSessions(hydrated);
      } catch (e) {
        console.error("Failed to load sessions", e);
      }
    }
    chatInstance.current = createChatSession();
  }, []);

  // Persistence: Save sessions to localStorage whenever they change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('shuaib_v2_sessions', JSON.stringify(sessions));
    } else {
      localStorage.removeItem('shuaib_v2_sessions');
    }
  }, [sessions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSessionId, sessions, isLoading]);

  const currentSession = sessions.find(s => s.id === currentSessionId);
  const currentMessages = currentSession?.messages || [];

  const convertToBase64 = (file: File): Promise<{ data: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve({ data: base64String, mimeType: file.type });
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { data, mimeType } = await convertToBase64(file);
      setAttachment({
        type: 'image',
        data,
        mimeType,
        url: URL.createObjectURL(file)
      });
      setShowMenu(false);
    } catch (error) {
      console.error('File conversion error:', error);
    }
  };

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      setShowMenu(false);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert("ক্যামেরা চালু করতে সমস্যা হয়েছে। দয়া করে পারমিশন চেক করো।");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        const base64 = dataUrl.split(',')[1];
        
        setAttachment({
          type: 'image',
          data: base64,
          mimeType: 'image/jpeg',
          url: dataUrl
        });
        stopCamera();
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1];
          setAttachment({
            type: 'audio',
            data: base64String,
            mimeType: 'audio/webm',
            url: URL.createObjectURL(blob)
          });
        };
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setShowMenu(false);
    } catch (error) {
      console.error('Microphone error:', error);
      alert('মাইক্রোফোন অ্যাক্সেস করতে সমস্যা হয়েছে।');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSend = async (customInput?: string) => {
    const textToSend = (customInput || input).trim();
    if ((!textToSend && !attachment) || isLoading) return;

    let targetId = currentSessionId;
    
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      attachment: attachment || undefined,
      timestamp: new Date(),
    };

    if (!targetId) {
      targetId = Date.now().toString();
      const newSess: ChatSession = {
        id: targetId,
        title: textToSend.substring(0, 35) || "নতুন চ্যাট",
        subject: 'General',
        messages: [userMsg],
        lastModified: new Date()
      };
      setSessions(prev => [newSess, ...prev]);
      setCurrentSessionId(targetId);
      chatInstance.current = createChatSession([userMsg]);
    } else {
      setSessions(prev => prev.map(s => 
        s.id === targetId ? { ...s, messages: [...s.messages, userMsg], lastModified: new Date() } : s
      ));
    }

    const activeAttachment = attachment;
    setInput('');
    setAttachment(null);
    setIsLoading(true);

    const botMsgId = (Date.now() + 1).toString();
    const botMsg: Message = {
      id: botMsgId,
      role: 'model',
      content: '',
      timestamp: new Date(),
    };
    
    setSessions(prev => prev.map(s => 
      s.id === targetId ? { ...s, messages: [...s.messages, botMsg] } : s
    ));

    try {
      const stream = sendMessageStream(chatInstance.current, textToSend, activeAttachment || undefined);
      let responseText = '';
      for await (const chunk of stream) {
        responseText += chunk;
        setSessions(prev => prev.map(s => 
          s.id === targetId ? {
            ...s,
            messages: s.messages.map(m => m.id === botMsgId ? { ...m, content: responseText } : m)
          } : s
        ));
      }
    } catch (error) {
      console.error('Streaming error:', error);
      setSessions(prev => prev.map(s => 
        s.id === targetId ? {
          ...s,
          messages: s.messages.map(m => m.id === botMsgId ? { ...m, content: 'দুঃখিত, কোনো একটি সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করো।' } : m)
        } : s
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSession = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm("তুমি কি নিশ্চিত যে এই চ্যাটটি ডিলিট করতে চাও?")) {
      setSessions(prev => {
        const filtered = prev.filter(s => s.id !== id);
        return filtered;
      });
      
      if (currentSessionId === id) {
        setCurrentSessionId(null);
        chatInstance.current = createChatSession();
      }
    }
  };

  const handleNewChat = () => {
    setCurrentSessionId(null);
    chatInstance.current = createChatSession();
    setAttachment(null);
    setInput('');
    setShowMenu(false);
    if (window.innerWidth < 768) setShowHistory(false);
  };

  const selectSession = (id: string) => {
    setCurrentSessionId(id);
    const session = sessions.find(s => s.id === id);
    chatInstance.current = createChatSession(session?.messages || []);
    if (window.innerWidth < 768) setShowHistory(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-['Hind_Siliguri']">
      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
      
      {/* Side History */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out shadow-2xl ${showHistory ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 ${!showHistory ? 'md:hidden' : 'md:block'}`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <History size={18} className="text-emerald-500" />
              পূর্ববর্তী চ্যাট
            </h2>
            <button onClick={() => setShowHistory(false)} className="md:hidden p-1 hover:bg-slate-100 rounded-lg">
              <ChevronLeft size={20} />
            </button>
          </div>
          
          <div className="p-4">
            <button 
              onClick={handleNewChat}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 font-bold active:scale-95 mb-4"
            >
              <Plus size={18} />
              নতুন চ্যাট
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
             {sessions.length === 0 ? (
               <div className="flex flex-col items-center justify-center mt-10 text-center px-4">
                 <MessageSquare size={32} className="text-slate-200 mb-2" />
                 <p className="text-xs text-slate-400">এখনো কোনো চ্যাট ইতিহাস নেই। নতুন চ্যাট শুরু করো!</p>
               </div>
             ) : (
               <div className="space-y-2">
                 <div className="text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-widest px-2">চ্যাট লিস্ট</div>
                 {sessions.map(s => (
                    <div
                      key={s.id}
                      onClick={() => selectSession(s.id)}
                      className={`w-full group flex items-center justify-between p-3 rounded-xl transition-all border cursor-pointer relative overflow-hidden ${
                        currentSessionId === s.id 
                          ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                          : 'bg-white border-transparent hover:bg-slate-50 text-slate-600 hover:border-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden flex-1 pointer-events-none">
                        <MessageSquare size={16} className={currentSessionId === s.id ? 'text-emerald-500' : 'text-slate-300'} />
                        <span className="text-sm font-semibold truncate pr-8">{s.title}</span>
                      </div>
                      <button 
                        type="button"
                        onClick={(e) => deleteSession(e, s.id)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-red-100 hover:text-red-600 rounded-lg transition-all text-slate-300 md:opacity-0 md:group-hover:opacity-100 z-20"
                        title="চ্যাট ডিলিট করুন"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                 ))}
               </div>
             )}
          </div>
        </div>
      </aside>

      <div className="flex flex-col flex-1 min-w-0">
        <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
        
        {isCameraActive && (
          <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
            <div className="relative w-full h-full max-w-2xl bg-black overflow-hidden flex flex-col">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <canvas ref={canvasRef} className="hidden" />
              <div className="absolute top-6 left-6 right-6 flex justify-between">
                <button onClick={stopCamera} className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white">
                  <X size={24} />
                </button>
              </div>
              <div className="absolute bottom-10 left-0 right-0 flex justify-center items-center gap-8">
                <button onClick={capturePhoto} className="w-20 h-20 bg-white rounded-full border-4 border-slate-300 shadow-xl flex items-center justify-center active:scale-90 transition-transform">
                  <div className="w-16 h-16 bg-white rounded-full border-2 border-slate-800" />
                </button>
              </div>
            </div>
          </div>
        )}

        <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowHistory(!showHistory)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
              <History size={20} />
            </button>
            <div className="bg-emerald-500 p-2 rounded-xl hidden sm:block shadow-sm">
              <BookOpen className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-tight">Shuaib 2.0 AI</h1>
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Digital Teacher</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowAbout(true)}
              className="p-2 hover:bg-slate-100 text-slate-400 rounded-lg transition-colors"
              title="আমাদের সম্পর্কে"
            >
              <HelpCircle size={20} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 flex flex-col items-center scroll-smooth bg-[#fafbfc]">
          <div className="w-full max-w-3xl space-y-4">
            {!currentSessionId || currentMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in w-full">
                <div className="bg-emerald-50 p-10 rounded-[2.5rem] shadow-2xl border border-emerald-100 w-full max-w-lg relative overflow-hidden">
                  <div className="bg-white w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg animate-float">
                    <Bot className="text-emerald-600 w-12 h-12" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">আসসালামু আলাইকুম!</h2>
                  <p className="text-slate-600 mb-10 leading-relaxed text-lg px-4">
                    আমি <span className="text-emerald-600 font-bold">Shuaib 2.0 AI</span>। তোমার ডিজিটাল শিক্ষক। ৬ষ্ঠ থেকে ১০ম শ্রেণীর যেকোনো বিষয়ের সমাধান আমি দিতে পারি।
                  </p>
                  <div className="grid grid-cols-1 gap-4 text-left">
                    <button onClick={() => handleSend("নিউটনের গতির দ্বিতীয় সূত্রটি বুঝিয়ে দাও।")} className="p-5 text-sm bg-white hover:bg-emerald-100/50 border border-emerald-100 rounded-[1.5rem] transition-all hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-50 text-slate-700 font-semibold flex items-center justify-between group">
                      <span>"নিউটনের গতির দ্বিতীয় সূত্রটি বুঝিয়ে দাও।"</span>
                      <div className="p-2 bg-slate-50 rounded-lg shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                        <ChevronLeft size={16} className="rotate-180" />
                      </div>
                    </button>
                    <button onClick={() => handleSend("মৌল ও যোগের মধ্যে পার্থক্য কী?")} className="p-5 text-sm bg-white hover:bg-emerald-100/50 border border-emerald-100 rounded-[1.5rem] transition-all hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-50 text-slate-700 font-semibold flex items-center justify-between group">
                      <span>"মৌল ও যোগের মধ্যে পার্থক্য কী?"</span>
                      <div className="p-2 bg-slate-50 rounded-lg shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                        <ChevronLeft size={16} className="rotate-180" />
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 pb-20 pt-4">
                {currentMessages.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${msg.role === 'user' ? 'bg-indigo-600 ring-2 ring-indigo-100' : 'bg-emerald-500 ring-2 ring-emerald-100'}`}>
                      {msg.role === 'user' ? <User size={20} className="text-white" /> : <Bot size={20} className="text-white" />}
                    </div>
                    <div className={`max-w-[85%] px-5 py-4 rounded-3xl shadow-sm border ${msg.role === 'user' ? 'bg-indigo-600 text-white border-indigo-700 rounded-tr-none' : 'bg-white text-slate-800 border-slate-200 rounded-tl-none'}`}>
                      {msg.attachment && (
                        <div className="mb-4 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-inner">
                          {msg.attachment.type === 'image' ? <img src={msg.attachment.url} alt="User upload" className="max-h-80 w-auto object-contain cursor-pointer mx-auto" onClick={() => window.open(msg.attachment?.url)} /> : <audio controls src={msg.attachment.url} className="w-full h-12 p-1" />}
                        </div>
                      )}
                      {msg.role === 'model' && msg.content === '' && isLoading ? (
                        <div className="flex gap-1.5 py-2 items-center">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                        </div>
                      ) : <MarkdownRenderer content={msg.content} />}
                      <div className={`text-[10px] mt-3 opacity-60 font-bold uppercase tracking-widest ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && currentMessages[currentMessages.length - 1]?.role !== 'model' && (
                  <div className="flex gap-3 animate-fade-in">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg ring-2 ring-emerald-100"><Bot size={20} className="text-white" /></div>
                    <div className="max-w-[85%] px-6 py-5 rounded-3xl shadow-sm border bg-white text-slate-800 border-slate-200 rounded-tl-none">
                      <div className="flex gap-1.5 py-1">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </main>

        <footer className="bg-white border-t border-slate-200 p-5 sticky bottom-0 z-10 shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.05)]">
          <div className="max-w-3xl mx-auto relative">
            {attachment && (
              <div className="absolute bottom-full mb-6 left-0 bg-white border border-slate-200 p-3 rounded-3xl shadow-2xl flex items-center gap-4 animate-slide-up border-b-4 border-emerald-500">
                <div className="w-16 h-16 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100 shadow-inner">
                  {attachment.type === 'image' ? <img src={attachment.url} className="w-full h-full object-cover" /> : <Mic className="text-emerald-500" size={32} />}
                </div>
                <div className="flex-1 min-w-[160px]">
                  <p className="text-sm font-black text-slate-800">{attachment.type === 'image' ? 'ছবি সিলেক্ট করা হয়েছে' : 'ভয়েস রেকর্ড করা হয়েছে'}</p>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{attachment.type}</p>
                </div>
                <button onClick={() => setAttachment(null)} className="p-2 bg-slate-100 hover:bg-red-50 hover:text-red-500 rounded-full text-slate-400 transition-all active:scale-90"><X size={20} /></button>
              </div>
            )}
            {showMenu && (
              <div className="absolute bottom-full mb-6 left-0 bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden animate-slide-up w-64 z-20 p-2">
                <button onClick={startCamera} className="w-full px-5 py-5 flex items-center gap-4 hover:bg-emerald-50 transition-all rounded-2xl active:scale-[0.98] group">
                  <div className="p-3 bg-emerald-100 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors"><Camera size={20} className="text-emerald-600 group-hover:text-white" /></div>
                  <span className="text-sm font-bold text-slate-700">Take Photo</span>
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="w-full px-5 py-5 flex items-center gap-4 hover:bg-blue-50 transition-all rounded-2xl active:scale-[0.98] group">
                  <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors"><ImageIcon size={20} className="text-blue-600 group-hover:text-white" /></div>
                  <span className="text-sm font-bold text-slate-700">Upload Photo</span>
                </button>
                <button onClick={startRecording} className="w-full px-5 py-5 flex items-center gap-4 hover:bg-rose-50 transition-all rounded-2xl active:scale-[0.98] group">
                  <div className="p-3 bg-rose-100 rounded-xl group-hover:bg-rose-600 group-hover:text-white transition-colors"><Mic size={20} className="text-rose-600 group-hover:text-white" /></div>
                  <span className="text-sm font-bold text-slate-700">Voice Message</span>
                </button>
              </div>
            )}
            {isRecording && (
              <div className="absolute inset-0 bg-white/95 rounded-3xl flex items-center justify-between px-8 z-30 shadow-inner border border-slate-100">
                <div className="flex items-center gap-5">
                  <div className="flex gap-1.5 items-center">
                    <div className="w-2 h-8 bg-rose-500 rounded-full animate-[bounce_1s_infinite_0ms]" />
                    <div className="w-2 h-12 bg-rose-500 rounded-full animate-[bounce_1s_infinite_200ms]" />
                    <div className="w-2 h-10 bg-rose-500 rounded-full animate-[bounce_1s_infinite_400ms]" />
                    <div className="w-2 h-14 bg-rose-500 rounded-full animate-[bounce_1s_infinite_600ms]" />
                  </div>
                  <span className="text-base font-black text-slate-700 tracking-wide uppercase">রেকর্ডিং হচ্ছে...</span>
                </div>
                <button onClick={stopRecording} className="px-8 py-3 bg-rose-600 text-white rounded-2xl text-sm font-black hover:bg-rose-700 shadow-xl shadow-rose-200 active:scale-95 transition-all">বন্ধ করো</button>
              </div>
            )}
            <div className="flex items-end gap-4">
              <button onClick={() => setShowMenu(!showMenu)} className={`p-4 rounded-[1.5rem] transition-all shadow-md border ${showMenu ? 'bg-slate-900 text-white rotate-45 border-slate-900' : 'bg-white text-slate-500 hover:bg-slate-50 border-slate-200 active:scale-95'}`}><Plus size={28} /></button>
              <div className="flex-1 relative">
                <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} placeholder="তোমার প্রশ্নটি এখানে লেখো..." className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] pl-6 pr-16 py-4.5 focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all shadow-inner resize-none min-h-[64px] max-h-40 text-slate-800 leading-relaxed font-medium" rows={1} />
                <button onClick={() => handleSend()} disabled={(!input.trim() && !attachment) || isLoading} className={`absolute right-3 bottom-3 p-3.5 rounded-2xl transition-all ${(!input.trim() && !attachment) || isLoading ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xl shadow-emerald-100 active:scale-90'}`}>
                  {isLoading ? <RefreshCw className="animate-spin" size={24} /> : <Send size={24} />}
                </button>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-center text-slate-400 mt-4 font-bold uppercase tracking-widest">Shuaib 2.0 AI ভুল করতে পারে। উত্তরের জন্য পাঠ্যবই অনুসরণ করো।</p>
        </footer>

        <style>{`
          @keyframes slide-up { from { opacity: 0; transform: translateY(30px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
          .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
          .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
          @keyframes bounce { 0%, 100% { transform: scaleY(0.5); } 50% { transform: scaleY(1); } }
          @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
          .animate-float { animation: float 4s ease-in-out infinite; }
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
        `}</style>
      </div>
    </div>
  );
};

export default App;
