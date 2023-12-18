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
            const {_id, name, email, photo, phone, bio, token } = user
            res.status(200).json({
                _id, name, email, photo, phone, bio, token,
            });
        }  else {
                res.status(400)
                throw new Error("Invalid user data")
            }

});


const getUserByID = asyncHandler(async (req,res) => {
    const userId = req.params.id;

    try {
        // Fetch the user from the database using the userId
        const user = await User.findById(userId);
    
    if (!user) {
        // If user not found, return a 404 status and a corresponding message
        res.status(404).json({ message: 'User not found' });
    } else {
        // If user found, return the user data
        res.status(200).json(user);
    }
    } catch (error) {
    // If an error occurs during database query or processing, return a 500 status and the error message
    res.status(500).json({ message: error.message });
    }
});

const getAllUsers = asyncHandler(async (req,res) => {
    try {
        const users = await User.find(); // Fetch all users from the database
        res.status(200).json(users); // Return users as JSON response
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// LOgin user
const loginUser = asyncHandler(async (req,res) => {

    const {email, password} = req.body

    // Validation request
    if (!email || !password) {
        res.status(400);
        throw new Error("please add email and password");
    }
    
    // Check if user exist

    const user = await User.findOne({email})

    if (!user) {
        res.status(400);
        throw new Error("user not found, please signup");
    } 

    // User exists, check if password is correct

    const passwordIsCorrect = await bcrypt.compare(password, user.password);

    if (user && passwordIsCorrect) {
        const {_id, name, email, photo, phone, bio, token} = user
        res.status(200).json({
            _id, name, email, photo, phone, bio, token,
        });
    } else {
        res.status(400);
        throw new Error("Invalid email or password");
    }
});

const logout = asyncHandler(async (req,res) => {
    res.cookie("token", "", {
        path: "/",
        httpOnly: true,
        expires: new Date(0), 
        sameSite: "none",
        secure: true
    });
    return res.status(200).json({message: "Succesfuly Loged Out"});
});

module.exports ={
    registerUser,
    loginUser,
    getUserByID,
    getAllUsers,
    logout,
};