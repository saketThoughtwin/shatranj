import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  startGameContainer,
  overlayStyle,
  videoStyle,
  headingStyle,
  iconButtonStyle,
} from "./StartGame.styles";

const StartGame = () => {
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleStartGame = async () => {
    try {
      await audioRef.current?.play();
      setTimeout(() => navigate("/game"), 300);
    } catch (err) {
      console.warn("Audio play failed:", err);
      navigate("/game");
    }
  };

  return (
    <div className={startGameContainer}>
      {/* Background video */}
      <video autoPlay loop muted className={videoStyle}>
        <source
          src="https://res.cloudinary.com/ddfp1evfo/video/upload/v1750422147/mainchessvideo_hmqlzd.mp4"
          type="video/mp4"
        />
      </video>

      <div className={overlayStyle}>
        <audio
          ref={audioRef}
          src="https://res.cloudinary.com/ddfp1evfo/video/upload/v1750240572/knight-hood-240830_x1dqtn.mp3"
          loop
        />
      <div className="flex flex-col items-center justify-center gap-6">
          <h1 className={headingStyle}>
            ♛ Welcome to <span className="text-yellow-400">Shatranj</span>
          </h1>

          <Button onClick={handleStartGame} className={iconButtonStyle} size="icon">
            <Play className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StartGame;
