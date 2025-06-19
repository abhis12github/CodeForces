import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Calendar, Trophy, Target, TrendingUp, Award, Brain, Activity, ArrowLeft, Mail, User, User2, Users, Crown, Loader2 } from 'lucide-react';
import { CalendarHeatmap } from '../components/ui/heatmap';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const api = {
    getUserInfo: async (handle) => {
        const response = await axios.get(`http://localhost:4000/api/v1/users/${handle}`);
        if (!response.statusText == "OK") throw new Error('Failed to fetch contest history');
        console.log(response.data.user);
        return response.data.user;
    },
    getContestHistory: async (handle, days = 365) => {
        const response = await axios.get(`http://localhost:4000/api/v1/contests/${handle}?days=${days}`);
        if (!response.statusText == "OK") throw new Error('Failed to fetch contest history');
        console.log(response.data.contests);
        return response.data.contests;
    },

    getProblemStats: async (handle, days = 365) => {

        const response = await axios.get(`http://localhost:4000/api/v1/submissions/${handle}?days=${days}`);

        if (!response.statusText == "OK") throw new Error('Failed to fetch problem stats');
        console.log(response.data.stats);

        return response.data.stats;
    }
};

const getRatingColor = (rating) => {
    if (rating >= 3000) return 'bg-red-600';
    if (rating >= 2400) return 'bg-red-500';
    if (rating >= 2100) return 'bg-orange-500';
    if (rating >= 1900) return 'bg-purple-500';
    if (rating >= 1600) return 'bg-blue-500';
    if (rating >= 1400) return 'bg-cyan-500';
    if (rating >= 1200) return 'bg-green-500';
    return 'text-gray-500';
};

function getRelativeTime(date) {
    const now = new Date();
    const diff = now - date;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

    if (years > 0) return rtf.format(-years, 'year');
    if (months > 0) return rtf.format(-months, 'month');
    if (days > 0) return rtf.format(-days, 'day');
    if (hours > 0) return rtf.format(-hours, 'hour');
    if (minutes > 0) return rtf.format(-minutes, 'minute');
    return rtf.format(-seconds, 'second');
}

// Transform backend rating distribution to frontend format
const transformRatingDistribution = (ratingBuckets) => {
    const buckets = [
        { rating: '0-600', count: 0 },
        { rating: '600-1200', count: 0 },
        { rating: '1200-1400', count: 0 },
        { rating: '1400-1600', count: 0 },
        { rating: '1600-1900', count: 0 },
        { rating: '1900-2100', count: 0 },
        { rating: '2100-2300', count: 0 },
        { rating: '2300-2400', count: 0 },
        { rating: '2400-2600', count: 0 },
        { rating: '2600-3000', count: 0 },
        { rating: '3000+', count: 0 }
    ];

    Object.entries(ratingBuckets).forEach(([rating, count]) => {
        const r = parseInt(rating);
        if (r < 600) buckets[0].count += count;
        else if (r < 1200) buckets[1].count += count;
        else if (r < 1400) buckets[2].count += count;
        else if (r < 1600) buckets[3].count += count;
        else if (r < 1900) buckets[4].count += count;
        else if (r < 2100) buckets[5].count += count;
        else if (r < 2300) buckets[6].count += count;
        else if (r < 2400) buckets[7].count += count;
        else if (r < 2600) buckets[8].count += count;
        else if (r < 3000) buckets[9].count += count;
        else buckets[10].count += count;
    });

    return buckets;
};

// Transform contest data for chart
const transformContestData = (contests) => {
    return contests.map(contest => ({
        date: contest.contestCreatedAt,
        contest: contest.contestName,
        rank: contest.rank,
        oldRating: contest.oldRating,
        newRating: contest.newRating,
        change: contest.newRating - contest.oldRating
    }));
};


export const UserProfilePage = ({ onBack }) => {

    const { handle } = useParams();
    const navigate = useNavigate();
    const [contestFilter, setContestFilter] = useState(365);
    const [problemFilter, setProblemFilter] = useState(30);
    const [userInfo, setUserInfo] = useState(null);
    const [contestData, setContestData] = useState(null);
    const [problemData, setProblemData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch data from backend
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [contestResponse, problemResponse, userInfoResponse] = await Promise.all([
                    api.getContestHistory(handle, contestFilter),
                    api.getProblemStats(handle, problemFilter),
                    api.getUserInfo(handle)
                ]);

                setUserInfo(userInfoResponse);
                setContestData(contestResponse);
                setProblemData(problemResponse);
            } catch (err) {
                setError(err.message);
                console.error('Failed to fetch data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [handle, contestFilter, problemFilter]);

    // Transform data for display
    console.log(userInfo);
    console.log("contests", contestData);

    const handleBack = () => {
        navigate("/users");
    };

    const user = userInfo || {};
    const contests = contestData || [];
    const problemStats = problemData || {};

    const filteredContestHistory = useMemo(() => {
        return transformContestData(contests).sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [contests]);

    const ratingDistribution = useMemo(() => {
        return transformRatingDistribution(problemStats.ratingDistribution || {});
    }, [problemStats.ratingDistribution]);

    // Generate heatmap data from backend
    const heatmapData = useMemo(() => {
        if (!problemStats.heatmapData) return [];

        return Object.entries(problemStats.heatmapData).map(([date, count]) => ({
            date: new Date(date),
            weight: count
        }));
    }, [problemStats.heatmapData]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                <div className="flex items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    <span className="text-lg text-gray-700 dark:text-gray-300">Loading profile...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">Error Loading Profile</h2>
                    <p className="text-gray-600 dark:text-gray-400">{error}</p>
                    <Button onClick={() => window.location.reload()} className="mt-4">
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }
    return (
        <div className="min-h-screen  p-6 bg-gradient-to-br from-purple-50 to-white">
            <div className=" max-w-5xl mx-auto p-8 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4 capriola-font">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBack}
                        className="hover:bg-white/60"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Users
                    </Button>
                </div>

                {/* Student Header Card */}
                <Card className="border-2 rounded-2xl border-gray-100 dark:border-[#383838] dark:bg-[#212121] ">
                    <CardContent className=" px-10 py-2">
                        <div className="flex items-start gap-6 justify-between">
                            <div className='flex flex-col gap-4 self-stretch'>
                                <div className='flex gap-4 '>
                                    <Avatar className=" h-20 w-20 ring-4 ring-white shadow-lg">
                                        <AvatarImage src={user.avatar} alt={user.handle} />
                                        <AvatarFallback className="text-2xl font-bold">
                                            {user.firstName[0]}{user.lastName[0]}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 pt-4">
                                        <div className="flex items-center gap-4">
                                            <h1 className="text-2xl font-semibold text-gray-900 capriola-font">
                                                {user.handle}
                                            </h1>

                                        </div>

                                        <p className=" text-lg text-gray-600 copper-font"> {user.firstName} {user.lastName}</p>
                                    </div>
                                </div>

                                <div className='flex flex-col gap-0'>
                                    <div className='flex gap-4 items-center pt-4'>
                                        {/* <Trophy className='h-5 w-5 text-gray-600' /> */}
                                        <div className="flex justify-center">
                                            <span className={`px-3 py-1 rounded-full text-white text-xs font-medium capriola-font ${getRatingColor(user.rating)}`}>
                                                {user.rank || 'unrated'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className='flex items-center gap-4 px-1 pt-4'>
                                        <Mail className='h-4 w-4 text-blue-500' />
                                        <span className='capriola-font font-medium text-blue-600 text-sm'>{user.email}</span>
                                    </div>

                                    <div className='flex gap-4 items-center pt-2 px-1'>
                                        <Users className='h-4 w-4 text-red-500' />
                                        <span className='capriola-font text-red-600 text-sm'>friends of : {user.friends} users</span>
                                    </div>


                                </div>

                            </div>

                            <div className='w-[0.5px] self-stretch bg-border'></div>

                            <div className="grid grid-cols-3 gap-6">
                                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                                    <Trophy className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-blue-700 capriola-font">{user.rating}</div>
                                    <div className="text-sm text-blue-600 copper-font">Current Rating</div>
                                </div>

                                <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl">
                                    <Target className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-yellow-700 capriola-font">{problemStats.totalProblems}</div>
                                    <div className="text-sm text-yellow-600 copper-font">Problems Solved</div>
                                    <p className="text-sm text-yellow-600 copper-font">{`(last ${problemFilter} days)`}</p>
                                </div>

                                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                                    <Award className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-purple-700 capriola-font">{user.maxRating}</div>
                                    <div className="text-sm text-purple-600 copper-font">Max Rating</div>
                                </div>

                                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                                    <Crown className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-orange-700 capriola-font">{user.maxRating}</div>
                                    <div className="text-sm text-orange-600 copper-font">Hardest Problem</div>
                                </div>

                                <div className="text-center p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl">
                                    <Activity className="h-6 w-6 text-cyan-600 mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-cyan-700 capriola-font">
                                        {Math.floor(problemStats.avgProblemsPerDay)}
                                    </div>
                                    <div className="text-sm text-cyan-600 copper-font">Problems/Day</div>
                                </div>

                                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                                    <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-green-700 capriola-font">{problemStats.avgRating}</div>
                                    <div className="text-sm text-green-600 copper-font">Average Rating</div>
                                </div>

                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content Tabs */}
                <div>
                    <Tabs defaultValue="contests" className="space-y-4">
                        <TabsList className="grid h-12 w-full grid-cols-2 bg-white/60 backdrop-blur-sm border-gray-100 dark:border-[#383838] border-2 ">
                            <TabsTrigger value="contests" className="data-[state=active]:bg-white">
                                <Calendar className="h-6 w-6 mr-1" />
                                <span className='font-medium copper-font mt-1'>Contest History</span>
                            </TabsTrigger>
                            <TabsTrigger value="problems" className="data-[state=active]:bg-white">
                                <Brain className="h-6 w-6 mr-1" />
                                <span className='font-medium copper-font mt-1'>Problem Solving</span>
                            </TabsTrigger>
                        </TabsList>

                        {/* Contest History Tab */}
                        <TabsContent value="contests" className="space-y-6 ">
                            <Card className="shadow-lg bg-white/80 backdrop-blur-sm border-gray-100 dark:border-[#383838] border-2">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-xl font-medium copper-font">Rating Progress</CardTitle>
                                        <div className="flex gap-2">
                                            {[30, 90, 365].map((days) => (
                                                <Button
                                                    key={days}
                                                    variant={contestFilter === days ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => setContestFilter(days)}
                                                    className={` roboto-font font-medium`}
                                                >
                                                    {days} days
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-80 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={filteredContestHistory}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                <XAxis
                                                    dataKey="date"
                                                    stroke="#64748b"
                                                    tickFormatter={(date) =>
                                                        new Date(date).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })
                                                    }
                                                />
                                                <YAxis stroke="#64748b" domain={['auto', 'auto']} />
                                                <Tooltip
                                                    labelFormatter={(date) => {
                                                        const d = new Date(date);
                                                        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
                                                    }}
                                                    contentStyle={{
                                                        backgroundColor: 'white',
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                                    }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="newRating"
                                                    stroke="#3b82f6"
                                                    strokeWidth={3}
                                                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                                                    activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-2 shadow-lg bg-white/80 backdrop-blur-sm border-gray-100 dark:border-[#383838]">
                                <CardHeader>
                                    <CardTitle className="text-xl font-medium copper-font">Recent Contests</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {[...filteredContestHistory].reverse().map((contest, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-2 px-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-blue-50 hover:to-blue-100 transition-colors"
                                            >
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-gray-900 copper-font">{contest.contest}</h3>
                                                    <p className="text-sm text-gray-600 capriola-font">{getRelativeTime(new Date(contest.date))}</p>
                                                </div>
                                                <div className="text-center px-4">
                                                    <div className="text-lg font-medium text-gray-900 capriola-font">{contest.rank}</div>
                                                    <div className="text-xs text-gray-600 copper-font">Rank</div>
                                                </div>
                                                <div className="text-center px-4">
                                                    <div className="text-lg font-medium text-gray-900 copper-font">{contest.newRating}</div>
                                                    <div className="text-xs text-gray-600 copper-font">Rating</div>
                                                </div>
                                                <div className="text-center">
                                                    <Badge
                                                        variant={contest.change >= 0 ? "default" : "destructive"}
                                                        className={`${contest.change >= 0 ? "bg-green-100 text-green-800" : ""} capriola-font`}
                                                    >
                                                        {contest.change >= 0 ? '+' : ''}{contest.change}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Problem Solving Tab */}
                        <TabsContent value="problems" className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                                <Card className="shadow-lg bg-white/80 backdrop-blur-sm col-span-3 border-2 border-gray-100 dark:border-[#383838]">
                                    <CardHeader className="pb-4">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-xl font-medium copper-font">Problem Rating Distribution</CardTitle>
                                            <div className="flex gap-2">
                                                {[7, 30, 90].map((days) => (
                                                    <Button
                                                        key={days}
                                                        variant={problemFilter === days ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => setProblemFilter(days)}
                                                    >
                                                        {days}d
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-80 w-full flex justify-center items-center pr-8">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={ratingDistribution}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                    <XAxis dataKey="rating" stroke="#64748b" />
                                                    <YAxis stroke="#64748b" />
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor: 'white',
                                                            border: '1px solid #e2e8f0',
                                                            borderRadius: '8px',
                                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                                        }}
                                                    />
                                                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                                        {ratingDistribution.map((entry, index) => (
                                                            <Cell
                                                                key={`cell-${index}`}
                                                                fill="#e5e7eb" // gray-200
                                                                fillOpacity={1}
                                                                className="recharts-bar-cell hover:!fill-yellow-300 transition-all duration-300"
                                                            />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>

                                    </CardContent>

                                </Card>

                                <Card className="border-2 shadow-lg bg-white/80 backdrop-blur-sm col-span-2 border-gray-100 dark:border-[#383838]">
                                    <CardHeader>
                                        <CardTitle className="text-xl font-medium copper-font">Submission Heatmap</CardTitle>
                                        <p className="text-xs text-gray-600 capriola-font">Last 365 days activity</p>
                                    </CardHeader>
                                    <CardContent>

                                        <CalendarHeatmap
                                            variantClassnames={[
                                                "text-white bg-green-400 hover:bg-green-500",
                                                "text-white bg-green-500 hover:bg-green-600",
                                                "text-white bg-green-700 hover:bg-green-800"
                                            ]}
                                            weightedDates={heatmapData}
                                            onDateClick={(date) => console.log('Clicked:', date)}
                                        />
                                    </CardContent>
                                </Card>
                                {/* Recent Problem Submissions */}
                                <Card className="border-2 shadow-lg bg-white/80 backdrop-blur-sm border-gray-100 dark:border-[#383838] col-span-5">
                                    <CardHeader>
                                        <CardTitle className="text-xl font-medium copper-font">Recent Submissions</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {[...problemStats.recentProblems].map((recentProblem, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between p-2 px-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-blue-50 hover:to-blue-100 transition-colors"
                                                >
                                                    <div className="flex-1">
                                                        <h3 className="font-medium text-gray-900 copper-font">{recentProblem.problem.name}</h3>
                                                        <p className="text-sm text-gray-600 capriola-font">{getRelativeTime(new Date(recentProblem.creationTimeSeconds * 1000))}</p>
                                                    </div>
                                                    <div className="text-center px-4">
                                                        <div className="text-lg font-medium text-gray-900 capriola-font">{recentProblem.programmingLanguage}</div>
                                                        <div className="text-xs text-gray-600 copper-font">Language</div>
                                                    </div>
                                                    <div className="text-center px-4">
                                                        <div className="text-lg font-medium text-gray-900 copper-font">{recentProblem.problem.rating}</div>
                                                        <div className="text-xs text-gray-600 copper-font">Rating</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
};


