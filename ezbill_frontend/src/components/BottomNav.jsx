// src/components/BottomNav.jsx

import {useRef} from "react";
import {
  WalletIcon,
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  CameraIcon
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { LayoutDashboardIcon } from "lucide-react";

const BottomNav = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef();

  const handleImageSelect = (e) => {
  const file = e.target.files[0];
  if (file) {
    navigate("/preview", { state: { file } }); // pass file through state
  }
};
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white pt-16 pb-4 shadow-lg rounded-t-3xl flex items-end justify-around z-50">
      <button
        className="flex flex-col items-center text-gray-700 hover:text-blue-600 transition-colors -mt-10"
        onClick={() => navigate("/log")}
      >
        <WalletIcon className="w-6 h-6 mb-1" />
        <span className="text-xs">Log</span>
      </button>
      <button
        className="flex flex-col items-center text-gray-700 hover:text-green-600 transition-colors -mt-10"
        onClick={() => navigate("/add-income")}
      >
        <ArrowDownCircleIcon className="w-6 h-6 mb-1" />
        <span className="text-xs">Income</span>
      </button>

      <input
        type="file"
        accept="image/*,application/pdf"
        ref={fileInputRef}
        className="hidden"
        onChange={handleImageSelect}
        id="upload-receipt"
      />
      <button
        className="flex items-center justify-center w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg -mt-20 mx-4 transition-transform transform hover:scale-105"
        onClick={() => fileInputRef.current.click()}
      >
        <CameraIcon className="w-8 h-8" />
      </button>

      <button
        className="flex flex-col items-center text-gray-700 hover:text-red-600 transition-colors -mt-10"
        onClick={() => navigate("/add-expense")}
      >
        <ArrowUpCircleIcon className="w-6 h-6 mb-1" />
        <span className="text-xs">Expense</span>
      </button>
      <button
        className="flex flex-col items-center text-gray-700 hover:text-purple-600 transition-colors -mt-10"
        onClick={() => navigate("/dashboard")}
      >
        <LayoutDashboardIcon className="w-6 h-6 mb-1" />
        <span className="text-xs">Dashboard</span>
      </button>
    </div>
  );
};

export default BottomNav;
