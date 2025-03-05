"use client";

import React, { useState } from "react";
import { FiInfo } from "react-icons/fi";

interface TooltipProps {
  content: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  children?: React.ReactNode;
  className?: string;
  icon?: boolean;
  source?: string;
}

export const Tooltip = ({
  content,
  position = "top",
  children,
  className = "",
  icon = true,
  source,
}: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
  };

  return (
    <div className="relative inline-block">
      <div
        className={`inline-flex items-center gap-1 cursor-help ${className}`}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        tabIndex={0}
        aria-label={`Tooltip: ${typeof content === "string" ? content : "information"}`}
      >
        {children}
        {icon && <FiInfo className="text-primary-600 w-4 h-4" />}
      </div>

      {isVisible && (
        <div
          className={`absolute z-50 ${positionClasses[position]} bg-white dark:bg-gray-800 text-sm shadow-lg rounded-md p-3 min-w-[250px] max-w-xs border border-gray-200 dark:border-gray-700`}
          role="tooltip"
        >
          <div className="text-gray-700 dark:text-gray-200">{content}</div>
          {source && (
            <div className="mt-2 text-xs italic text-gray-500 dark:text-gray-400">
              {source}
            </div>
          )}
          <div
            className={`absolute ${
              position === "top"
                ? "top-full left-1/2 transform -translate-x-1/2 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white dark:border-t-gray-800"
                : position === "bottom"
                ? "bottom-full left-1/2 transform -translate-x-1/2 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white dark:border-b-gray-800"
                : position === "left"
                ? "left-full top-1/2 transform -translate-y-1/2 border-t-8 border-b-8 border-l-8 border-t-transparent border-b-transparent border-l-white dark:border-l-gray-800"
                : "right-full top-1/2 transform -translate-y-1/2 border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-white dark:border-r-gray-800"
            }`}
          ></div>
        </div>
      )}
    </div>
  );
};

export default Tooltip; 