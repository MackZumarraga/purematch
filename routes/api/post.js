const express = require("express");
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const argon = require('argon2');
const elapsedTime = require('./../../utils/elapsed-time')

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


//GET POST
router.get('/:uuid', passport.authenticate("jwt", { session: false }), async (req, res) => {
    
    const uuid = req.params.uuid

    try {
        const post = await Post.findOne({
            where: { uuid },
            include: 'user',
        });

        const elapsedTimeValue = elapsedTime(post.createdAt)
        post.elapsedTimeValue = elapsedTimeValue

        return res.json({
            post: post,
            elapsedTime: post.elapsedTimeValue
        });
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