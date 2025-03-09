import { cn } from "@/lib/utils";
import { Bell, Check, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

type PrayerNotificationProps = {
    prayerName: string;
    prayerTime: string;
    remainingTime?: string;
    onDismiss?: () => void;
    onAccept?: () => void;
};

export function PrayerNotification({ 
    prayerName, 
    prayerTime, 
    remainingTime, 
    onDismiss, 
    onAccept 
}: PrayerNotificationProps) {
    const [isVisible, setIsVisible] = useState(true);

    const handleDismiss = () => {
        setIsVisible(false);
        if (onDismiss) onDismiss();
    };

    const handleAccept = () => {
        setIsVisible(false);
        if (onAccept) onAccept();
    };

    if (!isVisible) return null;

    return (
        <div className="fixed top-4 right-4 z-50 transition-all duration-300 ease-in-out" style={{ maxWidth: "360px" }}>
            <div className="relative bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-[0_1px_6px_0_rgba(0,0,0,0.08)] rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <div className="relative h-10 w-10 flex-shrink-0 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
                        <Bell className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    Prayer Time Notification
                                </p>
                                <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                        {prayerName}
                                    </span>{" "}
                                    prayer at {prayerTime}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleDismiss}
                            className="rounded-lg flex items-center justify-center h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-950/50 text-zinc-400 hover:text-red-600 dark:text-zinc-500 dark:hover:text-red-400 transition-colors"
                            aria-label="Dismiss notification"
                        >
                            <X className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={handleAccept}
                            className={cn(
                                "rounded-lg flex items-center justify-center h-8 w-8 p-0",
                                "hover:bg-emerald-50 dark:hover:bg-emerald-950/50",
                                "text-zinc-400 hover:text-emerald-600",
                                "dark:text-zinc-500 dark:hover:text-emerald-400",
                                "transition-colors"
                            )}
                            aria-label="Accept notification"
                        >
                            <Check className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {remainingTime && (
                    <div className="mt-2 ml-14">
                        <p className="text-[12px] text-zinc-400 dark:text-zinc-500">
                            {remainingTime} remaining
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PrayerNotification; 