// import ai from '../assets/ai.png'
// import timer from '../assets/timer.png'
// import group from '../assets/group.png'
// import phone from '../assets/phone.png'
// import clock from '../assets/clock.png'
// import missedphone from '../assets/missedcall.png'
import { ArrowUpRight, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import group1 from "../assets/group1.png";
import group2 from "../assets/group2.png";
import group3 from "../assets/group3.png";
import search from "../assets/search2.png";
import star from "../assets/star.png";
// import message from "../assets/message.png";
// import dashboard from "../assets/dashboard.png";
import profile from "../assets/ellipse1251.png";
// import email from "../assets/email.png";
// import communityBg from "../assets/community-bg.webp";

const socials = [
  {
    name: "Discord",
    desc: "Connect our community channel.",
    link: "https://discord.com",
  },
  {
    name: "Github",
    desc: "Join our discussion channel.",
    link: "https://github.com",
  },
  {
    name: "X / Twitter",
    desc: "Get news, company information.",
    link: "https://x.com",
  },
  {
    name: "LinkedIn",
    desc: "Adopt best practices in projects.",
    link: "https://www.linkedin.com/",
  },
  {
    name: "Discuss",
    desc: "Suggest your own ideas.",
    link: "https://test.com",
  },
  {
    name: "E-mail",
    desc: "Ask your follow-up questions.",
    link: "mailto:test@gmail.com",
  },
];

const Feature = () => {
  return (
    <section
      id="feature"
      className="flex-col items-center justify-start gap-y-[70px] py-10 container mx-auto relative z-[1]"
    >
      {/* Perfect Solution for Your Needs */}
      {/* <div className='flex flex-col items-center justify-start gap-y-6 md:gap-y-10 md:px-[40px] lg:px-[100px]'>
                <h1 className='text-[30px] md:text-[50px] font-bold text-primary'>Perfect Solution for Your Needs</h1>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:md:grid-cols-3 gap-5 py-5'>
                    <div className="flex flex-col items-center justify-start gap-y-1.5  p-5">
                        <img src={missedphone} alt="missed phone" />
                        <div className='flex flex-col items-center justify-start gap-y-1.5 p-5'>
                            <p className='font-semibold text-2xl text-primary text-center'>Missed Calls = Lost Revenue</p>
                            <p className='font-normal text-lg text-default-gray text-center'>Every unanswered call is a missed sale, lead, or customer service opportunity.</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-start gap-y-1.5 p-5">
                        <img src={clock} alt="clock" />
                        <div className='flex flex-col items-center justify-start gap-y-1.5 p-5'>
                            <p className='font-semibold text-2xl text-primary text-center'>24/7 Availability Without the Costs</p>
                            <p className='font-normal text-lg text-default-gray text-center'>Cheaper than hiring in-house staff or
                                outsourcing to a call center</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-start gap-y-1.5 p-5">
                        <img src={group} alt="group" />
                        <div className='flex flex-col items-center justify-start gap-y-1.5 p-5'>
                            <p className='font-semibold text-2xl text-primary text-center'>Short Staffing Issues? Solved.</p>
                            <p className='font-normal text-lg text-default-gray text-center'>AI voice agents answer every call, no matter how busy your team is.</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-start gap-y-1.5 p-5">
                        <img src={ai} alt="ai/ml" />
                        <div className='flex flex-col items-center justify-start gap-y-1.5 p-5'>
                            <p className='font-semibold text-2xl text-primary text-center'>Professional & Human-like AI</p>
                            <p className='font-normal text-lg text-default-gray text-center'>Sounds natural and ensures a seamless customer experience</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-start gap-y-1.5 p-5">
                        <img src={phone} alt="phone" />
                        <div className='flex flex-col items-center justify-start gap-y-1.5 p-5'>
                            <p className='font-semibold text-2xl text-primary text-center'>Handle More Calls, Grow Faster</p>
                            <p className='font-normal text-lg text-default-gray text-center'>Scale your business without scaling your staff</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-start gap-y-1.5 p-5">
                        <img src={timer} alt="timer" />
                        <div className='flex flex-col items-center justify-start gap-y-1.5 p-5'>
                            <p className='font-semibold text-2xl text-primary text-center'>Instant Engagement, No Waiting</p>
                            <p className='font-normal text-lg text-default-gray text-center'>No more long hold times or frustrated customers.</p>
                        </div>
                    </div>
                </div>
            </div> */}
      {/* Why Choose Us */}
      <div className="bg-gradient-to-t from-[#d9eeec] to-white flex flex-col items-center justify-start gap-y-15 py-20 rounded-b-[30px] px-3 md:px-0 relative">
        <div className="flex flex-col items-center justify-start gap-y-3 md:px-[100px]">
          <h3 className="text-[30px] md:text-[50px] font-bold text-primary text-center">
            Why Choose Us
          </h3>
          <div>
            <p className="text-[20px] font-normal text-default-gray text-center">
              VoicePeri's AI voice agents are designed to transform the way
            </p>
            <p className="text-[20px] font-normal text-default-gray text-center">
              businesses handle phone calls. Here's how our AI solutions can
              help
            </p>
            <p className="text-[20px] font-normal text-default-gray text-center">
              your business:
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 md:px-[100px] lg:px-[160px] gap-7">
          <div className="flex items-start justify-center bg-white gap-x-2 pt-9 pr-5 pl-7 rounded-[30px] w-auto md:w-[510px] md:h-[160px]">
            <div className="w-[30px]">
              <div className="w-6.5 h-6.5 bg-[#b7f4c5] rounded-full flex items-center justify-center">
                <Check className="text-primary w-5 h-5" />
              </div>
            </div>
            <div className="flex flex-col justify-start gap-y-2 ">
              <p className="text-[22px] font-semibold text-primary text-left">
                Consistent & Reliable Service
              </p>
              <p className="text-lg font-normal text-default-gray text-left">
                Eliminate human errors while maintaining high-quality
                interactions.
              </p>
            </div>
          </div>

          <div className="flex items-start justify-center bg-white gap-x-2 p-8 rounded-[30px] w-auto md:w-[510px] md:h-[160px]">
            <div className="w-[30px]">
              <div className="w-6.5 h-6.5 bg-[#b7f4c5] rounded-full flex items-center justify-center">
                <Check className="text-primary w-5 h-5" />
              </div>
            </div>
            <div className="flex flex-col justify-start gap-y-2 ">
              <p className="text-[22px] font-semibold text-primary text-left">
                Cost-Effective & ROI-Driven
              </p>
              <p className="text-lg font-normal text-default-gray text-left">
                Reduce staffing costs while maximizing customer engagement.
              </p>
            </div>
          </div>

          <div className="flex items-start justify-center bg-white gap-x-2 p-8 rounded-[30px] w-auto md:w-[510px] md:h-[160px]">
            <div className="w-[30px]">
              <div className="w-6.5 h-6.5 bg-[#b7f4c5] rounded-full flex items-center justify-center">
                <Check className="text-primary w-5 h-5" />
              </div>
            </div>
            <div className="flex flex-col justify-start gap-y-2 ">
              <p className="text-[22px] font-semibold text-primary text-left">
                Real-Time Insights & Analytics
              </p>
              <p className="text-lg font-normal text-default-gray text-left">
                Track call performance and customer sentiment to refine your
                strategy
              </p>
            </div>
          </div>

          <div className="flex items-start justify-center bg-white gap-x-2 p-8 rounded-[30px] w-auto md:w-[510px] md:h-[160px]">
            <div className="w-[30px]">
              <div className="w-6.5 h-6.5 bg-[#b7f4c5] rounded-full flex items-center justify-center">
                <Check className="text-primary w-5 h-5" />
              </div>
            </div>
            <div className="flex flex-col justify-start gap-y-2 ">
              <p className="text-[22px] font-semibold text-primary text-left">
                Smart Appointment Scheduling
              </p>
              <p className="text-lg font-normal text-default-gray text-left">
                Automate bookings and never miss an opportunity.
              </p>
            </div>
          </div>

          <div className="flex items-start justify-center bg-white gap-x-2 p-8 rounded-[30px] w-auto md:w-[510px] md:h-[160px]">
            <div className="w-[30px]">
              <div className="w-6.5 h-6.5 bg-[#b7f4c5] rounded-full flex items-center justify-center">
                <Check className="text-primary w-5 h-5" />
              </div>
            </div>
            <div className="flex flex-col justify-start gap-y-2 ">
              <p className="text-[22px] font-semibold text-primary text-left">
                Call Recording & Transcriptions
              </p>
              <p className="text-lg font-normal text-default-gray text-left">
                Keep detailed logs of every conversation for better insights.
              </p>
            </div>
          </div>

          <div className="flex items-start justify-center bg-white gap-x-2 p-8 rounded-[30px] w-auto md:w-[510px] md:h-[160px]">
            <div className="w-[30px]">
              <div className="w-6.5 h-6.5 bg-[#b7f4c5] rounded-full flex items-center justify-center">
                <Check className="text-primary w-5 h-5" />
              </div>
            </div>
            <div className="flex flex-col justify-start gap-y-2 ">
              <p className="text-[22px] font-semibold text-primary text-left">
                Instant Notifications & Alerts
              </p>
              <p className="text-lg font-normal text-default-gray text-left">
                Stay informed with real-time updates via text and email.
              </p>
            </div>
          </div>

          <div className="flex items-start justify-center bg-white gap-x-2 p-8 rounded-[30px] w-auto md:w-[510px] md:h-[160px]">
            <div className="w-[30px]">
              <div className="w-6.5 h-6.5 bg-[#b7f4c5] rounded-full flex items-center justify-center">
                <Check className="text-primary w-5 h-5" />
              </div>
            </div>
            <div className="flex flex-col justify-start items-start gap-y-2 ">
              <p className="text-[22px] font-semibold text-primary text-left">
                AI That Sounds Human, Works Like a Pro
              </p>
              <p className="text-lg font-normal text-default-gray text-left">
                Deliver engaging, natural conversations effortlessly.
              </p>
            </div>
          </div>

          <div className="flex items-start justify-center bg-white gap-x-2 p-8 rounded-[30px] w-auto md:w-[510px] md:h-[160px]">
            <div className="w-[30px]">
              <div className="w-6.5 h-6.5 bg-[#b7f4c5] rounded-full flex items-center justify-center">
                <Check className="text-primary w-5 h-5" />
              </div>
            </div>
            <div className="flex flex-col justify-start gap-y-2 ">
              <p className="text-[22px] font-semibold text-primary text-left">
                Boost Customer Satisfaction
              </p>
              <p className="text-lg font-normal text-default-gray text-left">
                Minimize wait times and enhance customer experience.
              </p>
            </div>
          </div>
        </div>
        <div>
          <Link to="/signup">
            <Button className="rounded-[20px] w-[200px] h-[50px] px-5.5 py-4 text-secondary text-lg font-bold bg-default-purple">
              Start Free Trial <ArrowUpRight className="w-6 h-6" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="justify-items-center constainer py-[80px]">
        <div className="container relative z-10 grid max-w-[1342px] grid-cols-[586px_1fr] overflow-hidden rounded-2xl bg-gray-900 px-12 pb-14 pr-8 pt-11 lg:max-w-[1024px] lg:grid-cols-[350px_1fr] lg:px-10 lg:py-9 md:max-w-[643px] md:grid-cols-1 md:px-8 md:py-7 xs:max-w-[calc(100%-40px)] xs:p-0">
          {/* Left Text */}
          <div className="relative z-20 flex flex-col xs:p-5 justify-between items-start">
            <span className="text-2xl tracking-tighter text-gray-400 xs:text-lg">
              Before you go...
            </span>
            <h2 className="text-5xl text-left mt-auto -mb-3 font-medium leading-tight text-white lg:mb-0 lg:text-4xl md:mt-10 xs:mt-6 xs:text-3xl">
              Connect with <br /> our Community!
            </h2>
          </div>

          {/* Social List */}
          <ul className="relative z-20 grid grid-cols-3 gap-y-8 lg:gap-y-9  xs:grid-cols-2 xs:gap-y-4">
            {socials.map((item) => (
              <li
                key={item.name}
                className="relative flex flex-col items-start px-4 
                                before:content-[''] before:absolute before:-top-1/2 before:left-0 
                                before:h-[200%] before:w-px before:bg-gray-400 
                                lg:before:h-[250%] md:before:top-[-40px] md:before:h-[120%] 
                                xs:pl-0 xs:before:hidden xs:items-center xs:border-t xs:border-gray-400 xs:py-4 xs:pr-0 xs:odd:border-r"
              >
                <div className="w-6.5 h-6.5 bg-[#b7f4c5] rounded-full flex items-center justify-center">
                <Check className="text-primary w-5 h-5" />
              </div>
                <div
                  className="relative text-left mt-2 text-[16px] leading-snug tracking-tight text-white/80
                                before:content-[''] before:absolute before:-left-[17px] before:top-0.5 
                                before:h-4 before:w-[3px] before:rounded-full before:bg-white/80 
                                md:before:top-1 xs:-z-10 xs:before:hidden"
                >
                 {item.name} <span> {item.desc}</span>
                </div>
                <div className="text-white">
                    <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-1"
                    >
                        join{" "}
                        <span className="inline-block transition-all duration-300 group-hover:translate-x-1">
                        &gt;
                        </span>
                    </a>
                </div>
              </li>
            ))}
          </ul>
          
        </div>
        {/* <div className="container relative">
                <img
                    src={communityBg}
                    alt="Community background"
                    className="pointer-events-none absolute -bottom-48 -right-16 
                            lg:-bottom-32 lg:-right-8 lg:max-w-[800px] 
                            md:-bottom-[184px] md:right-1/2 md:max-w-[745px] md:translate-x-1/2 
                            2xs:hidden"
                />
                </div> */}
      </div>

      {/* Getting started - 3 steps */}
      <div className="flex flex-col items-center justify-start gap-y-10 py-20 px-2 md:px-0 lg:px-[100px] ">
        <div className="flex flex-col items-center justify-start gap-y-3 ">
          <h3 className="text-[30px] md:text-[50px] font-bold text-primary text-center">
            Getting started - 3 steps
          </h3>
          <div>
            <p className="text-[20px] font-normal text-default-gray text-center">
              Lorem ipsum dolor sit amet consectetur. Nibh semper diam sed sit{" "}
            </p>
            <p className="text-[20px] font-normal text-default-gray text-center">
              posuere quam consectetur. Sed senectus enim est ut lacinia. Eu.
            </p>
          </div>
        </div>
        <div className="relative w-full md:py-10 md:px-4">
          {/* Line SVG - styled like your provided image with shimmer effect */}
          <div className="hidden md:block absolute top-45 left-0 w-full h-full pointer-events-none z-0">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 1444 512"
              preserveAspectRatio="none"
            >
              {/* Define path once for reuse */}
              <defs>
                <path
                  id="animatedPath"
                  d="M2 0H432C460.376 0 480 19.6243 480 48V144C480 172.376 499.624 192 528 192H908C936.376 192 956 172.376 956 144V48C956 19.6243 975.624 0 1004 0H1438"
                />
              </defs>

              {/* Draw the line path */}
              <use
                href="#animatedPath"
                stroke="#e5e0fa"
                strokeWidth="2.5"
                fill="none"
              />

              {/* Dot that moves along the path */}
              <g>
                <line
                  x1="-13"
                  y1="0"
                  x2="13"
                  y2="0"
                  stroke="#46a79d"
                  strokeWidth="2"
                />
                <animateMotion
                  repeatCount="indefinite"
                  dur="12s"
                  rotate="auto"
                  begin="0s"
                >
                  <mpath href="#animatedPath" />
                </animateMotion>
              </g>
              <g>
                <line
                  x1="-13"
                  y1="0"
                  x2="13"
                  y2="0"
                  stroke="#46a79d"
                  strokeWidth="2"
                />
                <animateMotion
                  repeatCount="indefinite"
                  dur="12s"
                  rotate="auto"
                  begin="2s"
                >
                  <mpath href="#animatedPath" />
                </animateMotion>
              </g>
              <g>
                <line
                  x1="-13"
                  y1="0"
                  x2="13"
                  y2="0"
                  stroke="#46a79d"
                  strokeWidth="2"
                />
                <animateMotion
                  repeatCount="indefinite"
                  dur="12s"
                  rotate="auto"
                  begin="4s"
                >
                  <mpath href="#animatedPath" />
                </animateMotion>
              </g>
              <g>
                <line
                  x1="-13"
                  y1="0"
                  x2="13"
                  y2="0"
                  stroke="#46a79d"
                  strokeWidth="2"
                />
                <animateMotion
                  repeatCount="indefinite"
                  dur="12s"
                  rotate="auto"
                  begin="6s"
                >
                  <mpath href="#animatedPath" />
                </animateMotion>
              </g>
              <g>
                <line
                  x1="-13"
                  y1="0"
                  x2="13"
                  y2="0"
                  stroke="#46a79d"
                  strokeWidth="2"
                />
                <animateMotion
                  repeatCount="indefinite"
                  dur="12s"
                  rotate="auto"
                  begin="8s"
                >
                  <mpath href="#animatedPath" />
                </animateMotion>
              </g>
              <g>
                <line
                  x1="-13"
                  y1="0"
                  x2="13"
                  y2="0"
                  stroke="#46a79d"
                  strokeWidth="2"
                />
                <animateMotion
                  repeatCount="indefinite"
                  dur="12s"
                  rotate="auto"
                  begin="10s"
                >
                  <mpath href="#animatedPath" />
                </animateMotion>
              </g>
            </svg>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[25px] relative z-10">
            <div className="flex flex-col gap-y-[15px] items-center text-center">
              <div>
                <p className="text-[24px] md:text-[30px] font-bold text-primary">
                  Setup voice agent
                </p>
                <p className="text-lg font-normal text-default-gray">
                  Select name, voice and language for your AI voice agent
                </p>
              </div>
              <div className="w-[50px] h-[50px] bg-default-purple rounded-full flex items-center justify-center">
                <p className="text-2xl font-bold text-secondary">1</p>
              </div>
              <img src={group1} alt="Group 1" />
            </div>
            <div className="flex flex-col gap-y-[26px] md:mt-27 items-center text-center">
              <div
                className="flex items-center justify-center bg-cover bg-center rounded-xl w-[350px] h-[200px] order-3 md:order-1"
                style={{
                  backgroundImage: `url(${group3})`,
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <div className="w-20 h-20 bg-[#eee9ff] rounded-full flex items-center justify-center opacity-80 ">
                  <div className="w-14 h-14 bg-[#e5e0fa] rounded-full flex items-center justify-center opacity-80">
                    <img
                      src={search}
                      alt="Search"
                      className="w-10 h-10 opacity-none"
                    />
                  </div>
                </div>
              </div>
              <div className="w-[50px] h-[50px] bg-default-purple rounded-full flex items-center justify-center order-2 md:order-2">
                <p className="text-2xl font-bold text-secondary">2</p>
              </div>
              <div className="order-1 md:order-3">
                <p className="text-[24px] md:text-[30px] font-bold text-primary">
                  Provide business information
                </p>
                <p className="text-lg font-normal text-default-gray">
                  Business information is needed to train AI voice agent with
                  your data
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-y-[15px] items-center text-center md:mt-[-25px]">
              <div>
                <p className="text-[24px] md:text-[30px] font-bold text-primary">
                  Connect with business
                </p>
                <p className="text-lg font-normal text-default-gray">
                  Receive incoming calls by configuring call forwarding to AI
                  voice agent number, also get notifications of call summaries
                  as SMS/email.
                </p>
              </div>
              <div className="w-[50px] h-[50px] bg-default-purple rounded-full flex items-center justify-center">
                <p className="text-2xl font-bold text-secondary">3</p>
              </div>
              <img src={group2} alt="Group 2" />
            </div>
          </div>
        </div>
        <div>
          <Link to="/signup">
            <Button className="rounded-[20px] w-[200px] h-[50px] px-5.5 py-4 text-secondary text-lg font-bold bg-default-purple">
              Start Free Trial <ArrowUpRight className="w-10 h-10" />
            </Button>
          </Link>
        </div>
      </div>
      {/* How it works */}
      <div className="flex flex-col items-center justify-start gap-y-10 px-2 md:px-[100px]">
        <div className="flex flex-col items-center justify-start gap-y-3 ">
          <h3 className="text-[30px] md:text-[50px] font-bold text-primary text-center">
            How it works
          </h3>
          <div>
            <p className="text-[20px] font-normal text-default-gray text-center">
              Lorem ipsum dolor sit amet consectetur. Nibh semper diam sed sit{" "}
            </p>
            <p className="text-[20px] font-normal text-default-gray text-center">
              posuere quam consectetur. Sed senectus enim est ut lacinia. Eu.
            </p>
          </div>
        </div>
        <div className="relative flex flex-col items-center py-8 bg-white min-h-[500px] md:gap-y-[190px]">
          {/* Parent Card */}
          <div className="bg-gradient-to-t from-[#d9eeec] to-white text-primary px-[23px] py-[28px] rounded-[32px] flex items-center gap-4 z-10">
            <img src={profile} alt="Avatar" />
            <div>
              <p className="text-[26px] font-semibold text-left">
                John - 24/7 AI Agent
              </p>
              <p className=" text-base bg-default-purple font-medium text-white px-3.5 py-1 rounded-[50px] mt-1  float-left">
                Inbound Lead
              </p>
            </div>
          </div>

          {/* SVG Lines */}
          <div className="hidden absolute md:flex justify-center gap-x-[100px] top-[150px] w-full h-[150px] z-0">
            {/* Left SVG */}
            <svg
              width="195"
              height="225"
              viewBox="0 0 195 225"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                id="leftPath"
                opacity="0.3"
                d="M1.59932 224.924L1.13052 174.457C0.87233 146.663 23.3325 123.993 51.1283 123.993H143.523C171.237 123.993 193.664 101.451 193.523 73.7377L193.151 0.991211"
                stroke="#46a79d"
              />
              <g>
                <line
                  x1="-8"
                  y1="0"
                  x2="8"
                  y2="0"
                  stroke="#475569"
                  strokeWidth="2"
                />
                <animateMotion
                  repeatCount="indefinite"
                  dur="4s"
                  rotate="auto"
                  begin="0s"
                >
                  <mpath href="#leftPath" />
                </animateMotion>
              </g>

              <g>
                <line
                  x1="-8"
                  y1="0"
                  x2="8"
                  y2="0"
                  stroke="#475569"
                  strokeWidth="2"
                />
                <animateMotion
                  repeatCount="indefinite"
                  dur="4s"
                  rotate="auto"
                  begin="2s"
                >
                  <mpath href="#leftPath" />
                </animateMotion>
              </g>
            </svg>

            {/* Center SVG */}
            <svg
              width="4"
              height="262"
              viewBox="0 0 4 262"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                id="centerPath"
                opacity="0.3"
                d="M2.97559 261.272L1.43555 0.935547"
                stroke="#46a79d"
              />
              <g>
                <line
                  x1="-8"
                  y1="0"
                  x2="8"
                  y2="0"
                  stroke="#475569"
                  strokeWidth="2"
                />
                <animateMotion
                  repeatCount="indefinite"
                  dur="4s"
                  rotate="auto"
                  begin="0s"
                >
                  <mpath href="#centerPath" />
                </animateMotion>
              </g>
              <g>
                <line
                  x1="-8"
                  y1="0"
                  x2="8"
                  y2="0"
                  stroke="#475569"
                  strokeWidth="2"
                />
                <animateMotion
                  repeatCount="indefinite"
                  dur="4s"
                  rotate="auto"
                  begin="2s"
                >
                  <mpath href="#centerPath" />
                </animateMotion>
              </g>
            </svg>

            {/* Right SVG */}
            <svg
              width="213"
              height="225"
              viewBox="0 0 213 225"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                id="rightPath"
                opacity="0.3"
                d="M211.443 224.924L211.957 174.503C212.241 146.691 189.773 123.993 161.96 123.993L50.7112 123.993C22.9875 123.993 0.556619 101.436 0.712022 73.7127L1.11966 0.991211"
                stroke="#46a79d"
              />
              <g>
                <line
                  x1="-8"
                  y1="0"
                  x2="8"
                  y2="0"
                  stroke="#475569"
                  strokeWidth="2"
                />
                <animateMotion
                  repeatCount="indefinite"
                  dur="4s"
                  rotate="auto"
                  begin="0s"
                >
                  <mpath href="#rightPath" />
                </animateMotion>
              </g>
              <g>
                <line
                  x1="-8"
                  y1="0"
                  x2="8"
                  y2="0"
                  stroke="#475569"
                  strokeWidth="2"
                />
                <animateMotion
                  repeatCount="indefinite"
                  dur="4s"
                  rotate="auto"
                  begin="2s"
                >
                  <mpath href="#rightPath" />
                </animateMotion>
              </g>
            </svg>
          </div>

          {/* Child Cards */}
          <div className="block md:flex w-full md:w-auto justify-center gap-[100px] z-10">
            <div className="md:w-[200px] h-[130px] flex flex-col mt-2 md:mt-auto items-center justify-center gap-y-1 bg-gradient-to-t from-[#d9eeec] to-white text-primary  rounded-[32px] text-center md:rotate-[-14.18deg]">
              <div
                className="w-14 h-14 flex items-center justify-center bg-cover bg-center"
                style={{
                  backgroundImage: `url(${star})`,
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <svg width="22" height="24" viewBox="0 0 22 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5.96866 10.1158L14.2399 7.76098M7.14609 14.2515L15.4173 11.8966M20.0022 8.35586C21.4653 13.495 18.4854 18.8471 13.3462 20.3102C11.2408 20.9097 4.04184 22.9592 4.04184 22.9592C4.04184 22.9592 4.55185 18.6294 3.53719 17.5152C2.56306 16.4455 1.81493 15.1402 1.39188 13.6543C-0.0712323 8.51518 2.90873 3.16303 8.04782 1.69992C13.187 0.236787 18.5391 3.21677 20.0022 8.35586Z" stroke="url(#paint0_linear_395_4245)" stroke-width="1.50111" stroke-linecap="round" stroke-linejoin="round"/>
                    <defs>
                    <linearGradient id="paint0_linear_395_4245" x1="8.04783" y1="1.69991" x2="13.3462" y2="20.3102" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#46a79d"/>
                    <stop offset="1" stop-color="#d9eeec"/>
                    </linearGradient>
                    </defs>
                </svg>

              </div>
              <p className="text-lg text-primary font-bold text-center">
                Sends a Text
              </p>
            </div>
            <div className="md:mt-[50px] md:w-[200px] h-[130px] mt-2 flex flex-col items-center justify-center gap-y-1 bg-gradient-to-t from-[#d9eeec] to-white text-primary rounded-[32px] text-center md:rotate-[8.73deg]">
              <div
                className="w-14 h-14 flex items-center justify-center bg-cover bg-center"
                style={{
                  backgroundImage: `url(${star})`,
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <svg width="32" height="28" viewBox="0 0 32 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M7.2117 4.05675C6.2484 4.71018 5.48872 5.89378 5.18279 7.88644L3.85023 16.5661C3.54431 18.5587 3.91393 19.9157 4.63684 20.828C5.37045 21.7538 6.59358 22.3812 8.31095 22.6449L20.7104 24.5486C22.4278 24.8122 23.7827 24.5806 24.7604 23.9176C25.7236 23.2641 26.4833 22.0805 26.7893 20.0879L28.1218 11.4082C28.4278 9.41557 28.0581 8.05858 27.3353 7.14627C26.6015 6.22043 25.3784 5.59304 23.6611 5.32939L11.2616 3.42572C9.54427 3.16206 8.18925 3.39363 7.2117 4.05675ZM6.15536 2.49949C7.65707 1.48084 9.5447 1.25836 11.5472 1.5658L23.9467 3.46947C25.9492 3.77691 27.6832 4.5554 28.81 5.97761C29.9477 7.41336 30.3421 9.34661 29.9818 11.6938L28.6492 20.3734C28.2888 22.7206 27.3327 24.4465 25.8166 25.4748C24.315 26.4935 22.4274 26.7159 20.4249 26.4085L8.0254 24.5048C6.02292 24.1974 4.28896 23.4189 3.162 21.9967C2.02436 20.561 1.62994 18.6277 1.99031 16.2805L3.32287 7.60089C3.68323 5.25373 4.63942 3.52783 6.15536 2.49949Z" fill="url(#paint0_linear_395_4264)"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M26.0094 9.57359C26.2611 10.0282 26.0965 10.6008 25.642 10.8524L17.9479 15.1112C16.5742 15.8715 14.8605 15.6084 13.7781 14.471L7.71599 8.10026C7.35778 7.72384 7.37257 7.1283 7.74901 6.77011C8.12544 6.4119 8.72097 6.42669 9.07917 6.80313L15.1412 13.1738C15.6332 13.6909 16.4123 13.8105 17.0366 13.4648L24.7307 9.20607C25.1853 8.95443 25.7578 9.11897 26.0094 9.57359Z" fill="url(#paint1_linear_395_4264)"/>
                    <defs>
                    <linearGradient id="paint0_linear_395_4264" x1="17.7469" y1="2.51763" x2="14.2251" y2="25.4567" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#46a79d"/>
                    <stop offset="1" stop-color="#d9eeec"/>
                    </linearGradient>
                    <linearGradient id="paint1_linear_395_4264" x1="16.9347" y1="7.81046" x2="15.7537" y2="15.5027" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#46a79d"/>
                    <stop offset="1" stop-color="#d9eeec"/>
                    </linearGradient>
                    </defs>
                </svg>

              </div>
              <p className="text-lg text-primary font-bold text-center">
                Sends an Email
              </p>
            </div>
            <div className="md:w-[200px] h-[130px] flex flex-col mt-2 md:mt-auto items-center justify-center gap-y-1 bg-gradient-to-t from-[#d9eeec] to-white text-primary rounded-[32px] text-center md:rotate-[10.35deg]">
              <div
                className="w-14 h-14 flex items-center justify-center bg-cover bg-center"
                style={{
                  backgroundImage: `url(${star})`,
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <svg width="45" height="45" viewBox="0 0 45 45" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M33.9286 11.843L15.447 8.47701C13.7458 8.16718 12.1155 9.2951 11.8057 10.9963L8.43972 29.4779C8.12989 31.1791 9.2578 32.8094 10.959 33.1192L29.4406 36.4852C31.1418 36.795 32.7721 35.6671 33.0819 33.9659L36.4479 15.4843C36.7577 13.7831 35.6298 12.1528 33.9286 11.843Z" stroke="url(#paint0_linear_395_4252)" stroke-width="1.87856" stroke-linecap="round"/>
                    <path d="M10.9644 15.6167L35.6065 20.1047" stroke="url(#paint1_linear_395_4252)" stroke-width="1.87856" stroke-linecap="round"/>
                    <path d="M18.3843 18.5591L15.5793 33.9604" stroke="url(#paint2_linear_395_4252)" stroke-width="1.87856" stroke-linecap="round"/>
                    <defs>
                    <linearGradient id="paint0_linear_395_4252" x1="24.6878" y1="10.16" x2="20.1998" y2="34.8022" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#46a79d"/>
                    <stop offset="1" stop-color="#d9eeec"/>
                    </linearGradient>
                    <linearGradient id="paint1_linear_395_4252" x1="23.2854" y1="17.8607" x2="23.1063" y2="18.8445" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#46a79d"/>
                    <stop offset="1" stop-color="#d9eeec"/>
                    </linearGradient>
                    <linearGradient id="paint2_linear_395_4252" x1="18.8762" y1="18.6487" x2="16.0712" y2="34.05" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#46a79d"/>
                    <stop offset="1" stop-color="#d9eeec"/>
                    </linearGradient>
                    </defs>
                </svg>

              </div>
              <p className="text-lg text-primary font-bold text-center">
                Dashboard
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Feature;
