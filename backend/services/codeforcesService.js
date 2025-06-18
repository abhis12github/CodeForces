import axios from "axios";

class CodeforcesService {
    constructor() {
        this.baseURL = 'https://codeforces.com/api';
        this.rateLimitDelay = 2200; // 2 second between requests because codeforces allows only 1 request per 2 seconds
    }

    async fetchUserInfo(handle) {
        try {
            const response = await axios.get(`${this.baseURL}/user.info?handles=${handle}`);
        
            if (response.data.status !== 'OK') {
                throw new Error('Invalid handle or user not found');
            }

            return response.data.result[0];
        } catch (error) {
            throw new Error(`Failed to fetch user info: ${error.message}`);
        }
    }

    async fetchUserRating(handle) {
        try {
            const response = await axios.get(`${this.baseURL}/user.rating?handle=${handle}`);
            return response.data.status === 'OK' ? response.data.result : [];
        } catch (error) {
            console.log(`No rating history for ${handle}`);
            return [];
        }
    }

    async fetchUserSubmissions(handle, count = 10000) {
        try {
            const response = await axios.get(`${this.baseURL}/user.status?handle=${handle}&from=1&count=${count}`);
            return response.data.status === 'OK' ? response.data.result : [];
        } catch (error) {
            console.log(`No submissions found for ${handle}`);
            return [];
        }
    }

    async fetchCompleteUserData(handle) {
        // Add delay to handle codeforces rate limits
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        const userInfo = await this.fetchUserInfo(handle);
        await delay(this.rateLimitDelay);

        const contestHistory = await this.fetchUserRating(handle);
        await delay(this.rateLimitDelay);

        const submissions = await this.fetchUserSubmissions(handle);

        return {
            userInfo,
            contestHistory,
            submissions,
            lastSyncTime: Date.now()
        };
    }
}

export default CodeforcesService;