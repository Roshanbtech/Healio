import React, { useState, useEffect } from "react";
import { X, Star } from "lucide-react";
import { toast } from "react-toastify";
import { IAppointment } from "../userComponents/AppointmentList";

interface ReviewModalProps {
  appointment: IAppointment;
  onClose: () => void;
  onSubmit: (rating: number, description: string) => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  appointment,
  onClose,
  onSubmit,
}) => {
  // Initialize with existing review if available
  const [rating, setRating] = useState<number>(appointment.review?.rating || 0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [description, setDescription] = useState<string>(
    appointment.review?.description || ""
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate input
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    // Limit description length to 500 characters
    if (description.length > 500) {
      toast.error("Review description cannot exceed 500 characters");
      return;
    }

    try {
      setIsSubmitting(true);

      await onSubmit(rating, description);
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-transparent bg-opacity-40 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn transform transition-all">
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-5 flex justify-between items-center">
          <h2 className="text-white text-lg font-bold">
            {appointment.review?.rating
              ? "Edit Review"
              : "Rate Your Experience"}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-red-200 transition-colors"
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                How would you rate Dr. {appointment.doctorId.name}?
              </label>
              <div className="flex justify-center mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none"
                    disabled={isSubmitting}
                  >
                    <Star
                      size={32}
                      className={`mx-1 transition-colors ${
                        (hoverRating || rating) >= star
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review (optional)
              </label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={`Share your experience with Dr. ${appointment.doctorId.name}`}
                rows={4}
                maxLength={500}
                disabled={isSubmitting}
              ></textarea>
              <p className="text-sm text-gray-500 mt-1">
                {description.length}/500 characters
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-all font-medium"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-5 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-md hover:from-red-700 hover:to-red-800 transition-all font-medium shadow-md ${
                  rating === 0 || isSubmitting
                    ? "opacity-70 cursor-not-allowed"
                    : ""
                }`}
                disabled={rating === 0 || isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <span className="mr-2 h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin"></span>
                    {appointment.review?.rating
                      ? "Updating..."
                      : "Submitting..."}
                  </span>
                ) : appointment.review?.rating ? (
                  "Update Review"
                ) : (
                  "Submit Review"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
