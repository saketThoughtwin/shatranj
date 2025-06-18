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

  
  return (
    <div className={startGameContainer}>
      <div className="text-center space-y-6">
        <h1 className={headingStyle}>
          <Crown className="w-8 h-8 text-gray-300" />
          Welcome to <span className="text-yellow-300">Shatranj</span>
        </h1>
        <Button onClick={() => navigate("/game")} className={startButtonStyle}>
          Start Game
        </Button>
      </div>
    </div>
  );
};

export default StartGame;
