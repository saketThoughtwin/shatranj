import { useEffect, useState } from "react";
import bk from "../../assets/bK.svg";
import bq from "../../assets/bQ.svg";
import br from "../../assets/bR.svg";
import bb from "../../assets/bB.svg";
import bn from "../../assets/bN.svg";
import bp from "../../assets/bP.svg";
import wk from "../../assets/wK.svg";
import wq from "../../assets/wQ.svg";
import wr from "../../assets/wR.svg";
import wb from "../../assets/wB.svg";
import wn from "../../assets/wN.svg";
import wp from "../../assets/wP.svg";
import "./ChessGame.css";
import { RefreshCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Smile, Activity, Flame } from "lucide-react";
import rulesData from "@/data/chessRules.json";
const pieceIcons: Record<string, string> = {
  K: wk,
  Q: wq,
  R: wr,
  B: wb,
  N: wn,
  P: wp,
  k: bk,
  q: bq,
  r: br,
  b: bb,
  n: bn,
  p: bp,
};

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

const pieceScore: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

function isWhite(piece: string) {
  return piece === piece.toUpperCase() && piece !== "";
}
function isBlack(piece: string) {
  return piece === piece.toLowerCase() && piece !== "";
}

function findKing(
  board: string[][],
  isWhiteTurn: boolean
): [number, number] | null {
  const target = isWhiteTurn ? "K" : "k";
  for (let i = 0; i < 8; i++)
    for (let j = 0; j < 8; j++) if (board[i][j] === target) return [i, j];
  return null;
}

function isKingInCheck(board: string[][], isWhiteTurn: boolean): boolean {
  const kingPos = findKing(board, isWhiteTurn);
  if (!kingPos) return false;
  const attackers = getAllLegalMoves(board, !isWhiteTurn);
  return attackers.some(
    (m) => m.to[0] === kingPos[0] && m.to[1] === kingPos[1]
  );
}

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
  const langContent = rulesData[language];
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

        // Pawn promotion
        if (movedPiece === "p" && move.to[0] === 7) movedPiece = "q";

        const captured = newBoard[move.to[0]][move.to[1]];
        if (captured && isWhite(captured)) {
          setWhiteCaptured((prev) => [...prev, captured]);
        }
        newBoard[move.to[0]][move.to[1]] = movedPiece;
        newBoard[move.from[0]][move.from[1]] = "";

        setBoard(newBoard);

        // ✅ If White king was captured, it's game over
        if (captured === "K") {
          setGameOver(true);
          setWinner("Black");
          setThinking(false);
          return;
        }

        // ✅ Check if White is in checkmate or stalemate
        const isWhiteInCheck = isKingInCheck(newBoard, true);
        const whiteLegalMoves = getAllLegalMovesSafe(newBoard, true);

        if (isWhiteInCheck && whiteLegalMoves.length === 0) {
          setGameOver(true);
          setWinner("Black");
        } else if (!isWhiteInCheck && whiteLegalMoves.length === 0) {
          setGameOver(true);
          setWinner("Draw");
        } else {
          setTurn("white");
          setCheck(isWhiteInCheck);
        }

        setThinking(false);
      }, 900);
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

        <Dialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
          <DialogContent className="bg-black/80 text-white backdrop-blur-md rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-white text-xl font-semibold">
                Start New Game?
              </DialogTitle>
              <DialogDescription className="text-gray-300 text-sm">
                This will reset your current game. Are you sure you want to
                continue?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setConfirmModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleNewGame}
                className="bg-yellow-400 hover:bg-yellow-500 text-black"
              >
                Yes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* choosing modal for pawn promotion  */}
        <Dialog open={!!promotion} onOpenChange={() => setPromotion(null)}>
          <DialogContent className="bg-black text-white rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                Choose promotion piece
              </DialogTitle>
            </DialogHeader>
            <div className="flex justify-around gap-4 mt-4">
              {["Q", "R", "B", "N"].map((type) => {
                const pieceCode =
                  promotion?.color === "white" ? type : type.toLowerCase();
                return (
                  <img
                    key={type}
                    src={pieceIcons[pieceCode]}
                    className="promotion-option"
                    alt={type}
                    onClick={() => handlePromotionSelect(type)}
                  />
                );
              })}
            </div>
          </DialogContent>
        </Dialog>

        {/* rules and condition of chess game */}
        <Dialog open={showRulesModal} onOpenChange={setShowRulesModal}>
          <DialogContent className="bg-black/90 text-white rounded-xl max-w-lg">
            <DialogHeader>
              <div className="flex justify-between items-center w-full">
                {/* Title */}
                <DialogTitle className="text-2xl font-bold text-yellow-400">
                  {langContent.title}
                </DialogTitle>

                {/* Language Dropdown */}
                <Select
                  value={language}
                  onValueChange={(value) => setLanguage(value as "en" | "hi")}
                >
                  <SelectTrigger className="w-[130px] bg-black border border-yellow-400 text-yellow-400 hover:border-yellow-500 text-sm mr-4">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border border-yellow-400 text-white">
                    <SelectItem
                      value="en"
                      className="hover:bg-yellow-500 hover:text-black text-sm"
                    >
                      English
                    </SelectItem>
                    <SelectItem
                      value="hi"
                      className="hover:bg-yellow-500 hover:text-black text-sm"
                    >
                      हिन्दी
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </DialogHeader>

            {/* Description */}
            <p className="text-sm text-gray-300 mt-1">
              {langContent.description}
            </p>

            {/* Rules List */}
            <div className="space-y-2 text-sm mt-4">
              {langContent.rules.map((rule, idx) => (
                <p key={idx}>{rule}</p>
              ))}
            </div>

            {/* Piece Movement Section */}
            <div className="mt-6 space-y-2">
              <h3 className="text-lg font-semibold text-yellow-400">
                {langContent.howPiecesMove}
              </h3>
              <ul className="text-sm text-white mt-2 space-y-2">
                {langContent.pieceMoves.map((move, idx) => (
                  <li key={idx}>
                    <strong>{move.piece}:</strong> {move.description}
                  </li>
                ))}
              </ul>
            </div>

            {/* Continue Button */}
            <DialogFooter className="mt-6 flex justify-end">
              <Button
                className="bg-yellow-400 text-black hover:bg-yellow-500"
                onClick={() => setShowRulesModal(false)}
              >
                {langContent.button}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

// Aggressive Bot Evaluation
function evaluateBoard(board: string[][]): number {
  let score = 0;
  let mobility = 0;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if (!piece) continue;
      const val = pieceScore[piece.toLowerCase()] || 0;
      score += isWhite(piece) ? val : -val;
      const pseudo = getPseudoLegalMoves(board, i, j).length;
      mobility += isWhite(piece) ? pseudo : -pseudo;
    }
  }
  return score + 0.1 * mobility;
}

type Move = { from: [number, number]; to: [number, number] };

function minimaxRoot(board: string[][], depth: number, isMax: boolean) {
  const moves = getAllLegalMovesSafe(board, isMax);
  if (!moves.length) return { move: null, value: isMax ? -Infinity : Infinity }; // ✅ prevents bot freeze

  let bestMove: Move | null = null;
  let bestEval = isMax ? -Infinity : Infinity;

  for (const move of moves) {
    const copy = board.map((r) => [...r]);
    copy[move.to[0]][move.to[1]] = copy[move.from[0]][move.from[1]];
    copy[move.from[0]][move.from[1]] = "";
    const evalScore = minimaxAlphaBeta(
      copy,
      depth - 1,
      -Infinity,
      Infinity,
      !isMax
    );
    if ((isMax && evalScore > bestEval) || (!isMax && evalScore < bestEval)) {
      bestEval = evalScore;
      bestMove = move;
    }
  }
  return { move: bestMove, value: bestEval };
}

//best algo for bot turn
function minimaxAlphaBeta(
  board: string[][],
  depth: number,
  alpha: number,
  beta: number,
  isMax: boolean
): number {
  if (depth === 0) return evaluateBoard(board);

  const moves = getAllLegalMoves(board, isMax);
  if (!moves.length) return evaluateBoard(board);

  if (isMax) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const copy = board.map((r) => [...r]);
      copy[move.to[0]][move.to[1]] = copy[move.from[0]][move.from[1]];
      copy[move.from[0]][move.from[1]] = "";
      const evalScore = minimaxAlphaBeta(copy, depth - 1, alpha, beta, false);
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break; // pruning
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const copy = board.map((r) => [...r]);
      copy[move.to[0]][move.to[1]] = copy[move.from[0]][move.from[1]];
      copy[move.from[0]][move.from[1]] = "";
      const evalScore = minimaxAlphaBeta(copy, depth - 1, alpha, beta, true);
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break; // pruning
    }
    return minEval;
  }
}

function getAllLegalMoves(board: string[][], isWhiteTurn: boolean): Move[] {
  const moves: Move[] = [];
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if ((isWhiteTurn && isWhite(piece)) || (!isWhiteTurn && isBlack(piece))) {
        const pseudo = getPseudoLegalMoves(board, i, j); // ✅ keep original
        pseudo.forEach(([r, c]) => moves.push({ from: [i, j], to: [r, c] }));
      }
    }
  }
  return moves;
}
//rules wise turn for every player
function getPseudoLegalMoves(
  board: string[][],
  row: number,
  col: number
): [number, number][] {
  const moves: [number, number][] = [];
  const piece = board[row][col];
  if (!piece) return moves;
  const lower = piece.toLowerCase();
  const isW = isWhite(piece);
  const dir = isW ? -1 : 1;

  if (lower === "p") {
    const next = row + dir;
    if (board[next]?.[col] === "") moves.push([next, col]);
    if ((isW && row === 6) || (!isW && row === 1)) {
      const jump = row + 2 * dir;
      if (board[next]?.[col] === "" && board[jump]?.[col] === "")
        moves.push([jump, col]);
    }
    for (const dc of [-1, 1]) {
      const cap = board[next]?.[col + dc];
      if (cap && isWhite(cap) !== isW) moves.push([next, col + dc]);
    }
  }

  if (lower === "r" || lower === "q") {
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      for (let s = 1; s < 8; s++) {
        const r = row + dx * s,
          c = col + dy * s;
        if (r < 0 || c < 0 || r >= 8 || c >= 8) break;
        const t = board[r][c];
        if (!t) moves.push([r, c]);
        else {
          if (isWhite(t) !== isW) moves.push([r, c]);
          break;
        }
      }
    }
  }

  if (lower === "b" || lower === "q") {
    for (const [dx, dy] of [
      [1, 1],
      [-1, -1],
      [1, -1],
      [-1, 1],
    ]) {
      for (let s = 1; s < 8; s++) {
        const r = row + dx * s,
          c = col + dy * s;
        if (r < 0 || c < 0 || r >= 8 || c >= 8) break;
        const t = board[r][c];
        if (!t) moves.push([r, c]);
        else {
          if (isWhite(t) !== isW) moves.push([r, c]);
          break;
        }
      }
    }
  }

  if (lower === "n") {
    for (const [dx, dy] of [
      [2, 1],
      [2, -1],
      [-2, 1],
      [-2, -1],
      [1, 2],
      [-1, 2],
      [1, -2],
      [-1, -2],
    ]) {
      const r = row + dx,
        c = col + dy;
      if (r < 0 || c < 0 || r >= 8 || c >= 8) continue;
      const t = board[r][c];
      if (!t || isWhite(t) !== isW) moves.push([r, c]);
    }
  }

  if (lower === "k") {
    for (const [dx, dy] of [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
      [1, 1],
      [-1, -1],
      [1, -1],
      [-1, 1],
    ]) {
      const r = row + dx,
        c = col + dy;
      if (r < 0 || c < 0 || r >= 8 || c >= 8) continue;
      const t = board[r][c];
      if (!t || isWhite(t) !== isW) moves.push([r, c]);
    }
  }

  return moves;
}
function getAllLegalMovesSafe(board: string[][], isWhiteTurn: boolean): Move[] {
  const moves: Move[] = [];
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if ((isWhiteTurn && isWhite(piece)) || (!isWhiteTurn && isBlack(piece))) {
        const pseudo = getPseudoLegalMoves(board, i, j);
        for (const [r, c] of pseudo) {
          const temp = board.map((row) => [...row]);
          temp[r][c] = piece;
          temp[i][j] = "";
          if (!isKingInCheck(temp, isWhiteTurn)) {
            moves.push({ from: [i, j], to: [r, c] });
          }
        }
      }
    }
  }
  return moves;
}

//for safe king and only king safe turn when king is checkmate
function getLegalMovesFiltered(
  board: string[][],
  row: number,
  col: number,
  isWhiteTurn: boolean
): [number, number][] {
  const piece = board[row][col];
  if (!piece) return [];

  const isW = isWhite(piece);
  if (isW !== isWhiteTurn) return [];

  const pseudoMoves = getPseudoLegalMoves(board, row, col);
  const legalMoves: [number, number][] = [];

  const inCheck = isKingInCheck(board, isWhiteTurn);

  for (const [r, c] of pseudoMoves) {
    const tempBoard = board.map((row) => [...row]);
    tempBoard[r][c] = piece;
    tempBoard[row][col] = "";
    const stillInCheck = isKingInCheck(tempBoard, isWhiteTurn);

    if (!inCheck || (inCheck && !stillInCheck)) {
      legalMoves.push([r, c]);
    }
  }

  return legalMoves;
}
