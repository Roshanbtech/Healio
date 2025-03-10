"use client"

import { useState, useEffect, useRef } from "react"
import {
  Clock,
  Award,
  Heart,
  MapPin,
  Star,
  CheckCircle,
  ThumbsUp,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
} from "lucide-react"
import { assets } from "../../../assets/assets"
import axiosInstance from "../../../utils/axiosInterceptors"

// Doctor interface for API data
interface IDoctorSlider {
  _id: string
  name: string
  image?: string
  speciality?: {
    _id: string
    name: string
  }
  about?: string
  experience?: string
  averageRating?: number
  reviewCount?: number
  fees?: number
  hospital?: string
}

const About = () => {
  // For testimonial slider
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const testimonials = [
    {
      text: "The doctors at Healio truly listen to your concerns. Their online booking system is so convenient, and I never have to wait long for appointments.",
      name: "Sarah Thompson",
      since: "Patient since 2022",
    },
    {
      text: "I appreciate how Dr. Peterson takes the time to explain everything thoroughly. The online portal makes managing my healthcare so much easier.",
      name: "Michael Chen",
      since: "Patient since 2023",
    },
    {
      text: "The care my family receives at Healio is exceptional. From booking to follow-up, everything is streamlined and professional.",
      name: "Jennifer Wilson",
      since: "Patient since 2021",
    },
    {
      text: "Dr. Patel helped me manage my heart condition with a personalized approach. I'm grateful for the attentive care I receive at Healio.",
      name: "Robert Johnson",
      since: "Patient since 2020",
    },
  ]

  // For doctors slider - now using API data
  const [doctors, setDoctors] = useState<IDoctorSlider[]>([])
  const [currentDoctor, setCurrentDoctor] = useState(0)
  const [loading, setLoading] = useState(true)

  // Video player state
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  // Toggle video play/pause
  const toggleVideo = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  // Fetch doctors from API
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true)
        const response = await axiosInstance.get("/doctors")
        // Response structure: { status: true, data: { doctors: { data: [ ... ], pagination: { ... } } }, message: "Doctors fetched successfully" }
        const fetchedDoctors: IDoctorSlider[] = response.data.data.doctors.data || []
        // Filter to display only doctors with an averageRating greater than 0
        const filteredDoctors = fetchedDoctors.filter((doctor: IDoctorSlider) => (doctor.averageRating || 0) > 0)
        setDoctors(filteredDoctors.length > 0 ? filteredDoctors : fallbackDoctors)
      } catch (error) {
        console.error("Error fetching doctors:", error)
        setDoctors(fallbackDoctors)
      } finally {
        setLoading(false)
      }
    }

    fetchDoctors()
  }, [])

  // Fallback doctors data in case API fails
  const fallbackDoctors: IDoctorSlider[] = [
    {
      _id: "1",
      name: "Dr. Sarah Peterson",
      speciality: {
        _id: "s1",
        name: "General Physician",
      },
      about: "Board certified with over 10 years of experience in family medicine and primary care.",
      experience: "10+ years",
      averageRating: 4.8,
      reviewCount: 124,
      hospital: "Healio Medical Center",
      fees: 150,
    },
    {
      _id: "2",
      name: "Dr. James Patel",
      speciality: {
        _id: "s2",
        name: "Cardiologist",
      },
      about: "Specialized in cardiovascular health with expertise in preventive cardiac care.",
      experience: "15+ years",
      averageRating: 4.9,
      reviewCount: 156,
      hospital: "Healio Heart Institute",
      fees: 200,
    },
    {
      _id: "3",
      name: "Dr. Maria Rodriguez",
      speciality: {
        _id: "s3",
        name: "Pediatrician",
      },
      about: "Dedicated to providing comprehensive care for children from infancy through adolescence.",
      experience: "8+ years",
      averageRating: 4.7,
      reviewCount: 98,
      hospital: "Healio Children's Center",
      fees: 130,
    },
    {
      _id: "4",
      name: "Dr. Michael Wang",
      speciality: {
        _id: "s4",
        name: "Neurologist",
      },
      about: "Specialized in treating neurological disorders with a patient-centered approach.",
      experience: "12+ years",
      averageRating: 4.6,
      reviewCount: 87,
      hospital: "Healio Neurology Center",
      fees: 180,
    },
  ]

  // Auto-advance sliders
  useEffect(() => {
    const testimonialInterval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))
    }, 5000)

    const doctorInterval = setInterval(() => {
      setCurrentDoctor((prev) => (prev === doctors.length - 1 ? 0 : prev + 1))
    }, 6000)

    return () => {
      clearInterval(testimonialInterval)
      clearInterval(doctorInterval)
    }
  }, [testimonials.length, doctors.length])

  // Helper function to render star ratings
  const renderStarRating = (rating: number) => {
    const roundedRating = Math.round(rating * 2) / 2 // Round to nearest 0.5
    const stars = []

    // Create 5 stars
    for (let i = 1; i <= 5; i++) {
      if (i <= roundedRating) {
        // Full star
        stars.push(<Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />)
      } else if (i - 0.5 === roundedRating) {
        // Half star (represented by using a different opacity)
        stars.push(<Star key={i} className="w-5 h-5 text-yellow-400" style={{ fillOpacity: "0.5" }} />)
      } else {
        // Empty star
        stars.push(<Star key={i} className="w-5 h-5 text-gray-300" />)
      }
    }

    return stars
  }

  return (
    <div className="bg-white">
      {/* Hero Section with Red Background */}
      <div className="relative overflow-hidden bg-red-600 text-white rounded-b-3xl">
        <div className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] bg-cover bg-center opacity-10"></div>
        <div className="max-w-6xl mx-auto px-4 py-24 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">About Healio</h1>
            <p className="text-xl md:text-2xl max-w-2xl text-white opacity-90">
              Your trusted healthcare partner for personalized medical care and wellness solutions.
            </p>
          </div>
        </div>
        <div className="absolute -bottom-10 left-0 w-full overflow-hidden">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-24">
            <path
              fill="white"
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
              opacity=".25"
            ></path>
            <path
              fill="white"
              d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
              opacity=".5"
            ></path>
            <path
              fill="white"
              d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
            ></path>
          </svg>
        </div>
      </div>

      {/* Mission Statement with Video */}
      <div className="max-w-6xl mx-auto px-4 py-24">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 relative">
            {/* Video Player with Custom Controls */}
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl transform transition-transform hover:scale-105 duration-500 group">
              {/* Replaced image with video element */}
              <video ref={videoRef} className="w-full h-auto object-cover" poster="/api/placeholder/600/400" muted loop>
                <source src={assets.about} type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              {/* Custom video overlay with play/pause button */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-center justify-center group-hover:opacity-100 transition-opacity duration-300"
                onClick={toggleVideo}
              >
                <div className="bg-white/25 backdrop-blur-sm p-4 rounded-full cursor-pointer hover:bg-white/40 transition-all duration-300 transform hover:scale-110">
                  {isPlaying ? <Pause className="w-12 h-12 text-white" /> : <Play className="w-12 h-12 text-white" />}
                </div>

                {/* Video caption */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white font-medium">Experience Healio's approach to healthcare</p>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-green-100 rounded-full -z-0 animate-pulse"></div>
            <div className="absolute -top-8 -left-8 w-32 h-32 bg-red-100 rounded-full -z-0"></div>
          </div>
          <div className="lg:w-1/2">
            <h2 className="text-3xl font-bold mb-6 text-red-600 relative inline-block">
              Our Mission
              <span className="absolute -bottom-2 left-0 w-16 h-1 bg-red-600 rounded-full"></span>
            </h2>
            <p className="text-gray-700 mb-6 text-lg">
              Healio is founded by Dr. Sarah Peterson & Dr. James Patel, both Board Certified doctors with over 15 years
              of experience in healthcare. We understand the challenges individuals face when it comes to health and
              finding approachable and trustworthy medical care.
            </p>
            <p className="text-gray-700 mb-8 text-lg">
              Healio aims to provide an in-depth look at Healthcare. We use innovative ideas for practicing our
              Profession in keeping the patient informed and involved, providing personalized care through diagnostics,
              monitoring, and health education.
            </p>
            <div className="flex items-center bg-green-50 p-6 rounded-xl border-l-4 border-green-800 shadow-md transform transition-transform hover:-translate-y-1 hover:shadow-lg duration-300">
              <div className="mr-4 text-green-800">
                <Heart className="w-8 h-8" />
              </div>
              <div>
                <span className="font-bold text-green-800">Our Vision: </span>
                <span className="text-gray-700">Making healthcare accessible and efficient for everyone.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-green-800 to-green-700 py-16 rounded-3xl mx-4 my-16 shadow-xl">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="transform transition-transform hover:scale-110 duration-300">
              <div className="text-5xl font-bold mb-2 text-white">15+</div>
              <div className="text-lg text-white opacity-90">Years Experience</div>
            </div>
            <div className="transform transition-transform hover:scale-110 duration-300">
              <div className="text-5xl font-bold mb-2 text-white">10k+</div>
              <div className="text-lg text-white opacity-90">Happy Patients</div>
            </div>
            <div className="transform transition-transform hover:scale-110 duration-300">
              <div className="text-5xl font-bold mb-2 text-white">25+</div>
              <div className="text-lg text-white opacity-90">Specialists</div>
            </div>
            <div className="transform transition-transform hover:scale-110 duration-300">
              <div className="text-5xl font-bold mb-2 text-white">4.9</div>
              <div className="text-lg text-white opacity-90">Patient Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us - Enhanced Premium Version */}
      <div className="py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-red-600 inline-block relative">
              Why Choose Healio
              <span className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-red-600 rounded-full"></span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mt-6">
              We combine medical expertise with cutting-edge technology to provide you with the best healthcare
              experience possible.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Experience */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-red-200 group">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-red-100 transition-colors duration-300">
                <Award className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-red-600 group-hover:text-red-700 transition-colors duration-300">
                Experience
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">15+ Years Medical Excellence</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Specialized in Various Medical Fields</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Board Certified Professionals</span>
                </li>
              </ul>
            </div>

            {/* Commitment */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-red-200 group">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-red-100 transition-colors duration-300">
                <Heart className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-red-600 group-hover:text-red-700 transition-colors duration-300">
                Commitment
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Patient-First Approach Always</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Transparent Communication</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">24/7 Support For Emergencies</span>
                </li>
              </ul>
            </div>

            {/* Personal Touch */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-red-200 group">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-red-100 transition-colors duration-300">
                <ThumbsUp className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-red-600 group-hover:text-red-700 transition-colors duration-300">
                Personal Touch
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Customized Treatment Plans</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Long-term Patient Relationships</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Holistic Health Approach</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section - Premium Slider Style with API Data */}
      <div className="bg-gray-50 py-24 rounded-3xl mx-4">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block bg-red-600 px-12 py-4 rounded-xl mb-6 shadow-lg">
              <h2 className="text-4xl font-bold text-white">Meet Our Experts</h2>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mt-4">
              Our team of dedicated healthcare professionals is committed to providing you with exceptional care.
            </p>
          </div>

          {/* Doctor Slider - Now with API Data */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600"></div>
            </div>
          ) : (
            <div className="relative">
              <div className="overflow-hidden rounded-2xl">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentDoctor * 100}%)` }}
                >
                  {doctors.map((doctor) => (
                    <div key={doctor._id} className="w-full flex-shrink-0">
                      <div className="flex flex-col md:flex-row gap-6 p-6 bg-white rounded-2xl shadow-xl">
                        <div className="md:w-1/3 relative overflow-hidden rounded-xl h-64">
                          <img
                            src={doctor.image || "/api/placeholder/400/300"}
                            alt={doctor.name}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                            <div className="p-4 text-white w-full">
                              <p className="font-medium">{doctor.speciality?.name || "Specialist"}</p>
                            </div>
                          </div>
                        </div>
                        <div className="md:w-2/3 p-6">
                          <div className="flex justify-between items-start">
                            <h3 className="text-3xl font-bold mb-2 text-red-600">{doctor.name}</h3>
                            <div className="flex">
                              {renderStarRating(doctor.averageRating || 0)}
                              <span className="ml-2 text-gray-600 text-sm">({doctor.reviewCount || 0})</span>
                            </div>
                          </div>

                          {doctor.speciality && (
                            <p className="text-green-800 font-medium mb-4 inline-block bg-green-50 px-3 py-1 rounded-full">
                              {doctor.speciality.name}
                            </p>
                          )}

                          <p className="text-gray-700 mb-6 text-lg">
                            {doctor.about || "Experienced healthcare professional committed to excellent patient care."}
                          </p>

                          <div className="flex flex-wrap items-center justify-between gap-4">
                            {doctor.experience && (
                              <div className="flex items-center text-gray-500 text-sm bg-gray-50 px-4 py-2 rounded-full">
                                <Clock className="w-4 h-4 mr-2" />
                                <span>Experience: {doctor.experience}</span>
                              </div>
                            )}

                            {doctor.hospital && (
                              <div className="flex items-center text-gray-500 text-sm bg-gray-50 px-4 py-2 rounded-full">
                                <MapPin className="w-4 h-4 mr-2" />
                                <span>{doctor.hospital}</span>
                              </div>
                            )}

                            {doctor.fees && (
                              <div className="flex items-center text-gray-500 text-sm bg-gray-50 px-4 py-2 rounded-full">
                                <span>Fees: ${doctor.fees}</span>
                              </div>
                            )}

                            <button className="px-6 py-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 font-medium transition-colors duration-300">
                              Book Appointment
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Arrow Navigation */}
              <button
                onClick={() => setCurrentDoctor((prev) => (prev === 0 ? doctors.length - 1 : prev - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg z-10 transition-transform hover:scale-110"
              >
                <ChevronLeft className="w-6 h-6 text-red-600" />
              </button>
              <button
                onClick={() => setCurrentDoctor((prev) => (prev === doctors.length - 1 ? 0 : prev + 1))}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg z-10 transition-transform hover:scale-110"
              >
                <ChevronRight className="w-6 h-6 text-red-600" />
              </button>

              {/* Dots Navigation */}
              <div className="flex justify-center mt-8 gap-2">
                {doctors.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentDoctor(index)}
                    className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                      currentDoctor === index ? "bg-red-600" : "bg-gray-300"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="mt-12 text-center">
            <button className="px-10 py-3 bg-white border-2 border-red-600 text-red-600 hover:bg-red-50 rounded-full font-medium transition-all duration-300 shadow-md hover:shadow-lg">
              View All Doctors
            </button>
          </div>
        </div>
      </div>

      {/* Testimonials - Premium Carousel Style */}
      <div className="py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block bg-red-600 px-12 py-4 rounded-xl mb-6 shadow-lg">
              <h2 className="text-4xl font-bold text-white">What Our Patients Say</h2>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mt-4">
              Don't just take our word for it - hear from our satisfied patients.
            </p>
          </div>

          {/* Testimonial Slider */}
          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden rounded-2xl">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${currentTestimonial * 100}%)`,
                }}
              >
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="w-full flex-shrink-0">
                    <div className="bg-white p-10 rounded-2xl shadow-xl border border-gray-100 transition-transform duration-300 hover:-translate-y-1">
                      <div className="w-16 h-16 mx-auto mb-6 bg-red-50 rounded-full flex items-center justify-center">
                        <span className="text-4xl font-serif text-red-600">"</span>
                      </div>
                      <div className="flex mb-6 justify-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-6 h-6 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <p className="text-gray-700 mb-8 text-lg text-center italic">"{testimonial.text}"</p>
                      <div className="flex items-center justify-center">
                        <div className="w-14 h-14 bg-gray-200 rounded-full overflow-hidden mr-4 border-2 border-white shadow-md">
                          <img src="/api/placeholder/100/100" alt="Patient" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-red-600">{testimonial.name}</p>
                          <p className="text-gray-500 text-sm">{testimonial.since}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Arrow Navigation */}
            <button
              onClick={() => setCurrentTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg z-10 transition-transform hover:scale-110"
            >
              <ChevronLeft className="w-6 h-6 text-red-600" />
            </button>
            <button
              onClick={() => setCurrentTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg z-10 transition-transform hover:scale-110"
            >
              <ChevronRight className="w-6 h-6 text-red-600" />
            </button>

            {/* Dots Navigation */}
            <div className="flex justify-center mt-8 gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                    currentTestimonial === index ? "bg-red-600" : "bg-gray-300"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action - Premium */}
      <div className="bg-gradient-to-r from-red-700 to-red-500 py-16 rounded-3xl mx-4 my-8 shadow-2xl overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] bg-cover bg-center opacity-10"></div>
        <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-bold mb-6 text-white">Ready to Experience Better Healthcare?</h2>
          <p className="text-xl text-white opacity-90 mb-8 max-w-2xl mx-auto">
            Book your appointment today and take the first step towards personalized, convenient healthcare.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button className="bg-white hover:bg-gray-100 text-red-600 px-10 py-4 rounded-full font-medium transition-all duration-300 hover:shadow-xl shadow-lg text-lg transform hover:-translate-y-1">
              Book an Appointment
            </button>
            <button className="bg-green-800 hover:bg-green-900 text-white px-10 py-4 rounded-full font-medium transition-all duration-300 hover:shadow-xl shadow-lg text-lg transform hover:-translate-y-1">
              Contact Our Team
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About

