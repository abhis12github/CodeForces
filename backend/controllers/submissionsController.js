import Submission from "../models/submissionsSchema.js";
import User from "../models/userSchema.js";

// Get problem solving statistics
export const getProblemStats = async (req, res) => {
    try {
        const { handle } = req.params;
        const { days = 30 } = req.query;
        
        const user = await User.findOne({ handle });
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(days));
        const daysAgoSeconds = Math.floor(daysAgo.getTime() / 1000);

        // Get accepted submissions in the date range
        const acceptedSubmissions = await Submission.find({
            handle,
            verdict: "OK",
            creationTimeSeconds: { $gte: daysAgoSeconds }
        }).sort({ creationTimeSeconds: -1 });

        // Remove duplicate problems (same contestId + index)
        const uniqueProblems = [];
        const seenProblems = new Set();
        
        acceptedSubmissions.forEach(sub => {
            const problemKey = `${sub.problem.contestId}-${sub.problem.index}`;
            if (!seenProblems.has(problemKey) && sub.problem.rating) {
                seenProblems.add(problemKey);
                uniqueProblems.push(sub);
            }
        });

        // Calculate statistics
        const totalProblems = uniqueProblems.length;
        const ratings = uniqueProblems.map(p => p.problem.rating).filter(r => r);
        const avgRating = ratings.length > 0 ? Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length) : 0;
        const maxRating = ratings.length > 0 ? Math.max(...ratings) : 0;
        const avgProblemsPerDay = totalProblems / parseInt(days);

        // Rating distribution
        const ratingBuckets = {};
        ratings.forEach(rating => {
            const bucket = Math.floor(rating / 100) * 100;
            ratingBuckets[bucket] = (ratingBuckets[bucket] || 0) + 1;
        });

        // Submission heatmap data (problems solved per day)
        const heatmapData = {};
        uniqueProblems.forEach(sub => {
            const date = new Date(sub.creationTimeSeconds * 1000).toISOString().split('T')[0];
            heatmapData[date] = (heatmapData[date] || 0) + 1;
        });

        return res.status(200).json({
            message: "Problem statistics fetched successfully",
            success: true,
            stats: {
                totalProblems,
                avgRating,
                maxRating,
                avgProblemsPerDay: Math.round(avgProblemsPerDay * 100) / 100,
                ratingDistribution: ratingBuckets,
                heatmapData,
                recentProblems: uniqueProblems.slice(0, 10) // Last 10 unique problems
            },
            user: {
                handle: user.handle,
                firstName: user.firstName,
                lastName: user.lastName
            }
        });

    } catch (error) {
        console.error("Error fetching problem stats:", error);
        return res.status(500).json({ message: "Failed to fetch problem statistics", success: false });
    }
};