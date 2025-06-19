import cron from 'node-cron';
import { syncAllUsers } from './sync.js';

export const setupCronJobs = () => {
    // Daily sync at 2:00 AM
    cron.schedule('0 2 * * *', async () => {
        console.log('Starting daily user sync at 2:00 AM...');
        try {
            const results = await syncAllUsers();
            console.log('Daily sync completed successfully:', results);
        } catch (error) {
            console.error('Daily sync failed:', error);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata" 
    });

    console.log('Cron jobs scheduled successfully');
};