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

// масив з якісними фотографіями справжніх людей
const realFaces = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&h=500&fit=crop",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&h=500&fit=crop",
    "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&h=500&fit=crop",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&h=500&fit=crop",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=500&fit=crop",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&h=500&fit=crop",
    "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=500&h=500&fit=crop",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&h=500&fit=crop",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&h=500&fit=crop",
    "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=500&h=500&fit=crop",
    "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=500&h=500&fit=crop",
    "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=500&h=500&fit=crop",
    "https://images.unsplash.com/photo-1548142813-c348350df52b?w=500&h=500&fit=crop",
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&h=500&fit=crop"
];

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
        // вибираємо випадкове якісне фото з нашого масиву
        const randomIndex = Math.floor(Math.random() * realFaces.length);
        url = realFaces[randomIndex];
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
