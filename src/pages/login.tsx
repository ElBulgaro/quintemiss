import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Debug log for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event, 'Session:', session); // Debug log
      
      if (event === 'SIGNED_IN' && session) {
        console.log('User signed in, redirecting...'); // Debug log
        navigate("/predictions");
      }
      
      if (event === 'SIGNED_OUT') {
        console.log('User signed out'); // Debug log
      }

      // Handle specific auth errors
      if (event === 'PASSWORD_RECOVERY') {
        toast({
          title: "Password Recovery",
          description: "Check your email for the password reset link",
          duration: 5000,
        });
      }
    });

    // Handle URL parameters for auth errors
    const params = new URLSearchParams(location.search);
    const error = params.get('error');
    const error_description = params.get('error_description');
    
    if (error) {
      console.log('Auth error from URL:', error, error_description); // Debug log
      
      let errorMessage = error_description || 'An error occurred during authentication.';
      
      if (error === 'invalid_credentials') {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (error === 'user_already_exists') {
        errorMessage = 'This email is already registered. Please sign in instead.';
      }

      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>{errorMessage}</span>
          </div>
        ),
        duration: 5000,
      });
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location, toast]);

  return (
    <div className="min-h-screen bg-cream pt-24 pb-16">
      <div className="max-w-md mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-rich-black mb-4">
            Welcome Back
          </h1>
          <p className="text-rich-black/60">
            Sign in to save your predictions for Miss France 2024
          </p>
        </div>
        
        <div className="glass-card p-6 rounded-lg">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#D4AF37',
                    brandAccent: '#b79830',
                  },
                },
              },
              className: {
                container: 'auth-container',
                button: 'auth-button',
                input: 'auth-input',
                label: 'auth-label',
              },
            }}
            providers={[]}
            redirectTo={window.location.origin}
            magicLink={true}
            showLinks={true}
            view="sign_in"
            localization={{
              variables: {
                sign_up: {
                  email_label: 'Email',
                  password_label: 'Password',
                  button_label: 'Sign up',
                  loading_button_label: 'Signing up ...',
                  social_provider_text: 'Sign in with {{provider}}',
                  link_text: "Don't have an account? Sign up",
                },
                sign_in: {
                  email_label: 'Email',
                  password_label: 'Password',
                  button_label: 'Sign in',
                  loading_button_label: 'Signing in ...',
                  social_provider_text: 'Sign in with {{provider}}',
                  link_text: "Don't have an account? Sign up",
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}