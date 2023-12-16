const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
    return jwt.sign({id}), process.env.JWT_SECRET, {expiresIn: "1d"}
};

const registerUser =  asyncHandler(async (request, response) => {
        const {name, email, password} = request.body

        // validation
        if (!name || !email || !password ){
            response.status(400)
            throw new Error('Plese fill in all required fields')
        }

        if (password.length < 6){
            response.status(400)
            throw new Error('Password must be up to 6 characters')
        }

        // check if user email already exists
        const userExists = await User.findOne({email})

        if (userExists) {
            response.status(400)
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

        if (user) {
            const {_id, name, email, photo, phone, bio } = user
            response.status(201).json({
                _id, name, email, photo, phone, bio, token
            });
        }  else {
                response.status(400)
                throw new Error("Invalid user data")
            }

});

module.exports ={
    registerUser,
};