import { cn } from "@/lib/utils"

interface StatsCardProps {
  label: string
  value: number
  className?: string
}

export function StatsCard({ label, value, className }: StatsCardProps) {
  return (
    <div className={cn(
      "flex flex-col items-center rounded-lg bg-green-50 px-4 py-2 text-center",
      className
    )}>
      <span className="text-sm font-medium text-gray-600">{label}</span>
      <span className="text-xl font-bold text-green-700">{value}</span>
    </div>
  )
} 