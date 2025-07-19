// src/pages/AuthPage.jsx
import { useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { loginUser, registerUser } from "../api/auth";
export default function AuthPage({ type = "login" }) {
  const isLogin = type === "login";
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    ...(isLogin ? {} : { confirmPassword: "" }),
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    try {
        if (isLogin) {
        formData.username='devansh'
        const tokens = await loginUser(formData);
        localStorage.setItem("accessToken", tokens.access);
        console.log("Login successful", tokens);
      localStorage.setItem("refreshToken", tokens.refresh); 
      window.location.href = "/dashboard";
        } else {
        await registerUser(formData);
        window.location.href = "/login"; // Redirect after signup
        }
    } catch (error) {
        alert(error.message); // Better: show error UI
}
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-sky-100 to-indigo-100 p-4">
      <Card className="max-w-sm w-full">
        <CardContent>
          <h2 className="text-2xl font-bold mb-6 text-center">
            {isLogin ? "Welcome Back!" : "Create an Account"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <Input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {!isLogin && (
              <Input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            )}
            <Button type="submit" className="w-full">
              {isLogin ? "Login" : "Sign Up"}
            </Button>
          </form>
          <div className="text-sm text-center mt-4 text-gray-500">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <a
              href={isLogin ? "/signup" : "/login"}
              className="text-blue-600 font-medium hover:underline"
            >
              {isLogin ? "Sign up" : "Login"}
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
