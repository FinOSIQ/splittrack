import React, { useState, useEffect } from 'react';
import HeaderProfile from '../Components/HeaderProfile';
import NavBar from '../Components/NavBar';
import { useFormik } from 'formik';
import { profileSchema } from '../utils/validationSchemas';
import { Avatar, Button } from '@material-tailwind/react';
import { fetchUserData, updateUserData } from '../utils/requests/User'; // Import both functions
import { toast } from 'sonner';

export default function ProfileView() {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch user data on component mount
    useEffect(() => {
        const getUserData = async () => {
            setLoading(true);
            try {
                const response = await fetchUserData();
                
                if (response.status === 200 && response.data.status === 'success') {
                    setUserData(response.data.data);
                } else {
                    console.error('Failed to fetch user data:', response.data?.message);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        };

        getUserData();
    }, []);

    const { values, errors, touched, handleBlur, handleChange, handleSubmit, setValues, resetForm } = useFormik({
        initialValues: {
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            currency: '',
            birthDate: '',
        },
        validationSchema: profileSchema,
        onSubmit: async (values) => {
            setIsSubmitting(true);
            try {
                // Prepare the payload for the API
                const updatePayload = {
                    first_name: values.firstName,
                    last_name: values.lastName,
                    email: values.email,
                    phone_number: values.phoneNumber,
                    currency_pref: values.currency,
                    birthdate: values.birthDate
                };

                // console.log('Submitting values:', updatePayload);
                
                const response = await updateUserData(updatePayload);
                
                if (response.status === 200 && response.data.status === 'success') {
                    
                    toast.success('Profile updated successfully!')
                    
                    // Optionally refresh user data to get latest from server
                    const updatedUserResponse = await fetchUserData();
                    if (updatedUserResponse.status === 200 && updatedUserResponse.data.status === 'success') {
                        setUserData(updatedUserResponse.data.data);
                    }
                } else {
                    toast.error('Failed to update profile: ' + response.data?.message);
                    // Handle error - maybe show a notification
                }
                setIsEditing(false);
                
            } catch (error) {
                console.error('Error updating profile:', error);
                // Handle error - maybe show a notification
            } finally {
                setIsSubmitting(false);
            }
        }
    });

    // Update form values when userData is loaded
    useEffect(() => {
        if (userData) {
            setValues({
                firstName: userData.first_name,
                lastName: userData.last_name,
                email: userData.email,
                phoneNumber: userData.phone_number,
                currency: userData.currency_pref,
                birthDate: userData.birthdate ? userData.birthdate.split('T')[0] : '', // Format date for input
            });
        }
    }, [userData, setValues]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        resetForm();
        // Reset to original values
        if (userData) {
            setValues({
                firstName: userData.first_name,
                lastName: userData.last_name,
                email: userData.email,
                phoneNumber: userData.phone_number,
                currency: userData.currency_pref,
                birthDate: userData.birthdate ? userData.birthdate.split('T')[0] : '',
            });
        }
    };

    if (loading) {
        return (
            <>
                <HeaderProfile />
                <NavBar />
                <div className="h-screen bg-white rounded-md mx-5 px-0 mt-5 w-8/12 ml-28 flex items-center justify-center">
                    <div className="text-gray-500">Loading profile...</div>
                </div>
            </>
        );
    }

    return (
        <>
            <HeaderProfile />
            <NavBar />
            
            <div className="h-screen bg-white rounded-md mx-5 px-0 mt-5 w-8/12 ml-28">
                <div className="text-[#424141] text-xl font-medium font-['Poppins'] leading-[24.94px] my-2">Personal Details</div>
                <section className="bg-white">
                    <div className="w-full py-8 max-w-screen lg:py-10">

                        {/* Form initiation */}
                        <form 
                            onSubmit={handleSubmit} 
                            className="w-full"
                        >
                            <div className="w-full grid gap-2 sm:grid-cols-2 sm:gap-4">
                                <div className="w-11/12">
                                    <label htmlFor="firstName" className="block mb-2 text-sm font-normal font-['poppins'] opacity-85 text-gray-900">First Name</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        id="firstName"
                                        value={values.firstName}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        disabled={!isEditing}
                                        className={`border border-gray-300 w-full text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block p-2.5 ${
                                            !isEditing ? 'bg-gray-100 cursor-not-allowed' : 'bg-[#f9f9f9]'
                                        }`}
                                        placeholder="Enter first name"
                                        required
                                    />
                                    {touched.firstName && errors.firstName && (
                                        <div className="text-red-500 text-xs mt-1">{errors.firstName}</div>
                                    )}
                                </div>
                                
                                <div className="w-11/12">
                                    <label htmlFor="lastName" className="block mb-2 text-sm font-normal font-['poppins'] opacity-85 text-gray-900">Last Name</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        id="lastName"
                                        value={values.lastName}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        disabled={!isEditing}
                                        className={`border border-gray-300 w-full text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block p-2.5 ${
                                            !isEditing ? 'bg-gray-100 cursor-not-allowed' : 'bg-[#f9f9f9]'
                                        }`}
                                        placeholder="Enter last name"
                                        required
                                    />
                                    {touched.lastName && errors.lastName && (
                                        <div className="text-red-500 text-xs mt-1">{errors.lastName}</div>
                                    )}
                                </div>
                                
                                <div className="w-11/12">
                                    <label htmlFor="email" className="block mb-2 text-sm font-normal font-['poppins'] opacity-85 text-gray-900">
                                        Email
                                        {!isEditing && <span className="text-xs text-gray-500 ml-2">(Read only)</span>}
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        value={values.email}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        disabled={true} // Always disabled - email cannot be edited
                                        className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 bg-gray-100 cursor-not-allowed"
                                        placeholder="Enter email address"
                                        required
                                    />
                                    {touched.email && errors.email && (
                                        <div className="text-red-500 text-xs mt-1">{errors.email}</div>
                                    )}
                                </div>
                                
                                <div className="w-11/12">
                                    <label htmlFor="phoneNumber" className="block mb-2 text-sm font-normal font-['poppins'] opacity-85 text-gray-900">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        id="phoneNumber"
                                        value={values.phoneNumber}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        disabled={!isEditing}
                                        className={`border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 ${
                                            !isEditing ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-50'
                                        }`}
                                        placeholder="Enter phone number"
                                        required
                                    />
                                    {touched.phoneNumber && errors.phoneNumber && (
                                        <div className="text-red-500 text-xs mt-1">{errors.phoneNumber}</div>
                                    )}
                                </div>
                                
                                <div className="w-11/12">
                                    <label htmlFor="birthDate" className="block mb-2 text-sm font-normal font-['poppins'] opacity-85 text-gray-900">Birth Date</label>
                                    <input
                                        type="date"
                                        name="birthDate"
                                        id="birthDate"
                                        value={values.birthDate}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        disabled={!isEditing}
                                        className={`border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 ${
                                            !isEditing ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-50'
                                        }`}
                                        required
                                    />
                                    {touched.birthDate && errors.birthDate && (
                                        <div className="text-red-500 text-xs mt-1">{errors.birthDate}</div>
                                    )}
                                </div>
                                
                                <div className="w-11/12">
                                    <label htmlFor="currency" className="block mb-2 text-sm font-normal font-['poppins'] opacity-85 text-gray-900">Currency</label>
                                    <input
                                        type="text"
                                        name="currency"
                                        id="currency"
                                        value={values.currency}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        disabled={!isEditing}
                                        className={`border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 ${
                                            !isEditing ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-50'
                                        }`}
                                        placeholder="Enter currency"
                                        required
                                    />
                                    {touched.currency && errors.currency && (
                                        <div className="text-red-500 text-xs mt-1">{errors.currency}</div>
                                    )}
                                </div>
                            </div>

                            {/* Button section */}
                            <div className="w-full flex justify-end gap-3 mt-12 mb-8 lg:pr-16 md:pr-8 pr-7">
                                {isEditing ? (
                                    <>
                                        <Button
                                            type="button"
                                            variant="outlined"
                                            color="gray"
                                            onClick={handleCancel}
                                            className="flex items-center gap-2 px-6 py-2 border-gray-500 font-medium font-['Poppins'] leading-[24.94px] text-gray-600 transition-all 
                                               hover:border-gray-700 hover:text-gray-700"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="outlined"
                                            color="blue"
                                            disabled={isSubmitting}
                                            onClick={(e) => {
                                                console.log("Save button clicked");
                                                console.log("Form errors:", errors);
                                                console.log("Form values:", values);
                                                console.log("Form touched:", touched);
                                            }}
                                            className={`flex items-center gap-2 px-6 py-2 font-medium font-['Poppins'] leading-[24.94px] transition-all ${
                                                isSubmitting 
                                                    ? 'border-gray-300 text-gray-400 cursor-not-allowed' 
                                                    : 'border-[#4182f9] text-[#4182f9] hover:bg-[#4182f9] hover:text-white'
                                            }`}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                        <circle 
                                                            className="opacity-25" 
                                                            cx="12" 
                                                            cy="12" 
                                                            r="10" 
                                                            stroke="currentColor" 
                                                            strokeWidth="4"
                                                            fill="none"
                                                        />
                                                        <path 
                                                            className="opacity-75" 
                                                            fill="currentColor" 
                                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                                        />
                                                    </svg>
                                                    Saving...
                                                </>
                                            ) : (
                                                'Save Changes'
                                            )}
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button
                                            type="button"
                                            variant="outlined"
                                            color="blue"
                                            onClick={handleEdit}
                                            className="flex items-center gap-2 px-6 py-2 border-[#4182f9] font-medium font-['Poppins'] leading-[24.94px] text-[#4182f9] transition-all 
                                               hover:bg-[#4182f9] hover:text-white"
                                        >
                                            <svg 
                                                xmlns="http://www.w3.org/2000/svg" 
                                                fill="none" 
                                                viewBox="0 0 24 24" 
                                                strokeWidth="1.5" 
                                                stroke="currentColor" 
                                                className="w-4 h-4"
                                            >
                                                <path 
                                                    strokeLinecap="round" 
                                                    strokeLinejoin="round" 
                                                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" 
                                                />
                                            </svg>
                                            Edit Details
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="gray"
                                            disabled={true}
                                            className="flex items-center gap-2 px-6 py-2 border-gray-300 font-medium font-['Poppins'] leading-[24.94px] text-gray-400 cursor-not-allowed opacity-50"
                                        >
                                            Save Details
                                        </Button>
                                    </>
                                )}
                            </div>
                        </form>

                        {/* Bank Details Section */}
                        <div className="text-[#424141] text-xl font-medium font-['Poppins'] leading-[24.94px] mb-4">My Bank Details</div>
                        <div className="flex flex-row gap-4 mt-7 ml-4">
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
                                <div className="text-black font-normal text-sm font-['Poppins']">4126-xxxx-xxxxx</div>
                                <div className="opacity-50 text-black text-sm font-normal font-['Poppins']">
                                    1 month ago
                                </div>
                            </div>
                        </div>

                        <button className="relative w-[200px] mt-4 ml-2 h-11 bg-[#4182f9] bg-opacity-10 rounded-lg">
                            <div className="absolute top-3 left-9 px-1 text-[#4182f9] text-sm font-normal font-['Poppins']">
                                Edit Bank Details
                            </div>
                        </button>
                    </div>
                </section>
            </div>
        </>
    );
}