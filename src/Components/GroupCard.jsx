import React from "react";
import GroupCardImage from "../assets/GroupCardImage.png";


export default function GroupCard() {
    return (
        <div className="flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-md p-4 w-full max-w-md">
                <div className="flex items-center mb-2">
                    <img className="w-12 h-12 rounded-full mr-4" src={GroupCardImage} alt="Group Avatar" />
                    <div>
                        <h2 className="text-lg text-[#040b2b] font-medium">Software Group</h2>
                        <p className="text-xs text-[#5c5470]">10 Dec, 2023</p>
                    </div>
                </div>
                <hr className="border-t border-[#f1f2f9] my-2" />
                <div className="text-xs text-[#5c5470] mb-0">
                    <p>Sonal Attanayake</p>
                    <p>Shehan Rajapaksha</p>
                    <p className="font-light">+2 more</p>
                </div>
                <p className="text-sm text-right text-[#040b2b] font-medium">You Owe</p>

                <div className="flex justify-between items-center">
                    <button className="px-3 py-1 bg-white border rounded-xl italic text-xs font-medium text-[#5c5470]">View Details</button>
                    <div className="text-right">
                        <div className="bg-[#f49d9d] bg-opacity-75 rounded px-3 py-1">
                            <p className="text-xs text-[#a00c0c] font-bold">5,000.00 LKR</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}