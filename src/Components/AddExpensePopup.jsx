import React, { useState, useEffect } from "react";
import { Input } from "@material-tailwind/react";
import { useFormik } from "formik";
import DatePicker from "./DatePicker";
import expenseParticipants from "./ExpenseParticipants"; // Import your expense participants

export default function AddExpensePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);

  // Log the expense participants on component mount
  useEffect(() => {
    console.log(expenseParticipants);
  }, []);

  // Initialize Formik, which will only be used in Step 2.
  // (If you want to include Step 1 fields, you could add them here.)
  const formik = useFormik({
    initialValues: {
      // You can optionally include step 1 fields here if needed.
      // For this example, we only include the split fields.
      splitEqual: expenseParticipants.participants.map(() => true),
      splitAmounts: expenseParticipants.participants.map(() => ""),
      splitPercentages: expenseParticipants.participants.map(() => ""),
      splitShares: expenseParticipants.participants.map(() => "")
    },
    onSubmit: (values) => {
      console.log("Form Values:", values);
      setIsOpen(false);
    }
  });

  // STEP 1: Add Expense (without Formik)
  const renderStep1 = () => (
    <div>
      {/* Header */}
      <div className="text-left mt-16 text-[#040b2b] text-[32px] font-semibold font-['Poppins'] leading-[41.57px]">
        Add an Expense
      </div>

      {/* "With" input */}
      <div className="flex w-72 flex-col gap-6 text-left mt-0 -mb-4">
        <Input
          variant="static"
          label=""
          placeholder="With: Enter Group, Names, Emails..."
        />
      </div>

      {/* Name */}
      <div className="mt-16 flex items-center space-x-4">
        <svg
          width="38"
          height="38"
          viewBox="0 0 38 38"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3.1676 3.95825H34.8343M12.6676 12.6666H25.3343M12.6676 20.5833H25.3343M5.81179 3.95825V22.9108C5.81179 24.4624 6.54012 25.9349 7.79096 26.8691L16.0401 33.0441C17.7976 34.3582 20.2201 34.3582 21.9776 33.0441L30.2268 26.8691C31.4776 25.9349 32.2059 24.4624 32.2059 22.9108V3.95825H5.81179Z"
            stroke="#040B2B"
            strokeWidth="1.5"
            strokeMiterlimit="10"
            strokeLinecap="round"
          />
        </svg>
        <div className="h-6 border-l border-gray-400"></div>
        <Input
          variant="standard"
          label="Name"
          placeholder="Dinner, Lunch, etc.."
        />
      </div>

      {/* Amount */}
      <div className="mt-8 flex items-center space-x-4">
        <svg
          width="36"
          height="36"
          viewBox="0 0 38 38"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M13.7314 22.689C13.7314 24.7315 15.2989 26.3782 17.2464 26.3782H21.2206C22.9147 26.3782 24.2922 24.9373 24.2922 23.164C24.2922 21.2323 23.4531 20.5515 22.2022 20.1082L15.8214 17.8915C14.5706 17.4482 13.7314 16.7673 13.7314 14.8357C13.7314 13.0623 15.1089 11.6215 16.8031 11.6215H20.7772C22.7247 11.6215 24.2922 13.2682 24.2922 15.3107M19.0009 9.50008V28.5001M34.8343 19.0001C34.8343 27.7446 27.7454 34.8334 19.0009 34.8334C10.2564 34.8334 3.1676 27.7446 3.1676 19.0001C3.1676 10.2556 10.2564 3.16675 19.0009 3.16675C27.7454 3.16675 34.8343 10.2556 34.8343 19.0001Z"
            stroke="#292D32"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="h-6 border-l border-gray-400"></div>
        <Input
          variant="standard"
          label="Amount"
          placeholder="0.00"
        />
      </div>

      {/* Date */}
      <div className="flex justify-center -mt-16">
        {/* DatePicker is rendered here, not wrapped in the form */}
        <DatePicker />
      </div>

      {/* OCR & QR Scanner and Next Button */}
      <div className="flex items-center justify-between -mt-10">
        <div className="flex space-x-6">
          {/* OCR Scanner Button */}
          <button type="button" className="p-0">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.66663 12.0001V8.66675C2.66663 5.34675 5.34663 2.66675 8.66663 2.66675H12M20 2.66675H23.3333C26.6533 2.66675 29.3333 5.34675 29.3333 8.66675V12.0001M29.3333 21.3334V23.3334C29.3333 26.6534 26.6533 29.3334 23.3333 29.3334H21.3333M12 29.3334H8.66663C5.34663 29.3334 2.66663 26.6534 2.66663 23.3334V20.0001M25.3333 16.0001H6.66663M22.6666 12.6667V19.3334C22.6666 22.0001 21.3333 23.3334 18.6666 23.3334H13.3333C10.6666 23.3334 9.33329 22.0001 9.33329 19.3334V12.6667C9.33329 10.0001 10.6666 8.66675 13.3333 8.66675H18.6666C21.3333 8.66675 22.6666 10.0001 22.6666 12.6667Z"
                stroke="#040B2B"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* QR Scanner Button */}
          <button type="button" className="p-0">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 6.5C5 5.672 5.672 5 6.5 5H12.5C13.328 5 14 5.672 14 6.5V12.5C14 13.328 13.328 14 12.5 14H6.5C6.10218 14 5.72064 13.842 5.43934 13.5607C5.15804 13.2794 5 12.8978 5 12.5V6.5ZM5 19.5C5 18.672 5.672 18 6.5 18H12.5C13.328 18 14 18.672 14 19.5V25.5C14 26.328 13.328 27 12.5 27H6.5C6.10218 27 5.72064 26.842 5.43934 26.5607C5.15804 26.2794 5 25.8978 5 25.5V19.5ZM18 6.5C18 5.672 18.672 5 19.5 5H25.5C26.328 5 27 5.672 27 6.5V12.5C27 13.328 26.328 14 25.5 14H19.5C19.1022 14 18.7206 13.842 18.4393 13.5607C18.158 13.2794 18 12.8978 18 12.5V6.5Z"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 9H10V10H9V9ZM9 22H10V23H9V22ZM22 9H23V10H22V9ZM18 18H19V19H18V18ZM18 26H19V27H18V26ZM26 18H27V19H26V18ZM26 26H27V27H26V26ZM22 22H23V23H22V22Z"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => setStep(2)}
          className="px-6 py-2 bg-[#040b2b] text-white rounded-lg flex items-center gap-2"
        >
          Next
          <svg
            width="8"
            height="12"
            viewBox="0 0 8 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M4.7134 6L0.113403 1.4L1.5134 0L7.5134 6L1.5134 12L0.113403 10.6L4.7134 6Z" fill="#FEF7FF" />
          </svg>
        </button>
      </div>
    </div>
  );

  // STEP 2: Split Options (4 Icon Tabs)
  const tabs = [
    {
      id: 1,
      label: "=",
      heading: "Split Equally",
      subheading: "Select which people owe an equal share.",
      content: (
        <div className="mt-4">
          {/* People list with checkboxes */}
          <div className="max-h-[300px] overflow-x-hidden overflow-y-auto space-y-3">
            {expenseParticipants.participants.map((name, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="7" r="4" />
                    <path d="M5.5 20C5.5 16.9624 7.96243 14.5 11 14.5H13C16.0376 14.5 18.5 16.9624 18.5 20" />
                  </svg>
                </div>
                <div className="flex-1">
                  <span className="font-normal">{name}</span>
                </div>
                <input
                  type="checkbox"
                  name={`splitEqual[${idx}]`}
                  onChange={formik.handleChange}
                  checked={formik.values.splitEqual[idx]}
                  className="w-5 h-5 accent-[#040b2b]"
                />
              </div>
            ))}
          </div>
          <div className="mt-4 text-center text-gray-800">
            <span className="font-medium">LKR 10,000.00/person</span> (
            {expenseParticipants.participants.length} people)
          </div>
        </div>
      ),
    },
    {
      id: 2,
      label: "1.23",
      heading: "Split by Amounts",
      subheading: "Specify exactly how much each person owes.",
      content: (
        <div className="mt-4">
          <div className="max-h-[300px] overflow-x-hidden overflow-y-auto space-y-0">
            {expenseParticipants.participants.map((name, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="7" r="4" />
                    <path d="M5.5 20C5.5 16.9624 7.96243 14.5 11 14.5H13C16.0376 14.5 18.5 16.9624 18.5 20" />
                  </svg>
                </div>
                <div className="flex-1">
                  <span className="font-medium">{name}</span>
                </div>
                <div className="w-16">
                  <Input
                    variant="static"
                    label=""
                    placeholder="0.00"
                    {...formik.getFieldProps(`splitAmounts[${idx}]`)}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center text-gray-800">
            <span className="font-medium">LKR 0.00 out of LKR 10,000.00</span>
            <div className="text-red-600">(LKR 10,000.00 left)</div>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      label: "%",
      heading: "Split by Percentages",
      subheading: "Enter the percentage split that's fair for your expense.",
      content: (
        <div className="mt-4">
          <div className="max-h-[300px] overflow-x-hidden overflow-y-auto space-y-0">
            {expenseParticipants.participants.map((name, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="7" r="4" />
                    <path d="M5.5 20C5.5 16.9624 7.96243 14.5 11 14.5H13C16.0376 14.5 18.5 16.9624 18.5 20" />
                  </svg>
                </div>
                <div className="flex-1">
                  <span className="font-medium">{name}</span>
                </div>
                <div className="w-16">
                  <Input
                    variant="static"
                    label=""
                    placeholder="%"
                    {...formik.getFieldProps(`splitPercentages[${idx}]`)}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center text-gray-800">
            <span className="font-medium">0% out of 100%</span>
            <div className="text-red-600">(100% left)</div>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      label: "",
      heading: "Split by Shares",
      subheading:
        "Great for time based or splitting across families. (2 nights => 2 shares)",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="size-6 mx-auto"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5"
          />
        </svg>
      ),
      content: (
        <div className="mt-4">
          <div className="max-h-[300px] overflow-x-hidden overflow-y-auto space-y-3">
            {expenseParticipants.participants.map((name, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="7" r="4" />
                    <path d="M5.5 20C5.5 16.9624 7.96243 14.5 11 14.5H13C16.0376 14.5 18.5 16.9624 18.5 20" />
                  </svg>
                </div>
                <div className="flex-1">
                  <span className="font-medium">{name}</span>
                </div>
                <div className="w-16">
                  <Input
                    variant="static"
                    label=""
                    placeholder="0"
                    {...formik.getFieldProps(`splitShares[${idx}]`)}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center text-gray-800">
            <span className="font-medium">0 total shares</span>
          </div>
        </div>
      ),
    },
  ];

  const [selectedTab, setSelectedTab] = useState(tabs[0].id);

  const renderStep2 = () => {
    const activeTab = tabs.find((t) => t.id === selectedTab);
    return (
      <div className="p-2">
        {/* Title */}
        <div className="text-left mt-4 text-[#040b2b] text-[32px] font-semibold font-['Poppins'] leading-[41.57px]">
          Split Options
        </div>

        {/* Tabs Row (Icons) */}
        <div className="flex w-full mt-4 gap-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedTab(tab.id)}
              className={`flex-1 py-1 px-2 border border-gray-300 text-center rounded-lg transition-colors duration-200 ${
                selectedTab === tab.id ? "bg-[#040b2b] text-white" : "hover:bg-gray-100"
              }`}
            >
              {tab.icon ? tab.icon : <span className="font-bold text-sm">{tab.label}</span>}
            </button>
          ))}
        </div>

        {/* Heading + Subheading for the active tab */}
        <div className="mt-2 text-lg font-semibold">{activeTab?.heading}</div>
        <div className="text-gray-600 text-sm">{activeTab?.subheading}</div>

        {/* Content Area for the active tab */}
        <div>{activeTab?.content}</div>

        {/* Bottom Buttons */}
        <div className="mt-6 flex items-center justify-between">
          <button type="button" onClick={() => setStep(1)} className="text-blue-600 underline">
            Back
          </button>
          <button type="submit" className="px-6 py-2 bg-[#040b2b] text-white rounded-lg">
            Create
          </button>
        </div>
      </div>
    );
  };

  // Render content: if step 1, show non-formik content;
  // if step 2, wrap it in a form that calls formik.handleSubmit.
  const renderStepContent = () => {
    if (step === 1) {
      return renderStep1();
    } else if (step === 2) {
      return (
        <form onSubmit={formik.handleSubmit}>
          {renderStep2()}
        </form>
      );
    }
    return renderStep1();
  };

  return (
    <div className="flex justify-center items-center z-20">
      <button
        onClick={() => {
          setIsOpen(true);
          setStep(1);
        }}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        Add Expense
      </button>

      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-96 bg-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <button onClick={() => setIsOpen(false)} className="absolute top-3 right-3 text-gray-500">
              ✖
            </button>
            {renderStepContent()}
          </div>
        </div>
      )}
    </div>
  );
}
