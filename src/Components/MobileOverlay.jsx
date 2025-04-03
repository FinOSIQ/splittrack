import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { PlusIcon, CurrencyDollarIcon, UserGroupIcon } from "@heroicons/react/24/solid";
import { Card, List } from "@material-tailwind/react";
import UserCard from "./UserCard";
import SearchResults from "./SearchResults";

export default function MobileOverlay() {
    const [isOpen, setIsOpen] = useState(false);
    const [isRotated, setIsRotated] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const menuRef = useRef([]);
    const overlayRef = useRef(null);
    const plusIconRef = useRef(null);
    const searchRef = useRef(null);

    const setMenuRef = (el, index) => {
        if (el && !menuRef.current[index]) {
            menuRef.current[index] = el; // ✅ Only assign if not already assigned
        }
    };

    // Search Data -Test
    const searchData = {
        friends: [
            { img: 'https://docs.material-tailwind.com/img/face-1.jpg', name: 'John Doe', email: 'john@gmail.com' },
            { img: 'https://docs.material-tailwind.com/img/face-2.jpg', name: 'Jane Smith', email: 'jane@gmail.com' },
        ],
        groups: [
            { img: 'https://docs.material-tailwind.com/img/face-3.jpg', name: 'Group Alpha', email: 'group.alpha@gmail.com' },
            { img: 'https://docs.material-tailwind.com/img/face-4.jpg', name: 'Group Beta', email: 'group.beta@gmail.com' },
        ],
        users: [
            { img: 'https://docs.material-tailwind.com/img/face-5.jpg', name: 'Alice Brown', email: 'alice@gmail.com' },
        ],
    };


    useEffect(() => {
        if (isOpen) {
            gsap.to(menuRef.current, {
                opacity: 1,
                scale: 1,
                duration: 0.3,
                ease: "power2.out",
                stagger: 0.1,
            });

            // Circular arc positions (3 buttons)
            const radius = 90;
            const angles = [180, 225, 270];

            angles.forEach((angle, index) => {
                const radians = (angle * Math.PI) / 180;
                const x = Math.cos(radians) * radius - 35;
                const y = Math.sin(radians) * radius - 50;

                gsap.to(menuRef.current[index], {
                    x,
                    y,
                    duration: 0.4,
                    ease: "power2.out",
                    delay: index * 0.1,
                });
            });

            gsap.to(overlayRef.current, { opacity: 0.5, duration: 0.3, pointerEvents: "auto" });

            // Show search bar
            gsap.to(searchRef.current, {
                opacity: 1,
                y: 0,
                duration: 0.3,
                ease: "power2.out",
            });
        } else {
            gsap.to(menuRef.current, { opacity: 0, scale: 0.5, duration: 0.2 });
            gsap.to(menuRef.current, { x: 0, y: 0, duration: 0.2 });
            gsap.to(overlayRef.current, { opacity: 0, duration: 0.2, pointerEvents: "none" });

            // Hide search bar
            gsap.to(searchRef.current, {
                opacity: 0,
                y: -20,
                duration: 0.2,
                ease: "power2.in",
            });

            setSearchQuery("");
        }
    }, [isOpen]);

    const handlePlusClick = () => {
        setIsOpen(!isOpen);

        gsap.to(plusIconRef.current, {
            rotation: isRotated ? 0 : 45,
            duration: 0.05,
            ease: "power2.out",
        });

        setIsRotated(!isRotated);
    };

    return (
        <div className="fixed bottom-5 right-5 z-40">
            {/* Background Overlay */}
            <div
                ref={overlayRef}
                className="fixed inset-0 bg-black opacity-0 transition-opacity"
                onClick={() => {
                    setIsOpen(false);
                    setIsRotated(false); // ✅ Ensure button rotates back when closing
                    gsap.to(plusIconRef.current, { rotation: 0, duration: 0.05, ease: "power2.out" });
                }}
            />
            {/* Search Bar */}
            <div ref={searchRef} className="fixed top-5 left-1/2 transform -translate-x-1/2 w-full opacity-0 z-50">
                <div>
                    <div className="mx-4 bg-[#f1f2f9] rounded-lg flex items-center px-4 border border-gray-300 focus-within:border-blue-500 mt-6 h-10 shadow-md">
                        {/* Search Icon */}
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"></path>
                            <circle cx="10" cy="10" r="7"></circle>
                        </svg>

                        {/* Search Input */}
                        <input
                            type="text"
                            placeholder="Search Users"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent outline-none text-gray-900 placeholder-gray-500 text-sm pl-2"
                        />
                    </div>

                    {/* Search Results Card (Ensuring it's above the buttons) */}
                    <Card className="mx-4 mt-4 bg-[#f1f2f9] z-50 relative">
                        <SearchResults searchData={searchData} />
                    </Card>
                </div>
            </div>

            {/* Floating Action Button & Menu */}
            <div className="relative">
                {/* Action Buttons */}
                <div className="absolute bottom-0 right-0 flex flex-col items-center">

                    {[CurrencyDollarIcon, PlusIcon, UserGroupIcon].map((Icon, index) => (
                        <button
                            key={index}
                            ref={(el) => setMenuRef(el, index)}
                            className="w-12 h-12 rounded-full bg-white text-gray-700 flex items-center justify-center shadow-md opacity-0 scale-50 absolute"
                        >
                            <Icon className="w-6 h-6" />
                        </button>
                    ))}

                </div>

                {/* Floating Action Button */}
                <button
                    className="w-14 h-14 rounded-full bg-blue-700 text-white flex items-center justify-center shadow-lg z-40"
                    onClick={handlePlusClick}
                >
                    <PlusIcon
                        ref={plusIconRef}
                        className="w-8 h-8 transition-transform duration-300"
                    />
                </button>
            </div>
        </div>
    );
}
