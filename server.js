require('dotenv').config();
const PORT = process.env.PORT || 4000;
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const verifyJWT = require('./middleware/verifyJWT');
const cookieParser = require('cookie-parser');

// connect to MongoDB
connectDB();

// allow CORS 
app.use(cors(corsOptions));

// urlencoded form data
app.use(express.urlencoded({ extended: false }));

// for json 
app.use(express.json());

// for cookies
app.use(cookieParser());

// routes
// action without authentication
app.use('/register', require('./routes/register'));
app.use('/login', require('./routes/login'));
app.use('/logout', require('./routes/logout'));
app.use('/refresh', require('./routes/refresh'));

// authentication: check is login
app.use(verifyJWT);

// action require authentication
app.use('/users', require('./routes/api/users'));
app.use('/messages', require('./routes/api/messages'));

app.all('*', (req, res) => {
    res.status(404).json({ "error": "API not found!" });
});

// error
// app.use(errorHandler);

// open connection
mongoose.connection.once('open', () => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});