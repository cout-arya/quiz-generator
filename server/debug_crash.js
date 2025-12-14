console.log('Starting debug...');
try {
    console.log('Loading express...');
    const express = require('express');
    console.log('Loading mongoose...');
    const mongoose = require('mongoose');
    console.log('Loading openai...');
    const OpenAI = require('openai');
    console.log('Loading multer...');
    const multer = require('multer');
    console.log('Loading pdf-parse...');
    const pdf = require('pdf-parse');
    console.log('Loading quizzes route...');
    const quizzes = require('./routes/quizzes'); // This might trigger it if inside route
    console.log('All modules loaded successfully.');
} catch (e) {
    console.error('CRASH DETECTED:', e);
}
