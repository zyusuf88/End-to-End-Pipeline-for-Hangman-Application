document.addEventListener('DOMContentLoaded', () => {
    const wordList = ['kiwi', 'grape', 'mango', 'apple', 'plum', 'peach', 'guava'];
    const numLives = 5;
    let word, wordGuessed, numLetters, numLivesLeft, listOfGuesses;

    function chooseRandomWord() {
        return wordList[Math.floor(Math.random() * wordList.length)];
    }

    function initializeGame() {
        word = chooseRandomWord();
        wordGuessed = Array(word.length).fill('_');
        numLetters = new Set(word).size;
        numLivesLeft = numLives;
        listOfGuesses = [];
        updateDisplay();
        showMessage("");
    }

    function checkGuess(guess) {
        guess = guess.toLowerCase();
        if (listOfGuesses.includes(guess)) {
            showMessage(`You've already tried the letter '${guess}'.`);
        } else {
            listOfGuesses.push(guess);
            if (word.includes(guess)) {
                showMessage(`Good guess! ${guess} is in the word.`);
                for (let i = 0; i < word.length; i++) {
                    if (word[i] === guess) {
                        wordGuessed[i] = guess;
                    }
                }
                numLetters--;
                if (numLetters === 0) {
                    showMessage(`Congratulations! You've guessed the word: ${word}`, true);
                }
            } else {
                numLivesLeft--;
                updateHangman();
                showMessage(`Sorry, ${guess} is not in the word.`);
                if (numLivesLeft === 0) {
                    showMessage(`Oh no! You've run out of lives. The word was: ${word}`, true);
                }
            }
            updateDisplay();
        }
    }

    function showMessage(message, isFinal = false) {
        const messageElement = document.getElementById('message');
        messageElement.innerText = message;
        if (isFinal) {
            document.getElementById('guess-button').disabled = true;
            document.getElementById('guess-input').disabled = true;
        }
    }

    function updateDisplay() {
        document.getElementById('word-display').innerText = wordGuessed.join(' ');
        document.getElementById('lives').innerText = numLivesLeft;
    }

    function updateHangman() {
        const hangmanElement = document.getElementById('hangman');
        hangmanElement.style.backgroundPosition = `-${(numLives - numLivesLeft) * 200}px 0`;
    }

    document.getElementById('guess-button').addEventListener('click', () => {
        const guessInput = document.getElementById('guess-input');
        const guess = guessInput.value;
        if (guess && guess.length === 1 && /^[a-zA-Z]$/.test(guess)) {
            checkGuess(guess);
            guessInput.value = '';
        } else {
            showMessage('Invalid letter. Please enter a single alphabetical character.');
        }
    });

    document.getElementById('restart-button').addEventListener('click', () => {
        initializeGame();
        document.getElementById('guess-button').disabled = false;
        document.getElementById('guess-input').disabled = false;
    });

    initializeGame();
});
