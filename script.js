const firebaseConfig = {
    apiKey: "AIzaSyBF9qulhD2vkXaVvFWCP9yUypIu3xJLmto",
    authDomain: "seismic-run-8368a.firebaseapp.com",
    databaseURL: "https://seismic-run-8368a-default-rtdb.firebaseio.com",
    projectId: "seismic-run-8368a",
    storageBucket: "seismic-run-8368a.firebasestorage.app",
    messagingSenderId: "818412955795",
    appId: "1:818412955795:web:dd98ced7ff8ec95a330566"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let currentScore = 0;
let currentRound = 1;
const maxRounds = 10;
let isCurrentAI = false;
let playerName = "";
let isWaiting = false;

const imgElement = document.getElementById('main-image');
const spinner = document.getElementById('loading-spinner');
const feedback = document.getElementById('feedback-overlay');
const cardContainer = document.querySelector('.card-container');

function loadLeaderboard() {
    db.ref('ai_leaderboard').orderByChild('score').limitToLast(5).on('value', (snapshot) => {
        const lbList = document.getElementById('lb-list');
        if (snapshot.exists()) {
            let players = [];
            snapshot.forEach((child) => players.push({ name: child.key, score: child.val().score }));
            players.reverse();
            lbList.innerHTML = ''; 
            players.forEach((p, i) => {
                lbList.innerHTML += `<div class="lb-row"><span class="lb-rank">#${i+1}</span><span class="lb-name">${p.name}</span><span class="lb-score">${p.score}</span></div>`;
            });
        } else {
            lbList.innerHTML = '<div class="lb-wait">no records yet</div>';
        }
    });
}
loadLeaderboard();

function getRandomImage() {
    isWaiting = true;
    imgElement.style.display = 'none';
    spinner.style.display = 'block';
    feedback.style.display = 'none';
    cardContainer.classList.remove('correct', 'wrong');

    isCurrentAI = Math.random() > 0.5;
    
    let url = "";
    if (isCurrentAI) {
        url = "https://thispersondoesnotexist.com/?v=" + new Date().getTime();
    } else {
        let gender = Math.random() > 0.5 ? "men" : "women";
        let id = Math.floor(Math.random() * 99);
        url = `https://randomuser.me/api/portraits/${gender}/${id}.jpg`;
    }

    imgElement.src = url;
}

imgElement.onload = () => {
    spinner.style.display = 'none';
    imgElement.style.display = 'block';
    isWaiting = false;
};

imgElement.onerror = () => {
    getRandomImage();
};

function handleGuess(guessedAI) {
    if (isWaiting) return;
    isWaiting = true;

    const isCorrect = guessedAI === isCurrentAI;
    if (isCorrect) currentScore++;
    
    document.getElementById('score-val').innerText = currentScore;
    cardContainer.classList.add(isCorrect ? 'correct' : 'wrong');

    setTimeout(() => {
        currentRound++;
        if (currentRound > maxRounds) {
            endGame();
        } else {
            document.getElementById('round-val').innerText = currentRound;
            getRandomImage();
        }
    }, 800);
}

document.getElementById('btn-ai').onclick = () => handleGuess(true);
document.getElementById('btn-human').onclick = () => handleGuess(false);

document.getElementById('btn-start').onclick = () => {
    const input = document.getElementById('player-name').value.trim();
    if (input) {
        playerName = input;
        document.getElementById('menu').classList.remove('active');
        document.getElementById('menu').classList.add('hidden');
        document.getElementById('gameplay').classList.remove('hidden');
        currentScore = 0; currentRound = 1;
        document.getElementById('score-val').innerText = currentScore;
        document.getElementById('round-val').innerText = currentRound;
        getRandomImage();
    }
};

function endGame() {
    document.getElementById('gameplay').classList.add('hidden');
    document.getElementById('game-over').classList.remove('hidden');
    document.getElementById('game-over').classList.add('active');
    document.getElementById('final-score').innerText = currentScore;

    const userRef = db.ref('ai_leaderboard/' + playerName);
    userRef.once('value').then((snapshot) => {
        const oldScore = snapshot.val() ? snapshot.val().score : -1;
        if (currentScore > oldScore) userRef.set({ score: currentScore });
    });
}

document.getElementById('btn-restart').onclick = () => {
    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('game-over').classList.remove('active');
    document.getElementById('menu').classList.remove('hidden');
    document.getElementById('menu').classList.add('active');
};

document.getElementById('btn-x').onclick = () => {
    const txt = encodeURIComponent(`i scored ${currentScore}/10 in the "ai or real" challenge! 🤖\ncan you spot the fake?\n\nplay here: https://alekshawk.github.io/ai-or-real/`);
    window.open(`https://twitter.com/intent/tweet?text=${txt}`, '_blank');
};
