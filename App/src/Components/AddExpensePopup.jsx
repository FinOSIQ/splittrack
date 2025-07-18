import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@material-tailwind/react";
import { useFormik } from "formik";
import DatePicker from "./DatePicker";
import expenseParticipants from "./ExpenseParticipants"; // Import your expense participants
import { createExpense, fetchSearchData } from "../utils/requests/expense";
import axios from "axios";
import OCRscanner from "./OCRscanner";
import QrCodeScanner from "./QrCodeScanner";
import SearchResults from "./SearchResults";
import { se } from "date-fns/locale";
import { getGroupDetails } from "../utils/requests/Group";
import { toast } from "sonner";
import { set } from "date-fns";
import useUserData from "../hooks/useUserData";

export default function AddExpensePopup() {
  // Get current user data
  const { user, getFullName, isLoggedIn } = useUserData();
  
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [totalExpense, setTotalExpense] = useState("");
  const [expenseName, setExpenseName] = useState("");
  const [expenseDate, setExpenseDate] = useState(new Date()); // Add state for date
  const [isLoadingGroupMembers, setIsLoadingGroupMembers] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);

  // Initialize selectedItems with current user when component mounts or when user data changes
  useEffect(() => {
    if (user && isLoggedIn() && selectedItems.length === 0) {
      const currentUserItem = {
        id: user.user_Id,
        type: 'user',
        name: getFullName() || `${user.first_name} ${user.last_name}`.trim(),
        avatar: null,
        originalData: user,
        isCurrentUser: true // Flag to identify current user
      };
      
      setSelectedItems([currentUserItem]);
    }
  }, [user, isLoggedIn, getFullName]); // Dependencies to re-run when user data changes

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
  };

  // Handle date change from DatePicker
  const handleDateChange = (date) => {
    setExpenseDate(date);
  };

  const handleSearchItemClick = (item, type) => {
    // console.log(`Selected ${type}:`, item);

    // Create a new item with type and details
    const newSelectedItem = {
      id: item.user_id || item.group_id || item.id || null,
      type,
      name: item.first_name || item.email || item.name || "Unknown",
      avatar: item.avatar || null,
      originalData: item // Store original data for reference
    };

    // Add to selected items (avoiding duplicates)
    setSelectedItems(prev => {
      // Check if item already exists
      const exists = prev.some(existingItem =>
        existingItem.id === newSelectedItem.id && existingItem.type === newSelectedItem.type
      );

      if (exists) return prev;
      
      // Check if this is the current user being added again
      if (user && newSelectedItem.id === user.user_Id && newSelectedItem.type === 'user') {
        // Don't add duplicate current user, but maybe show a message
        toast.info("You are already included in this expense");
        return prev;
      }
      
      return [...prev, newSelectedItem];
    });

    // Clear search
    setSearchValue("");
    setSearchResults(null);
  };

  // Function to fetch group members and replace group with individual members
  const fetchGroupMembersAndProceed = async (selectedItems) => {
    // console.log("selected items:", selectedItems);
    
    const selectedGroups = selectedItems.filter(item => item.type === 'group');
    // console.log("selected grps:",selectedGroups);
    
    
    if (selectedGroups.length === 0) {
      // No groups selected, proceed normally
      setStep(2);
      return;
    }
   
    
    setIsLoadingGroupMembers(true);

    try {
      let updatedSelectedItems = [...selectedItems];
      let groupId = null;

      for (const group of selectedGroups) {
        try {
          
          const groupDetails = await getGroupDetails(group.id);
          console.log("Fetched group details:", groupDetails.group.groupMembers);
          groupId = group.id; // Store the group ID for submission
          
          // Remove the group from selected items
          updatedSelectedItems = updatedSelectedItems.filter(
            item => !(item.id === group.id && item.type === 'group')
          );

          // Add individual group members
          if (groupDetails && groupDetails.group.groupMembers) {
            const groupMembers = groupDetails.group.groupMembers.map(member => ({
              id: member.userUser_Id || null,
              type: 'user',
              name: member.first_name || member.name || member.email || "Unknown",
              avatar: member.avatar || null,
              originalData: member
            }));

            // console.log("Group members:", groupMembers);
            
            // Add members, avoiding duplicates
            groupMembers.forEach(member => {
              const exists = updatedSelectedItems.some(existingItem =>
                existingItem.id === member.id && existingItem.type === member.type
              );
              if (!exists) {
                updatedSelectedItems.push(member);
              }
            });
          }
        } catch (error) {
          console.error(`Error fetching group details for group ${group.id}:`, error);
          // You might want to show an error message to the user here
          alert(`Failed to fetch members for group: ${group.name}`);
        }
      }

      setSelectedItems(updatedSelectedItems);
      setSelectedGroupId(groupId); // Store the group ID for later use
      setStep(2);
      
    } catch (error) {
      console.error("Error processing groups:", error);
      alert("An error occurred while processing group members.");
    } finally {
      setIsLoadingGroupMembers(false);
    }
  };

  // Log the expense participants on component mount
  useEffect(() => {
    console.log(expenseParticipants);
  }, []);

  useEffect(() => {
    if (!searchValue) {
      setSearchResults(null);
      return;
    }

    const source = axios.CancelToken.source();

    const fetchData = async () => {
      try {
        const Searchdata = await fetchSearchData(searchValue, "groups,friends,users", "600fc673", source.token);
        console.log(Searchdata);
        setSearchResults(Searchdata);
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
      splitEqual: selectedItems.map((item) => item.isCurrentUser ? true : true), // Current user always true, others default true
      splitAmounts: selectedItems.map(() => ""),
      splitPercentages: selectedItems.map(() => ""),
      splitShares: selectedItems.map(() => "")
    },
    enableReinitialize: true, // This allows formik to reinitialize when selectedItems changes
    onSubmit: async (values) => {
      const expense = Number(totalExpense);
      let participantDetails = [];

      // Determine and calculate the appropriate split
      switch (selectedTab) {
        case 1: {
          // Split Equally
          const countSelected = values.splitEqual.filter(Boolean).length;
          const equalAmount = countSelected > 0 ? expense / countSelected : 0;

          // Create participant array with selected participants
          participantDetails = selectedItems.map((participant, idx) => {
            // Skip unselected participants
            if (!values.splitEqual[idx]) return null;

            const baseParticipant = {
              participant_role: participant.type === 'guest' ? "guest" : "member",
              owning_amount: parseFloat(equalAmount.toFixed(2)),
              userUser_Id: participant.type === 'guest' ? null : participant.id
            };

            // Add firstName and lastName only if participant is a guest
            if (participant.type === 'guest') {
              baseParticipant.firstName = participant.originalData?.firstName || participant.name?.split(' ')[0] || '';
              baseParticipant.lastName = participant.originalData?.lastName || participant.name?.split(' ')[1] || '';
            }

            return baseParticipant;
          }).filter(Boolean); // Remove null entries
          break;
        }
        case 2: {
          // Split by Amounts
          const totalEntered = selectedItems.reduce(
            (acc, _participant, idx) => acc + (parseFloat(values.splitAmounts[idx]) || 0),
            0
          );

          if (totalEntered < expense) {
            alert(
              `Please allocate the full amount. You still have LKR ${(expense - totalEntered).toFixed(2)} left.`
            );
            return;
          }

          participantDetails = selectedItems.map((participant, idx) => {
            const amount = parseFloat(values.splitAmounts[idx]) || 0;
            if (amount <= 0) return null; // Skip participants with zero amount

            const baseParticipant = {
              participant_role: participant.type === 'guest' ? "guest" : "member",
              owning_amount: parseFloat(amount.toFixed(2)),
              userUser_Id: participant.type === 'guest' ? null : participant.id
            };

            // Add firstName and lastName only if participant is a guest
            if (participant.type === 'guest') {
              baseParticipant.firstName = participant.originalData?.firstName || participant.name?.split(' ')[0] || '';
              baseParticipant.lastName = participant.originalData?.lastName || participant.name?.split(' ')[1] || '';
            }

            return baseParticipant;
          }).filter(Boolean);
          break;
        }
        case 3: {
          // Split by Percentages
          const totalPercentage = selectedItems.reduce(
            (acc, _participant, idx) => acc + (parseFloat(values.splitPercentages[idx]) || 0),
            0
          );

          if (totalPercentage !== 100) {
            alert(
              `Please allocate 100% of the expense. Currently allocated: ${totalPercentage.toFixed(2)}%`
            );
            return;
          }

          participantDetails = selectedItems.map((participant, idx) => {
            const perc = parseFloat(values.splitPercentages[idx]) || 0;
            if (perc <= 0) return null;

            const amount = (expense * perc) / 100;

            const baseParticipant = {
              participant_role: participant.type === 'guest' ? "guest" : "member",
              owning_amount: parseFloat(amount.toFixed(2)),
              userUser_Id: participant.type === 'guest' ? null : participant.id
            };

            // Add firstName and lastName only if participant is a guest
            if (participant.type === 'guest') {
              baseParticipant.firstName = participant.originalData?.firstName || participant.name?.split(' ')[0] || '';
              baseParticipant.lastName = participant.originalData?.lastName || participant.name?.split(' ')[1] || '';
            }

            return baseParticipant;
          }).filter(Boolean);
          break;
        }
        case 4: {
          // Split by Shares
          const totalShares = values.splitShares.reduce(
            (acc, val) => acc + (parseFloat(val) || 0),
            0
          );

          if (totalShares <= 0) {
            alert("Please allocate at least one share.");
            return;
          }

          participantDetails = selectedItems.map((participant, idx) => {
            const share = parseFloat(values.splitShares[idx]) || 0;
            if (share <= 0) return null;

            const amount = (expense * share) / totalShares;

            const baseParticipant = {
              participant_role: participant.type === 'guest' ? "guest" : "member",
              owning_amount: parseFloat(amount.toFixed(2)),
              userUser_Id: participant.type === 'guest' ? null : participant.id
            };

            // Add firstName and lastName only if participant is a guest
            if (participant.type === 'guest') {
              baseParticipant.firstName = participant.originalData?.firstName || participant.name?.split(' ')[0] || '';
              baseParticipant.lastName = participant.originalData?.lastName || participant.name?.split(' ')[1] || '';
            }

            return baseParticipant;
          }).filter(Boolean);
          break;
        }
        default:
          break;
      }

      // Create the final expense object
      const expenseObject = {
        expense_Id: null, // This will be assigned by the backend
        name: expenseName,
        expense_total_amount: parseFloat(expense.toFixed(2)),
        usergroupGroup_Id: selectedGroupId, // Use the stored group ID
        participant: participantDetails
      };
      console.log("Expense Object:", expenseObject);
      // Here you would send the expense object to your API
      // For example:
      // sendExpenseToAPI(expenseObject);
      const res = await createExpense(expenseObject);
      if (res.status == 201) {
        toast.success(`Expense ${expenseName} Created successfully`)
        setIsOpen(false);
      }else {
        toast.error(`Failed to create Expense ${res}`)
      }
      
      
     setExpenseName("");
     setTotalExpense("");
     setExpenseDate(new Date());
      
     

      
    }
  });

  // STEP 1: Add Expense (without Formik)
  const renderStep1 = () => (
    <div className="relative">
      {/* Header */}
      <div className="text-left mt-16 mb-4 text-[#040b2b] text-[32px] font-semibold font-['Poppins'] leading-[41.57px]">
        Add an Expense
      </div>

      {/* Search input */}
      <div className="flex w-72 flex-col gap-6 text-left mt-0 -mb-4 relative">
        <Input
          variant="standard"
          label="Search"
          placeholder="Enter Group, Names, Emails.."
          value={searchValue}
          onChange={handleSearchChange}
        />

        {/* Display selected items */}
        {selectedItems.length > 0 && (
          <div className="flex flex-wrap gap-2 -mt-4">
            {selectedItems.map((item) => (
              
              <div
                key={`${item.type}-${item.id}`}
                className="flex items-center gap-1 px-1 py-0.5 bg-blue-50 text-blue-800 rounded-full text-xs border border-blue-200"
              >
                {item.type === 'friend' && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="7" r="4" />
                    <path d="M5.5 20C5.5 16.9624 7.96243 14.5 11 14.5H13C16.0376 14.5 18.5 16.9624 18.5 20" />
                  </svg>
                )}
                {item.type === 'group' && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 20C17 18.3431 14.7614 17 12 17C9.23858 17 7 18.3431 7 20" />
                    <circle cx="12" cy="10" r="3" />
                    <path d="M21 20C21 18.3431 19.5 17 18 17C16.5 17 16 17.4477 16 18" />
                    <path d="M3 20C3 18.3431 4.5 17 6 17C7.5 17 8 17.4477 8 18" />
                    <path d="M18 9.5C18 8.12 17.5 7 16.5 7C15.5 7 15 7.88 15 9" />
                    <path d="M6 9.5C6 8.12 6.5 7 7.5 7C8.5 7 9 7.88 9 9" />
                  </svg>
                )}
                {item.type === 'user' && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="7" r="4" />
                    <path d="M5.5 20C5.5 16.9624 7.96243 14.5 11 14.5H13C16.0376 14.5 18.5 16.9624 18.5 20" />
                  </svg>
                )}
                <span>{item.name}</span>
                {/* {console.log(item)} */}
                {/* Only show remove button if it's not the current user */}
                {!item.isCurrentUser && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItems(prev => prev.filter(i => !(i.id === item.id && i.type === item.type)));
                    }}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                )}
                {/* Show a lock icon for current user to indicate they can't be removed */}
                {item.isCurrentUser && (
                  <div className="ml-1 text-gray-400" title="You (cannot be removed)">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <circle cx="12" cy="16" r="1"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}


        {/* Render Search Results if searchResults is present */}
        {searchValue && searchResults && (
          <div className="absolute top-12 left-0 right-0 mt-1 bg-white shadow-lg rounded-md overflow-y-auto z-50 border border-gray-200">
            <SearchResults
              searchData={searchResults}
              onItemClick={handleSearchItemClick}
            />
          </div>
        )}
      </div>

      {/* Name (duplicate? Check if this is intentional) */}
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
          value={expenseName}
          onChange={e => setExpenseName(e.target.value)}
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
          value={totalExpense}
          onChange={(e) => setTotalExpense(e.target.value)}
        />
      </div>

      {/* Date */}
      <div className="flex justify-center -mt-16">
        <DatePicker onDateChange={handleDateChange} />
      </div>

      {/* OCR & QR Scanner and Next Button */}
      <div className="flex items-center justify-between -mt-10">
        <div className="flex space-x-6">
          {/* OCR Scanner Button */}
          <OCRscanner />

          {/* QR Scanner Button */}
          <QrCodeScanner
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
           />
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={async () => {
            // Check if a valid amount was entered
            if (!totalExpense || Number(totalExpense) <= 0) {
              alert("Please enter a valid amount to continue.");
              return;
            }
            if (!expenseName.trim()) {
              alert("Please enter an expense name to continue.");
              return;
            }
            
            await fetchGroupMembersAndProceed(selectedItems);
          }}
          disabled={isLoadingGroupMembers}
          className="px-6 py-2 bg-[#040b2b] text-white rounded-lg flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed min-w-[100px]"
        >
          {isLoadingGroupMembers ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Loading...
            </>
          ) : (
            <>
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
            </>
          )}
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
            {selectedItems.map((participant, idx) => (
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
                  <span className="font-normal">
                    {participant.name}
                    {participant.isCurrentUser && <span className="text-gray-500 text-xs ml-1">(You)</span>}
                  </span>
                </div>
                <input
                  type="checkbox"
                  name={`splitEqual[${idx}]`}
                  onChange={participant.isCurrentUser ? undefined : formik.handleChange}
                  checked={formik.values.splitEqual[idx]}
                  disabled={participant.isCurrentUser}
                  className={`w-5 h-5 accent-[#040b2b] ${participant.isCurrentUser ? 'opacity-60 cursor-not-allowed' : ''}`}
                  title={participant.isCurrentUser ? "You are always included" : undefined}
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
        const totalEntered = selectedItems.reduce(
          (acc, _participant, i) => acc + (parseFloat(formik.values.splitAmounts[i]) || 0),
          0
        );

        return (
          <div className="mt-4">
            <div className="max-h-[300px] overflow-x-hidden overflow-y-auto space-y-0">
              {selectedItems.map((participant, idx) => {
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
                      <span className="font-medium">
                        {participant.name}
                        {participant.isCurrentUser && <span className="text-gray-500 text-xs ml-1">(You)</span>}
                      </span>
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
        const totalPercentage = selectedItems.reduce(
          (acc, _participant, idx) => acc + (parseFloat(formik.values.splitPercentages[idx]) || 0),
          0
        );
        return (
          <div className="mt-4">
            <div className="max-h-[300px] overflow-x-hidden overflow-y-auto space-y-0">
              {selectedItems.map((participant, idx) => {
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
                      <span className="font-medium">
                        {participant.name}
                        {participant.isCurrentUser && <span className="text-gray-500 text-xs ml-1">(You)</span>}
                      </span>
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
      label: "1/3",
      heading: "Split by Shares",
      subheading:
        "Great for time based or splitting across families. (2 nights => 2 shares)",
      content: (() => {
        const totalShares = selectedItems.reduce(
          (acc, _participant, idx) => acc + (parseFloat(formik.values.splitShares[idx]) || 0),
          0
        );
        return (
          <div className="mt-4">
            <div className="max-h-[300px] overflow-x-hidden overflow-y-auto space-y-3">
              {selectedItems.map((participant, idx) => (
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
                    <span className="font-medium">
                      {participant.name}
                      {participant.isCurrentUser && <span className="text-gray-500 text-xs ml-1">(You)</span>}
                    </span>
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
    <div className="relative w-[80px] h-[80px] bg-white rounded-full ml-3 z-500">
      <button
        onClick={() => {
          setIsOpen(true);
          setStep(1);
          setSearchValue(""); // Clear search input when opening popup
          setSearchResults(null); // Clear search results when opening popup
          setSelectedGroupId(null); // Clear selected group ID when opening popup
          
          // Reset selectedItems with current user
          if (user && isLoggedIn()) {
            const currentUserItem = {
              id: user.user_Id,
              type: 'user',
              name: getFullName() || `${user.first_name} ${user.last_name}`.trim(),
              avatar: null,
              originalData: user,
              isCurrentUser: true
            };
            setSelectedItems([currentUserItem]);
          } else {
            setSelectedItems([]); // Fallback if no user data
          }
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
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
          <div className="w-96 bg-white p-6 rounded-2xl shadow-lg relative overflow-visible">
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