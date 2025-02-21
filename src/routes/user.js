import {Router} from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/auth.js";
import { authmiddleware } from "../middlewares/authmiddleware.js";

const router = Router();

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/logout").post(authmiddleware,logoutUser)

export default router;
