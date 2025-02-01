import { assets } from '../../../assets/assets'

const Footer = () => {
    return (
        <div className='md:mx-10'>
            <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>
                {/* ------- Left Section --------- */}
                <div>
                    <img className='mb-5 w-40' src={assets.logo} alt="" />
                    <p className='w-full md:w-2/3 text-gray-600 leading-6'>
                    Healio is your one-stop destination for hassle-free doctor appointments. With a user-friendly platform, we connect you to trusted medical experts, ensuring personalized care at your convenience. Experience healthcare simplified—your well-being is just a click away!...</p>
                </div>
                {/* ------- Middle Section --------- */}
                <div>
                    <p className='text-xl font-medium mb-5 text-green-900'>COMPANY</p>
                    <ul className='flex flex-col gap-2 text-gray-600'>
                        <li className='hover:text-red-500'>Home</li>
                        <li className='hover:text-red-500'>About Us</li>
                        <li className='hover:text-red-500'>Contact Us</li>
                        <li className='hover:text-red-500'>Privacy & Policy</li>
                    </ul>
                </div>
                {/* ------- Right Section --------- */}
                <div>
                    <p className='text-xl font-medium mb-5 text-green-900' >GET IN TOUCH</p>
                    <ul className='flex flex-col gap-2 text-gray-600'>
                        <li className='hover:text-red-500'>Address: 689121 Alappuzha, Kerala, India</li>
                        <li className='hover:text-red-500'>Phone: +91-9999999999</li>
                        <li className='hover:text-red-500'>Email: healio218@gmail.com</li>
                    </ul>
                </div>
            </div>
            <div>
                <hr />
                <p className='py-5 text-sm text-center'>© 2024 All Rights Reserved by <span className='font-semibold text-green-900'>Healio</span> | Developed by <span className='font-semibold text-green-900'>Roshan Reji</span></p>
                </div>
        </div>
    )
}

export default Footer