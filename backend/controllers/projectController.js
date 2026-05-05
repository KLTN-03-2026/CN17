    const Project = require("../models/Project");
const User    = require("../models/User");

// Tạo project → người tạo tự động thành leader
// POST /api/projects
const createProject = async (req, res) => {
    try {
        const { name, description } = req.body;

        const project = await Project.create({
            name,
            description,
            leader: req.user._id,
            members: [],
        });

        // Nâng role của người tạo lên "leader" nếu chưa phải
        if (req.user.role !== "leader" && req.user.role !== "admin") {
            await User.findByIdAndUpdate(req.user._id, { role: "leader" });
        }

        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ message: "Tạo project thất bại", error: error.message });
    }
};

//  Lấy danh sách project của user hiện tại 
// GET /api/projects
const getMyProjects = async (req, res) => {
    try {
        // Trả về project mà user là leader hoặc member
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
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

//  Lấy chi tiết 1 project 
// GET /api/projects/:projectId
const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId)
            .populate("leader", "name email profileImageUrl")
            .populate("members", "name email profileImageUrl");

        if (!project) {
            return res.status(404).json({ message: "Không tìm thấy project" });
        }

        res.json(project);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// Cập nhật project (chỉ leader của project đó) 
// PUT /api/projects/:projectId
const updateProject = async (req, res) => {
    try {
        const { name, description, status } = req.body;

        const project = await Project.findByIdAndUpdate(
            req.params.projectId,
            { name, description, status },
            { new: true }
        );

        res.json(project);
    } catch (error) {
        res.status(500).json({ message: "Cập nhật thất bại", error: error.message });
    }
};

// Xóa project (chỉ leader của project đó) 
// DELETE /api/projects/:projectId
const deleteProject = async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.projectId);
        res.json({ message: "Đã xóa project" });
    } catch (error) {
        res.status(500).json({ message: "Xóa thất bại", error: error.message });
    }
};

// Xóa member khỏi project (chỉ leader) 
// DELETE /api/projects/:projectId/members/:userId
const removeMember = async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(
            req.params.projectId,
            { $pull: { members: req.params.userId } },
            { new: true }
        ).populate("members", "name email profileImageUrl");

        res.json(project);
    } catch (error) {
        res.status(500).json({ message: "Xóa member thất bại", error: error.message });
    }
};

// Admin: lấy tất cả project 
// GET /api/projects/all  (adminOnly)
const getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find()
            .populate("leader", "name email")
            .populate("members", "name email")
            .sort({ createdAt: -1 });

        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
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