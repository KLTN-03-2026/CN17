const Task    = require("../models/Task");
const User    = require("../models/User");
const Project = require("../models/Project");

// 1. Lấy danh sách tất cả user (Admin)
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

// 2. LẤY CHI TIẾT 1 USER 
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

// 3. Khóa/Mở khóa người dùng
const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });
        
        user.status = user.status === "blocked" ? "active" : "blocked";
        await user.save();

        res.json({ 
            message: `Tài khoản đã được ${user.status === "active" ? "mở khóa" : "khóa"}`,
            status: user.status 
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// 4. Cập nhật User
const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });

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

// 5. Xóa User
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });
        if (user.role === "admin") return res.status(403).json({ message: "Không thể xóa admin" });

        await user.deleteOne();
        res.json({ message: "Đã xóa người dùng" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// EXPORT ĐẦY ĐỦ
module.exports = { 
    getUsers, 
    getUserById, 
    toggleUserStatus, 
    updateUser, 
    deleteUser 
};