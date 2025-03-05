import Link from "next/link";
import { FaBookOpen, FaChartLine, FaLightbulb, FaPray } from "react-icons/fa";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-gray-800">Deeni by SAFR+</div>
          <div className="space-x-4">
            <Link
              href="/login"
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Track Good Deeds & Gain Islamic Insights
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Deeni helps you consistently track good deeds while providing AI-powered
          insights from the Quran and Hadith, making your spiritual journey more
          meaningful.
        </p>
        <Link
          href="/register"
          className="bg-emerald-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-emerald-700 transition-colors inline-block"
        >
          Start Your Journey
        </Link>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
              <FaPray className="text-2xl text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Habit Tracking</h3>
            <p className="text-gray-600">
              Track your daily prayers, Quran recitation, and other good deeds
              consistently.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
              <FaLightbulb className="text-2xl text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI-Powered Insights</h3>
            <p className="text-gray-600">
              Receive personalized insights from the Quran and Hadith using advanced
              AI technology.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
              <FaChartLine className="text-2xl text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Progress Tracking</h3>
            <p className="text-gray-600">
              Visualize your spiritual growth with detailed progress analytics and
              statistics.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
              <FaBookOpen className="text-2xl text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Islamic Knowledge</h3>
            <p className="text-gray-600">
              Expand your understanding of Islam through curated content and
              resources.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Begin Your Spiritual Journey Today
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Join thousands of Muslims who are enhancing their spiritual journey with
          Deeni. Start tracking your good deeds and gaining valuable insights now.
        </p>
        <Link
          href="/register"
          className="bg-emerald-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-emerald-700 transition-colors inline-block"
        >
          Create Free Account
        </Link>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 border-t">
        <div className="text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} Deeni by SAFR+. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
