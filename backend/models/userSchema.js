import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema({
    handle: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    rank: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
    },
    maxRating: {
        type: Number,
        required: true
    },
    avatar: {
        type: String,
        required: true
    },
    lastSyncTime: {
        type: Date,
        default: Date.now()
    }
}, {
    timestamps: true
});

const User = mongoose.model("User", userSchema);

export default User;