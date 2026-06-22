import { Card, CardContent } from "./ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel"
import image1 from '../assets/rectangle.png'
import image2 from '../assets/rectangle1.png'
import image3 from '../assets/rectangle2.png'
import image4 from '../assets/rectangle3.png'
import audio from "../assets/audio.mp3"
import { useRef, useState } from "react"
import { Button } from "./ui/button"
import { ArrowRight, ArrowUpRight, Pause, Play } from "lucide-react"
import { Icons } from "@/components/svgIcons";
import { Link } from "react-router-dom"
import SavingsCalculator from "./SavingsCalculator"
import AudioProgressBar from "./audioProgressBar";

const voiceAssistants = [
    { role: "Financing Assistant", image: image1, audio: audio },
    { role: "Recruitment Assistant", image: image2, audio: audio },
    { role: "CSR Impact Assistant", image: image3, audio: audio },
    { role: "Customer Relations ", image: image4, audio: audio },
    { role: "Financing Assistant", image: image1, audio: audio },
    { role: "Recruitment Assistant", image: image2, audio: audio },
];

const nationVoiceSamples = [
    { role: "Czech", Flag: Icons.Czech, audio: audio },
    { role: "Danish", Flag: Icons.Danish, audio: audio },
    { role: "Dutch", Flag: Icons.Dutch, audio: audio },
    { role: "English", Flag: Icons.English, audio: audio },
    { role: "French", Flag: Icons.French, audio: audio },
    { role: "German", Flag: Icons.German, audio: audio },
    { role: "Greek", Flag: Icons.Greek, audio: audio },
    { role: "Hindi", Flag: Icons.Hindi, audio: audio },
    { role: "Indonesian", Flag: Icons.Indonesian, audio: audio },
    { role: "Italian", Flag: Icons.Italian, audio: audio },
    { role: "Japanese", Flag: Icons.Japanese, audio: audio },
    { role: "Korean", Flag: Icons.Korean, audio: audio },
    { role: "Norwegian", Flag: Icons.Norwegian, audio: audio },
    { role: "Polish", Flag: Icons.Polish, audio: audio },
    { role: "Portuguese", Flag: Icons.Portuguese, audio: audio },
    { role: "Russian", Flag: Icons.Russian, audio: audio },
    { role: "Spanish", Flag: Icons.Spanish, audio: audio },
    { role: "Swedish", Flag: Icons.Swedish, audio: audio },
    { role: "Turkish", Flag: Icons.Turkish, audio: audio },
    { role: "Ukrainian", Flag: Icons.Ukrainian, audio: audio },
];

const IndustriesServed = [
    { role: "Customer Service", Industries: Icons.CustomerService },
    { role: "Home Services", Industries: Icons.HomeServices },
    { role: "Financial Services", Industries: Icons.FinancialServices },
    { role: "Insurance Sales", Industries: Icons.InsuranceSales },
    { role: "Solar Sales", Industries: Icons.SolarSales },
    { role: "Utility Brokers", Industries: Icons.UtilityBrokers },
    { role: "Cab Pre-Booking", Industries: Icons.CabPreBooking },
    { role: "Logistics", Industries: Icons.Logistics },
    { role: "Hotel Reservations", Industries: Icons.HotelReservations },
    { role: "Retail", Industries: Icons.Retail },
    { role: "Healthcare", Industries: Icons.Healthcare },
    { role: "Orders and Reservations", Industries: Icons.RestaurantOrdersReservations },
];

const row1Samples = nationVoiceSamples.slice(0, 7);
const row2Samples = nationVoiceSamples.slice(7, 14);
const row3Samples = nationVoiceSamples.slice(14, 20);



const UseCase = () => {
    const audioRefs = useRef<HTMLAudioElement[]>([]);
    const [playingIndex, setPlayingIndex] = useState<number | null>(null);

    const togglePlay = (index: number) => {
        const currentAudio = audioRefs.current[index];

        if (!currentAudio) return;

        if (playingIndex !== null && playingIndex !== index) {
            const prevAudio = audioRefs.current[playingIndex];
            prevAudio?.pause();
            prevAudio.currentTime = 0;
        }

        if (playingIndex === index) {
            currentAudio.pause();
            setPlayingIndex(null);
        } else {
            currentAudio.play();
            setPlayingIndex(index);
        }
    };

    return (
        <>
            <section id="usecase" className="container mx-auto">
                <div className='flex flex-col items-center justify-start gap-y-10 px-2 md:px-[40px]'>
                    <div className='flex flex-col items-center justify-start gap-y-3 '>
                        <h3 className='text-[30px] md:text-[50px] font-bold text-primary text-center'>Use Cases</h3>
                        <div>
                            <p className='text-[20px] font-normal text-default-gray text-center'>Lorem ipsum dolor sit amet consectetur. Nibh semper diam sed sit </p>
                            <p className='text-[20px] font-normal text-default-gray text-center'>posuere quam consectetur. Sed senectus enim est ut lacinia. Eu.</p>
                        </div>
                    </div>
                    
                    <div className="w-full flex flex-col md:flex-row bg-gradient-to-t from-[#d9eeec] via-[#d9eeec] to-white p-5 md:px-[65px] md:py-[51px] md:gap-9 rounded-[50px]">
                        {/* Left Heading */}
                        <div className="md:w-1/3 flex flex-col self-center items-start gap-5">
                            <h3 className="text-[28px] md:text-[40px] font-bold text-primary">
                            Voice samples from different Nations
                            </h3>

                            <button className="px-6 py-3 self-center bg-[#46a79d] text-white font-semibold rounded-full shadow-md hover:bg-[#3b8f87] transition flex items-center gap-2 group cursor-pointer">
                                Let’s Discuss
                                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                            </button>
                        </div>

                        {/* Right Box with 3 rows */}
                        <div className="md:w-2/3 bg-white rounded-[30px] py-10 flex flex-col gap-10 shadow-md overflow-hidden">

                            {/* Row 1 - left */}
                            <div className="relative w-full overflow-hidden">
                            <div className="flex gap-4 animate-marquee-left hover:[animation-play-state:paused]">
                                {[...row1Samples, ...row1Samples].map((sample, index) => {
                                const refIndex = index; // offset for row 1
                                return (
                                    <Card key={`row1-${index}`} className="p-0 rounded-[21.65px] min-w-[220px] shrink-0">
                                    <CardContent className="items-center justify-center p-2 w-full">
                                        <div className="flex items-center px-2 py-1 justify-between">
                                        <div>
                                            <sample.Flag />
                                            <p className="font-bold text-[12px]">{sample.role}</p>
                                        </div>
                                        <AudioProgressBar
                                            audioRef={{ current: audioRefs.current[refIndex] }}
                                            className="ml-[-10px]"
                                        />
                                        <Button
                                            onClick={() => togglePlay(refIndex)}
                                            className="w-10 h-10 p-0 rounded-full bg-[#46a79d] hover:bg-[#46a79d] text-white flex items-center justify-center"
                                        >
                                            {playingIndex === refIndex ? <Pause size={20} /> : <Play size={20} />}
                                        </Button>
                                        <audio
                                            ref={(el) => { audioRefs.current[refIndex] = el!; }}
                                            src={sample.audio}
                                            onEnded={() => setPlayingIndex(null)}
                                        />
                                        </div>
                                    </CardContent>
                                    </Card>
                                );
                                })}
                            </div>
                            </div>

                            {/* Row 2 - right */}
                            <div className="relative w-full overflow-hidden">
                            <div className="flex gap-4 animate-marquee-right hover:[animation-play-state:paused]">
                                {[...row2Samples, ...row2Samples].map((sample, index) => {
                                const refIndex = 7 + index; // offset after first 7
                                return (
                                    <Card key={`row2-${index}`} className="p-0 rounded-[21.65px] min-w-[220px] shrink-0">
                                    <CardContent className="items-center justify-center p-2 w-full">
                                        <div className="flex items-center px-2 py-1 justify-between">
                                        <div>
                                            <sample.Flag />
                                            <p className="font-bold text-[12px]">{sample.role}</p>
                                        </div>
                                        <AudioProgressBar
                                            audioRef={{ current: audioRefs.current[refIndex] }}
                                            className="ml-[-10px]"
                                        />
                                        <Button
                                            onClick={() => togglePlay(refIndex)}
                                            className="w-10 h-10 p-0 rounded-full bg-[#46a79d] hover:bg-[#46a79d] text-white flex items-center justify-center"
                                        >
                                            {playingIndex === refIndex ? <Pause size={20} /> : <Play size={20} />}
                                        </Button>
                                        <audio
                                            ref={(el) => { audioRefs.current[refIndex] = el!; }}
                                            src={sample.audio}
                                            onEnded={() => setPlayingIndex(null)}
                                        />
                                        </div>
                                    </CardContent>
                                    </Card>
                                );
                                })}
                            </div>
                            </div>

                            {/* Row 3 - left */}
                            <div className="relative w-full overflow-hidden">
                            <div className="flex gap-4 animate-marquee-left hover:[animation-play-state:paused]">
                                {[...row3Samples, ...row3Samples].map((sample, index) => {
                                const refIndex = 14 + index; // offset after 14
                                return (
                                    <Card key={`row3-${index}`} className="p-0 rounded-[21.65px] min-w-[220px] shrink-0">
                                    <CardContent className="items-center justify-center p-2 w-full">
                                        <div className="flex items-center px-2 py-1 justify-between">
                                        <div>
                                            <sample.Flag />
                                            <p className="font-bold text-[12px]">{sample.role}</p>
                                        </div>
                                        <AudioProgressBar
                                            audioRef={{ current: audioRefs.current[refIndex] }}
                                            className="ml-[-10px]"
                                        />
                                        <Button
                                            onClick={() => togglePlay(refIndex)}
                                            className="w-10 h-10 p-0 rounded-full bg-[#46a79d] hover:bg-[#46a79d] text-white flex items-center justify-center"
                                        >
                                            {playingIndex === refIndex ? <Pause size={20} /> : <Play size={20} />}
                                        </Button>
                                        <audio
                                            ref={(el) => { audioRefs.current[refIndex] = el!; }}
                                            src={sample.audio}
                                            onEnded={() => setPlayingIndex(null)}
                                        />
                                        </div>
                                    </CardContent>
                                    </Card>
                                );
                                })}
                            </div>
                            </div>

                        </div>
                    </div>
                    
                    <div className="w-full flex flex-col bg-gradient-to-t from-[#d9eeec] via-[#d9eeec] to-white md:px-[65px] pb-[80px] pt-[60px] gap-y-9 rounded-[50px]">
                        <h3 className='text-[28px] md:text-[40px] font-bold text-primary text-center'>Assistants in action</h3>

                        <Carousel opts={{ align: "start" }} className="w-full relative">
                            <CarouselContent>
                                {voiceAssistants.map((sample, index) => (
                                    <CarouselItem key={index} className="lg:basis-1/4">
                                        <div>
                                            <Card className="p-0 rounded-[21.65px]">
                                                <CardContent className="flex flex-col gap-4 items-center justify-center p-2 ">
                                                    <img
                                                        src={sample.image}
                                                        alt={`${sample.role}`}
                                                        className="object-cover w-full rounded-[21.65px]"
                                                    />
                                                    <p className="text-[22px] font-bold text-center">{sample.role}</p>
                                                    <div className="flex items-center gap-3 px-6 py-3.5 bg-white rounded-[20px] shadow-sm w-[240px]">
                                                        <AudioProgressBar audioRef={{ current: audioRefs.current[index] }} />
                                                        <Button
                                                            onClick={() => togglePlay(index)}
                                                            className="w-10 h-10 p-0 rounded-full bg-[#46a79d] hover:bg-[#46a79d] text-white flex items-center justify-center"
                                                        >
                                                            {playingIndex === index ? <Pause size={20} /> : <Play size={20} />}
                                                        </Button>

                                                        <audio
                                                            ref={(el) => { audioRefs.current[index] = el!; }}
                                                            src={sample.audio}
                                                            onEnded={() => setPlayingIndex(null)}
                                                        />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <div className="absolute right-[50%] -bottom-8 flex">
                                <CarouselPrevious className="bg-[#081046] text-white hover:bg-[#0a125b] hover:text-white transition rounded-full" />
                                <CarouselNext className="bg-[#081046] text-white hover:bg-[#0a125b] hover:text-white transition rounded-full" />
                            </div>
                        </Carousel>
                    </div>
                </div>
            </section>

            



            

            {/* <section id="Industries" className="container mx-auto mt-5">
                <div className='flex flex-col items-center justify-start gap-y-10 px-2 md:px-[40px]'>
                    <div className='flex flex-col items-center justify-start gap-y-3 px-2 md:px-0'>
                        <h3 className='text-[30px] md:text-[50px] font-bold text-primary text-center'>Industries served</h3>
                        <div>
                            <p className='text-[20px] font-normal text-default-gray text-center'>VoicePeri’s AI Voice Agents are transforming operations across a </p>
                            <p className='text-[20px] font-normal text-default-gray text-center'>variety of industries, including but not limited to: </p>
                        </div>
                    </div>
                    <div className="w-full flex flex-col p-2 md:px-[65px] md:py-[51px] md:gap-y-9 rounded-[50px]">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-3 md:mt-auto">
                            {IndustriesServed.map((sample) => (
                                <Card className="p-0 rounded-[21.65px] w-auto cursor-pointer h-[246px] justify-center shadow-[0px_4px_10px_0px_rgba(0,0,0,0.1)]">
                                    <CardContent className=" items-center justify-center px-10 w-full ">
                                        <div className="grid place-items-center">
                                            <sample.Industries className="min-h-[128px]" />
                                            <p className="font-bold text-[25px] ">{sample.role}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </section> */}

            <section id="Industries" className="container mx-auto mt-5">
                <div className='flex flex-col items-center justify-start gap-y-10 px-2 md:px-[40px]'>
                    <div className='flex flex-col items-center justify-start gap-y-3 px-2 md:px-0'>
                        <h3 className='text-[30px] md:text-[50px] font-bold text-primary text-center'>Industries served</h3>
                        <div>
                            <p className='text-[20px] font-normal text-default-gray text-center'>VoicePeri’s AI Voice Agents are transforming operations across a </p>
                            <p className='text-[20px] font-normal text-default-gray text-center'>variety of industries, including but not limited to: </p>
                        </div>
                    </div>
                    <div className="w-full flex flex-col p-2 md:px-[65px] md:py-[51px] md:gap-y-9 rounded-[50px]">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 xl:grid-cols-6 gap-5 mt-3 md:mt-auto">
                            {IndustriesServed.map((sample) => (
                                <Card className="p-0 rounded-[21.65px] w-auto cursor-pointer h-[200px] justify-center hover:bg-[#72e6da] shadow-[0px_4px_10px_0px_rgba(0,0,0,0.1)] group">
                                    <CardContent className="items-center justify-center px-6 w-full">
                                        <div className="grid place-items-center">
                                        <sample.Industries className="w-[58px] h-[58px] text-[#72e6da] transition-colors duration-300 group-hover:text-white" />
                                        <p className="font-bold text-[18px] group-hover:text-white">
                                            {sample.role}
                                        </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section id="keyStatistics" className="container mx-auto bg-gradient-to-t from-[#d9eeec] via-[#d9eeec] to-white py-5">
                <div className='flex flex-col items-center justify-start gap-y-10 px-2 md:px-[40px]'>
                    <div className='flex flex-col items-center justify-start gap-y-3 '>
                        <h3 className='text-[30px] md:text-[50px] font-bold text-primary text-center'>Key Statistics</h3>
                        <div>
                            <p className='text-[20px] font-normal text-default-gray text-center'>Lorem ipsum dolor sit amet consectetur. Nibh semper diam sed sit </p>
                            <p className='text-[20px] font-normal text-default-gray text-center'>posuere quam consectetur. Sed senectus enim est ut lacinia. Eu. </p>
                        </div>
                    </div>
                    <div className="w-full flex flex-col p-2 md:px-[65px] md:py-[51px] md:gap-y-9 rounded-[50px]">
                        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 mt-3 md:mt-auto">
                            <Card className="p-0 rounded-[21.65px] w-auto cursor-pointer h-auto justify-center ">
                                <CardContent className=" items-center justify-center px-4 md:px-12 py-10 w-full ">
                                    <div className="grid place-items-center gap-3">
                                        <div className="flex gap-4 items-center">
                                            <span className="text-[50px] text-[#46a79d] font-semibold leading-[100%]">30%</span>
                                            <span className="text-[20px] font-bold text-left">Customer Support Efficiency</span>
                                        </div>
                                        <Icons.SupportEfficiency className="" />
                                        <div className="text-[18px] text-[#474747] leading-[32px]">
                                            <p>AI agents reduce customer service costs and streamline the buying process by up to 30%.<br /> (Source: CommPlatform)</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="p-0 rounded-[21.65px] w-auto cursor-pointer h-auto justify-center">
                                <CardContent className=" items-center justify-center px-0 py-10 w-full ">
                                    <div className="grid place-items-center gap-4">
                                        <div className="flex px-4 md:px-10 gap-4 place-items-center">
                                            <span className="text-[50px] text-[#46a79d] font-semibold leading-[100%]">60%</span>
                                            <span className="text-[20px] font-bold text-left">Staff Shortages</span>
                                        </div>
                                        <div className="h-40 w-full content-center">
                                            <Icons.StaffShortages className="w-full" />
                                        </div>
                                        <div className="text-[18px] text-[#474747] leading-[32px] px-4 md:px-10">
                                            <p>AI efficiently addresses workforce gaps, with 60% of businesses facing staff shortages.<br />(Source: AIPRM)</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="p-0 rounded-[21.65px] w-auto cursor-pointer h-auto justify-center">
                                <CardContent className=" items-center justify-center px-4 md:px-12 py-10 w-full ">
                                    <div className="grid place-items-center gap-9 ">
                                        <div className="flex gap-4 items-center">
                                            <span className="text-[50px] text-[#46a79d] font-semibold leading-[100%]">50%</span>
                                            <span className="text-[20px] font-bold text-left">Staff Burnout Reduction</span>
                                        </div>
                                        <Icons.StaffBurnoutReduction className="" />
                                        <div className="text-[18px] text-[#474747] leading-[32px]">
                                            <p>Agent burnout decreases by 50% as AI takes over repetitive tasks. <br />(Source: AIPRM)</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="p-0 rounded-[21.65px] w-auto cursor-pointer h-auto justify-center">
                                <CardContent className=" items-center justify-center px-4 md:px-12 py-10 w-full ">
                                    <div className="grid place-items-center gap-3">
                                        <div className="flex gap-4 items-center">
                                            <span className="text-[50px] text-[#46a79d] font-semibold leading-[100%]">30%+</span>
                                            <span className="text-[20px] font-bold text-left">Customer Satisfaction</span>
                                        </div>
                                        <Icons.CustomerSatisfaction className="" />
                                        <div className="text-[18px] text-[#474747] leading-[32px]">
                                            <p>AI voice agents boost customer satisfaction by over 30% through 24/7 service and reduced wait times.
                                                <br />(Source: Intelekt AI)</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="p-0 rounded-[21.65px] w-auto cursor-pointer h-auto justify-center">
                                <CardContent className=" items-center justify-center px-4 md:px-12 py-10 w-full ">
                                    <div className="grid place-items-center gap-5">
                                        <div className="flex gap-4 items-center">
                                            <span className="text-[50px] text-[#46a79d] font-semibold leading-[100%]">70%</span>
                                            <span className="text-[20px] font-bold text-left">Empathy and Personalization</span>
                                        </div>
                                        <Icons.EmpathyandPersonalization className="" />
                                        <div className="text-[18px] text-[#474747] leading-[32px]">
                                            <p> 70% of customer experience leaders believe AI chatbots excel at personalized journeys, with many customers acknowledging their empathetic responses. <br />(Source: Zendesk)</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="p-0 rounded-[21.65px] w-auto cursor-pointer h-auto justify-center">
                                <CardContent className=" items-center justify-center px-4 md:px-12 py-10 w-full ">
                                    <div className="grid place-items-center gap-6">
                                        <div className="flex gap-4 items-center">
                                            <span className="text-[50px] text-[#46a79d] font-semibold leading-[100%]">78%</span>
                                            <span className="text-[20px] font-bold text-left">Customer Acceptance of AI</span>
                                        </div>
                                        <Icons.CustomerAcceptanceOfAI className="" />
                                        <div className="text-[18px] text-[#474747] leading-[32px]">
                                            <p>Agent burnout decreases by 50% as AI takes over repetitive tasks. <br /> (Source: AIPRM)</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="mt-8">
                            <Link to='/signup'>
                                <Button className='rounded-[20px] w-[200px] h-[50px] px-5.5 py-4 text-secondary text-lg font-bold bg-default-purple'>
                                    Start Free Trial <ArrowUpRight className='w-10 h-10' />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
            <section id="savingsCalculator" className="container mx-auto mt-10">
                <div className='flex flex-col items-center justify-start gap-y-10 px-2 md:px-[40px]'>
                    <div className='flex flex-col items-center justify-start gap-y-3 '>
                        <h3 className='text-[30px] md:text-[50px] font-bold text-primary text-center'>Savings Calculator</h3>
                        <div>
                            <p className='text-[20px] font-normal text-default-gray text-center'>Lorem ipsum dolor sit amet consectetur. Nibh semper diam sed sit </p>
                            <p className='text-[20px] font-normal text-default-gray text-center'>posuere quam consectetur. Sed senectus enim est ut lacinia. Eu. </p>
                        </div>
                    </div>
                </div>
                <SavingsCalculator />
            </section>
        </>

    )
}

export default UseCase


