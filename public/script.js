document.addEventListener('DOMContentLoaded', () => {
    const numQuestionsSelect = document.getElementById('num-questions');
    for (let i = 1; i <= 20; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        numQuestionsSelect.appendChild(option);
    }

    const toggleModeButton = document.getElementById('toggle-mode');
    toggleModeButton.addEventListener('click', () => {
        document.body.classList.toggle('day-mode');
    });
});

let currentQuestions = [];
let currentIndex = 0;
let score = 0;

document.getElementById('trivia-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const numQuestions = document.getElementById('num-questions').value;
    const category = document.getElementById('category').value;
    const difficulty = document.getElementById('difficulty').value;
    const type = document.getElementById('type').value;

    const response = await fetch('/questions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ numQuestions, category, difficulty, type })
    });
    currentQuestions = await response.json();
    currentIndex = 0;
    score = 0;

    displayQuestion(currentQuestions[currentIndex]);
    showPage('quiz-page');
});

function displayQuestion(question) {
    const questionsContainer = document.getElementById('questions-container');
    questionsContainer.innerHTML = '';

    const questionDiv = document.createElement('div');
    questionDiv.classList.add('question');
    questionDiv.innerHTML = `
        <p>Q${currentIndex + 1}) ${question.question}</p>
        ${question.type === 'boolean' ? `
            <label>
                <input type="radio" name="question-${currentIndex}" value="True">
                True
            </label>
            <label>
                <input type="radio" name="question-${currentIndex}" value="False">
                False
            </label>
        ` : `
            ${question.incorrect_answers.map((answer, index) => `
                <label>
                    <input type="radio" name="question-${currentIndex}" value="${answer}">
                    ${answer}
                </label>
            `).join('')}
            <label>
                <input type="radio" name="question-${currentIndex}" value="${question.correct_answer}">
                ${question.correct_answer}
            </label>
        `}
        <button id="next-question" class="btn next-btn"><i class="fas fa-arrow-right"></i> Next</button>
    `;
    questionsContainer.appendChild(questionDiv);

    document.getElementById('next-question').addEventListener('click', () => {
        const answer = document.querySelector(`input[name="question-${currentIndex}"]:checked`);
        if (answer && answer.value === question.correct_answer) {
            score++;
        }

        currentIndex++;
        if (currentIndex < currentQuestions.length) {
            displayQuestion(currentQuestions[currentIndex]);
        } else {
            displayResult(score);
            showPage('result-page');
        }
    });
}

function displayResult(score) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `<p>Your score is: ${score}</p>`;
    updateCumulativeScore();
    displayLeaderboard();
}

async function updateCumulativeScore() {
    const response = await fetch('/scores');
    const scores = await response.json();
    const totalScore = scores.reduce((acc, curr) => acc + curr, 0);
    const scoreDiv = document.getElementById('cumulative-score');
    scoreDiv.innerHTML = `<p>Cumulative score across games: ${totalScore}</p>`;
}

async function displayLeaderboard() {
    const response = await fetch('/scores');
    const scores = await response.json();
    const leaderboardDiv = document.getElementById('leaderboard');
    leaderboardDiv.innerHTML = '<h2>Leaderboard</h2>';

    const list = document.createElement('ol');
    scores.forEach((score, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `User ${index + 1}: ${score} points`;
        list.appendChild(listItem);
    });

    leaderboardDiv.appendChild(list);
}

document.getElementById('restart').addEventListener('click', () => {
    document.getElementById('questions-container').innerHTML = '';
    document.getElementById('result').innerHTML = '';
    document.getElementById('leaderboard').innerHTML = '';
    document.getElementById('trivia-form').reset();
    showPage('home-page');
});

document.getElementById('back').addEventListener('click', () => {
    document.getElementById('questions-container').innerHTML = '';
    showPage('home-page');
});

function showPage(pageId) {
    const pages = ['home-page', 'quiz-page', 'result-page'];
    pages.forEach(page => {
        document.getElementById(page).style.display = page === pageId ? 'block' : 'none';
    });
}

showPage('home-page');
