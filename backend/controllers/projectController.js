const Project = require("../models/Project");
const User    = require("../models/User");
const Task    = require("../models/Task"); // Nhớ require Task để xóa task liên quan

// @desc    Tạo project → người tạo tự động thành leader
// @route   POST /api/projects
const createProject = async (req, res) => {
    try {
        const { name, description } = req.body;

        const project = await Project.create({
            name,
            description,
            leader: req.user._id,
            members: [],
        });

        // Nâng role của người tạo lên "leader" nếu đang là member
        if (req.user.role !== "leader" && req.user.role !== "admin") {
            await User.findByIdAndUpdate(req.user._id, { role: "leader" });
        }

        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ message: "Khởi tạo dự án thất bại", error: error.message });
    }
};

// @desc    Lấy danh sách project của user hiện tại (Leader thấy dự án mình quản lý, Member thấy dự án mình tham gia)
// @route   GET /api/projects
const getMyProjects = async (req, res) => {
    try {
        const projects = await Project.find({
            $or: [
                { leader: req.user._id },
                { members: req.user._id },
            ],
        })
            .populate("leader", "name email profileImageUrl")
            .populate("members", "name email profileImageUrl")
            .sort({ createdAt: -1 });

        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: "Lỗi máy chủ khi tải danh sách dự án", error: error.message });
    }
};

// @desc    Lấy chi tiết 1 project 
// @route   GET /api/projects/:projectId
const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId)
            .populate("leader", "name email profileImageUrl")
            .populate("members", "name email profileImageUrl");

        if (!project) {
            return res.status(404).json({ message: "Không tìm thấy thông tin dự án" });
        }

        res.json(project);
    } catch (error) {
        res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
    }
};

// @desc    Cập nhật project (Chỉ Leader của dự án hoặc Admin)
// @route   PUT /api/projects/:projectId
const updateProject = async (req, res) => {
    try {
        const { name, description, status } = req.body;
        
        // Kiểm tra quyền: Phải là leader của project đó HOẶC là admin
        const projectCheck = await Project.findById(req.params.projectId);
        if (!projectCheck) return res.status(404).json({ message: "Dự án không tồn tại" });

        if (projectCheck.leader.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Bạn không có quyền chỉnh sửa dự án này" });
        }

        const project = await Project.findByIdAndUpdate(
            req.params.projectId,
            { name, description, status },
            { new: true }
        );

        res.json(project);
    } catch (error) {
        res.status(500).json({ message: "Cập nhật thông tin thất bại", error: error.message });
    }
};

// @desc    Xóa project (Chỉ Leader của dự án hoặc Admin)
// @route   DELETE /api/projects/:projectId
const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId);
        if (!project) {
            return res.status(404).json({ message: "Dự án không tồn tại" });
        }

        // Quyền hạn: Phải là chủ dự án HOẶC Admin mới được xóa
        if (project.leader.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Bạn không có quyền xóa dự án này" });
        }

        await Project.findByIdAndDelete(req.params.projectId);
        
        // Xóa tất cả các Task liên quan đến dự án này để dọn dẹp database
        await Task.deleteMany({ projectId: req.params.projectId });

        res.json({ message: "Dự án và các dữ liệu liên quan đã được xóa vĩnh viễn" });
    } catch (error) {
        res.status(500).json({ message: "Quá trình xóa dự án thất bại", error: error.message });
    }
};

// @desc    Xóa thành viên khỏi dự án (Chỉ Leader dự án hoặc Admin)
// @route   DELETE /api/projects/:projectId/members/:userId
const removeMember = async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(
            req.params.projectId,
            { $pull: { members: req.params.userId } },
            { new: true }
        ).populate("members", "name email profileImageUrl");

        res.json(project);
    } catch (error) {
        res.status(500).json({ message: "Không thể xóa thành viên khỏi dự án", error: error.message });
    }
};

// @desc    Admin: Lấy tất cả dự án trong hệ thống
// @route   GET /api/projects/admin/all (Chỉ Admin)
const getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find()
            .populate("leader", "name email profileImageUrl")
            .populate("members", "name email")
            .sort({ createdAt: -1 });

        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: "Lỗi máy chủ khi lấy dữ liệu hệ thống", error: error.message });
    }
};

module.exports = {
    createProject,
    getMyProjects,
    getProjectById,
    updateProject,
    deleteProject,
    removeMember,
    getAllProjects,
};