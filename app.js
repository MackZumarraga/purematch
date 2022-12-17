const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const argon = require('argon2');

require('dotenv').config();
require('./auth/passport');

const { sequelize, User, Post } = require('./models');


const app = express();

const PORT = process.env.PORT || 5000

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());


//AUTH
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body

    try {
        const hash = await argon.hash(password);
        const user = await User.create({
            name,
            email,
            password,
            hash,
        });

        const jwToken = jwt.sign({
            id: user.id,
            email: user.email,
        }, process.env.JWT_SECRET);

        return res.json({
            message: "Welcome!",
            token: jwToken,
            uuid: user.uuid,
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json(error);
    }
});


app.post('/login', async (req, res) => {
    const { email, password } = req.body

    const user = await User.findOne({
        where: { email }
    });

    if (!user) {
        return res.json({
            message: "Invalid credentials"
        });
    }

    try {
        await argon.verify(user.hash, password);
    } catch (error) {
        return res.json({ message: "Credentials Incorrect" });   
    }

    const jwToken = jwt.sign({
        id: user.id,
        email: user.email,
    }, process.env.JWT_SECRET);

    return res.json({
        message: "Welcome Back!",
        token: jwToken,
        uuid: user.uuid,
    });

});


//USERS
app.get('/users', passport.authenticate("jwt", { session: false }), async (req, res) => {
    try {
        const users = await User.findAll();
        
        return res.json(users);
    } catch (error) {
        console.log(error);
        return res.status(400).json(error);
    }
});

app.get('/users/:uuid', passport.authenticate("jwt", { session: false }), async (req, res) => {
    
    const uuid = req.params.uuid

    try {
        const user = await User.findOne({
            where: { uuid },
            include: 'posts',
        });

        return res.json(user);
    } catch (error) {
        console.log(error);
        return res.status(400).json(error);
    }
});


app.patch('/users/:uuid', passport.authenticate("jwt", { session: false }), async (req, res) => {
    const { name, email, password } = req.body
    const uuid = req.params.uuid

    try {
        const user = await User.findOne({
            where: { uuid },
        });
        
        user.name = name ? name : user.name
        user.email = email ? email : user.email
        user.password = password ? password : user.password
        
        await user.save();

        return res.json(user);
    } catch (error) {
        console.log(error);
        return res.status(400).json(error);
    }
});


app.delete('/users/:uuid', passport.authenticate("jwt", { session: false }), async (req, res) => {
    
    const uuid = req.params.uuid

    try {
        const user = await User.findOne({
            where: { uuid }
        });

        await user.destroy();

        return res.json(user);
    } catch (error) {
        console.log(error);
        return res.status(400).json(error);
    }
});


//POSTS
app.get('/posts', passport.authenticate("jwt", { session: false }), async (req, res) => {
    try {
        const posts = await Post.findAll({ include: 'user' });
        
        return res.json(posts);
    } catch (error) {
        console.log(error);
        return res.status(400).json(error);
    }
});

app.post('/posts', passport.authenticate("jwt", { session: false }), async (req, res) => {
    const { userUuid, title, description, photo } = req.body;

    try {
        const user = await User.findOne({
            where: {
                uuid: userUuid,
            }
        });

        const post = await Post.create({
            title,
            description,
            photo,
            userId: user.id
        });

        return res.json(post)
    } catch (error) {
        console.log(error);
        return res.status(400).json(error);
    }
});

app.listen({ port: 5000 }, async () => {
    console.log(`Listening on port ${PORT}`);
    await sequelize.authenticate();
    console.log('Database Connected!');
});
