'use client';

import { GlowButton } from '@/components/ui/GlowButton';

export default function GlowButtonExample() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Glow Button Examples
        </h1>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Variants
          </h2>
          <div className="flex flex-wrap gap-4">
            <GlowButton>Primary Button</GlowButton>
            <GlowButton variant="secondary">Secondary Button</GlowButton>
            <GlowButton variant="outline">Outline Button</GlowButton>
            <GlowButton variant="ghost">Ghost Button</GlowButton>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Sizes
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <GlowButton size="sm">Small Button</GlowButton>
            <GlowButton size="md">Medium Button</GlowButton>
            <GlowButton size="lg">Large Button</GlowButton>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Glow Effects
          </h2>
          <div className="flex flex-wrap gap-4">
            <GlowButton
              glowConfig={{
                mode: 'rotate',
                colors: ['#00A53D', '#008236', '#00A53D'],
                blur: 'strongest',
                scale: 1.5,
              }}
            >
              Rotating Glow
            </GlowButton>
            
            <GlowButton
              glowConfig={{
                mode: 'pulse',
                colors: ['#00A53D', '#008236'],
                blur: 'strong',
                scale: 1.3,
              }}
            >
              Pulsing Glow
            </GlowButton>
            
            <GlowButton
              glowConfig={{
                mode: 'colorShift',
                colors: ['#00A53D', '#008236', '#00A53D'],
                blur: 'medium',
                scale: 1.2,
              }}
            >
              Color Shift
            </GlowButton>
            
            <GlowButton
              glowConfig={{
                mode: 'flowHorizontal',
                colors: ['#00A53D', '#008236'],
                blur: 'soft',
                scale: 1.1,
              }}
            >
              Flow Effect
            </GlowButton>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Glow Intensities
          </h2>
          <div className="flex flex-wrap gap-4">
            <GlowButton
              glowConfig={{
                colors: ['#00A53D', '#008236'],
                mode: 'breathe',
                blur: 'soft',
              }}
            >
              Soft Glow
            </GlowButton>
            
            <GlowButton
              glowConfig={{
                colors: ['#00A53D', '#008236'],
                mode: 'breathe',
                blur: 'medium',
              }}
            >
              Medium Glow
            </GlowButton>
            
            <GlowButton
              glowConfig={{
                colors: ['#00A53D', '#008236'],
                mode: 'breathe',
                blur: 'strongest',
              }}
            >
              Strong Glow
            </GlowButton>
          </div>
        </section>
      </div>
    </div>
  );
} 