import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
    handle: {
        type: String,
        required: true,
        trim: true
    },
    id: {
        type: Number,
        required: true,
        unique: true
    },
    contestId: {
        type: Number,
        default: null
    },
    creationTimeSeconds: {
        type: Number,
        required: true
    },
    problem: {
        contestId: {
            type: Number,
            default: null
        },
        index: {
            type: String,
            default: ''
        },
        name: {
            type: String,
            default: ''
        },
        type: {
            type: String,
            default: ''
        },
        rating: {
            type: Number,
            default: null
        }
    },
    programmingLanguage: {
        type: String,
        default: ''
    },
    verdict: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

const Submission = mongoose.model("Submission", submissionSchema);

export default Submission;