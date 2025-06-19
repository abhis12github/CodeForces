import React, { useState, useMemo } from 'react';

export const CalendarHeatmap = ({
    variantClassnames = [
        "text-white hover:text-white bg-green-400 hover:bg-green-500",
        "text-white hover:text-white bg-green-500 hover:bg-green-600",
        "text-white hover:text-white bg-green-700 hover:bg-green-800"
    ],
    datesPerVariant = [],
    weightedDates = [],
    onDateClick,
    showTooltip = true,
    tooltipFormatter
}) => {
    const [currentMonthOffset, setCurrentMonthOffset] = useState(0);
    const [hoveredDate, setHoveredDate] = useState(null);
    const [hoveredWeight, setHoveredWeight] = useState(undefined);

    // Helper function to get the start of the week (Sunday)
    const getStartOfWeek = (date) => {
        const result = new Date(date);
        const day = result.getDay();
        const diff = result.getDate() - day;
        result.setDate(diff);
        return result;
    };

    // Helper function to get the end of the week (Saturday)
    const getEndOfWeek = (date) => {
        const result = new Date(date);
        const day = result.getDay();
        const diff = result.getDate() + (6 - day);
        result.setDate(diff);
        return result;
    };

    // Helper function to format date as YYYY-MM-DD for comparison
    const formatDateKey = (date) => {
        return date.toISOString().split('T')[0];
    };

    // Process dates based on props
    const processedDates = useMemo(() => {
        const dateMap = new Map();

        if (datesPerVariant && datesPerVariant.length > 0) {
            datesPerVariant.forEach((dates, variantIndex) => {
                dates.forEach(date => {
                    const key = formatDateKey(date);
                    dateMap.set(key, { weight: 1, variantIndex });
                });
            });
        }

        if (weightedDates && weightedDates.length > 0) {
            // Sort by weight to determine variant
            const sortedWeights = [...weightedDates].sort((a, b) => a.weight - b.weight);
            const weightRanges = [];

            if (sortedWeights.length > 0) {
                const minWeight = sortedWeights[0].weight;
                const maxWeight = sortedWeights[sortedWeights.length - 1].weight;
                const range = maxWeight - minWeight;

                for (let i = 0; i < variantClassnames.length; i++) {
                    const threshold = minWeight + (range * (i + 1)) / variantClassnames.length;
                    weightRanges.push(threshold);
                }
            }

            weightedDates.forEach(({ date, weight }) => {
                const key = formatDateKey(date);
                let variantIndex = 0;

                for (let i = 0; i < weightRanges.length; i++) {
                    if (weight <= weightRanges[i]) {
                        variantIndex = i;
                        break;
                    }
                }

                dateMap.set(key, { weight, variantIndex });
            });
        }

        return dateMap;
    }, [datesPerVariant, weightedDates, variantClassnames.length]);

    // Generate calendar for current month
    const currentMonth = useMemo(() => {
        const today = new Date();
        const targetMonth = new Date(today.getFullYear(), today.getMonth() + currentMonthOffset, 1);
        const monthName = targetMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        // Get the first day of the month and find the start of the week
        const firstDay = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
        const lastDay = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);

        const startOfWeek = getStartOfWeek(firstDay);
        const endOfWeek = getEndOfWeek(lastDay);

        const days = [];
        const current = new Date(startOfWeek);

        while (current <= endOfWeek) {
            const isCurrentMonth = current.getMonth() === targetMonth.getMonth();
            const dateKey = formatDateKey(current);
            const dateData = processedDates.get(dateKey);

            days.push({
                date: new Date(current),
                isCurrentMonth,
                weight: dateData?.weight,
                variantIndex: dateData?.variantIndex
            });

            current.setDate(current.getDate() + 1);
        }

        return {
            name: monthName,
            days,
            canGoPrevious: currentMonthOffset > -11,
            canGoNext: currentMonthOffset < 0
        };
    }, [currentMonthOffset, processedDates]);

    const handlePreviousMonth = () => {
        if (currentMonth.canGoPrevious) {
            setCurrentMonthOffset(prev => prev - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth.canGoNext) {
            setCurrentMonthOffset(prev => prev + 1);
        }
    };

    const handleDateClick = (date) => {
        if (onDateClick) {
            onDateClick(date);
        }
    };

    const handleDateHover = (date, weight) => {
        if (showTooltip) {
            setHoveredDate(date);
            setHoveredWeight(weight);
        }
    };

    const handleDateLeave = () => {
        setHoveredDate(null);
        setHoveredWeight(undefined);
    };

    const getTooltipContent = (date, weight) => {
        if (tooltipFormatter) {
            return tooltipFormatter(date, weight);
        }

        const dateStr = date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        if (weight !== undefined) {
            return `${dateStr}\nActivity: ${weight}`;
        }

        return dateStr;
    };

    return (
        <div className="calendar-heatmap">
            {/* Month Navigation Header */}
            <div className="flex items-center justify-center mb-6 px-6">
                <button
                    onClick={handlePreviousMonth}
                    disabled={!currentMonth.canGoPrevious}
                    className={`p-2 rounded-full transition-colors ${currentMonth.canGoPrevious
                            ? 'hover:bg-gray-100 text-gray-700 cursor-pointer'
                            : 'text-gray-300 cursor-not-allowed'
                        }`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <h3 className="text-lg font-medium mx-6 min-w-[200px] text-center copper-font">
                    {currentMonth.name}
                </h3>

                <button
                    onClick={handleNextMonth}
                    disabled={!currentMonth.canGoNext}
                    className={`p-2 rounded-full transition-colors ${currentMonth.canGoNext
                            ? 'hover:bg-gray-100 text-gray-700 cursor-pointer'
                            : 'text-gray-300 cursor-not-allowed'
                        }`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 max-w-2xs mx-auto">
                {/* Week day headers */}
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                    <div key={day} className=" text-sm font-medium text-gray-500 p-2">
                        {day}
                    </div>
                ))}

                {/* Calendar days */}
                {currentMonth.days.map((day, dayIndex) => {
                    const hasData = day.variantIndex !== undefined;
                    const baseClasses = "w-8 h-8 text-xs flex items-center justify-center rounded cursor-pointer transition-all duration-200 relative";
                    const variantClasses = hasData ? variantClassnames[day.variantIndex] : "";
                    const opacityClasses = day.isCurrentMonth ? "" : "opacity-30";
                    const hoverClasses = "hover:scale-110 hover:z-10";

                    return (
                        <div
                            key={dayIndex}
                            className={`${baseClasses} ${variantClasses} ${opacityClasses} ${hoverClasses} ${!hasData ? 'bg-gray-100 hover:bg-gray-200 text-gray-600' : ''
                                }`}
                            onClick={() => handleDateClick(day.date)}
                            onMouseEnter={() => handleDateHover(day.date, day.weight)}
                            onMouseLeave={handleDateLeave}
                        >
                            {day.date.getDate()}

                            {/* Tooltip */}
                            {showTooltip && hoveredDate && formatDateKey(hoveredDate) === formatDateKey(day.date) && (
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-pre-line z-20 pointer-events-none">
                                    {getTooltipContent(day.date, day.weight)}
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};