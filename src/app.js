import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app=express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))
app.use(express.json({limit:"16Kb"}))
app.use(express.urlencoded({
    extended:true,
    limit:"16Kb"
}))
app.use(express.static("public"))
app.use(cookieParser())

import router from "./routes/user.js";
app.use("/api/v1/users", router)
app.get("/", (req, res) => {
	return res.json({
		success:true,
		message:'Your server is up and running....'
	});
});

export {app}