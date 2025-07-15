import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return {
          label: "Pending",
          variant: "secondary" as const,
          className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        }
      case "processing":
        return {
          label: "Processing",
          variant: "default" as const,
          className: "bg-blue-100 text-blue-800 border-blue-200",
        }
      case "approved":
        return {
          label: "Approved",
          variant: "default" as const,
          className: "bg-green-100 text-green-800 border-green-200",
        }
      case "completed":
        return {
          label: "Completed",
          variant: "default" as const,
          className: "bg-emerald-100 text-emerald-800 border-emerald-200",
        }
      case "rejected":
        return {
          label: "Rejected",
          variant: "destructive" as const,
          className: "bg-red-100 text-red-800 border-red-200",
        }
      case "submitted":
        return {
          label: "Submitted",
          variant: "outline" as const,
          className: "bg-gray-100 text-gray-800 border-gray-200",
        }
      case "received":
        return {
          label: "Received",
          variant: "outline" as const,
          className: "bg-indigo-100 text-indigo-800 border-indigo-200",
        }
      default:
        return {
          label: status,
          variant: "outline" as const,
          className: "bg-gray-100 text-gray-800 border-gray-200",
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
