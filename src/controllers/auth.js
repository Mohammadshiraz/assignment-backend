import { User } from "../models/user.js";
const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        
        // console.log(user);
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new Error( "Something went wrong while generating referesh and access token")
    }
}
const registerUser = async (req, res) => {
    
    try {
        
        const { email, password } = req.body;
        
        // Check for empty fields
        if (!email || !password || email.trim() === "" || password.trim() === "") {
            return res.status(400).json({ message: "All fields are required" });
        }
        // console.log("hello");

        // Check if user already exists
        const existedUser = await User.findOne({ email });
        if (existedUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        // Create user
        const user = await User.create({ email, password });

        // Remove sensitive fields from the response
        const createdUser = await User.findById(user._id).select("-password -refreshToken");

        if (!createdUser) {
            return res.status(500).json({ message: "Something went wrong while registering the user" });
        }

        // Successful response
        return res.status(201).json({
            success: true,
            data: createdUser,
            message: "User registered successfully",
        });
        
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};


const loginUser = async (req, res) => {
    try {
        const { email,  password } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: "Username or email is required" });
        }
        
        // Find user by username or email
        const user = await User.findOne({
            email
        });
        // console.log(email);

        if (!user) {
            return res.status(404).json({ message: "User does not exist" });
        }

        // Validate password
        const isPasswordValid = await user.isPasswordCorrect(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid user credentials" });
        }

        // Generate tokens (assuming this function exists)
        const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);

        // Remove sensitive data from response
        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

        // Cookie options
        const options = {
            httpOnly: true,
            secure: true
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json({
                success: true,
                message: "Login successful",
                data: {
                    user: 
                         loggedInUser.email,
                        // createdAt: loggedInUser.createdAt,
                    
                    accessToken,
                },
            });

    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};
const logoutUser = async (req, res) => {
    try {
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $unset: { refreshToken: 1 } // Remove refresh token
            },
            { new: true }
        );

        const options = {
            httpOnly: true,
            secure: true
        };

        return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json({ statusCode: 200, message: "User logged out successfully" });

    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};








export { registerUser,loginUser,logoutUser };
