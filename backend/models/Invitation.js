const mongoose = require("mongoose");

// Leader tìm kiếm user → gửi invite → member accept/decline
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

// Index để query nhanh 
InvitationSchema.index({ project: 1, toUser: 1 });

module.exports = mongoose.model("Invitation", InvitationSchema);