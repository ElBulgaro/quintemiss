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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event); // Debug log
      
      if (event === 'SIGNED_IN' && session) {
        // Return to predictions page after login
        navigate("/predictions");
      }
      
      if (event === "USER_ERROR" as any) {
        console.log('Auth error event:', event); // Debug log
        
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: (
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span>An error occurred during authentication. Please try again.</span>
            </div>
          ),
          duration: 5000,
        });
      }
    });

    // Handle auth errors from URL parameters
    const params = new URLSearchParams(location.search);
    const error = params.get('error');
    const error_description = params.get('error_description');
    
    if (error === 'user_already_exists') {
      toast({
        variant: "destructive",
        title: "Account Already Exists",
        description: (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>This email is already registered. Please sign in instead.</span>
          </div>
        ),
        duration: 5000,
      });
    } else if (error) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error_description || 'An error occurred during authentication.'}</span>
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
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}