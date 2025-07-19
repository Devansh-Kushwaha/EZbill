// src/pages/ReceiptPreviewPage.jsx

import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ReceiptPreviewPage = () => {
  const [imageData, setImageData] = useState(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState("");
  const categories = ["Shopping", "Food", "Beverages", "Cosmetics", "Bill"];
  const navigate = useNavigate();

  useEffect(() => {
    const data = localStorage.getItem("receiptImage");
    if (!data) return navigate("/log");

    setImageData(data);
    uploadReceipt(data);
  }, []);

  const uploadReceipt = async (base64) => {
    try {
      const blob = await fetch(base64).then(res => res.blob());
      const formData = new FormData();
      formData.append("file", blob, "receipt.png");

      const res = await axios.post("http://localhost:8000/api/receipt/upload/", formData);
      setAmount(res.data.amount);
    } catch (err) {
      console.error("Error uploading receipt:", err);
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      await axios.post("http://localhost:8000/api/transactions/", {
        amount: -Math.abs(amount), // Expense
        merchant: note,
        category,
        source: "receipt",
        type: "expense"
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      navigate("/log");
    } catch (err) {
      console.error("Error submitting transaction:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FED6A3] to-[#FEEBCB] p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">EZbill</h1>
        <button onClick={() => navigate(-1)} className="text-sm">&lt; Back</button>
      </div>

      <div className="flex flex-col lg:flex-row justify-center gap-8">
        {/* Preview Section */}
        <div className="bg-[#FFF5E5] rounded-2xl p-6 w-full lg:w-1/2">
          <h2 className="text-xl font-semibold mb-4">Preview</h2>
          {imageData && <img src={imageData} alt="receipt" className="rounded-xl" />}
        </div>

        {/* Form Section */}
        <div className="bg-[#FFF5E5] rounded-2xl p-6 w-full lg:w-1/2 space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Extracted Amount</label>
            <input
              type="number"
              className="w-full p-2 border rounded-xl"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Category Tags</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1 rounded-full border ${
                    category === cat ? "bg-orange-300" : "bg-orange-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <textarea
              placeholder="Note (Optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-2 border rounded-xl"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl shadow-md"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPreviewPage;
