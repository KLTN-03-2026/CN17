const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { registerUser, loginUser, getUserProfile, updateUserProfile, resetPassword } = require('../controllers/authControllers');
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");

router.post("/register",       registerUser);
router.post("/login",          loginUser);
router.post("/reset-password", resetPassword);          
router.get("/profile",  protect, getUserProfile);
router.put("/profile",  protect, updateUserProfile);

router.post("/upload-image", upload.single("image"), (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const imageUrl = `${req.protocol}://${req.get("host")}/upload/${req.file.filename}`;
    res.status(200).json({ imageUrl });
});

module.exports = router;