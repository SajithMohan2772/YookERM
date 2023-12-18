const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");


const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {expiresIn: "1d"})
};

const registerUser =  asyncHandler(async (req, res) => {
        const {name, email, password} = req.body

        // validation   
        if (!name || !email || !password ){
            res.status(400)
            throw new Error('Plese fill in all required fields')
        }

        if (password.length < 6){
            res.status(400)
            throw new Error('Password must be up to 6 characters')
        }

        // check if user email already exists
        const userExists = await User.findOne({email})

        if (userExists) {
            res.status(400)
            throw new Error('Email is already been registered') 
        }
        // create new user 
        const user = await User.create({
            name, 
            email, 
            password,
        })

        // Generat token
        const token = generateToken(user._id)

        // send HTTP-only cookie
        res.cookie("token", token, {
            path: "/",
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 86400), // 1day
            sameSite: "none",
            secure: true
        });

        if (user) {
            const {_id, name, email, photo, phone, bio } = user
            res.status(201).json({
                _id, name, email, photo, phone, bio, token,
            });
        }  else {
                res.status(400)
                throw new Error("Invalid user data")
            }

});

// LOgin user
const loginUser = asyncHandler(async (req,res) => {

    const {email, password} = req.body

    // Validation request
    if (!email || !password) {
        res.status(400);
        throw new Error("please email and password");
    }
    
    // Check if user exist

    const user = await User.findOne({email});

    if (!user) {
        res.status(400);
        throw new Error("user not found, please signup");
    } 

    // User exists, check if password is correct

    const passwordIsCorrect = await bcrypt.compare(password, user.password)
});

module.exports ={
    registerUser,
    loginUser,
};