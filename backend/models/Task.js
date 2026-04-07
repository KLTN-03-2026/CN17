
const { text } = require("express");
const mongoose = require("mongoose");
const { createIndexes } = require("./User");

const todoSchema = new mongoose.Schema({
    text: { type: String, required: true },
    completed: { type: Boolean, default: false },
}) ; 

const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String},
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" }, // muc do uu tien, mac dinh la "medium"
    status: { type: String, enum: ["pending", "in progress", "completed"], default: "pending" }, // trang thai cua task, mac dinh la "pending"
    dueDate: { type: Date }, // ngay het han
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // nguoi duoc giao task, tham chieu den model User
    createBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // nguoi tao task, tham chieu den model User
    attachments: [{ type: String }], // danh sach cac file dinh kem, luu tru duong dan file
    todoChecklist: [todoSchema], // danh sach cac cong viec con trong task
    progress : { type: Number, default: 0 }, // tien do hoan thanh task, tinh theo phan tram
},
{ timestamps: true } // tu dong them createdAt va updatedAt
);
module.exports = mongoose.model("Task", TaskSchema);
