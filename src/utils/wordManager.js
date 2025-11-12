// Word management utilities
const { WORDS, WORD_CHANGE_INTERVAL } = require('../config/constants');
const Logger = require('./logger');

class WordManager {
    constructor() {
        this.words = WORDS;
        this.currentWord = null;
        this.isLoopRunning = false;
        this.loopInterval = null;
        this.wordChangeInterval = WORD_CHANGE_INTERVAL;
    }

    // Get a random word from the word list
    getRandomWord() {
        const randomIndex = Math.floor(Math.random() * this.words.length);
        return this.words[randomIndex];
    }

    // Start the word loop
    startWordLoop(onWordChange) {
        if (this.isLoopRunning) {
            throw new Error('Loop is already running');
        }

        // Start with a random word
        this.currentWord = this.getRandomWord();
        this.isLoopRunning = true;

        // Start the interval to change words
        this.loopInterval = setInterval(() => {
            try {
                this.currentWord = this.getRandomWord();
                Logger.logWordChange(this.currentWord);
                
                // Notify about word change
                if (onWordChange) {
                    onWordChange(this.currentWord);
                }
            } catch (error) {
                Logger.error('Error in word loop interval:', error);
            }
        }, this.wordChangeInterval);

        return this.currentWord;
    }

    // Stop the word loop
    stopWordLoop() {
        if (this.loopInterval) {
            clearInterval(this.loopInterval);
            this.loopInterval = null;
        }
        this.isLoopRunning = false;
    }

    // Get current word and loop status
    getCurrentState() {
        return {
            currentWord: this.currentWord,
            isLoopRunning: this.isLoopRunning
        };
    }

    // Cleanup resources
    cleanup() {
        this.stopWordLoop();
    }
}

module.exports = WordManager;