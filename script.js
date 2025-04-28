const rows = 6;
const cols = 7;
let board = [];
let currentPlayer = 'human'; // human = red, ai = yellow
let gameOver = false;

const boardDiv = document.getElementById('board');
const statusDiv = document.getElementById('status');

function createBoard() {
  board = Array.from({ length: rows }, () => Array(cols).fill(null));
  boardDiv.innerHTML = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.column = c;
      cell.addEventListener('click', () => playerMove(c));
      boardDiv.appendChild(cell);
    }
  }
}

function playerMove(col) {
  if (gameOver || currentPlayer !== 'human') return;
  if (dropDisc(col, 'red')) {
    currentPlayer = 'ai';
    if (!gameOver) {
      statusDiv.textContent = "AI's Turn...";
      setTimeout(aiMove, 500);
    }
  }
}

function aiMove() {
  if (gameOver) return;

  // Smart AI logic:
  let move = findBestMove();
  if (move === null) {
    move = Math.floor(Math.random() * cols);
    while (isColumnFull(move)) {
      move = Math.floor(Math.random() * cols);
    }
  }

  dropDisc(move, 'yellow');
  if (!gameOver) {
    currentPlayer = 'human';
    statusDiv.textContent = "Your Turn!";
  }
}

function findBestMove() {
  // 1. Can AI win in next move?
  for (let c = 0; c < cols; c++) {
    if (!isColumnFull(c)) {
      const tempBoard = copyBoard();
      simulateDrop(tempBoard, c, 'yellow');
      if (simulateCheckWin(tempBoard, 'yellow')) {
        return c;
      }
    }
  }

  // 2. Can Human win in next move? (Block it!)
  for (let c = 0; c < cols; c++) {
    if (!isColumnFull(c)) {
      const tempBoard = copyBoard();
      simulateDrop(tempBoard, c, 'red');
      if (simulateCheckWin(tempBoard, 'red')) {
        return c;
      }
    }
  }

  // 3. Otherwise, pick center column if possible
  if (!isColumnFull(3)) return 3;

  // 4. Otherwise random move
  return null;
}

function dropDisc(col, color) {
  for (let r = rows - 1; r >= 0; r--) {
    if (!board[r][col]) {
      board[r][col] = color;
      updateCell(r, col, color);
      if (checkWin(r, col, color)) {
        gameOver = true;
        if (color === 'red') {
          statusDiv.textContent = "🎉 You Win! Hooray! 🎉";
        } else {
          statusDiv.textContent = "🤖 AI Wins! Better luck next time.";
        }
      } else if (isBoardFull()) {
        gameOver = true;
        statusDiv.textContent = "Draw! 😐";
      }
      return true;
    }
  }
  return false;
}

function updateCell(r, c, color) {
  const index = r * cols + c;
  const cell = boardDiv.children[index];
  const disc = document.createElement('div');
  disc.classList.add('disc', color);
  cell.appendChild(disc);
}

function isColumnFull(col) {
  return board[0][col] !== null;
}

function isBoardFull() {
  return board[0].every(cell => cell !== null);
}

function checkWin(r, c, color) {
  return (
    checkDirection(r, c, 1, 0, color) || // Vertical
    checkDirection(r, c, 0, 1, color) || // Horizontal
    checkDirection(r, c, 1, 1, color) || // Diagonal \
    checkDirection(r, c, 1, -1, color)   // Diagonal /
  );
}

function checkDirection(r, c, dr, dc, color) {
  let count = 1;
  count += countDiscs(r, c, dr, dc, color);
  count += countDiscs(r, c, -dr, -dc, color);
  return count >= 4;
}

function countDiscs(r, c, dr, dc, color) {
  let count = 0;
  r += dr;
  c += dc;
  while (r >= 0 && r < rows && c >= 0 && c < cols && board[r][c] === color) {
    count++;
    r += dr;
    c += dc;
  }
  return count;
}

function copyBoard() {
  return board.map(row => row.slice());
}

function simulateDrop(tempBoard, col, color) {
  for (let r = rows - 1; r >= 0; r--) {
    if (!tempBoard[r][col]) {
      tempBoard[r][col] = color;
      return;
    }
  }
}

function simulateCheckWin(tempBoard, color) {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (tempBoard[r][c] === color) {
        if (
          checkDirectionSim(tempBoard, r, c, 1, 0, color) ||
          checkDirectionSim(tempBoard, r, c, 0, 1, color) ||
          checkDirectionSim(tempBoard, r, c, 1, 1, color) ||
          checkDirectionSim(tempBoard, r, c, 1, -1, color)
        ) {
          return true;
        }
      }
    }
  }
  return false;
}

function checkDirectionSim(board, r, c, dr, dc, color) {
  let count = 1;
  count += countDiscsSim(board, r, c, dr, dc, color);
  count += countDiscsSim(board, r, c, -dr, -dc, color);
  return count >= 4;
}

function countDiscsSim(board, r, c, dr, dc, color) {
  let count = 0;
  r += dr;
  c += dc;
  while (r >= 0 && r < rows && c >= 0 && c < cols && board[r][c] === color) {
    count++;
    r += dr;
    c += dc;
  }
  return count;
}

function restart() {
  gameOver = false;
  currentPlayer = 'human';
  statusDiv.textContent = "Your Turn!";
  createBoard();
}

window.onload = createBoard;
