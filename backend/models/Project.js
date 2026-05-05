const mongoose = require("mongoose");

// Khi member click "Tạo dự án" → tạo Project → user đó thành leader
const ProjectSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String },

        // Người tạo project — tự động trở thành leader
        leader: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Danh sách member đã được chấp nhận vào project
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        status: {
            type: String,
            enum: ["active", "completed", "archived"],
            default: "active",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Project", ProjectSchema);