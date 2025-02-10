"use client"
import { Sidebar } from "../common/doctorCommon/Sidebar"
import { DashboardStats } from "../common/doctorCommon/Dashboard-stats"
import { GrowthChart } from "../common/doctorCommon/Growth-chart"


const Home = () => {

  // Uncomment this useEffect to redirect unauthorized users
  // useEffect(() => {
  //   const token = localStorage.getItem("authToken");
  //   if (!token) {
  //     navigate("/doctor/login");
  //   }
  // }, [navigate]);

  return (
    <div className="min-h-screen flex bg-white">
      <div className="w-1/4 bg-white shadow-lg">
        <Sidebar />
      </div>

      <div className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <h2 className="text-xl mt-2">
              Good Morning <span className="text-red-600">Dr.Roshan!</span>
            </h2>
          </div>

          <DashboardStats />
          <GrowthChart />
        </div>
      </div>
    </div>
  )
}

export default Home

