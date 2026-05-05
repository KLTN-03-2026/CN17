const Task    = require("../models/Task");
const User    = require("../models/User");
const Project = require("../models/Project");

// @desc    Admin lấy danh sách tất cả user
// @route   GET /api/users
const getUsers = async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: "admin" } }).select("-password");

        const usersWithStats = await Promise.all(
            users.map(async (user) => {
                const pendingTasks    = await Task.countDocuments({ assignedTo: user._id, status: "pending" });
                const inProgressTasks = await Task.countDocuments({ assignedTo: user._id, status: "in progress" });
                const completedTasks  = await Task.countDocuments({ assignedTo: user._id, status: "completed" });
                const leadingProjects = user.role === "leader"
                    ? await Project.countDocuments({ leader: user._id })
                    : 0;

                return {
                    ...user._doc,
                    pendingTasks,
                    inProgressTasks,
                    completedTasks,
                    leadingProjects,
                };
            })
        );

        res.json(usersWithStats);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// @desc    Lấy thông tin 1 user
// @route   GET /api/users/:id
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// @desc    Admin cập nhật role của user
// @route   PUT /api/users/:id
const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại" });
        }

        // Admin chỉ được đổi role (không đổi được password hay email)
        if (req.body.role && ["member", "leader"].includes(req.body.role)) {
            user.role = req.body.role;
        }

        const updatedUser = await user.save();
        res.json({
            _id:   updatedUser._id,
            name:  updatedUser.name,
            email: updatedUser.email,
            role:  updatedUser.role,
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// @desc    Admin xóa user
// @route   DELETE /api/users/:id
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại" });
        }
        if (user.role === "admin") {
            return res.status(403).json({ message: "Không thể xóa admin" });
        }

        await user.deleteOne();
        res.json({ message: "Đã xóa người dùng" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

module.exports = { getUsers, getUserById, updateUser, deleteUser };