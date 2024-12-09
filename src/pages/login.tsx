import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Handle auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', { event, session });

      if (event === 'SIGNED_IN' && session) {
        console.log('User signed in, redirecting...');
        navigate("/predictions");
        return;
      }
    });

    // Parse error from URL if present
    const params = new URLSearchParams(location.search);
    const error = params.get('error');
    const errorDescription = params.get('error_description');

    if (error) {
      console.log('Auth error:', { error, errorDescription });
      handleAuthError(error, errorDescription);
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location, toast]);

  const handleAuthError = (error: string, errorDescription: string | null) => {
    let title = 'Authentication Error';
    let description = errorDescription || 'An error occurred during authentication.';

    switch (error) {
      case 'user_already_exists':
        title = 'Account Exists';
        description = 'This email is already registered. Please sign in instead.';
        break;
      case 'invalid_credentials':
        title = 'Invalid Credentials';
        description = 'Invalid email or password. Please try again.';
        break;
      case 'user_not_found':
        title = 'Account Not Found';
        description = 'No account found with these credentials. Please sign up.';
        break;
    }

    toast({
      variant: "destructive",
      title,
      description: (
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>{description}</span>
        </div>
      ),
      duration: 5000,
    });
  };

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
          />
        </div>
      </div>
    </div>
  );
}