import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  startGameContainer,
  headingStyle,
  startButtonStyle,
} from "./StartGame.styles";

const StartGame = () => {
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleStartGame = async () => {
    try {
      await audioRef.current?.play();
      // Wait 300ms to ensure audio starts before navigation
      setTimeout(() => {
        navigate("/game");
      }, 300);
    } catch (err) {
      console.warn("Audio play failed:", err);
      navigate("/game"); // fallback
    }
  };

  return (
    <div className={startGameContainer}>
      <audio
        ref={audioRef}
        src="https://res.cloudinary.com/ddfp1evfo/video/upload/v1750240572/knight-hood-240830_x1dqtn.mp3"
        loop
      />

      <div className="text-center space-y-6">
        <h1 className={headingStyle}>
          <Crown className="w-8 h-8 text-gray-300" />
          Welcome to <span className="text-yellow-300">Shatranj</span>
        </h1>
        <Button onClick={handleStartGame} className={startButtonStyle}>
          Start Game
        </Button>
      </div>
    </div>
  );
};

export default StartGame;
