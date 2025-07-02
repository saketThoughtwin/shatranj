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
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/store";
import {
  setBoard,
  setSelected,
  setTurn,
  setGameOver,
  setWinner,
  setPossibleMoves,
  setThinking,
  setCheck,
  setPromotion,
  setWhiteCaptured,
  setBlackCaptured,
  setHistory,
  setJustUndone,
  initialBoard
} from "@/redux/gameSlice";

export default function ChessGame() {
  const board = useSelector((state: RootState) => state.game.board);
  const dispatch = useDispatch();
  const selected = useSelector((state: RootState) => state.game.selected);
  const turn = useSelector((state: RootState) => state.game.turn);
  const gameOver = useSelector((state: RootState) => state.game.gameOver);
  const winner = useSelector((state: RootState) => state.game.winner);
  const possibleMoves = useSelector((state: RootState) => state.game.possibleMoves);
  const thinking = useSelector((state: RootState) => state.game.thinking);
  const check = useSelector((state: RootState) => state.game.check);
  const promotion = useSelector((state: RootState) => state.game.promotion);
  const whiteCaptured = useSelector((state: RootState) => state.game.whiteCaptured);
  const blackCaptured = useSelector((state: RootState) => state.game.blackCaptured);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(true);
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const history = useSelector((state: RootState) => state.game.history);
  const justUndone = useSelector((state: RootState) => state.game.justUndone);
  const [isMuted, setIsMuted] = useState(false);
  const {
    playMoveSoundWithFade,
    playCaptureSoundWithFade,
    playCheckSoundWithFade,
  } = useGameSounds(isMuted);

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

        dispatch(
          setHistory([
            ...history,
            {
              board: board.map((row) => [...row]),
              whiteCaptured: [...whiteCaptured],
              blackCaptured: [...blackCaptured],
            },
          ])
        );
        

        let movedPiece = selectedPiece;

        // Promotion
        if (movedPiece === "P" && row === 0) {
          dispatch(setPromotion({
            from: [fromRow, fromCol],
            to: [row, col],
            color: "white",
          }));
          return;
        }
        if (movedPiece === "p" && row === 7) movedPiece = "q";

        const captured = newBoard[row][col];
        if (captured && isWhite(captured)) {
          dispatch(setWhiteCaptured([...whiteCaptured, captured]));
        }
        if (captured && isBlack(captured)) {
          dispatch(setBlackCaptured([...blackCaptured, captured]));
        }

        newBoard[row][col] = movedPiece;
        newBoard[fromRow][fromCol] = "";
        const isBlackInCheck = isKingInCheck(newBoard, false);
        if (isBlackInCheck) {
          playCheckSoundWithFade(); // ✅ Play check sound if king is in check
        } else if (captured) {
          playCaptureSoundWithFade(); // 🔊 Play capture sound
        } else {
          playMoveSoundWithFade(); // 🔊 Play normal move sound
        }

        // ♜ Handle castling move: move the rook too
        if (selectedPiece === "K" && fromCol === 4) {
          // White kingside castling
          if (row === 7 && col === 6 && board[7][7] === "R") {
            newBoard[7][5] = "R";
            newBoard[7][7] = "";
          }
          // White queen side castling
          if (row === 7 && col === 2 && board[7][0] === "R") {
            newBoard[7][3] = "R";
            newBoard[7][0] = "";
          }
        }
        dispatch(setBoard(newBoard));
        dispatch(setSelected(null));
        dispatch(setPossibleMoves([]));

        if (captured === "k") {
         dispatch(setGameOver(true));
          dispatch(setWinner("White"));
        } else {
          const isBlackInCheck = isKingInCheck(newBoard, false);
          const blackLegalMoves = getAllLegalMovesSafe(newBoard, false);

          if (isBlackInCheck && blackLegalMoves.length === 0) {
            dispatch(setGameOver(true));
            dispatch(setWinner("White")); // ✅ CHECKMATE
          } else if (!isBlackInCheck && blackLegalMoves.length === 0) {
            dispatch(setGameOver(true));
            dispatch(setWinner("Draw")); // 🤝 STALEMATE
          } else {
            setTimeout(() => {
              dispatch(setTurn("black"));
              dispatch(setCheck(isBlackInCheck));
            }, 700);
          }
        }
        return;
      }
      dispatch(setSelected(null));
      dispatch(setPossibleMoves([]));
    } else {
      if (isWhite(piece)) {
        const legal = getLegalMovesFiltered(board, row, col, true);
        dispatch(setSelected([row, col]));
        dispatch(setPossibleMoves(legal));
      }
    }
  };

  //for undo moves
  const handleUndo = () => {
    if (history.length < 2 || thinking) return;

    const stateBeforeMyMove = history[history.length - 2];

    dispatch(setBoard(stateBeforeMyMove.board));
    dispatch(setWhiteCaptured(stateBeforeMyMove.whiteCaptured));
    dispatch(setBlackCaptured(stateBeforeMyMove.blackCaptured));

    dispatch(setHistory(history.slice(0, -2)));
    dispatch(setSelected(null));
    dispatch(setPossibleMoves([]));
    dispatch(setGameOver(false));
    dispatch(setWinner(null));
    dispatch(setTurn("white"));
  };

  //for choose one of them selecting the pawn promotion selecting
  const handlePromotionSelect = (type: string) => {
    if (!promotion) return;

    const newBoard = board.map((r) => [...r]);
    const promotedPiece =
      promotion.color === "white" ? type : type.toLowerCase();

    newBoard[promotion.to[0]][promotion.to[1]] = promotedPiece;
    newBoard[promotion.from[0]][promotion.from[1]] = "";

    dispatch(setBoard(newBoard));
    dispatch(setTurn(promotion.color === "white" ? "black" : "white"));
    dispatch(setPromotion(null));

    dispatch(setCheck(isKingInCheck(newBoard, promotion.color === "black")));
  };

  const handleNewGame = () => {
    dispatch(setBoard(initialBoard));
    dispatch(setTurn("white"));
    dispatch(setSelected(null));
    dispatch(setGameOver(false));
    dispatch(setWinner(null));
    dispatch(setPossibleMoves([]));
    dispatch(setThinking(false));
    dispatch(setCheck(false));
    setConfirmModalOpen(false);
    dispatch(setWhiteCaptured([])); // ✅ Clear white captured pieces
    dispatch(setBlackCaptured([]));
    dispatch(setHistory([]));
  };

  useEffect(() => {
    if (justUndone) {
      dispatch(setJustUndone(false)); // skip this bot turn cycle
      return;
    }

    if (turn === "black" && !gameOver) {
      dispatch(setThinking(true));

      setTimeout(() => {
        const { move } = minimaxRoot(board, depth, false);
        if (!move) {
          dispatch(setThinking(false));
          return;
        }

        const newBoard = board.map((r) => [...r]);
        let movedPiece = newBoard[move.from[0]][move.from[1]];

        if (movedPiece === "p" && move.to[0] === 7) {
          movedPiece = "q";
        }

        const captured = newBoard[move.to[0]][move.to[1]];
        if (captured && isWhite(captured)) {
          dispatch(setWhiteCaptured([...whiteCaptured, captured]));
        }

        newBoard[move.to[0]][move.to[1]] = movedPiece;
        newBoard[move.from[0]][move.from[1]] = "";
        dispatch(
          setHistory([
            ...history,
            {
              board: board.map((row) => [...row]),
              whiteCaptured: [...whiteCaptured],
              blackCaptured: [...blackCaptured],
            },
          ])
        );
        
        dispatch(setBoard(newBoard));

        const isWhiteInCheck = isKingInCheck(newBoard, true);
        const whiteLegalMoves = getAllLegalMovesSafe(newBoard, true);

        // 🔊 Add sound based on condition
        if (isWhiteInCheck) {
          playCheckSoundWithFade();
        } else if (captured) {
          playCaptureSoundWithFade();
        } else {
          playMoveSoundWithFade();
        }

        if (whiteLegalMoves.length === 0) {
          if (isWhiteInCheck) {
            dispatch(setGameOver(true));
            dispatch(setWinner("Black"));
          } else {
            dispatch(setGameOver(true));
           dispatch(setWinner("Draw"));
          }
          dispatch(setThinking(false));
          return;
        }

        dispatch(setTurn("white"));
        dispatch(setCheck(isWhiteInCheck));
        dispatch(setThinking(false));
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
          onClose={() => dispatch(setPromotion(null))}
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
