const passport = require('passport');
const passportJwt = require('passport-jwt');
const ExtractJwt = passportJwt.ExtractJwt;
const StrategyJwt = passportJwt.Strategy;
const { User } = require('./../models');

passport.use(
    new StrategyJwt({ 
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), 
        secretOrKey: process.env.JWT_SECRET,
    }, async (jwtPayload, done) => {
        try {
            const user = await User.findOne({
                where: { id: jwtPayload.id }
            });
    
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    })
);