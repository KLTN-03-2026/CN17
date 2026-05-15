const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
    getDashboardData,
    getUserDashboardData,
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateTaskChecklist,
    uploadTaskAttachment,
} = require("../controllers/taskController");

// Dashboard
router.get("/dashboard-data", protect, getDashboardData);
router.get("/user-dashboard-data", protect, getUserDashboardData);

// CRUD task
router.get("/", protect, getTasks);
router.post("/", protect, createTask);

// Upload file cho task
router.post(
    "/:id/upload",
    protect,
    (req, res, next) => {
        upload.single("file")(req, res, function (err) {
            if (err) {
                console.error("MULTER UPLOAD ERROR:", err);

                return res.status(400).json({
                    message: err.message || "Lỗi upload file",
                });
            }

            next();
        });
    },
    uploadTaskAttachment
);

router.get("/:id", protect, getTaskById);
router.put("/:id", protect, updateTask);
router.delete("/:id", protect, deleteTask);

// Cập nhật trạng thái & checklist
router.put("/:id/status", protect, updateTaskStatus);
router.put("/:id/todo", protect, updateTaskChecklist);

module.exports = router;