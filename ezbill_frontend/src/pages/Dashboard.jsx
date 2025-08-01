import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import BottomNav from "../components/BottomNav";
import {
    ShoppingCartIcon,
    ShoppingBagIcon,
    TagIcon,
    CakeIcon,
    BeakerIcon,
    SparklesIcon,
    ReceiptPercentIcon
} from '@heroicons/react/24/outline';
import getValidAccessToken from "../utils/getValidAccessToken";

export default function DashboardPage() {
    const [data, setData] = useState(null);
    const [incomeVsExpenseData, setIncomeVsExpenseData] = useState([]);
    const [username, setUsername] = useState("");
    const navigate = useNavigate();
    const pieColors = ["#FF6384", "#36A2EB", "#FFCE56", "#8BC34A", "#FFA726", "#BA68C8", "#4DB6AC"];

    useEffect(() => {
        async function fetchChartData() {

            // Fetch income vs expense data for the last 30 days
            try {
                const token = await getValidAccessToken();
                const res = await fetch("http://localhost:8000/api/transactions/income-vs-expense/", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
                const chartJson = await res.json();
                setIncomeVsExpenseData(chartJson.map(entry => {
                    const dateOnly = entry.date.split('T')[0];
                    return {
                        ...entry,
                        date: dateOnly,
                        income: parseFloat(entry.income),
                        expense: parseFloat(entry.expense),
                    };
                }));

            } catch (error) {
                console.error("Failed to fetch chart data:", error.message);
            }
        }

        fetchChartData();

        // Fetch dashboard data
        async function fetchData() {
            try {
                const token = await getValidAccessToken();
                const res = await fetch("http://localhost:8000/api/transactions/dashboard/", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}: ${await res.text()}`);
                }

                const json = await res.json();
                setData(json);
                setUsername(json.username);
            } catch (error) {
                console.error("Failed to fetch dashboard:", error.message);
                setData({
                    current_balance: 0,
                    monthly_income: 0,
                    monthly_expense: 0,
                    transactions_by_day: {},
                    weekly_analytics: [
                        { date: '2025-07-14', amount: 0 },
                        { date: '2025-07-15', amount: 0 },
                        { date: '2025-07-16', amount: 0 },
                        { date: '2025-07-17', amount: 0 },
                        { date: '2025-07-18', amount: 0 },
                        { date: '2025-07-19', amount: 0 },
                        { date: '2025-07-20', amount: 0 },
                    ],
                });
            }
        }

        fetchData();
    }, []);

    if (!data) return <p className="flex items-center justify-center min-h-screen bg-gray-100 text-xl font-semibold">Loading dashboard...</p>;

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'Shopping':
                return <ShoppingCartIcon className="w-5 h-5 text-gray-600" />;
            case 'Food':
                return <CakeIcon className="w-5 h-5 text-gray-600" />;
            case 'Beverages':
                return <BeakerIcon className="w-5 h-5 text-gray-600" />;
            case 'Cosmetics':
                return <SparklesIcon className="w-5 h-5 text-gray-600" />;
            case 'Bill':
                return <ReceiptPercentIcon className="w-5 h-5 text-gray-600" />;
            default:
                return <ShoppingBagIcon className="w-5 h-5 text-gray-600" />;
        }
    };

    const getDayOfWeek = (dateString) => {
        const date = new Date(dateString);
        const options = { weekday: 'short' };
        return date.toLocaleDateString('en-US', options);
    };

    const hasTransactions = Object.keys(data.transactions_by_day).length > 0;
    const hasAnalyticsData = data.weekly_analytics.some(entry => entry.amount > 0);

    return (
        <div className="relative p-6 bg-gradient-to-b from-[#FED6A3] to-[#FEEBCB] min-h-screen rounded-xl font-sans text-gray-800 pb-28">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">EZbill</h1>

            </div>

            <h2 className="mb-6 text-xl font-medium">Welcome {username},</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-lg shadow-md flex flex-col justify-between items-start text-lg">
                    <span className="text-gray-600">Current balance:</span>
                    <span className="font-semibold text-2xl mt-1">₹{data.current_balance.toFixed(2)}</span>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md flex flex-col justify-between items-start text-lg">
                    <span className="text-gray-600">July Income:</span>
                    <span className="font-semibold text-2xl mt-1 text-green-600">₹{data.monthly_income.toFixed(2)}</span>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md flex flex-col justify-between items-start text-lg">
                    <span className="text-gray-600">July Expense:</span>
                    <span className="font-semibold text-2xl mt-1 text-red-600">₹{data.monthly_expense.toFixed(2)}</span>
                </div>

            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 bg-white p-6 rounded-lg shadow-md min-h-[300px] max-h-[400px] overflow-y-auto custom-scrollbar">
                    <h3 className="font-semibold text-xl mb-4 text-gray-700">Recent Transactions</h3>

                    {/* Display transactions grouped by day */}
                    {hasTransactions ? (
                        Object.entries(data.transactions_by_day).map(([date, txs]) => (
                            <div key={date} className="mb-5 last:mb-0">
                                <h4 className="font-bold text-gray-700 mb-3">{date}</h4>
                                {txs.map((tx, idx) => (
                                    <div key={idx} className="flex items-center p-3 mb-3 bg-orange-50 rounded-lg shadow-sm">
                                        <div className="mr-3 p-2 bg-white rounded-full shadow-sm">
                                            {getCategoryIcon(tx.category)}
                                        </div>
                                        <span className="flex-1 font-medium text-lg text-gray-700 capitalize">{tx.category}</span>
                                        <span
                                            className={`font-bold text-lg ${tx.type === "expense" ? "text-red-500" : "text-green-500"
                                                }`}
                                        >
                                            {tx.type === "expense" ? "-" : "+"}₹{Math.abs(tx.amount).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-500 mt-10">
                            <p className="mb-2">No transactions recorded yet.</p>
                            <p>Start by adding your first income or expense!</p>
                        </div>
                    )}
                </div>

                <div className="flex-1 bg-white p-6 rounded-lg shadow-md min-h-[300px] max-h-[500px] overflow-y-auto custom-scrollbar flex flex-col">

                    <h3 className="font-semibold text-xl mb-4 text-gray-700">Analytics: This Week</h3>
                    <div className="flex-grow flex items-end justify-around h-full py-4">
                        {data.weekly_analytics && data.weekly_analytics.length > 0 ? (() => {
                            const maxAmount = Math.max(...data.weekly_analytics.map(e => e.amount), 1); // avoid division by zero
                            return data.weekly_analytics.map((entry) => {
                                const height = (entry.amount / maxAmount) * 100; // normalize to 100px max
                                return (
                                    <div key={entry.date} className="flex flex-col items-center">
                                        <div
                                            className="bg-purple-600 w-6 rounded-t-lg"
                                            style={{
                                                height: `${height}px`,
                                                transition: "height 0.3s ease",
                                            }}
                                        />
                                        <span className="text-xs mt-2 text-gray-600 font-medium">{getDayOfWeek(entry.date)}</span>
                                    </div>
                                );
                            });
                        })() : (
                            Array.from({ length: 7 }).map((_, i) => {
                                const today = new Date();
                                today.setDate(today.getDate() - (6 - i));
                                return (
                                    <div key={i} className="flex flex-col items-center">
                                        <div className="bg-gray-300 w-6 rounded-t-lg" style={{ height: `20px` }} />
                                        <span className="text-xs mt-2 text-gray-400 font-medium">
                                            {today.toLocaleDateString('en-US', { weekday: 'short' })}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {!hasAnalyticsData && (
                        <div className="text-center text-gray-500 mt-4">
                            <p>No analytics data for this week.</p>
                        </div>
                    )}
                </div>
            </div>

            {data.monthly_expense_chart && data.monthly_expense_chart.length > 0 && (
                <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
                    <h3 className="font-semibold text-xl mb-4 text-gray-700">Monthly Expense Breakdown</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={data.monthly_expense_chart.map(item => ({
                                    ...item,
                                    category: item.category && item.category.trim() ? item.category : "Miscellaneous"
                                }))}
                                dataKey="amount"
                                nameKey="category"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                label
                            >
                                {data.monthly_expense_chart.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                                ))}
                            </Pie>

                            <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}

            {incomeVsExpenseData.length > 0 && (

                <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
                    <h3 className="font-semibold text-xl mb-4 text-gray-700">Income vs Expense (Last 30 Days)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={incomeVsExpenseData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                            <YAxis />
                            <Tooltip formatter={(value) => `$${value}`} />
                            <Legend />
                            <Line type="monotone" dataKey="income" stroke="#10B981" name="Income" />
                            <Line type="monotone" dataKey="expense" stroke="#EF4444" name="Expense" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            <div className="absolute bottom-32 left-6 w-24 h-24 bg-cover bg-center" style={{ backgroundImage: "url('/path/to/your/money_character.png')" }}>
                <BottomNav />
            </div>


            <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #facc15;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #eab308;
        }
      `}</style>
        </div>
    );
}
