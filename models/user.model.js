
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";

import dotenv from "dotenv";
dotenv.config();

import { json } from "express";

const userschema = new Schema({

    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        index: true,
        trim: true


    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,

    },
    fullName: {
        type: String,
        required: true,
        index: true,
        trim: true


    },
    avatar: {
        type: String,//cloudanairy ka use kra ga url 
        required: true,
    },
    coverimage: {
        type: String,


    },
    watchhistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }

    ],
    password: {
        type: String,
        required: [true, 'password is require']
    },
    refreshtoken:
    {
        type: String
    }





}, { timestamps: true })


userschema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10); //bcrpt do cheeza liti ha aik jisko bycrpt krna ho,dosra rounds
});

userschema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userschema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName
    }, process.env.ACCESS_TOKEN, {
        expiresIn: process.env.EXPIRY_ACCESS_TOKEN
    })
}
userschema.methods.generateRefreshToken = function () {
    return jwt.sign({
        _id: this._id,

    }, process.env.REFRESH_TOKEN, {
        expiresIn: process.env.EXPIRY_REFRESH_TOKEN
    })
}
export const User = mongoose.model("User", userschema)