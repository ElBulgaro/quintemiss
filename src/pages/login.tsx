import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle } from "lucide-react";
import { Provider } from "@supabase/supabase-js";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [enabledProviders, setEnabledProviders] = useState<Provider[]>([]);

  useEffect(() => {
    // Check which providers are enabled
    const checkEnabledProviders = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error checking auth session:', error);
          return;
        }

        // Since getSettings is not available, we'll try to sign in with each provider
        // to check if they're configured
        const providers: Provider[] = [];
        
        try {
          await supabase.auth.signInWithOAuth({ provider: 'google' });
          providers.push('google');
        } catch (error) {
          console.log('Google auth not configured');
        }
        
        try {
          await supabase.auth.signInWithOAuth({ provider: 'github' });
          providers.push('github');
        } catch (error) {
          console.log('GitHub auth not configured');
        }
        
        setEnabledProviders(providers);
      } catch (error) {
        console.error('Error checking providers:', error);
      }
    };

    checkEnabledProviders();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
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
              <span>This login method hasn't been configured yet. Please use email/password or try another provider.</span>
            </div>
          ),
          duration: 5000,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

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
            providers={enabledProviders}
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