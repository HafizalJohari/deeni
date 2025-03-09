export type LearningContent = {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  slug: string;
  featuredImage?: string;
};

export type LearningCategory = {
  id: string;
  name: string;
  description: string;
  slug: string;
};

export type CreateLearningContentInput = Omit<LearningContent, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateLearningContentInput = Partial<CreateLearningContentInput>; 