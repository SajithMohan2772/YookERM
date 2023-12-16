const mongoose = require("mongoose");
const bcrypt = require("bcryptjs")

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
        // maxLength: [23, "Password must be not more than 23 charecters"]
    },

    photo: {
        type: String,
        required: [true, "Please add a Photo"],
        default: "https://i.ibb.co/4pDNDk1/avatar.png"
    },

    phone: {
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
 // Encrypt password before saving to db
userSchema.pre("save", async function(next) {
    if(!this.isModified("password")){
        return next();
    }

    // hash password
    const salt = await bcrypt.genSalt(10)
    const hashePassword = await bcrypt.hash(this.password, salt);
    this.password = hashePassword
    next();
});

const User = mongoose.model("User" , userSchema)
module.exports = User