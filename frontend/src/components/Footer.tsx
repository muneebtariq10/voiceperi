import { NavLink } from 'react-router-dom'
import logo from '../assets/logo1.png'
import { Icons } from "@/components/svgIcons";
const Footer = () => {
    return (
        <div className='px-3 md:px-[80px] py-[80px] container mx-auto'>
            <div className='block md:flex justify-between items-start pb-10 md:pb-15'>
                <div className='basis-[30%]'>
                    <div className='flex flex-col gap-y-6 items-start justify-start'>
                        <NavLink to="/" className='flex items-start justify-between gap-x-3'>
                            <img className="w-[60%]" src={logo} alt="logo" />
                        </NavLink>
                        <p className='font-normal text-lg text-default-gray text-left'>Empowering creators with AI-driven tools to turn ideas into impactful videos. Fast, easy, and accessible.</p>
                        <div className='flex items-center gap-x-4.5'>
                            <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" className='rounded-full w-9 h-9 bg-[#f2f1ff] flex items-center justify-center'>
                                
                                <Icons.Facebook className='fill-[#46a79d] w-5 h-5'/>
                            </a>
                            <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className='rounded-full w-9 h-9 bg-[#f2f1ff] flex items-center justify-center'>
                                <Icons.Instagram className='fill-[#46a79d] w-5 h-5'/>
                            </a>
                            <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className='rounded-full w-9 h-9 bg-[#f2f1ff] flex items-center justify-center'>
                                <Icons.Twitter className='fill-[#46a79d] w-5 h-5'/>
                            </a>
                            <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" className='rounded-full w-9 h-9 bg-[#f2f1ff] flex items-center justify-center'>
                                <Icons.Linkedin className='fill-[#46a79d] w-5 h-5'/>
                            </a>
                        </div>
                    </div>
                </div>
                <div className='basis-[50%] flex justify-between mt-5 md:mt-auto'>
                    <div className='flex flex-col items-start justify-start gap-y-6.5'>
                        <h1 className='font-bold text-lg text-primary'>COMPANY</h1>
                        <div className='flex flex-col gap-y-4 items-start justify-start'>
                            <NavLink to="/about" className='font-normal text-lg text-default-gray'>About Us</NavLink>
                            <a href="#contactus" className='font-normal text-lg text-default-gray'>Contact Us</a>
                        </div>
                    </div>
                    <div className='flex flex-col items-start justify-start gap-y-6.5'>
                        <h1 className='font-bold text-lg text-primary'>PRODUCT</h1>
                        <div className='flex flex-col gap-y-4 items-start justify-start'>
                            <a href="#feature" className='font-normal text-lg text-default-gray'>Features</a>
                            <a href="#pricing" className='font-normal text-lg text-default-gray'>Pricing</a>
                            <NavLink to="/contact" className='font-normal text-lg text-default-gray'>Demo</NavLink>
                        </div>
                    </div>
                    <div className='flex flex-col items-start justify-start gap-y-6.5'>
                        <h1 className='font-bold text-lg text-primary '>RESOURCES</h1>
                        <div className='flex flex-col gap-y-4 items-start justify-start'>
                            <a href="#faq" className='font-normal text-lg text-default-gray'>FAQ's</a>
                            <a href="#contactus" className='font-normal text-lg text-default-gray'>Contact Us</a>
                            <a href="#usecase" className='font-normal text-lg text-default-gray'>Use Cases</a>
                        </div>
                    </div>
                </div>
            </div>
            <div className='flex flex-col gap-y-6'>
                <hr className='text-default-gray' />
                <div className='block md:flex justify-between items-center mt-4'>
                    <p className='font-normal text-lg text-default-gray'>© 2025 Voiceperi. All rights reserved.</p>
                    <div className='flex justify-between items-center md:gap-x-3.5 mt-3 md:mt-auto'>
                        <p className='font-normal text-lg text-default-gray'>Terms of Service</p>
                        <div className="border-l-3 h-5 text-default-gray"></div>
                        <p className='font-normal text-lg text-default-gray'>Privacy Policy</p>
                        <div className="border-l-3 h-5 text-default-gray"></div>
                        <p className='font-normal text-lg text-default-gray'>Cookie Policy</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Footer