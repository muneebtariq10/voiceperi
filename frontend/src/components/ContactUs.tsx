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
            <div className="px-4 py-[80px] rounded-[50px]" style={{
                background: 'radial-gradient(circle, #d9eeec 40%, #ffffff 100%)',
            }}>
                <div>
                    <h3 className='text-[35px] md:text-[50px] font-bold text-center text-primary'>Location & Contact Information</h3>
                    <div className='text-[20px] font-normal text-center text-default-gray pt-3.5'>
                        <p>Lorem ipsum dolor sit amet consectetur. Curabitur imperdiet tortor aenean</p>
                        <p>scelerisque orci pellentesque libero nisi. Ipsum et sed neque cursus nunc. </p>
                    </div>
                </div>
                <div className='px-0 md:px-[100px] pt-12 block md:flex justify-between items-start'>
                    <div className="basis-[45%] p-6 pb-0 rounded-[30px] border border-white space-y-6">
                        <h2 className="text-2xl font-bold text-primary text-left">Contact Details</h2>
                        <div className="flex items-center space-x-4">
                            <a href="tel:+2522254221" className="flex items-center space-x-2">
                                <div className="w-10 h-10 bg-default-purple text-secondary rounded-full flex items-center justify-center">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <span className="text-default-gray text-lg">2522 254221</span>
                            </a>
                        </div>

                        <div className="flex items-center space-x-4">
                            <a href="mailto:abc@abc.com" className="flex items-center space-x-2">
                                <div className="w-10 h-10 bg-default-purple text-secondary rounded-full flex items-center justify-center">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <span className="text-default-gray text-lg">abc@abc.com</span>
                            </a>
                        </div>

                        <div className="flex items-center space-x-4">
                            <a href="https://www.google.com/maps?q=Lorem+ipsum+dolor+sit+amet" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2">
                                <div className="w-10 h-10 bg-default-purple text-secondary rounded-full flex items-center justify-center">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <span className="text-default-gray text-lg">Lorem ipsum dolor sit amet</span>
                            </a>
                        </div>
                        <img src={overview} alt="overview" />
                    </div>
                    <form className="space-y-6 basis-[50%] mt-5 md:mt-auto">
                        <div className="flex gap-6">
                            <div className="w-full space-y-1.5">
                                <label htmlFor="firstName" className="block text-primary text-left font-semibold text-base">First Name</label>
                                <input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    value={firstname}
                                    onChange={(e) => setFirstname(e.target.value)}
                                    className="w-full rounded-[20px] p-3 border bg-secondary border-gray-300 focus:outline-none focus:ring-2"
                                    placeholder="First Name"
                                />
                            </div>

                            <div className="w-full space-y-1.5">
                                <label htmlFor="lastName" className="block text-primary font-semibold text-base text-left">Last Name</label>
                                <input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    value={lastname}
                                    onChange={(e) => setLastname(e.target.value)}
                                    className="w-full rounded-[20px]  p-3 border bg-secondary border-gray-300 focus:outline-none focus:ring-2"
                                    placeholder="Last Name"
                                />
                            </div>
                        </div>
                        <div className="w-full space-y-1.5">
                            <label htmlFor="email" className="block text-primary text-left font-semibold text-base">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-[20px]  p-3 border bg-secondary border-gray-300 focus:outline-none focus:ring-2"
                                placeholder="Email Address"
                            />
                        </div>
                        <div className="w-full space-y-1.5">
                            <label htmlFor="phoneNumber" className="block text-primary text-left  font-semibold text-base">Phone Number</label>
                            <PhoneInput
                                defaultCountry="ua"
                                value={phone}
                                onChange={(phone) => setPhone(phone)}
                                inputClassName="w-full rounded-[20px] p-3 border bg-secondary border-gray-300 focus:outline-none focus:ring-2"
                                placeholder="(+42) 000 0000 000"
                            // countrySelectorStyleProps={{ style: { display: "block" } }}
                            />
                            {/* <PhoneCountrySelect /> */}
                            {/* <input
                                id="phoneNumber"
                                name="phoneNumber"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full rounded-[20px] p-3 border bg-secondary border-gray-300 focus:outline-none focus:ring-2"
                                placeholder="(+42) 000 0000 000"
                            /> */}
                        </div>
                        <div className="w-full space-y-1.5">
                            <label htmlFor="message" className="block text-primary text-left text-base font-semibold">Message</label>
                            <textarea
                                id="message"
                                name="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full rounded-[20px] p-3 border bg-secondary border-gray-300 focus:outline-none focus:ring-2"
                                placeholder="Message"
                                rows={6}
                            />
                        </div>
                        <Button className='rounded-[20px] px-5.5 py-4 text-secondary text-lg font-bold bg-default-purple flex float-right'>
                            Send Message <ArrowUpRight className='w-8 h-8' />
                        </Button>
                    </form>
                </div>
            </div>

        </section >
    )
}

export default ContactUs