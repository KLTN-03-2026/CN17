const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Project = require("../models/Project");

// ─── 1. XÁC THỰC TOKEN & KIỂM TRA TRẠNG THÁI KHÓA (KICK-OUT LOGIC) ─────────────
const protect = async (req, res, next) => {
    try {
        let token = req.headers.authorization;

        if (token && token.startsWith("Bearer")) {
            token = token.split(" ")[1];
            
            // Giải mã token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Tìm User và loại bỏ password khỏi kết quả
            const user = await User.findById(decoded.id).select("-password");

            // KIỂM TRA TRẠNG THÁI: Nếu không tìm thấy hoặc bị khóa (blocked)
            if (!user) {
                return res.status(401).json({ message: "Người dùng không tồn tại." });
            }

            if (user.status === "blocked") {
                return res.status(401).json({ 
                    message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Quản trị viên." 
                });
            }

            // Lưu thông tin user vào request để các hàm sau sử dụng
            req.user = user;
            next();
        } else {
            res.status(401).json({ message: "Không có quyền truy cập, thiếu token." });
        }
    } catch (error) {
        res.status(401).json({ 
            message: "Phiên đăng nhập hết hạn hoặc Token lỗi.", 
            error: error.message 
        });
    }
};

// ─── 2. QUYỀN ADMIN (CHỈ QUẢN TRỊ VIÊN) ───────────────────────────────────────
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(403).json({ message: "Quyền truy cập bị từ chối. Chỉ dành cho Admin." });
    }
};

// ─── 3. QUYỀN LEADER (ADMIN CŨNG CÓ QUYỀN NÀY) ───────────────────────────────
const leaderOnly = (req, res, next) => {
    if (req.user && (req.user.role === "leader" || req.user.role === "admin")) {
        next();
    } else {
        res.status(403).json({ message: "Quyền truy cập bị từ chối. Cần quyền Trưởng nhóm." });
    }
};

// ─── 4. LEADER CỦA DỰ ÁN CỤ THỂ HOẶC ADMIN ───────────────────────────────────
const leaderOfProject = async (req, res, next) => {
    try {
        const projectId = req.params.projectId || req.params.id;
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({ message: "Không tìm thấy dự án." });
        }

        const isAdmin = req.user.role === "admin";
        const isLeader = project.leader.toString() === req.user._id.toString();

        if (!isAdmin && !isLeader) {
            return res.status(403).json({
                message: "Bạn không phải trưởng nhóm của dự án này hoặc Admin.",
            });
        }

        req.project = project; 
        next();
    } catch (error) {
        res.status(500).json({ message: "Lỗi Server", error: error.message });
    }
};

// ─── 5. THÀNH VIÊN CỦA DỰ ÁN HOẶC ADMIN ───────────────────────────────────────
const memberOfProject = async (req, res, next) => {
    try {
        const projectId = req.params.projectId || req.params.id;
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({ message: "Không tìm thấy dự án." });
        }

        const isAdmin = req.user.role === "admin";
        const isLeader = project.leader.toString() === req.user._id.toString();
        const isMember = project.members
            .map((id) => id.toString())
            .includes(req.user._id.toString());

        if (!isAdmin && !isLeader && !isMember) {
            return res.status(403).json({
                message: "Bạn không có quyền truy cập vào dự án này.",
            });
        }

        req.project = project;
        next();
    } catch (error) {
        res.status(500).json({ message: "Lỗi Server", error: error.message });
    }
};

module.exports = {
    protect,
    adminOnly,
    leaderOnly,
    leaderOfProject,
    memberOfProject,
};