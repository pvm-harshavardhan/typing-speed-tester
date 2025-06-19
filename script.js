
// Sample texts for typing practice
const SAMPLE_TEXTS = [
    "Success isn't instant. It's built through patience, effort, and belief in yourself. Even the smallest step forward counts. Stay consistent, and over time, your persistence will create powerful results.",
    "Every failure teaches a lesson no success ever will. Mistakes shape resilience and understanding. Rise each time you fall, and you’ll become stronger, wiser, and ready for greater challenges.",
    "Dreams mean nothing without action. Don’t wait for perfect conditions—start now. Momentum grows from movement, not planning. Courage is built by doing, even when you’re filled with doubt.",
    "Growth begins where comfort ends. Challenges may feel uncomfortable, but they force evolution. Don’t fear struggle—it means you’re changing, improving, and becoming the person your goals require.",
    "Focus on progress, not perfection. The road to mastery is filled with missteps. Keep showing up, and the repetition will eventually shape confidence, clarity, and lasting results worth the effort.",
    "Discomfort is the birthplace of change. It shows you’re growing beyond the old version of yourself. Don’t run from it—lean into it and let it guide your transformation.",
    "You don't need the approval of others to begin. Start small, believe big, and trust yourself. The confidence you seek is built by showing up, not by waiting for permission.",
    "Greatness comes from ordinary people who chose to persist. You don’t need to be extraordinary—just committed to showing up, doing the work, and refusing to quit when it gets tough."
];

// Game state
let gameState = {
    text: '',
    currentIndex: 0,
    userInput: '',
    startTime: null,
    endTime: null,
    isActive: false,
    timeLeft: 60,
    testDuration: 60,
    errors: 0,
    currentSpeed: 0,
    timer: null
};

// DOM elements
const elements = {
    textDisplay: document.getElementById('textDisplay'),
    userInput: document.getElementById('textarea-input'),
    timeDisplay: document.getElementById('timeDisplay'),
    wpmDisplay: document.getElementById('wpmDisplay'),
    accuracyDisplay: document.getElementById('accuracyDisplay'),
    errorsDisplay: document.getElementById('errorsDisplay'),
    resetBtn: document.getElementById('resetBtn'),
    resultsModal: document.getElementById('resultsModal'),
    finalWPM: document.getElementById('finalWPM'),
    finalAccuracy: document.getElementById('finalAccuracy'),
    finalErrors: document.getElementById('finalErrors'),
    tryAgainBtn: document.getElementById('tryAgainBtn')
};

// Initialize the game
function initGame() {
    resetTest();
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    elements.userInput.addEventListener('input', handleInputChange);
    elements.resetBtn.addEventListener('click', resetTest);
    elements.tryAgainBtn.addEventListener('click', resetTest);
}

// Reset the test
function resetTest() {
    // Clear timer
    if (gameState.timer) {
        clearInterval(gameState.timer);
    }

    // Reset state
    gameState = {
        ...gameState,
        text: getRandomText(),
        currentIndex: 0,
        userInput: '',
        startTime: null,
        endTime: null,
        isActive: false,
        timeLeft: 60,
        errors: 0,
        currentSpeed: 0,
        timer: null
    };

    // Update UI
    updateTextDisplay();
    updateStats();
    elements.userInput.value = '';
    elements.userInput.disabled = false;
    elements.userInput.placeholder = "Click here and start typing...";
    elements.resultsModal.classList.add('hidden');
    elements.userInput.focus();
}

// Get random text
function getRandomText() {
    return SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)];
}

// Start the test
function startTest() {
    if (!gameState.isActive) {
        gameState.startTime = Date.now();
        gameState.isActive = true;
        elements.userInput.placeholder = "Keep typing...";
        startTimer();
    }
}

// Start the countdown timer
function startTimer() {
    gameState.timer = setInterval(() => {
        gameState.timeLeft--;
        updateStats();
        
        if (gameState.timeLeft <= 0) {
            finishTest();
        }
    }, 1000);
}

// Handle input changes
function handleInputChange(event) {
    const value = event.target.value;

    if (!gameState.isActive && value.trim().split(/\s+/).filter(Boolean).length > 0) {
        startTest();
    }

    gameState.userInput = value;
    gameState.currentIndex = value.length;

    // Count errors
    let errorCount = 0;
    for (let i = 0; i < value.length; i++) {
        if (value[i] !== gameState.text[i]) {
            errorCount++;
        }
    }
    gameState.errors = errorCount;

    // Calculate real-time speed
    if (gameState.isActive && gameState.startTime) {
        const timeElapsed = (Date.now() - gameState.startTime) / 60000; // in minutes
        if (timeElapsed > 0 && value.length > 0) {
            const wordsTyped = value.trim().split(/\s+/).length;
            gameState.currentSpeed = Math.round(wordsTyped / timeElapsed);
        }
    }

    // Update displays
    updateTextDisplay();
    updateStats();

    // Check if test is complete
    if (value.length === gameState.text.length) {
        finishTest();
    }
}

// Update text display with colored characters
function updateTextDisplay() {
    const textArray = gameState.text.split('');
    
    const displayHTML = textArray.map((char, index) => {
        let className = 'char ';
        
        if (index < gameState.userInput.length) {
            className += gameState.userInput[index] === char ? 'correct' : 'incorrect';
        } else if (index === gameState.currentIndex) {
            className += 'current';
        } else {
            className += 'pending';
        }
        
        return `<span class="${className}">${char}</span>`;
    }).join('');
    
    elements.textDisplay.innerHTML = displayHTML;
}

// Update stats display
function updateStats() {
    elements.timeDisplay.textContent = `${gameState.timeLeft}s`;
    elements.wpmDisplay.textContent = gameState.endTime ? calculateWPM() : gameState.currentSpeed;
    elements.accuracyDisplay.textContent = `${calculateAccuracy()}%`;
    elements.errorsDisplay.textContent = gameState.errors;
}

// Calculate WPM
function calculateWPM() {
    if (!gameState.startTime || !gameState.endTime) return 0;
    const timeInMinutes = (gameState.endTime - gameState.startTime) / 60000;
    const wordsTyped = gameState.userInput.trim().split(/\s+/).length;
    return Math.round(wordsTyped / timeInMinutes);
}

// Calculate accuracy
function calculateAccuracy() {
    if (gameState.userInput.length === 0) return 100;
    const correctChars = gameState.userInput.length - gameState.errors;
    return Math.round((correctChars / gameState.userInput.length) * 100);
}

// Finish the test
function finishTest() {
    gameState.endTime = Date.now();
    gameState.isActive = false;
    
    if (gameState.timer) {
        clearInterval(gameState.timer);
    }
    
    elements.userInput.disabled = true;
    
    // Update final results
    elements.finalWPM.textContent = calculateWPM();
    elements.finalAccuracy.textContent = `${calculateAccuracy()}%`;
    elements.finalErrors.textContent = gameState.errors;
    
    // Show results modal
    elements.resultsModal.classList.remove('hidden');
    
    updateStats();
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', initGame);
