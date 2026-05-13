const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {
        name:            { type: String, required: true },
        email:           { type: String, required: true, unique: true },
        password:        { type: String, required: true },
        profileImageUrl: { type: String, default: null },
        role: {
            type: String,
            enum: ["admin", "member", "leader"],
            default: "member",
        },
        status: {
            type: String,
            enum: ["active", "blocked"],
            default: "active", 
        },
        // ---------------------------------
        dateOfBirth: { type: Date,   default: null },
        hometown:    { type: String, default: null },
        bio:         { type: String, default: null },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);