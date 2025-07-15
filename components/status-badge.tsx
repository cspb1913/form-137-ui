import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return {
          label: "Pending",
          className: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
        }
      case "in_progress":
        return {
          label: "In Progress",
          className: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
        }
      case "under_review":
        return {
          label: "Under Review",
          className: "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200",
        }
      case "completed":
        return {
          label: "Completed",
          className: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
        }
      case "rejected":
        return {
          label: "Rejected",
          className: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
        }
      case "cancelled":
        return {
          label: "Cancelled",
          className: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200",
        }
      default:
        return {
          label: "Unknown",
          className: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200",
        }
    }
  }

  const config = getStatusConfig(status)

  return (
    <Badge variant="outline" className={cn("font-medium text-xs px-2 py-1 border", config.className, className)}>
      {config.label}
    </Badge>
  )
}
