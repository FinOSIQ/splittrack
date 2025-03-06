
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";


export default function FriendReqCard({ img, name, email,style }) {
    return (

        <div className={`flex items-center justify-between p-2 mx-2 pb-3  border-b border-gray-200 ${style}`}>
            {/* Left Section: Avatar & Info */}
            <div className="flex items-center space-x-4">
                {/* Avatar */}
                <img src={img} alt={name} className="w-10 h-10 rounded-full" />

                {/* Name & Email */}
                <div>
                    <p className="text-sm font-normal leading-normal text-gray-900">{name}</p>
                    <p className="text-xs text-gray-500">{email}</p>
                </div>
            </div>

            {/* Right Section: Accept & Decline Buttons */}
            <div className="flex items-center space-x-3">
                {/* Accept Button */}
                <button className="w-8 h-8 flex items-center justify-center bg-green-100 text-green-600 rounded-full">
                    <CheckIcon className="w-4 h-4" />
                </button>

                {/* Decline Button */}
                <button className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded-full">
                    <XMarkIcon className="w-4 h-4" />
                </button>
            </div>

        </div>
    )
}