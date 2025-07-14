import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: "submitted" | "under-review" | "processing" | "ready-for-pickup" | "completed" | "requires-clarification"
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "submitted":
        return {
          label: "Submitted",
          variant: "secondary" as const,
          className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
        }
      case "under-review":
        return {
          label: "Under Review",
          variant: "secondary" as const,
          className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
        }
      case "processing":
        return {
          label: "Processing",
          variant: "secondary" as const,
          className: "bg-orange-100 text-orange-800 hover:bg-orange-100",
        }
      case "ready-for-pickup":
        return {
          label: "Ready for Pickup",
          variant: "secondary" as const,
          className: "bg-green-100 text-green-800 hover:bg-green-100",
        }
      case "completed":
        return {
          label: "Completed",
          variant: "secondary" as const,
          className: "bg-green-100 text-green-800 hover:bg-green-100",
        }
      case "requires-clarification":
        return {
          label: "Needs Clarification",
          variant: "destructive" as const,
          className: "bg-red-100 text-red-800 hover:bg-red-100",
        }
      default:
        return {
          label: "Unknown",
          variant: "secondary" as const,
          className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
        }
    }
  }

  const config = getStatusConfig(status)

  return (
    <Badge variant={config.variant} className={cn(config.className, className)}>
      {config.label}
    </Badge>
  )
}
