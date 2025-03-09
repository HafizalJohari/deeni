import { GraduationCap, PlayCircle, BookOpen, Lightbulb, BookOpenText } from "lucide-react"
import { BentoGrid, BentoCard } from "@/components/ui/bento"
import { Button } from "@/components/ui/button"

interface ContentSection {
  id: string
  title: string
  description: string
  icon: any
  items: {
    title: string
    description: string
    href: string
    cta: string
  }[]
}

export function EducationalContent() {
  const sections: ContentSection[] = [
    {
      id: "lectures",
      title: "Audio Lectures",
      description: "Listen to enlightening lectures from respected scholars",
      icon: PlayCircle,
      items: [
        {
          title: "Fundamentals of Islam",
          description: "Essential teachings and principles of Islam explained by scholars",
          href: "#",
          cta: "Listen Now",
        },
        {
          title: "Contemporary Issues",
          description: "Islamic perspective on modern challenges and solutions",
          href: "#",
          cta: "Listen Now",
        },
        {
          title: "Spiritual Development",
          description: "Lectures on purification of the heart and spiritual growth",
          href: "#",
          cta: "Listen Now",
        },
      ],
    },
    {
      id: "stories",
      title: "Prophet Stories",
      description: "Interactive stories of the prophets (peace be upon them)",
      icon: BookOpen,
      items: [
        {
          title: "Story of Prophet Muhammad ﷺ",
          description: "The life and teachings of the final messenger",
          href: "#",
          cta: "Read Story",
        },
        {
          title: "Story of Prophet Ibrahim",
          description: "The journey of faith and sacrifice",
          href: "#",
          cta: "Read Story",
        },
        {
          title: "Story of Prophet Yusuf",
          description: "A tale of patience, wisdom and forgiveness",
          href: "#",
          cta: "Read Story",
        },
      ],
    },
    {
      id: "concepts",
      title: "Islamic Concepts",
      description: "Animated explanations of Islamic concepts",
      icon: Lightbulb,
      items: [
        {
          title: "Pillars of Islam",
          description: "Understanding the five fundamental pillars of Islam",
          href: "#",
          cta: "Watch Now",
        },
        {
          title: "Articles of Faith",
          description: "Exploring the six articles of Islamic faith",
          href: "#",
          cta: "Watch Now",
        },
        {
          title: "Islamic Ethics",
          description: "Learn about Islamic morals and character building",
          href: "#",
          cta: "Watch Now",
        },
      ],
    },
    {
      id: "tafsir",
      title: "Contextual Tafsir",
      description: "In-depth explanations of Quranic verses",
      icon: BookOpenText,
      items: [
        {
          title: "Surah Al-Fatiha",
          description: "Detailed explanation of the opening chapter",
          href: "#",
          cta: "Read Tafsir",
        },
        {
          title: "Ayat Al-Kursi",
          description: "Understanding the verse of the throne",
          href: "#",
          cta: "Read Tafsir",
        },
        {
          title: "Last Ten Surahs",
          description: "Commentary on the final surahs of the Quran",
          href: "#",
          cta: "Read Tafsir",
        },
      ],
    },
  ]

  return (
    <div className="mt-10 space-y-8">
      {sections.map((section) => (
        <div key={section.id} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{section.title}</h2>
          </div>

          <BentoGrid>
            {section.items.map((item, index) => (
              <BentoCard
                key={index}
                name={item.title}
                description={item.description}
                Icon={section.icon}
                href={item.href}
                cta={item.cta}
              >
                <div className="mt-4 max-h-[32rem] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
                  <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950/30">
                    <p className="text-gray-800 dark:text-gray-200">{item.description}</p>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button variant="outline" className="pointer-events-auto">
                      <section.icon className="mr-2 h-4 w-4" />
                      {item.cta}
                    </Button>
                  </div>
                </div>
              </BentoCard>
            ))}
          </BentoGrid>
        </div>
      ))}
    </div>
  )
} 