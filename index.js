const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');


dotenv.config();
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// gemini Setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.listen(port, () => {
  console.log(`Gemini chatbot running on http://localhost:${port}`);
});


// Route penting
app.post('/api/chat', async (req, res) => {
    const userMessage = req.body.message;

    if(!userMessage) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        const result = await model.generateContent(userMessage);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text});
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong.' }); 
    }
});


