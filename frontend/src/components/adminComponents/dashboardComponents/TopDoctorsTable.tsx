import React from "react";
import { Star, Award, Calendar } from "lucide-react";

interface Doctor {
    _id: string;
    appointmentsCount: number;
    totalEarnings: number;
    doctorDetails: {
      name: string;
      specialization: string;
      image: string;
      averageRating: number;
    };
  }
  
interface TopDoctorsTableProps {
  doctors: Doctor[];
}

const TopDoctorsTable: React.FC<TopDoctorsTableProps> = ({ doctors }) => {
  return (
    <div className="rounded-lg overflow-hidden shadow-lg border border-gray-200">
      <div className="bg-green-600 px-6 py-4">
        <h2 className="text-xl font-bold text-white">Top Doctors</h2>
        <p className="text-green-100 text-sm">Doctors ranked by performance</p>
      </div>
      <div className="overflow-x-auto bg-white">
        <table className="min-w-full">
          <thead>
            <tr className="bg-green-600 text-white">
              <th className="py-4 px-6 text-left text-sm font-medium uppercase tracking-wider">
                Doctor
              </th>
              <th className="py-4 px-6 text-left text-sm font-medium uppercase tracking-wider">
                Rating
              </th>
              <th className="py-4 px-6 text-left text-sm font-medium uppercase tracking-wider">
                Appointments
              </th>
              <th className="py-4 px-6 text-left text-sm font-medium uppercase tracking-wider">
                Earnings
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {doctors.map((doctor) => (
              <tr key={doctor._id} className="group hover:bg-green-50 transition-all duration-300 ease-in-out">
                <td className="py-5 px-6">
                  <div className="flex items-center">
                    <div className="relative">
                      <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-white shadow-md group-hover:shadow-green-300 group-hover:scale-110 transition-all duration-300">
                        <img
                          src={doctor.doctorDetails.image}
                          alt={doctor.doctorDetails.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-green-500 text-white text-xs rounded-full border-2 border-white">
                        <Award className="h-3 w-3" />
                      </span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-green-700 transition-colors duration-200">
                        Dr. {doctor.doctorDetails.name}
                      </p>
                      <p className="text-xs text-gray-500 group-hover:text-gray-700">
                        {doctor.doctorDetails.specialization}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-5 px-6">
                  <div className="flex items-center">
                    <div className="group-hover:animate-spin duration-700 group-hover:text-yellow-500 transition-all">
                      <Star className="h-5 w-5 text-yellow-400 mr-1 group-hover:filter group-hover:drop-shadow-md" fill="#FBBF24" />
                    </div>
                    <span className="text-sm font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-200">
                      {doctor.doctorDetails.averageRating.toFixed(1)}
                    </span>
                  </div>
                </td>
                <td className="py-5 px-6">
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-green-600 h-2.5 rounded-full group-hover:animate-pulse" style={{ width: `${(doctor.appointmentsCount / 40) * 100}%` }}></div>
                    </div>
                    <div className="flex items-center ml-3 group-hover:transform group-hover:translate-x-1 transition-transform duration-200">
                      <Calendar className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm font-medium text-gray-700">{doctor.appointmentsCount}</span>
                    </div>
                  </div>
                </td>
                <td className="py-5 px-6">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 group-hover:bg-green-200 group-hover:shadow-md transition-all duration-200">
                    ₹{doctor.totalEarnings.toLocaleString()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">Showing {doctors.length} doctors</p>
      </div>
    </div>
  );
};

export default TopDoctorsTable;
