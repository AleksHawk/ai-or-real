(function() {
    'use strict';

    let currentScore = 0;
    let currentRound = 1;
    const maxRounds = 10;
    let isCurrentAI = false;
    let isWaiting = false;

    const imgElement = document.getElementById('main-image');
    const spinner = document.getElementById('loading-spinner');
    const cardContainer = document.querySelector('.card-container');

    // РОЗШИРЕНА БАЗА ФОТО (х4)
    const realFaces = [
        // Men
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1463453091185-61582044d556?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=600&h=600&fit=crop",
        // Women
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1548142813-c348350df52b?w=600&h=600&fit=crop"
    ];

    function getRandomImage() {
        isWaiting = true;
        imgElement.style.display = 'none';
        spinner.style.display = 'block';
        cardContainer.classList.remove('correct', 'wrong');

        isCurrentAI = Math.random() > 0.5;
        let url = "";

        if (isCurrentAI) {
            // Генеруємо абсолютно випадкове AI обличчя
            url = `https://thispersondoesnotexist.com/?v=${Math.random()}`;
        } else {
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

    imgElement.onerror = () => getRandomImage();

    function handleGuess(guessedAI) {
        if (isWaiting) return;
        isWaiting = true;

        const isCorrect = guessedAI === isCurrentAI;
        if (isCorrect) {
            currentScore++;
            cardContainer.classList.add('correct');
        } else {
            cardContainer.classList.add('wrong');
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
        }, 1000);
    }

    document.getElementById('btn-ai').onclick = () => handleGuess(true);
    document.getElementById('btn-human').onclick = () => handleGuess(false);

    document.getElementById('btn-start').onclick = () => {
        document.getElementById('menu').classList.remove('active');
        document.getElementById('menu').classList.add('hidden');
        document.getElementById('gameplay').classList.remove('hidden');
        currentScore = 0; currentRound = 1;
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
        const txt = encodeURIComponent(`i spotted ${currentScore}/10 fake faces in the AI or Real challenge! 🤖🎨\n\ncan you beat me? play here: https://alekshawk.github.io/ai-or-real/`);
        window.open(`https://twitter.com/intent/tweet?text=${txt}`, '_blank');
    };
})();
