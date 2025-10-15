import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Check } from "lucide-react";
import carbonScopeLogo from "@/assets/carbonscope-logo.png";

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const email = (document.getElementById("login-email") as HTMLInputElement).value;
    const password = (document.getElementById("login-password") as HTMLInputElement).value;
    try {
          const res = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Login failed");
      }
      const data = await res.json();
      // Save company_id for later API calls
      if (data.company_id) {
        localStorage.setItem("company_id", String(data.company_id));
      }
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Login failed";
          toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError("");
    // Validate password requirements
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return;
    }
    if (!/(?=.*[a-z])/.test(password)) {
      setPasswordError("Password must contain at least one lowercase letter");
      return;
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      setPasswordError("Password must contain at least one uppercase letter");
      return;
    }
    if (!/(?=.*\d)/.test(password)) {
      setPasswordError("Password must contain at least one number");
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    setIsLoading(true);
    // Gather form values
    const company_name = (document.getElementById("signup-company") as HTMLInputElement).value;
    const email = (document.getElementById("signup-email") as HTMLInputElement).value;
    const telephone = (document.getElementById("signup-telephone") as HTMLInputElement).value;
    const location = (document.getElementById("signup-location") as HTMLInputElement).value;
    const business_sector = (document.getElementById("signup-sector") as HTMLInputElement).value;
    try {
      const res = await fetch("http://127.0.0.1:8000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_name, email, telephone, location, business_sector, password })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Signup failed");
      }
      const data = await res.json();
      if (data.company_id) {
        localStorage.setItem("company_id", String(data.company_id));
      }
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Signup failed";
          toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <img src={carbonScopeLogo} alt="Green Innovators" className="h-12 sm:h-16 mb-3 sm:mb-4" />
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground text-center">Green Innovators</h1>
          <p className="text-sm sm:text-base text-muted-foreground text-center mt-2 px-2">
            Carbon emissions monitoring and predictive analytics
          </p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card>
              <CardHeader className="space-y-1 p-4 sm:p-6">
                <CardTitle className="text-xl sm:text-2xl">Login</CardTitle>
                <CardDescription className="text-sm">Enter your company credentials to access your dashboard</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Company Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="company@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="signup">
            <Card>
              <CardHeader className="space-y-1 p-4 sm:p-6">
                <CardTitle className="text-xl sm:text-2xl">Create Account</CardTitle>
                <CardDescription className="text-sm">Sign up to start monitoring your emissions</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-company">Company Name</Label>
                    <Input
                      id="signup-company"
                      type="text"
                      placeholder="Your Company"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="company@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-telephone">Telephone</Label>
                    <Input
                      id="signup-telephone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-location">Location</Label>
                    <Input
                      id="signup-location"
                      type="text"
                      placeholder="City, Country"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-sector">Business Sector</Label>
                    <Input
                      id="signup-sector"
                      type="text"
                      placeholder="Manufacturing, Energy, etc."
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setShowPasswordRequirements(true)}
                      onBlur={() => setShowPasswordRequirements(false)}
                      required
                    />
                    {showPasswordRequirements && (
                      <div className="text-xs text-muted-foreground space-y-1 mt-2 p-2 sm:p-3 bg-secondary rounded-md">
                        <p className="flex items-center gap-1.5 sm:gap-2">
                          {password.length >= 8 ? (
                            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                          ) : (
                            <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center flex-shrink-0">•</span>
                          )}
                          <span className={password.length >= 8 ? "text-green-600" : ""}>
                            At least 8 characters
                          </span>
                        </p>
                        <p className="flex items-center gap-1.5 sm:gap-2">
                          {/(?=.*[a-z])/.test(password) ? (
                            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                          ) : (
                            <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center flex-shrink-0">•</span>
                          )}
                          <span className={/(?=.*[a-z])/.test(password) ? "text-green-600" : ""}>
                            One lowercase letter
                          </span>
                        </p>
                        <p className="flex items-center gap-1.5 sm:gap-2">
                          {/(?=.*[A-Z])/.test(password) ? (
                            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                          ) : (
                            <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center flex-shrink-0">•</span>
                          )}
                          <span className={/(?=.*[A-Z])/.test(password) ? "text-green-600" : ""}>
                            One uppercase letter
                          </span>
                        </p>
                        <p className="flex items-center gap-1.5 sm:gap-2">
                          {/(?=.*\d)/.test(password) ? (
                            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                          ) : (
                            <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center flex-shrink-0">•</span>
                          )}
                          <span className={/(?=.*\d)/.test(password) ? "text-green-600" : ""}>
                            One number
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                    <Input
                      id="signup-confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  {passwordError && (
                    <p className="text-sm text-destructive">{passwordError}</p>
                  )}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Sign Up"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
