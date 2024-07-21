const wordList = ['kiwi', 'grape', 'mango', 'apple', 'plum', 'peach', 'guava'];
const numLives = 5;

class Hangman {
    constructor(wordList, numLives) {
        this.wordList = wordList;
        this.numLives = numLives;
        this.word = this.chooseRandomWord();
        this.wordGuessed = Array(this.word.length).fill('_');
        this.numLetters = new Set(this.word).size;
        this.listOfGuesses = [];
        this.updateDisplay();
    }

    chooseRandomWord() {
        return this.wordList[Math.floor(Math.random() * this.wordList.length)];
    }

    checkGuess(guess) {
        guess = guess.toLowerCase();
        if (this.listOfGuesses.includes(guess)) {
            this.showMessage(`You've already tried the letter '${guess}'.`);
        } else {
            this.listOfGuesses.push(guess);
            if (this.word.includes(guess)) {
                this.showMessage(`Good guess! ${guess} is in the word.`);
                for (let i = 0; i < this.word.length; i++) {
                    if (this.word[i] === guess) {
                        this.wordGuessed[i] = guess;
                    }
                }
                this.numLetters--;
                if (this.numLetters === 0) {
                    this.showMessage(`Congratulations! You've guessed the word: ${this.word}`, true);
                }
            } else {
                this.numLives--;
                this.updateHangman();
                this.showMessage(`Sorry, ${guess} is not in the word.`);
                if (this.numLives === 0) {
                    this.showMessage(`Oh no! You've run out of lives. The word was: ${this.word}`, true);
                }
            }
            this.updateDisplay();
        }
    }

    showMessage(message, isFinal = false) {
        const messageElement = document.getElementById('message');
        messageElement.innerText = message;
        if (isFinal) {
            document.getElementById('guess-button').disabled = true;
            document.getElementById('guess-input').disabled = true;
        }
    }

    updateDisplay() {
        document.getElementById('word-display').innerText = this.wordGuessed.join(' ');
        document.getElementById('lives').innerText = this.numLives;
    }

    updateHangman() {
        // Update hangman image based on lives left
        const hangmanElement = document.getElementById('hangman');
        hangmanElement.style.backgroundPosition = `-${(5 - this.numLives) * 200}px 0`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new Hangman(wordList, numLives);

    document.getElementById('guess-button').addEventListener('click', () => {
        const guessInput = document.getElementById('guess-input');
        const guess = guessInput.value;
        if (guess && guess.length === 1 && /^[a-zA-Z]$/.test(guess)) {
            game.checkGuess(guess);
            guessInput.value = '';
        } else {
            game.showMessage('Invalid letter. Please enter a single alphabetical character.');
        }
    });
});
