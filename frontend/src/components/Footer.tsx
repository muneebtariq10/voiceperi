import { NavLink } from 'react-router-dom'
import { Logo } from './Logo'
import { Icons } from "@/components/svgIcons";

const Footer = () => {
    return (
        <div className='bg-[var(--bg-surface)] border-t border-[var(--border-default)]'>
            <div className='px-4 md:px-[80px] py-[80px] container mx-auto'>
                <div className='flex flex-col md:flex-row justify-between items-start gap-12 pb-10 md:pb-16'>
                    <div className='basis-[35%]'>
                        <div className='flex flex-col gap-y-6 items-start justify-start'>
                            <NavLink to="/" className='flex items-start justify-between gap-x-3'>
                                <Logo className="text-3xl" />
                            </NavLink>
                            <p className='font-normal text-lg text-[var(--text-secondary)] text-left leading-relaxed'>
                                Empowering creators with AI-driven tools to turn ideas into impactful videos. Fast, easy, and accessible.
                            </p>
                            <div className='flex items-center gap-x-4'>
                                <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" className='rounded-full w-10 h-10 bg-[var(--bg-inset)] border border-[var(--border-default)] flex items-center justify-center hover:bg-[var(--teal-50)] hover:border-[var(--teal-200)] transition-colors group'>
                                    <Icons.Facebook className='fill-[var(--teal-600)] group-hover:scale-110 transition-transform w-5 h-5'/>
                                </a>
                                <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className='rounded-full w-10 h-10 bg-[var(--bg-inset)] border border-[var(--border-default)] flex items-center justify-center hover:bg-[var(--teal-50)] hover:border-[var(--teal-200)] transition-colors group'>
                                    <Icons.Instagram className='fill-[var(--teal-600)] group-hover:scale-110 transition-transform w-5 h-5'/>
                                </a>
                                <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className='rounded-full w-10 h-10 bg-[var(--bg-inset)] border border-[var(--border-default)] flex items-center justify-center hover:bg-[var(--teal-50)] hover:border-[var(--teal-200)] transition-colors group'>
                                    <Icons.Twitter className='fill-[var(--teal-600)] group-hover:scale-110 transition-transform w-5 h-5'/>
                                </a>
                                <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" className='rounded-full w-10 h-10 bg-[var(--bg-inset)] border border-[var(--border-default)] flex items-center justify-center hover:bg-[var(--teal-50)] hover:border-[var(--teal-200)] transition-colors group'>
                                    <Icons.Linkedin className='fill-[var(--teal-600)] group-hover:scale-110 transition-transform w-5 h-5'/>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className='basis-[55%] flex flex-wrap md:flex-nowrap justify-between w-full gap-8 mt-5 md:mt-0'>
                        <div className='flex flex-col items-start justify-start gap-y-6'>
                            <h1 className='font-bold text-[15px] tracking-wider text-[var(--text-primary)]'>COMPANY</h1>
                            <div className='flex flex-col gap-y-3 items-start justify-start'>
                                <a href="#about" className='font-medium text-[16px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors'>About Us</a>
                                <a href="#contactus" className='font-medium text-[16px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors'>Contact Us</a>
                            </div>
                        </div>
                        <div className='flex flex-col items-start justify-start gap-y-6'>
                            <h1 className='font-bold text-[15px] tracking-wider text-[var(--text-primary)]'>PRODUCT</h1>
                            <div className='flex flex-col gap-y-3 items-start justify-start'>
                                <a href="#feature" className='font-medium text-[16px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors'>Features</a>
                                <a href="#pricing" className='font-medium text-[16px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors'>Pricing</a>
                                <NavLink to="/contact" className='font-medium text-[16px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors'>Demo</NavLink>
                            </div>
                        </div>
                        <div className='flex flex-col items-start justify-start gap-y-6'>
                            <h1 className='font-bold text-[15px] tracking-wider text-[var(--text-primary)]'>RESOURCES</h1>
                            <div className='flex flex-col gap-y-3 items-start justify-start'>
                                <a href="#faq" className='font-medium text-[16px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors'>FAQ's</a>
                                <a href="#contactus" className='font-medium text-[16px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors'>Contact Us</a>
                                <a href="#usecase" className='font-medium text-[16px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors'>Use Cases</a>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='flex flex-col gap-y-6'>
                    <hr className='border-[var(--border-default)]' />
                    <div className='flex flex-col md:flex-row justify-between items-center mt-2 gap-y-4'>
                        <p className='font-normal text-[15px] text-[var(--text-secondary)]'>© 2025 Sonervant. All rights reserved.</p>
                        <div className='flex flex-wrap justify-center items-center gap-x-4 md:gap-x-6 gap-y-2'>
                            <p className='font-medium text-[15px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer'>Terms of Service</p>
                            <div className="w-1 h-1 rounded-full bg-[var(--text-secondary)]"></div>
                            <p className='font-medium text-[15px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer'>Privacy Policy</p>
                            <div className="w-1 h-1 rounded-full bg-[var(--text-secondary)]"></div>
                            <p className='font-medium text-[15px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer'>Cookie Policy</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Footer