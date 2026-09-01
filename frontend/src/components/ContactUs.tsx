import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react'
import { useState } from 'react'
import overview from '../assets/overview2.png'
import { Button } from './ui/button';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';

const ContactUs = () => {
    const [phone, setPhone] = useState('');
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    return (
        <section id="contactus" className='md:px-9 container mx-auto'>
            <div className="px-4 py-[80px] rounded-[40px] bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm">
                <div>
                    <h3 className='text-[35px] md:text-[50px] font-bold text-center text-[var(--text-primary)]'>Location & Contact Information</h3>
                    <div className='text-[20px] font-normal text-center text-[var(--text-secondary)] pt-3.5'>
                        <p>We'd love to hear from you. Get in touch with our team</p>
                        <p>to learn more about how Sonervant can transform your business.</p>
                    </div>
                </div>
                <div className='px-0 md:px-[100px] pt-12 block md:flex justify-between items-start gap-12'>
                    <div className="basis-[45%] p-8 rounded-[30px] bg-[var(--bg-inset)] border border-[var(--border-default)] space-y-6">
                        <h2 className="text-2xl font-bold text-[var(--text-primary)] text-left">Contact Details</h2>
                        <div className="flex items-center space-x-4">
                            <a href="tel:+18005550199" className="flex items-center space-x-4 group">
                                <div className="w-12 h-12 bg-[var(--teal-50)] text-[var(--teal-600)] group-hover:bg-[var(--teal-100)] transition-colors rounded-full flex items-center justify-center shrink-0">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <span className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors text-lg">+1 (800) 555-0199</span>
                            </a>
                        </div>

                        <div className="flex items-center space-x-4">
                            <a href="mailto:support@voiceperi.com" className="flex items-center space-x-4 group">
                                <div className="w-12 h-12 bg-[var(--teal-50)] text-[var(--teal-600)] group-hover:bg-[var(--teal-100)] transition-colors rounded-full flex items-center justify-center shrink-0">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <span className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors text-lg">support@voiceperi.com</span>
                            </a>
                        </div>

                        <div className="flex items-center space-x-4">
                            <a href="https://www.google.com/maps?q=San+Francisco,+CA" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-4 group">
                                <div className="w-12 h-12 bg-[var(--teal-50)] text-[var(--teal-600)] group-hover:bg-[var(--teal-100)] transition-colors rounded-full flex items-center justify-center shrink-0">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <span className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors text-lg">San Francisco, CA</span>
                            </a>
                        </div>
                        <div className="pt-4">
                            <img src={overview} alt="overview" className="rounded-2xl border border-[var(--border-default)]" />
                        </div>
                    </div>
                    <form className="space-y-6 basis-[50%] mt-8 md:mt-0">
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="w-full space-y-2">
                                <label htmlFor="firstName" className="block text-[var(--text-primary)] text-left font-semibold text-[15px]">First Name</label>
                                <input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    value={firstname}
                                    onChange={(e) => setFirstname(e.target.value)}
                                    className="w-full rounded-[16px] p-4 border bg-[var(--bg-inset)] border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--teal-500)] focus:border-transparent transition-all"
                                    placeholder="First Name"
                                />
                            </div>

                            <div className="w-full space-y-2">
                                <label htmlFor="lastName" className="block text-[var(--text-primary)] font-semibold text-[15px] text-left">Last Name</label>
                                <input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    value={lastname}
                                    onChange={(e) => setLastname(e.target.value)}
                                    className="w-full rounded-[16px] p-4 border bg-[var(--bg-inset)] border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--teal-500)] focus:border-transparent transition-all"
                                    placeholder="Last Name"
                                />
                            </div>
                        </div>
                        <div className="w-full space-y-2">
                            <label htmlFor="email" className="block text-[var(--text-primary)] text-left font-semibold text-[15px]">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-[16px] p-4 border bg-[var(--bg-inset)] border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--teal-500)] focus:border-transparent transition-all"
                                placeholder="Email Address"
                            />
                        </div>
                        <div className="w-full space-y-2">
                            <label htmlFor="phoneNumber" className="block text-[var(--text-primary)] text-left font-semibold text-[15px]">Phone Number</label>
                            <PhoneInput
                                defaultCountry="ua"
                                value={phone}
                                onChange={(phone) => setPhone(phone)}
                                inputClassName="w-full !rounded-r-[16px] !p-4 !border-y !border-r !bg-[var(--bg-inset)] !border-[var(--border-default)] !text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--teal-500)] focus:border-transparent transition-all !h-auto"
                                className="[&_.react-international-phone-country-selector-button]:!rounded-l-[16px] [&_.react-international-phone-country-selector-button]:!bg-[var(--bg-surface)] [&_.react-international-phone-country-selector-button]:!border-[var(--border-default)]"
                                placeholder="(+42) 000 0000 000"
                            />
                        </div>
                        <div className="w-full space-y-2">
                            <label htmlFor="message" className="block text-[var(--text-primary)] text-left font-semibold text-[15px]">Message</label>
                            <textarea
                                id="message"
                                name="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full rounded-[16px] p-4 border bg-[var(--bg-inset)] border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--teal-500)] focus:border-transparent transition-all resize-y"
                                placeholder="Message"
                                rows={6}
                            />
                        </div>
                        <Button className='rounded-xl px-6 py-6 text-white text-[15px] font-semibold bg-[var(--teal-600)] hover:bg-[var(--teal-700)] flex float-right gap-2 group transition-all w-full md:w-auto'>
                            Send Message <ArrowUpRight className='w-5 h-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5' />
                        </Button>
                    </form>
                </div>
            </div>

        </section >
    )
}

export default ContactUs