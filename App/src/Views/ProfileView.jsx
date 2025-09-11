import React, { useState, useEffect } from 'react';
import HeaderProfile from '../Components/HeaderProfile';
import NavBar from '../Components/NavBar';
import { useFormik } from 'formik';
import { profileSchema } from '../utils/validationSchemas';
import { Avatar, Button, Select, Option } from '@material-tailwind/react';
import { fetchUserData, updateUserData } from '../utils/requests/User'; // Import both functions
import { toast } from 'sonner';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';

export default function ProfileView() {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCurrency, setSelectedCurrency] = useState('USD');
    const [isCurrencyUpdating, setIsCurrencyUpdating] = useState(false);

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
                birthDate: userData.birthdate ? userData.birthdate.split('T')[0] : '',
            });
        }
    };

    // Handle currency update
    const handleCurrencyUpdate = async () => {
        if (!selectedCurrency || selectedCurrency === userData?.currency_pref) {
            return;
        }

        setIsCurrencyUpdating(true);
        try {
            const updatePayload = {
                currency_pref: selectedCurrency
            };

            const response = await updateUserData(updatePayload);

            if (response.status === 200 && response.data.status === 'success') {
                toast.success('Currency updated successfully!');

                // Refresh user data
                const updatedUserResponse = await fetchUserData();
                if (updatedUserResponse.status === 200 && updatedUserResponse.data.status === 'success') {
                    setUserData(updatedUserResponse.data.data);
                }
            } else {
                toast.error('Failed to update currency: ' + response.data?.message);
                setSelectedCurrency(userData?.currency_pref || 'USD');
            }
        } catch (error) {
            console.error('Error updating currency:', error);
            toast.error('Error updating currency');
            setSelectedCurrency(userData?.currency_pref || 'USD');
        } finally {
            setIsCurrencyUpdating(false);
        }
    };

    // Format member since date
    const formatMemberSince = (dateInput) => {
        if (!dateInput) return 'N/A';

        console.log('formatMemberSince input:', dateInput, 'type:', typeof dateInput);

        let timestamp;

        // Handle array format [seconds, nanoseconds]
        if (Array.isArray(dateInput)) {
            timestamp = dateInput[0]; // Take the first element (seconds)
            console.log('Extracted timestamp from array:', timestamp);
        } else if (typeof dateInput === 'number') {
            timestamp = dateInput;
        } else if (typeof dateInput === 'string' && /^\d+$/.test(dateInput)) {
            timestamp = parseInt(dateInput);
        } else {
            // Handle ISO string format
            const date = new Date(dateInput);
            if (!isNaN(date.getTime())) {
                return date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }
            return 'N/A';
        }

        // Convert timestamp to Date object
        // If timestamp is in seconds (10 digits), convert to milliseconds
        const date = timestamp < 10000000000 ? new Date(timestamp * 1000) : new Date(timestamp);

        console.log('Final date object:', date, 'isValid:', !isNaN(date.getTime()));

        // Check if date is valid
        if (isNaN(date.getTime())) {
            return 'N/A';
        }

        const formatted = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        console.log('Formatted result:', formatted);
        return formatted;
    };

    const currencyOptions = [
        { value: 'USD', label: 'USD - US Dollar', symbol: '$' },
        { value: 'LKR', label: 'LKR - Sri Lankan Rupee', symbol: 'Rs' },
        { value: 'GBP', label: 'GBP - British Pound', symbol: '£' }
    ];

    // Update selected currency when userData changes
    useEffect(() => {
        if (userData) {
            setSelectedCurrency(userData.currency_pref || 'USD');
        }
    }, [userData]);

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
            <div className='lg:ml-14 z-50'>
                <HeaderProfile />
                
            </div>
            <NavBar />

            <div className="h-screen bg-white rounded-md mx-5 px-0 mt-5 w-10/12 ml-28">


                {/* Member Since and Currency Cards */}
                <div className="my-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Member Since Card */}
                    <div className="bg-white hover:shadow-md  rounded-lg p-5 border border-gray-200 hover:border-gray-300 transition-all duration-200">
                        <div className="flex items-center space-x-3">
                            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-gray-900 font-['Poppins'] mb-1">Member Since</h3>
                                <p className="text-gray-600 font-medium font-['Inter'] text-sm">
                                    {formatMemberSince(userData?.created_at)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Currency Preference Card */}
                    <div className="bg-white rounded-lg hover:shadow-md  p-5 border border-gray-200 hover:border-gray-300 transition-all duration-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <CurrencyDollarIcon className='w-7 h-7 text-black' />

                                <div className="flex-1">
                                    <h3 className="text-sm font-semibold text-gray-900 font-['Poppins'] mb-2">Currency</h3>
                                    <div className="w-32">
                                        <Select
                                            value={selectedCurrency}
                                            onChange={(value) => setSelectedCurrency(value)}
                                            className="bg-gray-50 border-gray-200"
                                            containerProps={{
                                                className: "min-w-0"
                                            }}
                                            labelProps={{
                                                className: "hidden"
                                            }}
                                        >
                                            {currencyOptions.map((option) => (
                                                <Option key={option.value} value={option.value}>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-sm text-gray-600">{option.value}</span>
                                                    </div>
                                                </Option>
                                            ))}
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            <Button
                                size="sm"
                                variant={selectedCurrency === userData?.currency_pref ? "outlined" : "filled"}
                                color="gray"
                                onClick={handleCurrencyUpdate}
                                disabled={isCurrencyUpdating || selectedCurrency === userData?.currency_pref}
                                className={`px-3 py-1.5 font-medium font-['Poppins'] text-xs transition-all ${selectedCurrency === userData?.currency_pref
                                    ? 'opacity-50 cursor-not-allowed border-gray-300 text-gray-500'
                                    : 'bg-black text-white hover:bg-gray-800 border-black'
                                    }`}
                            >
                                {isCurrencyUpdating ? (
                                    <div className="flex items-center space-x-1">
                                        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
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
                                        <span>Saving</span>
                                    </div>
                                ) : (
                                    <span>
                                        {selectedCurrency === userData?.currency_pref ? '✓ Saved' : 'Update'}
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="text-[#424141] text-xl font-medium font-['Poppins'] leading-[24.94px] my-2">Personal Details</div>
                <section className="bg-white ">
                    <div className="w-full py-8 max-w-screen lg:py-10 ">

                        {/* Form initiation */}
                        <form
                            onSubmit={handleSubmit}
                            className="w-full"
                        >
                            <div className="w-full grid gap-2 sm:grid-cols-2 sm:gap-4">
                                <div className="w-full">
                                    <label htmlFor="firstName" className="block mb-2 text-sm font-normal font-['poppins'] opacity-85 text-gray-900">First Name</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        id="firstName"
                                        value={values.firstName}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        disabled={!isEditing}
                                        className={`border border-gray-300 w-full text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block p-2.5 ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : 'bg-[#f9f9f9]'
                                            }`}
                                        placeholder="Enter first name"
                                        required
                                    />
                                    {touched.firstName && errors.firstName && (
                                        <div className="text-red-500 text-xs mt-1">{errors.firstName}</div>
                                    )}
                                </div>

                                <div className="w-full">
                                    <label htmlFor="lastName" className="block mb-2 text-sm font-normal font-['poppins'] opacity-85 text-gray-900">Last Name</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        id="lastName"
                                        value={values.lastName}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        disabled={!isEditing}
                                        className={`border border-gray-300 w-full text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block p-2.5 ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : 'bg-[#f9f9f9]'
                                            }`}
                                        placeholder="Enter last name"
                                        required
                                    />
                                    {touched.lastName && errors.lastName && (
                                        <div className="text-red-500 text-xs mt-1">{errors.lastName}</div>
                                    )}
                                </div>

                                <div className="w-full">
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

                                <div className="w-full">
                                    <label htmlFor="phoneNumber" className="block mb-2 text-sm font-normal font-['poppins'] opacity-85 text-gray-900">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        id="phoneNumber"
                                        value={values.phoneNumber}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        disabled={!isEditing}
                                        className={`border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-50'
                                            }`}
                                        placeholder="Enter phone number"
                                        required
                                    />
                                    {touched.phoneNumber && errors.phoneNumber && (
                                        <div className="text-red-500 text-xs mt-1">{errors.phoneNumber}</div>
                                    )}
                                </div>

                                <div className="w-full">
                                    <label htmlFor="birthDate" className="block mb-2 text-sm font-normal font-['poppins'] opacity-85 text-gray-900">Birth Date</label>
                                    <input
                                        type="date"
                                        name="birthDate"
                                        id="birthDate"
                                        value={values.birthDate}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        disabled={!isEditing}
                                        className={`border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-50'
                                            }`}
                                        required
                                    />
                                    {touched.birthDate && errors.birthDate && (
                                        <div className="text-red-500 text-xs mt-1">{errors.birthDate}</div>
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
                                            className={`flex items-center gap-2 px-6 py-2 font-medium font-['Poppins'] leading-[24.94px] transition-all ${isSubmitting
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



                    </div>
                </section>

                {/* Stylish Developer Credit with Divider */}
                <div className="flex items-center justify-center py-6 mt-2 ">
                    <div className="flex-grow h-px bg-gray-200"></div>
                    <div className="px-6">
                        <p className="text-xs text-gray-400 font-light tracking-wide whitespace-nowrap">
                            Developed by <span className="font-medium text-gray-500">SparkZ </span>
                        </p>
                    </div>
                    <div className="flex-grow h-px bg-gray-200"></div>
                </div>
            </div>
        </>
    );
}