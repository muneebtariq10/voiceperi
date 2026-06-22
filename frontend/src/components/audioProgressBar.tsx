import { useEffect, useState } from "react";

interface Bar {
  x: number;
  y: number;
  width: number;
  height: number;
  rx: number;
  transform?: string;
}

interface AudioProgressBarProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  className?: string;
}

const bars: Bar[] = [
  { x: 0.0947, y: 13.4214, width: 1.86365, height: 5.06066, rx: 0.931824, transform: "rotate(0.276665 0.0947266 13.4214)" },
  { x: 4.53564, y: 10.5508, width: 1.86365, height: 10.8443, rx: 0.931824, transform: "rotate(0.276665 4.53564 10.5508)" },
  { x: 8.97656, y: 7.68018, width: 1.86365, height: 16.6279, rx: 0.931824, transform: "rotate(0.276665 8.97656 7.68018)" },
  { x: 13.3994, y: 8.60547, width: 1.86365, height: 14.8205, rx: 0.931824, transform: "rotate(0.276665 13.3994 8.60547)" },
  { x: 17.8403, y: 5.73486, width: 1.86365, height: 20.6041, rx: 0.931824, transform: "rotate(0.276665 17.8403 5.73486)" },
  { x: 22.2905, y: 0.876465, width: 1.86365, height: 30.364, rx: 0.931824, transform: "rotate(0.276665 22.2905 0.876465)" },
  { x: 26.6934, y: 5.9585, width: 1.86365, height: 20.2426, rx: 0.931824, transform: "rotate(0.276665 26.6934 5.9585)" },
  { x: 31.0947, y: 11.2212, width: 1.86365, height: 9.75985, rx: 0.931824, transform: "rotate(0.276665 31.0947 11.2212)" },
  { x: 35.5264, y: 10.3389, width: 1.86365, height: 11.5672, rx: 0.931824, transform: "rotate(0.276665 35.5264 10.3389)" },
  { x: 39.9609, y: 8.73389, width: 1.86365, height: 14.8205, rx: 0.931824, transform: "rotate(0.276665 39.9609 8.73389)" },
  { x: 44.3716, y: 12.189, width: 1.86365, height: 7.95247, rx: 0.931824, transform: "rotate(0.276665 44.3716 12.189)" },
  { x: 48.8408, y: 3.41846, width: 1.16512, height: 25.5367, rx: 0.58256, transform: "rotate(0.276665 48.8408 3.41846)" },
  { x: 52.5776, y: 1.74561, width: 1.86365, height: 28.9181, rx: 0.931824, transform: "rotate(0.276665 52.5776 1.74561)" },
  { x: 56.9951, y: 3.75488, width: 1.86365, height: 24.9418, rx: 0.931824, transform: "rotate(0.276665 56.9951 3.75488)" },
  { x: 61.4365, y: 0.704102, width: 1.86365, height: 31.0869, rx: 0.931824, transform: "rotate(0.276665 61.4365 0.704102)" },
  { x: 65.854, y: 2.71387, width: 1.86365, height: 27.1107, rx: 0.931824, transform: "rotate(0.276665 65.854 2.71387)" },
  { x: 70.2905, y: 0.74707, width: 1.86365, height: 31.0869, rx: 0.931824, transform: "rotate(0.276665 70.2905 0.74707)" },
  { x: 74.7017, y: 4.02148, width: 1.86365, height: 24.5804, rx: 0.931824, transform: "rotate(0.276665 74.7017 4.02148)" },
  { x: 79.1035, y: 9.28418, width: 1.86365, height: 14.0976, rx: 0.931824, transform: "rotate(0.276665 79.1035 9.28418)" },
  { x: 83.5566, y: 3.8833, width: 1.86365, height: 24.9418, rx: 0.931824, transform: "rotate(0.276665 83.5566 3.8833)" },
  { x: 87.9624, y: 8.24268, width: 1.86365, height: 16.2664, rx: 0.931824, transform: "rotate(0.276665 87.9624 8.24268)" },
  { x: 92.3784, y: 10.6133, width: 1.86365, height: 11.5672, rx: 0.931824, transform: "rotate(0.276665 92.3784 10.6133)" },
  { x: 96.7886, y: 14.0688, width: 1.86365, height: 4.69919, rx: 0.931824, transform: "rotate(0.276665 96.7886 14.0688)" },
  { x: 101.229, y: 11.3794, width: 1.86365, height: 10.1213, rx: 0.931824, transform: "rotate(0.276665 101.229 11.3794)" },
  { x: 105.701, y: 2.00244, width: 1.86365, height: 28.9181, rx: 0.931824, transform: "rotate(0.276665 105.701 2.00244)" },
  { x: 110.094, y: 9.07227, width: 1.86365, height: 14.8205, rx: 0.931824, transform: "rotate(0.276665 110.094 9.07227)" },
  { x: 114.542, y: 4.5752, width: 1.86365, height: 23.8574, rx: 0.931824, transform: "rotate(0.276665 114.542 4.5752)" },
  { x: 118.97, y: 4.59668, width: 1.86365, height: 23.8574, rx: 0.931824, transform: "rotate(0.276665 118.97 4.59668)" },
  { x: 123.413, y: 1.18408, width: 1.86365, height: 30.7254, rx: 0.931824, transform: "rotate(0.276665 123.413 1.18408)" },
  { x: 127.786, y: 12.4111, width: 1.86365, height: 8.31394, rx: 0.931824, transform: "rotate(0.276665 127.786 12.4111)" },
  { x: 132.241, y: 6.64893, width: 1.86365, height: 19.8812, rx: 0.931824, transform: "rotate(0.276665 132.241 6.64893)" },
  { x: 136.663, y: 7.75488, width: 1.86365, height: 17.7123, rx: 0.931824, transform: "rotate(0.276665 136.663 7.75488)" },
  { x: 141.067, y: 12.4751, width: 1.86365, height: 8.31394, rx: 0.931824, transform: "rotate(0.276665 141.067 12.4751)" },
  { x: 145.507, y: 9.78564, width: 1.86365, height: 13.7361, rx: 0.931824, transform: "rotate(0.276665 145.507 9.78564)" },
  { x: 149.913, y: 14.1445, width: 1.86365, height: 5.06066, rx: 0.931824, transform: "rotate(0.276665 149.913 14.1445)" }
];

const AudioProgressBar = ({ audioRef }: AudioProgressBarProps) => {
  const [progress, setProgress] = useState(0); // 0 to 100

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      const percent = (audio.currentTime / audio.duration) * 100;
      setProgress(percent);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [audioRef]);

  const filledBars = Math.floor((progress / 100) * bars.length);

  return (
    <svg width="152" height="33" viewBox="0 0 152 33" fill="none" xmlns="http://www.w3.org/2000/svg">
      {bars.map((bar, i) => (
        <rect
          key={i}
          x={bar.x}
          y={bar.y}
          width={bar.width}
          height={bar.height}
          rx={bar.rx}
          transform={bar.transform}
          fill={i < filledBars ? "#6c3ef7" : "#DED9D4"}
        />
      ))}
    </svg>
  );
};

export default AudioProgressBar;
