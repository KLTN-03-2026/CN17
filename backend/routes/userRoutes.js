const express = require("express");
const {getUsers, getUserById, deleteUser} = require("../controllers/useControllers");
const { protect, adminOnly } = require("../middleware/authMiddleware");


const router = express.Router();

// nguoi quan ly router

router.get("/", protect , adminOnly, getUsers); // lay danh sach tat ca nguoi dung (chi admin moi co quyen truy cap)
router.get("/:id", protect, getUserById); 


module.exports = router;