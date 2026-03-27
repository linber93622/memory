const gameBoard = document.getElementById("game-board");

let cards = [
    "🎉", "🎉", "🍄‍🟫", "🍄‍🟫", "🥗", "🥗", "🍕", "🍕", "🍔", "🍔",
    "🍟", "🍟", "🍩", "🍩", "🙈", "🙈", "🍝", "🍝", "❤️", "❤️",
    "🥬", "🥬", "🍿", "🍿", "🍰", "🍰", "🍫", "🍫", "🤡", "🤡",
    "🍳", "🍳", "🫐", "🫐", "🥝", "🥝", "🥑", "🥑", "🍆", "🍆"
];

let flippedCards = [];
let player1Score = 0;
let player2Score = 0;
let currentPlayer = 1;
let moveCount = 0;
let timerInterval = null;
let seconds = 0;
let gameStarted = false;

function shuffleCards() {
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
}

function createGameBoard() {
    gameBoard.innerHTML = "";
    shuffleCards();

    cards.forEach((value, index) => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.textContent = "";
        card.dataset.value = value;
        card.dataset.index = index;
        card.addEventListener("click", onCardClick);
        gameBoard.appendChild(card);
    });
}

function startTimer() {
    if (!gameStarted) {
        gameStarted = true;
        timerInterval = setInterval(function() {
            seconds++;
            let mins = Math.floor(seconds / 60);
            let secs = seconds % 60;
            if (mins < 10) mins = "0" + mins;
            if (secs < 10) secs = "0" + secs;
            document.getElementById("timer").textContent = mins + ":" + secs;
        }, 1000);
    }
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

function onCardClick(event) {
    const card = event.currentTarget;

    if (card.classList.contains("flipped") || 
        card.classList.contains("matched") ||
        flippedCards.length === 2) {
        return;
    }

    startTimer();

    card.classList.add("flipped");
    card.textContent = card.dataset.value;
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        moveCount++;
        document.getElementById("moves").textContent = "Züge: " + moveCount;
        setTimeout(checkMatch, 500);
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;

    if (card1.dataset.value === card2.dataset.value) {
        card1.classList.add("matched");
        card2.classList.add("matched");
        
        if (currentPlayer === 1) {
            player1Score++;
            document.getElementById("score1").textContent = player1Score;
        } else {
            player2Score++;
            document.getElementById("score2").textContent = player2Score;
        }

        if (player1Score + player2Score === 20) {
            stopTimer();
            
            let resultText = ""; 
            if (player1Score > player2Score) {
                resultText = "Spieler 1 gewinnt!";
            } else if (player2Score > player1Score) {
                resultText = "Spieler 2 gewinnt!";
            } else {
                resultText = "Unentschieden!";
            }
            
            document.getElementById("winner").textContent = resultText;
            document.getElementById("winner").style.display = "block";
            document.getElementById("restart-container").style.display = "block";
            
            let jsConfetti = new JSConfetti();
            jsConfetti.addConfetti({
                confettiColors: ['#ff0a54', '#ff477e', '#ff7096', '#ff85a1', '#fbb1bd', '#4CAF50'],
                confettiGravity: 0.2,
                step: 7,
            });
        }
    } else {
        card1.classList.remove("flipped");
        card2.classList.remove("flipped");
        card1.textContent = "";
        card2.textContent = "";
        
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        document.getElementById("player").textContent = "Spieler " + currentPlayer + " ist dran";
    }

    flippedCards = [];
}

document.getElementById("restart-btn").addEventListener("click", function() {
    player1Score = 0;
    player2Score = 0;
    currentPlayer = 1;
    moveCount = 0;
    flippedCards = [];
    seconds = 0;
    gameStarted = false;
    stopTimer();
    
    document.getElementById("score1").textContent = "0";
    document.getElementById("score2").textContent = "0";
    document.getElementById("player").textContent = "Spieler 1 ist dran";
    document.getElementById("moves").textContent = "Züge: 0";
    document.getElementById("winner").style.display = "none";
    document.getElementById("restart-container").style.display = "none";
    document.getElementById("timer").textContent = "00:00";
    
    createGameBoard();
});

document.getElementById("winner").style.display = "none";
document.getElementById("restart-container").style.display = "none";

createGameBoard();
