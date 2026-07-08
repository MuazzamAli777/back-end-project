import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"
const app =express();

// cros pay origin set kiya 
app.use(cors({
    origin: process.env.CROS_ORIGIN,
    credentials:TRUE
}))

// json formate pay limit lagai 
app.use(express.json({
    limit:"16kb"
}))

//url ko encoded kiya

app.use(express.urlencoded({
    extended:true,
    limit:"16kb"
}))

//kisi b file ko server pay rakh lana ,jaisa k hamna public folder b banaya 

app.use(express.static("public"))

//cookie parser ko 

app.use(cookieParser)


export {app}