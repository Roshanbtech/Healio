import { Mail, Phone, MapPin } from "lucide-react";
import { assets } from "../../../assets/assets";

const ContactPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6 py-12">
      <div className="container mx-auto max-w-6xl grid md:grid-cols-2 gap-12 items-center">
        {/* Left Section - Image */}
        <div className="w-full">
          <img
            src={assets.contact_image}
            alt="Doctor consulting patient"
            className="w-full h-auto rounded-2xl shadow-lg object-cover"
          />
        </div>

        {/* Right Section - Contact Info */}
        <div className="bg-white p-10 rounded-2xl shadow-xl border border-gray-200">
          <h2 className="text-4xl font-bold text-green-700 mb-6">Get in Touch</h2>
          <p className="text-gray-600 text-lg mb-6">
            Have questions? Need assistance? Reach out to us anytime.
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition">
              <MapPin className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Our Location</h3>
                <p className="text-gray-600">Veenery PO, Chenganur, Alappuzha, Kerala, India</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition">
              <Phone className="w-8 h-8 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Call Us</h3>
                <p className="text-gray-600">(720)-265-789</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition">
              <Mail className="w-8 h-8 text-red-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Email Us</h3>
                <p className="text-gray-600">healio125@gmail.com</p>
              </div>
            </div>
          </div>

          <button className="mt-8 w-full bg-red-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition">
            Send a Message
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
