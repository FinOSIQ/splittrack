import React, { useState, useEffect,useCallback } from "react";
import { Input } from "@material-tailwind/react";
import { useFormik } from "formik";
import DatePicker from "./DatePicker";
import expenseParticipants from "./ExpenseParticipants"; // Import your expense participants
import { fetchSearchData } from "../utils/requests/expense";
import axios from "axios";
import OCRscanner from "./OCRscanner";
import QrCodeScanner from "./QrCodeScanner";

export default function AddExpensePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  // Initialize totalExpense as an empty string.
  const [totalExpense, setTotalExpense] = useState("");
  const [searchValue, setSearchValue] = useState("");  // Track the search value
  const [userId, setUserId] = useState(1);  // Assuming userId is available, replace as needed


  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);  // Update search value immediately
  };



  // Log the expense participants on component mount
  useEffect(() => {
    console.log(expenseParticipants);
  }, []);


  useEffect(() => {
    if (!searchValue) return;

    const source = axios.CancelToken.source();
 

    const fetchData = async () => {
      
      try {
        const data = await fetchSearchData(searchValue, "groups,friends,users", "600fc673", source.token);
        console.log(data);
        
      } catch (error) {
        console.error("Error fetching search data:", error);
      }
     
    };

    fetchData();

    // Cancel the previous request when the search value changes
    return () => {
      source.cancel("Request canceled due to new search input.");
    };
  }, [searchValue]);

  // Initialize Formik for the split options
  const formik = useFormik({
    initialValues: {
      splitEqual: expenseParticipants.participants.map(() => true),
      splitAmounts: expenseParticipants.participants.map(() => ""),
      splitPercentages: expenseParticipants.participants.map(() => ""),
      splitShares: expenseParticipants.participants.map(() => "")
    },
    onSubmit: (values) => {
      const expense = Number(totalExpense);
      let submissionData = { type: "", details: [] };

      switch (selectedTab) {
        case 1: {
          // Split Equally
          submissionData.type = "equal";
          const countSelected = values.splitEqual.filter(Boolean).length;
          const equalAmount = countSelected > 0 ? expense / countSelected : 0;
          submissionData.details = expenseParticipants.participants.map((name, idx) => ({
            name,
            amount: values.splitEqual[idx] ? equalAmount : 0
          }));
          break;
        }
        case 2: {
          // Split by Amounts
          const totalEntered = expenseParticipants.participants.reduce(
            (acc, _name, idx) => acc + (parseFloat(values.splitAmounts[idx]) || 0),
            0
          );
          if (totalEntered < expense) {
            alert(
              `Please allocate the full amount. You still have LKR ${(expense - totalEntered).toFixed(2)} left.`
            );
            return;
          }
          submissionData.type = "amount";
          submissionData.details = expenseParticipants.participants.map((name, idx) => ({
            name,
            amount: parseFloat(values.splitAmounts[idx]) || 0
          }));
          break;
        }
        case 3: {
          // Split by Percentages
          const totalPercentage = expenseParticipants.participants.reduce(
            (acc, _name, idx) => acc + (parseFloat(values.splitPercentages[idx]) || 0),
            0
          );
          if (totalPercentage !== 100) {
            alert(
              `Please allocate 100% of the expense. Currently allocated: ${totalPercentage.toFixed(2)}%`
            );
            return;
          }
          submissionData.type = "percentage";
          submissionData.details = expenseParticipants.participants.map((name, idx) => {
            const perc = parseFloat(values.splitPercentages[idx]) || 0;
            return {
              name,
              amount: (expense * perc) / 100
            };
          });
          break;
        }
        case 4: {
          // Split by Shares
          const totalShares = values.splitShares.reduce(
            (acc, val) => acc + (parseFloat(val) || 0),
            0
          );
          submissionData.type = "share";
          submissionData.details = expenseParticipants.participants.map((name, idx) => {
            const share = parseFloat(values.splitShares[idx]) || 0;
            return {
              name,
              amount: totalShares > 0 ? (expense * share) / totalShares : 0
            };
          });
          break;
        }
        default:
          break;
      }
      console.log("Submission Data:", submissionData);
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
          value={searchValue}
          onChange={handleSearchChange}  // Trigger search on change
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
        <Input variant="standard" label="Name" placeholder="Dinner, Lunch, etc.." />
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
          onChange={(e) => setTotalExpense(e.target.value)}
        />
      </div>

      {/* Date */}
      <div className="flex justify-center -mt-16">
        <DatePicker />
      </div>

      {/* OCR & QR Scanner and Next Button */}
      <div className="flex items-center justify-between -mt-10">
        <div className="flex space-x-6">
          {/* OCR Scanner Button */}
          <OCRscanner/> 


          {/* QR Scanner Button */}
          <QrCodeScanner/>
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => {
            // Check if a valid amount was entered
            if (!totalExpense || Number(totalExpense) <= 0) {
              alert("Please enter a valid amount to continue.");
              return;
            }
            setStep(2);
          }}
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
          {(() => {
            const countSelected = formik.values.splitEqual.filter(Boolean).length;
            const perPerson = countSelected > 0 ? Number(totalExpense) / countSelected : 0;
            return (
              <div className="mt-4 text-center text-gray-800">
                <div className="font-medium">
                  LKR {Number(totalExpense).toFixed(2)}/person ({countSelected}{" "}
                  {countSelected === 1 ? "person" : "people"})
                </div>
                <div className="mt-1">
                  {countSelected > 0
                    ? `LKR ${perPerson.toFixed(2)} per person`
                    : "No one selected"}
                </div>
              </div>
            );
          })()}
        </div>
      )
    },
    {
      id: 2,
      label: "1.23",
      heading: "Split by Amounts",
      subheading: "Specify exactly how much each person owes.",
      content: (() => {
        const totalEntered = expenseParticipants.participants.reduce(
          (acc, _name, i) => acc + (parseFloat(formik.values.splitAmounts[i]) || 0),
          0
        );

        return (
          <div className="mt-4">
            <div className="max-h-[300px] overflow-x-hidden overflow-y-auto space-y-0">
              {expenseParticipants.participants.map((name, idx) => {
                const currentValue = parseFloat(formik.values.splitAmounts[idx]) || 0;
                return (
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
                        value={formik.values.splitAmounts[idx]}
                        onChange={(e) => {
                          const newVal = parseFloat(e.target.value) || 0;
                          const currentTotalWithout = totalEntered - currentValue;
                          if (currentTotalWithout + newVal > Number(totalExpense)) {
                            return;
                          }
                          formik.setFieldValue(`splitAmounts[${idx}]`, e.target.value);
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 text-center text-gray-800">
              <span className="font-medium">
                LKR {totalEntered.toFixed(2)} out of LKR {Number(totalExpense).toFixed(2)}
              </span>
              <div className="text-red-600">
                (LKR {(Number(totalExpense) - totalEntered).toFixed(2)} left)
              </div>
            </div>
          </div>
        );
      })()
    },
    {
      id: 3,
      label: "%",
      heading: "Split by Percentages",
      subheading: "Enter the percentage split that's fair for your expense.",
      content: (() => {
        const totalPercentage = expenseParticipants.participants.reduce(
          (acc, _name, idx) => acc + (parseFloat(formik.values.splitPercentages[idx]) || 0),
          0
        );
        return (
          <div className="mt-4">
            <div className="max-h-[300px] overflow-x-hidden overflow-y-auto space-y-0">
              {expenseParticipants.participants.map((name, idx) => {
                const currentValue = parseFloat(formik.values.splitPercentages[idx]) || 0;
                return (
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
                        value={formik.values.splitPercentages[idx]}
                        onChange={(e) => {
                          const newVal = parseFloat(e.target.value) || 0;
                          const totalWithout = totalPercentage - currentValue;
                          if (totalWithout + newVal > 100) {
                            return;
                          }
                          formik.setFieldValue(`splitPercentages[${idx}]`, e.target.value);
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 text-center text-gray-800">
              <span className="font-medium">
                {totalPercentage.toFixed(2)}% out of 100%
              </span>
              <div className="text-red-600">
                ({(100 - totalPercentage).toFixed(2)}% left)
              </div>
            </div>
          </div>
        );
      })()
    },
    {
      id: 4,
      label: "",
      heading: "Split by Shares",
      subheading:
        "Great for time based or splitting across families. (2 nights => 2 shares)",
      content: (() => {
        const totalShares = expenseParticipants.participants.reduce(
          (acc, _name, idx) => acc + (parseFloat(formik.values.splitShares[idx]) || 0),
          0
        );
        return (
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
              <span className="font-medium">{totalShares} total shares</span>
            </div>
          </div>
        );
      })()
    }
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
              className={`flex-1 py-1 px-2 border border-gray-300 text-center rounded-lg transition-colors duration-200 ${selectedTab === tab.id ? "bg-[#040b2b] text-white" : "hover:bg-gray-100"
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
    <div className="relative w-[80px] h-[80px] bg-white rounded-full ml-3">
      <button
        onClick={() => {
          setIsOpen(true);
          setStep(1);
        }}
        className="absolute left-2 top-1  w-[70px] h-[70px] bg-[#040b2b] text-white flex items-center justify-center rounded-full shadow-md border-2 border-white"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2V22M2 12H22"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* The Popup */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-96 bg-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 text-gray-500"
            >
              ✖
            </button>
            {renderStepContent()}
          </div>
        </div>
      )}
    </div>

  );
}
