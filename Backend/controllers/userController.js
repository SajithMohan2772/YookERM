const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Token = require("../models/tokenModel");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail")


const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {expiresIn: "1d"})
};

// Register new user
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
            res.status(201).json({
                _id, name, email, photo, phone, bio, token,
            });
        }  else {
                res.status(400)
                throw new Error("Invalid user data")
            }

});

// Login User
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

//   Generate Token
    const token = generateToken(user._id);

// Send HTTP-only cookie
    res.cookie("token", token, {
    path: "/",
    httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400), // 1 day
    sameSite: "none",
    secure: true,
    });

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

// logout user
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

// Get user data
const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        const {_id, name, email, photo, phone, bio, } = user;
        res.status(200).json({
            _id, name, email, photo, phone, bio,
        });
    } else {
        res.status(400);
        throw new Error("user not found");
    }
});

// Get Login Status
const loginStatus = asyncHandler(async (req, res) => {
    
    const token = req.cookies.token;
    if (!token){
        return res.json(false)
    }
// Verify Token
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (verified){
        return res.json(true)
    }
    
    return res.json(false)
});

// Update user
const updateUser = asyncHandler(async (req, res) => {

    // console.log('req', req.user._id);

    // console.log('body', req.body);

    const user = await User.findById( req.user._id);
    if (user) {
        const { name, email, photo, phone, bio, } = user;
        user.email = email;
        user.name = req.body.name || name;
        user.phone = req.body.phone || phone;
        user.bio = req.body.bio || bio;
        user.photo = req.body.photo || photo;

        const updatedUser = await user.save();
        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            photo: updatedUser.photo,
            phone: updatedUser.phone,
            bio: updatedUser.bio,
        });
    } else {
        res.status(404)
        throw new Error("User not found")
    }
});

// Change password
const changePassword = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    const { oldPassword, password } = req.body;

    if (!user) {
    res.status(400);
    throw new Error("User not found, please signup");
    }
    //Validate
    if (!oldPassword || !password) {
    res.status(400);
    throw new Error("Please add old and new password");
    }

    // check if old password matches password in DB
    const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);

    // Save new password
    if (user && passwordIsCorrect) {
    user.password = password;
    await user.save();
    res.status(200).send("Password change successful");
    } else {
    res.status(400);
    throw new Error("Old password is incorrect");
    }
});

// Forgot password
const forgotPassword = asyncHandler(async (req, res) => {
const {email} = req.body;
const user = await User.findOne({email});

if (!user) {
    res.send(404)
    throw new Error("User not found")
} 

// Delete token if it exists in DB
let token = await Token.findOne({ userId: user._id });
if (token) {
await token.deleteOne();
}

// Create reset token
let resetToken = crypto.randomBytes(32).toString("hex") + user._id;
console.log(resetToken);

// Hash token before saving to DB
const hashedToken =crypto
.createHash("sha256")
.update(resetToken)
.digest("hex")

// Save Token to DB
await new Token({
    userId: user._id,
    token: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 30 * 60 * 1000, // 30 mins in milliseconds
}).save();

// Construct Reset Url
const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

// Reset Email
const message = `
    <h2>Hello ${user.name}</h2>
    <p>Please use the url below to reset your password</p>  
    <p>This reset link is valid for only 30minutes.</p>

    <a href=${resetUrl} clicktracking=off>${resetUrl}</a>

    <p>Regards...</p>
    <p>YookERM Team</p>
    `;

    const subject = "password reset request"
    const send_to = user.email
    const send_from = process.env.EMAIL_USER

    try {
        await sendEmail(subject, message, send_to, send_from);
        res.status(200).json({success: true, message:"Reset email sent"});
    } catch (error) {
        res.status(500)
        throw new Error("Email not sent, please try again");
    }
});

// Reset password
const resetPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const { resetToken } = req.params;

    // Hash token, then compare to Token in DB
    const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

    // fIND tOKEN in DB
    const userToken = await Token.findOne({
    token: hashedToken,
    expiresAt: { $gt: Date.now() },
    });

    if (!userToken) {
    res.status(404);
    throw new Error("Invalid or Expired Token");
    }
    
    

    // Find user
    const user = await User.findOne({ _id: userToken.userId });
    user.password = password;
    await user.save();
    res.status(200).json({
    message: "Password Reset Successful, Please Login",
    });
});

module.exports ={
    registerUser,
    loginUser,
    logout,
    getUser,
    loginStatus,
    updateUser,
    changePassword,
    forgotPassword,
    resetPassword,
};