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
        <section id="feature" className='flex-col items-center justify-start gap-y-[70px] py-10 container mx-auto relative'>
            {/* Perfect Solution for Your Needs */}
            <div className='flex flex-col items-center justify-start gap-y-6 md:gap-y-10 md:px-[40px] lg:px-[100px]  '>
                <h1 className='text-[30px] md:text-[50px] font-bold text-primary'>Perfect Solution for Your Needs</h1>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:md:grid-cols-3 gap-5 py-[70px] shadow-2xl rounded-2xl bg-white'>
                    <div className="flex flex-col items-center justify-start gap-y-1.5 p-5 group">
                        <div className='group-hover:bg-[#72e6da] bg-[#f8f9ff] transition-colors duration-500 p-5 rounded-2xl'>
                            <svg
                            width="46"
                            height="46"
                            viewBox="0 0 46 46"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            className="stroke-[#72e6da] group-hover:stroke-[#fff] transition-colors duration-500"
                            >
                            <path
                                d="M8.24312 6.71771C7.99569 6.72574 7.75239 6.78334 7.52762 6.88709C7.30285 6.99085 7.10118 7.13864 6.93456 7.32173C6.76793 7.50482 6.63974 7.71948 6.55756 7.95301C6.47539 8.18653 6.4409 8.43417 6.45615 8.68126C6.70336 12.9191 7.86877 23.2595 13.4486 29.7081C20.1303 37.4776 28.8321 40.1545 37.7599 39.7589C38.2384 39.7303 38.6883 39.5212 39.0186 39.1738C39.349 38.8264 39.5352 38.3666 39.5398 37.8872V31.0996C39.5342 30.4663 39.316 29.8532 38.9202 29.3588C38.5244 28.8644 37.974 28.5173 37.3573 28.3732L32.8863 27.3844C32.3333 27.2665 31.7577 27.3172 31.2339 27.53C30.7101 27.7428 30.2621 28.1079 29.9481 28.578L28.9592 30.0754C28.8684 30.2124 28.7327 30.3135 28.5754 30.3612C28.4181 30.4089 28.2491 30.4003 28.0975 30.3368C25.8232 29.355 16.7612 25.1171 15.7653 17.9692C15.7458 17.8312 15.7676 17.6905 15.8279 17.5648C15.8883 17.4391 15.9844 17.3341 16.1044 17.2629L17.8984 16.1682C18.3905 15.8632 18.777 15.4144 19.0056 14.8826C19.2343 14.3507 19.294 13.7615 19.1768 13.1946L18.195 8.64594C18.0515 8.00862 17.6916 7.44073 17.1764 7.03894C16.6613 6.63715 16.0229 6.42629 15.3698 6.44225L8.24312 6.71771Z"
                                strokeWidth="2.11893"
                            />
                            <path
                                d="M28.168 8.47632L38.2894 18.5978"
                                strokeWidth="2.11893"
                            />
                            <path
                                d="M28.168 18.5978L38.2894 8.47632"
                                strokeWidth="2.11893"
                            />
                            </svg>
                        </div>

                        <div className="flex flex-col items-center justify-start gap-y-1.5 p-5">
                            <p className="font-semibold text-2xl text-primary text-center">
                            Missed Calls = Lost Revenue
                            </p>
                            <p className="font-normal text-lg text-default-gray text-center">
                            Every unanswered call is a missed sale, lead, or customer service opportunity.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-start gap-y-1.5 p-5 group">
                        {/* <img src={clock} alt="clock" /> */}
                        <div className="group-hover:bg-[#72e6da] bg-[#f8f9ff] transition-colors duration-500 p-5 rounded-2xl">
                            <svg
                                width="52"
                                height="52"
                                viewBox="0 0 52 52"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                className="stroke-[#72e6da] group-hover:stroke-[#fff] transition-colors duration-500"
                            >
                                <path
                                d="M26.3466 44.7277C36.9252 44.7277 45.5008 36.1522 45.5008 25.5735C45.5008 14.9949 36.9252 6.41931 26.3466 6.41931C15.768 6.41931 7.19238 14.9949 7.19238 25.5735C7.19238 36.1522 15.768 44.7277 26.3466 44.7277Z"
                                strokeWidth="2.835"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                />
                                <path
                                d="M26.3467 12.8042V25.5737"
                                strokeWidth="2.835"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                />
                                <path
                                d="M35.3704 34.5976L26.3467 25.5739"
                                strokeWidth="2.835"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                />
                            </svg>
                        </div>

                        <div className='flex flex-col items-center justify-start gap-y-1.5 p-5'>
                            <p className='font-semibold text-2xl text-primary text-center'>24/7 Availability Without the Costs</p>
                            <p className='font-normal text-lg text-default-gray text-center'>Cheaper than hiring in-house staff or
                                outsourcing to a call center</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-start gap-y-1.5 p-5 group">
                        {/* <img src={group} alt="group" /> */}
                        <div className="group-hover:bg-[#72e6da] bg-[#f8f9ff] transition-colors duration-500 p-5 rounded-2xl">
                            <svg
                                width="48"
                                height="47"
                                viewBox="0 0 48 47"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                className="stroke-[#72e6da] group-hover:stroke-[#fff] transition-colors duration-500"
                            >
                                <path
                                d="M24.0184 19.5344C28.2829 19.5344 31.7399 16.0773 31.7399 11.8128C31.7399 7.54835 28.2829 4.09131 24.0184 4.09131C19.7539 4.09131 16.2969 7.54835 16.2969 11.8128C16.2969 16.0773 19.7539 19.5344 24.0184 19.5344Z"
                                strokeWidth="2.89557"
                                />
                                <path
                                d="M35.6003 17.604C38.7988 17.604 41.3915 15.4434 41.3915 12.7781C41.3915 10.1128 38.7988 7.95215 35.6003 7.95215"
                                strokeWidth="2.89557"
                                strokeLinecap="round"
                                />
                                <path
                                d="M12.4362 17.604C9.23781 17.604 6.64502 15.4434 6.64502 12.7781C6.64502 10.1128 9.23781 7.95215 12.4362 7.95215"
                                strokeWidth="2.89557"
                                strokeLinecap="round"
                                />
                                <path
                                d="M24.0178 40.7685C30.4145 40.7685 35.6001 37.3114 35.6001 33.047C35.6001 28.7825 30.4145 25.3254 24.0178 25.3254C17.6211 25.3254 12.4355 28.7825 12.4355 33.047C12.4355 37.3114 17.6211 40.7685 24.0178 40.7685Z"
                                strokeWidth="2.89557"
                                />
                                <path
                                d="M39.4619 36.9078C42.8482 36.1651 45.2531 34.2846 45.2531 32.0818C45.2531 29.8791 42.8482 27.9985 39.4619 27.2559"
                                strokeWidth="2.89557"
                                strokeLinecap="round"
                                />
                                <path
                                d="M8.57483 36.9078C5.18846 36.1651 2.78369 34.2846 2.78369 32.0818C2.78369 29.8791 5.18846 27.9985 8.57483 27.2559"
                                strokeWidth="2.89557"
                                strokeLinecap="round"
                                />
                            </svg>
                        </div>

                        <div className='flex flex-col items-center justify-start gap-y-1.5 p-5'>
                            <p className='font-semibold text-2xl text-primary text-center'>Short Staffing Issues? Solved.</p>
                            <p className='font-normal text-lg text-default-gray text-center'>AI voice agents answer every call, no matter how busy your team is.</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-start gap-y-1.5 p-5 group">
                        {/* <img src={ai} alt="ai/ml" /> */}
                        <div className="group-hover:bg-[#72e6da] bg-[#f8f9ff] transition-colors duration-500 p-5 rounded-2xl">
                            <svg
                                width="55"
                                height="56"
                                viewBox="0 0 55 56"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="stroke-[#72e6da] group-hover:stroke-white transition-colors duration-500"
                            >
                                <path d="M29.9746 15.4358C32.7012 15.4358 34.9116 13.2254 34.9116 10.4988C34.9116 7.77214 32.7012 5.56177 29.9746 5.56177C27.248 5.56177 25.0376 7.77214 25.0376 10.4988C25.0376 13.2254 27.248 15.4358 29.9746 15.4358Z" strokeWidth="2.025"/>
                                <path d="M46.1855 32.5459C48.9122 32.5459 51.1225 30.3355 51.1225 27.6089C51.1225 24.8822 48.9122 22.6719 46.1855 22.6719C43.4589 22.6719 41.2485 24.8822 41.2485 27.6089C41.2485 30.3355 43.4589 32.5459 46.1855 32.5459Z" strokeWidth="2.025"/>
                                <path d="M29.9746 48.6377C32.7012 48.6377 34.9116 46.4273 34.9116 43.7007C34.9116 40.974 32.7012 38.7637 29.9746 38.7637C27.248 38.7637 25.0376 40.974 25.0376 43.7007C25.0376 46.4273 27.248 48.6377 29.9746 48.6377Z" strokeWidth="2.025"/>
                                <path d="M13.5527 41.3933C16.2794 41.3933 18.4897 39.1829 18.4897 36.4563C18.4897 33.7297 16.2794 31.5193 13.5527 31.5193C10.8261 31.5193 8.61572 33.7297 8.61572 36.4563C8.61572 39.1829 10.8261 41.3933 13.5527 41.3933Z" strokeWidth="2.025"/>
                                <path d="M13.5527 22.0866C16.2794 22.0866 18.4897 19.8763 18.4897 17.1496C18.4897 14.423 16.2794 12.2126 13.5527 12.2126C10.8261 12.2126 8.61572 14.423 8.61572 17.1496C8.61572 19.8763 10.8261 22.0866 13.5527 22.0866Z" strokeWidth="2.025"/>
                                <path d="M29.9669 29.6194C32.1688 29.6194 33.9538 27.8344 33.9538 25.6324C33.9538 23.4305 32.1688 21.6455 29.9669 21.6455C27.765 21.6455 25.98 23.4305 25.98 25.6324C25.98 27.8344 27.765 29.6194 29.9669 29.6194Z" strokeWidth="2.025"/>
                                <path d="M17.8018 14.6299L25.2073 11.7712" strokeWidth="2.025"/>
                                <path d="M33.4355 14.0281L42.6649 24.1481" strokeWidth="2.025"/>
                                <path d="M43.1655 31.5112L33.4951 40.2401" strokeWidth="2.025"/>
                                <path d="M16.2666 21.272L26.9125 39.8324" strokeWidth="2.025"/>
                                <path d="M17.9204 38.7556L25.0375 42.0554" strokeWidth="2.025"/>
                                <path d="M15.4019 31.8758L27.3033 14.6472" strokeWidth="2.025"/>
                                <path d="M18.0986 19.0835L26.4288 23.7915" strokeWidth="2.025"/>
                                <path d="M33.9619 26.082L41.2487 26.6334" strokeWidth="2.025"/>
                                <path d="M29.9663 29.6279L29.9748 38.7554" strokeWidth="2.025"/>
                            </svg>
                        </div>
                        <div className='flex flex-col items-center justify-start gap-y-1.5 p-5'>
                            <p className='font-semibold text-2xl text-primary text-center'>Professional & Human-like AI</p>
                            <p className='font-normal text-lg text-default-gray text-center'>Sounds natural and ensures a seamless customer experience</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-start gap-y-1.5 p-5 group">
                        {/* <img src={phone} alt="phone" /> */}
                        <div className="group-hover:bg-[#72e6da] bg-[#f8f9ff] transition-colors duration-500 p-5 rounded-2xl">
                            <svg
                                width="45"
                                height="46"
                                viewBox="0 0 45 46"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                className="transition-colors duration-500 group-hover:[&_path]:fill-white"
                            >
                                <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M17.2892 7.29257C15.4212 4.65051 11.6832 4.20474 9.42341 6.58393L6.53066 9.62946C5.54308 10.6692 4.79249 12.1135 4.88287 13.7974C5.06579 17.2055 6.51286 24.1809 14.1302 32.2007C22.2935 40.7951 30.0803 41.2272 33.4417 40.8953C34.8184 40.7595 35.9327 40.0252 36.7499 39.1649L39.3678 36.4086C41.7729 33.8765 41.0724 29.6391 38.063 27.9069L34.542 25.8803C32.5175 24.715 30.0068 25.049 28.3964 26.7445L27.6433 27.5374C27.5899 27.5562 27.4225 27.6013 27.1024 27.5493C26.3606 27.4288 24.7596 26.7738 22.1203 23.9951C19.4891 21.225 18.841 19.5189 18.7179 18.6794C18.6586 18.2744 18.7189 18.061 18.7428 17.994L18.7467 17.9833L19.198 17.5082C20.9811 15.6308 21.1074 12.6928 19.6133 10.5795L17.2892 7.29257ZM11.4278 8.48778C12.3914 7.47333 14.0877 7.55302 15.032 8.88852L17.356 12.1755C18.134 13.2758 18.0147 14.7399 17.1935 15.6044L16.665 16.1609L17.6448 17.0916C16.6649 16.1609 16.6624 16.1636 16.6624 16.1636L16.6598 16.1663L16.6545 16.1721L16.6432 16.1843L16.6186 16.2119C16.6014 16.2317 16.5825 16.2544 16.5622 16.28C16.5217 16.3312 16.4759 16.3941 16.4278 16.4693C16.3314 16.6199 16.2268 16.8183 16.1383 17.0672C15.9582 17.5732 15.8601 18.2433 15.9827 19.0802C16.2236 20.7244 17.3009 22.9354 20.1159 25.899C22.9223 28.8538 25.0421 30.0154 26.6594 30.2781C27.4891 30.4128 28.1608 30.3052 28.6695 30.1045C28.9181 30.0064 29.115 29.8912 29.2626 29.7865C29.3361 29.7344 29.3975 29.6848 29.4471 29.6413C29.4718 29.6196 29.4937 29.5995 29.5127 29.5811L29.539 29.5551L29.5508 29.5431L29.5562 29.5374L29.5589 29.5348C29.5589 29.5348 29.5613 29.532 28.5899 28.6092L29.5615 29.532L30.4008 28.6483C31.1111 27.9004 32.218 27.7324 33.1629 28.2762L36.6839 30.3029C38.1968 31.1736 38.4928 33.3157 37.3634 34.5048L34.7455 37.2611C34.2311 37.8024 33.6931 38.0927 33.1701 38.1443C30.5254 38.4053 23.6249 38.1826 16.1346 30.2967C8.99099 22.7758 7.79272 16.4318 7.64336 13.6492C7.60387 12.9133 7.92431 12.1763 8.53506 11.5333L11.4278 8.48778Z"
                                fill="url(#paint0_linear_395_4539)"
                                />
                                <defs>
                                <linearGradient
                                    id="paint0_linear_395_4539"
                                    x1="22.8452"
                                    y1="5.03052"
                                    x2="22.8452"
                                    y2="40.9698"
                                    gradientUnits="userSpaceOnUse"
                                >
                                    <stop stopColor="#72e6da" />
                                    <stop offset="1" stopColor="#72e6da" />
                                </linearGradient>
                                </defs>
                            </svg>
                        </div>

                        <div className='flex flex-col items-center justify-start gap-y-1.5 p-5'>
                            <p className='font-semibold text-2xl text-primary text-center'>Handle More Calls, Grow Faster</p>
                            <p className='font-normal text-lg text-default-gray text-center'>Scale your business without scaling your staff</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-start gap-y-1.5 p-5 group">
                        {/* <img src={timer} alt="timer" /> */}
                        <div className="group-hover:bg-[#72e6da] bg-[#f8f9ff] transition-colors duration-500 p-5 rounded-2xl">
                            <svg
                                width="42"
                                height="43"
                                viewBox="0 0 42 43"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="transition-colors duration-500 group-hover:[&_path]:fill-white"
                            >
                                <g clipPath="url(#clip0_395_4548)">
                                <path d="M35.2586 39.5653H32.7912L32.791 35.162C32.791 30.7473 30.3689 26.6887 25.9711 23.7341C25.4147 23.3598 25.0689 22.555 25.0689 21.6334C25.0689 20.7118 25.4147 19.9069 25.9709 19.533C30.3689 16.578 32.791 12.5195 32.7912 8.10469V3.70116H35.2586C36.0285 3.70116 36.6528 3.07675 36.6528 2.30681C36.6528 1.53687 36.0284 0.912598 35.2586 0.912598H6.65154C5.8816 0.912598 5.25732 1.53701 5.25732 2.30681C5.25732 3.07689 5.88173 3.70116 6.65154 3.70116H9.1189V8.10455C9.1189 12.5197 11.5408 16.5781 15.9386 19.5327C16.4952 19.9068 16.8409 20.7115 16.8409 21.6332C16.8409 22.555 16.4952 23.3597 15.9387 23.7336C11.5408 26.6885 9.1189 30.747 9.1189 35.1618V39.5652H6.65154C5.8816 39.5652 5.25732 40.1896 5.25732 40.9595C5.25732 41.7296 5.88173 42.3538 6.65154 42.3538H35.2586C36.0285 42.3538 36.6528 41.7295 36.6528 40.9595C36.6528 40.1896 36.0284 39.5653 35.2586 39.5653ZM11.9073 35.1618C11.9073 30.4979 15.4075 27.45 17.494 26.0484C18.8311 25.1496 19.6294 23.4992 19.6294 21.6332C19.6294 19.7673 18.8311 18.117 17.4938 17.2181C15.4075 15.8164 11.9073 12.7684 11.9073 8.10455V3.70116H30.0028L30.0025 8.10455C30.0025 12.7683 26.5022 15.8164 24.4155 17.2184C23.0786 18.1172 22.2805 19.7676 22.2805 21.6332C22.2805 23.4989 23.0786 25.1492 24.4158 26.0484C26.5022 27.4502 30.0025 30.4983 30.0028 35.1618V39.5652H29.5407C28.3944 35.2566 22.5448 30.5735 21.8138 30.002C21.3092 29.6074 20.6007 29.6077 20.0962 30.002C19.3652 30.5734 13.5154 35.2566 12.3692 39.5652H11.9072L11.9073 35.1618ZM26.6108 39.5653H15.2992C16.2179 37.4178 18.841 34.6994 20.9551 32.9012C23.0693 34.6994 25.6922 37.4178 26.6108 39.5653Z" fill="url(#paint0_linear_395_4548)"/>
                                <path d="M20.955 27.5653C21.3217 27.5653 21.6814 27.4161 21.9407 27.1567C22.2013 26.8975 22.3492 26.5376 22.3492 26.1711C22.3492 25.8045 22.2013 25.4447 21.9407 25.1853C21.6814 24.9262 21.3217 24.7769 20.955 24.7769C20.5883 24.7769 20.2286 24.926 19.9693 25.1853C19.71 25.4447 19.5608 25.8045 19.5608 26.1711C19.5608 26.5376 19.7098 26.8975 19.9693 27.1567C20.2286 27.416 20.5883 27.5653 20.955 27.5653Z" fill="url(#paint1_linear_395_4548)"/>
                                <path d="M20.955 20.1712C21.7251 20.1712 22.3492 19.547 22.3492 18.777V16.3123C22.3492 15.5424 21.7249 14.918 20.955 14.918C20.1851 14.918 19.5608 15.5424 19.5608 16.3123V18.777C19.5608 19.547 20.1849 20.1712 20.955 20.1712Z" fill="url(#paint2_linear_395_4548)"/>
                                </g>
                                <defs>
                                <linearGradient id="paint0_linear_395_4548" x1="20.9551" y1="0.912598" x2="20.9551" y2="42.3538" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#72e6da"/>
                                    <stop offset="1" stopColor="#72e6da"/>
                                </linearGradient>
                                <linearGradient id="paint1_linear_395_4548" x1="20.955" y1="24.7769" x2="20.955" y2="27.5653" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#72e6da"/>
                                    <stop offset="1" stopColor="#72e6da"/>
                                </linearGradient>
                                <linearGradient id="paint2_linear_395_4548" x1="20.955" y1="14.918" x2="20.955" y2="20.1712" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#72e6da"/>
                                    <stop offset="1" stopColor="#72e6da"/>
                                </linearGradient>
                                <clipPath id="clip0_395_4548">
                                    <rect width="41.4413" height="41.4413" fill="white" transform="translate(0.234375 0.912598)"/>
                                </clipPath>
                                </defs>
                            </svg>
                        </div>

                        <div className='flex flex-col items-center justify-start gap-y-1.5 p-5'>
                            <p className='font-semibold text-2xl text-primary text-center'>Instant Engagement, No Waiting</p>
                            <p className='font-normal text-lg text-default-gray text-center'>No more long hold times or frustrated customers.</p>
                        </div>
                    </div>
                </div>
            </div>
             <div className="absolute -top-70 right-0 -z-50">
                <svg
                    width="602"
                    height="1154"
                    viewBox="0 0 602 1154"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <g opacity="0.25" filter="url(#filter0_f_26_84)">
                    <circle
                        cx="577"
                        cy="577"
                        r="317"
                        fill="url(#paint0_linear_26_84)"
                    />
                    </g>
                    <defs>
                    <filter
                        id="filter0_f_26_84"
                        x="0"
                        y="0"
                        width="1154"
                        height="1154"
                        filterUnits="userSpaceOnUse"
                        colorInterpolationFilters="sRGB"
                    >
                        <feFlood floodOpacity="0" result="BackgroundImageFix" />
                        <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="BackgroundImageFix"
                        result="shape"
                        />
                        <feGaussianBlur
                        stdDeviation="130"
                        result="effect1_foregroundBlur_26_84"
                        />
                    </filter>
                    <linearGradient
                        id="paint0_linear_26_84"
                        x1="183.787"
                        y1="894"
                        x2="970.173"
                        y2="346.491"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop stopColor="#72e6da" />
                        <stop offset="1" stopColor="#72e6da" />
                    </linearGradient>
                    </defs>
                </svg>
            </div>

            <div className="absolute left-0 -bottom-1/2 z-[-1] hidden md:block">
                <svg
                    width="622"
                    height="1236"
                    viewBox="0 0 622 1236"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <g opacity="0.2" filter="url(#filter0_f_26_85)">
                    <circle
                        cx="4"
                        cy="618"
                        r="368"
                        fill="url(#paint0_linear_26_85)"
                    />
                    </g>
                    <defs>
                    <filter
                        id="filter0_f_26_85"
                        x="-614"
                        y="0"
                        width="1236"
                        height="1236"
                        filterUnits="userSpaceOnUse"
                        colorInterpolationFilters="sRGB"
                    >
                        <feFlood floodOpacity="0" result="BackgroundImageFix" />
                        <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="BackgroundImageFix"
                        result="shape"
                        />
                        <feGaussianBlur
                        stdDeviation="125"
                        result="effect1_foregroundBlur_26_85"
                        />
                    </filter>
                    <linearGradient
                        id="paint0_linear_26_85"
                        x1="-364"
                        y1="250"
                        x2="506.12"
                        y2="754.835"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop stopColor="#FF8FE8" />
                        <stop offset="1" stopColor="#FFC960" />
                    </linearGradient>
                    </defs>
                </svg>
            </div>
           
        </section>
    )
}

export default Feature1