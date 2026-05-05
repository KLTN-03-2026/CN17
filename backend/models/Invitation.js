const mongoose = require("mongoose");

// Leader tìm kiếm user -> gửi invite -> member accept/decline
const InvitationSchema = new mongoose.Schema(
    {
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true,
        },

        // Leader gửi lời mời
        fromUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Member được mời
        toUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        status: {
            type: String,
            enum: ["pending", "accepted", "declined"],
            default: "pending",
        },
    },
    { timestamps: true }
);

// Không cho phép invite cùng 1 người vào cùng 1 project 2 lần
InvitationSchema.index({ project: 1, toUser: 1 }, { unique: true });

module.exports = mongoose.model("Invitation", InvitationSchema);