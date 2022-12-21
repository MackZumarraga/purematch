const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const argon = require('argon2');
const multer = require('multer');

require('dotenv').config();
require('./auth/passport');

const { sequelize, User, Post } = require('./models');
const auth = require('./routes/api/auth');
const users = require('./routes/api/user');
const posts = require('./routes/api/post');
const comments = require('./routes/api/comment');

const app = express();

const PORT = process.env.PORT || 5000

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use("/api/auth", auth);
app.use("/api/users", users);
app.use("/api/posts", posts);
app.use("/api/comments", comments);

app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_COUNT") {
            return res.status(400).json({
                message: "a post cannot have more than 5 photos"
            })
        }

        if (error.code === "LIMIT_UNEXPECTED_FILE") {
            return res.status(400).json({
                message: "file must be an image"
            })
        }
    }
})




app.listen({ port: 5000 }, async () => {
    console.log(`Listening on port ${PORT}`);
    await sequelize.authenticate();
    console.log('Database Connected!');
});
