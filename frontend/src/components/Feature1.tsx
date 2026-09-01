// import { ArrowUpRight, Check } from 'lucide-react'
// import { Link } from 'react-router-dom'
// import { Button } from './ui/button'
// import group1 from '../assets/group1.png'
// import group2 from '../assets/group2.png'
// import group3 from '../assets/group3.png'
// import search from '../assets/search2.png'
// import star from '../assets/star.png'
// import message from '../assets/message.png'
// import dashboard from '../assets/dashboard.png'
// import profile from '../assets/ellipse1251.png'
// import email from '../assets/email.png'

const Feature1 = () => {
    return (
        <section id="feature" className='flex-col items-center justify-start gap-y-16 py-20 container mx-auto relative'>
            <div className='flex flex-col items-center justify-start gap-y-16 md:px-[40px] lg:px-[100px]'>
                <h2 className='text-3xl md:text-4xl font-bold text-[var(--text-primary)]'>Perfect Solution for Your Needs</h2>
                
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full'>
                    {/* Card 1 */}
                    <div className="flex flex-col items-start gap-y-4 p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-shadow duration-200">
                        <div className='bg-[var(--bg-inset)] p-3 rounded-lg'>
                            <svg width="24" height="24" viewBox="0 0 46 46" xmlns="http://www.w3.org/2000/svg" fill="none" className="stroke-[var(--teal-600)]">
                                <path d="M8.24312 6.71771C7.99569 6.72574 7.75239 6.78334 7.52762 6.88709C7.30285 6.99085 7.10118 7.13864 6.93456 7.32173C6.76793 7.50482 6.63974 7.71948 6.55756 7.95301C6.47539 8.18653 6.4409 8.43417 6.45615 8.68126C6.70336 12.9191 7.86877 23.2595 13.4486 29.7081C20.1303 37.4776 28.8321 40.1545 37.7599 39.7589C38.2384 39.7303 38.6883 39.5212 39.0186 39.1738C39.349 38.8264 39.5352 38.3666 39.5398 37.8872V31.0996C39.5342 30.4663 39.316 29.8532 38.9202 29.3588C38.5244 28.8644 37.974 28.5173 37.3573 28.3732L32.8863 27.3844C32.3333 27.2665 31.7577 27.3172 31.2339 27.53C30.7101 27.7428 30.2621 28.1079 29.9481 28.578L28.9592 30.0754C28.8684 30.2124 28.7327 30.3135 28.5754 30.3612C28.4181 30.4089 28.2491 30.4003 28.0975 30.3368C25.8232 29.355 16.7612 25.1171 15.7653 17.9692C15.7458 17.8312 15.7676 17.6905 15.8279 17.5648C15.8883 17.4391 15.9844 17.3341 16.1044 17.2629L17.8984 16.1682C18.3905 15.8632 18.777 15.4144 19.0056 14.8826C19.2343 14.3507 19.294 13.7615 19.1768 13.1946L18.195 8.64594C18.0515 8.00862 17.6916 7.44073 17.1764 7.03894C16.6613 6.63715 16.0229 6.42629 15.3698 6.44225L8.24312 6.71771Z" strokeWidth="3"/>
                                <path d="M28.168 8.47632L38.2894 18.5978" strokeWidth="3"/>
                                <path d="M28.168 18.5978L38.2894 8.47632" strokeWidth="3"/>
                            </svg>
                        </div>
                        <div className="flex flex-col gap-y-2">
                            <h3 className="font-semibold text-xl text-[var(--text-primary)]">Missed Calls = Lost Revenue</h3>
                            <p className="font-normal text-[15px] leading-relaxed text-[var(--text-secondary)]">
                                Every unanswered call is a missed sale, lead, or customer service opportunity.
                            </p>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="flex flex-col items-start gap-y-4 p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-shadow duration-200">
                        <div className="bg-[var(--bg-inset)] p-3 rounded-lg">
                            <svg width="24" height="24" viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg" fill="none" className="stroke-[var(--teal-600)]">
                                <path d="M26.3466 44.7277C36.9252 44.7277 45.5008 36.1522 45.5008 25.5735C45.5008 14.9949 36.9252 6.41931 26.3466 6.41931C15.768 6.41931 7.19238 14.9949 7.19238 25.5735C7.19238 36.1522 15.768 44.7277 26.3466 44.7277Z" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M26.3467 12.8042V25.5737" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M35.3704 34.5976L26.3467 25.5739" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <div className='flex flex-col gap-y-2'>
                            <h3 className='font-semibold text-xl text-[var(--text-primary)]'>24/7 Availability</h3>
                            <p className='font-normal text-[15px] leading-relaxed text-[var(--text-secondary)]'>
                                Cheaper than hiring in-house staff or outsourcing to a call center.
                            </p>
                        </div>
                    </div>

                    {/* Card 3 */}
                    <div className="flex flex-col items-start gap-y-4 p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-shadow duration-200">
                        <div className="bg-[var(--bg-inset)] p-3 rounded-lg">
                            <svg width="24" height="24" viewBox="0 0 48 47" xmlns="http://www.w3.org/2000/svg" fill="none" className="stroke-[var(--teal-600)]">
                                <path d="M24.0184 19.5344C28.2829 19.5344 31.7399 16.0773 31.7399 11.8128C31.7399 7.54835 28.2829 4.09131 24.0184 4.09131C19.7539 4.09131 16.2969 7.54835 16.2969 11.8128C16.2969 16.0773 19.7539 19.5344 24.0184 19.5344Z" strokeWidth="4"/>
                                <path d="M35.6003 17.604C38.7988 17.604 41.3915 15.4434 41.3915 12.7781C41.3915 10.1128 38.7988 7.95215 35.6003 7.95215" strokeWidth="4" strokeLinecap="round"/>
                                <path d="M12.4362 17.604C9.23781 17.604 6.64502 15.4434 6.64502 12.7781C6.64502 10.1128 9.23781 7.95215 12.4362 7.95215" strokeWidth="4" strokeLinecap="round"/>
                                <path d="M24.0178 40.7685C30.4145 40.7685 35.6001 37.3114 35.6001 33.047C35.6001 28.7825 30.4145 25.3254 24.0178 25.3254C17.6211 25.3254 12.4355 28.7825 12.4355 33.047C12.4355 37.3114 17.6211 40.7685 24.0178 40.7685Z" strokeWidth="4"/>
                                <path d="M39.4619 36.9078C42.8482 36.1651 45.2531 34.2846 45.2531 32.0818C45.2531 29.8791 42.8482 27.9985 39.4619 27.2559" strokeWidth="4" strokeLinecap="round"/>
                                <path d="M8.57483 36.9078C5.18846 36.1651 2.78369 34.2846 2.78369 32.0818C2.78369 29.8791 5.18846 27.9985 8.57483 27.2559" strokeWidth="4" strokeLinecap="round"/>
                            </svg>
                        </div>
                        <div className='flex flex-col gap-y-2'>
                            <h3 className='font-semibold text-xl text-[var(--text-primary)]'>Short Staffing Issues?</h3>
                            <p className='font-normal text-[15px] leading-relaxed text-[var(--text-secondary)]'>
                                AI voice agents answer every call, no matter how busy your team is.
                            </p>
                        </div>
                    </div>

                    {/* Card 4 */}
                    <div className="flex flex-col items-start gap-y-4 p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-shadow duration-200">
                        <div className="bg-[var(--bg-inset)] p-3 rounded-lg">
                            <svg width="24" height="24" viewBox="0 0 55 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="stroke-[var(--teal-600)]">
                                <path d="M29.9746 15.4358C32.7012 15.4358 34.9116 13.2254 34.9116 10.4988C34.9116 7.77214 32.7012 5.56177 29.9746 5.56177C27.248 5.56177 25.0376 7.77214 25.0376 10.4988C25.0376 13.2254 27.248 15.4358 29.9746 15.4358Z" strokeWidth="3"/>
                                <path d="M46.1855 32.5459C48.9122 32.5459 51.1225 30.3355 51.1225 27.6089C51.1225 24.8822 48.9122 22.6719 46.1855 22.6719C43.4589 22.6719 41.2485 24.8822 41.2485 27.6089C41.2485 30.3355 43.4589 32.5459 46.1855 32.5459Z" strokeWidth="3"/>
                                <path d="M29.9746 48.6377C32.7012 48.6377 34.9116 46.4273 34.9116 43.7007C34.9116 40.974 32.7012 38.7637 29.9746 38.7637C27.248 38.7637 25.0376 40.974 25.0376 43.7007C25.0376 46.4273 27.248 48.6377 29.9746 48.6377Z" strokeWidth="3"/>
                                <path d="M13.5527 41.3933C16.2794 41.3933 18.4897 39.1829 18.4897 36.4563C18.4897 33.7297 16.2794 31.5193 13.5527 31.5193C10.8261 31.5193 8.61572 33.7297 8.61572 36.4563C8.61572 39.1829 10.8261 41.3933 13.5527 41.3933Z" strokeWidth="3"/>
                                <path d="M13.5527 22.0866C16.2794 22.0866 18.4897 19.8763 18.4897 17.1496C18.4897 14.423 16.2794 12.2126 13.5527 12.2126C10.8261 12.2126 8.61572 14.423 8.61572 17.1496C8.61572 19.8763 10.8261 22.0866 13.5527 22.0866Z" strokeWidth="3"/>
                                <path d="M29.9669 29.6194C32.1688 29.6194 33.9538 27.8344 33.9538 25.6324C33.9538 23.4305 32.1688 21.6455 29.9669 21.6455C27.765 21.6455 25.98 23.4305 25.98 25.6324C25.98 27.8344 27.765 29.6194 29.9669 29.6194Z" strokeWidth="3"/>
                                <path d="M17.8018 14.6299L25.2073 11.7712" strokeWidth="3"/>
                                <path d="M33.4355 14.0281L42.6649 24.1481" strokeWidth="3"/>
                                <path d="M43.1655 31.5112L33.4951 40.2401" strokeWidth="3"/>
                                <path d="M16.2666 21.272L26.9125 39.8324" strokeWidth="3"/>
                                <path d="M17.9204 38.7556L25.0375 42.0554" strokeWidth="3"/>
                                <path d="M15.4019 31.8758L27.3033 14.6472" strokeWidth="3"/>
                                <path d="M18.0986 19.0835L26.4288 23.7915" strokeWidth="3"/>
                                <path d="M33.9619 26.082L41.2487 26.6334" strokeWidth="3"/>
                                <path d="M29.9663 29.6279L29.9748 38.7554" strokeWidth="3"/>
                            </svg>
                        </div>
                        <div className='flex flex-col gap-y-2'>
                            <h3 className='font-semibold text-xl text-[var(--text-primary)]'>Professional & Human-like</h3>
                            <p className='font-normal text-[15px] leading-relaxed text-[var(--text-secondary)]'>
                                Sounds natural and ensures a seamless customer experience.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Feature1