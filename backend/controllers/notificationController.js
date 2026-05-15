const Notification = require("../models/Notification");
const Project = require("../models/Project");

const isProjectLeader = (project, userId) => {
    return project.leader.toString() === userId.toString();
};

const isProjectMemberOrLeader = (project, userId) => {
    const isLeader = project.leader.toString() === userId.toString();

    const isMember = project.members.some(
        (memberId) => memberId.toString() === userId.toString()
    );

    return isLeader || isMember;
};

// Leader tạo thông báo
const createNotification = async (req, res) => {
    try {
        const { projectId, title, message, startAt, endAt } = req.body;

        if (!projectId || !title || !message || !endAt) {
            return res.status(400).json({
                message: "Vui lòng nhập đầy đủ projectId, title, message, endAt",
            });
        }

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                message: "Không tìm thấy dự án",
            });
        }

        if (!isProjectLeader(project, req.user._id)) {
            return res.status(403).json({
                message: "Chỉ leader mới được tạo thông báo",
            });
        }

        const notification = await Notification.create({
            project: projectId,
            title,
            message,
            startAt: startAt || new Date(),
            endAt,
            createdBy: req.user._id,
        });

        res.status(201).json({
            message: "Tạo thông báo thành công",
            notification,
        });
    } catch (error) {
        res.status(500).json({
            message: "Lỗi tạo thông báo",
            error: error.message,
        });
    }
};

// Member/Leader xem thông báo còn hiệu lực trong project
const getProjectNotifications = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                message: "Không tìm thấy dự án",
            });
        }

        if (!isProjectMemberOrLeader(project, req.user._id)) {
            return res.status(403).json({
                message: "Bạn không có quyền xem thông báo của dự án này",
            });
        }

        const now = new Date();

        const notifications = await Notification.find({
            project: projectId,
            startAt: { $lte: now },
            endAt: { $gte: now },
        })
            .populate("createdBy", "name email profileImageUrl")
            .sort({ createdAt: -1 });

        res.status(200).json({
            notifications,
        });
    } catch (error) {
        res.status(500).json({
            message: "Lỗi lấy danh sách thông báo",
            error: error.message,
        });
    }
};

// Leader xem tất cả thông báo của project
const getAllProjectNotificationsForLeader = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                message: "Không tìm thấy dự án",
            });
        }

        if (!isProjectLeader(project, req.user._id)) {
            return res.status(403).json({
                message: "Chỉ leader mới được xem danh sách quản lý thông báo",
            });
        }

        const notifications = await Notification.find({
            project: projectId,
        })
            .populate("createdBy", "name email profileImageUrl")
            .sort({ createdAt: -1 });

        res.status(200).json({
            notifications,
        });
    } catch (error) {
        res.status(500).json({
            message: "Lỗi lấy thông báo",
            error: error.message,
        });
    }
};

// Leader sửa thông báo
const updateNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, message, startAt, endAt } = req.body;

        const notification = await Notification.findById(id);

        if (!notification) {
            return res.status(404).json({
                message: "Không tìm thấy thông báo",
            });
        }

        const project = await Project.findById(notification.project);

        if (!project) {
            return res.status(404).json({
                message: "Không tìm thấy dự án",
            });
        }

        if (!isProjectLeader(project, req.user._id)) {
            return res.status(403).json({
                message: "Chỉ leader mới được sửa thông báo",
            });
        }

        notification.title = title || notification.title;
        notification.message = message || notification.message;
        notification.startAt = startAt || notification.startAt;
        notification.endAt = endAt || notification.endAt;

        await notification.save();

        res.status(200).json({
            message: "Cập nhật thông báo thành công",
            notification,
        });
    } catch (error) {
        res.status(500).json({
            message: "Lỗi cập nhật thông báo",
            error: error.message,
        });
    }
};

// Leader xóa thông báo
const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findById(id);

        if (!notification) {
            return res.status(404).json({
                message: "Không tìm thấy thông báo",
            });
        }

        const project = await Project.findById(notification.project);

        if (!project) {
            return res.status(404).json({
                message: "Không tìm thấy dự án",
            });
        }

        if (!isProjectLeader(project, req.user._id)) {
            return res.status(403).json({
                message: "Chỉ leader mới được xóa thông báo",
            });
        }

        await notification.deleteOne();

        res.status(200).json({
            message: "Xóa thông báo thành công",
        });
    } catch (error) {
        res.status(500).json({
            message: "Lỗi xóa thông báo",
            error: error.message,
        });
    }
};

module.exports = {
    createNotification,
    getProjectNotifications,
    getAllProjectNotificationsForLeader,
    updateNotification,
    deleteNotification,
};