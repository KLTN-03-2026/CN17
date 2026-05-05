const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
    text: { type: String, required: true },
    completed: { type: Boolean, default: false },
});

const TaskSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium",
        },
        status: {
            type: String,
            enum: ["pending", "in progress", "completed"],
            default: "pending",
        },
        dueDate: { type: Date },

        // Task thuộc về project nào (leader quản lý)
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true,
        },

        // Người được giao task — phải là member của project
        assignedTo: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        // Người tạo task — phải là leader của project
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        attachments: [{ type: String }],
        todoChecklist: [todoSchema],
        progress: { type: Number, default: 0 },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Task", TaskSchema);