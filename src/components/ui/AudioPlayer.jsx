import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';

function formatSeconds(totalSeconds) {
  const s = Math.max(0, Math.floor(Number(totalSeconds || 0)));
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export default function AudioPlayer({ src }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);

  useEffect(() => {
    // Reset when source changes
    setIsPlaying(false);
    setAudioDuration(0);
    setAudioCurrentTime(0);
  }, [src]);

  const toggleAudio = async () => {
    const el = audioRef.current;
    if (!el) return;
    try {
      if (isPlaying) {
        el.pause();
        setIsPlaying(false);
      } else {
        await el.play();
        setIsPlaying(true);
      }
    } catch (e) {
      console.error('Audio play error:', e);
    }
  };

  if (!src) return null;

  return (
    <>
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadedMetadata={() => setAudioDuration(audioRef.current?.duration || 0)}
        onTimeUpdate={() => setAudioCurrentTime(audioRef.current?.currentTime || 0)}
        onEnded={() => {
          setIsPlaying(false);
          setAudioCurrentTime(0);
        }}
      />

      <div className="flex items-center gap-3 px-3 py-2 bg-[#F5F5F7] rounded-full w-full max-w-xs">
        <button
          type="button"
          onClick={toggleAudio}
          className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center hover:bg-[#9F290A] transition-colors cursor-pointer"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>

        <div className="flex-1 flex items-center gap-2">
          <div className="relative w-full h-1.5 bg-[#E5E5EA] rounded-full">
            <div
              className="h-full bg-accent rounded-full"
              style={{
                width: audioDuration > 0 ? `${(audioCurrentTime / audioDuration) * 100}%` : '0%',
              }}
            />
          </div>

          <span className="text-[11px] text-primary">
            {formatSeconds(audioDuration - audioCurrentTime)}
          </span>
        </div>
      </div>
    </>
  );
}


