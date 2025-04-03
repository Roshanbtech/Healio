import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInterceptors";
import Pagination from "./Pagination";
import { signedUrltoNormalUrl } from "../../../utils/getUrl";

interface Doctor {
  _id: string;
  name: string;
  speciality: string | { name: string; _id?: string };
  image: string;
}

interface RelatedDoctorsProps {
  speciality: string | { name: string; _id?: string };
  docId: string;
}

const RelatedDoctors: React.FC<RelatedDoctorsProps> = ({ speciality, docId }) => {
  const navigate = useNavigate();
  const [relDoctors, setRelDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pagination, setPagination] = useState<any>(null);
  const itemsPerPage = 4;

  useEffect(() => {
    const fetchRelatedDoctors = async () => {
      if (!speciality) return;
      try {
        setLoading(true);
        const specialityValue =
          typeof speciality === "object"
            ? speciality._id || speciality.name
            : speciality;
        const response = await axiosInstance.get("/doctors", {
          params: {
            speciality: specialityValue,
            page: currentPage,
            limit: itemsPerPage,
          },
        });
        const doctorsData = response.data?.data?.doctors;
        let doctorsList: Doctor[] = doctorsData?.data || [];
        doctorsList = doctorsList.filter((doc) => doc._id !== docId);
        setRelDoctors(doctorsList);
        setPagination(doctorsData?.pagination);
      } catch (err: any) {
        setError(err.message || "Failed to fetch related doctors");
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedDoctors();
  }, [speciality, docId, currentPage]);

  if (loading) {
    return <div className="text-center py-4">Loading related doctors...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-600">Error: {error}</div>;
  }

  if (relDoctors.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-4 my-12 md:mx-10 text-gray-900">
      <h1 className="text-2xl font-medium text-green-900">Related Doctors</h1>
      <p className="sm:w-1/3 text-center text-xs">
        Simply browse through our extensive list of trusted doctors.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 px-3 sm:px-0">
        {relDoctors.map((item) => (
          <div
            key={item._id}
            onClick={() => {
              navigate(`/doctorDetails/${item._id}`);
              window.scrollTo(0, 0);
            }}
            className="bg-white shadow-md rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
          >
            <div className="relative w-full h-48 bg-green-100">
              <img
                className="w-full h-full object-cover"
                src={signedUrltoNormalUrl(item.image) || "/placeholder.svg"}
                alt={item.name}
              />
            </div>
            <div className="p-4 bg-red-600 text-white">
              <div className="flex items-center gap-2 text-xs mb-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-green-500">Available</p>
              </div>
              <h3 className="text-lg font-semibold mb-1">{item.name}</h3>
              <p className="text-xs">
                {typeof item.speciality === "object"
                  ? item.speciality.name
                  : item.speciality}
              </p>
            </div>
          </div>
        ))}
      </div>
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            onPageChange={(page: number) => setCurrentPage(page)}
          />
        </div>
      )}
    </div>
  );
};

export default RelatedDoctors;