// src/pages/ReceiptPreviewPage.jsx

import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const ReceiptPreviewPage = () => {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState("");
  const [fileUrl, setFileUrl] = useState(null);
  const [fileType, setFileType] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const categories = ["Shopping", "Food", "Beverages", "Cosmetics", "Bill"];

  useEffect(() => {
    const file = location.state?.file;

    if (!file) {
      navigate("/dashboard");
      return;
    }

    const type = file.type;

    setFileUrl(URL.createObjectURL(file));
    setFileType(type);
    uploadReceipt(file);
  }, []);

  const uploadReceipt = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post("http://localhost:8000/api/receipt/upload/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setAmount(res.data.amount);
    } catch (err) {
      console.error("Error uploading receipt:", err.response?.data || err.message);
      alert("Failed to process receipt. Please try again.");
      navigate("/dashboard");
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      await axios.post(
        "http://localhost:8000/api/transactions/",
        {
          amount: -Math.abs(amount),
          merchant: note,
          category,
          source: "receipt",
          type: "expense",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      navigate("/dashboard");
    } catch (err) {
      console.error("Error submitting transaction:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FED6A3] to-[#FEEBCB] p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">EZbill</h1>
        <button onClick={() => navigate(-1)} className="text-sm">
          &lt; Back
        </button>
      </div>

      <div className="flex flex-col lg:flex-row justify-center gap-8">
        {/* Preview Section */}
        <div className="bg-[#FFF5E5] rounded-2xl p-6 w-full lg:w-1/2">
          <h2 className="text-xl font-semibold mb-4">Preview</h2>
          {fileUrl && fileType?.startsWith("image") && (
            <img src={fileUrl} alt="receipt" className="rounded-xl" />
          )}
          {fileUrl && fileType === "application/pdf" && (
            <iframe src={fileUrl} title="receipt-pdf" className="w-full h-[400px]" />
          )}
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
