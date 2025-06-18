import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    handle: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        default: ''
    },
    firstName: {
        type: String,
        default: ''
    },
    lastName: {
        type: String,
        default: ''
    },
    rank: {
        type: String,
        required: true,
        default: 'unrated'
    },
    rating: {
        type: Number,
        required: true,
        default: 0
    },
    maxRating: {
        type: Number,
        required: true,
        default: 0
    },
    avatar: {
        type: String,
        default: ''
    },
    lastSyncTime: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const User = mongoose.model("User", userSchema);

export default User;