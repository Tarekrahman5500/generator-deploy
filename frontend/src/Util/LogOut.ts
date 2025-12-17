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
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const data = await response.json();
      toast.error(data.message || "Logout failed", {
        style: {
          background: "#ff0000", // your custom red
          color: "#fff",
          borderRadius: "10px",
          padding: "12px 16px",
        },
      });
      return;
    }

    secureStorage.clear();
    toast.success("Logged out successfully!", {
      style: {
        background: "#326e12", // your custom red
        color: "#fff",
        borderRadius: "10px",
        padding: "12px 16px",
      },
    });
    window.location.replace("/login");
  } catch (error) {
    console.error(error);
    toast.error("Something went wrong!", {
      style: {
        background: "#ff0000", // your custom red
        color: "#fff",
        borderRadius: "10px",
        padding: "12px 16px",
      },
    });
  }
};
