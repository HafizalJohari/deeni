"use client";

import React, { useState } from "react";
import { FaQuestionCircle, FaTimes, FaQuran, FaBook, FaCalendarCheck, FaUser, FaPray } from "react-icons/fa";
import * as guidance from "@/lib/islamic-guidance";

interface HelpGuideProps {
  className?: string;
}

export const HelpGuide: React.FC<HelpGuideProps> = ({ className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("general");

  const toggleGuide = () => setIsOpen(!isOpen);

  return (
    <>
      <button
        onClick={toggleGuide}
        className={`fixed bottom-6 right-6 rounded-full bg-primary-600 p-3 text-white shadow-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${className}`}
        aria-label="Open Help Guide"
      >
        <FaQuestionCircle className="h-6 w-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[80vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <h2 className="text-xl font-bold text-gray-900">Deeni App Guide</h2>
              <button
                onClick={toggleGuide}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                aria-label="Close guide"
              >
                <FaTimes className="h-6 w-6" />
              </button>
            </div>

            <div className="flex h-[calc(80vh-4rem)] flex-col md:flex-row">
              <div className="w-full shrink-0 border-b border-gray-200 bg-gray-50 md:w-64 md:border-b-0 md:border-r">
                <nav className="flex md:flex-col">
                  <button
                    onClick={() => setActiveTab("general")}
                    className={`flex w-full items-center p-4 text-left md:rounded-none ${
                      activeTab === "general"
                        ? "bg-primary-50 font-medium text-primary-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <FaQuestionCircle className="mr-3 h-5 w-5" />
                    <span>General</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("quran")}
                    className={`flex w-full items-center p-4 text-left md:rounded-none ${
                      activeTab === "quran"
                        ? "bg-primary-50 font-medium text-primary-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <FaQuran className="mr-3 h-5 w-5" />
                    <span>Quran</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("hadith")}
                    className={`flex w-full items-center p-4 text-left md:rounded-none ${
                      activeTab === "hadith"
                        ? "bg-primary-50 font-medium text-primary-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <FaBook className="mr-3 h-5 w-5" />
                    <span>Hadith</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("habits")}
                    className={`flex w-full items-center p-4 text-left md:rounded-none ${
                      activeTab === "habits"
                        ? "bg-primary-50 font-medium text-primary-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <FaCalendarCheck className="mr-3 h-5 w-5" />
                    <span>Habits</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("prayer")}
                    className={`flex w-full items-center p-4 text-left md:rounded-none ${
                      activeTab === "prayer"
                        ? "bg-primary-50 font-medium text-primary-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <FaPray className="mr-3 h-5 w-5" />
                    <span>Prayer</span>
                  </button>
                </nav>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === "general" && (
                  <div>
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">Welcome to Deeni</h3>
                    <p className="mb-4 text-gray-700">
                      Deeni is an app designed to help you strengthen your Islamic practice through regular 
                      habits, Quran and Hadith insights, and mindful reflection. This guide will help you 
                      navigate the app and understand its features.
                    </p>
                    
                    <h4 className="mb-2 mt-6 font-medium text-gray-900">Getting Started</h4>
                    <ul className="ml-5 list-disc space-y-2 text-gray-700">
                      <li>The dashboard provides an overview of your spiritual journey</li>
                      <li>Set up habits you want to maintain consistently</li>
                      <li>Explore Quran and Hadith insights for daily reflection</li>
                      <li>Track your progress and maintain consistency</li>
                    </ul>
                    
                    <div className="mt-6 rounded-lg bg-primary-50 p-4">
                      <p className="italic text-gray-700">
                        "{guidance.getRandomGuidance(guidance.generalGuidance).content}"
                      </p>
                      <p className="mt-2 text-sm text-gray-500">
                        {guidance.getRandomGuidance(guidance.generalGuidance).source}
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === "quran" && (
                  <div>
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">Quran Insights</h3>
                    <p className="mb-4 text-gray-700">
                      The Quran section allows you to generate personalized insights from selected surahs and verses.
                      Reflect on these insights to deepen your understanding of the Quran.
                    </p>
                    
                    <h4 className="mb-2 mt-6 font-medium text-gray-900">How to Use</h4>
                    <ol className="ml-5 list-decimal space-y-2 text-gray-700">
                      <li>Select a surah from the dropdown menu</li>
                      <li>Optionally, enter a specific verse number</li>
                      <li>Click "Generate Insight" to receive a reflection</li>
                      <li>Save insights you find meaningful by clicking the favorite icon</li>
                      <li>Create visual representations with "Generate Image"</li>
                    </ol>
                    
                    <div className="mt-6 rounded-lg bg-primary-50 p-4">
                      <p className="italic text-gray-700">
                        "{guidance.getRandomGuidance(guidance.quranGuidance).content}"
                      </p>
                      <p className="mt-2 text-sm text-gray-500">
                        {guidance.getRandomGuidance(guidance.quranGuidance).source}
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === "hadith" && (
                  <div>
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">Hadith Insights</h3>
                    <p className="mb-4 text-gray-700">
                      The Hadith section allows you to explore the teachings and traditions of Prophet Muhammad (ﷺ).
                      Reflecting on these insights helps apply prophetic wisdom to your daily life.
                    </p>
                    
                    <h4 className="mb-2 mt-6 font-medium text-gray-900">How to Use</h4>
                    <ol className="ml-5 list-decimal space-y-2 text-gray-700">
                      <li>Select a hadith collection (e.g., Sahih Bukhari, Sahih Muslim)</li>
                      <li>Enter a hadith number to reference a specific hadith</li>
                      <li>Click "Generate Insight" to receive an explanation and reflection</li>
                      <li>Save meaningful insights using the favorite feature</li>
                      <li>Create visual representations with "Generate Image"</li>
                    </ol>
                    
                    <div className="mt-6 rounded-lg bg-primary-50 p-4">
                      <p className="italic text-gray-700">
                        "{guidance.getRandomGuidance(guidance.hadithGuidance).content}"
                      </p>
                      <p className="mt-2 text-sm text-gray-500">
                        {guidance.getRandomGuidance(guidance.hadithGuidance).source}
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === "habits" && (
                  <div>
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">Habit Tracker</h3>
                    <p className="mb-4 text-gray-700">
                      The Habit Tracker helps you establish and maintain beneficial Islamic practices.
                      Consistency in good deeds is highly valued in Islam, even if the deeds are small.
                    </p>
                    
                    <h4 className="mb-2 mt-6 font-medium text-gray-900">How to Use</h4>
                    <ol className="ml-5 list-decimal space-y-2 text-gray-700">
                      <li>Create new habits by clicking "Add New Habit"</li>
                      <li>Set a title, description, and category for your habit</li>
                      <li>Track your daily progress by clicking "Log Progress"</li>
                      <li>View your streak and completion statistics</li>
                      <li>Edit or remove habits as needed</li>
                    </ol>
                    
                    <div className="mt-6 rounded-lg bg-primary-50 p-4">
                      <p className="italic text-gray-700">
                        "{guidance.getRandomGuidance(guidance.habitGuidance).content}"
                      </p>
                      <p className="mt-2 text-sm text-gray-500">
                        {guidance.getRandomGuidance(guidance.habitGuidance).source}
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === "prayer" && (
                  <div>
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">Prayer Guidance</h3>
                    <p className="mb-4 text-gray-700">
                      Prayer (Salah) is a pillar of Islam and a direct connection with Allah.
                      This section provides guidance on maintaining your prayer practice.
                    </p>
                    
                    <h4 className="mb-2 mt-6 font-medium text-gray-900">Prayer Times and Guidelines</h4>
                    <ul className="ml-5 list-disc space-y-2 text-gray-700">
                      <li>Use the prayer tracker to maintain consistency in your daily prayers</li>
                      <li>Set reminders for prayer times</li>
                      <li>Track your prayer completion</li>
                      <li>Engage in dhikr (remembrance of Allah) after prayers</li>
                    </ul>
                    
                    <div className="mt-6 rounded-lg bg-primary-50 p-4">
                      <p className="italic text-gray-700">
                        "{guidance.getRandomGuidance(guidance.prayerGuidance).content}"
                      </p>
                      <p className="mt-2 text-sm text-gray-500">
                        {guidance.getRandomGuidance(guidance.prayerGuidance).source}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HelpGuide; 