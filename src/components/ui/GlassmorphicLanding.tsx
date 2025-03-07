"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { FaBookOpen, FaChartLine, FaLightbulb, FaPray, FaArrowRight, FaQuran, FaRegChartBar, FaRegClock } from "react-icons/fa"
import { motion, useScroll, useTransform, useAnimate } from "framer-motion"
import Floating, { FloatingElement } from "./ParallaxFloating"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function GlassmorphicLanding() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scope, animate] = useAnimate()
  const { scrollYProgress } = useScroll()
  const [hasError, setHasError] = useState(false);
  
  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [0.3, 1])
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.8])

  useEffect(() => {
    // Handle potential errors in initialization
    try {
      // Enable smooth scrolling
      if (containerRef.current) {
        containerRef.current.style.scrollBehavior = "smooth"
      }

      // Add smooth scrolling to all links
      const handleClick = (e: Event) => {
        const target = e.target as HTMLAnchorElement;
        const href = target.getAttribute('href');

        // Check if the link is an anchor link
        if (href?.startsWith('#')) {
          e.preventDefault();
          const element = document.querySelector(href);
          if (element) {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
          }
        }
      };

      // Add click event listeners to all links
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', handleClick);
      });

      // Cleanup
      return () => {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
          anchor.removeEventListener('click', handleClick);
        });
      };
    } catch (error) {
      console.error("Error in GlassmorphicLanding useEffect:", error);
      setHasError(true);
    }
  }, []);

  // If we have errors, show a simpler version
  if (hasError) {
    return (
      <div className="flex flex-col min-h-screen bg-emerald-50 dark:bg-zinc-900">
        <header className="sticky top-0 z-50 bg-white dark:bg-zinc-900 border-b">
          <nav className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-2xl font-bold text-emerald-800 dark:text-emerald-300">
                Deeni by SAFR+
              </Link>
              <div className="space-x-6">
                <Link href="/register" className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-medium">
                  Get Started
                </Link>
              </div>
            </div>
          </nav>
        </header>

        <main className="flex-grow">
          <section className="container mx-auto px-6 py-24 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-emerald-950 dark:text-white mb-8 leading-tight">
              Track Good Deeds & Gain <span className="text-emerald-600 dark:text-emerald-400">Islamic Insights</span>
            </h1>
            <p className="text-xl text-emerald-800 dark:text-emerald-200 mb-12 max-w-2xl mx-auto">
              Deeni helps you consistently track good deeds while providing AI-powered
              insights from the Quran and Hadith, making your spiritual journey more
              meaningful.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <Link
                href="/register"
                className="w-full md:w-auto bg-emerald-600 text-white px-8 py-4 rounded-lg text-lg font-medium inline-flex items-center justify-center gap-2"
              >
                Start Your Journey <FaArrowRight />
              </Link>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-col min-h-screen overflow-x-hidden scroll-smooth bg-gradient-to-b from-emerald-50/30 to-white dark:from-zinc-950 dark:to-zinc-900"
    >
      {/* Navigation - Glassmorphic */}
      <header 
        className="sticky top-0 z-50"
        style={{ opacity: headerOpacity as any }}
      >
        <div className="backdrop-blur-xl bg-white/30 dark:bg-zinc-900/30 border-b border-emerald-100/30 dark:border-emerald-900/10 supports-[backdrop-filter]:bg-white/10 dark:supports-[backdrop-filter]:bg-zinc-900/10">
          <nav className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-2xl font-bold text-emerald-800 dark:text-emerald-300 hover:opacity-90 transition-opacity">
                Deeni by SAFR+
              </Link>
              <div className="hidden md:flex space-x-6">
                <Link
                  href="#how-it-works"
                  className="text-emerald-800/80 dark:text-emerald-300/80 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors font-medium"
                >
                  How It Works
                </Link>
                <Link
                  href="#features"
                  className="text-emerald-800/80 dark:text-emerald-300/80 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors font-medium"
                >
                  Features
                </Link>
                <Link
                  href="/login"
                  className="text-emerald-800/80 dark:text-emerald-300/80 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-emerald-600/90 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-full transition-all hover:scale-105 font-medium inline-flex items-center gap-2 group shadow-lg shadow-emerald-600/10"
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

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-screen flex items-center">
          {/* Background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-0 -translate-x-[10%] -translate-y-[10%] w-[500px] h-[500px] rounded-full bg-emerald-400/10 dark:bg-emerald-500/5 blur-3xl" />
            <div className="absolute bottom-0 right-0 translate-x-[20%] translate-y-[20%] w-[600px] h-[600px] rounded-full bg-emerald-300/10 dark:bg-emerald-600/5 blur-3xl" />
            
            <Floating sensitivity={0.2} className="h-full pointer-events-none opacity-60 dark:opacity-30">
              <FloatingElement depth={1.5} className="top-[15%] left-[10%]">
                <div className="w-40 h-40 bg-emerald-300/20 dark:bg-emerald-700/20 rounded-full blur-2xl" />
              </FloatingElement>
              <FloatingElement depth={2} className="top-[60%] left-[80%]">
                <div className="w-60 h-60 bg-emerald-400/20 dark:bg-emerald-600/20 rounded-full blur-2xl" />
              </FloatingElement>
              <FloatingElement depth={1} className="top-[75%] left-[25%]">
                <div className="w-32 h-32 bg-emerald-200/20 dark:bg-emerald-800/20 rounded-full blur-xl" />
              </FloatingElement>
            </Floating>
          </div>

          <motion.div 
            className="container mx-auto px-6 py-24 text-center relative z-10"
            style={{ 
              scale: heroScale as any,
              opacity: heroOpacity as any 
            }}
          >
            <motion.div
              initial="initial"
              animate="animate"
              variants={stagger}
              className="max-w-4xl mx-auto"
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 mb-8 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Now Available in Beta
              </motion.div>
              
              <motion.h1 
                variants={fadeInUp}
                className="text-4xl md:text-6xl font-bold text-emerald-950 dark:text-white mb-8 leading-tight"
              >
                Track Good Deeds & Gain{" "}
                <span className="text-emerald-600 dark:text-emerald-400 bg-gradient-to-r from-emerald-600 to-emerald-500 dark:from-emerald-400 dark:to-emerald-300 bg-clip-text text-transparent">Islamic Insights</span>
              </motion.h1>
              
              <motion.p 
                variants={fadeInUp}
                className="text-xl text-emerald-800/80 dark:text-emerald-200/80 mb-12 max-w-2xl mx-auto leading-relaxed"
              >
                Deeni helps you consistently track good deeds while providing AI-powered
                insights from the Quran and Hadith, making your spiritual journey more
                meaningful.
              </motion.p>
              
              <motion.div variants={fadeInUp} className="flex flex-col md:flex-row items-center justify-center gap-6">
                <Link
                  href="/register"
                  className="w-full md:w-auto bg-emerald-600/90 hover:bg-emerald-600 text-white px-8 py-4 rounded-full text-lg transition-all hover:scale-105 font-medium inline-flex items-center justify-center gap-2 group shadow-xl shadow-emerald-600/20"
                >
                  Start Your Journey <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="#features"
                  className="w-full md:w-auto text-emerald-800 dark:text-emerald-300 hover:text-emerald-700 dark:hover:text-emerald-200 px-8 py-4 rounded-full text-lg transition-colors font-medium inline-flex items-center justify-center gap-2 group backdrop-blur-md bg-white/10 dark:bg-emerald-950/10 border border-emerald-200/30 dark:border-emerald-800/30"
                >
                  Learn More <FaArrowRight className="group-hover:translate-x-1 transition-transform opacity-0 group-hover:opacity-100" />
                </Link>
              </motion.div>

              <motion.div 
                variants={fadeInUp}
                className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto text-center"
              >
                {[
                  { icon: FaQuran, label: "Quran & Hadith Integration" },
                  { icon: FaRegChartBar, label: "Progress Analytics" },
                  { icon: FaRegClock, label: "Daily Tracking" },
                ].map((item, index) => (
                  <div key={index} className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-emerald-100/50 dark:bg-emerald-900/30 flex items-center justify-center backdrop-blur-md border border-emerald-200/30 dark:border-emerald-800/30">
                      <item.icon className="text-xl text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">{item.label}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="container mx-auto px-6 py-24 scroll-mt-20" aria-labelledby="how-it-works-heading">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div variants={fadeInUp} className="text-center max-w-2xl mx-auto mb-16">
              <h2 id="how-it-works-heading" className="text-3xl font-bold text-emerald-950 dark:text-white mb-4">
                How It Works
              </h2>
              <p className="text-emerald-800/80 dark:text-emerald-200/80">
                Simple steps to enhance your spiritual journey with Deeni
              </p>
            </motion.div>

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
                <motion.div 
                  key={index}
                  variants={fadeInUp}
                  className="flex flex-col items-center text-center p-6 backdrop-blur-xl bg-white/20 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100/30 dark:border-emerald-800/30 shadow-xl shadow-emerald-600/5 hover:shadow-emerald-600/10 transition-all hover:-translate-y-1"
                >
                  <div className="w-16 h-16 flex items-center justify-center bg-emerald-100/50 dark:bg-emerald-900/50 rounded-full mb-6 backdrop-blur-md border border-emerald-200/30 dark:border-emerald-800/30">
                    <step.icon className="text-2xl text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-emerald-950 dark:text-white">{step.title}</h3>
                  <p className="text-emerald-800/80 dark:text-emerald-200/80">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-6 py-24 scroll-mt-20" aria-labelledby="features-heading">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div variants={fadeInUp} className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-emerald-950 dark:text-white mb-4">
                Everything you need to enhance your spiritual journey
              </h2>
              <p className="text-emerald-800/80 dark:text-emerald-200/80">
                Comprehensive tools and insights to help you stay consistent in your religious practices
              </p>
            </motion.div>

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
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="group relative p-8 backdrop-blur-xl bg-white/20 dark:bg-emerald-950/20 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:bg-white/30 dark:hover:bg-emerald-950/30 hover:-translate-y-1 border border-emerald-100/30 dark:border-emerald-800/30"
                >
                  <div className="w-14 h-14 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-emerald-200/30 dark:border-emerald-800/30">
                    <feature.icon className="text-2xl text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-emerald-950 dark:text-white">{feature.title}</h3>
                  <p className="text-emerald-800/80 dark:text-emerald-200/80 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-24">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
            className="backdrop-blur-xl bg-gradient-to-br from-emerald-50/40 to-emerald-100/40 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-3xl p-12 text-center border border-emerald-100/30 dark:border-emerald-800/30 shadow-2xl shadow-emerald-600/10"
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-4xl font-bold text-emerald-950 dark:text-white mb-6"
            >
              Begin Your Spiritual Journey Today
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-emerald-800/80 dark:text-emerald-200/80 mb-12 max-w-2xl mx-auto"
            >
              Join thousands of Muslims who are enhancing their spiritual journey with
              Deeni. Start tracking your good deeds and gaining valuable insights now.
            </motion.p>
            <motion.div variants={fadeInUp}>
              <Link
                href="/register"
                className="bg-emerald-600/90 hover:bg-emerald-600 text-white px-8 py-4 rounded-full text-lg transition-all hover:scale-105 font-medium inline-flex items-center gap-2 group shadow-xl shadow-emerald-600/20"
              >
                Create Free Account <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="backdrop-blur-xl bg-white/30 dark:bg-zinc-900/30 border-t border-emerald-100/30 dark:border-emerald-800/30">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <Link href="/" className="text-xl font-bold text-emerald-800 dark:text-emerald-300 hover:opacity-90 transition-opacity mb-4 inline-block">
              Deeni by SAFR+
            </Link>
            <p className="text-emerald-700/80 dark:text-emerald-400/80 mt-4">
              &copy; {new Date().getFullYear()} Deeni by SAFR+. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 