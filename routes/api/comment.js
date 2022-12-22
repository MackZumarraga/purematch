const express = require("express");
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const argon = require('argon2');

const { Comment, User, Post } = require('../../models');

require('dotenv').config();
require('./../../auth/passport');


//GET COMMENTS
router.get('/', passport.authenticate("jwt", { session: false }), async (req, res) => {
    try {
        const comments = await Comment.findAll({
            include: 'author',
        });
        
        return res.json(comments);
    } catch (error) {
        return res.status(400).json({
            message: "cannot retrieve comments"
        });
    }
});


//GET COMMENT
router.get('/:uuid', passport.authenticate("jwt", { session: false }), async (req, res) => {
    
    const uuid = req.params.uuid

    try {
        const comment = await Comment.findOne({
            where: { uuid },
            include: 'author',
        });

        return res.json({
            comment: comment,
        });
    } catch (error) {
        return res.status(400).json({
            message: "cannot retrieve comment"
        });
    }
});


//CREATE COMMENT
router.post('/', passport.authenticate("jwt", { session: false }), async (req, res) => {
    const { authorUuid, postUuid, text} = req.body;


    try {
        const author = await User.findOne({
            where: {
                uuid: authorUuid,
            }
        });

        const post = await Post.findOne({
            where: {
                uuid: postUuid,
            }
        });

        const comment = await Comment.create({
            text,
            authorId: author.id,
            postId: post.id,
        });
        
        return res.json({ 
            message: "success",
            comment: comment,
            author: author,
        });

    } catch (error) {
        return res.status(400).json({
            message: "cannot create comment"
        });              
    }
});


//PATCH COMMENT
router.patch('/:uuid', passport.authenticate("jwt", { session: false }), async (req, res) => {
    const { text } = req.body;
    const uuid = req.params.uuid


    try {
        const comment = await Comment.findOne({
            where: { uuid },
        });
       
        comment.text = text ? text : comment.text
        
        await comment.save();

        const updatedComment = await Comment.findOne({
            where: { uuid },
            include: 'author',
        });

        return res.json({ 
            message: "success",
            post: updatedComment,
        });

    } catch (error) {
        return res.status(400).json({
            message: "cannot update comment"
        });
    }
});


//DELETE COMMENT
router.delete('/:uuid', passport.authenticate("jwt", { session: false }), async (req, res) => {
    
    const uuid = req.params.uuid

    try {
        const comment = await Comment.findOne({
            where: { uuid },
            include: 'author',
        });

        await comment.destroy();

        return res.json(comment);
    } catch (error) {
        return res.status(400).json({
            message: "cannot delete comment"
        });
    }
});


module.exports = router;