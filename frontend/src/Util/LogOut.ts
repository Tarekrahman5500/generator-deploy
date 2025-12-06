import { secureStorage } from "@/security/SecureStorage";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const handleLogout = async () => {
  const accessToken = secureStorage.get("accessToken");

  if (!accessToken) {
    toast.error("No user logged in");
    return;
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/auth/logout`,
      {
          credentials: 'include',
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const data = await response.json();
      toast.error(data.message || "Logout failed");
      return;
    }

    secureStorage.clear();
    toast.success("Logged out successfully!");
    window.location.replace("/login");
  } catch (error) {
    console.error(error);
    toast.error("Something went wrong!");
  }
};
