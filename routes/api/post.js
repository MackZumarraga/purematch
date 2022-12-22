const express = require("express");
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const argon = require('argon2');
const multer = require('multer');

const app = express()

const elapsedTime = require('./../../utils/elapsed-time')

const { Post, User, Photo, Comment } = require('../../models');
const { json } = require("body-parser");
const { s3Uploadv3, s3Deletev3 } = require("../../utils/s3Service");

require('dotenv').config();
require('./../../auth/passport');

//GET POSTS
router.get('/', passport.authenticate("jwt", { session: false }), async (req, res) => {
    
    //post pagination variables
    const pageAsNumber = Number.parseInt(req.query.page); 
    const sizeAsNumber = Number.parseInt(req.query.size);

    let page = 0;
    if (Number.isInteger(pageAsNumber) && pageAsNumber > 0) {
        page = pageAsNumber;
    };

    let size = 10;
    if (Number.isInteger(sizeAsNumber) && sizeAsNumber > 0 && sizeAsNumber < 10) {
        size = sizeAsNumber;
    };

    //comment in post pagination variables
    const commentPageAsNumber = Number.parseInt(req.query.commentPage); 
    const commentSizeAsNumber = Number.parseInt(req.query.commentSize);

    let commentPage = 0;
    if (Number.isInteger(commentPageAsNumber) && commentPageAsNumber > 0) {
        commentPage = commentPageAsNumber;
    };

    let commentSize = 10;
    if (Number.isInteger(commentSizeAsNumber) && commentSizeAsNumber > 0 && commentSizeAsNumber < 10) {
        commentSize = commentSizeAsNumber;
    };

    
    try {
        const posts = await Post.findAndCountAll({
            limit: size,
            offset: page * size,
            include: [{
                    model: User,
                    as: 'user',
                }, {
                    model: Photo,
                    as: 'photos',
                }, {
                    model: Comment,
                    as: 'comments',
                    limit: commentSize,
                    offset: commentPage,
                }
            ]
        });

        const totalPages = Math.ceil(posts.count / size)
        const pageFromTotal = page + 1 > totalPages ? totalPages : page + 1

        
        return res.json({
            content: posts.rows,
            totalPages: totalPages,
            pageFromTotal: pageFromTotal + "/ " + totalPages
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json(error);
    }
});


//GET POST
router.get('/:uuid', passport.authenticate("jwt", { session: false }), async (req, res) => {
    
    const uuid = req.params.uuid


    //comment in post pagination variables
    const commentPageAsNumber = Number.parseInt(req.query.commentPage); 
    const commentSizeAsNumber = Number.parseInt(req.query.commentSize);

    let commentPage = 0;
    if (Number.isInteger(commentPageAsNumber) && commentPageAsNumber > 0) {
        commentPage = commentPageAsNumber;
    };

    let commentSize = 10;
    if (Number.isInteger(commentSizeAsNumber) && commentSizeAsNumber > 0 && commentSizeAsNumber < 10) {
        commentSize = commentSizeAsNumber;
    };

    try {
        const post = await Post.findOne({
            where: { uuid },
            include: ['photos'],
        });

        const elapsedTimeValue = elapsedTime(post.createdAt)
        post.elapsedTimeValue = elapsedTimeValue

        const { count, rows } = await Comment.findAndCountAll({
            where: {
                postId: post.id
            },
            include: 'author',
            limit: commentSize,
            offset: commentPage
        });


        const totalCommentPages = Math.ceil(count / commentSize)
        const commentPageFromTotal = commentPage + 1 > totalCommentPages ? totalCommentPages : commentPage + 1

        return res.json({
            post: post,
            comments: {
                content: rows,
                totalCommentPages: totalCommentPages,
                commentPageFromTotal: commentPageFromTotal + "/ " + totalCommentPages,
            },
            elapsedTime: post.elapsedTimeValue,
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json(error);
    }
});



//CREATE POST
const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
    if (file.mimetype.split("/")[0] === 'image') {
        cb(null, true)
    } else {
        cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false);
    }
}

const upload = multer({ storage, fileFilter, limits: {files: 5} });


router.post('/', passport.authenticate("jwt", { session: false }), upload.array("photo", 5), async (req, res) => {
    const { userUuid, title, description} = req.body;


    try {
        const user = await User.findOne({
            where: {
                uuid: userUuid,
            }
        });

        const post = await Post.create({
            title,
            description,
            userId: user.id,
        });


        const photoNames = (req.files).map(file => {
            return userUuid + "-" + file.originalname
        })
    
        await s3Uploadv3(userUuid, req.files)
    
        const uploadedPhotos = photoNames.map(photoName => ({
            name: photoName, 
            postId: post.id,
            awsUrl: `https://purematch-bucket.s3.amazonaws.com/uploads/${photoName}`, 
        }));
    
        const photos = await Photo.bulkCreate(uploadedPhotos);
        
        return res.json({ 
            message: "success",
            post: post,
            photos: photos,
        });

    } catch (error) {
        if (error.parent?.code === "22P02") {
            return res.status(400).json({
                message: "user not found"
            });
        }

        return res.status(400).json({
            message: error.errors.map(e => {
                return e.message
            })
        });              
    }
});


//PATCH POST
router.patch('/:uuid', passport.authenticate("jwt", { session: false }), upload.array("photo", 5), async (req, res) => {
    const { title, description, targetPhotos } = req.body;
    const uuid = req.params.uuid


    try {
        //Handle post's title and description updates
        const post = await Post.findOne({
            where: { uuid },
            include: ['user', 'photos'],
        });
       
        post.title = title ? title : post.title
        post.description = description ? description : post.description
        
        await post.save();


        //Handle post's photo updates
        const toBeDeleted = targetPhotos instanceof Array ? targetPhotos : [targetPhotos]
        
        const projectedRemainingPhotoCount = post.photos.length - toBeDeleted.length
        const toBeAddedCount = req.files.length

        const updateAllowed = (projectedRemainingPhotoCount + toBeAddedCount) <= 5;
        
        if (updateAllowed) {
            try {    
                await s3Deletev3(toBeDeleted); 

                await Photo.destroy({
                    where: {
                        name: toBeDeleted
                    }
                });
            } catch (error) {
                return res.status(400).json({
                    message: "photo doesn't exist"
                })
            }
        } 
        

        //Check how many photos are left after deleting
        const afterDeletePost = await Post.findOne({ 
            where: { uuid },
            include: 'photos',
        });

        const remainingPhotosCount = afterDeletePost.photos.length
        

        //Replace old photos and/or add new photos both in S3 bucket and database
        const photoNames = (req.files).map(file => {
            return post.user.uuid + "-" + file.originalname
        })

        if ((remainingPhotosCount + photoNames.length) <= 5) {
            await s3Uploadv3(post.user.uuid, req.files)

            const uploadedPhotos = photoNames.map(photoName => ({
                name: photoName, 
                postId: post.id,
                awsUrl: `https://purematch-bucket.s3.amazonaws.com/uploads/${photoName}`, 
            }));
            
            await Photo.bulkCreate(uploadedPhotos);
        } else {
            return res.status(400).json({
                message: "a post cannot have more than 5 photos"
            })
        }


        //Retrieve updated post
        const updatedPost = await Post.findOne({
            where: { uuid },
            include: ['user', 'photos'],
        });

        return res.json({ 
            message: "success",
            post: updatedPost,
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json(error);
    }
});


//DELETE POST
router.delete('/:uuid', passport.authenticate("jwt", { session: false }), async (req, res) => {
    
    const uuid = req.params.uuid

    try {
        const post = await Post.findOne({
            where: { uuid }
        });

        await post.destroy();

        return res.json(post);
    } catch (error) {
        console.log(error);
        return res.status(400).json(error);
    }
});


module.exports = router;
