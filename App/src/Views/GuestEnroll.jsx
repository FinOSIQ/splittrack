import { useState } from "react";
import { 
  UsersIcon, 
  CheckIcon, 
  ArrowRightIcon, 
  ShieldCheckIcon, 
  ClockIcon, 
  UserPlusIcon 
} from "@heroicons/react/24/outline";
import { Formik, Form, Field } from "formik";
import { joinExpense } from "../utils/requests/expense";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

export default function GuestEnrollment() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { sessionId } = useParams();

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    
    const requestData = {
      firstName: values.firstName,
      lastName: values.lastName,
      sessionId: sessionId
    };
 
    const res = await joinExpense(requestData);
    if(res && res.status == 201) {
      toast.success("Successfully joined as a guest!");
    }else{
      console.log("Error joining expense:", res);
      
    }

    setIsSubmitting(false);
    setIsSuccess(true);
    

   
  };

  if (isSuccess) {
    return (
       <div className="h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-6 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckIcon className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Welcome Aboard!</h2>
          <p className="text-gray-600 mb-4 text-sm">
            You've successfully joined as a guest member. You can now participate in expense sharing.
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gray-900 h-2 rounded-full w-full transition-all duration-1000"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-md w-full">
        {/* Header Section */}
        <div className="bg-gray-900 px-8 py-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 opacity-20 rounded-full -translate-y-8 translate-x-8"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-600 opacity-20 rounded-full translate-y-8 -translate-x-8"></div>
          
          <div className="relative z-10">
            {/* Logo */}
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                <UsersIcon className="w-6 h-6 text-gray-900" />
              </div>
              <span className="ml-3 text-2xl font-bold">SplitTrack</span>
            </div>
            
            <h1 className="text-2xl font-bold text-center mb-2">Join as Guest</h1>
            <p className="text-gray-300 text-center text-sm">
              Quick setup • No account needed • Start sharing expenses
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="px-8 py-8">
    

          <Formik
            initialValues={{
              firstName: '',
              lastName: ''
            }}
            onSubmit={handleSubmit}
          >
            {({ values }) => (
              <Form className="space-y-6">
                {/* First Name Input */}
                <div>
                  <label htmlFor="firstName" className="block text-sm font-semibold text-gray-900 mb-2">
                    First Name
                  </label>
                  <Field
                    type="text"
                    id="firstName"
                    name="firstName"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-600 transition-all duration-200 focus:outline-none focus:ring-0"
                    placeholder="Enter your first name"
                  />
                </div>

                {/* Last Name Input */}
                <div>
                  <label htmlFor="lastName" className="block text-sm font-semibold text-gray-900 mb-2">
                    Last Name
                  </label>
                  <Field
                    type="text"
                    id="lastName"
                    name="lastName"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-600 transition-all duration-200 focus:outline-none focus:ring-0"
                    placeholder="Enter your last name"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-4 rounded-xl transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Creating your profile...
                    </>
                  ) : (
                    <>
                      Join Now
                      <ArrowRightIcon className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>
              </Form>
            )}
          </Formik>

          {/* Feature Highlights */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
              <UserPlusIcon className="w-4 h-4 mr-2 text-blue-600" />
              What you get as a guest:
            </h3>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <ShieldCheckIcon className="w-4 h-4 mr-3 text-blue-600" />
                <span>Secure temporary access</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <ClockIcon className="w-4 h-4 mr-3 text-blue-600" />
                <span>Instant expense participation</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <UsersIcon className="w-4 h-4 mr-3 text-gray-900" />
                <span>Collaborate with group members</span>
              </div>
            </div>
          </div>

             
        </div>
      </div>
    </div>
  );
}