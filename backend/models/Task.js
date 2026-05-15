const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
    text: { type: String, required: true },
    completed: { type: Boolean, default: false },
});

const attachmentSchema = new mongoose.Schema(
    {
        originalName: { type: String },
        fileName: { type: String },
        fileUrl: { type: String },
        fileType: { type: String },
        fileSize: { type: Number },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        uploadedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: true }
);

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
            enum: ["pending", "in progress", "completed", "overdue"],
            default: "pending",
        },

        dueDate: { type: Date },

        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true,
        },

        assignedTo: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        attachments: [attachmentSchema],

        todoChecklist: [todoSchema],

        progress: { type: Number, default: 0 },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Task", TaskSchema);