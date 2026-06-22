import { useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import { useEffect } from "react";
interface AudioPlayerProps {
  src: string;
}

export default function AudioPlayer1({ src }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  const handleAudioEnded = () => {
    setIsPlaying(false);
  };
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  }, [src]);
  return (
    <div>
      <button
        type="button"
        onClick={handlePlayPause}
        className="p-3 flex items-center cursor-pointer justify-center bg-[#5222FF] text-white rounded-full "
      >
        {isPlaying ? (
          <Pause size={20} className="fill-white" />
        ) : (
          <Play size={20} className="fill-white" />
        )}
      </button>
      <audio ref={audioRef} src={src} onEnded={handleAudioEnded} />
    </div>
  );
}
