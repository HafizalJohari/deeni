"use client";

import { useEffect, useState } from 'react';

interface BackgroundPathsProps {
    children: React.ReactNode;
}

const FloatingPaths = ({ position = 1 }: { position?: number }) => {
    return (
        <div
            className={`absolute inset-0 flex items-center justify-center opacity-30 dark:opacity-20 ${
                position === 1 ? 'hue-rotate-60' : 'hue-rotate-180'
            }`}
            style={{
                transform: `scale(${position === 1 ? 1 : -1})`,
            }}
        >
            <svg
                className="w-full h-full max-w-7xl"
                viewBox="0 0 1000 1000"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#34d399' }} />
                        <stop offset="100%" style={{ stopColor: '#059669' }} />
                    </linearGradient>
                </defs>
                <path
                    d="M100,100 Q400,50 700,200 T900,300 Q600,400 800,600 T700,800 Q400,900 200,700 T100,100"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="2"
                    className="animate-float"
                />
            </svg>
        </div>
    );
};

export function BackgroundPaths({ children }: BackgroundPathsProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-white dark:bg-zinc-950">
            <div className="absolute inset-0">
                <FloatingPaths position={1} />
                <FloatingPaths position={-1} />
            </div>
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
} 