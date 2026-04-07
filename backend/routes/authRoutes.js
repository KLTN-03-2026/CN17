const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { registerUser, loginUser, getUserProfile, updateUserProfile } = require('../controllers/authControllers');
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
// auth routes
router.post("/register", registerUser); // dang ky tai khoan
router.post("/login", loginUser); // dang nhap tai khoan
router.get("/profile", protect, getUserProfile); // lay thong tin ca nhan
router.put("/profile", protect, updateUserProfile); // cap nhat thong tin ca nhan

router.post("/upload-image", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    res.status(200).json({ imageUrl });
});

module.exports = router;