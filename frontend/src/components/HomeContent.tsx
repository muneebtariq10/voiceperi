import { Link } from 'react-router-dom'
import heroimg from "../assets/hero-light.png";
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
                            <div className='inline-flex items-center rounded-md bg-[var(--color-teal-50)] px-3 py-1 text-[13px] font-semibold text-[var(--teal-700)]'>
                                Get 15 days free trial
                            </div>
                            <div className='inline-flex items-center rounded-md bg-[var(--color-teal-50)] px-3 py-1 text-[13px] font-semibold text-[var(--teal-700)]'>
                                No credit card required
                            </div>
                            <div className='inline-flex items-center rounded-md bg-[var(--color-teal-50)] px-3 py-1 text-[13px] font-semibold text-[var(--teal-700)]'>
                                Cancel Anytime
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 mt-3">
                            <Link to='/signup'>
                                <button className="inline-flex h-[52px] items-center justify-center bg-[var(--teal-600)] hover:bg-[var(--teal-700)] rounded-lg px-8 text-white font-medium transition-colors cursor-pointer shadow-sm">
                                    Start Free Trial
                                    <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </button>
                            </Link>

                            <Link to='/login'>
                                <button className="inline-flex h-[52px] items-center justify-center bg-transparent border border-[var(--border-default)] hover:bg-[var(--bg-inset)] hover:text-[var(--text-primary)] rounded-lg px-8 text-[var(--text-secondary)] font-medium transition-colors cursor-pointer">
                                    <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Watch Demo
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-5/12">
                    <div className="wow fadeInUp relative z-10 mx-auto w-full max-w-[530px] lg:mr-0" data-wow-delay=".3s">
                        <div className="relative rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-[var(--border-subtle)]">
                            <img src={heroimg} alt="Dashboard preview" className="mx-auto w-full block" />
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section className="py-16 border-t border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
            <div className='flex flex-col items-center gap-y-10 container mx-auto px-4'>
                <p className='text-center font-medium text-[14px] uppercase tracking-wider text-[var(--text-muted)]'>Trusted by innovative teams worldwide</p>
                <div className='grid grid-cols-2 md:flex items-center justify-center gap-x-12 gap-y-10 md:w-full md:px-10 opacity-70 grayscale hover:grayscale-0 transition-all duration-300'>
                    <img alt="nike" src={nike} className="h-8 object-contain" />
                    <img alt="addidas" src={addidas} className="h-8 object-contain" />
                    <img alt="google" src={google} className="h-8 object-contain" />
                    <img alt="apple" src={apple} className="h-8 object-contain" />
                    <img alt="amazon" src={amazon} className="h-8 object-contain" />
                    <img alt="facebook" src={facebook} className="h-8 object-contain" />
                </div>
            </div>
        </section>
        <Feature1/>
        </>
    )
}

export default HomeContent