import { Card } from "../components/FeatureCard";
import { Award } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const HomePage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
            {/* Hero Section */}
            <section className="container mx-auto px-4 py-16">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
                        <Award className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-primary capriola-font">Competitive Programming Analytics</span>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent capriola-font">
                        Master Your
                        <span className="copper-font block mt-2">CODE<span className="text-[#415e9c] copper-font">FORCES</span> <span className="capriola-font">Journey</span></span>

                    </h1>

                    <p className="text-lg text-muted-foreground/90 max-w-4xl mx-auto mb-8 roboto-font italic ">
                        Comprehensive student progress tracking and analytics platform for Codeforces competitive programming.
                        Monitor performance, track growth, and stay motivated.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/users">
                            <button className="bg-[#415e9c] hover:bg-[#415e9c]/90 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg flex gap-1 roboto-font">
                                Get Started <ArrowRight />
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}

            <section className="p-8 min-h-screen">
                <div className=" max-w-5xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white capriola-font">
                        Our Features
                    </h2>
                    <div className="flex flex-wrap gap-6 justify-center">
                        <div className="w-full max-w-xs">
                            <Card
                                icon="BarChart3"
                                bgColor="bg-green-100"
                                color="text-green-600"
                                heading="Progress Analytics"
                                content="Detailed analytics with rating graphs, contest history, and problem-solving statistics."
                            />
                        </div>
                        <div className="w-full max-w-xs">
                            <Card
                                icon="Clock"
                                bgColor="bg-orange-100"
                                color="text-orange-600"
                                heading="Auto Sync"
                                content="Automated daily data synchronization with Codeforces to keep all information up-to-date."
                            />
                        </div>

                        <div className="w-full max-w-xs">
                            <Card
                                icon="Mail"
                                bgColor="bg-cyan-100"
                                color="text-cyan-600"
                                heading="Smart Notifications"
                                content="Automated email reminders for inactive students."
                            />
                        </div>
                        <div className="w-full max-w-xs">
                            <Card
                                icon="Calendar"
                                bgColor="bg-purple-100"
                                color="text-purple-600"
                                heading="Contest History"
                                content="Complete contest participation history with performance metrics and rankings."
                            />
                        </div>
                        <div className="w-full max-w-xs">
                            <Card
                                icon="Target"
                                bgColor="bg-red-100"
                                color="text-red-600"
                                heading="Activity Monitoring"
                                content="Track student activity patterns and identify inactivity for timely interventions."
                            />
                        </div>
                    </div>
                </div>
            </section>



        </div>
    )
}

