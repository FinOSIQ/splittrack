import React, { useState } from "react";
import { Input } from "@material-tailwind/react";

export default function AddExpensePopup() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex justify-center items-center z-">
      {/* Button to open popup */}
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        Add Expense
      </button>

      {/* Popup Modal */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-96 h-[568px] bg-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 text-gray-500"
            >
              ✖
            </button>

            <div className="">
                <div className=" text-center mt-8 text-[#040b2b] text-[32px] font-semibold font-['Poppins'] leading-[41.57px]">
                    Add an Expense
                </div>
                
                <div className="flex w-72 flex-col gap-6 text-center mx-auto mt-4 -mb-4">
                    <Input variant="standard" label="" placeholder="With: Enter Group, Names, Emails..."/>
                </div>

                <hr className=" w-11/12 mx-auto"/>


                <div data-svg-wrapper className="left-[101px] top-[277px] absolute">
                    <svg
                    width="179"
                    height="33"
                    viewBox="0 0 179 33"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    >
                    <rect x="0.000976562" width="179" height="33" rx="12" fill="#F1F2F9" />
                    </svg>
                </div>
              <div data-svg-wrapper className="left-[101px] top-[332px] absolute">
                <svg
                  width="179"
                  height="33"
                  viewBox="0 0 179 33"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="0.000976562" width="179" height="33" rx="12" fill="#F1F2F9" />
                </svg>
              </div>
              <div className="w-[163px] left-[111px] top-[281px] absolute text-[#61677d] text-base font-normal font-['Poppins'] leading-[24.94px]">
                Enter Description
              </div>
              <div data-svg-wrapper className="left-[20px] top-[510px] absolute">
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
              </div>
              <div data-svg-wrapper className="left-[39px] top-[329px] absolute">
                <svg
                  width="38"
                  height="38"
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
              </div>
              <div data-svg-wrapper className="left-[39px] top-[275px] absolute">
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
              </div>
              <div className="w-[38px] h-[0px] left-[86px] top-[312px] absolute origin-top-left -rotate-90 border border-[#040b2b]"></div>
              <div className="w-[38px] h-[0px] left-[86px] top-[367px] absolute origin-top-left -rotate-90 border border-[#040b2b]"></div>
              <div className="w-[163px] left-[111px] top-[336px] absolute text-[#61677d] text-base font-normal font-['Poppins'] leading-[24.94px]">
                0.00
              </div>
              <div className="w-[102px] h-[26px] left-[109px] top-[391px] absolute">
                <div className="w-[102px] h-[20.80px] left-0 top-[3.12px] absolute bg-[#d9d9d9] rounded-xl" />
                <div className="w-[16.64px] h-[0px] left-[57px] top-[5.20px] absolute origin-top-left rotate-90 border border-[#61677d]"></div>
                <div className="w-[34px] h-[26px] left-[62px] top-0 absolute text-center text-[#61677d] text-[10px] font-normal font-['Poppins'] leading-[24.94px]">
                  2024
                </div>
                <div className="w-[15px] h-[26px] left-[36px] top-0 absolute text-center text-[#61677d] text-[10px] font-normal font-['Poppins'] leading-[24.94px]">
                  12
                </div>
                <div className="w-[15px] h-[26px] left-[10px] top-0 absolute text-center text-[#61677d] text-[10px] font-normal font-['Poppins'] leading-[24.94px]">
                  10
                </div>
                <div className="w-[16.64px] h-[0px] left-[30px] top-[5.20px] absolute origin-top-left rotate-90 border border-[#61677d]"></div>
              </div>
              <div className="w-[100px] h-8 left-[200px] top-[510px] absolute">
                <div className="w-[86.09px] h-[7.47px] left-[1.96px] top-[20.27px] absolute bg-[#040b2b] rounded-xl blur-[45.72px]" />
                <div className="w-[100px] h-8 px-[24.94px] py-[18.71px] left-0 top-0 absolute bg-[#040b2b] rounded-lg justify-center items-center gap-[16.63px] inline-flex">
                  <div className="text-white text-base font-medium font-['Poppins'] leading-[24.94px]">Next</div>
                  <div data-svg-wrapper>
                    <svg
                      width="8"
                      height="12"
                      viewBox="0 0 8 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4.7134 6L0.113403 1.4L1.5134 0L7.5134 6L1.5134 12L0.113403 10.6L4.7134 6Z"
                        fill="#FEF7FF"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div data-svg-wrapper className="left-[74px] top-[510px] absolute">
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
              </div>
              <div className="w-[35px] left-[231px] top-[335px] absolute text-right text-[#61677d] text-xs font-light font-['Poppins'] underline leading-[24.94px]">
                LKR
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
