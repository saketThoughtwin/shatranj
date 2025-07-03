import { useEffect, useRef, useState } from "react";
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import LoadingScreen from "@/pages/loadingscreen/LoadingScreen";

const StartGame = () => {
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [showHindiText, setShowHindiText] = useState(false);
  const [loading, setLoading] = useState(false);
  const [level, setLevel] = useState<"easy" | "medium" | "hard">("medium");
  const [playerColor, setPlayerColor] = useState<"white" | "black">("white");

  useEffect(() => {
    const interval = setInterval(() => {
      setShowHindiText((prev) => !prev);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleStartGame = async () => {
    try {
      localStorage.setItem("botLevel", level); // Save difficulty
      localStorage.setItem("playerColor", playerColor); // Save player color
      await audioRef.current?.play();
      setLoading(true);
    } catch (err) {
      console.warn("Audio play failed:", err);
      setLoading(true);
    }
  };

  if (loading) return <LoadingScreen onComplete={() => navigate("/game")} />;

  return (
    <div className={startGameContainer}>
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
        <div className="flex flex-col items-center justify-center gap-4 sm:gap-5 md:gap-7 px-4 text-center">
          <h1 className={`${headingStyle} transition duration-500 ease-in-out`}>
            ♛{" "}
            {showHindiText ? (
              <>
                <span className="text-yellow-400">शतरंज</span> में आपका स्वागत है
              </>
            ) : (
              <>
                Welcome to <span className="text-yellow-400">Shatranj</span>
              </>
            )}
          </h1>

          {/* Difficulty Selector */}
          <div className="w-[10rem] sm:w-[12rem] md:w-[14rem] text-white z-50 font-bold">
            <Select
              defaultValue={level}
              onValueChange={(value) =>
                setLevel(value as "easy" | "medium" | "hard")
              }
            >
              <SelectTrigger className="w-full h-10 bg-black border border-yellow-400 text-yellow-400 hover:bg-yellow-500 hover:text-black text-center text-sm">
                <SelectValue
                  placeholder={showHindiText ? "कठिनाई चुनें" : "Select Difficulty"}
                />
              </SelectTrigger>
              <SelectContent className="bg-black border border-yellow-400 text-white">
                <SelectItem value="easy" className="hover:bg-yellow-500 hover:text-black">
                  {showHindiText ? "आसान" : "Easy"}
                </SelectItem>
                <SelectItem value="medium" className="hover:bg-yellow-500 hover:text-black">
                  {showHindiText ? "मध्यम" : "Medium"}
                </SelectItem>
                <SelectItem value="hard" className="hover:bg-yellow-500 hover:text-black">
                  {showHindiText ? "कठिन" : "Hard"}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Color Selector */}
          <div className="w-[10rem] sm:w-[12rem] md:w-[14rem] text-white z-50 font-bold">
            <Select
              defaultValue={playerColor}
              onValueChange={(value) =>
                setPlayerColor(value as "white" | "black")
              }
            >
              <SelectTrigger className="w-full h-10 bg-black border border-yellow-400 text-yellow-400 hover:bg-yellow-500 hover:text-black text-center text-sm">
                <SelectValue
                  placeholder={showHindiText ? "रंग चुनें" : "Select Color"}
                />
              </SelectTrigger>
              <SelectContent className="bg-black border border-yellow-400 text-white">
                <SelectItem value="white" className="hover:bg-yellow-500 hover:text-black">
                  {showHindiText ? "सफेद (आप)" : "White (You)"}
                </SelectItem>
                <SelectItem value="black" className="hover:bg-yellow-500 hover:text-black">
                  {showHindiText ? "काला (आप)" : "Black (You)"}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Start Button */}
          <Button
            onClick={handleStartGame}
            className={iconButtonStyle}
            size="icon"
            aria-label="Start Game"
          >
            <Play className="w-5 h-5 sm:w-6 sm:h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StartGame;
