import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import bcrypt from "bcryptjs";

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Check if username already exists
        const { data: existingUser } = await supabase
          .from('auth_users')
          .select()
          .eq('username', username)
          .single();

        if (existingUser) {
          toast.error("Username already taken");
          setIsLoading(false);
          return;
        }

        // Hash password and create new user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const { data: newUser, error: createError } = await supabase
          .from('auth_users')
          .insert({
            username,
            password_hash: hashedPassword
          })
          .select()
          .single();

        if (createError) throw createError;

        // Create profile for the new user
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: newUser.id,
            username: username,
            is_admin: false
          });

        if (profileError) throw profileError;

        // Set session data in localStorage
        localStorage.setItem('user', JSON.stringify({
          id: newUser.id,
          username: username
        }));

        // Emit auth state change event
        window.dispatchEvent(new Event('auth-state-changed'));

        toast.success("Account created successfully!");
        navigate("/predictions");
      } else {
        // Login flow
        const { data: user, error: loginError } = await supabase
          .from('auth_users')
          .select()
          .eq('username', username)
          .single();

        if (loginError || !user) {
          toast.error("Invalid username or password");
          setIsLoading(false);
          return;
        }

        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        
        if (!isValidPassword) {
          toast.error("Invalid username or password");
          setIsLoading(false);
          return;
        }

        // Set session data in localStorage
        localStorage.setItem('user', JSON.stringify({
          id: user.id,
          username: username
        }));

        // Emit auth state change event
        window.dispatchEvent(new Event('auth-state-changed'));

        toast.success("Logged in successfully!");
        navigate("/predictions");
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream pt-24 pb-16">
      <div className="max-w-md mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-rich-black mb-4">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-rich-black/60">
            {isSignUp 
              ? "Sign up to start making predictions for Miss France 2024"
              : "Sign in to save your predictions for Miss France 2024"}
          </p>
        </div>
        
        <div className="glass-card p-6 rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Choose a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : (isSignUp ? "Sign Up" : "Sign In")}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-rich-black/60 hover:text-rich-black"
            >
              {isSignUp 
                ? "Already have an account? Sign in" 
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}