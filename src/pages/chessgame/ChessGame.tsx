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
import { useGameSounds } from "@/hooks/useGameSounds";
import RulesModal from "../modals/rules/RulesModal";
import PawnPromotionModal from "../modals/pawnpromotion/PawnPromotionModal";
import ConfirmNewGameModal from "../modals/confirmbox/ConfirmNewGameModal";
import { RefreshCcw, Undo2, Volume2, VolumeX } from "lucide-react";
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
  type HistoryItem = {
    board: string[][];
    whiteCaptured: string[];
    blackCaptured: string[];
  };
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [justUndone, setJustUndone] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const {
    playMoveSoundWithFade,
    playCaptureSoundWithFade,
    playCheckSoundWithFade,
  } = useGameSounds(isMuted);

  const difficulty =
    (localStorage.getItem("botLevel") as "easy" | "medium" | "hard") ||
    "medium";
  const playerSide =
    (localStorage.getItem("playerColor") as "white" | "black") || "white";

  const depth = {
    easy: 1,
    medium: 3,
    hard: 4,
  }[difficulty];

  const handleClick = (row: number, col: number) => {
    if (gameOver || turn !== playerSide || thinking) return;
    const piece = board[row][col];

    if (selected) {
      const [fromRow, fromCol] = selected;
      const selectedPiece = board[fromRow][fromCol];

      // ✅ FIXED: Use actual turn info (white or black)
      const legal = getLegalMovesFiltered(
        board,
        fromRow,
        fromCol,
        turn === "white"
      );

      if (legal.some(([r, c]) => r === row && c === col)) {
        const newBoard = board.map((r) => [...r]);

        // 🔁 Save history
        setHistory((prev) => [
          ...prev,
          {
            board: board.map((r) => [...r]),
            whiteCaptured: [...whiteCaptured],
            blackCaptured: [...blackCaptured],
          },
        ]);

        const movedPiece = selectedPiece;

        // ♟️ Promotion
        if (movedPiece === "P" && row === 0) {
          setPromotion({
            from: [fromRow, fromCol],
            to: [row, col],
            color: "white",
          });
          return;
        }
        if (movedPiece === "p" && row === 7) {
          setPromotion({
            from: [fromRow, fromCol],
            to: [row, col],
            color: "black",
          });
          return;
        }

        // 🎯 Capture
        const captured = newBoard[row][col];
        if (captured) {
          if (isWhite(captured)) {
            setWhiteCaptured((prev) => [...prev, captured]);
          } else if (isBlack(captured)) {
            setBlackCaptured((prev) => [...prev, captured]);
          }
        }

        newBoard[row][col] = movedPiece;
        newBoard[fromRow][fromCol] = "";

        // ♜ Castling
        if ((selectedPiece === "K" || selectedPiece === "k") && fromCol === 4) {
          // White kingside
          if (row === 7 && col === 6 && board[7][7] === "R") {
            newBoard[7][5] = "R";
            newBoard[7][7] = "";
          }
          // White queenside
          if (row === 7 && col === 2 && board[7][0] === "R") {
            newBoard[7][3] = "R";
            newBoard[7][0] = "";
          }

          // Black kingside
          if (row === 0 && col === 6 && board[0][7] === "r") {
            newBoard[0][5] = "r";
            newBoard[0][7] = "";
          }
          // Black queenside
          if (row === 0 && col === 2 && board[0][0] === "r") {
            newBoard[0][3] = "r";
            newBoard[0][0] = "";
          }
        }

        // 🔊 Sound Effects
        const opponentIsWhite = turn === "black";
        const opponentInCheck = isKingInCheck(newBoard, opponentIsWhite);

        if (opponentInCheck) {
          playCheckSoundWithFade();
        } else if (captured) {
          playCaptureSoundWithFade();
        } else {
          playMoveSoundWithFade();
        }

        // ♟️ Finalize move
        setBoard(newBoard);
        setSelected(null);
        setPossibleMoves([]);

        // 🏁 Game Over Check
        const opponentLegalMoves = getAllLegalMovesSafe(
          newBoard,
          opponentIsWhite
        );
        const opponentKing = opponentIsWhite ? "K" : "k";

        if (captured === opponentKing) {
          setGameOver(true);
          setWinner(turn === "white" ? "White" : "Black");
        } else if (opponentInCheck && opponentLegalMoves.length === 0) {
          setGameOver(true);
          setWinner(turn === "white" ? "White" : "Black");
        } else if (!opponentInCheck && opponentLegalMoves.length === 0) {
          setGameOver(true);
          setWinner("Draw");
        } else {
          setTimeout(() => {
            setTurn(opponentIsWhite ? "white" : "black");
            setCheck(opponentInCheck);
          }, 700);
        }
        return;
      }

      // ❌ Invalid move click
      setSelected(null);
      setPossibleMoves([]);
    } else {
      // ✅ First Click: Select only own piece
      if (
        (turn === "white" && isWhite(piece)) ||
        (turn === "black" && isBlack(piece))
      ) {
        // ✅ FIXED: Use actual turn
        const legal = getLegalMovesFiltered(board, row, col, turn === "white");
        setSelected([row, col]);
        setPossibleMoves(legal);
      }
    }
  };

  //for undo moves
  const handleUndo = () => {
    if (history.length < 2 || thinking) return;

    const stateBeforeMyMove = history[history.length - 2];

    setBoard(stateBeforeMyMove.board);
    setWhiteCaptured(stateBeforeMyMove.whiteCaptured);
    setBlackCaptured(stateBeforeMyMove.blackCaptured);

    setHistory((prev) => prev.slice(0, -2));
    setSelected(null);
    setPossibleMoves([]);
    setGameOver(false);
    setWinner(null);
    setTurn("white");
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
    setHistory([]);
  };
  useEffect(() => {
    if (playerSide === "black") {
      setTurn("white"); // Let bot start
    }
  }, []);

  useEffect(() => {
    if (justUndone) {
      setJustUndone(false); // skip this bot turn cycle
      return;
    }

    // Bot's turn
    if (turn !== playerSide && !gameOver) {
      setThinking(true);

      setTimeout(() => {
        const isBotWhite = playerSide === "black";
        const { move } = minimaxRoot(board, depth, isBotWhite);
        if (!move) {
          setThinking(false);
          return;
        }

        const newBoard = board.map((r) => [...r]);
        let movedPiece = newBoard[move.from[0]][move.from[1]];

        // Handle promotion
        if (
          (isBotWhite && movedPiece === "P" && move.to[0] === 0) ||
          (!isBotWhite && movedPiece === "p" && move.to[0] === 7)
        ) {
          movedPiece = isBotWhite ? "Q" : "q";
        }

        const captured = newBoard[move.to[0]][move.to[1]];
        if (captured) {
          if (isBotWhite && isBlack(captured)) {
            setBlackCaptured((prev) => [...prev, captured]);
          } else if (!isBotWhite && isWhite(captured)) {
            setWhiteCaptured((prev) => [...prev, captured]);
          }
        }

        newBoard[move.to[0]][move.to[1]] = movedPiece;
        newBoard[move.from[0]][move.from[1]] = "";

        // Save history
        setHistory((prev) => [
          ...prev,
          {
            board: board.map((r) => [...r]),
            whiteCaptured: [...whiteCaptured],
            blackCaptured: [...blackCaptured],
          },
        ]);

        setBoard(newBoard);

        const isPlayerWhite = playerSide === "white";
        const playerInCheck = isKingInCheck(newBoard, isPlayerWhite);
        const playerLegalMoves = getAllLegalMovesSafe(newBoard, isPlayerWhite);

        // Sound effects
        if (playerInCheck) {
          playCheckSoundWithFade();
        } else if (captured) {
          playCaptureSoundWithFade();
        } else {
          playMoveSoundWithFade();
        }

        // Game Over?
        if (playerLegalMoves.length === 0) {
          if (playerInCheck) {
            setGameOver(true);
            setWinner(isBotWhite ? "White" : "Black");
          } else {
            setGameOver(true);
            setWinner("Draw");
          }
          setThinking(false);
          return;
        }

        // Player's turn
        setTurn(playerSide);
        setCheck(playerInCheck);
        setThinking(false);
      }, 900);
    }
  }, [turn]);

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
            <button
              onClick={() => setIsMuted((prev) => !prev)}
              className="mute-btn"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <VolumeX className="w-6 h-6 text-white hover:text-yellow-400" />
              ) : (
                <Volume2 className="w-6 h-6 text-white hover:text-yellow-400" />
              )}
            </button>

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
              className={`board ${playerSide === "black" ? "rotate-180" : ""}`}
            >
              {(playerSide === "black" ? [...board].reverse() : board).map(
                (row, rowIndexOriginal) => {
                  const rowIndex =
                    playerSide === "black"
                      ? 7 - rowIndexOriginal
                      : rowIndexOriginal;

                  return (
                    playerSide === "black" ? [...row].reverse() : row
                  ).map((piece, colIndexOriginal) => {
                    const colIndex =
                      playerSide === "black"
                        ? 7 - colIndexOriginal
                        : colIndexOriginal;

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
                        {piece && (
                          <img
                            src={pieceIcons[piece]}
                            alt={piece}
                            draggable={false}
                          />
                        )}
                      </div>
                    );
                  });
                }
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
        <button
          onClick={handleUndo}
          className="undo-btn"
          title="Undo Last Move"
        >
          <Undo2 className="w-6 h-6 text-white hover:text-yellow-400" />
        </button>

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
