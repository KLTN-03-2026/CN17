const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
    createNotification,
    getProjectNotifications,
    getAllProjectNotificationsForLeader,
    updateNotification,
    deleteNotification,
} = require("../controllers/notificationController");

// Leader tạo thông báo
router.post("/", protect, createNotification);

// Member/Leader xem thông báo còn hiệu lực khi click vào project
router.get("/project/:projectId", protect, getProjectNotifications);

// Leader xem tất cả thông báo để quản lý
router.get("/project/:projectId/manage", protect, getAllProjectNotificationsForLeader);

// Leader sửa/xóa
router.put("/:id", protect, updateNotification);
router.delete("/:id", protect, deleteNotification);

module.exports = router;