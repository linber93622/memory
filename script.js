const gameBoard = document.getElementById("game-board");
const selection = document.getElementById("selection");
const gameArea = document.getElementById("game-area");
const highscoreArea = document.getElementById("highscore-area");

let emojiSets = [
    ["🎉", "🍄", "🥗", "🍕", "🍔", "🍟", "🍩", "🙈", "🍝", "❤️", "🥬", "🍿", "🍰", "🍫", "🤡", "🍳", "🫐", "🥝", "🥑", "🍆"],
    ["🦊", "🐸", "🐼", "🦁", "🐵", "🦋", "🐢", "🦄", "🐙", "🐰", "🦉", "🦈", "🦜", "🐶", "🐱", "🐭", "🐹", "🦔", "🐻", "🦩"],
    ["⚽", "🏀", "🎾", "🏐", "🏓", "⚾", "🥊", "🎯", "🏹", "⛳", "🎿", "🏊", "🚴", "🏋️", "🤸", "⛷️", "🏂", "🏄", "🤺", "🥌"],
    ["🌟", "🌙", "🌈", "☀️", "🌺", "🌸", "🌻", "🌼", "🍀", "🌲", "🌳", "🌴", "🌵", "🎄", "🌾", "🌿", "☘️", "🍁", "🍃", "🍂"],
    ["🔴", "🔵", "🟢", "🟡", "🟠", "🟣", "⚫", "⚪", "🟤", "🔶", "🔷", "🔸", "🔹", "🔺", "🔻", "💎", "💠", "🔘", "🔳", "🔲"]
];

let cards = [];
let flippedCards = [];
let scores = [0, 0, 0, 0, 0, 0, 0];
let playerMoves = [0, 0, 0, 0, 0, 0, 0];
let playerNames = [];
let currentPlayer = 0;
let numberOfPlayers = 2;
let moveCount = 0;
let timerInterval = null;
let seconds = 0;
let gameStarted = false;

document.querySelectorAll('.player-btn').forEach(function(button) {
    button.addEventListener('click', function() {
        const players = parseInt(this.getAttribute('data-players'));
        showNameInput(players);
    });
});

document.getElementById('start-game-btn').addEventListener('click', function() {
    const nameInputs = document.querySelectorAll('.name-input');
    playerNames = [];
    nameInputs.forEach(function(input) {
        let name = input.value.trim();
        if (name === "") {
            name = "Spieler " + (playerNames.length + 1);
        }
        playerNames.push(name);
    });
    startGame();
});

document.getElementById('show-selection-btn').addEventListener('click', function() {
    highscoreArea.style.display = 'none';
    document.getElementById('name-input').style.display = 'none';
    selection.style.display = 'block';
});

document.getElementById('reset-highscore-btn').addEventListener('click', function() {
    if (confirm('Highscore wirklich loeschen?')) {
        localStorage.removeItem('memoryHighscores');
        displayHighscores();
    }
});

function getHighscores() {
    let highscores = localStorage.getItem('memoryHighscores');
    if (highscores) {
        return JSON.parse(highscores);
    }
    return [];
}

function saveHighscore(moves, time) {
    let highscores = getHighscores();
    highscores.push({ 
        moves: moves, 
        time: time,
        players: playerNames.slice(0, numberOfPlayers)
    });
    highscores.sort(function(a, b) { return a.moves - b.moves; });
    highscores = highscores.slice(0, 10);
    localStorage.setItem('memoryHighscores', JSON.stringify(highscores));
}

function displayHighscores() {
    let highscores = getHighscores();
    let list = document.getElementById('highscore-list');
    list.innerHTML = '';
    
    if (highscores.length === 0) {
        list.innerHTML = '<li>Noch keine Highscores!</li>';
        return;
    }
    
    for (let i = 0; i < highscores.length; i++) {
        let entry = highscores[i];
        let li = document.createElement('li');
        let playersStr = entry.players ? entry.players.join(', ') : '';
        li.textContent = (i + 1) + '. Platz: ' + entry.moves + ' Zuege (' + entry.time + 's) - ' + playersStr;
        list.appendChild(li);
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
    let html = '<p id="player">' + playerNames[currentPlayer] + ' ist dran</p>';
    html += '<div id="player-stats">';
    
    for (let i = 0; i < numberOfPlayers; i++) {
        let isCurrent = (i === currentPlayer) ? ' class="current-player"' : '';
        html += '<div' + isCurrent + '>';
        html += '<span class="player-name">' + playerNames[i] + '</span>';
        html += '<span class="stat"><span id="score' + i + '">' + scores[i] + '</span> Paare</span>';
        html += '<span class="stat"><span id="moves' + i + '">' + playerMoves[i] + '</span> Zuege</span>';
        html += '</div>';
    }
    html += '</div>';
    
    document.getElementById("player-info").innerHTML = html;
}

function startGame() {
    scores = [0, 0, 0, 0, 0, 0, 0];
    playerMoves = [0, 0, 0, 0, 0, 0, 0];
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
    document.getElementById("moves").textContent = "Gesamt Zuege: 0";
    document.getElementById("winner").style.display = "none";
    document.getElementById("winner").textContent = "";
    document.getElementById("restart-btn").style.display = "none";
    
    selection.style.display = "none";
    document.getElementById("name-input").style.display = "none";
    highscoreArea.style.display = "none";
    gameArea.style.display = "block";
    
    updatePlayerDisplay();
    createGameBoard();
}

function showNameInput(players) {
    numberOfPlayers = players;
    const nameFields = document.getElementById('name-fields');
    nameFields.innerHTML = '';
    
    for (let i = 0; i < players; i++) {
        let label = document.createElement('label');
        label.textContent = 'Spieler ' + (i + 1) + ': ';
        label.style.display = 'block';
        label.style.marginTop = '10px';
        
        let input = document.createElement('input');
        input.type = 'text';
        input.className = 'name-input';
        input.placeholder = 'Name eingeben';
        input.style.padding = '10px';
        input.style.fontSize = '16px';
        input.style.marginLeft = '10px';
        
        nameFields.appendChild(label);
        nameFields.appendChild(input);
    }
    
    selection.style.display = 'none';
    document.getElementById('name-input').style.display = 'block';
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
        playerMoves[currentPlayer]++;
        document.getElementById("moves").textContent = "Gesamt Zuege: " + moveCount;
        document.getElementById("moves" + currentPlayer).textContent = playerMoves[currentPlayer];
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
            saveHighscore(moveCount, seconds);
            
            let maxScore = 0;
            for (let i = 0; i < numberOfPlayers; i++) {
                if (scores[i] > maxScore) {
                    maxScore = scores[i];
                }
            }
            
            let winners = [];
            for (let i = 0; i < numberOfPlayers; i++) {
                if (scores[i] === maxScore) {
                    winners.push(playerNames[i]);
                }
            }
            
            let resultText = "";
            if (winners.length === 1) {
                resultText = winners[0] + " gewinnt!";
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
    displayHighscores();
    gameArea.style.display = "none";
    highscoreArea.style.display = "block";
});
