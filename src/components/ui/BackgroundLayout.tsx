"use client";

interface BackgroundLayoutProps {
  children: React.ReactNode;
}

export default function BackgroundLayout({ children }: BackgroundLayoutProps) {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-emerald-50/30 to-white dark:from-zinc-950 dark:to-zinc-900">
      {/* Curved Lines Background */}
      <div className="fixed inset-0 z-0 overflow-hidden opacity-15 pointer-events-none">
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 1200 1200" 
          xmlns="http://www.w3.org/2000/svg" 
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          <path d="M0,400 C300,300 600,600 1200,400" stroke="#059669" strokeWidth="1" fill="none" />
          <path d="M0,500 C300,400 600,700 1200,500" stroke="#059669" strokeWidth="1" fill="none" />
          <path d="M0,600 C300,500 600,800 1200,600" stroke="#059669" strokeWidth="1" fill="none" />
          <path d="M0,700 C300,600 600,900 1200,700" stroke="#059669" strokeWidth="1" fill="none" />
          <path d="M0,800 C300,700 600,1000 1200,800" stroke="#059669" strokeWidth="1" fill="none" />
          <path d="M0,900 C300,800 600,1100 1200,900" stroke="#059669" strokeWidth="1" fill="none" />
          <path d="M0,1000 C300,900 600,1200 1200,1000" stroke="#059669" strokeWidth="1" fill="none" />
          <path d="M0,200 C300,100 600,400 1200,200" stroke="#059669" strokeWidth="1" fill="none" />
          <path d="M0,300 C300,200 600,500 1200,300" stroke="#059669" strokeWidth="1" fill="none" />
        </svg>
      </div>
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
} 