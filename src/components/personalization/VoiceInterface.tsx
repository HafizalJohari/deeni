import { useState, useEffect, useRef } from 'react';
import { usePersonalizationStore } from '../../lib/store/personalization-store';

// Define a type for SpeechRecognition
interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

// Define a constructor for SpeechRecognition
interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

// Add type declaration for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

enum VoiceStatus {
  IDLE = 'idle',
  LISTENING = 'listening',
  PROCESSING = 'processing',
  SPEAKING = 'speaking',
  ERROR = 'error',
}

interface VoiceCommand {
  command: string;
  keywords: string[];
  handler: (transcript: string) => void;
  response: string;
}

export default function VoiceInterface() {
  const { userPreferences } = usePersonalizationStore();
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>(VoiceStatus.IDLE);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if the browser supports SpeechRecognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          const result = event.results[0][0].transcript;
          setTranscript(result);
          handleVoiceCommand(result);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setVoiceStatus(VoiceStatus.ERROR);
          setTimeout(() => setVoiceStatus(VoiceStatus.IDLE), 3000);
        };

        recognitionRef.current.onend = () => {
          if (voiceStatus === VoiceStatus.LISTENING) {
            setVoiceStatus(VoiceStatus.PROCESSING);
          }
        };
      }

      // Initialize speech synthesis
      synthesisRef.current = new SpeechSynthesisUtterance();
      synthesisRef.current.lang = 'en-US';
      synthesisRef.current.rate = 1;
      synthesisRef.current.pitch = 1;

      synthesisRef.current.onend = () => {
        setVoiceStatus(VoiceStatus.IDLE);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Check user preferences for voice notifications
  useEffect(() => {
    if (userPreferences) {
      setIsVoiceEnabled(userPreferences.notificationPreferences.useVoiceNotifications);
    }
  }, [userPreferences]);

  const startListening = () => {
    if (recognitionRef.current) {
      setTranscript('');
      setResponse('');
      setVoiceStatus(VoiceStatus.LISTENING);
      recognitionRef.current.start();
    } else {
      setResponse('Your browser does not support voice recognition.');
      setVoiceStatus(VoiceStatus.ERROR);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setVoiceStatus(VoiceStatus.IDLE);
    }
  };

  const speak = (text: string) => {
    if (!synthesisRef.current || !window.speechSynthesis) return;

    setVoiceStatus(VoiceStatus.SPEAKING);
    setResponse(text);
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    synthesisRef.current.text = text;
    window.speechSynthesis.speak(synthesisRef.current);
  };

  const voiceCommands: VoiceCommand[] = [
    {
      command: 'daily plan',
      keywords: ['daily plan', 'today plan', 'plan for today'],
      handler: () => {
        window.location.href = '/dashboard/growth-plan';
      },
      response: 'Navigating to your daily growth plan.',
    },
    {
      command: 'weekly plan',
      keywords: ['weekly plan', 'week plan', 'plan for the week'],
      handler: () => {
        window.location.href = '/dashboard/growth-plan';
      },
      response: 'Navigating to your weekly growth plan.',
    },
    {
      command: 'mood tracker',
      keywords: ['mood tracker', 'track mood', 'how am I feeling'],
      handler: () => {
        window.location.href = '/dashboard/mood-tracker';
      },
      response: 'Opening the mood tracker for you.',
    },
    {
      command: 'recommendations',
      keywords: ['recommendations', 'content', 'suggested content'],
      handler: () => {
        window.location.href = '/dashboard/recommendations';
      },
      response: 'Showing your personalized content recommendations.',
    },
    {
      command: 'prayer times',
      keywords: ['prayer times', 'salah times'],
      handler: () => {
        window.location.href = '/dashboard/prayer-times';
      },
      response: 'Checking today\'s prayer times for you.',
    },
    {
      command: 'dashboard',
      keywords: ['dashboard', 'home', 'main page'],
      handler: () => {
        window.location.href = '/dashboard';
      },
      response: 'Going to your dashboard.',
    },
    {
      command: 'help',
      keywords: ['help', 'commands', 'what can I say'],
      handler: () => {
        const helpText = 'You can ask me to navigate to your daily plan, weekly plan, mood tracker, content recommendations, prayer times, or dashboard. You can also ask for help.';
        speak(helpText);
      },
      response: 'You can ask me to navigate to your daily plan, weekly plan, mood tracker, content recommendations, prayer times, or dashboard. You can also ask for help.',
    },
  ];

  const handleVoiceCommand = (spokenText: string) => {
    const lowerText = spokenText.toLowerCase();
    
    let commandFound = false;
    
    for (const command of voiceCommands) {
      if (command.keywords.some(keyword => lowerText.includes(keyword))) {
        commandFound = true;
        setVoiceStatus(VoiceStatus.PROCESSING);
        
        // Speak the response
        speak(command.response);
        
        // Execute the command handler after a short delay
        setTimeout(() => {
          command.handler(lowerText);
        }, 1000);
        
        break;
      }
    }
    
    if (!commandFound) {
      speak("I'm sorry, I didn't understand that command. Try saying 'help' for a list of commands.");
    }
  };

  const toggleVoiceInterface = () => {
    setIsVoiceEnabled(prev => !prev);
    
    // If we're enabling the voice interface, update the user preferences
    if (!isVoiceEnabled && userPreferences) {
      const updatedPreferences = {
        ...userPreferences,
        notificationPreferences: {
          ...userPreferences.notificationPreferences,
          useVoiceNotifications: true,
        },
      };
      // Update preferences in store
      // This would typically also save to the database
    }
  };

  const getStatusIcon = () => {
    switch (voiceStatus) {
      case VoiceStatus.IDLE:
        return '🎙️';
      case VoiceStatus.LISTENING:
        return '🔴';
      case VoiceStatus.PROCESSING:
        return '⏳';
      case VoiceStatus.SPEAKING:
        return '🔊';
      case VoiceStatus.ERROR:
        return '❌';
      default:
        return '🎙️';
    }
  };

  if (!isVoiceEnabled) {
    return (
      <button
        onClick={toggleVoiceInterface}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        aria-label="Enable voice interface"
      >
        <span className="text-xl">🎙️</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Voice status indicator */}
      <div
        className={`absolute -top-20 right-0 w-64 p-3 rounded-lg shadow-lg transition-all duration-300 ${
          transcript || response ? 'opacity-100' : 'opacity-0 pointer-events-none'
        } ${
          voiceStatus === VoiceStatus.ERROR ? 'bg-red-50 border border-red-200' : 'bg-white border border-gray-200'
        }`}
      >
        {transcript && (
          <div className="mb-2">
            <p className="text-xs font-medium text-gray-500">You said:</p>
            <p className="text-sm text-gray-700">{transcript}</p>
          </div>
        )}
        {response && (
          <div>
            <p className="text-xs font-medium text-gray-500">Response:</p>
            <p className="text-sm text-gray-700">{response}</p>
          </div>
        )}
      </div>

      {/* Voice interface buttons */}
      <div className="flex space-x-2">
        <button
          onClick={toggleVoiceInterface}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-700 shadow-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          aria-label="Disable voice interface"
        >
          <span className="text-sm">🔇</span>
        </button>
        
        <button
          onClick={voiceStatus === VoiceStatus.LISTENING ? stopListening : startListening}
          disabled={voiceStatus === VoiceStatus.PROCESSING || voiceStatus === VoiceStatus.SPEAKING}
          className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            voiceStatus === VoiceStatus.LISTENING 
              ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500'
          } ${
            (voiceStatus === VoiceStatus.PROCESSING || voiceStatus === VoiceStatus.SPEAKING) 
              ? 'opacity-70 cursor-not-allowed' 
              : ''
          }`}
          aria-label={voiceStatus === VoiceStatus.LISTENING ? 'Stop listening' : 'Start listening'}
        >
          <span className="text-xl">{getStatusIcon()}</span>
        </button>
      </div>
    </div>
  );
} 