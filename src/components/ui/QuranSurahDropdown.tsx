'use client';

import { useState, useEffect, useRef } from 'react';
import { FaChevronDown, FaSearch } from 'react-icons/fa';
import { quranSurahs, QuranSurah } from '@/lib/quran-data';

interface QuranSurahDropdownProps {
  value: string;
  onChange: (value: string) => void;
  onSurahSelect?: (surah: QuranSurah) => void;
  className?: string;
}

export const QuranSurahDropdown = ({
  value,
  onChange,
  onSurahSelect,
  className = '',
}: QuranSurahDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter surahs based on search term
  const filteredSurahs = quranSurahs.filter(
    (surah) =>
      surah.number.toString().includes(searchTerm) ||
      surah.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSurahSelect = (surah: QuranSurah) => {
    onChange(surah.number.toString());
    if (onSurahSelect) {
      onSurahSelect(surah);
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  // Get the selected surah name for display
  const selectedSurah = quranSurahs.find((surah) => surah.number.toString() === value);
  const displayText = selectedSurah
    ? `${selectedSurah.number}. ${selectedSurah.name} (${selectedSurah.totalVerses} verses)`
    : 'Select Surah';

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-left text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="block truncate">{displayText}</span>
        <FaChevronDown className="h-4 w-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 max-h-96 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          <div className="sticky top-0 z-10 bg-white px-3 py-2">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <FaSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                ref={inputRef}
                type="text"
                className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                placeholder="Search surah..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <ul
            className="max-h-80 overflow-auto py-1"
            role="listbox"
            aria-labelledby="surah-dropdown"
            tabIndex={0}
          >
            {filteredSurahs.length > 0 ? (
              filteredSurahs.map((surah) => (
                <li
                  key={surah.number}
                  className={`relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-green-50 ${
                    surah.number.toString() === value ? 'bg-green-100 text-green-900' : 'text-gray-900'
                  }`}
                  role="option"
                  aria-selected={surah.number.toString() === value}
                  onClick={() => handleSurahSelect(surah)}
                >
                  <div className="flex items-center">
                    <span className="mr-2 font-medium">{surah.number}.</span>
                    <span className="block truncate">{surah.name}</span>
                    <span className="ml-2 text-xs text-gray-500">({surah.totalVerses} verses)</span>
                  </div>
                </li>
              ))
            ) : (
              <li className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-500">
                No surahs found
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}; 