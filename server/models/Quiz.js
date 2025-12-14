const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    text: String,
    options: [String],
    correctIndex: Number,
    timeLimit: { type: Number, default: 20 }
});

const QuizSchema = new mongoose.Schema({
    title: String,
    topic: String,
    questions: [QuestionSchema],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quiz', QuizSchema);
