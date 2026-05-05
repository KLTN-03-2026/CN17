const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Project = require("../models/Project");

// ─── 1. Xác thực token ────────────────────────────────────────────────────────
const protect = async (req, res, next) => {
    try {
        let token = req.headers.authorization;

        if (token && token.startsWith("Bearer")) {
            token = token.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select("-password");
            next();
        } else {
            res.status(401).json({ message: "Not authorized, no token" });
        }
    } catch (error) {
        res.status(401).json({ message: "Token failed", error: error.message });
    }
};

// ─── 2. Chỉ Admin (xem thống kê, quản lý user) ───────────────────────────────
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(403).json({ message: "Access denied, admin only" });
    }
};

// ─── 3. Chỉ Leader (global — có role leader) ─────────────────────────────────
// Dùng cho các route tổng quát cần role leader
const leaderOnly = (req, res, next) => {
    if (req.user && req.user.role === "leader") {
        next();
    } else {
        res.status(403).json({ message: "Access denied, leader only" });
    }
};

// ─── 4. Leader của đúng project đó ───────────────────────────────────────────
// Dùng cho: tạo task, sửa task, xóa task, gửi invite trong 1 project cụ thể
// Yêu cầu: req.params.projectId phải có
const leaderOfProject = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.projectId);

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        if (project.leader.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "Access denied, you are not the leader of this project",
            });
        }

        req.project = project; // đính kèm project vào request để dùng tiếp
        next();
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ─── 5. Member của project (đã được accept invite) ───────────────────────────
// Dùng cho: xem task, cập nhật tiến độ task
// Yêu cầu: req.params.projectId phải có
const memberOfProject = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.projectId);

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        const isLeader = project.leader.toString() === req.user._id.toString();
        const isMember = project.members
            .map((id) => id.toString())
            .includes(req.user._id.toString());

        if (!isLeader && !isMember) {
            return res.status(403).json({
                message: "Access denied, you are not a member of this project",
            });
        }

        req.project = project;
        next();
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    protect,
    adminOnly,
    leaderOnly,
    leaderOfProject,
    memberOfProject,
};