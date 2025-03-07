import { StatsCard } from "./stats-card"

interface StatsCardsProps {
  stats: {
    streak: number
    level: number
    points: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="flex items-center space-x-4">
      <StatsCard label="Streak" value={stats.streak} />
      <StatsCard label="Level" value={stats.level} />
      <StatsCard label="Points" value={stats.points} />
    </div>
  )
} 