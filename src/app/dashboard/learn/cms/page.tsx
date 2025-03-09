'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Filter } from 'lucide-react';
import { LearningContent } from '@/types/learn';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ContentList from './components/ContentList';
import ContentEditor from './components/ContentEditor';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function LearnCMSPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<LearningContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          router.push('/login?returnUrl=/dashboard/learn/cms');
          return;
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking auth:', error);
        router.push('/login?returnUrl=/dashboard/learn/cms');
      }
    };

    checkAuth();
  }, [router, supabase.auth]);

  const handleCreateNew = () => {
    setSelectedContent(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (content: LearningContent) => {
    setSelectedContent(content);
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setSelectedContent(null);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Learning Content Management</h1>
        <Button onClick={handleCreateNew} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create New Content
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <ContentList onEdit={handleEdit} searchQuery={searchQuery} />
      </div>

      {isEditorOpen && (
        <ContentEditor
          content={selectedContent}
          onClose={handleCloseEditor}
          onSave={() => {
            handleCloseEditor();
            router.refresh();
          }}
        />
      )}
    </div>
  );
} 