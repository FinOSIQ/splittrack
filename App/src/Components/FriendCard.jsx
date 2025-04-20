import { useState, useRef, useEffect } from "react";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/solid";

export default function FriendCard({ img, name, email }) {
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="flex items-center justify-between p-2 mx-2 pb-3 border-b border-gray-200 relative">
            {/* Left Section: Avatar & Info */}
            <div className="flex items-center space-x-4">
                <img src={img} alt={name} className="w-10 h-10 rounded-full" />
                <div>
                    <p className="text-sm font-normal leading-normal text-gray-900">{name}</p>
                    <p className="text-xs text-gray-500">{email}</p>
                </div>
            </div>

            {/* Right Section: Options Button & Dropdown */}
            <div className="relative" ref={dropdownRef}>
                <button onClick={() => setDropdownOpen(!isDropdownOpen)}>
                    <EllipsisHorizontalIcon className="w-6 h-6 text-gray-500 cursor-pointer" />
                </button>
                {isDropdownOpen && <DropdownMenu onClose={() => setDropdownOpen(false)} />}
            </div>
        </div>
    );
}

function DropdownMenu({ onClose }) {
    return (
        <div className="absolute right-0 -mt-2 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            <ul className="py-1 text-sm text-gray-700">
                <li className="px-4 py-2 hover:bg-gray-50 cursor-pointer" onClick={onClose}>View</li>
                <li className="px-4 py-2 hover:bg-gray-50 cursor-pointer" onClick={onClose}>Settle up</li>
                <li className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-red-500" onClick={onClose}>Remove Friend</li>
            </ul>
        </div>
    );
}
