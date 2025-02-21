import jwt from "jsonwebtoken";
import { User } from "../models/user.js";

const authmiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken;
        
        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }
        
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        // console.log(decoded.id);
        req.user = await User.findById(decoded?._id).select("-password");
        
        if (!req.user) {
            return res.status(401).json({ message: "User not found" });
        }

        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

export { authmiddleware };
