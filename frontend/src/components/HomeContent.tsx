import { Link } from 'react-router-dom'
import { Bot, Mic, Calendar, Phone, Activity, Smile, BarChart } from 'lucide-react';
import person from '../assets/person.png';
import heroBgDark from "../assets/hero_bg_dark.jpg";
import heroBgLight from "../assets/hero_bg_light.jpg";
import addidas from '../assets/addidas.png'
import google from '../assets/google.png'
import apple from '../assets/apple.png'
import facebook from '../assets/facebook.png'
import amazon from '../assets/amazon.png'
import nike from '../assets/nike.png'
import Feature1 from '@/components/Feature1'
import { ParticlesBackground } from '@/components/ParticlesBackground'

const HomeContent = () => {
    return (
        <>
        <section className="relative w-full overflow-hidden container mx-auto px-4 lg:px-8">
            <div 
                className="absolute inset-0 z-[-1] bg-cover bg-center transition-opacity duration-700 hidden dark:block opacity-60"
                style={{ backgroundImage: `url(${heroBgDark})` }}
            />
            <div 
                className="absolute inset-0 z-[-1] bg-cover bg-center transition-opacity duration-700 block dark:hidden opacity-30"
                style={{ backgroundImage: `url(${heroBgLight})` }}
            />
            <ParticlesBackground />
            <div className="flex flex-wrap items-center py-16 md:py-24 md:px-[40px] lg:px-[100px]">
        
                <div className="w-full lg:w-7/12 mb-12 lg:mb-0">
                    <div className="wow fadeInUp lg:max-w-[600px] text-left" data-wow-delay=".2s">
                        <span className="mb-6 block text-[15px] font-semibold tracking-wide uppercase text-[var(--teal-600)]">
                            Supercharge your business with Auto-Answer AI
                        </span>
                        <h1 className="mb-8 text-4xl font-bold leading-[1.15] tracking-tight text-[var(--text-primary)] sm:text-5xl lg:text-[56px]">
                            Never miss a <span className="text-gradient-1">call</span> and opportunity again.
                        </h1>
                        <p className="mb-10 text-lg leading-relaxed text-[var(--text-secondary)] max-w-[500px]">
                            AI-powered voice agents that sound human, handle calls 24/7, and convert conversations into opportunities.
                        </p>

                        <div className='flex items-center gap-3 mb-10'>
                            <div className='inline-flex items-center rounded-md bg-[var(--color-teal-50)] px-3 py-1 text-[13px] font-semibold text-[var(--teal-700)] dark:bg-white/10 dark:text-teal-300 dark:border dark:border-white/10'>
                                Get 15 days free trial
                            </div>
                            <div className='inline-flex items-center rounded-md bg-[var(--color-teal-50)] px-3 py-1 text-[13px] font-semibold text-[var(--teal-700)] dark:bg-white/10 dark:text-teal-300 dark:border dark:border-white/10'>
                                No credit card required
                            </div>
                            <div className='inline-flex items-center rounded-md bg-[var(--color-teal-50)] px-3 py-1 text-[13px] font-semibold text-[var(--teal-700)] dark:bg-white/10 dark:text-teal-300 dark:border dark:border-white/10'>
                                Cancel Anytime
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 mt-3">
                            <Link to='/signup'>
                                <button className="inline-flex h-[52px] items-center justify-center bg-[var(--teal-600)] hover:bg-[var(--teal-700)] dark:bg-teal-500 dark:hover:bg-teal-400 dark:shadow-[0_0_20px_rgba(20,184,166,0.4)] rounded-lg px-8 text-white font-medium transition-all duration-300 cursor-pointer shadow-sm">
                                    Start Free Trial
                                    <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </button>
                            </Link>

                            <Link to='/login'>
                                <button className="inline-flex h-[52px] items-center justify-center bg-transparent border border-[var(--border-default)] hover:bg-[var(--bg-inset)] hover:text-[var(--text-primary)] dark:border-white/20 dark:text-white dark:hover:bg-white/10 rounded-lg px-8 text-[var(--text-secondary)] font-medium transition-all duration-300 cursor-pointer">
                                    <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Watch Demo
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-5/12 relative min-h-[500px] mt-12 lg:mt-0">
                    <div className="hidden md:block absolute inset-0">
                        {/* 1. Customer Call (Center) */}
                        <div className="wow fadeInUp absolute top-[20%] left-[20%] w-[260px] rounded-2xl bg-white dark:bg-[#0a0f1d]/80 backdrop-blur-xl shadow-2xl border border-gray-100 dark:border-white/10 p-6 flex flex-col items-center z-20 transition-all duration-500 hover:-translate-y-1 hover:shadow-teal-500/10" data-wow-delay=".3s">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 font-medium tracking-wide">Incoming Call</p>
                            <div className="w-16 h-16 rounded-full overflow-hidden mb-3 border-[3px] border-teal-500 shadow-[0_0_20px_rgba(20,184,166,0.3)]">
                                <img src={person} alt="Avatar" className="w-full h-full object-cover" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Customer Call</h3>
                            <div className="flex items-center gap-1.5 mb-4">
                                <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></div>
                                <span className="text-xs text-teal-600 dark:text-teal-400 font-medium">Connected</span>
                            </div>
                            <p className="text-xl font-bold text-gray-900 dark:text-white mb-4 font-mono tracking-widest">02:41</p>
                            <div className="w-full flex items-center justify-center gap-1 h-6">
                                {[...Array(15)].map((_, i) => (
                                    <div key={i} className="w-[3px] bg-teal-500/60 rounded-full animate-pulse" style={{ height: `${Math.max(20, Math.random() * 100)}%`, animationDelay: `${i * 0.1}s` }}></div>
                                ))}
                            </div>
                        </div>

                        {/* 2. Live Transcript (Left) */}
                        <div className="wow fadeInUp absolute top-[40%] -left-[10%] w-[220px] rounded-xl bg-white dark:bg-[#0a0f1d]/80 backdrop-blur-xl shadow-xl border border-gray-100 dark:border-white/10 p-4 z-30 transition-all duration-500 hover:-translate-y-1" data-wow-delay=".5s">
                            <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 font-semibold">Live Transcript</p>
                            <p className="text-[13px] text-gray-800 dark:text-gray-200 leading-relaxed">
                                Hi, I'd like to <span className="text-purple-600 dark:text-purple-400 font-semibold">book a demo</span> for next week.
                            </p>
                            <div className="flex gap-1 mt-3">
                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                        </div>

                        {/* 3. AI Voice Agent (Top Pill) */}
                        <div className="wow fadeInUp absolute top-[5%] left-[35%] rounded-full bg-white dark:bg-[#0a0f1d]/80 backdrop-blur-xl shadow-lg border border-gray-100 dark:border-white/10 py-1.5 px-3 flex items-center gap-2 z-10 transition-all duration-500 hover:-translate-y-1" data-wow-delay=".4s">
                            <div className="w-7 h-7 rounded-full bg-teal-50 dark:bg-teal-500/10 border border-teal-100 dark:border-teal-500/20 flex items-center justify-center">
                                <Bot className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                            </div>
                            <div>
                                <p className="text-[11px] font-semibold text-gray-900 dark:text-white leading-none mb-0.5">AI Voice Agent</p>
                                <div className="flex items-center gap-1">
                                    <div className="w-1 h-1 rounded-full bg-teal-500"></div>
                                    <span className="text-[9px] text-teal-600 dark:text-teal-400 font-medium leading-none">Online</span>
                                </div>
                            </div>
                        </div>

                        {/* 4. Listening Waveform (Top Right) */}
                        <div className="wow fadeInUp absolute top-[15%] right-[-5%] w-[180px] rounded-xl bg-white dark:bg-[#0a0f1d]/80 backdrop-blur-xl shadow-xl border border-gray-100 dark:border-white/10 p-3 z-10 flex flex-col items-center transition-all duration-500 hover:-translate-y-1" data-wow-delay=".6s">
                            <div className="w-full flex items-center justify-center gap-[2px] h-8 mb-2 overflow-hidden px-2">
                                {[...Array(16)].map((_, i) => (
                                    <div key={i} className={`w-[2px] bg-gradient-to-t from-teal-400 to-purple-500 rounded-full animate-pulse`} style={{ height: `${Math.max(20, Math.random() * 100)}%`, animationDelay: `${i * 0.05}s` }}></div>
                                ))}
                            </div>
                            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/50 py-1 px-2.5 rounded-full">
                                <Mic className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Listening...</span>
                            </div>
                        </div>

                        {/* 5. Intent Detected (Right) */}
                        <div className="wow fadeInUp absolute top-[55%] right-[-15%] w-[180px] rounded-xl bg-white dark:bg-[#0a0f1d]/80 backdrop-blur-xl shadow-xl border border-gray-100 dark:border-white/10 p-3.5 z-30 transition-all duration-500 hover:-translate-y-1" data-wow-delay=".7s">
                            <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2.5 font-semibold">Intent Detected</p>
                            <div className="flex items-center gap-2.5 mb-3">
                                <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 flex items-center justify-center">
                                    <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">Book Demo</span>
                            </div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[9px] text-gray-500 dark:text-gray-400 font-medium">Confidence</span>
                                <span className="text-[9px] text-teal-600 dark:text-teal-400 font-bold">98%</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1 overflow-hidden">
                                <div className="bg-gradient-to-r from-teal-400 to-purple-500 h-1 rounded-full" style={{ width: '98%' }}></div>
                            </div>
                        </div>
                        
                        {/* Stats Bar (Bottom) */}
                        <div className="wow fadeInUp absolute -bottom-[10%] -left-[10%] w-[120%] rounded-xl bg-white dark:bg-[#0a0f1d]/80 backdrop-blur-xl shadow-xl border border-gray-100 dark:border-white/10 p-4 z-40 transition-all duration-500 hover:-translate-y-1" data-wow-delay=".8s">
                            <div className="flex justify-between items-center">
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-6 h-6 rounded-full bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center mb-1">
                                        <Phone className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">24/7</p>
                                    <p className="text-[8px] text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">Always On</p>
                                </div>
                                <div className="h-6 w-px bg-gray-200 dark:bg-gray-800"></div>
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-6 h-6 rounded-full bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center mb-1">
                                        <Activity className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">98%</p>
                                    <p className="text-[8px] text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">Resolution</p>
                                </div>
                                <div className="h-6 w-px bg-gray-200 dark:bg-gray-800"></div>
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-6 h-6 rounded-full bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center mb-1">
                                        <Smile className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">4.9/5</p>
                                    <p className="text-[8px] text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">Rating</p>
                                </div>
                                <div className="h-6 w-px bg-gray-200 dark:bg-gray-800"></div>
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-6 h-6 rounded-full bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center mb-1">
                                        <BarChart className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">2.3x</p>
                                    <p className="text-[8px] text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">Oppty</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Fallback - Stacks neatly on small screens */}
                    <div className="wow fadeInUp md:hidden relative z-10 mx-auto w-full max-w-[320px]" data-wow-delay=".3s">
                        <div className="relative rounded-2xl overflow-hidden bg-white shadow-xl border border-gray-100 dark:bg-[#0a0f1d]/90 dark:border-white/10 dark:shadow-2xl p-6 flex flex-col items-center">
                                <div className="w-14 h-14 rounded-full bg-teal-50 dark:bg-teal-500/10 border border-teal-100 dark:border-teal-500/20 flex items-center justify-center mb-4">
                                    <Bot className="w-7 h-7 text-teal-600 dark:text-teal-400" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">AI Voice Agent</h3>
                                <div className="flex items-center gap-1.5 mb-6">
                                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></div>
                                    <span className="text-xs text-teal-600 dark:text-teal-400 font-medium">Online & Listening</span>
                                </div>
                                
                                <div className="w-full flex justify-between border-t border-gray-100 dark:border-white/10 pt-4">
                                    <div className="text-center">
                                        <p className="text-base font-bold text-gray-900 dark:text-white">24/7</p>
                                        <p className="text-[9px] text-gray-500 font-semibold uppercase tracking-wider">Always On</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-base font-bold text-gray-900 dark:text-white">98%</p>
                                        <p className="text-[9px] text-gray-500 font-semibold uppercase tracking-wider">Resolution</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-base font-bold text-gray-900 dark:text-white">4.9/5</p>
                                        <p className="text-[9px] text-gray-500 font-semibold uppercase tracking-wider">Rating</p>
                                    </div>
                                </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section className="py-16 border-t border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
            <div className='flex flex-col items-center gap-y-10 container mx-auto px-4'>
                <p className='text-center font-medium text-[14px] uppercase tracking-wider text-[var(--text-muted)]'>Trusted by innovative teams worldwide</p>
                <div className='grid grid-cols-2 md:flex items-center justify-center gap-x-12 gap-y-10 md:w-full md:px-10 opacity-70 grayscale hover:grayscale-0 transition-all duration-300'>
                    <img alt="nike" src={nike} className="h-8 object-contain dark:invert dark:opacity-80 transition-all duration-300" />
                    <img alt="addidas" src={addidas} className="h-8 object-contain dark:invert dark:opacity-80 transition-all duration-300" />
                    <img alt="google" src={google} className="h-8 object-contain dark:invert dark:opacity-80 transition-all duration-300" />
                    <img alt="apple" src={apple} className="h-8 object-contain dark:invert dark:opacity-80 transition-all duration-300" />
                    <img alt="amazon" src={amazon} className="h-8 object-contain dark:invert dark:opacity-80 transition-all duration-300" />
                    <img alt="facebook" src={facebook} className="h-8 object-contain dark:invert dark:opacity-80 transition-all duration-300" />
                </div>
            </div>
        </section>
        <Feature1/>
        </>
    )
}

export default HomeContent