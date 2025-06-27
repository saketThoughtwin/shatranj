export type Move = { from: [number, number]; to: [number, number] };

const pieceScore: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};
export function isWhite(piece: string) {
    return piece === piece.toUpperCase() && piece !== "";
  }
  
  export function isBlack(piece: string) {
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

export function isKingInCheck(board: string[][], isWhiteTurn: boolean): boolean {
  const kingPos = findKing(board, isWhiteTurn);
  if (!kingPos) return false;
  const attackers = getAllLegalMoves(board, !isWhiteTurn);
  return attackers.some(
    (m) => m.to[0] === kingPos[0] && m.to[1] === kingPos[1]
  );
};
export function evaluateBoard(board: string[][]): number {
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
  };

 export  function minimaxRoot(board: string[][], depth: number, isMax: boolean) {
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
export function minimaxAlphaBeta(
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

 export  function getAllLegalMoves(board: string[][], isWhiteTurn: boolean): Move[] {
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
  };

  //rules wise turn for every player
export function getPseudoLegalMoves(
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
  };

 export function getAllLegalMovesSafe(board: string[][], isWhiteTurn: boolean): Move[] {
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
export function getLegalMovesFiltered(
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
  