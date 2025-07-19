// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import { Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard"; // 
import AddExpensePage from "./pages/AddExpensePage"; 
import AddIncomePage from "./pages/AddIncomePage";
import AddTransferPage from "./pages/AddTransferPage";
import LogPage from "./pages/LogPage";
import ReceiptPreviewPage from "./pages/ReceiptPreviewPage"; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<AuthPage type="login" />} />
        <Route path="/signup" element={<AuthPage type="signup" />} />
        <Route
          path="/dashboard"
          element={
            localStorage.getItem("accessToken") ? (
              <Dashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/add-expense" element={<AddExpensePage />} />
<Route path="/add-income" element={<AddIncomePage />} />
<Route path="/add-transfer" element={<AddTransferPage />} />
<Route path="/log" element={<LogPage />} />
<Route path="/preview" element={<ReceiptPreviewPage />} />
      </Routes>
    </Router>
  );
}

export default App;
