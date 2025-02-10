import type React from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

const data = [
  { month: "Jan", patients: 20 },
  { month: "Feb", patients: 35 },
  { month: "Mar", patients: 45 },
  { month: "Apr", patients: 50 },
  { month: "May", patients: 52 },
  { month: "Jun", patients: 54 },
]

export const GrowthChart: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <h2 className="text-xl font-semibold mb-4">Customer Growth</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Line type="monotone" dataKey="patients" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

