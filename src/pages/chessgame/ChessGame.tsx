import { useEffect, useState } from "react";
import pieceIcons from "@/constants/pieceIcons";
import "./ChessGame.css";
import {
  isWhite,
  isBlack,
  isKingInCheck,
  getAllLegalMovesSafe,
  getLegalMovesFiltered,
  minimaxRoot,
} from "@/pages/botlogic/ChessBotLogic";
import RulesModal from "../modals/rules/RulesModal";
import PawnPromotionModal from "../modals/pawnpromotion/PawnPromotionModal";
import ConfirmNewGameModal from "../modals/confirmbox/ConfirmNewGameModal";
import { RefreshCcw } from "lucide-react";
import { Smile, Activity, Flame } from "lucide-react";



const initialBoard = [
  ["r", "n", "b", "q", "k", "b", "n", "r"],
  ["p", "p", "p", "p", "p", "p", "p", "p"],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["P", "P", "P", "P", "P", "P", "P", "P"],
  ["R", "N", "B", "Q", "K", "B", "N", "R"],
];

export default function ChessGame() {
  const [board, setBoard] = useState(initialBoard);
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [turn, setTurn] = useState<"white" | "black">("white");
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<[number, number][]>([]);
  const [thinking, setThinking] = useState(false);
  const [check, setCheck] = useState(false);
  const [promotion, setPromotion] = useState<{
    from: [number, number];
    to: [number, number];
    color: "white" | "black";
  } | null>(null);
  const [whiteCaptured, setWhiteCaptured] = useState<string[]>([]);
  const [blackCaptured, setBlackCaptured] = useState<string[]>([]);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(true);
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const difficulty =
    (localStorage.getItem("botLevel") as "easy" | "medium" | "hard") ||
    "medium";
  const depth = {
    easy: 1,
    medium: 3,
    hard: 4,
  }[difficulty];

  const handleClick = (row: number, col: number) => {
    if (gameOver || turn !== "white" || thinking) return;
    const piece = board[row][col];

    if (selected) {
      const [fromRow, fromCol] = selected;
      const selectedPiece = board[fromRow][fromCol];
      const legal = getLegalMovesFiltered(board, fromRow, fromCol, true);
      if (legal.some(([r, c]) => r === row && c === col)) {
        const newBoard = board.map((r) => [...r]);
        let movedPiece = selectedPiece;

        // Promotion
        if (movedPiece === "P" && row === 0) {
          setPromotion({
            from: [fromRow, fromCol],
            to: [row, col],
            color: "white",
          });
          return;
        }
        if (movedPiece === "p" && row === 7) movedPiece = "q";

        const captured = newBoard[row][col];
        if (captured && isWhite(captured)) {
          setWhiteCaptured((prev) => [...prev, captured]);
        }
        if (captured && isBlack(captured)) {
          setBlackCaptured((prev) => [...prev, captured]);
        }

        newBoard[row][col] = movedPiece;
        newBoard[fromRow][fromCol] = "";
        setBoard(newBoard);
        setSelected(null);
        setPossibleMoves([]);

        if (captured === "k") {
          setGameOver(true);
          setWinner("White");
        } else {
          const isBlackInCheck = isKingInCheck(newBoard, false);
          const blackLegalMoves = getAllLegalMovesSafe(newBoard, false);

          if (isBlackInCheck && blackLegalMoves.length === 0) {
            setGameOver(true);
            setWinner("White"); // ✅ CHECKMATE
          } else if (!isBlackInCheck && blackLegalMoves.length === 0) {
            setGameOver(true);
            setWinner("Draw"); // 🤝 STALEMATE
          } else {
            setTimeout(() => {
              setTurn("black");
              setCheck(isBlackInCheck);
            }, 700);
          }
        }
        return;
      }
      setSelected(null);
      setPossibleMoves([]);
    } else {
      if (isWhite(piece)) {
        const legal = getLegalMovesFiltered(board, row, col, true);
        setSelected([row, col]);
        setPossibleMoves(legal);
      }
    }
  };
  //for choose one of them selecting the pawn promotion selecting
  const handlePromotionSelect = (type: string) => {
    if (!promotion) return;

    const newBoard = board.map((r) => [...r]);
    const promotedPiece =
      promotion.color === "white" ? type : type.toLowerCase();

    newBoard[promotion.to[0]][promotion.to[1]] = promotedPiece;
    newBoard[promotion.from[0]][promotion.from[1]] = "";

    setBoard(newBoard);
    setTurn(promotion.color === "white" ? "black" : "white");
    setPromotion(null);

    setCheck(isKingInCheck(newBoard, promotion.color === "black"));
  };

  const handleNewGame = () => {
    setBoard(initialBoard);
    setTurn("white");
    setSelected(null);
    setGameOver(false);
    setWinner(null);
    setPossibleMoves([]);
    setThinking(false);
    setCheck(false);
    setConfirmModalOpen(false);
    setWhiteCaptured([]); // ✅ Clear white captured pieces
    setBlackCaptured([]);
  };

  useEffect(() => {
    if (turn === "black" && !gameOver) {
      setThinking(true);

      setTimeout(() => {
        const { move } = minimaxRoot(board, depth, false);
        if (!move) {
          setThinking(false);
          return;
        }

        const newBoard = board.map((r) => [...r]);
        let movedPiece = newBoard[move.from[0]][move.from[1]];

        // ✅ Black pawn promotion
        if (movedPiece === "p" && move.to[0] === 7) {
          movedPiece = "q";
        }

        const captured = newBoard[move.to[0]][move.to[1]];
        if (captured && isWhite(captured)) {
          setWhiteCaptured((prev) => [...prev, captured]);
        }

        // ✅ Apply move on the board
        newBoard[move.to[0]][move.to[1]] = movedPiece;
        newBoard[move.from[0]][move.from[1]] = "";

        setBoard(newBoard);

        // ✅ If white king is captured directly (safety fallback)
        if (captured === "K") {
          setGameOver(true);
          setWinner("Black");
          setThinking(false);
          return;
        }

        // ✅ Checkmate / Stalemate logic for white
        const isWhiteInCheck = isKingInCheck(newBoard, true);
        const whiteLegalMoves = getAllLegalMovesSafe(newBoard, true);

        if (whiteLegalMoves.length === 0) {
          if (isWhiteInCheck) {
            // ✅ White is checkmated
            setGameOver(true);
            setWinner("Black");
          } else {
            // 🟨 Stalemate
            setGameOver(true);
            setWinner("Draw");
          }
          setThinking(false);
          return;
        }

        // ✅ If game continues, switch to white turn
        setTurn("white");
        setCheck(isWhiteInCheck);
        setThinking(false);
      }, 900); // Simulate thinking time
    }
  }, [turn]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);
  const audio = new Audio(
    "https://res.cloudinary.com/ddfp1evfo/video/upload/v1750668928/videoplayback_vpzpip.mp3"
  );

  useEffect(() => {
    audio.loop = true;
    const playMusic = async () => {
      try {
        await audio.play();
      } catch (err) {
        console.warn("User interaction needed to start music:", err);
      }
    };
    playMusic();
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  return (
    <>
      <div className="chess-background" />
      <div className="game-wrapper">
        <div className="game-header">
          <h1 className="title">
            <span className="title-group">
              ♟️ Shatranj
              <RefreshCcw
                className="new-game-icon"
                onClick={() => setConfirmModalOpen(true)}
                aria-label="New Game"
              >
                <title>New Game</title>
              </RefreshCcw>
            </span>

            <p className="text-2xl font-bold text-white mt-1 text-center flex items-center justify-center gap-1">
              Level:
              <span className="text-yellow-400 flex items-center gap-1">
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                {difficulty === "easy" && <Smile className="w-6 h-6" />}
                {difficulty === "medium" && <Activity className="w-6 h-6" />}
                {difficulty === "hard" && <Flame className="w-6 h-6" />}
              </span>
            </p>
          </h1>
        </div>

        <div className="relative w-full">
          <div className="board-container">
            {/* White's captured pieces (left side) */}
            <div className="captured-column">
              {whiteCaptured.map((p, i) => (
                <img
                  key={i}
                  src={pieceIcons[p]}
                  alt={p}
                  className="captured-icon"
                />
              ))}
            </div>

            {/* Main board */}
            <div
              className={`board transition duration-300 ${
                thinking ? "blur-[1px] brightness-90" : ""
              }`}
            >
              {board.map((row, rowIndex) =>
                row.map((piece, colIndex) => {
                  const selectedClass =
                    selected?.[0] === rowIndex && selected?.[1] === colIndex
                      ? "selected"
                      : "";
                  const possibleMoveClass = possibleMoves.some(
                    ([r, c]) => r === rowIndex && c === colIndex
                  )
                    ? "possible-move"
                    : "";
                  const squareColor =
                    (rowIndex + colIndex) % 2 === 0 ? "light" : "dark";
                  const isChecked =
                    piece === (turn === "white" ? "K" : "k") && check;
                  const checkClass = isChecked ? "check" : "";

                  return (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={`square ${squareColor} ${selectedClass} ${possibleMoveClass} ${checkClass}`}
                      onClick={() => handleClick(rowIndex, colIndex)}
                    >
                      {piece && <img src={pieceIcons[piece]} alt={piece} />}
                    </div>
                  );
                })
              )}
            </div>

            {/* Black's captured pieces (right side) */}
            <div className="captured-column">
              {blackCaptured.map((p, i) => (
                <img
                  key={i}
                  src={pieceIcons[p]}
                  alt={p}
                  className="captured-icon"
                />
              ))}
            </div>
          </div>

          {thinking && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div className="text-white text-5xl font-extrabold tracking-wider drop-shadow-md animate-pulse">
                THINKING...
              </div>
            </div>
          )}
        </div>

        {gameOver && (
          <div className="result-banner">
            🏁 Game Over —{" "}
            <strong>
              {winner === "Draw" ? "It's a Draw!" : `${winner} wins!`}
            </strong>
          </div>
        )}
        {/* new game/restart */}
        <ConfirmNewGameModal
          open={confirmModalOpen}
          onCancel={() => setConfirmModalOpen(false)}
          onConfirm={handleNewGame}
        />

        {/* choosing modal for pawn promotion  */}
        <PawnPromotionModal
          promotion={promotion}
          onSelect={handlePromotionSelect}
          onClose={() => setPromotion(null)}
          pieceIcons={pieceIcons}
        />

        {/* rules and condition of chess game */}
        <RulesModal
          open={showRulesModal}
          onClose={() => setShowRulesModal(false)}
          language={language}
          setLanguage={setLanguage}
        />
      </div>
    </>
  );
}
