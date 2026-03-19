'use client';

import { motion } from 'motion/react';
import * as Icons from '@phosphor-icons/react';
import { PixelCard } from '@/components/reactbits/PixelCard';
import { SpotlightCard } from '@/components/reactbits/SpotlightCard';
import { BlurText } from '@/components/reactbits/BlurText';

const STATS = [
  { label: 'Total Conversations', value: '1,284', change: '+12%', icon: Icons.UsersIcon, color: 'text-blue-400' },
  { label: 'Avg. Latency', value: '342ms', change: '-40ms', icon: Icons.ClockIcon, color: 'text-emerald-400' },
  { label: 'System Uptime', value: '99.9%', change: 'Stable', icon: Icons.ActivityIcon, color: 'text-purple-400' },
  { label: 'Token Burn', value: '$42.10', change: '+5%', icon: Icons.CurrencyDollarIcon, color: 'text-amber-400' },
];

export default function DashboardPage() {
  return (
    <div className="bg-transparent min-h-screen text-white selection:bg-cyan-500/30">
      <main className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto">
        <header className="mb-12">
          <BlurText 
            text="System Analytics" 
            className="text-4xl font-black tracking-tight"
          />
          <p className="mt-2 text-white/40 font-medium">Real-time performance metrics for your Voca agents.</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {STATS.map((stat, i) => (
            <SpotlightCard key={stat.label} className="p-6 bg-white/5 border-white/5 group transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-white/5 ${stat.color}`}>
                  <stat.icon size={24} weight="duotone" />
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-md bg-white/5 ${stat.change.startsWith('+') ? 'text-emerald-400' : 'text-blue-400'}`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-white/40 text-xs font-bold tracking-widest uppercase mb-1">{stat.label}</h3>
              <div className="text-2xl font-black tracking-tight">{stat.value}</div>
            </SpotlightCard>
          ))}
        </div>

        {/* Main Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Agents */}
          <PixelCard variant="cyan" className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold mb-1">Active Voice Agents</h3>
                <p className="text-white/40 text-sm font-medium">Currently processing live streams</p>
              </div>
              <button className="text-xs font-bold tracking-widest uppercase text-cyan-400 flex items-center gap-2 hover:opacity-80 transition-opacity">
                Manage All <Icons.ArrowUpRightIcon size={14} />
              </button>
            </div>

            <div className="space-y-4">
              {[
                { name: 'Customer Support', lang: 'English (US)', status: 'Active', load: '12% ' },
                { name: 'Technical Sales', lang: 'Spanish (ES)', status: 'Active', load: '45%' },
                { name: 'Multilingual Reception', lang: 'Mixed', status: 'Standby', load: '0%' }
              ].map((agent, i) => (
                <div key={agent.name} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center">
                      <Icons.UsersIcon size={18} className="text-cyan-400" weight="duotone" />
                    </div>
                    <div>
                      <div className="font-bold text-sm">{agent.name}</div>
                      <div className="text-xs text-white/40">{agent.lang}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold uppercase tracking-widest mb-1">{agent.status}</div>
                    <div className="text-[10px] text-white/40">{agent.load} load</div>
                  </div>
                </div>
              ))}
            </div>
          </PixelCard>

          {/* System Health */}
          <div className="space-y-8">
            <SpotlightCard className="p-8 bg-gradient-to-br from-cyan-500/10 to-transparent border-cyan-500/20 h-full">
              <h3 className="text-lg font-black mb-6">Service Health</h3>
              <div className="space-y-6">
                {[
                  { label: 'STT (Deepgram)', status: 'Operational', color: 'bg-emerald-500' },
                  { label: 'LLM (OpenAI)', status: 'Operational', color: 'bg-emerald-500' },
                  { label: 'TTS (Murf)', status: 'Operational', color: 'bg-emerald-500' },
                  { label: 'Real-time Transport', status: 'Operational', color: 'bg-emerald-500' }
                ].map((item, i) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white/60">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white/40">{item.status}</span>
                      <div className={`size-2 rounded-full ${item.color} animate-pulse`} />
                    </div>
                  </div>
                ))}
              </div>
            </SpotlightCard>
          </div>
        </div>
      </main>
    </div>
  );
}
