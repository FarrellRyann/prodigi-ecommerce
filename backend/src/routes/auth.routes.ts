const express = require('express');
const { register, login, me } = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/authMiddleware');

const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.get('/me', authMiddleware, me);

module.exports = { authRouter };

export {};
