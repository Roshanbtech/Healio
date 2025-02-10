import type React from "react"
import { ChevronRight } from "lucide-react"

export const Breadcrumb: React.FC = () => {
  return (
    <div className="flex items-center space-x-2 text-sm">
      <span className="text-gray-600">Dashboard</span>
      <ChevronRight size={16} className="text-gray-400" />
      <span className="text-gray-900">Qualification</span>
    </div>
  )
}

