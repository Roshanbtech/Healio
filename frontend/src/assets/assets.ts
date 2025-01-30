// Importing Images
import appointment_img from './appointment_img.png';
import header_img from './header_image.png';
import group_profiles from './group_profiles.png';
import profile_pic from './profile_pic.png';
import contact_image from './contact_image.png';
import about_image from './about_image.png';
import logo from './logo.png';
import dropdown_icon from './dropdown_icon.svg';
import menu_icon from './menu_icon.svg';
import cross_icon from './cross_icon.png';
import chats_icon from './chats_icon.svg';
import verified_icon from './verified_icon.svg';
import arrow_icon from './arrow_icon.svg';
import info_icon from './info_icon.svg';
import upload_icon from './upload_icon.png';
import stripe_logo from './stripe_logo.png';
import razorpay_logo from './razorpay_logo.png';
import bg1 from './bgsignup.jpg';


// Importing Doctor Images
import doc1 from './doc1.png';
import doc2 from './doc2.png';
import doc3 from './doc3.png';
import doc4 from './doc4.png';
import doc5 from './doc5.png';
import doc6 from './doc6.png';
import doc7 from './doc7.png';
import doc8 from './doc8.png';
// import doc9 from './doc9.png';
// import doc10 from './doc10.png';
// import doc11 from './doc11.png';
// import doc12 from './doc12.png';
// import doc13 from './doc13.png';
// import doc14 from './doc14.png';
// import doc15 from './doc15.png';

// Importing Speciality Icons
import Dermatologist from './Dermatologist.svg';
import Gastroenterologist from './Gastroenterologist.svg';
import General_physician from './General_physician.svg';
import Gynecologist from './Gynecologist.svg';
import Neurologist from './Neurologist.svg';
import Pediatricians from './Pediatricians.svg';

// ✅ Assets Object
export const assets = {
  appointment_img,
  header_img,
  group_profiles,
  logo,
  chats_icon,
  verified_icon,
  info_icon,
  profile_pic,
  arrow_icon,
  contact_image,
  about_image,
  menu_icon,
  cross_icon,
  dropdown_icon,
  upload_icon,
  stripe_logo,
  razorpay_logo,
  bg1
};

// ✅ Define Speciality Type
export interface Speciality {
  speciality: string;
  image: string;
}

// ✅ Define Doctor Type
export interface Doctor {
  _id: string;
  name: string;
  image: string;
  speciality: string;
  degree: string;
  experience: string;
  about: string;
  fees: number;
  address: {
    line1: string;
    line2: string;
  };
}

// ✅ Specialities Array with Types
export const specialityData: Speciality[] = [
  { speciality: 'General physician', image: General_physician },
  { speciality: 'Gynecologist', image: Gynecologist },
  { speciality: 'Dermatologist', image: Dermatologist },
  { speciality: 'Pediatricians', image: Pediatricians },
  { speciality: 'Neurologist', image: Neurologist },
  { speciality: 'Gastroenterologist', image: Gastroenterologist }
];

// ✅ Doctors Array with Types
export const doctors: Doctor[] = [
  {
    _id: 'doc1',
    name: 'Dr. Roshan Reji',
    image: doc1,
    speciality: 'General physician',
    degree: 'MBBS',
    experience: '4 Years',
    about: 'Committed to delivering comprehensive medical care with a focus on preventive medicine and effective treatment strategies.',
    fees: 1000,
    address: { line1: '17th Cross, Richmond', line2: 'Circle, Ring Road, London' }
  },
  {
    _id: 'doc2',
    name: 'Dr. Tinsu P Thanakachan',
    image: doc2,
    speciality: 'Gynecologist',
    degree: 'MBBS',
    experience: '3 Years',
    about: 'Passionate about women’s health, providing excellent care in obstetrics and gynecology.',
    fees: 1200,
    address: { line1: '27th Cross, Richmond', line2: 'Circle, Ring Road, London' }
  },
  {
    _id: 'doc3',
    name: 'Dr. Rosina Reji',
    image: doc3,
    speciality: 'Dermatologist',
    degree: 'MBBS',
    experience: '1 Year',
    about: 'Dedicated to skin health and cosmetic dermatology, ensuring optimal skincare solutions for all patients.',
    fees: 1250,
    address: { line1: '37th Cross, Richmond', line2: 'Circle, Ring Road, London' }
  },
  {
    _id: 'doc4',
    name: 'Dr. Robbin Reji',
    image: doc4,
    speciality: 'Pediatricians',
    degree: 'MBBS',
    experience: '2 Years',
    about: 'Focused on children’s health, providing compassionate care for infants, children, and adolescents.',
    fees: 800,
    address: { line1: '47th Cross, Richmond', line2: 'Circle, Ring Road, London' }
  },
  {
    _id: 'doc5',
    name: 'Dr. Jennifer Winget',
    image: doc5,
    speciality: 'Neurologist',
    degree: 'MBBS',
    experience: '4 Years',
    about: 'Expert in diagnosing and treating neurological disorders with cutting-edge medical solutions.',
    fees: 560,
    address: { line1: '57th Cross, Richmond', line2: 'Circle, Ring Road, London' }
  },
  {
    _id: 'doc6',
    name: 'Dr. Andrew Williams',
    image: doc6,
    speciality: 'Neurologist',
    degree: 'MBBS',
    experience: '4 Years',
    about: 'Specialist in treating brain and nervous system disorders with a personalized approach.',
    fees: 700,
    address: { line1: '57th Cross, Richmond', line2: 'Circle, Ring Road, London' }
  },
  {
    _id: 'doc7',
    name: 'Dr. Christopher Davis',
    image: doc7,
    speciality: 'General physician',
    degree: 'MBBS',
    experience: '4 Years',
    about: 'Committed to preventive healthcare and holistic medical treatment for individuals and families.',
    fees: 680,
    address: { line1: '17th Cross, Richmond', line2: 'Circle, Ring Road, London' }
  },
  {
    _id: 'doc8',
    name: 'Dr. Timothy White',
    image: doc8,
    speciality: 'Gynecologist',
    degree: 'MBBS',
    experience: '3 Years',
    about: 'Provides expert care for women’s reproductive health and pregnancy management.',
    fees: 670,
    address: { line1: '27th Cross, Richmond', line2: 'Circle, Ring Road, London' }
  }
];
