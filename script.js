(function() {
    'use strict';

    let currentScore = 0;
    let currentRound = 1;
    const maxRounds = 10;
    let isCurrentAI = false;
    let isWaiting = false;
    
    // змінні для таймера
    let timerInterval;
    let timeLeft = 10;

    const imgElement = document.getElementById('main-image');
    const spinner = document.getElementById('loading-spinner');
    const cardContainer = document.getElementById('main-card');
    const timerBar = document.getElementById('timer-bar');

    // оновлені посилання з правильними параметрами доступу (ixlib та q=80)
    const realFaces = [
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1527980965255-d3b416303d12?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1504257432389-52343af06ae3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1554151228-14d9def656e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1548142813-c348350df52b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    ];

    let availableRealFaces = [];

    function startTimer() {
        clearInterval(timerInterval);
        timeLeft = 10;
        updateTimerUI();
        
        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerUI();
            
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                handleGuess(null); // час вийшов
            }
        }, 1000);
    }

    function updateTimerUI() {
        timerBar.style.width = (timeLeft / 10) * 100 + '%';
        if (timeLeft <= 3) {
            timerBar.classList.add('warning');
        } else {
            timerBar.classList.remove('warning');
        }
    }

    function getRandomImage() {
        isWaiting = true;
        imgElement.classList.remove('loaded');
        setTimeout(() => { imgElement.style.display = 'none'; }, 300);
        spinner.style.display = 'block';
        cardContainer.classList.remove('correct', 'wrong', 'shake');
        
        clearInterval(timerInterval);
        timerBar.style.width = '100%';
        timerBar.classList.remove('warning');

        isCurrentAI = Math.random() > 0.5;
        let url = "";

        if (isCurrentAI) {
            url = `https://thispersondoesnotexist.com/?v=${new Date().getTime()}`;
        } else {
            // логіка неповторення фото
            if (availableRealFaces.length === 0) {
                availableRealFaces = [...realFaces]; 
            }
            const randomIndex = Math.floor(Math.random() * availableRealFaces.length);
            url = availableRealFaces[randomIndex];
            availableRealFaces.splice(randomIndex, 1);
        }

        imgElement.src = url;
    }

    imgElement.onload = () => {
        spinner.style.display = 'none';
        imgElement.style.display = 'block';
        setTimeout(() => { imgElement.classList.add('loaded'); }, 50);
        isWaiting = false;
        startTimer(); // запускаємо таймер тільки коли фото завантажилось
    };

    imgElement.onerror = () => getRandomImage();

    function handleGuess(guessedAI) {
        if (isWaiting) return;
        isWaiting = true;
        clearInterval(timerInterval);

        let isCorrect = false;

        if (guessedAI === null) {
            // гравець не встиг
            cardContainer.classList.add('wrong', 'shake');
        } else {
            isCorrect = guessedAI === isCurrentAI;
            if (isCorrect) currentScore++;
            cardContainer.classList.add(isCorrect ? 'correct' : 'wrong');
            if (!isCorrect) cardContainer.classList.add('shake');
        }
        
        document.getElementById('score-val').innerText = currentScore;

        setTimeout(() => {
            currentRound++;
            if (currentRound > maxRounds) {
                endGame();
            } else {
                document.getElementById('round-val').innerText = currentRound;
                getRandomImage();
            }
        }, 1200);
    }

    document.getElementById('btn-ai').onclick = () => handleGuess(true);
    document.getElementById('btn-human').onclick = () => handleGuess(false);

    document.getElementById('btn-start').onclick = () => {
        document.getElementById('menu').classList.remove('active');
        document.getElementById('menu').classList.add('hidden');
        document.getElementById('gameplay').classList.remove('hidden');
        currentScore = 0; currentRound = 1; availableRealFaces = [...realFaces];
        document.getElementById('score-val').innerText = "0";
        document.getElementById('round-val').innerText = "1";
        getRandomImage();
    };

    function endGame() {
        document.getElementById('gameplay').classList.add('hidden');
        document.getElementById('game-over').classList.remove('hidden');
        document.getElementById('final-score').innerText = currentScore;
    }

    document.getElementById('btn-restart').onclick = () => {
        document.getElementById('game-over').classList.add('hidden');
        document.getElementById('menu').classList.remove('hidden');
        document.getElementById('menu').classList.add('active');
    };

    document.getElementById('btn-x').onclick = () => {
        const txt = encodeURIComponent(`i spotted ${currentScore}/10 fake faces in the ai or real challenge! 🤖🎨\n\ncan you beat me? play here: https://alekshawk.github.io/ai-or-real/`);
        window.open(`https://twitter.com/intent/tweet?text=${txt}`, '_blank');
    };
})();
