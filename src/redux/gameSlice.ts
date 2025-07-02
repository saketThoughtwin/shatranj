import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
type HistoryItem = {
  board: string[][];
  whiteCaptured: string[];
  blackCaptured: string[];
};
type Promotion = {
  from: [number, number];
  to: [number, number];
  color: "white" | "black";
};

interface GameState {
  board: string[][];
  selected: [number, number] | null;
  turn: "white" | "black";
  gameOver: boolean;
  winner: string | null;
  possibleMoves: [number, number][];
  thinking: boolean;
  check: boolean;
  promotion: Promotion | null;
  whiteCaptured: string[];
  blackCaptured: string[];
  history: HistoryItem[];
  justUndone: boolean;
}
export const initialBoard = [
  ["r", "n", "b", "q", "k", "b", "n", "r"],
  ["p", "p", "p", "p", "p", "p", "p", "p"],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["P", "P", "P", "P", "P", "P", "P", "P"],
  ["R", "N", "B", "Q", "K", "B", "N", "R"],
];
const initialState: GameState = {
  board: initialBoard,
  selected: null,
  turn: "white",
  gameOver: false,
  winner: null,
  possibleMoves: [],
  thinking: false,
  check: false,
  promotion: null,
  whiteCaptured: [],
  blackCaptured: [],
  history: [],
  justUndone: false,
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    setBoard: (state, action: PayloadAction<string[][]>) => {
      state.board = action.payload;
    },
    setSelected: (state, action: PayloadAction<[number, number] | null>) => {
      state.selected = action.payload;
    },
    setTurn: (state, action: PayloadAction<"white" | "black">) => {
      state.turn = action.payload;
    },
    setGameOver: (state, action: PayloadAction<boolean>) => {
      state.gameOver = action.payload;
    },
    setWinner: (state, action: PayloadAction<string | null>) => {
      state.winner = action.payload;
    },
    setPossibleMoves: (state, action: PayloadAction<[number, number][]>) => {
      state.possibleMoves = action.payload;
    },
    setThinking: (state, action: PayloadAction<boolean>) => {
      state.thinking = action.payload;
    },
    setCheck: (state, action: PayloadAction<boolean>) => {
      state.check = action.payload;
    },
    setPromotion: (state, action: PayloadAction<Promotion | null>) => {
      state.promotion = action.payload;
    },
    setWhiteCaptured: (state, action: PayloadAction<string[]>) => {
      state.whiteCaptured = action.payload;
    },
    setBlackCaptured: (state, action: PayloadAction<string[]>) => {
      state.blackCaptured = action.payload;
    },
    setHistory: (state, action: PayloadAction<HistoryItem[]>) => {
      state.history = action.payload;
    },
    setJustUndone: (state, action: PayloadAction<boolean>) => {
      state.justUndone = action.payload;
    },
  },
});

export const {
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
  } = gameSlice.actions;
  
  export default gameSlice.reducer;
  
