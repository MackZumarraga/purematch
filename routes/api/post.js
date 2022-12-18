const express = require("express");
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const argon = require('argon2');

const { Post, User } = require('../../models');

require('dotenv').config();
require('./../../auth/passport');

//GET POSTS
router.get('/', passport.authenticate("jwt", { session: false }), async (req, res) => {
    try {
        const posts = await Post.findAll({ include: 'user' });
        
        return res.json(posts);
    } catch (error) {
        console.log(error);
        return res.status(400).json(error);
    }
});


//CREATE POST
router.post('/', passport.authenticate("jwt", { session: false }), async (req, res) => {
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

module.exports = router;