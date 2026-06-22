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
        title: "This is will be title",
        content: "Lorem ipsum dolor sit amet consectetur. Vestibulum aenean turpis nisl sit a. Lorem ipsum dolor sit amet consectetur. Vestibulum aenean turpis nisl sit a.Lorem ipsum dolor sit amet consectetur. Vestibulum aenean turpis nisl sit a.",
    },
    {
        title: "This is will be title",
        content: "Lorem ipsum dolor sit amet consectetur. Vestibulum aenean turpis nisl sit a. Lorem ipsum dolor sit amet consectetur. Vestibulum aenean turpis nisl sit a.Lorem ipsum dolor sit amet consectetur. Vestibulum aenean turpis nisl sit a.",
    },
    {
        title: "This is will be title",
        content: "Lorem ipsum dolor sit amet consectetur. Vestibulum aenean turpis nisl sit a. Lorem ipsum dolor sit amet consectetur. Vestibulum aenean turpis nisl sit a.Lorem ipsum dolor sit amet consectetur. Vestibulum aenean turpis nisl sit a.",
    },
    {
        title: "This is will be title",
        content: "Lorem ipsum dolor sit amet consectetur. Vestibulum aenean turpis nisl sit a. Lorem ipsum dolor sit amet consectetur. Vestibulum aenean turpis nisl sit a.Lorem ipsum dolor sit amet consectetur. Vestibulum aenean turpis nisl sit a.",
    },
    {
        title: "This is will be title",
        content: "Lorem ipsum dolor sit amet consectetur. Vestibulum aenean turpis nisl sit a. Lorem ipsum dolor sit amet consectetur. Vestibulum aenean turpis nisl sit a.Lorem ipsum dolor sit amet consectetur. Vestibulum aenean turpis nisl sit a.",
    },
    {
        title: "This is will be title",
        content: "Lorem ipsum dolor sit amet consectetur. Vestibulum aenean turpis nisl sit a. Lorem ipsum dolor sit amet consectetur. Vestibulum aenean turpis nisl sit a.Lorem ipsum dolor sit amet consectetur. Vestibulum aenean turpis nisl sit a.",
    },
    {
        title: "This is will be title",
        content: "Lorem ipsum dolor sit amet consectetur. Vestibulum aenean turpis nisl sit a. Lorem ipsum dolor sit amet consectetur. Vestibulum aenean turpis nisl sit a.Lorem ipsum dolor sit amet consectetur. Vestibulum aenean turpis nisl sit a.",
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
                        <p className='text-default-gray text-lg font-normal text-center'>Lörem ipsum geol nystartsjobb milingar. Krokatt stenorade. Poliitet jymäde ekotes. Sonera håtär men kavar för dock. &nbsp;
                            <span className='text-primary text-[20px] font-medium text-left'>Contact us below if you any more questions.</span>
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
                    <p className='text-default-gray text-lg font-normal text-left pt-1'>Lörem ipsum geol nystartsjobb milingar. Krokatt stenorade. Poliitet jymäde ekotes. Sonera håtär men kavar för dock Lörem ipsum geol nystartsjobb milingar. Krokatt stenorade. Poliitet jymäde ekotes. Sonera håtär men kavar för dock</p>
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