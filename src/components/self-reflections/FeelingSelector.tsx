import { FeelingOption } from '@/types/self-reflections';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FeelingSelectorProps {
  selectedFeeling: FeelingOption | null;
  onSelect: (feeling: FeelingOption) => void;
}

const feelingCategories = {
  positive: [
    { id: 'grateful', label: 'Grateful', icon: '🤲', description: 'Feeling thankful for Allah\'s blessings' },
    { id: 'happy', label: 'Happy', icon: '😊', description: 'Experiencing joy and satisfaction' },
    { id: 'peaceful', label: 'Peaceful', icon: '😌', description: 'Feeling calm and at ease' },
    { id: 'hopeful', label: 'Hopeful', icon: '🌟', description: 'Looking forward with optimism' },
    { id: 'motivated', label: 'Motivated', icon: '💪', description: 'Feeling driven and energetic' },
    { id: 'content', label: 'Content', icon: '😊', description: 'Feeling satisfied and at peace' }
  ],
  negative: [
    { id: 'anxious', label: 'Anxious', icon: '😰', description: 'Feeling worried or uneasy' },
    { id: 'sad', label: 'Sad', icon: '😢', description: 'Experiencing grief or sorrow' },
    { id: 'frustrated', label: 'Frustrated', icon: '😤', description: 'Feeling annoyed or discouraged' },
    { id: 'overwhelmed', label: 'Overwhelmed', icon: '😫', description: 'Feeling burdened or stressed' },
    { id: 'angry', label: 'Angry', icon: '😠', description: 'Experiencing strong displeasure' },
    { id: 'guilty', label: 'Guilty', icon: '😔', description: 'Feeling remorseful or regretful' }
  ],
  neutral: [
    { id: 'confused', label: 'Confused', icon: '😕', description: 'Feeling uncertain or unclear' },
    { id: 'uncertain', label: 'Uncertain', icon: '🤔', description: 'Having doubts or questions' },
    { id: 'reflective', label: 'Reflective', icon: '🤔', description: 'Being thoughtful and contemplative' },
    { id: 'nostalgic', label: 'Nostalgic', icon: '💭', description: 'Remembering past experiences' },
    { id: 'curious', label: 'Curious', icon: '🧐', description: 'Wanting to learn or understand more' }
  ],
  spiritual: [
    { id: 'faithful', label: 'Faithful', icon: '🕌', description: 'Strong in faith and trust in Allah' },
    { id: 'blessed', label: 'Blessed', icon: '☪️', description: 'Feeling Allah\'s favor and mercy' },
    { id: 'repentant', label: 'Repentant', icon: '🤲', description: 'Seeking forgiveness and turning back to Allah' },
    { id: 'guided', label: 'Guided', icon: '⭐', description: 'Feeling Allah\'s guidance and direction' },
    { id: 'tested', label: 'Tested', icon: '🔄', description: 'Experiencing trials and challenges' }
  ]
};

export default function FeelingSelector({ selectedFeeling, onSelect }: FeelingSelectorProps) {
  const handleFeelingClick = (e: React.MouseEvent, feeling: FeelingOption) => {
    e.preventDefault(); // Prevent form submission
    onSelect(feeling);
  };

  return (
    <div className="space-y-4">
      {Object.entries(feelingCategories).map(([category, feelings]) => (
        <div key={category} className="space-y-2">
          <h3 className="text-sm font-medium capitalize">{category}</h3>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {feelings.map((feeling) => (
              <Button
                key={feeling.id}
                type="button" // Explicitly set type to button
                variant="outline"
                className={cn(
                  'h-auto flex-col gap-1 p-2',
                  selectedFeeling?.id === feeling.id && 'border-primary'
                )}
                onClick={(e) => handleFeelingClick(e, { ...feeling, category })}
                title={feeling.description}
              >
                <span className="text-xl">{feeling.icon}</span>
                <span className="text-xs">{feeling.label}</span>
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
} 