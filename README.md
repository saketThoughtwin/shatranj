# ♟️ Shatranj – One Player vs Bot Chess Game

**Shatranj** is a sleek one-player chess game built using **React**, **TypeScript**, and **Vite**, where you play against a basic bot. Inspired by classical chess rules and chess engine logic, the game handles all major rules, movement mechanics, and checkmate detection without external libraries like `chess.js`.

---

## 🚀 Features

- ✅ **One Player vs Bot** — Player as white, bot plays black
- ♟ **Turn-based Movement** with legal move restrictions
- 👑 **Game Over Detection** — Ends when a king is captured
- 🧠 **Bot Logic**: Simple algorithm chooses random valid moves for the bot
- 🔄 **Reset/New Game** option
- 💡 **Highlight of Possible Moves** *(optional enhancement)*
- 🧩 Built with **React + TypeScript + Vite**
- 🎨 Styled using **Tailwind CSS** and **shadcn/ui**
- 💾 Asset-based piece icons for realistic look (`.svg` pieces)

---

## 📜 Game Rules Implemented

- Only legal moves are allowed (pawn, rook, bishop, knight, queen, king)
- No jumping through pieces (except knight)
- Captures and promotions handled correctly
- Turn alternates between player and bot
- Game ends when **either king is captured** (checkmate simplified as king death)

---

## 🧠 Bot Logic

- Bot selects from all **available legal moves**
- Move selection is **random**, not strategic
- Good for beginner-level practice

---

## 🛠 Tech Stack

- **Frontend:** React + Vite + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Logic:** Custom move validation based on chess movement rules
- **Assets:** SVG icons for pieces (`/assets/bk.svg`, `wq.svg`, etc.)

---

## 📂 Folder Structure

