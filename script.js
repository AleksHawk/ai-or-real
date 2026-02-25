(function() {
    'use strict';

    let currentScore = 0;
    let currentRound = 1;
    const maxRounds = 10;
    let isCurrentAI = false;
    let isWaiting = false;
    let playerName = "guest";
    
    // Таймер
    let timerInterval;
    let timeLeft = 10;
    
    // Змінні для обробки помилок зображень
    let imageRetries = 0;
    const MAX_RETRIES = 3;

    const imgElement = document.getElementById('main-image');
    const spinner = document.getElementById('loading-spinner');
    const cardContainer = document.getElementById('main-card');
    const timerBar = document.getElementById('timer-bar');

    // Аудіо Контекст для генерації звуків "на льоту"
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    function playTone(freq, type, duration, vol=0.1) {
        if(audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type; 
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(vol, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
        osc.connect(gain); 
        gain.connect(audioCtx.destination);
        osc.start(); 
        osc.stop(audioCtx.currentTime + duration);
    }

    const sounds = {
        click: () => playTone(600, 'sine', 0.1, 0.05),
        correct: () => { playTone(800, 'sine', 0.1); setTimeout(() => playTone(1200, 'sine', 0.15), 100); },
        wrong: () => { playTone(300, 'sawtooth', 0.2, 0.1); setTimeout(() => playTone(200, 'sawtooth', 0.3, 0.1), 150); },
        win: () => { [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => setTimeout(() => playTone(f, 'square', 0.2, 0.1), i*150)); }
    };

    const realFaces = [
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80",
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&q=80",
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80",
        "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=600&q=80",
        "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=600&q=80",
        "https://images.unsplash.com/photo-1463453091185-61582044d556?w=600&q=80",
        "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=600&q=80",
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80",
        "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80",
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&q=80",
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&q=80",
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80",
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&q=80",
        "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=600&q=80",
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&q=80",
        "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=600&q=80",
        "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=600&q=80",
        "https://images.unsplash.com/photo-1548142813-c348350df52b?w=600&q=80"
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
                handleGuess(null);
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
            url = `https://thispersondoesnotexist.com/?v=${new Date().getTime()}_${Math.random()}`;
        } else {
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
        imageRetries = 0;
        spinner.style.display = 'none';
        imgElement.style.display = 'block';
        setTimeout(() => { imgElement.classList.add('loaded'); }, 50);
        isWaiting = false;
        startTimer();
    };

    imgElement.onerror = () => {
        imageRetries++;
        if (imageRetries >= MAX_RETRIES) {
            isCurrentAI = false;
            imgElement.src = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80"; 
            imageRetries = 0;
        } else {
            getRandomImage();
        }
    };

    function handleGuess(guessedAI) {
        if (isWaiting) return;
        isWaiting = true;
        clearInterval(timerInterval);

        let isCorrect = false;

        if (guessedAI === null) {
            sounds.wrong();
            cardContainer.classList.add('wrong', 'shake');
        } else {
            isCorrect = guessedAI === isCurrentAI;
            if (isCorrect) {
                currentScore++;
                sounds.correct();
            } else {
                sounds.wrong();
            }
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

    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('mousedown', sounds.click);
    });

    document.getElementById('btn-ai').onclick = () => handleGuess(true);
    document.getElementById('btn-human').onclick = () => handleGuess(false);

    document.getElementById('btn-start').onclick = () => {
        const inputVal = document.getElementById('nickname-input').value.trim();
        playerName = inputVal !== "" ? inputVal : "guest";

        document.getElementById('menu').classList.remove('active');
        document.getElementById('menu').classList.add('hidden');
        document.getElementById('ui-top').classList.remove('hidden');
        document.getElementById('gameplay').classList.remove('hidden');
        
        currentScore = 0; currentRound = 1; availableRealFaces = [...realFaces];
        document.getElementById('score-val').innerText = "0";
        document.getElementById('round-val').innerText = "1";
        
        if(audioCtx.state === 'suspended') audioCtx.resume();
        getRandomImage();
    };

    function endGame() {
        document.getElementById('gameplay').classList.add('hidden');
        document.getElementById('ui-top').classList.add('hidden');
        document.getElementById('game-over').classList.remove('hidden');
        
        document.getElementById('end-player-name').innerText = `operator: ${playerName}`;
        document.getElementById('final-score').innerText = currentScore;

        const feedback = document.getElementById('feedback-message');
        if (currentScore === 10) {
            feedback.innerText = "flawless! you are a machine yourself.";
            feedback.style.color = "#00ff00";
            sounds.win();
            triggerConfetti();
        } else if (currentScore >= 7) {
            feedback.innerText = "impressive biological sensors.";
            feedback.style.color = "#00ffff";
            sounds.win();
            triggerConfetti();
        } else if (currentScore >= 4) {
            feedback.innerText = "not bad, but the ai is getting smarter.";
            feedback.style.color = "#ffaa00";
        } else {
            feedback.innerText = "you've been deceived by the matrix.";
            feedback.style.color = "#ff0055";
        }

        // Малюємо банер
        generateBanner(currentScore, playerName);
    }

    function triggerConfetti() {
        let duration = 3 * 1000;
        let animationEnd = Date.now() + duration;
        let defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000, colors: ['#00ffff', '#ff00ff'] };

        function randomInRange(min, max) { return Math.random() * (max - min) + min; }

        let interval = setInterval(function() {
            let timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) { return clearInterval(interval); }
            let particleCount = 50 * (timeLeft / duration);
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);
    }

    document.getElementById('btn-restart').onclick = () => {
        document.getElementById('game-over').classList.add('hidden');
        document.getElementById('menu').classList.remove('hidden');
        document.getElementById('menu').classList.add('active');
    };

    // --- ГЕНЕРАЦІЯ ТА ЗАВАНТАЖЕННЯ БАНЕРА ---
    function generateBanner(score, player) {
        const canvas = document.getElementById('share-canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = 'banner-template.png'; // Твій файл у GitHub
        
        img.onload = () => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            ctx.textAlign = 'center';
            
            // Нікнейм
            ctx.fillStyle = '#00ffff'; 
            ctx.font = 'bold 50px Orbitron, sans-serif';
            ctx.fillText(`OPERATOR: ${player}`, canvas.width / 2, canvas.height / 2 - 20);
            
            // Рахунок
            ctx.fillStyle = '#ff00ff'; 
            ctx.font = '900 80px Orbitron, sans-serif';
            ctx.fillText(`SCORE: ${score}/10`, canvas.width / 2, canvas.height / 2 + 70);
        };
    }

    document.getElementById('btn-download').onclick = () => {
        const canvas = document.getElementById('share-canvas');
        const link = document.createElement('a');
        link.download = `perle-result-${playerName}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    document.getElementById('btn-x').onclick = () => {
        const txt = encodeURIComponent(`i spotted ${currentScore}/10 fake faces in the ai or real challenge! 🤖🎨\noperator: ${playerName}\n\ncan you beat me? play here: https://alekshawk.github.io/ai-or-real/`);
        window.open(`https://twitter.com/intent/tweet?text=${txt}`, '_blank');
    };
})();
