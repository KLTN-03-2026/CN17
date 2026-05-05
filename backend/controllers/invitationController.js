const Invitation = require("../models/Invitation");
const Project    = require("../models/Project");
const User       = require("../models/User");

// Leader tìm kiếm user để mời 
// GET /api/invitations/search?email
const searchUsers = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: "Vui lòng nhập email để tìm kiếm" });
        }

        // Tìm user theo email 
        const users = await User.find({
            email: { $regex: email, $options: "i" },
            role: { $ne: "admin" },
            _id: { $ne: req.user._id }, // không tìm chính mình
        }).select("name email profileImageUrl role");

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// Leader gửi lời mời 
// POST /api/invitations
// body: { projectId, toUserId }
const sendInvitation = async (req, res) => {
    try {
        const { projectId, toUserId } = req.body;

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Không tìm thấy project" });
        }

        // Kiểm tra leader của project này chính là người gửi
        if (project.leader.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Chỉ leader mới được gửi lời mời" });
        }

        // Kiểm tra user được mời có tồn tại không
        const toUser = await User.findById(toUserId);
        if (!toUser) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }

        // Kiểm tra user đã là member chưa
        if (project.members.map((id) => id.toString()).includes(toUserId)) {
            return res.status(400).json({ message: "Người dùng đã là thành viên của project" });
        }

        // Kiểm tra đã có invite pending chưa 
        const existing = await Invitation.findOne({
            project: projectId,
            toUser: toUserId,
            status: "pending",
        });
        if (existing) {
            return res.status(400).json({ message: "Đã gửi lời mời cho người này rồi" });
        }

        const invitation = await Invitation.create({
            project: projectId,
            fromUser: req.user._id,
            toUser: toUserId,
        });

        await invitation.populate([
            { path: "project", select: "name" },
            { path: "fromUser", select: "name email profileImageUrl" },
            { path: "toUser",   select: "name email profileImageUrl" },
        ]);

        res.status(201).json(invitation);
    } catch (error) {
        res.status(500).json({ message: "Gửi lời mời thất bại", error: error.message });
    }
};

// Member xem danh sách lời mời đang chờ
// GET /api/invitations/my
const getMyInvitations = async (req, res) => {
    try {
        const invitations = await Invitation.find({
            toUser: req.user._id,
            status: "pending",
        })
            .populate("project", "name description")
            .populate("fromUser", "name email profileImageUrl")
            .sort({ createdAt: -1 });

        res.json(invitations);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// Member chấp nhận lời mời
// PATCH /api/invitations/:id/accept
const acceptInvitation = async (req, res) => {
    try {
        const invitation = await Invitation.findById(req.params.id);

        if (!invitation) {
            return res.status(404).json({ message: "Không tìm thấy lời mời" });
        }

        // Chỉ người được mời mới có thể accept
        if (invitation.toUser.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Bạn không có quyền thực hiện thao tác này" });
        }

        if (invitation.status !== "pending") {
            return res.status(400).json({ message: "Lời mời này đã được xử lý" });
        }

        // Cập nhật status invite
        invitation.status = "accepted";
        await invitation.save();

        // Thêm member vào project
        await Project.findByIdAndUpdate(invitation.project, {
            $addToSet: { members: req.user._id },
        });

        res.json({ message: "Đã chấp nhận lời mời", invitation });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// Member từ chối lời mời
// PATCH /api/invitations/:id/decline
const declineInvitation = async (req, res) => {
    try {
        const invitation = await Invitation.findById(req.params.id);

        if (!invitation) {
            return res.status(404).json({ message: "Không tìm thấy lời mời" });
        }

        if (invitation.toUser.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Bạn không có quyền thực hiện thao tác này" });
        }

        if (invitation.status !== "pending") {
            return res.status(400).json({ message: "Lời mời này đã được xử lý" });
        }

        invitation.status = "declined";
        await invitation.save();

        res.json({ message: "Đã từ chối lời mời", invitation });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// Leader xem danh sách invite đã gửi cho 1 project
// GET /api/invitations/project/:projectId
const getProjectInvitations = async (req, res) => {
    try {
        const invitations = await Invitation.find({
            project: req.params.projectId,
        })
            .populate("toUser", "name email profileImageUrl")
            .sort({ createdAt: -1 });

        res.json(invitations);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

module.exports = {
    searchUsers,
    sendInvitation,
    getMyInvitations,
    acceptInvitation,
    declineInvitation,
    getProjectInvitations,
};