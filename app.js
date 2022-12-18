const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const argon = require('argon2');

require('dotenv').config();
require('./auth/passport');

const { sequelize, User, Post } = require('./models');
const auth = require('./routes/api/auth');
const users = require('./routes/api/user');
const posts = require('./routes/api/post');

const app = express();

const PORT = process.env.PORT || 5000

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use("/api/auth", auth);
app.use("/api/users", users);
app.use("/api/posts", posts);


app.listen({ port: 5000 }, async () => {
    console.log(`Listening on port ${PORT}`);
    await sequelize.authenticate();
    console.log('Database Connected!');
});
