const express = require("express");
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const argon = require('argon2');

const { User } = require('../../models');

require('dotenv').config();
require('./../../auth/passport');

//GET USERS
router.get('/', passport.authenticate("jwt", { session: false }), async (req, res) => {
    try {
        const users = await User.findAll();
        
        return res.json(users);
    } catch (error) {
        console.log(error);
        return res.status(400).json(error);
    }
});


//GET USER
router.get('/:uuid', passport.authenticate("jwt", { session: false }), async (req, res) => {
    
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


//PATCH USER
router.patch('/:uuid', passport.authenticate("jwt", { session: false }), async (req, res) => {
    const { name, email, password } = req.body
    const uuid = req.params.uuid

    try {
        const user = await User.findOne({
            where: { uuid },
        });
        
        user.name = name ? name : user.name
        user.email = email ? email : user.email
        user.password = password ? password : user.password
        
        if (password) {
            const hash = await argon.hash(user.password);
            user.hash = hash
        }

        await user.save();

        return res.json(user);
    } catch (error) {
        console.log(error);
        return res.status(400).json(error);
    }
});


//DELETE USER
router.delete('/:uuid', passport.authenticate("jwt", { session: false }), async (req, res) => {
    
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

module.exports = router;