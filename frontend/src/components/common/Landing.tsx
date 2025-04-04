import { assets } from "../../assets/assets";
import { ChevronRightIcon } from "lucide-react";
import { Link } from "react-router-dom";
interface Specialty {
  name: string;
  icon: string;
  description: string;
  color: keyof typeof colorClasses;
}

const colorClasses = {
  red: {
    bg: "bg-red-50 hover:bg-red-100",
    icon: "bg-red-100 text-red-600 border-red-200",
    hover: "hover:shadow-red-100/50",
  },
  blue: {
    bg: "bg-blue-50 hover:bg-blue-100",
    icon: "bg-blue-100 text-blue-600 border-blue-200",
    hover: "hover:shadow-blue-100/50",
  },
  amber: {
    bg: "bg-amber-50 hover:bg-amber-100",
    icon: "bg-amber-100 text-amber-600 border-amber-200",
    hover: "hover:shadow-amber-100/50",
  },
  emerald: {
    bg: "bg-emerald-50 hover:bg-emerald-100",
    icon: "bg-emerald-100 text-emerald-600 border-emerald-200",
    hover: "hover:shadow-emerald-100/50",
  },
  violet: {
    bg: "bg-violet-50 hover:bg-violet-100",
    icon: "bg-violet-100 text-violet-600 border-violet-200",
    hover: "hover:shadow-violet-100/50",
  },
  cyan: {
    bg: "bg-cyan-50 hover:bg-cyan-100",
    icon: "bg-cyan-100 text-cyan-600 border-cyan-200",
    hover: "hover:shadow-cyan-100/50",
  },
  rose: {
    bg: "bg-rose-50 hover:bg-rose-100",
    icon: "bg-rose-100 text-rose-600 border-rose-200",
    hover: "hover:shadow-rose-100/50",
  },
  purple: {
    bg: "bg-purple-50 hover:bg-purple-100",
    icon: "bg-purple-100 text-purple-600 border-purple-200",
    hover: "hover:shadow-purple-100/50",
  },
};

const specialties: Specialty[] = [
  {
    name: "Cardiology",
    icon: "heart-pulse",
    description: "Expert care for heart conditions",
    color: "red",
  },
  {
    name: "Neurology",
    icon: "brain",
    description: "Specialized brain and nervous system care",
    color: "blue",
  },
  {
    name: "Orthopedics",
    icon: "bone",
    description: "Treatment for bones, joints and muscles",
    color: "amber",
  },
  {
    name: "Ophthalmology",
    icon: "eye",
    description: "Comprehensive eye care services",
    color: "emerald",
  },
  {
    name: "Pediatrics",
    icon: "baby",
    description: "Medical care for infants and children",
    color: "violet",
  },
  {
    name: "Dentistry",
    icon: "tooth",
    description: "Complete dental health services",
    color: "cyan",
  },
  {
    name: "Dermatology",
    icon: "user",
    description: "Skin, hair and nail treatments",
    color: "rose",
  },
  {
    name: "Gynecology",
    icon: "stethoscope",
    description: "Women's health and wellness",
    color: "purple",
  },
];

// Return an SVG icon based on the icon name
const IconComponent = ({ name }: { name: string }) => {
  switch (name) {
    case "heart-pulse":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-8 h-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          <path d="M3.22 12H9.5l.5-1 2 4 .5-2 2 2h5.27" />
        </svg>
      );
    case "brain":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-8 h-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44A2.5 2.5 0 0 1 5 18.86a3 3 0 0 1-.34-5.58A2.5 2.5 0 0 1 5 10a2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
          <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44A2.5 2.5 0 0 0 19 18.86a3 3 0 0 0 .34-5.58A2.5 2.5 0 0 0 19 10a2.5 2.5 0 0 0-1.98-3Z" />
        </svg>
      );
    case "bone":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-8 h-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h1a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2V4a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 0 2 2v3a2 2 0 0 0-2 2v1a2 2 0 0 1-2 2Z" />
        </svg>
      );
    case "eye":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-8 h-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "baby":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-8 h-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 12h.01" />
          <path d="M15 12h.01" />
          <path d="M10 16c.5.3 1.5.3 2 0" />
          <path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6 9 9 0 0 1 1.8-3.9" />
        </svg>
      );
    case "tooth":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-8 h-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5.5c-1.074-.586-2.583-.576-3.619.144-1.261.906-1.356 2.858-1.379 4.367-.022 1.03 0 2.493.63 3.297.705.91 2.112 1.874 2.112 3.188M12 5.5c1.074-.586 2.583-.576 3.619.144 1.261.906 1.356 2.858 1.379 4.367.022 1.03 0 2.493-.63 3.297-.705.91-2.112 1.874-2.112 3.188" />
          <path d="M12 5.5V19" />
          <path d="M12 5.5c3.706-2.468 4.523-4.812 4.523-4.812.302-.615-.06-1.075-.581-.707 0 0-1.875 1.644-3.942 1.644-2.068 0-3.943-1.644-3.943-1.644-.52-.368-.883.092-.58.707 0 0 .816 2.344 4.523 4.812Z" />
        </svg>
      );
    case "user":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-8 h-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="10" r="3" />
          <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
        </svg>
      );
    case "stethoscope":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-8 h-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4.8 2.3a.3.3 0 0 1 .2-.3h.8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v5a6 6 0 0 1-6 6v0a6 6 0 0 1-6-6V2.3z" />
          <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
          <circle cx="20" cy="10" r="2" />
        </svg>
      );
    default:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-8 h-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
          <circle cx="12" cy="10" r="2" />
          <path d="M12 16v-2" />
        </svg>
      );
  }
};

const Navbar = () => (
  <div className="relative z-50 bg-white shadow-md">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-20">
        <div className="flex-shrink-0 flex items-center">
          <div className="flex items-center">
            <img src={assets.logo} alt="HEALIO Logo" className="h-20 w-auto" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
          >
            Log In
          </Link>
          <Link
            to="/signUp"
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full text-sm font-medium transition duration-300 ease-in-out transform hover:scale-105 btn-pulse"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  </div>
);

const HeroSection = () => (
  <div
    className="relative overflow-hidden rounded-3xl mx-4 my-8 shadow-2xl"
    style={{ backgroundColor: "#fafafa" }}
  >
    {/* Background Video with Overlay Gradient */}
    <div className="absolute inset-0 overflow-hidden rounded-3xl">
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src={assets.about}
        autoPlay
        muted
        loop
      />
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 via-purple-900/20 to-red-900/30 mix-blend-overlay"></div>
    </div>

    {/* Content Container */}
    <div className="max-w-7xl mx-auto relative z-10 px-6 py-24 lg:py-32">
      <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
        {/* Text Content */}
        <main className="flex-1 text-center lg:text-left">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Your Health Is Our</span>
            <span className="block text-red-600 drop-shadow-sm">
              Top Priority
            </span>
          </h1>
          <p className="mt-6 text-lg text-gray-700 sm:text-xl max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            Book appointments with the best doctors, get digital prescriptions,
            access medical records, and experience healthcare like never before.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row justify-center lg:justify-start gap-5">
            <a
              href="#"
              className="rounded-full shadow-lg px-8 py-4 bg-red-600 text-white font-bold hover:bg-red-700 transition duration-300 transform hover:-translate-y-1 hover:shadow-xl text-center"
            >
              Book Appointment Now
            </a>
            <a
              href="#"
              className="rounded-full shadow-md px-8 py-4 border-2 border-red-600 text-red-600 font-bold hover:bg-red-50 transition duration-300 transform hover:-translate-y-1 hover:shadow-lg text-center"
            >
              Find a Doctor
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap justify-center lg:justify-start gap-6">
            <div className="flex items-center">
              <div className="bg-white p-2 rounded-full shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">
                Certified Doctors
              </span>
            </div>
            <div className="flex items-center">
              <div className="bg-white p-2 rounded-full shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">
                24/7 Support
              </span>
            </div>
          </div>
        </main>

        {/* Doctor Image with Glass Effect */}
        <div className="flex-1 mt-10 lg:mt-0 lg:ml-8 relative">
          <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl transform hover:scale-102 transition duration-500 group">
            {/* Glass effect background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm rounded-2xl group-hover:backdrop-blur-md transition-all duration-500"></div>

            {/* Doctor image */}
            <img
              src={assets.doc11}
              alt="Healthcare Professional"
              className="relative w-full h-auto object-cover rounded-2xl z-10"
              style={{ maxHeight: "600px" }}
            />

            {/* Decorative elements */}
            <div className="absolute top-4 right-4 w-20 h-20 bg-red-500/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 bg-blue-500/10 rounded-full blur-lg"></div>

            {/* Pulse animation */}
            <div className="absolute inset-0 rounded-2xl border-2 border-white/30 z-20"></div>
          </div>
        </div>
      </div>
    </div>

    {/* Premium Wave */}
    <div
      className="absolute bottom-0 left-0 right-0 z-10 overflow-hidden"
      style={{ height: "120px" }}
    >
      <svg
        className="absolute bottom-0 w-full"
        viewBox="0 0 1920 120"
        preserveAspectRatio="none"
      >
        <path
          d="M0,96L48,90.7C96,85,192,75,288,80C384,85,480,107,576,101.3C672,96,768,64,864,64C960,64,1056,96,1152,96C1248,96,1344,64,1440,58.7C1536,53,1632,75,1728,80C1824,85,1920,75,1968,69.3L2016,64L2016,120L1968,120C1920,120,1824,120,1728,120C1632,120,1536,120,1440,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
          fill="#ffffff"
          fillOpacity="0.8"
        ></path>
      </svg>
    </div>
  </div>
);
const FeaturesSection = () => (
  <section className="py-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Why Choose Healio
        </h2>
        <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
          We're revolutionizing healthcare with technology and compassion
        </p>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        {/* Feature Card 1 */}
        <div className="relative bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-red-600">
          <div className="absolute -top-5 left-5 w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white">
            <i className="fas fa-user-md"></i>
          </div>
          <h3 className="mt-3 text-lg font-medium text-gray-900 pt-2">
            Expert Doctors
          </h3>
          <p className="mt-2 text-base text-gray-500">
            Connect with board-certified specialists with years of experience.
          </p>
        </div>
        {/* Feature Card 2 */}
        <div className="relative bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-green-700">
          <div className="absolute -top-5 left-5 w-10 h-10 rounded-full bg-green-700 flex items-center justify-center text-white">
            <i className="fas fa-calendar-check"></i>
          </div>
          <h3 className="mt-3 text-lg font-medium text-gray-900 pt-2">
            Easy Booking
          </h3>
          <p className="mt-2 text-base text-gray-500">
            Book appointments in just a few clicks, anytime and anywhere.
          </p>
        </div>
        {/* Feature Card 3 */}
        <div className="relative bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-red-600">
          <div className="absolute -top-5 left-5 w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white">
            <i className="fas fa-file-medical"></i>
          </div>
          <h3 className="mt-3 text-lg font-medium text-gray-900 pt-2">
            Digital Records
          </h3>
          <p className="mt-2 text-base text-gray-500">
            Access your medical history and prescriptions digitally.
          </p>
        </div>
        {/* Feature Card 4 */}
        <div className="relative bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-green-700">
          <div className="absolute -top-5 left-5 w-10 h-10 rounded-full bg-green-700 flex items-center justify-center text-white">
            <i className="fas fa-headset"></i>
          </div>
          <h3 className="mt-3 text-lg font-medium text-gray-900 pt-2">
            24/7 Support
          </h3>
          <p className="mt-2 text-base text-gray-500">
            Get assistance whenever you need with our round-the-clock support.
          </p>
        </div>
      </div>
    </div>
  </section>
);

const HowItWorksSection = () => (
  <section className="py-16 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          How Healio Works
        </h2>
        <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
          Simple steps to get the care you need
        </p>
      </div>
      <div className="relative">
        <div className="hidden md:block absolute top-1/2 left-0 right-0 transform -translate-y-1/2 h-0.5 bg-red-200"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Step 1 */}
          <div className="relative flex flex-col items-center">
            <div className="bg-red-600 rounded-full w-16 h-16 flex items-center justify-center text-white text-xl font-bold z-10 shadow-lg mb-6">
              1
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
              Create Account
            </h3>
            <p className="text-center text-gray-600">
              Sign up in minutes with your basic information
            </p>
          </div>
          {/* Step 2 */}
          <div className="relative flex flex-col items-center">
            <div className="bg-red-600 rounded-full w-16 h-16 flex items-center justify-center text-white text-xl font-bold z-10 shadow-lg mb-6">
              2
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
              Find Doctor
            </h3>
            <p className="text-center text-gray-600">
              Browse specialists by expertise, ratings, or availability
            </p>
          </div>
          {/* Step 3 */}
          <div className="relative flex flex-col items-center">
            <div className="bg-red-600 rounded-full w-16 h-16 flex items-center justify-center text-white text-xl font-bold z-10 shadow-lg mb-6">
              3
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
              Book Appointment
            </h3>
            <p className="text-center text-gray-600">
              Select your preferred time slot and confirm booking
            </p>
          </div>
          {/* Step 4 */}
          <div className="relative flex flex-col items-center">
            <div className="bg-red-600 rounded-full w-16 h-16 flex items-center justify-center text-white text-xl font-bold z-10 shadow-lg mb-6">
              4
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
              Get Care
            </h3>
            <p className="text-center text-gray-600">
              Visit the doctor and access your prescriptions digitally
            </p>
          </div>
        </div>
      </div>
      <div className="mt-16 text-center">
        <a
          href="#"
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full inline-block transition duration-300 transform hover:scale-105 shadow-md"
        >
          Get Started Today
        </a>
      </div>
    </div>
  </section>
);

// Testimonials Section
const TestimonialsSection = () => (
  <section className="py-16 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          What Our Patients Say
        </h2>
        <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
          Hear from people who've experienced the Healio difference
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Testimonial 1 */}
        <div className="bg-gray-50 p-6 rounded-xl shadow-md relative">
          <div className="absolute -top-5 right-5">
            <i className="fas fa-quote-right text-4xl text-red-200"></i>
          </div>
          <p className="text-gray-600 mb-4">
            "Healio has completely transformed how I manage my healthcare. The
            app is intuitive, and booking appointments is a breeze."
          </p>
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-gray-300 mr-4"></div>
            <div>
              <h4 className="font-medium text-gray-900">Sarah Johnson</h4>
              <p className="text-sm text-gray-500">Patient since 2024</p>
            </div>
          </div>
        </div>
        {/* Testimonial 2 */}
        <div className="bg-gray-50 p-6 rounded-xl shadow-md relative">
          <div className="absolute -top-5 right-5">
            <i className="fas fa-quote-right text-4xl text-red-200"></i>
          </div>
          <p className="text-gray-600 mb-4">
            "As someone with chronic health issues, having all my records in one
            place has been life-changing. The doctors are top-notch too!"
          </p>
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-gray-300 mr-4"></div>
            <div>
              <h4 className="font-medium text-gray-900">Michael Chen</h4>
              <p className="text-sm text-gray-500">Patient since 2023</p>
            </div>
          </div>
        </div>
        {/* Testimonial 3 */}
        <div className="bg-gray-50 p-6 rounded-xl shadow-md relative">
          <div className="absolute -top-5 right-5">
            <i className="fas fa-quote-right text-4xl text-red-200"></i>
          </div>
          <p className="text-gray-600 mb-4">
            "The 24/7 support team helped me during a late-night health scare.
            They arranged an emergency consultation within minutes."
          </p>
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-gray-300 mr-4"></div>
            <div>
              <h4 className="font-medium text-gray-900">Lisa Rodriguez</h4>
              <p className="text-sm text-gray-500">Patient since 2024</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const SpecialtiesSection = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Our Medical Specialties
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Comprehensive care across all major medical fields with expert
            specialists
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {specialties.map((specialty, index) => (
            <div
              key={index}
              className={`rounded-xl p-6 transition-all duration-300 transform hover:-translate-y-1 ${
                colorClasses[specialty.color].bg
              } hover:shadow-xl ${colorClasses[specialty.color].hover}`}
            >
              <div className="flex items-start space-x-4">
                <div
                  className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center border-2 ${
                    colorClasses[specialty.color].icon
                  }`}
                >
                  <IconComponent name={specialty.icon} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {specialty.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {specialty.description}
                  </p>
                  <a
                    href="#"
                    className="inline-flex items-center text-sm font-medium text-red-600 hover:text-red-800"
                  >
                    Learn more
                    <ChevronRightIcon className="w-4 h-4 ml-1" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-16 text-center">
          <a
            href="#"
            className="inline-flex items-center px-8 py-3 rounded-full bg-white border border-red-600 text-red-600 font-medium hover:bg-red-50 transition duration-300 shadow-md hover:shadow-lg"
          >
            View All Specialties
            <ChevronRightIcon className="w-5 h-5 ml-2" />
          </a>
        </div>
      </div>
    </section>
  );
};

const LandingPage = () => {
  return (
    <div className="antialiased bg-gray-50">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <SpecialtiesSection />
    </div>
  );
};

export default LandingPage;
