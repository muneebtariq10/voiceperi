import { Button } from './ui/button'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
} from "@/components/ui/accordion";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Plus } from "lucide-react";
import backgroundimage from '../assets/bg2.png'
// import videoicon from '../assets/video.png'
const items = [
    {
        title: "What is an AI Voice Assistant?",
        content: "An AI Voice Assistant is an intelligent software program that uses artificial intelligence, natural language processing, and speech recognition to converse seamlessly with humans. It can act as a customer representative, recruiter, or internal assistant.",
    },
    {
        title: "How easy is it to integrate VoicePeri into my workflow?",
        content: "Very easy! VoicePeri offers seamless integration APIs and webhooks that connect directly to your CRM, support systems, and internal tools in just a few clicks. No complex coding is required.",
    },
    {
        title: "Are the voices customizable?",
        content: "Yes. VoicePeri offers a wide variety of ultra-realistic, human-like voices. You can select specific accents, tones, and genders to perfectly match your brand's unique identity.",
    },
    {
        title: "Is my data secure?",
        content: "Security is our top priority. All conversations and data are encrypted end-to-end. We adhere to strict global compliance standards like GDPR and SOC2 to ensure your users' data remains completely private.",
    },
    {
        title: "What languages are supported?",
        content: "Our AI assistants currently support over 30 languages, including English, Spanish, French, German, Mandarin, and many more, allowing you to connect with a global audience effortlessly.",
    },
];
const FAQ = () => {
    return (
        <>
        <section id="faq" className='flex flex-col py-[30px] md:py-[80px] px-4 md:px-[100px] container mx-auto max-w-[850px]'>
            <div className='block justify-items-center items-start justify-between '>
                <div className='flex basis-2/5 flex-col gap-y-4 items-center'>
                    <h3 className='text-[30px] md:text-[50px] font-bold text-primary text-left'>Frequently Asked Questions</h3>
                    <div className='flex flex-col gap-y-2 '>
                        <p className='text-default-gray text-lg font-normal text-center'>Have questions about integrating VoicePeri into your business workflow? &nbsp;
                            <span className='text-primary text-[20px] font-medium text-left'>Contact us below if you have any more questions.</span>
                        </p>
                        
                    </div>
                    <a href="#contactus" className='flex float-left mt-2'>
                        <Button className='rounded-[20px] px-9 py-5 text-secondary text-lg font-bold bg-default-purple'>
                            Contact Us
                        </Button>
                    </a>
                </div>
                <div className='w-full mt-3 md:mt-10'>
                    <Accordion
                        defaultValue="item-0"
                        type="single"
                        collapsible
                        className="w-full"
                    >
                        {items.map(({ title, content }, index) => (
                            <AccordionItem
                                key={index}
                                value={`item-${index}`}
                                className="data-[state=open]:bg-[linear-gradient(to_top,_#d9eeec_65%,_#FFFFFF_100%)] data-[state=open]:rounded-[30px] data-[state=open]:py-7.5 py-5 px-4 md:px-7.5"
                            >
                                <AccordionPrimitive.Header className="flex">
                                    <AccordionPrimitive.Trigger className="cursor-pointer group flex flex-1 text-[22px] font-semibold items-center justify-between transition-all hover:underline">
                                        {title}
                                        <div className="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 ease-in-out group-data-[state=open]:bg-default-purple">
                                            <Plus className="h-5 w-5 shrink-0 text-default-purple transition-transform duration-300 ease-in-out group-data-[state=open]:rotate-45 group-data-[state=open]:text-white" />
                                        </div>
                                    </AccordionPrimitive.Trigger>
                                </AccordionPrimitive.Header>
                                <AccordionContent className="pt-4 pb-0 text-lg font-normal text-default-gray">
                                    {content}
                                </AccordionContent>
                            </AccordionItem>
                        ))}


                    </Accordion>
                </div>
            </div>
            
        </section>

        {/* Build Conversational Ai agent */}
        <section id="Conversationalagent" className='flex flex-col pt-[40px] pb-[60px] px-4 md:px-[100px] container mx-auto'>
            <div className='block md:flex items-center justify-between '>
                <div className='basis-[45%]'>
                    <h3 className='text-[30px] md:text-[50px] font-bold text-primary text-left'>Build Conversational AI agents in minutes</h3>
                    <p className='text-default-gray text-lg font-normal text-left pt-1'>Design, test, and deploy customized AI voice assistants tailored to your brand's unique needs without writing a single line of code.</p>
                </div>
                <div className="flex items-center justify-center basis-[50%] bg-cover bg-center h-[400px] cursor-pointer w-full mt-3 md:mt-auto" style={{ backgroundImage: `url(${backgroundimage})` }}>
                    
                    <svg width="207" height="208" viewBox="0 0 207 208" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle opacity="0.3" cx="103.591" cy="99.8511" r="75.5269" fill="url(#paint0_linear_395_3410)"/>
                        <circle opacity="0.3" cx="103.591" cy="103.852" r="103.192" fill="url(#paint1_linear_395_3410)"/>
                        <circle cx="103.591" cy="98.8135" r="33.6924" fill="white"/>
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M103.591 150.665C131.654 150.665 154.404 127.915 154.404 99.852C154.404 71.7888 131.654 49.0391 103.591 49.0391C75.5281 49.0391 52.7783 71.7888 52.7783 99.852C52.7783 127.915 75.5281 150.665 103.591 150.665ZM96.9526 119.394L120.937 105.233C124.909 102.888 124.909 96.8165 120.937 94.471L96.9526 80.3103C93.0919 78.031 88.3474 80.9977 88.3474 85.6913V114.013C88.3474 118.706 93.0919 121.673 96.9526 119.394Z" fill="url(#paint2_linear_395_3410)"/>
                        <defs>
                        <linearGradient id="paint0_linear_395_3410" x1="103.591" y1="24.3242" x2="103.591" y2="175.378" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#46a79d"/>
                        <stop offset="1" stop-color="#d9eeec"/>
                        </linearGradient>
                        <linearGradient id="paint1_linear_395_3410" x1="103.591" y1="0.660156" x2="103.591" y2="207.044" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#46a79d"/>
                        <stop offset="1" stop-color="#d9eeec"/>
                        </linearGradient>
                        <linearGradient id="paint2_linear_395_3410" x1="103.591" y1="49.0391" x2="103.591" y2="150.665" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#46a79d"/>
                        <stop offset="1" stop-color="#d9eeec"/>
                        </linearGradient>
                        </defs>
                    </svg>
                </div>
            </div>
        </section>
    </>
    )
}

export default FAQ