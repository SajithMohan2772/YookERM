const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const protect = asyncHandler (async(req, res) =>{
    try {
        const token = req.cookies.token;
    } catch (error) {
        if (!token){
            res.status(401)
            throw new Error("not authorized, please login")
        }
    }
});

module.exports = protect;