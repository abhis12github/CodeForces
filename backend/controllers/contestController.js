import Contest from "../models/contestSchema.js";
import User from "../models/userSchema.js";

// Get contest history with filtering
export const getContestHistory = async (req, res) => {
    try {
        const { handle } = req.params;
        const { days = 365 } = req.query;
        
        const user = await User.findOne({ handle });
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(days));

        const contests = await Contest.find({
            handle,
            contestCreatedAt: { $gte: daysAgo }
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Contest history fetched successfully",
            success: true,
            contests,
            user: {
                handle: user.handle,
                firstName: user.firstName,
                lastName: user.lastName,
                currentRating: user.rating,
                maxRating: user.maxRating
            }
        });

    } catch (error) {
        console.error("Error fetching contest history:", error);
        return res.status(500).json({ message: "Failed to fetch contest history", success: false });
    }
};