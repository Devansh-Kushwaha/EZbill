import { useState, useEffect } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import BottomNav from "../components/BottomNav";
import { useNavigate } from "react-router-dom";
import getValidAccessToken from "../utils/getValidAccessToken";

function AddIncomePage() {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [category, setCategory] = useState("");
  const navigate = useNavigate();

  const categories = ["Shopping", "Food", "Beverages", "Cosmetics", "Bill"];

  // Set default current date and time
  useEffect(() => {
    const now = new Date();
    setDate(now.toISOString().slice(0, 10)); // YYYY-MM-DD
    setTime(now.toTimeString().slice(0, 5)); // HH:MM
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = await getValidAccessToken();

    if (!token) {
      alert("You must be logged in to add a transaction.");
      return;
    }

    const data = {
      amount: Math.abs(parseFloat(amount)),
      category,
      merchant: note,
      date,
      time,
      type: "income",
    };

    const res = await fetch("http://localhost:8000/api/transactions/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      navigate("/dashboard");
    } else {
      alert("Failed to add income.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FED6A3] to-[#FEEBCB] p-6 font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">EZbill</h1>
        <a href="/dashboard" className="text-md font-medium text-blue-600">
          &lt; Back
        </a>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Add Income</h2>

      <div className="bg-[#FFF5E5] rounded-2xl p-6 max-w-xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="rounded-2xl border px-4 py-2"
            required
          />
          <textarea
            placeholder="Note (Optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="rounded-2xl border px-4 py-2 w-full h-24"
          ></textarea>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-2xl border px-4 py-2"
            required
          />
          <Input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="rounded-2xl border px-4 py-2"
            required
          />

          <div className="flex space-x-4 items-center">
            <Button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded-full"
            >
              Submit
            </Button>
          </div>
        </form>
      </div>

      <div className="text-6xl absolute bottom-4 right-4">💸</div>
      <BottomNav />
    </div>
  );
}

export default AddIncomePage;
