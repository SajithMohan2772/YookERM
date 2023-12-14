const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    
    name: {
        type: String,
        required: [true, "Please add a name"]
    },

    email: {
        type: String,
        required: [true, "Please add a email"],
        unique: true ,
        trim: true,
        match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Please enter a valid email"]
    },

    password: {
        type: String,
        required: [true, "Please add a password"],
        minLength: [6, "Password must be up to 6 charecters"],
        maxLength: [23, "Password must be not more than 23 charecters"]
    },

    photo: {
        type: String,
        required: [true, "Please add a Photo"],
        default: "https://i.ibb.co/4pDNDk1/avatar.png"
    },

    photo: {
        type: String,
        default: "+94"
    },

    bio: {
        type: String,
        maxLength: [230, "Password must be not more than 230 charecters"],
        default: "bio"
    },
}, {
    timestamps: true,
}) 

const User = mongoose.model("User" , userSchema)
module.exports = User