(function() {
    'use strict';

    let currentScore = 0;
    let currentRound = 1;
    const maxRounds = 10;
    let isCurrentAI = false;
    let isWaiting = false;
    let playerName = "guest";
    
    let timerInterval;
    let timeLeft = 10;

    const imgElement = document.getElementById('main-image');
    const spinner = document.getElementById('loading-spinner');
    const cardContainer = document.getElementById('main-card');
    const timerBar = document.getElementById('timer-bar');

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    function playTone(freq, type, duration, vol=0.1) {
        if(audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type; osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(vol, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(); osc.stop(audioCtx.currentTime + duration);
    }

    const sounds = {
        click: () => playTone(600, 'sine', 0.1, 0.05),
        correct: () => { playTone(800, 'sine', 0.1); setTimeout(() => playTone(1200, 'sine', 0.15), 100); },
        wrong: () => { playTone(300, 'sawtooth', 0.2, 0.1); setTimeout(() => playTone(200, 'sawtooth', 0.3, 0.1), 150); },
        win: () => { [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => setTimeout(() => playTone(f, 'square', 0.2, 0.1), i*150)); }
    };

    const realPhotoIDs = "1507003211169-0a1dd7228f2d,1500648767791-00dcc994a43e,1472099645785-5658abf4ff4e,1506794778202-cad84cf45f1d,1527980965255-d3b416303d12,1504257432389-52343af06ae3,1463453091185-61582044d556,1552058544-f2b08422138a,1494790108377-be9c29b29330,1534528741775-53994a69daeb,1531746020798-e6953c6e8e04,1544005313-94ddf0286df2,1517841905240-472988babdf9,1524504388940-b1c1722653e1,1438761681033-6461ffad8d80,1544725176-7c40e5a71c5e,1580489944761-15a19d654956,1554151228-14d9def656e4,1488426862026-3ee34a7d66df,1548142813-c348350df52b,1508214751196-bcfd4ca60f91,1529626455594-4ff0802cfb7e,1499996865611-e408544d93ee,1546961329-78bef0414d7c,1513956589380-bad6acb9b9d4,1522075469751-3a6694fb2f61,1542909168-82c3e7fdca5c,1503443205850-c08e3182081c,1530268729831-4b0b9e170218,1545167622-3a6ac756afa4,1513252771233-aeb896173bc5,1521119989659-a83eee488004,1558222218-b7b54eede3f3,1535713875002-d1d0cf377fde,1509967419530-da38b4704bc0,1541647376-17ddecd16362,1520813792240-56fc4a3765a7,1508280756091-9dcfa2ceb10c,1544348817-5f2cf14b88c8,1502378735452-1981a8c08c4e".split(',');
    
    let activeRealQueue = [];

    function shuffleArray(array) {
        return array.sort(() => Math.random() - 0.5);
    }

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
        timerBar.classList.toggle('warning', timeLeft <= 3);
    }

    function getRandomImage() {
        isWaiting = true;
        
        imgElement.classList.remove('loaded');
        imgElement.src = ""; 
        cardContainer.classList.remove('correct', 'wrong', 'shake');
        
        clearInterval(timerInterval);
        timerBar.style.width = '100%';
        timerBar.classList.remove('warning');

        isCurrentAI = Math.random() > 0.5;
        let url = "";

        if (isCurrentAI) {
            url = `https://thispersondoesnotexist.com/?v=${new Date().getTime()}_${Math.random()}`;
        } else {
            if (activeRealQueue.length === 0) {
                activeRealQueue = shuffleArray([...realPhotoIDs]);
            }
            const id = activeRealQueue.pop(); 
            url = `https://images.unsplash.com/photo-${id}?w=600&h=600&fit=crop&q=80`;
        }

        imgElement.src = url;
    }

    imgElement.onload = () => {
        if (!imgElement.src || imgElement.src === window.location.href) return; 
        imgElement.classList.add('loaded');
        isWaiting = false;
        startTimer();
    };

    imgElement.onerror = () => {
        isCurrentAI = false;
        if (activeRealQueue.length === 0) activeRealQueue = shuffleArray([...realPhotoIDs]);
        imgElement.src = `https://images.unsplash.com/photo-${activeRealQueue.pop()}?w=600&h=600&fit=crop&q=80`;
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

    document.querySelectorAll('button').forEach(btn => btn.addEventListener('mousedown', sounds.click));

    document.getElementById('btn-ai').onclick = () => handleGuess(true);
    document.getElementById('btn-human').onclick = () => handleGuess(false);

    document.getElementById('btn-start').onclick = () => {
        const inputVal = document.getElementById('nickname-input').value.trim();
        playerName = inputVal !== "" ? inputVal : "guest";

        document.getElementById('menu').classList.remove('active');
        document.getElementById('menu').classList.add('hidden');
        document.getElementById('ui-top').classList.remove('hidden');
        document.getElementById('gameplay').classList.remove('hidden');
        
        currentScore = 0; currentRound = 1; 
        document.getElementById('score-val').innerText = "0";
        document.getElementById('round-val').innerText = "1";
        
        if(audioCtx.state === 'suspended') audioCtx.resume();
        
        activeRealQueue = shuffleArray([...realPhotoIDs]);
        getRandomImage();
    };

    function endGame() {
        document.getElementById('gameplay').classList.add('hidden');
        document.getElementById('ui-top').classList.add('hidden');
        document.getElementById('game-over').classList.remove('hidden');
        
        document.getElementById('end-player-name').innerText = playerName;
        document.getElementById('final-score').innerText = currentScore;

        const feedback = document.getElementById('feedback-message');
        if (currentScore === 10) {
            feedback.innerText = "flawless! you are a machine yourself.";
            feedback.style.color = "#00ff00";
            sounds.win(); triggerConfetti();
        } else if (currentScore >= 7) {
            feedback.innerText = "impressive biological sensors.";
            feedback.style.color = "#00ffff";
            sounds.win(); triggerConfetti();
        } else if (currentScore >= 4) {
            feedback.innerText = "not bad, but the ai is getting smarter.";
            feedback.style.color = "#ffaa00";
        } else {
            feedback.innerText = "you've been deceived by the matrix.";
            feedback.style.color = "#ff0055";
        }

        generateBanner(currentScore, playerName);
    }

    function triggerConfetti() {
        let duration = 3 * 1000;
        let end = Date.now() + duration;
        let colors = ['#00ffff', '#ff00ff'];

        (function frame() {
            confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: colors });
            confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: colors });
            if (Date.now() < end) requestAnimationFrame(frame);
        }());
    }

    document.getElementById('btn-restart').onclick = () => {
        document.getElementById('game-over').classList.add('hidden');
        document.getElementById('menu').classList.remove('hidden');
        document.getElementById('menu').classList.add('active');
    };

    function generateBanner(score, player) {
        const canvas = document.getElementById('share-canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = 'banner-template.png'; 
        
        img.onload = () => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            ctx.textAlign = 'center';
            
            ctx.fillStyle = '#ffffff'; 
            
            ctx.font = 'bold 50px Orbitron, sans-serif';
            ctx.fillText(player, canvas.width / 2, canvas.height / 2 - 80);
            
            ctx.font = '900 100px Orbitron, sans-serif';
            ctx.fillText(`result: ${score}/10`, canvas.width / 2, canvas.height / 2 + 20);

            ctx.font = '400 35px Orbitron, sans-serif';
            ctx.fillText(`test your skills in ai or real`, canvas.width / 2, canvas.height / 2 + 120);

            ctx.font = '300 25px Orbitron, sans-serif';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'; 
            ctx.fillText(`created by hawk with love for perle community`, canvas.width / 2, canvas.height - 40);
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
        const text = `${currentScore}/10! this is my level of recognizing ai generation.\n\n➤ this challenge was developed by @hawk_tyt exclusively for perle labs.\nit's cool to be part of the @perlelabs community, exploring digital horizons.\ntest your skills and share your result:\n➤ https://alekshawk.github.io/ai-or-real/\n\n#perlecommunity #perlelabs`;
        const encodedText = encodeURIComponent(text);
        window.open(`https://twitter.com/intent/tweet?text=${encodedText}`, '_blank');
    };
})();
