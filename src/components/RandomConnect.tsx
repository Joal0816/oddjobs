'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Users, 
  Send, 
  ShieldCheck, 
  MessageSquare, 
  Sparkles, 
  CheckCircle2, 
  Search,
  X
} from 'lucide-react';
import Image from 'next/image';

interface MatchedStudent {
  id: string;
  name: string;
  avatar: string;
  university: string;
  course: string;
  yearLevel: string;
  interests: string[];
  skills: string[];
  bio: string;
  rating: number;
}

const PEER_STUDENTS: MatchedStudent[] = [
  {
    id: 'peer_1',
    name: 'Andrea Mae',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    university: 'MSU-IIT',
    course: 'BS Information Technology',
    yearLevel: '2nd Year',
    interests: ['Graphic Design', 'Figma', 'UI/UX', 'Photography'],
    skills: ['Figma', 'Photoshop', 'Canva', 'Illustration'],
    bio: 'Looking to collaborate with developers on campus startup ideas and design pubmats.',
    rating: 4.8
  },
  {
    id: 'peer_2',
    name: 'Kevin Vance',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    university: 'MSU-IIT',
    course: 'BS Electronics Engineering',
    yearLevel: '4th Year',
    interests: ['Robotics', 'Hardware', 'Arduino', 'Python'],
    skills: ['C++', 'IoT', 'Soldering', 'Calculus Tutor'],
    bio: 'Hardware builder open for peer tutoring sessions and IoT odd jobs around campus.',
    rating: 5.0
  },
  {
    id: 'peer_3',
    name: 'Patricia Santos',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    university: 'MSU-IIT',
    course: 'BS Accountancy',
    yearLevel: '3rd Year',
    interests: ['Bookkeeping', 'Excel', 'Events', 'Public Speaking'],
    skills: ['Excel Data Entry', 'Financial Statements', 'Event Hosting'],
    bio: 'Organized and meticulous. Available for business org spreadsheets and event ushering.',
    rating: 4.9
  },
  {
    id: 'peer_4',
    name: 'Joshua Alcantara',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    university: 'MSU-IIT',
    course: 'BS Computer Applications',
    yearLevel: '3rd Year',
    interests: ['Web Development', 'Next.js', 'Tailwind CSS', 'Freelance'],
    skills: ['React', 'TypeScript', 'Node.js', 'Figma'],
    bio: 'Fullstack builder looking for partners to take on campus org web contracts.',
    rating: 4.9
  },
  {
    id: 'peer_5',
    name: 'Samantha Cruz',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    university: 'MSU-IIT',
    course: 'BS Civil Engineering',
    yearLevel: '3rd Year',
    interests: ['Math', 'Calculus', 'Drafting', 'AutoCAD'],
    skills: ['Calculus', 'Drafting', 'Tutoring', 'Ushering'],
    bio: 'Passionate about engineering mathematics and peer tutoring.',
    rating: 4.95
  }
];

const PRESET_TOPICS = [
  'Hey! Are you open to collaborating on campus client gigs?',
  'Looking for a project partner for the upcoming campus hackathon!',
  'Saw your skills! Would love to team up on design and dev tasks.'
];

export const RandomConnect: React.FC = () => {
  const { showToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeChatPeer, setActiveChatPeer] = useState<MatchedStudent | null>(null);
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; sender: 'me' | 'peer'; text: string }>>([]);
  const [inputText, setInputText] = useState('');

  const categories = ['All', 'Computer Studies', 'Engineering', 'Accountancy'];

  const filteredPeers = PEER_STUDENTS.filter(peer => {
    const matchesSearch = 
      peer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      peer.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      peer.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = 
      selectedCategory === 'All' || 
      peer.course.toLowerCase().includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  const handleOpenChat = (peer: MatchedStudent) => {
    setActiveChatPeer(peer);
    setChatMessages([
      {
        id: 'msg_1',
        sender: 'peer',
        text: `Hey there! I am ${peer.name} from ${peer.course}. What campus project are you working on?`
      }
    ]);
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || !activeChatPeer) return;

    const newMsg = { id: `msg_${Date.now()}`, sender: 'me' as const, text };
    setChatMessages(prev => [...prev, newMsg]);
    setInputText('');

    // Simulated quick peer reply
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          id: `msg_${Date.now() + 1}`,
          sender: 'peer',
          text: `Sounds great! Let's connect on campus or set up an agreement on oddJobs!`
        }
      ]);
      showToast({
        type: 'info',
        title: `Reply from ${activeChatPeer.name}`,
        message: 'Message delivered in peer chat.'
      });
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-28 text-white w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 text-amber-400 mb-1">
          <Users className="w-4 h-4" />
          <span className="text-xs uppercase font-extrabold tracking-wider">Campus Collaboration Hub</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Peer Connect
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Connect with verified MSU-IIT students for gig partnerships, hackathon teams, and peer tutoring.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search students by name, course, or skills (Figma, Python, Tutoring...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-400 text-black font-bold'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Peer Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPeers.map(peer => (
          <div
            key={peer.id}
            className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 hover:border-amber-500/40 transition-all flex flex-col justify-between shadow-lg group"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden ring-1 ring-amber-500/40 flex-shrink-0">
                    <Image
                      src={peer.avatar}
                      alt={peer.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors flex items-center space-x-1">
                      <span>{peer.name}</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                    </h3>
                    <p className="text-[11px] text-zinc-400 leading-tight">
                      {peer.course}
                    </p>
                    <span className="text-[10px] text-amber-400 font-semibold">
                      {peer.yearLevel} • {peer.rating} ★
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed mb-3">
                {peer.bio}
              </p>

              <div className="flex flex-wrap gap-1 mb-4">
                {peer.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700/50"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleOpenChat(peer)}
              className="w-full py-2 rounded-xl bg-zinc-800 group-hover:bg-amber-400 group-hover:text-black font-semibold text-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Connect & Chat</span>
            </button>
          </div>
        ))}
      </div>

      {/* Peer Chat Drawer / Modal */}
      {activeChatPeer && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setActiveChatPeer(null)}
        >
          <div 
            className="w-full max-w-lg bg-[#0f0f14] rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl flex flex-col h-[520px]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Chat Header */}
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80">
              <div className="flex items-center space-x-3">
                <div className="relative w-9 h-9 rounded-full overflow-hidden ring-1 ring-amber-500/40">
                  <Image
                    src={activeChatPeer.avatar}
                    alt={activeChatPeer.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center space-x-1">
                    <span>{activeChatPeer.name}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                  </h3>
                  <p className="text-[11px] text-zinc-400">{activeChatPeer.course}</p>
                </div>
              </div>

              <button
                onClick={() => setActiveChatPeer(null)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Starters */}
            <div className="p-2.5 bg-zinc-950/70 border-b border-zinc-800/80 flex items-center space-x-1.5 overflow-x-auto scrollbar-none">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 ml-1" />
              {PRESET_TOPICS.map((topic, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(topic)}
                  className="text-[10px] px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-amber-300 hover:border-amber-500/40 whitespace-nowrap transition-colors cursor-pointer"
                >
                  {topic.slice(0, 32)}...
                </button>
              ))}
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {chatMessages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[78%] p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'me'
                        ? 'bg-amber-500 text-black font-medium rounded-br-none shadow-md'
                        : 'bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-3 border-t border-zinc-800 bg-zinc-900/60 flex items-center space-x-2">
              <input
                type="text"
                placeholder={`Message ${activeChatPeer.name.split(' ')[0]}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={() => handleSendMessage()}
                className="p-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black cursor-pointer shadow-md transition-colors"
              >
                <Send className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
