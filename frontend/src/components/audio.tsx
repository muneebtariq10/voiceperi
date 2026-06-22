import { useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

interface AudioPlayerProps {
  src: string;
}

export default function AudioPlayer({ src }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

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

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const percentage = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(percentage || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const seekTime = (parseFloat(e.target.value) / 100) * audioRef.current.duration;
      audioRef.current.currentTime = seekTime;
      setProgress(parseFloat(e.target.value));
    }
  };

  return (
    <div className="flex items-center gap-3 p-3  bg-gray-100 w-full border-[#CBD4E1] border-[1px] rounded-[10px] h-[66px]">
      {/* Play Button */}
      <button
        type="button"
        onClick={handlePlayPause}
        className="p-3 flex items-center justify-center bg-[#5222FF] text-white rounded-full "
      >
        {isPlaying ? <Pause size={20} className="fill-white" /> : <Play size={20} className="fill-white" />}
      </button>

      {/* Progress Bar */}
      <input
        type="range"
        min="0"
        max="100"
        value={progress}
        onChange={handleSeek}
        className="w-full h-2 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer 
  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 
  [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full 
  [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#5222FF] 
  [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:bg-white 
  [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white"
      />

      {/* Hidden Audio Element */}
      <audio ref={audioRef} src={src} onTimeUpdate={handleTimeUpdate} />
    </div>
  );
}
