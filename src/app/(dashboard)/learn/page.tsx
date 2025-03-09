import { Metadata } from "next"
import { Shell } from "@/components/shells/shell"
import { EducationalContent } from "@/components/educational/educational-content"

export const metadata: Metadata = {
  title: "Learn - Islamic Education",
  description: "Access various Islamic educational content including lectures, stories, and explanations.",
}

export default function LearnPage() {
  return (
    <Shell variant="sidebar">
      <EducationalContent />
    </Shell>
  )
} 