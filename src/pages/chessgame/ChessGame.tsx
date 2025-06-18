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
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 1000,
};

function isWhite(piece: string) {
  return piece === piece.toUpperCase() && piece !== "";
}
function isBlack(piece: string) {
  return piece === piece.toLowerCase() && piece !== "";
}

export default function ChessGame() {
  const [board, setBoard] = useState(initialBoard);
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [turn, setTurn] = useState<"white" | "black">("white");
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<[number, number][]>([]);

  const handleClick = (row: number, col: number) => {
    if (gameOver || turn !== "white") return;

    const piece = board[row][col];

    if (selected) {
      const [fromRow, fromCol] = selected;
      const selectedPiece = board[fromRow][fromCol];

      if (isWhite(selectedPiece)) {
        const legal = getPseudoLegalMoves(board, fromRow, fromCol);
        if (legal.some(([r, c]) => r === row && c === col)) {
          const newBoard = board.map((r) => [...r]);
          const captured = newBoard[row][col];
          newBoard[row][col] = selectedPiece;
          newBoard[fromRow][fromCol] = "";
          setBoard(newBoard);
          setSelected(null);
          setPossibleMoves([]);

          if (captured === "k") {
            setGameOver(true);
            setWinner("White");
          } else {
            setTurn("black");
          }
          return;
        }
      }
      setSelected(null);
      setPossibleMoves([]);
    } else {
      if (isWhite(piece)) {
        const legal = getPseudoLegalMoves(board, row, col);
        setSelected([row, col]);
        setPossibleMoves(legal);
      }
    }
  };

  useEffect(() => {
    if (turn === "black" && !gameOver) {
      setTimeout(() => {
        const { move } = minimaxRoot(board, 2, false);
        if (!move) return;

        const newBoard = board.map((r) => [...r]);
        const [fromRow, fromCol] = move.from;
        const [toRow, toCol] = move.to;
        const captured = newBoard[toRow][toCol];
        newBoard[toRow][toCol] = newBoard[fromRow][fromCol];
        newBoard[fromRow][fromCol] = "";

        setBoard(newBoard);
        if (captured === "K") {
          setGameOver(true);
          setWinner("Black");
        } else {
          setTurn("white");
        }
      }, 500);
    }
  }, [turn]);

  return (
    <div className="game-wrapper">
      <h1 className="title">♟️ Shatranj</h1>
      <div className="board">
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

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`square ${squareColor} ${selectedClass} ${possibleMoveClass}`}
                onClick={() => handleClick(rowIndex, colIndex)}
              >
                {piece && <img src={pieceIcons[piece]} alt={piece} />}
              </div>
            );
          })
        )}
      </div>
      {gameOver && (
        <div className="result-banner">
          🏁 Game Over — <strong>{winner}</strong> wins!
        </div>
      )}
    </div>
  );
}

function evaluateBoard(board: string[][]): number {
  let score = 0;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if (piece) {
        const val = pieceScore[piece.toLowerCase()] || 0;
        score += isWhite(piece) ? val : -val;
      }
    }
  }
  return score;
}

type Move = { from: [number, number]; to: [number, number] };

function minimaxRoot(board: string[][], depth: number, isMaximizing: boolean) {
  const moves: Move[] = getAllLegalMoves(board, isMaximizing);
  let bestMove: Move | null = null;
  let bestEval = isMaximizing ? -Infinity : Infinity;

  for (const move of moves) {
    const copy = board.map((r) => [...r]);
    copy[move.to[0]][move.to[1]] = copy[move.from[0]][move.from[1]];
    copy[move.from[0]][move.from[1]] = "";
    const evalScore = minimax(copy, depth - 1, !isMaximizing);
    if (isMaximizing ? evalScore > bestEval : evalScore < bestEval) {
      bestEval = evalScore;
      bestMove = move;
    }
  }

  return { move: bestMove, value: bestEval };
}

function minimax(board: string[][], depth: number, isMaximizing: boolean): number {
  if (depth === 0) return evaluateBoard(board);
  const moves = getAllLegalMoves(board, isMaximizing);
  if (moves.length === 0) return evaluateBoard(board);

  let best = isMaximizing ? -Infinity : Infinity;
  for (const move of moves) {
    const copy = board.map((r) => [...r]);
    copy[move.to[0]][move.to[1]] = copy[move.from[0]][move.from[1]];
    copy[move.from[0]][move.from[1]] = "";
    const evalScore = minimax(copy, depth - 1, !isMaximizing);
    best = isMaximizing ? Math.max(best, evalScore) : Math.min(best, evalScore);
  }
  return best;
}

function getAllLegalMoves(board: string[][], isWhiteTurn: boolean): Move[] {
  const moves: Move[] = [];
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if ((isWhiteTurn && isWhite(piece)) || (!isWhiteTurn && isBlack(piece))) {
        const pseudoMoves = getPseudoLegalMoves(board, i, j);
        pseudoMoves.forEach(([r, c]) => moves.push({ from: [i, j], to: [r, c] }));
      }
    }
  }
  return moves;
}

function getPseudoLegalMoves(board: string[][], row: number, col: number): [number, number][] {
  const moves: [number, number][] = [];
  const piece = board[row][col];
  const lower = piece.toLowerCase();
  const isWhitePiece = isWhite(piece);
  const direction = isWhitePiece ? -1 : 1;

  if (lower === "p") {
    const nextRow = row + direction;
    if (board[nextRow]?.[col] === "") moves.push([nextRow, col]);
    if ((isWhitePiece && row === 6) || (!isWhitePiece && row === 1)) {
      const jumpRow = row + 2 * direction;
      if (board[nextRow]?.[col] === "" && board[jumpRow]?.[col] === "") {
        moves.push([jumpRow, col]);
      }
    }
    for (let dc of [-1, 1]) {
      const capture = board[nextRow]?.[col + dc];
      if (capture && isWhitePiece !== isWhite(capture)) {
        moves.push([nextRow, col + dc]);
      }
    }
  }

  if (lower === "r" || lower === "q") {
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      for (let step = 1; step < 8; step++) {
        const r = row + dx * step;
        const c = col + dy * step;
        if (r < 0 || c < 0 || r >= 8 || c >= 8) break;
        const target = board[r][c];
        if (!target) moves.push([r, c]);
        else {
          if (isWhitePiece !== isWhite(target)) moves.push([r, c]);
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
      for (let step = 1; step < 8; step++) {
        const r = row + dx * step;
        const c = col + dy * step;
        if (r < 0 || c < 0 || r >= 8 || c >= 8) break;
        const target = board[r][c];
        if (!target) moves.push([r, c]);
        else {
          if (isWhitePiece !== isWhite(target)) moves.push([r, c]);
          break;
        }
      }
    }
  }

  if (lower === "n") {
    for (const [dx, dy] of [
      [2, 1], [2, -1], [-2, 1], [-2, -1],
      [1, 2], [-1, 2], [1, -2], [-1, -2],
    ]) {
      const r = row + dx;
      const c = col + dy;
      if (r < 0 || c < 0 || r >= 8 || c >= 8) continue;
      const target = board[r][c];
      if (!target || isWhitePiece !== isWhite(target)) moves.push([r, c]);
    }
  }

  if (lower === "k") {
    for (const [dx, dy] of [
      [0, 1], [0, -1], [1, 0], [-1, 0],
      [1, 1], [-1, -1], [1, -1], [-1, 1],
    ]) {
      const r = row + dx;
      const c = col + dy;
      if (r < 0 || c < 0 || r >= 8 || c >= 8) continue;
      const target = board[r][c];
      if (!target || isWhitePiece !== isWhite(target)) moves.push([r, c]);
    }
  }

  return moves;
}
