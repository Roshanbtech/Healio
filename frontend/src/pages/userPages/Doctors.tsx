import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInterceptors";
import Pagination from "../../components/common/userCommon/Pagination";

interface Speciality {
  _id: string;
  name: string;
}

interface Doctor {
  _id: string;
  name: string;
  speciality: string | Speciality;
  image: string;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const Doctors: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedSpeciality = searchParams.get("speciality") || "";
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<Speciality[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  const fetchDoctors = async (speciality?: string) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/doctors", {
        params: {
          speciality: speciality || selectedSpeciality,
          page: currentPage,
          limit: itemsPerPage,
        },
      });
      const doctorsData = response.data?.data?.doctors;
      setDoctors(doctorsData?.data || []);
      setPagination(doctorsData?.pagination || null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpeciality, currentPage]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axiosInstance.get("/services");
        setServices(response.data?.data?.services || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch services");
      }
    };
    fetchServices();
  }, []);

  const handleSpecialityClick = (specId: string) => {
    setSearchParams({ speciality: specId });
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-green-800 mb-6">Our Doctors</h1>
      <p className="text-gray-600 mb-8">
        Browse through our specialist doctors.
      </p>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar: Display the list of specialities */}
        <div className="lg:w-1/4">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-semibold text-green-800 mb-4">
              Specialities
            </h2>
            <div className="space-y-2">
              {services.map((spec) => (
                <button
                  key={spec._id}
                  onClick={() => handleSpecialityClick(spec._id)}
                  className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                    selectedSpeciality === spec._id
                      ? "bg-red-600 text-white"
                      : "bg-green-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {spec.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Doctors Grid */}
        <div className="lg:w-3/4">
          {doctors.length === 0 ? (
            <p className="text-center text-gray-600">
              No doctors found with this specialization.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.map((doctor) => (
                  <div
                    key={doctor._id}
                    onClick={() => navigate(`/doctorDetails/${doctor._id}`)}
                    className="bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer"
                  >
                    {/* Responsive Image Container */}
                    <div className="relative w-full h-64 bg-green-100">
                      <img
                        className="w-full h-full object-cover"
                        src={doctor.image || "/placeholder.svg"}
                        alt={doctor.name}
                        loading="lazy"
                      />
                    </div>
                    <div className="p-6 bg-red-600 text-white">
                      <div className="flex items-center gap-2 text-sm mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <p className="text-green-500">Available</p>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">
                        {doctor.name}
                      </h3>
                      <p className="text-sm">
                        {typeof doctor.speciality === "object"
                          ? doctor.speciality.name
                          : doctor.speciality}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Component */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={(page: number) => setCurrentPage(page)}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Doctors;
