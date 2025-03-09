'use client';

import { PageHeaderCard } from '@/components/ui/PageHeaderCard';
import { Button } from '@/components/ui/button';
import { FaUser, FaCog, FaCalendar, FaBook, FaPlus, FaEllipsisV } from 'react-icons/fa';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function HeaderCardExamplesPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Page Header Card Examples</h1>
      
      {/* Basic example */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Basic Header</h2>
        <PageHeaderCard 
          title="User Profile" 
          description="Manage your personal information and preferences"
          icon={FaUser}
        />
        <Card>
          <CardContent className="p-6">
            <p>Content goes here...</p>
          </CardContent>
        </Card>
      </section>
      
      {/* With actions */}
      <section>
        <h2 className="text-xl font-semibold mb-3">With Action Buttons</h2>
        <PageHeaderCard 
          title="Settings" 
          description="Configure your application settings"
          icon={FaCog}
          actions={
            <Button size="sm">
              Save Changes
            </Button>
          }
        />
        <Card>
          <CardContent className="p-6">
            <p>Content goes here...</p>
          </CardContent>
        </Card>
      </section>
      
      {/* Multiple actions */}
      <section>
        <h2 className="text-xl font-semibold mb-3">With Multiple Actions</h2>
        <PageHeaderCard 
          title="Calendar Events" 
          description="View and manage your upcoming events"
          icon={FaCalendar}
          actions={
            <>
              <Button variant="outline" size="sm">
                Filter
              </Button>
              <Button size="sm">
                <FaPlus className="mr-2 h-4 w-4" />
                Add Event
              </Button>
            </>
          }
        />
        <Card>
          <CardContent className="p-6">
            <p>Content goes here...</p>
          </CardContent>
        </Card>
      </section>
      
      {/* With badge */}
      <section>
        <h2 className="text-xl font-semibold mb-3">With Badge</h2>
        <PageHeaderCard 
          title={
            <div className="flex items-center gap-2">
              Reading List
              <Badge variant="outline" className="ml-2">42 books</Badge>
            </div>
          }
          description="Track your reading progress and discover new books"
          icon={FaBook}
          actions={
            <Button variant="ghost" size="icon">
              <FaEllipsisV />
              <span className="sr-only">More options</span>
            </Button>
          }
        />
        <Card>
          <CardContent className="p-6">
            <p>Content goes here...</p>
          </CardContent>
        </Card>
      </section>
      
      {/* Custom styling */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Custom Styling</h2>
        <PageHeaderCard 
          title="Personalized Dashboard" 
          description="Your personalized view of important information and metrics"
          className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20"
          titleClassName="text-gradient bg-gradient-to-r from-purple-600 to-pink-600"
          descriptionClassName="text-muted-foreground/90"
        />
        <Card>
          <CardContent className="p-6">
            <p>Content goes here...</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
} 