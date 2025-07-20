import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Importing all the page components for different routes
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";  
import AddExpensePage from "./pages/AddExpensePage"; 
import AddIncomePage from "./pages/AddIncomePage";
// import AddTransferPage from "./pages/AddTransferPage";
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
        <Route
          path="/"
          element={
            localStorage.getItem("accessToken") ? (
              <Navigate to="/dashboard" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/add-expense" element={<AddExpensePage />} />
<Route path="/add-income" element={<AddIncomePage />} />
{/* <Route path="/add-transfer" element={<AddTransferPage />} /> */}
<Route path="/log" element={<LogPage />} />
<Route path="/preview" element={<ReceiptPreviewPage />} />
      </Routes>
    </Router>
  );
}

export default App;
