import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { registerSchema } from "@/shared/schema";
import { UserPlus } from "lucide-react";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, loginWithDiscord, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  if (isAuthenticated) {
    navigate("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = registerSchema.safeParse({ username, email, password, confirmPassword });
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
      await register(username, password, email || undefined);
      toast({ title: "Account Created!", description: `Welcome, ${username}!` });
      navigate("/");
    } catch (err) {
      toast({
        title: "Registration Failed",
        description: err instanceof Error ? err.message : "Could not create account",
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
            Join <span className="text-orange-500">GrudgeStudio</span>
          </CardTitle>
          <p className="text-gray-400 text-sm">
            Create your account to access all platform features
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
            Sign up with Discord
          </Button>

          <div className="relative">
            <Separator className="bg-gray-700" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900 px-3 text-xs text-gray-500 uppercase">
              or create with credentials
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-gray-300">Username</Label>
              <Input
                id="username"
                placeholder="coolplayer42"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                autoComplete="username"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-gray-300">Email (optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                autoComplete="email"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                autoComplete="new-password"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                autoComplete="new-password"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              size="lg"
              disabled={isSubmitting}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {isSubmitting ? "Creating account…" : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-orange-500 hover:text-orange-400 font-medium">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
