const express = require("express");
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const argon = require('argon2');

const { User } = require('../../models');

require('dotenv').config();
require('./../../auth/passport');

//REGISTER
router.post('/register', async (req, res) => {
    const { name, email, password, username } = req.body

    try {
        const hash = await argon.hash(password);
        const user = await User.create({
            name,
            email,
            password,
            hash,
            username
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
        return res.status(400).json({
            message: "invalid inputs"
        });
    }
});

//LOGIN
router.post('/login', async (req, res) => {
    const { email, password } = req.body

    const user = await User.findOne({
        where: { email }
    });

    if (!user) {
        return res.json({
            message: "Invalid credentials"
        });
    }

    const pwMatch = await argon.verify(user.hash, password);

    if (!pwMatch) return res.json({ message: "credentials incorrect" });   

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


module.exports = router;