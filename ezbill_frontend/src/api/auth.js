const BASE_URL = "http://localhost:8000/api"; // Update to your backend URL

export async function loginUser(credentials) {
  console.log("Login credentials sent:", credentials);
  const res = await fetch(`${BASE_URL}/users/login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!res.ok) {
    throw new Error("Login failed");
  }

  return res.json(); // Returns { access, refresh }
}

export async function registerUser(userData) {
  console.log("User data sent:", userData)
  userData.confirm_password=userData.password;
  const res = await fetch(`${BASE_URL}/users/register/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
    
  });

  if (!res.ok) {
    throw new Error("Signup failed");
  }

  return res.json(); // Can return success message
}

export function getAuthHeaders() {
  const token = localStorage.getItem("accessToken");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export function logout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  window.location.href = "/login";
}
