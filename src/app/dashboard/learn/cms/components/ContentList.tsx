'use client';

import { useState, useEffect, useCallback } from 'react';
import { Edit2, Trash2, Eye, MoreVertical, AlertCircle, RefreshCw } from 'lucide-react';
import { LearningContent } from '@/types/learn';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface ContentListProps {
  onEdit: (content: LearningContent) => void;
  searchQuery: string;
}

export default function ContentList({ onEdit, searchQuery }: ContentListProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [contents, setContents] = useState<LearningContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const checkAndRefreshSession = useCallback(async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      router.push('/login?returnUrl=/dashboard/learn/cms');
      throw new Error('Session expired - Please log in again');
    }
    
    return session;
  }, [supabase.auth, router]);

  const fetchContents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check session before making the request
      await checkAndRefreshSession();
      
      const response = await fetch('/api/learn/content?' + new URLSearchParams({
        search: searchQuery
      }));
      
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          await checkAndRefreshSession();
          throw new Error('Please log in to access this content');
        }
        throw new Error(data.error || `Error: ${response.status} - ${response.statusText}`);
      }

      // Ensure data is an array
      if (!Array.isArray(data)) {
        console.error('Invalid response data:', data);
        throw new Error('Invalid response format - expected an array');
      }

      setContents(data);
      setRetryCount(0); // Reset retry count on successful fetch
    } catch (error) {
      console.error('Error fetching contents:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while fetching contents');
      setContents([]);
      
      // If it's an auth error, redirect to login
      if (error instanceof Error && 
          (error.message.includes('login') || error.message.includes('session'))) {
        router.push('/login?returnUrl=/dashboard/learn/cms');
      }
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, router, checkAndRefreshSession]);

  useEffect(() => {
    fetchContents();
  }, [fetchContents]);

  const handleRetry = async () => {
    setRetryCount(prev => prev + 1);
    await fetchContents();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    try {
      // Check session before making the request
      await checkAndRefreshSession();
      
      const response = await fetch(`/api/learn/content/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        if (response.status === 401) {
          await checkAndRefreshSession();
          throw new Error('Please log in to perform this action');
        }
        throw new Error(data?.error || 'Failed to delete content');
      }

      await fetchContents();
    } catch (error) {
      console.error('Error deleting content:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while deleting content');
      
      // If it's an auth error, redirect to login
      if (error instanceof Error && 
          (error.message.includes('login') || error.message.includes('session'))) {
        router.push('/login?returnUrl=/dashboard/learn/cms');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="ml-2 flex items-center justify-between w-full">
          <span>
            {error}
            {retryCount > 0 && ` (Attempt ${retryCount + 1})`}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            className="ml-4"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!Array.isArray(contents) || contents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No content found. Create your first learning content!
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b dark:border-gray-700">
            <th className="py-4 px-6 text-left">Title</th>
            <th className="py-4 px-6 text-left">Category</th>
            <th className="py-4 px-6 text-left">Status</th>
            <th className="py-4 px-6 text-left">Last Updated</th>
            <th className="py-4 px-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {contents.map((content) => (
            <tr
              key={content.id}
              className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <td className="py-4 px-6">
                <div className="font-medium">{content.title}</div>
                <div className="text-sm text-gray-500">{content.description}</div>
              </td>
              <td className="py-4 px-6">
                <span className="px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-700">
                  {content.category}
                </span>
              </td>
              <td className="py-4 px-6">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    content.published
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                  }`}
                >
                  {content.published ? 'Published' : 'Draft'}
                </span>
              </td>
              <td className="py-4 px-6 text-sm text-gray-500">
                {formatDistanceToNow(new Date(content.updatedAt), { addSuffix: true })}
              </td>
              <td className="py-4 px-6">
                <div className="flex justify-end gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(content)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(content.id)}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 