const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const registerUser = async (req, res) => {
    try {
        const { name, email, password, profileImageUrl, adminInviteToken } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "Email đã tồn tại" });

        // Kiểm tra admin token
        let role = "member";
        if (adminInviteToken) {
            if (adminInviteToken !== process.env.ADMIN_INVITE_TOKEN) {
                return res.status(400).json({ message: "Mã Admin Token không hợp lệ" });
            }
            role = "admin";
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({ name, email, password: hashedPassword, profileImageUrl, role });
        res.status(201).json({
            _id: user._id, name: user.name, email: user.email,
            role: user.role, profileImageUrl: user.profileImageUrl,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Email hoặc mật khẩu không đúng" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Email hoặc mật khẩu không đúng" });

        res.json({
            _id: user._id, name: user.name, email: user.email,
            role: user.role, profileImageUrl: user.profileImageUrl,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.name            = req.body.name            || user.name;
        user.profileImageUrl = req.body.profileImageUrl ?? user.profileImageUrl;
        user.dateOfBirth     = req.body.dateOfBirth     ?? user.dateOfBirth;
        user.hometown        = req.body.hometown        ?? user.hometown;
        user.bio             = req.body.bio             ?? user.bio;

        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        }

        const updated = await user.save();
        res.json({
            _id: updated._id, name: updated.name, email: updated.email,
            role: updated.role, profileImageUrl: updated.profileImageUrl,
            dateOfBirth: updated.dateOfBirth, hometown: updated.hometown, bio: updated.bio,
            token: generateToken(updated._id),
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Đặt lại mật khẩu trực tiếp (không cần email)
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: "Mật khẩu phải có ít nhất 6 ký tự" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Email không tồn tại trong hệ thống" });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: "Đặt lại mật khẩu thành công!" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { registerUser, loginUser, getUserProfile, updateUserProfile, resetPassword };