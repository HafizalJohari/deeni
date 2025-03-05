import { GoalStatus, GoalCategory } from '@/types/growth-plan';

export const getStatusColor = (status: GoalStatus): string => {
  const colors = {
    not_started: 'bg-slate-100 text-slate-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
  };
  return colors[status];
};

export const getCategoryColor = (category: GoalCategory): string => {
  const colors = {
    'Prayer': 'bg-indigo-100 text-indigo-800',
    'Quran': 'bg-emerald-100 text-emerald-800',
    'Dhikr': 'bg-purple-100 text-purple-800',
    'Fasting': 'bg-amber-100 text-amber-800',
    'Community': 'bg-pink-100 text-pink-800',
    'Knowledge': 'bg-cyan-100 text-cyan-800',
  };
  return colors[category] || 'bg-gray-100 text-gray-800';
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}; 