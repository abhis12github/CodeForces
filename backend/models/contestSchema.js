import mongoose from "mongoose";

const contestSchema = new mongoose.Schema({
    handle: {
        type: String,
        required: true,
        trim: true
    },
    contestName: {
        type: String,
        required: true,
        default: 'Unknown Contest'
    },
    rank: {
        type: Number,
        required: true,
        default: 0
    },
    oldRating: {
        type: Number,
        required: true,
        default: 0
    },
    newRating: {
        type: Number,
        required: true,
        default: 0
    },
    contestCreatedAt: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});


contestSchema.index({ handle: 1, contestCreatedAt: -1 });

const Contest = mongoose.model("Contest", contestSchema);

export default Contest;