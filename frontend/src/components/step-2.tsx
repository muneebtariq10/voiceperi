import { Label } from "@/components/ui/label"
import { Card, CardContent } from "./ui/card";
import AudioProgressBar from "./audioProgressBar";
import { Button } from "./ui/button";
import { Pause, Play } from "lucide-react";
import { useRef, useState } from "react";

type Step2Props = {
    voices: Voice[] | null;
    selectedVoice: string;
    // audioUrl1: string;
    // audioUrl2: string;
};
export type Voice = {
    voice_id: string;
    voice_name: string;
    language: string;
    preview_audio_url: string;
};
export const Step2 = ({ voices, selectedVoice }: Step2Props) => {
    const audioRef1 = useRef<HTMLAudioElement>(null);
    //const audioRef2 = useRef<HTMLAudioElement>(null);
    const [playing1, setPlaying1] = useState(false);
    //const [playing2, setPlaying2] = useState(false);

    // Toggle for first audio
    const togglePlay1 = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        const audio = audioRef1.current;
        if (!audio) return;

        if (playing1) {
            audio.pause();
        } else {
            audio.play();
            // Pause the other audio if playing
            if (playing1 && audioRef1.current) {
                audioRef1.current.pause();
                setPlaying1(false);
            }
        }

        setPlaying1(!playing1);
    };

    // Toggle for second audio
    // const togglePlay2 = (event: React.MouseEvent<HTMLButtonElement>) => {
    //     event.preventDefault();
    //     const audio = audioRef2.current;
    //     if (!audio) return;

    //     if (playing2) {
    //         audio.pause();
    //     } else {
    //         audio.play();
    //         // Pause the other audio if playing
    //         if (playing1 && audioRef1.current) {
    //             audioRef1.current.pause();
    //             setPlaying1(false);
    //         }
    //     }

    //     setPlaying2(!playing2);
    // };

    const currentVoice = voices?.find((voice) => voice.voice_id === selectedVoice);
    console.log('currentVoice', currentVoice)
    return (
        <>
            <div className="flex flex-col items-left text-left">
                <h1 className="text-[38px] font-bold">Audio Samples</h1>
                <p className="text-muted-foreground text-balance">
                    Listen to your agent
                </p>
            </div>
            <div className="flex flex-col gap-y-[20px] mt-3 ">
                <div className="flex items-center">
                    <Label htmlFor="text" className="mr-2 basis-[45%] font-medium text-[12px] text-[#27364B] sm:text-[16px]">Agent Introduction</Label>
                    <Card className="p-0 rounded-[21.65px]  w-[200px] sm:w-auto">
                        <CardContent className=" items-center justify-center p-2 w-full ">
                            <div className="flex items-center px-2 py-1 justify-between">
                                <AudioProgressBar audioRef={audioRef1 as React.RefObject<HTMLAudioElement>} />
                                <Button
                                    onClick={togglePlay1}
                                    className="w-10 h-10 p-0 cursor-pointer rounded-full bg-default-purple hover:bg-[#5a2be0] text-white flex items-center justify-center"
                                >
                                    {playing1 ? <Pause size={20} /> : <Play size={20} />}
                                </Button>

                                <audio
                                    ref={audioRef1}
                                    src={voices?.find(
                                        (voice) => voice.voice_id === selectedVoice
                                    )?.preview_audio_url || ""}
                                    onEnded={() => setPlaying1(false)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
                {/* <div className="flex items-center">
                    <Label htmlFor="text" className="mr-2 basis-[45%] font-medium text-[12px] text-[#27364B] sm:text-[16px]">Business Info</Label>
                    <Card className="p-0 rounded-[21.65px] w-[200px] sm:w-auto">
                        <CardContent className=" items-center justify-center p-2 w-full ">
                            <div className="flex items-center px-2 py-1 justify-between">
                                <AudioProgressBar audioRef={audioRef2 as React.RefObject<HTMLAudioElement>} />
                                <Button
                                    onClick={togglePlay2}
                                    className="w-10 h-10 p-0 cursor-pointer rounded-full bg-default-purple hover:bg-[#5a2be0] text-white flex items-center justify-center"
                                >
                                    {playing2 ? <Pause size={20} /> : <Play size={20} />}
                                </Button>

                                <audio
                                    ref={audioRef2}
                                    src={audioUrl2 || ""}
                                    onEnded={() => setPlaying2(false)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div> */}
            </div>
        </>
    )
}

