"use client";

import Link from "next/link";
import { FaArrowRight, FaQuran, FaRegChartBar, FaRegClock, FaPray, FaLightbulb, FaChartLine, FaBookOpen } from "react-icons/fa";
import { SponsorsHero } from "@/components/sponsors-hero";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { ParallaxHero } from "@/components/ui/parallax-hero";
import { smoothScroll } from "@/lib/utils";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation - Glassmorphic */}
      <header className="sticky top-0 z-50">
        <div className="glass-effect">
          <nav className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-2xl font-bold text-emerald-800 dark:text-emerald-300 hover:opacity-90 transition-opacity">
                Deeni by SAFR+
              </Link>
              <div className="hidden md:flex items-center space-x-8">
                <Link
                  href="#how-it-works"
                  onClick={smoothScroll}
                  className="text-lg text-emerald-800 dark:text-emerald-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium"
                >
                  How It Works
                </Link>
                <Link
                  href="#features"
                  onClick={smoothScroll}
                  className="text-lg text-emerald-800 dark:text-emerald-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium"
                >
                  Features
                </Link>
                <Link
                  href="/register"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-full transition-all hover:scale-105 font-medium inline-flex items-center gap-2 group text-lg"
                >
                  Get Started <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <button className="md:hidden text-emerald-800 dark:text-emerald-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-grow relative z-10">
        {/* Hero Section */}
        <ParallaxHero>
          <section className="relative min-h-screen flex items-center py-24">
            <div className="container mx-auto px-6 text-center relative z-10">
              <div className="max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 backdrop-blur-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Now Available in Beta
                </div>
                
                <h1 className="text-4xl md:text-6xl font-bold text-emerald-950 dark:text-white mb-8 leading-tight">
                  Track Good Deeds & {" "}
                  <span className="gradient-text"> Gain Islamic Insights</span>
                </h1>
                
                <p className="text-xl text-emerald-800/80 dark:text-emerald-200/80 mb-12 max-w-2xl mx-auto leading-relaxed">
                  Deeni helps you consistently track good deeds while providing AI-powered
                  insights from the Quran and Hadith, making your spiritual journey more
                  meaningful.
                </p>
                
                <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                  <Link
                    href="/register"
                    className="w-full md:w-auto bg-emerald-600/90 hover:bg-emerald-600 text-white px-8 py-4 rounded-full text-lg transition-all hover:scale-105 font-medium inline-flex items-center justify-center gap-2 group shadow-xl shadow-emerald-600/20"
                  >
                    Start Your Journey <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="#features"
                    onClick={smoothScroll}
                    className="w-full md:w-auto text-emerald-800 dark:text-emerald-300 hover:text-emerald-700 dark:hover:text-emerald-200 px-8 py-4 rounded-full text-lg transition-colors font-medium inline-flex items-center justify-center gap-2 group bg-white/10 dark:bg-emerald-950/10 border border-emerald-200/30 dark:border-emerald-800/30 backdrop-blur-sm"
                  >
                    Learn More <FaArrowRight className="group-hover:translate-x-1 transition-transform opacity-0 group-hover:opacity-100" />
                  </Link>
                </div>

                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto text-center">
                  {[
                    { icon: FaQuran, label: "Quran & Hadith Integration" },
                    { icon: FaRegChartBar, label: "Progress Analytics" },
                    { icon: FaRegClock, label: "Daily Tracking" },
                  ].map((item, index) => (
                    <div key={index} className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-emerald-100/50 dark:bg-emerald-900/30 flex items-center justify-center border border-emerald-200/30 dark:border-emerald-800/30 backdrop-blur-sm">
                        <item.icon className="text-xl text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </ParallaxHero>

        {/* How It Works Section */}
        <section id="how-it-works" className="container mx-auto px-6 py-24 scroll-mt-20" aria-labelledby="how-it-works-heading">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 id="how-it-works-heading" className="text-3xl font-bold text-emerald-950 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-emerald-800/80 dark:text-emerald-200/80">
              Simple steps to enhance your spiritual journey with Deeni
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: FaRegClock,
                title: "1. Track Daily",
                description: "Record your daily prayers, Quran readings, and other good deeds with just a few taps."
              },
              {
                icon: FaQuran,
                title: "2. Get Insights",
                description: "Receive personalized Islamic insights from the Quran and Hadith related to your activities."
              },
              {
                icon: FaRegChartBar,
                title: "3. Grow Consistently",
                description: "Monitor your progress and build consistent habits that strengthen your faith over time."
              }
            ].map((step, index) => (
              <div 
                key={index}
                className="flex flex-col items-center text-center p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 bg-white dark:bg-zinc-800/90 border border-emerald-100/30 dark:border-emerald-800/30"
              >
                <div className="w-16 h-16 flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/50 rounded-full mb-6">
                  <step.icon className="text-2xl text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-emerald-950 dark:text-white">{step.title}</h3>
                <p className="text-emerald-800/80 dark:text-emerald-200/80">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-6 py-24 scroll-mt-20" aria-labelledby="features-heading">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-emerald-950 dark:text-white mb-4">
              Everything you need to enhance your spiritual journey
            </h2>
            <p className="text-emerald-800/80 dark:text-emerald-200/80">
              Comprehensive tools and insights to help you stay consistent in your religious practices
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: FaPray,
                title: "Habit Tracking",
                description: "Track your daily prayers, Quran recitation, and other good deeds consistently."
              },
              {
                icon: FaLightbulb,
                title: "AI-Powered Insights",
                description: "Receive personalized insights from the Quran and Hadith using advanced AI technology."
              },
              {
                icon: FaChartLine,
                title: "Progress Tracking",
                description: "Visualize your spiritual growth with detailed progress analytics and statistics."
              },
              {
                icon: FaBookOpen,
                title: "Islamic Knowledge",
                description: "Expand your understanding of Islam through curated content and resources."
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 bg-white dark:bg-zinc-800/90 border border-emerald-100/30 dark:border-emerald-800/30"
              >
                <div className="w-14 h-14 bg-emerald-100/80 dark:bg-emerald-900/50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="text-2xl text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-emerald-950 dark:text-white">{feature.title}</h3>
                <p className="text-emerald-800/80 dark:text-emerald-200/80 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-24">
          <div
            className="bg-gradient-to-br from-emerald-50/50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-3xl p-12 text-center shadow-2xl border border-emerald-100/30 dark:border-emerald-800/30"
          >
            <h2 className="text-4xl font-bold text-emerald-950 dark:text-white mb-6">
              Begin Your Spiritual Journey Today
            </h2>
            <p className="text-xl text-emerald-800/80 dark:text-emerald-200/80 mb-12 max-w-2xl mx-auto">
              Join thousands of Muslims who are enhancing their spiritual journey with
              Deeni. Start tracking your good deeds and gaining valuable insights now.
            </p>
            <div>
              <Link
                href="/register"
                className="bg-emerald-600/90 hover:bg-emerald-600 text-white px-8 py-4 rounded-full text-lg transition-all hover:scale-105 font-medium inline-flex items-center gap-2 group shadow-xl shadow-emerald-600/20"
              >
                Create Free Account <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

        {/* Sponsors Section */}
        <SponsorsHero />
      </main>

      {/* Footer */}
      <footer className="glass-effect border-t">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <Link href="/" className="text-xl font-bold text-emerald-800 dark:text-emerald-300 hover:opacity-90 transition-opacity inline-block">
                Deeni by SAFR+
              </Link>
              <p className="text-emerald-700/80 dark:text-emerald-400/80 text-sm">
                Enhancing your spiritual journey through technology and innovation.
              </p>
            </div>

            {/* Product Links */}
            <div className="space-y-4">
              <h3 className="font-semibold text-emerald-800 dark:text-emerald-300">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/changelog" className="text-emerald-700/80 dark:text-emerald-400/80 hover:text-emerald-800 dark:hover:text-emerald-300 text-sm transition-colors">
                    Changelog
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-emerald-700/80 dark:text-emerald-400/80 hover:text-emerald-800 dark:hover:text-emerald-300 text-sm transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-emerald-700/80 dark:text-emerald-400/80 hover:text-emerald-800 dark:hover:text-emerald-300 text-sm transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-emerald-700/80 dark:text-emerald-400/80 hover:text-emerald-800 dark:hover:text-emerald-300 text-sm transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div className="space-y-4">
              <h3 className="font-semibold text-emerald-800 dark:text-emerald-300">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/blog" className="text-emerald-700/80 dark:text-emerald-400/80 hover:text-emerald-800 dark:hover:text-emerald-300 text-sm transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="text-emerald-700/80 dark:text-emerald-400/80 hover:text-emerald-800 dark:hover:text-emerald-300 text-sm transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/api" className="text-emerald-700/80 dark:text-emerald-400/80 hover:text-emerald-800 dark:hover:text-emerald-300 text-sm transition-colors">
                    API
                  </Link>
                </li>
              </ul>
            </div>

            {/* Social */}
            <div className="space-y-4">
              <h3 className="font-semibold text-emerald-800 dark:text-emerald-300">Connect</h3>
              <ul className="space-y-2">
                <li>
                  <Link 
                    href="https://twitter.com/deeniapp" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700/80 dark:text-emerald-400/80 hover:text-emerald-800 dark:hover:text-emerald-300 text-sm transition-colors"
                  >
                    Twitter
                  </Link>
                </li>
                <li>
                  <Link 
                    href="https://github.com/deeni" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700/80 dark:text-emerald-400/80 hover:text-emerald-800 dark:hover:text-emerald-300 text-sm transition-colors"
                  >
                    GitHub
                  </Link>
                </li>
                <li>
                  <Link 
                    href="https://discord.gg/deeni" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700/80 dark:text-emerald-400/80 hover:text-emerald-800 dark:hover:text-emerald-300 text-sm transition-colors"
                  >
                    Discord
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-emerald-100/20 dark:border-emerald-800/20 mt-8 pt-8 text-center">
            <p className="text-emerald-700/80 dark:text-emerald-400/80 text-sm">
              &copy; {new Date().getFullYear()} Deeni by SAFR+. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 