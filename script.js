const gameBoard = document.getElementById("game-board");
const selection = document.getElementById("selection");
const gameArea = document.getElementById("game-area");

let emojiSets = [
    ["🎉", "🍄", "🥗", "🍕", "🍔", "🍟", "🍩", "🙈", "🍝", "❤️", "🥬", "🍿", "🍰", "🍫", "🤡", "🍳", "🫐", "🥝", "🥑", "🍆"],
    ["🦊", "🐸", "🐼", "🦁", "🐵", "🦋", "🐢", "🦄", "🐙", "🦁", "🐰", "🦉", "🐸", "🦈", "🦜", "🐶", "🐱", "🐭", "🐹", "🦔"],
    ["⚽", "🏀", "🎾", "🏐", "🏓", "⚾", "🥊", "🎯", "🏹", "⛳", "🎿", "🏊", "🚴", "🏋️", "🤸", "⛷️", "🏂", "🏄", "🤺", "🥌"],
    ["🌟", "🌙", "🌈", "☀️", "🌺", "🌸", "🌻", "🌼", "🍀", "🌲", "🌳", "🌴", "🌵", "🎄", "🌾", "🌿", "☘️", "🍁", "🍃", "🍂"],
    ["🔴", "🔵", "🟢", "🟡", "🟠", "🟣", "⚫", "⚪", "🟤", "🔶", "🔷", "🔸", "🔹", "🔺", "🔻", "💎", "💠", "🔘", "🔳", "🔲"]
];

let cards = [];
let flippedCards = [];
let scores = [0, 0, 0, 0, 0, 0, 0];
let currentPlayer = 0;
let numberOfPlayers = 2;
let moveCount = 0;
let timerInterval = null;
let seconds = 0;
let gameStarted = false;

document.querySelectorAll('.player-btn').forEach(function(button) {
    button.addEventListener('click', function() {
        const players = parseInt(this.getAttribute('data-players'));
        startGame(players);
    });
});

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function createCardsForGame() {
    let randomSet = emojiSets[Math.floor(Math.random() * emojiSets.length)];
    cards = [];
    for (let i = 0; i < 20; i++) {
        cards.push(randomSet[i]);
        cards.push(randomSet[i]);
    }
}

function shuffleCards() {
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
}

function createGameBoard() {
    gameBoard.innerHTML = "";
    createCardsForGame();
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

function updatePlayerDisplay() {
    let html = '<p id="player">Spieler ' + (currentPlayer + 1) + ' ist dran</p>';
    
    for (let i = 0; i < numberOfPlayers; i++) {
        html += '<p>Punkte Spieler ' + (i + 1) + ': <span id="score' + i + '">' + scores[i] + '</span></p>';
    }
    
    document.getElementById("player-info").innerHTML = html;
}

function startGame(players) {
    numberOfPlayers = players;
    scores = [0, 0, 0, 0, 0, 0, 0];
    currentPlayer = 0;
    moveCount = 0;
    seconds = 0;
    gameStarted = false;
    flippedCards = [];
    
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    document.getElementById("timer").textContent = "00:00";
    document.getElementById("moves").textContent = "Zuege: 0";
    document.getElementById("winner").style.display = "none";
    document.getElementById("winner").textContent = "";
    document.getElementById("restart-btn").style.display = "none";
    
    selection.style.display = "none";
    gameArea.style.display = "block";
    
    updatePlayerDisplay();
    createGameBoard();
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
        document.getElementById("moves").textContent = "Zuege: " + moveCount;
        setTimeout(checkMatch, 500);
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;

    if (card1.dataset.value === card2.dataset.value) {
        card1.classList.add("matched");
        card2.classList.add("matched");
        
        scores[currentPlayer]++;
        document.getElementById("score" + currentPlayer).textContent = scores[currentPlayer];

        let totalFound = 0;
        for (let i = 0; i < numberOfPlayers; i++) {
            totalFound += scores[i];
        }
        
        if (totalFound === 20) {
            stopTimer();
            
            let maxScore = 0;
            for (let i = 0; i < numberOfPlayers; i++) {
                if (scores[i] > maxScore) {
                    maxScore = scores[i];
                }
            }
            
            let winners = [];
            for (let i = 0; i < numberOfPlayers; i++) {
                if (scores[i] === maxScore) {
                    winners.push(i + 1);
                }
            }
            
            let resultText = "";
            if (winners.length === 1) {
                resultText = "Spieler " + winners[0] + " gewinnt!";
            } else {
                resultText = "Unentschieden zwischen: " + winners.join(", ");
            }
            
            document.getElementById("winner").textContent = resultText;
            document.getElementById("winner").style.display = "block";
            document.getElementById("restart-btn").style.display = "inline-block";
            
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
        
        currentPlayer++;
        if (currentPlayer >= numberOfPlayers) {
            currentPlayer = 0;
        }
        
        updatePlayerDisplay();
    }

    flippedCards = [];
}

document.getElementById("restart-btn").addEventListener("click", function() {
    selection.style.display = "block";
    gameArea.style.display = "none";
});
