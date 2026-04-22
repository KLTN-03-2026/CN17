const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// tao token JWT
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" }); // token co thoi gian het han la 7 ngay
};

// @desc    Dang ky tai khoan moi
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password , profileImageUrl, adminInviteToken } = req.body;

        // kiem tra xem email da ton tai chua
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "Email da ton tai" });
        }
        // detemine user role admin : 
        let role = "member";
        if (adminInviteToken 
            && req.body.adminInviteToken == process.env.ADMIN_INVITE_TOKEN) 
        {
            role = "admin";
        }
        // hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        // tao user moi
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            profileImageUrl,
            role,
        });

        // tra ve data use tu JWT
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profileImageUrl: user.profileImageUrl,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Dang nhap tai khoan
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
     try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if ( !user ) {
            return res.status(400).json({ message: "Email hoac mat khau khong dung" });
        }
        //compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Email hoac mat khau khong dung" });
        }
        // tra ve data user tu JWT
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profileImageUrl: user.profileImageUrl,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Lay thong tin ca nhan
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
     try {
        const user = await User.findById(req.user._id).select("-password"); 
        if (!user) {
            return res.status(404).json({message: "User not found"});
        }
        res.json(user);    
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Cap nhat thong tin ca nhan
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
     try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({message: "User not found"});
        }

        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
       if (req.body.password) { 
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
       }

       const updatedUser = await user.save();
         res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            token: generateToken(updatedUser._id),
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { registerUser, loginUser, getUserProfile, updateUserProfile };