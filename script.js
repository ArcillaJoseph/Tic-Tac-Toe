const board = document.getElementById('board');
const status = document.getElementById('status');
const resetButton = document.getElementById('reset');
const scoreDisplay = document.getElementById('score');
const modeSelect = document.getElementById('mode');
const difficultySelector = document.getElementById('difficulty-selector'); // Fixed reference to difficultySelector

let currentPlayer = 'X';
let gameBoard = [];
let score = { X: 0, O: 0 };
let xCharacter = 'X'; // Default character for X
let oCharacter = 'O'; // Default character for O
let gameMode = 'friend'; // default mode
let winningCombination = [];

// Event Listeners
modeSelect.addEventListener('change', () => {
    gameMode = modeSelect.value;
    if (gameMode === 'computer') {
        difficultySelector.style.display = 'block';
    } else {
        difficultySelector.style.display = 'none';
    }
    resetGame();
});

// Function to initialize the game board with a fixed 3x3 grid
function initializeBoard() {
    board.innerHTML = '';
    const totalCells = 9; // Fixed 3x3 grid
    gameBoard = Array(totalCells).fill(null); // Reset the game board

    // Set the grid size to 3x3
    board.classList.remove('board-5x5');
    board.classList.add('board-3x3');

    // Create cells for the board
    for (let i = 0; i < totalCells; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        board.appendChild(cell);
    }

    board.addEventListener('click', handleClick);
    updateStatus();
}

// Check for a winner
function checkWinner() {
    const winLength = 3; // Fixed to 3 for 3x3 grid
    const winningCombos = generateWinningCombos(winLength);

    for (let [a, b, c] of winningCombos) {
        if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
            winningCombination = [a, b, c];
            return gameBoard[a];
        }
    }

    return gameBoard.includes(null) ? null : 'Tie';
}

// Generate winning combinations for a 3x3 grid
function generateWinningCombos(winLength) {
    let combos = [];

    // Horizontal combinations
    for (let row = 0; row < 3; row++) {
        let rowStart = row * 3;
        combos.push([rowStart, rowStart + 1, rowStart + 2]);
    }

    // Vertical combinations
    for (let col = 0; col < 3; col++) {
        combos.push([col, col + 3, col + 6]);
    }

    // Diagonal combinations
    combos.push([0, 4, 8]);
    combos.push([2, 4, 6]);

    return combos;
}

// Handle cell click event
function handleClick(event) {
    const index = Array.from(board.children).indexOf(event.target);
    if (gameBoard[index] || !event.target.classList.contains('cell')) {
        return;
    }

    gameBoard[index] = currentPlayer === 'X' ? xCharacter : oCharacter;
    event.target.textContent = gameBoard[index];

    const winner = checkWinner();
    if (winner) {
        if (winner === 'Tie') {
            status.textContent = "It's a Tie!";
        } else {
            status.textContent = `${winner} wins!`;
            score[winner]++;
            updateScore();
            highlightWinningCells();
        }
        board.removeEventListener('click', handleClick);
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';

    // If playing against the computer
    if (gameMode === 'computer' && currentPlayer === 'O') {
        aiMove();
    } else {
        updateStatus();
    }
}

// Highlight the winning cells
function highlightWinningCells() {
    winningCombination.forEach((index) => {
        const cell = board.children[index];
        cell.classList.add('winning-cell');
    });
    status.classList.add('win-animation');
    setTimeout(() => {
        status.classList.remove('win-animation');
    }, 1000);
}

// AI Strategies
function aiMove() {
    const availableMoves = gameBoard.map((val, index) => (val === null ? index : null)).filter(val => val !== null);
    let move;

    // Handle AI move depending on the selected difficulty
    if (difficultySelector.value === 'easy') {
        move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    } else if (difficultySelector.value === 'medium') {
        move = mediumAI(availableMoves);
    } else {
        move = hardAI(availableMoves);
    }

    if (move !== undefined) {
        gameBoard[move] = oCharacter;
        board.children[move].textContent = oCharacter;

        const winner = checkWinner();
        if (winner) {
            if (winner === 'Tie') {
                status.textContent = "It's a Tie!";
            } else {
                status.textContent = `${winner} wins!`;
                score[winner]++;
                updateScore();
                highlightWinningCells();
            }
            board.removeEventListener('click', handleClick);
            return;
        }

        currentPlayer = 'X';
        updateStatus();
    }
}

// AI Strategies
function mediumAI(availableMoves) {
    // Check if the AI can win
    for (let move of availableMoves) {
        gameBoard[move] = oCharacter;
        if (checkWinner() === oCharacter) {
            gameBoard[move] = null;
            return move;
        }
        gameBoard[move] = null;
    }

    // Block player's winning move
    for (let move of availableMoves) {
        gameBoard[move] = xCharacter;
        if (checkWinner() === xCharacter) {
            gameBoard[move] = null;
            return move;
        }
        gameBoard[move] = null;
    }

    // Random move if no win/block needed
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

function hardAI(availableMoves) {
    let bestScore = -Infinity;
    let bestMove;

    for (let move of availableMoves) {
        gameBoard[move] = oCharacter;
        let score = minimax(gameBoard, 0, false);
        gameBoard[move] = null;

        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }
    return bestMove;
}

function minimax(board, depth, isMaximizing) {
    const winner = checkWinner();
    if (winner === oCharacter) return 10 - depth;
    if (winner === xCharacter) return depth - 10;
    if (winner === 'Tie') return 0;

    if (isMaximizing) {
        let maxEval = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === null) {
                board[i] = oCharacter;
                let eval = minimax(board, depth + 1, false);
                board[i] = null;
                maxEval = Math.max(maxEval, eval);
            }
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === null) {
                board[i] = xCharacter;
                let eval = minimax(board, depth + 1, true);
                board[i] = null;
                minEval = Math.min(minEval, eval);
            }
        }
        return minEval;
    }
}

// Update score display
function updateScore() {
    scoreDisplay.textContent = `Score - ${xCharacter}: ${score.X} | ${oCharacter}: ${score.O}`;
}

// Update status text
function updateStatus() {
    status.textContent = `Player ${currentPlayer === 'X' ? xCharacter : oCharacter}'s turn!`;
}

// Reset the game
function resetGame() {
    gameBoard = Array(9).fill(null); // Fixed 3x3 grid
    currentPlayer = 'X';
    winningCombination = [];
    updateStatus();
    initializeBoard();
    updateScore();
}

// Initialize the game
initializeBoard();
resetButton.addEventListener('click', resetGame);
