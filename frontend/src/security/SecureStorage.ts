import SecureLS from "secure-ls";
import { jwtDecode } from "jwt-decode";

const ls = new SecureLS({ encodingType: "aes" });

export const secureStorage = {
  set: (key: string, value: string) => ls.set(key, value),
  get: (key: string) => ls.get(key),
  remove: (key: string) => ls.remove(key),
  clear: () => ls.removeAll(),

  // 1. Check token validity via API
  checkTokenValidity: async (): Promise<boolean> => {
    const token = ls.get("accessToken");
    if (!token) return false;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-token`, {
        method: "POST", // Adjust to GET if your API requires it
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      return data.isValid; // Returns true or false
    } catch (error) {
      return false;
    }
  },

  // 2. Refresh the token
  refreshAccessToken: async () => {
    const refreshToken = ls.get("refreshToken");
    if (!refreshToken) throw new Error("No refresh token");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: refreshToken }),
      });

      if (!response.ok) throw new Error("Refresh failed");

      const data = await response.json();
      ls.set("accessToken", data.newAccessToken);
      return data.newAccessToken;
    } catch (error) {
      // If refresh fails, clear and redirect
      secureStorage.clear();
      window.location.href = "/login";
      return null;
    }
  },

  // 3. Wrapper to ensure you always have a valid token before a request
  getValidToken: async (): Promise<string | null> => {
    const isValid = await secureStorage.checkTokenValidity();

    if (isValid) {
      return ls.get("accessToken");
    }

    // If not valid, try to refresh
    console.log("Token invalid/expired, attempting refresh...");
    return await secureStorage.refreshAccessToken();
  }
};