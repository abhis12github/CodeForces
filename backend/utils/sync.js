import Contest from "../models/contestSchema.js";
import Submission from "../models/submissionsSchema.js";
import User from "../models/userSchema.js";
import CodeforcesService from "../services/codeforcesService.js";
import emailService from "../services/emailService.js";

const codeforcesService = new CodeforcesService();

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const syncAllUsers = async () => {
    try {
        const users = await User.find({}, 'handle email firstName lastName');
        const results = {
            success: 0,
            failed: 0,
            inactive: 0,
            errors: []
        };

        for (const user of users) {
            try {
                console.log(`Syncing data for user: ${user.handle}`);

                // Update user info
                const {
                    firstName,
                    lastName,
                    email: fetchedEmail,
                    rank,
                    rating,
                    maxRating,
                    avatar
                } = await codeforcesService.fetchUserInfo(user.handle);

                const updateFields = {
                    firstName,
                    lastName,
                    rank,
                    rating,
                    maxRating,
                    avatar,
                    lastSyncTime: new Date()
                };

                if (fetchedEmail) {
                    updateFields.email = fetchedEmail;
                }

                await User.findOneAndUpdate(
                    { handle: user.handle },
                    { $set: updateFields }
                );

                // Add delay before fetching contest - codeforces rate limit
                await delay(2200);

                // Fetch and save contest data
                console.log(`Fetching contest history for handle: ${user.handle}`);
                const contestHistory = await codeforcesService.fetchUserRating(user.handle);

                let contestCount = 0;
                if (contestHistory && contestHistory.length > 0) {
                    // Delete existing contests for this user (safety check)
                    await Contest.deleteMany({ handle : user.handle });

                    // Insert new contest data
                    const contestData = contestHistory.map(contest => ({
                        handle:user.handle,
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
                console.log(`Fetching submissions for handle: ${user.handle}`);
                const submissions = await codeforcesService.fetchUserSubmissions(user.handle);

                let submissionCount = 0;
                if (submissions && submissions.length > 0) {
                    // Delete existing submissions for this user
                    await Submission.deleteMany({ handle:user.handle });

                    // Filter and prepare submission data
                    const submissionData = submissions
                        .filter(sub => sub.id)
                        .map(sub => ({
                            handle:user.handle,
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

                // Check for inactivity
                const isInactive = await checkUserInactivity(user.handle);
                if (isInactive) {
                    await sendInactivityEmail(user);
                    results.inactive++;
                }

                results.success++;
                console.log(`Successfully synced user: ${user.handle}`);

                // Add delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));

            } catch (error) {
                results.failed++;
                results.errors.push(`${user.handle}: ${error.message}`);
                console.error(`Failed to sync user ${user.handle}:`, error.message);
            }
        }

        console.log('Sync completed:', results);
        return results;
    } catch (error) {
        console.error('Failed to sync all users:', error);
        throw error;
    }
};

export const checkUserInactivity = async (handle) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const sevenDaysAgoSeconds = Math.floor(sevenDaysAgo.getTime() / 1000);

        const recentSubmission = await Submission.findOne({
            handle: handle,
            creationTimeSeconds: { $gte: sevenDaysAgoSeconds }
        }).sort({ creationTimeSeconds: -1 });

        return !recentSubmission; // Returns true if no recent submissions (inactive)
    } catch (error) {
        console.error(`Error checking inactivity for ${handle}:`, error);
        return false;
    }
};

export const sendInactivityEmail = async (user) => {
    try {
        if (!user.email) {
            console.log(`No email found for user: ${user.handle}`);
            return;
        }

        const emailContent = {
            to: user.email,
            subject: '🚀 Time to get back to coding!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">Hey ${user.firstName || user.handle}! 👋</h1>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
                        <p style="font-size: 18px; color: #333; margin-bottom: 20px;">
                            We noticed you haven't been active on Codeforces for the past 7 days. 
                        </p>
                        
                        <p style="font-size: 16px; color: #555; margin-bottom: 25px;">
                            Don't let your coding skills get rusty! Here are some ways to get back on track:
                        </p>
                        
                        <ul style="font-size: 16px; color: #555; margin-bottom: 25px; padding-left: 20px;">
                            <li style="margin-bottom: 10px;">🎯 Solve a problem from your favorite rating range</li>
                            <li style="margin-bottom: 10px;">🏆 Participate in the next contest</li>
                            <li style="margin-bottom: 10px;">📚 Try problems from a new topic or algorithm</li>
                            <li style="margin-bottom: 10px;">💪 Challenge yourself with a harder problem</li>
                        </ul>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="https://codeforces.com/profile/${user.handle}" 
                               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                      color: white; padding: 15px 30px; text-decoration: none; 
                                      border-radius: 25px; font-weight: bold; display: inline-block;">
                                Visit Your Profile
                            </a>
                        </div>
                        
                        <p style="font-size: 14px; color: #777; text-align: center; margin-top: 30px;">
                            Keep coding, keep growing! 🚀<br>
                            <em>Your Competitive Programming Team</em>
                        </p>
                    </div>
                </div>
            `
        };

        await emailService.sendEmail(emailContent);
        console.log(`Inactivity email sent to ${user.handle} (${user.email})`);
    } catch (error) {
        console.error(`Failed to send inactivity email to ${user.handle}:`, error);
    }
};