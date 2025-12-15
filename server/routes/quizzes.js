const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const OpenAI = require('openai');
const multer = require('multer');
const pdf = require('pdf-extraction');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
});

// Generate Quiz via AI (Text or PDF)
router.post('/generate', upload.single('pdf'), async (req, res) => {
    let { topic, numQuestions = 5, timeLimit = 20 } = req.body;
    let contextText = '';

    // Handle PDF Upload
    if (req.file) {
        try {
            const dataBuffer = fs.readFileSync(req.file.path);
            const data = await pdf(dataBuffer);
            contextText = data.text.substring(0, 15000); // Limit context chars
            // Cleanup uploaded file
            fs.unlinkSync(req.file.path);

            // If topic is empty but PDF exists, use filename or "Uploaded Content"
            if (!topic) topic = "Uploaded Document Content";
        } catch (err) {
            console.error('PDF Parse Error:', err);
            return res.status(500).json({ message: 'Failed to process PDF' });
        }
    }

    if (!topic && !contextText) return res.status(400).json({ message: 'Topic or PDF is required' });

    // Force Mock for testing
    if (topic && topic.toLowerCase() === 'test') {
        const mockQuestions = [];
        const count = parseInt(numQuestions) || 5;
        for (let i = 0; i < count; i++) {
            mockQuestions.push({
                text: `Test Question ${i + 1}?`,
                options: ['Correct', 'Wrong A', 'Wrong B', 'Wrong C'],
                correctIndex: 0
            });
        }
        const quiz = new Quiz({
            title: `Test Quiz`,
            questions: mockQuestions,
            // totalTime set dynamically below
        });
        const quizObj = quiz.toObject();
        quizObj.totalTime = parseInt(timeLimit);
        try {
            quiz.set('totalTime', parseInt(timeLimit));
            await quiz.save();
            return res.json(quiz);
        } catch (e) {
            return res.status(500).json({ message: e.message });
        }
    }

    try {
        let prompt = '';
        if (contextText) {
            prompt = `Generate a quiz based on the following text content.
             ${topic ? `Additional Instructions/Topic: "${topic}"` : ''}
             
             Text Content: "${contextText}"
             
             Generate ${numQuestions} multiple choice questions.`;
        } else {
            prompt = `Generate a quiz about "${topic}" with ${numQuestions} multiple choice questions.`;
        }

        prompt += `
    Return ONLY a JSON object with this structure: 
    {
      "title": "Quiz Title",
      "questions": [
        {
          "text": "Question text",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctIndex": 0
        }
      ]
    }`;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "gpt-3.5-turbo",
        });

        const content = completion.choices[0].message.content;
        const quizData = JSON.parse(content);

        const quiz = new Quiz({
            title: quizData.title,
            questions: quizData.questions
        });

        // Set Global Timer
        quiz.set('totalTime', parseInt(timeLimit));

        await quiz.save();
        res.json(quiz);

    } catch (err) {
        console.error('AI Generation Error:', err.message);
        res.status(500).json({ message: 'Failed to generate quiz', error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        res.json(quiz);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
