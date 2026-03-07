import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { loginSchema } from "@/shared/schema";
import { LogIn, UserPlus, Gamepad2 } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, loginWithDiscord, loginAsGuest, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ username, password });
    if (!parsed.success) {
      toast({
        title: "Validation Error",
        description: parsed.error.issues[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await login(username, password);
      toast({ title: "Welcome back!", description: `Logged in as ${username}` });
      navigate("/");
    } catch (err) {
      toast({
        title: "Login Failed",
        description: err instanceof Error ? err.message : "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuest = async () => {
    setIsSubmitting(true);
    try {
      await loginAsGuest();
      toast({ title: "Welcome!", description: "Playing as guest" });
      navigate("/");
    } catch (err) {
      toast({
        title: "Guest Login Failed",
        description: err instanceof Error ? err.message : "Could not create guest session",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
      <Card className="w-full max-w-md border-gray-700 bg-gray-900/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-2">
          <img
            src="https://framerusercontent.com/images/3XwBBaY5Sv2nUacebkTDBMDc.png"
            alt="Grudge Studio"
            className="w-16 h-16 mx-auto object-contain"
          />
          <CardTitle className="text-2xl text-white">
            Sign in to <span className="text-orange-500">GrudgeStudio</span>
          </CardTitle>
          <p className="text-gray-400 text-sm">
            Access your account, projects, and game services
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Discord OAuth */}
          <Button
            onClick={loginWithDiscord}
            className="w-full bg-[#5865F2] hover:bg-[#4752c4] text-white"
            size="lg"
            disabled={isSubmitting}
          >
            <i className="fab fa-discord mr-2" />
            Continue with Discord
          </Button>

          <div className="relative">
            <Separator className="bg-gray-700" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900 px-3 text-xs text-gray-500 uppercase">
              or sign in with credentials
            </span>
          </div>

          {/* Username / Password */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-gray-300">
                Username
              </Label>
              <Input
                id="username"
                placeholder="your_username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                autoComplete="username"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-gray-300">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                autoComplete="current-password"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              size="lg"
              disabled={isSubmitting}
            >
              <LogIn className="w-4 h-4 mr-2" />
              {isSubmitting ? "Signing in…" : "Sign In"}
            </Button>
          </form>

          <Separator className="bg-gray-700" />

          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              onClick={handleGuest}
              disabled={isSubmitting}
            >
              <Gamepad2 className="w-4 h-4 mr-2" />
              Play as Guest
            </Button>

            <p className="text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <Link href="/register" className="text-orange-500 hover:text-orange-400 font-medium">
                Create one
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
