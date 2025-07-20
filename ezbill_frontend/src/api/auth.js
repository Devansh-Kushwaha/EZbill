const BASE_URL = "http://localhost:8000/api"; // Backend URL

// --------------------------LOGIN FUNCTION--------------------------
export async function loginUser(credentials) {
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

// --------------------------REGISTER FUNCTION--------------------------
export async function registerUser(userData) {
  userData.confirm_password = userData.password;
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

// --------------------------LOGOUT FUNCTION--------------------------
export function logout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  window.location.href = "/login";
}
