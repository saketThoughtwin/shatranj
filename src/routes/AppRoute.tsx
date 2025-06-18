// src/routes/index.tsx
import { Routes, Route } from "react-router-dom";
import StartGame from "@/pages/startgame/StartGame";
import ChessGame from "@/pages/chessgame/ChessGame";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<StartGame />} />
    <Route path="/game" element={<ChessGame />} />
    </Routes>
  );
};

export default AppRoutes;
