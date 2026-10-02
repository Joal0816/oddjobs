'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Lock,
  Unlock,
  Cpu,
  Server,
  Terminal,
  Activity,
  Zap,
  Globe,
  RefreshCw,
  Play,
  RotateCcw,
  CheckCircle,
  Clock,
  ArrowRight,
  Database
} from 'lucide-react';

interface EdgeNode {
  id: string;
  name: string;
  region: string;
  status: 'online' | 'degraded' | 'offline';
  latency: number;
  cpu: number;
  memory: number;
  activeTasks: number;
}

interface ComputeTask {
  id: string;
  type: string;
  status: 'running' | 'completed' | 'queued';
  targetNode: string;
  timeStarted: string;
  progress: number;
}

export const EdgeCloudConsole: React.FC = () => {
  const { isCloudUnlocked, unlockCloud, lockCloud, setActiveTab } = useApp();
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeConsoleTab, setActiveConsoleTab] = useState<'telemetry' | 'terminal' | 'dispatcher'>('telemetry');

  // Node telemetry state
  const [nodes, setNodes] = useState<EdgeNode[]>([
    { id: 'node-msuiit-01', name: 'MSU-IIT Campus Node (CCS Lab)', region: 'Iligan, PH (ap-southeast-1)', status: 'online', latency: 12, cpu: 28, memory: 44, activeTasks: 4 },
    { id: 'node-vercel-iad1', name: 'Vercel Edge Gateway (iad1)', region: 'Virginia, US (iad1)', status: 'online', latency: 184, cpu: 15, memory: 31, activeTasks: 12 },
    { id: 'node-vercel-hkg1', name: 'Vercel Edge Edge Pop (hkg1)', region: 'Hong Kong, HK (hkg1)', status: 'online', latency: 42, cpu: 34, memory: 52, activeTasks: 7 },
    { id: 'node-cf-sin1', name: 'Cloudflare Worker Cache (sin1)', region: 'Singapore (sin1)', status: 'online', latency: 28, cpu: 19, memory: 38, activeTasks: 19 },
  ]);

  // Terminal state
  const [termHistory, setTermHistory] = useState<Array<{ text: string; type: 'cmd' | 'output' | 'error' | 'success' }>>([
    { text: 'oddJobs MSU-IIT Cloud & Edge Fabric [Version 2.4.0-edge]', type: 'output' },
    { text: 'Cluster authorization verified via token: oink#2026', type: 'success' },
    { text: 'Type "help" for a list of available edge orchestration commands.', type: 'output' },
  ]);
  const [commandInput, setCommandInput] = useState('');
  const termEndRef = useRef<HTMLDivElement>(null);

  // Dispatcher state
  const [tasks, setTasks] = useState<ComputeTask[]>([
    { id: 'TASK-8901', type: 'Student ID OCR & COR Verification', status: 'running', targetNode: 'MSU-IIT Campus Node', timeStarted: '12s ago', progress: 68 },
    { id: 'TASK-8902', type: 'Escrow Smart Contract State Sync', status: 'running', targetNode: 'Vercel Edge Gateway', timeStarted: '3s ago', progress: 32 },
    { id: 'TASK-8903', type: 'Campus Peer Skill Matching Index', status: 'completed', targetNode: 'Cloudflare Worker Cache', timeStarted: '45s ago', progress: 100 },
    { id: 'TASK-8904', type: 'Milestone Signature Cryptographic Hash', status: 'queued', targetNode: 'MSU-IIT Campus Node', timeStarted: 'Just now', progress: 0 },
  ]);

  // Telemetry jitter simulation
  useEffect(() => {
    if (!isCloudUnlocked) return;
    const interval = setInterval(() => {
      setNodes(prev =>
        prev.map(node => ({
          ...node,
          latency: Math.max(8, node.latency + Math.floor(Math.random() * 7) - 3),
          cpu: Math.min(95, Math.max(10, node.cpu + Math.floor(Math.random() * 9) - 4)),
          memory: Math.min(90, Math.max(20, node.memory + Math.floor(Math.random() * 5) - 2)),
          activeTasks: Math.max(1, node.activeTasks + (Math.random() > 0.6 ? (Math.random() > 0.5 ? 1 : -1) : 0)),
        }))
      );
    }, 3000);
    return () => clearInterval(interval);
  }, [isCloudUnlocked]);

  useEffect(() => {
    termEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [termHistory]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const success = unlockCloud(passwordInput);
    if (!success) {
      setErrorMsg('Access Denied: Invalid compute token or authorization password.');
      setPasswordInput('');
    }
  };

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = commandInput.trim();
    if (!cmd) return;

    const newHistory = [...termHistory, { text: `oddjobs-cloud@edge:~$ ${cmd}`, type: 'cmd' as const }];
    const parts = cmd.split(' ');
    const base = parts[0].toLowerCase();

    switch (base) {
      case 'help':
        newHistory.push({
          text: 'Available commands:\n  help            - List commands\n  status          - Cluster runtime health\n  nodes           - List registered edge nodes\n  ping <node>     - Test latency to node\n  deploy-worker   - Spawn new micro-task worker\n  bmc-audit       - Print MSU-IIT Business Model Canvas validation matrix\n  clear           - Clear terminal output\n  lock            - Revoke token and lock console',
          type: 'output',
        });
        break;
      case 'status':
        newHistory.push({
          text: 'Cluster: MSU-IIT Hyperlocal Edge\nStatus: 4/4 Nodes Healthy | Aggregated Throughput: 142 req/s | Escrow Relay: ACTIVE',
          type: 'success',
        });
        break;
      case 'nodes':
        newHistory.push({
          text: nodes.map(n => `[${n.status.toUpperCase()}] ${n.id} | ${n.name} | Latency: ${n.latency}ms | CPU: ${n.cpu}%`).join('\n'),
          type: 'output',
        });
        break;
      case 'ping':
        newHistory.push({
          text: `PING ${parts[1] || 'node-msuiit-01'}: 64 bytes from node: icmp_seq=1 ttl=58 time=${Math.floor(Math.random() * 25) + 10}ms`,
          type: 'success',
        });
        break;
      case 'deploy-worker':
        const newTaskId = `TASK-${Math.floor(1000 + Math.random() * 9000)}`;
        setTasks(prev => [{
          id: newTaskId,
          type: 'Edge Microservice Worker Instance',
          status: 'running',
          targetNode: 'MSU-IIT Campus Node',
          timeStarted: 'Just now',
          progress: 15,
        }, ...prev]);
        newHistory.push({ text: `Spawned worker container ${newTaskId} on MSU-IIT CCS Lab cluster.`, type: 'success' });
        break;
      case 'bmc-audit':
        newHistory.push({
          text: 'MSU-IIT oddJobs BMC Audit:\n  • Customer Segments: IIT Students, Faculty, Local Iligan MSMEs\n  • Value Proposition: Verified Peer Gigs + Automated Milestone Escrow\n  • Channel: Campus Webapp + Zero-dependency CLI\n  • Revenue Stream: 5-8% Platform facilitation on completed milestones',
          type: 'output',
        });
        break;
      case 'clear':
        setTermHistory([]);
        setCommandInput('');
        return;
      case 'lock':
        lockCloud();
        return;
      default:
        newHistory.push({ text: `command not found: ${base}. Type "help" for options.`, type: 'error' });
    }

    setTermHistory(newHistory);
    setCommandInput('');
  };

  const dispatchNewTask = (type: string) => {
    const newTaskId = `TASK-${Math.floor(1000 + Math.random() * 9000)}`;
    setTasks(prev => [{
      id: newTaskId,
      type,
      status: 'running',
      targetNode: 'MSU-IIT Campus Node',
      timeStarted: 'Just now',
      progress: 10,
    }, ...prev]);
  };

  // LOCKED STATE (PASSWORD GATE)
  if (!isCloudUnlocked) {
    return (
      <div className="min-h-screen pt-24 pb-20 px-4 flex items-center justify-center bg-[#08080a] relative overflow-hidden">
        {/* Ambient cyber glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-[90px] pointer-events-none" />

        <div className="w-full max-w-md bg-zinc-900/90 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(6,182,212,0.15)] relative z-10">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mx-auto mb-5 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>

          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-700/40 text-cyan-300 text-xs font-mono font-medium mb-2.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              oddJobs Cluster Security Gate
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Edge & Cloud Computing</h1>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
              Enter the authorized access key to initialize distributed MSU-IIT edge nodes and cloud compute telemetry.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider mb-2">
                Compute Access Key
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter cluster token..."
                  className="w-full bg-black/60 border border-zinc-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 text-white placeholder-zinc-500 px-4 py-3 rounded-xl font-mono text-sm tracking-wide transition-all outline-hidden"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 bottom-2 px-3.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer"
                >
                  <span>Verify</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {errorMsg && (
                <p className="text-xs text-rose-400 font-mono mt-2 flex items-center gap-1">
                  <span>⚠</span> {errorMsg}
                </p>
              )}
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-zinc-800/80 text-[11px] font-mono text-zinc-400 flex items-center justify-between">
              <span className="text-zinc-500">Authorized Token:</span>
              <button
                type="button"
                onClick={() => setPasswordInput('oink#2026')}
                className="text-amber-400 hover:underline cursor-pointer"
              >
                oink#2026 (fill)
              </button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-zinc-800/80 flex items-center justify-between">
            <button
              onClick={() => setActiveTab('home')}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
            >
              ← Back to Marketplace
            </button>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400/80">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Gateway Online
            </div>
          </div>
        </div>
      </div>
    );
  }

  // UNLOCKED STATE: EDGE & CLOUD COMPUTING CONSOLE
  return (
    <div className="min-h-screen pt-20 pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-[#08080a]">
      {/* Top Banner & Control Bar */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-900/80 border border-cyan-500/30 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">MSU-IIT Edge & Cloud Computing</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 font-mono">
              Cluster Token: <span className="text-amber-400 font-bold">oink#2026</span> • Region: ap-southeast-1 (Iligan City, PH)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('jobs')}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            Marketplace
          </button>
          <button
            onClick={lockCloud}
            className="px-3.5 py-2 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            Lock Console
          </button>
        </div>
      </div>

      {/* Console Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-zinc-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveConsoleTab('telemetry')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeConsoleTab === 'telemetry'
              ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Node & Cloud Telemetry</span>
        </button>
        <button
          onClick={() => setActiveConsoleTab('terminal')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeConsoleTab === 'terminal'
              ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Interactive Cloud Terminal</span>
        </button>
        <button
          onClick={() => setActiveConsoleTab('dispatcher')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeConsoleTab === 'dispatcher'
              ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Cluster Task Dispatcher</span>
        </button>
      </div>

      {/* TAB 1: TELEMETRY */}
      {activeConsoleTab === 'telemetry' && (
        <div className="space-y-6">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <p className="text-[11px] font-mono text-zinc-500 uppercase">Registered Nodes</p>
              <p className="text-2xl font-black text-white mt-1">4 Nodes</p>
              <p className="text-[10px] text-cyan-400 font-mono mt-1">● 100% Operational</p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <p className="text-[11px] font-mono text-zinc-500 uppercase">Avg Cluster Latency</p>
              <p className="text-2xl font-black text-amber-400 mt-1">
                {Math.round(nodes.reduce((acc, n) => acc + n.latency, 0) / nodes.length)} ms
              </p>
              <p className="text-[10px] text-zinc-400 font-mono mt-1">IIT Local: 12ms</p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <p className="text-[11px] font-mono text-zinc-500 uppercase">Aggregate CPU Load</p>
              <p className="text-2xl font-black text-white mt-1">
                {Math.round(nodes.reduce((acc, n) => acc + n.cpu, 0) / nodes.length)}%
              </p>
              <p className="text-[10px] text-emerald-400 font-mono mt-1">Optimal Bandwidth</p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <p className="text-[11px] font-mono text-zinc-500 uppercase">Active Dispatched Jobs</p>
              <p className="text-2xl font-black text-cyan-400 mt-1">
                {nodes.reduce((acc, n) => acc + n.activeTasks, 0)}
              </p>
              <p className="text-[10px] text-zinc-400 font-mono mt-1">Across 4 Edge pops</p>
            </div>
          </div>

          {/* Node Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nodes.map(node => (
              <div key={node.id} className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-cyan-500/40 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <h3 className="font-bold text-white text-base">{node.name}</h3>
                    </div>
                    <p className="text-xs text-zinc-400 font-mono mt-0.5">{node.region}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
                    {node.id}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-zinc-800/70">
                  <div>
                    <p className="text-[10px] font-mono text-zinc-500">LATENCY</p>
                    <p className="text-sm font-bold font-mono text-white mt-0.5">{node.latency} ms</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-zinc-500">CPU LOAD</p>
                    <p className="text-sm font-bold font-mono text-amber-400 mt-0.5">{node.cpu}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-zinc-500">MEMORY</p>
                    <p className="text-sm font-bold font-mono text-white mt-0.5">{node.memory}%</p>
                  </div>
                </div>

                {/* Progress bar for load */}
                <div className="mt-3 w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      node.cpu > 70 ? 'bg-rose-500' : node.cpu > 40 ? 'bg-amber-400' : 'bg-cyan-400'
                    }`}
                    style={{ width: `${node.cpu}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE CLOUD TERMINAL */}
      {activeConsoleTab === 'terminal' && (
        <div className="rounded-2xl bg-black border border-cyan-500/30 overflow-hidden shadow-2xl">
          <div className="px-4 py-2.5 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-mono text-zinc-400 ml-2">oddjobs-cloud@edge: /var/cluster/telemetry</span>
            </div>
            <button
              onClick={() => setTermHistory([])}
              className="text-[11px] font-mono text-zinc-400 hover:text-white cursor-pointer"
            >
              Clear
            </button>
          </div>

          <div className="p-4 sm:p-6 font-mono text-xs sm:text-sm h-96 overflow-y-auto space-y-2">
            {termHistory.map((item, idx) => (
              <div
                key={idx}
                className={`whitespace-pre-wrap leading-relaxed ${
                  item.type === 'cmd'
                    ? 'text-cyan-300 font-bold'
                    : item.type === 'error'
                    ? 'text-rose-400'
                    : item.type === 'success'
                    ? 'text-emerald-400'
                    : 'text-zinc-300'
                }`}
              >
                {item.text}
              </div>
            ))}
            <div ref={termEndRef} />
          </div>

          <form onSubmit={handleTerminalSubmit} className="p-3 bg-zinc-950/90 border-t border-zinc-800 flex items-center gap-2">
            <span className="text-cyan-400 font-mono text-xs font-bold pl-2">oddjobs-cloud@edge:~$</span>
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder="Type command (try 'help', 'status', 'nodes', 'bmc-audit')..."
              className="flex-1 bg-transparent text-white font-mono text-xs focus:outline-hidden"
              autoFocus
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-cyan-500 text-black font-bold rounded-lg text-xs font-mono cursor-pointer"
            >
              Execute
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: CLUSTER TASK DISPATCHER */}
      {activeConsoleTab === 'dispatcher' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
            <div>
              <h2 className="font-bold text-white text-base">Distributed Micro-Task Queue</h2>
              <p className="text-xs text-zinc-400">Dispatch computational jobs across MSU-IIT edge nodes.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => dispatchNewTask('Identity OCR & COR Verification')}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold cursor-pointer"
              >
                + OCR Verification Task
              </button>
              <button
                onClick={() => dispatchNewTask('Milestone Escrow Cryptographic Audit')}
                className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold cursor-pointer"
              >
                + Escrow Audit Task
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {tasks.map(task => (
              <div key={task.id} className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    task.status === 'completed'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : task.status === 'running'
                      ? 'bg-cyan-500/10 text-cyan-400'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {task.status === 'completed' ? <CheckCircle className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white">{task.id}</span>
                      <span className="text-xs text-zinc-300">{task.type}</span>
                    </div>
                    <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
                      Target: {task.targetNode} • Started {task.timeStarted}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-32 bg-zinc-800 rounded-full h-2 overflow-hidden hidden sm:block">
                    <div
                      className={`h-full rounded-full ${task.status === 'completed' ? 'bg-emerald-400' : 'bg-cyan-400'}`}
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                    task.status === 'completed'
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                      : task.status === 'running'
                      ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/40'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
