import { Button } from './ui/button'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
} from "@/components/ui/accordion";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Plus } from "lucide-react";
import backgroundimage from '../assets/bg2.png'

const items = [
    {
        title: "What is an AI Voice Assistant?",
        content: "An AI Voice Assistant is an intelligent software program that uses artificial intelligence, natural language processing, and speech recognition to converse seamlessly with humans. It can act as a customer representative, recruiter, or internal assistant.",
    },
    {
        title: "How easy is it to integrate Sonervant into my workflow?",
        content: "Very easy! Sonervant offers seamless integration APIs and webhooks that connect directly to your CRM, support systems, and internal tools in just a few clicks. No complex coding is required.",
    },
    {
        title: "Are the voices customizable?",
        content: "Yes. Sonervant offers a wide variety of ultra-realistic, human-like voices. You can select specific accents, tones, and genders to perfectly match your brand's unique identity.",
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
        <section id="faq" className='flex flex-col py-[40px] md:py-[80px] px-4 md:px-[100px] container mx-auto max-w-[1000px]'>
            <div className='flex flex-col md:flex-row items-start justify-between gap-12'>
                <div className='flex md:basis-[45%] flex-col gap-y-6 items-start'>
                    <h2 className='text-[35px] md:text-[45px] font-bold text-[var(--text-primary)] leading-tight'>Frequently Asked Questions</h2>
                    <div className='flex flex-col gap-y-4'>
                        <p className='text-[var(--text-secondary)] text-lg font-normal leading-relaxed'>
                            Have questions about integrating Sonervant into your business workflow?
                        </p>
                        <p className='text-[var(--text-primary)] text-lg font-medium'>
                            Contact us below if you have any more questions.
                        </p>
                    </div>
                    <a href="#contactus" className='mt-2'>
                        <Button className='rounded-xl px-8 py-6 text-white text-[15px] font-semibold bg-[var(--teal-600)] hover:bg-[var(--teal-700)] shadow-sm hover:shadow transition-all'>
                            Contact Us
                        </Button>
                    </a>
                </div>
                <div className='w-full md:basis-[55%] mt-6 md:mt-0'>
                    <Accordion
                        defaultValue="item-0"
                        type="single"
                        collapsible
                        className="w-full flex flex-col gap-y-4"
                    >
                        {items.map(({ title, content }, index) => (
                            <AccordionItem
                                key={index}
                                value={`item-${index}`}
                                className="bg-[var(--bg-surface)] hover:bg-[var(--bg-inset)] data-[state=open]:bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[20px] transition-all px-6 py-4 shadow-sm"
                            >
                                <AccordionPrimitive.Header className="flex">
                                    <AccordionPrimitive.Trigger className="cursor-pointer group flex flex-1 text-[18px] font-semibold text-[var(--text-primary)] items-center justify-between transition-all hover:no-underline text-left gap-4">
                                        {title}
                                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--teal-50)] transition-all duration-300 ease-in-out group-data-[state=open]:bg-[var(--teal-600)] shrink-0">
                                            <Plus className="h-5 w-5 shrink-0 text-[var(--teal-600)] transition-transform duration-300 ease-in-out group-data-[state=open]:rotate-45 group-data-[state=open]:text-white" />
                                        </div>
                                    </AccordionPrimitive.Trigger>
                                </AccordionPrimitive.Header>
                                <AccordionContent className="pt-4 pb-2 text-[16px] font-normal text-[var(--text-secondary)] leading-relaxed">
                                    {content}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </section>

        {/* Build Conversational Ai agent */}
        <section id="Conversationalagent" className='flex flex-col py-[60px] px-4 md:px-[100px] container mx-auto'>
            <div className='block md:flex items-center justify-between gap-12'>
                <div className='basis-[45%] flex flex-col gap-y-4'>
                    <h2 className='text-[35px] md:text-[45px] font-bold text-[var(--text-primary)] leading-tight'>Build Conversational AI agents in minutes</h2>
                    <p className='text-[var(--text-secondary)] text-lg font-normal leading-relaxed'>
                        Design, test, and deploy customized AI voice assistants tailored to your brand's unique needs without writing a single line of code.
                    </p>
                </div>
                <div className="flex items-center justify-center basis-[50%] bg-cover bg-center h-[400px] rounded-3xl overflow-hidden cursor-pointer w-full mt-8 md:mt-0 relative group border border-[var(--border-default)] shadow-sm" style={{ backgroundImage: `url(${backgroundimage})` }}>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300" />
                    <svg width="207" height="208" viewBox="0 0 207 208" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 transition-transform duration-300 group-hover:scale-110">
                        <circle opacity="0.3" cx="103.591" cy="99.8511" r="75.5269" fill="var(--teal-400)"/>
                        <circle opacity="0.3" cx="103.591" cy="103.852" r="103.192" fill="var(--teal-300)"/>
                        <circle cx="103.591" cy="98.8135" r="33.6924" fill="white"/>
                        <path fillRule="evenodd" clipRule="evenodd" d="M103.591 150.665C131.654 150.665 154.404 127.915 154.404 99.852C154.404 71.7888 131.654 49.0391 103.591 49.0391C75.5281 49.0391 52.7783 71.7888 52.7783 99.852C52.7783 127.915 75.5281 150.665 103.591 150.665ZM96.9526 119.394L120.937 105.233C124.909 102.888 124.909 96.8165 120.937 94.471L96.9526 80.3103C93.0919 78.031 88.3474 80.9977 88.3474 85.6913V114.013C88.3474 118.706 93.0919 121.673 96.9526 119.394Z" fill="var(--teal-600)"/>
                    </svg>
                </div>
            </div>
        </section>
    </>
    )
}

export default FAQ