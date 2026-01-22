import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import loginBg from "@/assets/login-bg.jpg";
import marexis from "@/assets/meraxis.png";
import { secureStorage } from "@/security/SecureStorage";
import { Loader2 } from "lucide-react";
const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Simple validation
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      setLoading(true);
      const url = `${import.meta.env.VITE_API_URL}/auth/login`;
      const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      };
      const response = await fetch(url, options);

      const data = await response.json();

      if (!response.ok) {
        toast.error(
          data.statusCode === 901 && Array.isArray(data?.errors)
            ? data?.errors[0]?.message
            : data.message,
          {
            style: {
              background: "#ff0000", // your custom red
              color: "#fff",
              borderRadius: "10px",
              padding: "12px 16px",
            },
          },
        );
        return;
      }

      const { tokens } = data;
      if (!tokens?.accessToken) {
        toast.error("Invalid login response", {
          style: {
            background: "#ff0000", // your custom red
            color: "#fff",
            borderRadius: "10px",
            padding: "12px 16px",
          },
        });
        return;
      }

      // Save tokens securely
      secureStorage.set("userInfo", tokens.admin.userName);
      secureStorage.set("accessToken", tokens.accessToken);
      secureStorage.set("refreshToken", tokens.refreshToken);

      toast.success("Login successful!", {
        style: {
          background: "#326e12", // your custom red
          color: "#fff",
          borderRadius: "10px",
          padding: "12px 16px",
        },
      });
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error(
        error.statusCode === 901 && Array.isArray(error?.errors)
          ? error?.errors[0]?.message
          : error.message,
        {
          style: {
            background: "#ff0000", // your custom red
            color: "#fff",
            borderRadius: "10px",
            padding: "12px 16px",
          },
        },
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <Link to="/home">
              <img
                src={marexis}
                style={{ height: "50%", width: "50%", cursor: "pointer" }}
              />
            </Link>
          </div>

          {/* Welcome Text */}
          <div className="space-y-2">
            <h1 className="text-4xl font-heading font-bold text-foreground">
              Welcome Back
            </h1>
            <p className="text-muted-foreground">
              Please enter your details to sign in.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email / Username
              </Label>
              <Input
                id="email"
                type="text"
                placeholder="Enter your email or username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              {/* <Link
                to="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot Password?
              </Link> */}
            </div>
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold bg-[#163859] hover:bg-[#163859] flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Log In
                </>
              ) : (
                "Login"
              )}
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center"></div>
            </div>
          </form>
        </div>
      </div>

      {/* Right side - Background Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src={loginBg}
          alt="Industrial machinery"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default Login;
