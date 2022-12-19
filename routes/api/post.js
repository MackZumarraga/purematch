const express = require("express");
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const argon = require('argon2');
const multer = require('multer');

const app = express()

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
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads");
    },
    filename: (req, file, cb) => {
        const { originalname } = file;
        const { userUuid } = req.body;
        cb(null, userUuid + "-" + originalname)
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.split("/")[0] === 'image') {
        cb(null, true)
    } else {
        cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false);
    }
}

const upload = multer({ storage, fileFilter, limits: {files: 5} });


router.post('/', passport.authenticate("jwt", { session: false }), upload.array("photo", 5), async (req, res) => {

    return res.json({ message: "success" })
    // const { userUuid, title, description, photo } = req.body;

    // try {
    //     const user = await User.findOne({
    //         where: {
    //             uuid: userUuid,
    //         }
    //     });

    //     const post = await Post.create({
    //         title,
    //         description,
    //         photo,
    //         userId: user.id
    //     });

    //     return res.json(post)
    // } catch (error) {
    //     console.log(error);
    //     return res.status(400).json(error);
    // }
});

module.exports = router;