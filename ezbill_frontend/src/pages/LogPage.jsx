import { useState, useEffect } from "react";
import axios from "axios";
import BottomNav from "../components/BottomNav";
import { Slider } from "@mui/material";
// import { useAuth } from "../api/auth"; // assuming a custom hook
import getValidAccessToken from "../utils/getValidAccessToken";
import { useNavigate } from "react-router-dom";

const LogPage = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please choose a PDF file first.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("accessToken");
      await axios.post("http://localhost:8000/api/transactions/upload-receipt/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Transactions extracted and saved!");
      window.location.reload();
    } catch (err) {
      alert("Failed to upload: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([
    "Shopping", "Food", "Beverages", "Cosmetics", "Bill"
  ]);

  const [filters, setFilters] = useState({
    category: "",
    date_min: "",
    date_max: "",
    amount: 5000,
    page: 1,
    type: "",
  });
  const [count, setCount] = useState(0);
  ;
  const navigate = useNavigate();

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const fetchTransactions = async () => {
    try {
      const params = {
        category: filters.category || undefined,
        date_min: filters.date_min || undefined,
        date_max: filters.date_max || undefined,
        ...(filters.amountEnabled
          ? {
            ...(filters.type === "income"
              ? { amount_min: 0, amount_max: filters.amount }
              : filters.type === "expense"
                ? { amount_min: -filters.amount, amount_max: 0 }
                : { amount_min: -filters.amount, amount_max: filters.amount }),
          }
          : {}),
        type: filters.type || undefined,
        page: filters.page
      };
      const token = await getValidAccessToken()

      const res = await axios.get("http://localhost:8000/api/transactions/", {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setTransactions(res.data.results);
      setCount(res.data.count);
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
  };

  const handleSliderChange = (event, newValue) => {
    setFilters(prev => ({ ...prev, amount: newValue }));
  };

  const handlePagination = (dir) => {
    setFilters(prev => ({ ...prev, page: prev.page + dir }));
  };

  return (
    <div className="bg-gradient-to-b from-[#FED6A3] to-[#FEEBCB] min-h-screen font-sans rounded-2xl p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-3xl font-bold">EZbill</h1>
        <button onClick={() => navigate(-1)} className="text-lg text-gray-600 underline">{"< Back"}</button>
      </div>

      {/* Filters */}
      <div className="bg-[#FFF5E5] p-4 rounded-2xl mb-6 space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          <select
            className="p-2 rounded-xl border"
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            value={filters.category}
          >
            <option value="">All Tags</option>
            {categories.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
          <select
            className="p-2 rounded-xl border"
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            value={filters.type}
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <input
            type="date"
            className="p-2 rounded-xl border"
            value={filters.date_min}
            onChange={(e) => setFilters({ ...filters, date_min: e.target.value })}
          />
          <input
            type="date"
            className="p-2 rounded-xl border"
            value={filters.date_max}
            onChange={(e) => setFilters({ ...filters, date_max: e.target.value })}
          />
        </div>

        <div className="flex flex-col">
          <label className="flex items-center space-x-2 mb-2">
            <input
              type="checkbox"
              checked={filters.amountEnabled}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, amountEnabled: e.target.checked }))
              }
            />
            <span className="text-sm">Enable Amount Filter</span>
          </label>

          {filters.amountEnabled && (
            <>
              <label className="text-sm mb-1">
                Amount Range: ₹0 - ₹{filters.amount}
              </label>
              <Slider
                value={filters.amount}
                onChange={(e, value) =>
                  setFilters((prev) => ({ ...prev, amount: value }))
                }
                valueLabelDisplay="on"
                step={100}
                min={0}
                max={13000}
              />
            </>
          )}
        </div>

      </div>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="text-lg font-semibold mb-2">Upload PDF Receipt</h3>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="mb-2"
        />
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          {uploading ? "Processing..." : "Upload & Parse"}
        </button>
      </div>


      {/* Table */}
      <div className="bg-[#FFF5E5] rounded-2xl p-4 overflow-y-auto max-h-[500px]">
        <div className="grid grid-cols-4 font-semibold text-lg border-b pb-2 mb-2">
          <span>Note</span>
          <span>Date</span>
          <span>Tag</span>
          <span>Amount</span>
        </div>
        {transactions.map((tx, index) => (
          <div
            key={index}
            className="grid grid-cols-4 items-center text-md py-2 px-3 mb-1 rounded-2xl bg-[#FBD9B7]"
          >
            <span>{tx.merchant || "-"}</span>
            <span>{tx.date}</span>
            <span>{tx.category}</span>
            <span className={tx.amount < 0 ? "text-red-600" : "text-green-600"}>
              {tx.amount < 0 ? `- $${Math.abs(tx.amount)}` : `+ $${tx.amount}`}
            </span>

          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-between mt-4">
        <button
          onClick={() => handlePagination(-1)}
          disabled={filters.page <= 1}
          className="bg-[#FDB87A] px-4 py-2 rounded-full disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-sm text-gray-700">Page {filters.page}</span>
        <button
          onClick={() => handlePagination(1)}
          disabled={(filters.page * 10) >= count}
          className="bg-[#FDB87A] px-4 py-2 rounded-full disabled:opacity-50"
        >
          Next
        </button>
      </div>
      <div style={{ height: "96px" }} />
      <BottomNav />
    </div>
  );
};

export default LogPage;
