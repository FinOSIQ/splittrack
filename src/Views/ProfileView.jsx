import React from 'react';
import HeaderProfile from '../Components/HeaderProfile';
import { useFormik } from 'formik';
import { profileSchema } from '../utils/validationSchemas';

export default function ProfileView() {

        const { values, errors, touched, handleBlur, handleChange, handleSubmit, isSubmitting } = useFormik({
            initialValues: {
                fullName: '',
                email: '',
                phoneNumber: '',
            },
            validationSchema: profileSchema,
            onSubmit: (values) => {
                console.log(values);
                
            }

        })
    
    return (
        <>
            <HeaderProfile />
            <div className="h-screen bg-white rounded-md mx-5 px-0">
                <div className="text-[#424141] text-xl font-medium font-['Poppins'] leading-[24.94px] my-2">Personal Details</div>
                <section className="bg-white">
                    <div className="w-full py-8 max-w-screen lg:py-10">
                    
                    {/* Form inititation */}
                        <form onSubmit={handleSubmit} >

                            <div className="w-full grid gap-2 sm:grid-cols-2 sm:gap-4"> {/* Reduced gap here */}
                                <div className="w-11/12"> {/* Adjusted width for consistent layout */}
                                    <label htmlFor="full-name" className="block mb-2 text-sm font-normal font-['poppins'] opacity-85 text-gray-900">Full Name</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        id="fullName"
                                        value={values.fullName}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className="border border-gray-300 w-full bg-[#f9f9f9] text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block p-2.5"
                                        placeholder="Enter full name"
                                        required />
                                </div>
                                <div className="w-11/12">
                                    <label htmlFor="email" className="block mb-2 text-sm font-normal font-['poppins'] opacity-85 text-gray-900">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        value={values.email}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                        placeholder="Enter email address"
                                        required />
                                </div>
                                <div className="w-11/12">
                                    <label htmlFor="gender" className="block mb-2 text-sm font-normal font-['poppins'] opacity-85 text-gray-900">Gender</label>
                                    <select
                                        id="gender"
                                        name="gender"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 opacity-50"
                                        required
                                    >
                                        <option value="" disabled selected>
                                            Select gender
                                        </option>
                                        <option value="male" className="opacity-100">
                                            Male
                                        </option>
                                        <option value="female" className="opacity-100">
                                            Female
                                        </option>
                                        <option value="other" className="opacity-100">
                                            Other
                                        </option>
                                    </select>

                                </div>
                                <div className="w-11/12">
                                    <label htmlFor="phone-number" className="block mb-2 text-sm font-normal font-['poppins'] opacity-85 text-gray-900">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        id="phoneNumber"
                                        value={values.phoneNumber}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                        placeholder="Enter phone number"
                                        required />
                                </div>
                                <div className="w-11/12">
                                    <label htmlFor="currency" className="block mb-2 text-sm font-normal font-['poppins'] opacity-85 text-gray-900">Currency</label>
                                    <input
                                        type="text"
                                        name="currency"
                                        id="currency"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                        placeholder="Enter currency"
                                        required />
                                </div>
                            </div>
                            <button type="submit" className="inline-flex items-center px-5 py-2.5 mt-4 sm:mt-6 text-sm font-medium text-center text-white bg-primary-700 rounded-lg focus:ring-4 focus:ring-primary-200 hover:bg-primary-800">
                                Submit
                            </button>
            
                        </form>

                        <div className="text-[#424141] text-xl font-medium font-['Poppins'] leading-[24.94px] mb-4">My Bank Details</div>
                        <div className="flex flex-row gap-4 mt-6 ml-2">
                            <div className="w-12 h-12 bg-[#4182f9] bg-opacity-10 rounded-full flex items-center justify-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="#4182f9"
                                    className="w-6 h-6 opacity-100"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
                                    />
                                </svg>
                            </div>

                            <div className="flex flex-col justify-center">
                                <div className="text-black  font-normal text-sm font-['Poppins']">4126-xxxx-xxxxx</div>
                                <div className="opacity-50 text-black text-sm font-normal font-['Poppins']">
                                    1 month ago
                                </div>
                            </div>
                        </div>

                        <button className="relative w-[200px] mt-4 ml-2 h-11 bg-[#4182f9] bg-opacity-10 rounded-lg">
                            <div className="absolute top-3 left-9  px-1 text-[#4182f9] text-sm font-normal font-['Poppins']">
                                Edit Bank Details
                            </div>
                        </button>




                    </div>
                </section>
            </div>

        </>
    );
}
