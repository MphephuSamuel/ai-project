import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useI18n } from "@/i18n/useI18n";

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "af", name: "Afrikaans" },
  { code: "zu", name: "Zulu" },
  { code: "xh", name: "Xhosa" },
  { code: "st", name: "Sotho" },
  { code: "tn", name: "Tswana" },
  { code: "ts", name: "Tsonga" },
  { code: "ss", name: "Swati" },
  { code: "ve", name: "Venda" },
  { code: "nr", name: "Ndebele" },
];

// Community endpoints in the shared backend
const COMMUNITY_SIGNUP_URL = "http://127.0.0.1:8000/community/signup";
const COMMUNITY_LOGIN_URL = "http://127.0.0.1:8000/community/login";

const Auth = () => {
  const navigate = useNavigate();
  const { t, setLanguage } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Signup state
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [languageChoice, setLanguageChoice] = useState("en");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleCommunityLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setIsLoading(true);
    const loginEmail = (document.getElementById("login-email") as HTMLInputElement).value;
    const loginPassword = (document.getElementById("login-password") as HTMLInputElement).value;
    try {
      const res = await fetch(COMMUNITY_LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      if (!res.ok) {
        let msg = "Login failed";
        try {
          const data = await res.json();
          msg = data.detail || msg;
        } catch (e) {
          // ignore JSON parse errors
        }
        throw new Error(msg);
      }
      const data = await res.json();
      if (data.user_id) {
        localStorage.setItem("community_user_id", String(data.user_id));
        if (data.language_choice) {
          setLanguage(data.language_choice);
        }
      }
      toast.success(t('auth.loginSuccess') || 'Login successful!');
      navigate("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : (t('auth.loginFailed') || "Login failed");
      setFormError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommunitySignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError("");
    setFormError(null);

    // Basic validations
    if (password.length < 8) {
      setPasswordError(t('auth.password.minLength') || "Password must be at least 8 characters long");
      return;
    }
    if (!/(?=.*[a-z])/.test(password)) {
      setPasswordError(t('auth.password.lowercase') || "Password must contain at least one lowercase letter");
      return;
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      setPasswordError(t('auth.password.uppercase') || "Password must contain at least one uppercase letter");
      return;
    }
    if (!(/(?=.*\d)/.test(password))) {
      setPasswordError(t('auth.password.number') || "Password must contain at least one number");
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError(t('auth.password.mismatch') || "Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(COMMUNITY_SIGNUP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_name: userName,
          email,
          telephone,
          language_choice: languageChoice,
          password,
        }),
      });
      if (!res.ok) {
        let msg = "Signup failed";
        try {
          const data = await res.json();
          msg = data.detail || msg;
        } catch (e) {
          // ignore JSON parse errors
        }
        throw new Error(msg);
      }
      const data = await res.json();
      if (data.user_id) {
        localStorage.setItem("community_user_id", String(data.user_id));
        if (data.language_choice) {
          setLanguage(data.language_choice);
        } else {
          setLanguage(languageChoice);
        }
      }
      toast.success(t('auth.signupSuccess') || "Account created successfully!");
      navigate("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : (t('auth.signupFailed') || "Signup failed");
      setFormError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-start md:items-start justify-center pt-10 md:pt-20 pb-10">
      <div className="w-full container mx-auto px-4 max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-foreground">{t('app.communityName')}</h1>
          <p className="text-sm text-muted-foreground mt-2">{t('auth.subtitle') || 'Login or create an account to track your climate actions'}</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">{t('auth.loginTab')}</TabsTrigger>
            <TabsTrigger value="signup">{t('auth.signupTab')}</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader className="space-y-1 p-6">
                <CardTitle className="text-xl">{t('auth.loginTitle')}</CardTitle>
                <CardDescription>{t('auth.loginSubtitle')}</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                {formError && (
                  <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                    {formError}
                  </div>
                )}
                <form onSubmit={handleCommunityLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">{t('auth.email')}</Label>
                    <Input id="login-email" type="email" placeholder="you@example.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">{t('auth.password')}</Label>
                    <Input id="login-password" type="password" placeholder="••••••••" required />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (t('auth.loggingIn') || 'Logging in...') : t('auth.loginButton')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader className="space-y-1 p-6">
                <CardTitle className="text-xl">{t('auth.signupTitle')}</CardTitle>
                <CardDescription>{t('auth.signupSubtitle')}</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                {formError && (
                  <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                    {formError}
                  </div>
                )}
                <form onSubmit={handleCommunitySignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">{t('auth.name')}</Label>
                    <Input id="signup-name" type="text" placeholder="Your full name" value={userName} onChange={(e) => setUserName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">{t('auth.email')}</Label>
                    <Input id="signup-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-telephone">{t('auth.telephone')}</Label>
                    <Input id="signup-telephone" type="tel" placeholder="+27 00 000 0000" value={telephone} onChange={(e) => setTelephone(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-language">{t('auth.preferredLanguage')}</Label>
                    <select
                      id="signup-language"
                      className="w-full border rounded-md px-3 py-2 bg-background"
                      value={languageChoice}
                      onChange={(e) => setLanguageChoice(e.target.value)}
                    >
                      {LANGUAGES.map((l) => (
                        <option key={l.code} value={l.code}>{l.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">{t('auth.password')}</Label>
                    <Input id="signup-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">{t('auth.confirmPassword')}</Label>
                    <Input id="signup-confirm" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    {passwordError && (
                      <p className="text-xs text-red-600">{passwordError}</p>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (t('auth.creatingAccount') || 'Creating account...') : t('auth.createAccountButton')}
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
