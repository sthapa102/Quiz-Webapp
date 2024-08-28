const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

let scores = [];

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Read scores from JSON file on startup
fs.readFile('scores.json', 'utf8', (err, data) => {
    if (!err && data) {
        scores = JSON.parse(data);
    }
});

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/questions', async (req, res) => {
    const { numQuestions, category, difficulty, type } = req.body;
    const url = `https://opentdb.com/api.php?amount=${numQuestions}&category=${category}&difficulty=${difficulty}&type=${type}`;
    try {
        const response = await axios.get(url);
        res.json(response.data.results);
    } catch (error) {
        res.status(500).send('Error fetching questions');
    }
});

app.post('/submit', (req, res) => {
    const { score } = req.body;
    scores.push(score);
    fs.writeFile('scores.json', JSON.stringify(scores), (err) => {
        if (err) throw err;
        res.json({ scores });
    });
});

app.get('/scores', (req, res) => {
    res.json(scores);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
