import type React from "react"
import { TrendingUp } from "lucide-react"
import { assets } from "../../../assets/assets"

interface StatCardProps {
  label: string
  value: number
  percentage?: number
  isNew?: boolean
}

const StatCard: React.FC<StatCardProps> = ({ label, value, percentage, isNew }) => (
  <div className={`rounded-xl p-4 ${isNew ? "bg-red-600" : "bg-red-200"}`}>
    <div className={`text-2xl font-bold ${isNew ? "text-white" : "text-red-600"}`}>{value}</div>
    <div className={`text-sm ${isNew ? "text-red-100" : "text-red-700"}`}>{label}</div>
    {percentage && (
      <div className={`flex items-center mt-1 text-xs ${isNew ? "text-red-100" : "text-red-700"}`}>
        <TrendingUp size={14} className="mr-1" />
        {percentage}%
      </div>
    )}
  </div>
)

export const DashboardStats: React.FC = () => {
  return (
    <div className="bg-[#e8f8e8] p-6 rounded-2xl flex justify-between items-center mb-6 relative overflow-visible">
      <div className="flex-1">
        <div className="mb-4">
          <h2 className="text-xl">Visits for Today</h2>
          <div className="text-4xl font-bold">104</div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <StatCard label="New Patients" value={40} percentage={51} isNew />
          <StatCard label="Old Patients" value={64} percentage={76} />
        </div>
      </div>
      <div className="relative w-1/2">
        <img
          src={assets.doc11}
          alt="Doctor"
          className="absolute -bottom-25 right-0 w-full max-w-[300px]"
        />
      </div>
    </div>
  )
}
