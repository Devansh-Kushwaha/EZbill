// src/utils/getValidAccessToken.js
export default async function getValidAccessToken() {
  const access = localStorage.getItem("accessToken");
  const refresh = localStorage.getItem("refreshToken");

  // 1. Try verifying current access token
  const verifyRes = await fetch("http://localhost:8000/api/token/verify/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: access }),
  });

  if (verifyRes.ok) return access;

  // 2. If not valid, try refreshing
  const refreshRes = await fetch("http://localhost:8000/api/users/refresh/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (refreshRes.ok) {
    const { access: newAccess } = await refreshRes.json();
    localStorage.setItem("accessToken", newAccess);
    return newAccess;
  }

  // 3. Token refresh failed
  alert("Session expired. Please log in again.");
  localStorage.clear();
  window.location.href = "/login";
  return null;
}
