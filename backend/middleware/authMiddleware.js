const jwt = require("jsonwebtoken");

const User = require("../models/User");

// middleware de bao ve cac route can xac thuc
const protect = async (req, res, next) => {
    try {
        let token = req.headers.authorization; // lay token tu header Authorization

        if (token && token.startsWith("Bearer")) {
            token = token.split(" ")[1]; // tach token tu
            const decoded = jwt.verify(token, process.env.JWT_SECRET); // giai ma token
            req.user = await User.findById(decoded.id).select("-password");
            next(); // cho phep tiep tuc xu ly request
        } else {
            res.status(401);
            throw new Error("Not authorized, no token"); // 
        }
    } catch (error) {
        res.status(401).json({ message: " token failed" , error: error.message }); 
    } 
};

// middleware de kiem tra neu nguoi dung la admin
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(403).json({ message: "Access denied, admin only" });
    }
};

module.exports = { protect, adminOnly };
