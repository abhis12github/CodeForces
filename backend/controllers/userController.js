import Contest from "../models/contestSchema.js";
import Submission from "../models/submissionsSchema.js";
import User from "../models/userSchema.js";
import CodeforcesService from "../services/codeforcesService.js";


const codeforcesService = new CodeforcesService();

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const createUser = async (req, res) => {
    try {
        const { handle } = req.body;

        if (!handle) {
            return res.status(400).send({ message: "User handle is required", success: false });
        }

        const existingUser = await User.findOne({ handle });

        if (existingUser) {
            return res.status(400).send({ message: "User is already added", success: false });
        }

        // Fetch user data from codeforces using handle
        console.log(`Fetching user info for handle: ${handle}`);
        const userInfo = await codeforcesService.fetchUserInfo(handle);

        // Extract and validate user data
        const userData = {
            handle,
            firstName: userInfo.firstName || '',
            lastName: userInfo.lastName || '',
            email: userInfo.email || '',
            rank: userInfo.rank || 'unrated',
            rating: userInfo.rating || 0,
            maxRating: userInfo.maxRating || userInfo.rating || 0,
            avatar: userInfo.avatar || userInfo.titlePhoto || '',
            friends: userInfo.friendOfCount,
            lastSyncTime: new Date()
        };

        console.log("User data to be saved:", userData);

        // Create user first
        const user = await User.create(userData);
        console.log("User created successfully");

        // Add delay before fetching contest - codeforces rate limit
        await delay(2200);

        // Fetch and save contest data
        console.log(`Fetching contest history for handle: ${handle}`);
        const contestHistory = await codeforcesService.fetchUserRating(handle);

        let contestCount = 0;
        if (contestHistory && contestHistory.length > 0) {
            // Delete existing contests for this user (safety check)
            await Contest.deleteMany({ handle });

            // Insert new contest data
            const contestData = contestHistory.map(contest => ({
                handle,
                contestName: contest.contestName || 'Unknown Contest',
                rank: contest.rank || 0,
                oldRating: contest.oldRating || 0,
                newRating: contest.newRating || 0,
                contestCreatedAt: new Date(contest.ratingUpdateTimeSeconds * 1000)
            }));

            await Contest.insertMany(contestData);
            contestCount = contestData.length;
        }

        // Add delay before fetching submissions - codeforces rate limit
        await delay(2200);

        // Fetch and save submissions data
        console.log(`Fetching submissions for handle: ${handle}`);
        const submissions = await codeforcesService.fetchUserSubmissions(handle);

        let submissionCount = 0;
        if (submissions && submissions.length > 0) {
            // Delete existing submissions for this user
            await Submission.deleteMany({ handle });

            // Filter and prepare submission data
            const submissionData = submissions
                .filter(sub => sub.id)
                .map(sub => ({
                    handle,
                    id: sub.id,
                    contestId: sub.contestId || null,
                    creationTimeSeconds: sub.creationTimeSeconds,
                    problem: {
                        contestId: sub.problem?.contestId || null,
                        index: sub.problem?.index || '',
                        name: sub.problem?.name || '',
                        type: sub.problem?.type || '',
                        rating: sub.problem?.rating || null
                    },
                    programmingLanguage: sub.programmingLanguage || '',
                    verdict: sub.verdict || ''
                }));

            if (submissionData.length > 0) {
                try {
                    await Submission.insertMany(submissionData, { ordered: false });
                    submissionCount = submissionData.length;
                } catch (insertError) {
                    submissionCount = submissionData.length;
                }
            }
        }

        return res.status(201).send({
            message: "Successfully added the user",
            success: true,
            user: user,
            contestCount: contestCount,
            submissionCount: submissionCount
        });

    } catch (error) {
        console.error("Error creating user:", error);
        console.error("Error stack:", error.stack);

        // Try to clean up if user was created
        if (req.body.handle) {
            try {
                await User.findOneAndDelete({ handle: req.body.handle });
                await Contest.deleteMany({ handle: req.body.handle });
                await Submission.deleteMany({ handle: req.body.handle });
            } catch (cleanupError) {
                console.error("Error during cleanup:", cleanupError);
            }
        }

        return res.status(500).send({
            message: "Unable to add user",
            success: false,
            error: error.message
        });
    }
};

// get all users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({});

        return res.status(200).send({ message: "Succesfully fetched the users", success: true, users });
    } catch (error) {
        res.status(500).json({ message: "Error while fetching users.", success: false });
    }
};

// get a single user by handle
export const getUserByHandle = async (req, res) => {
    try {
        const user = await User.findOne({ handle: req.params.handle });
        if (!user) return res.status(404).json({ message: "User not found.", success: false });

        return res.status(200).send({ message: "Succesfully fetched the user", success: true, user });
    } catch (error) {
        res.status(400).json({ message: "Invalid user ID.", success: false });
    }
};

// update user by handle
export const updateUser = async (req, res) => {
    try {
        const oldHandle = req.params.handle;
        const newHandle =  req.body.handle?.trim() || oldHandle;
        const providedEmail = req.body.email;

        if (!oldHandle) {
            return res.status(400).json({ message: "old handle is required.", success: false });
        }

        const {
            firstName,
            lastName,
            email: fetchedEmail,
            rank,
            rating,
            maxRating,
            avatar
        } = await codeforcesService.fetchUserInfo(newHandle);

        // Base fields to update
        const updateFields = {
            handle: newHandle,
            firstName,
            lastName,
            rank,
            rating,
            maxRating,
            avatar,
            lastSyncTime: new Date()
        };

        // Add email only if provided or fetched
        const finalEmail = providedEmail || fetchedEmail;
        if (finalEmail?.trim()) {
            updateFields.email = finalEmail;
        }

        const updatedUser = await User.findOneAndUpdate(
            { handle: oldHandle },
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found.", success: false });
        }

        // Add delay before fetching contest - codeforces rate limit
        await delay(2200);

        // Fetch and save contest data
        console.log(`Fetching contest history for handle: ${newHandle}`);
        const contestHistory = await codeforcesService.fetchUserRating(newHandle);

        let contestCount = 0;
        if (contestHistory && contestHistory.length > 0) {
            // Delete existing contests for this user (safety check)
            await Contest.deleteMany({ handle:newHandle });

            // Insert new contest data
            const contestData = contestHistory.map(contest => ({
                handle:newHandle,
                contestName: contest.contestName || 'Unknown Contest',
                rank: contest.rank || 0,
                oldRating: contest.oldRating || 0,
                newRating: contest.newRating || 0,
                contestCreatedAt: new Date(contest.ratingUpdateTimeSeconds * 1000)
            }));

            await Contest.insertMany(contestData);
            contestCount = contestData.length;
        }

        // Add delay before fetching submissions - codeforces rate limit
        await delay(2200);

        // Fetch and save submissions data
        console.log(`Fetching submissions for handle: ${newHandle}`);
        const submissions = await codeforcesService.fetchUserSubmissions(newHandle);

        let submissionCount = 0;
        if (submissions && submissions.length > 0) {
            // Delete existing submissions for this user
            await Submission.deleteMany({ handle : newHandle });

            // Filter and prepare submission data
            const submissionData = submissions
                .filter(sub => sub.id)
                .map(sub => ({
                    handle:newHandle,
                    id: sub.id,
                    contestId: sub.contestId || null,
                    creationTimeSeconds: sub.creationTimeSeconds,
                    problem: {
                        contestId: sub.problem?.contestId || null,
                        index: sub.problem?.index || '',
                        name: sub.problem?.name || '',
                        type: sub.problem?.type || '',
                        rating: sub.problem?.rating || null
                    },
                    programmingLanguage: sub.programmingLanguage || '',
                    verdict: sub.verdict || ''
                }));

            if (submissionData.length > 0) {
                try {
                    await Submission.insertMany(submissionData, { ordered: false });
                    submissionCount = submissionData.length;
                } catch (insertError) {
                    submissionCount = submissionData.length;
                }
            }
        }

        return res.status(200).send({
            message: "Successfully updated the user",
            success: true,
            user: updateUser,
            contestCount: contestCount,
            submissionCount: submissionCount
        });
    } catch (error) {
        return res.status(400).json({ message: error.message, success: false });
    }
};


// delete user by handle
export const deleteUser = async (req, res) => {
    try {
        const deletedUser = await User.findOneAndDelete({ handle: req.params.handle });
        if (!deletedUser) return res.status(404).json({ message: "User not found.", success: false });

        res.status(200).json({ message: "User deleted successfully.", success: true });
    } catch (error) {
        res.status(400).json({ message: "Invalid user ID.", success: false });
    }
};


// Sync all data for a user (contests + submissions) + user data
export const syncUserData = async (req, res) => {
    try {
        const { handle } = req.params;

        const user = await User.findOne({ handle });
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        // Sync contest history
        const contestHistory = await codeforcesService.fetchUserRating(handle);
        await Contest.deleteMany({ handle });

        if (contestHistory.length > 0) {
            const contestData = contestHistory.map(contest => ({
                handle,
                contestName: contest.contestName,
                rank: contest.rank,
                oldRating: contest.oldRating,
                newRating: contest.newRating,
                createdAt: new Date(contest.ratingUpdateTimeSeconds * 1000)
            }));
            await Contest.insertMany(contestData);
        }

        // Add delay for rate limiting
        await new Promise(resolve => setTimeout(resolve, 2200));

        // Sync submissions
        const submissions = await codeforcesService.fetchUserSubmissions(handle);
        await Submission.deleteMany({ handle });

        if (submissions.length > 0) {
            const submissionData = submissions.map(sub => ({ ...sub, handle }));
            await Submission.insertMany(submissionData, { ordered: false });
        }

        // Update user's last sync time
        await User.findOneAndUpdate({ handle }, { lastSyncTime: new Date() });

        return res.status(200).json({
            message: "User data synced successfully",
            success: true,
            syncedData: {
                contests: contestHistory.length,
                submissions: submissions.length
            }
        });

    } catch (error) {
        console.error("Error syncing user data:", error);
        return res.status(500).json({ message: "Failed to sync user data", success: false });
    }
};
