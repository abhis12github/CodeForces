import { Users } from 'lucide-react';
import React from 'react';
import { Mail,Target,Clock,Calendar,BarChart3 } from 'lucide-react';

const iconMap = {
  BarChart3,
  Clock,
  Mail,
  Target,
  Calendar
};

export const Card = ({color, bgColor, heading, content, icon}) => {
  const Icon = iconMap[icon] || Users;
  return (
    <div className="bg-white dark:bg-[#212121] rounded-xl p-6 pr-0 pb-6 shadow-sm border border-gray-100 dark:border-[#383838] dark:shadow-[#383838] dark:shadow-md hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col gap-4 items-start">
        {/* Icon Container */}
        <div className="flex-shrink-0">
          <div className={`${bgColor} w-12 h-12 rounded-full flex items-center justify-center`}>
            <Icon className={`${color} w-6 h-6`}  />
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 capriola-font ">
            {heading}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm roboto-font">
            {content}
          </p>
        </div>
      </div>
    </div>
  );
};