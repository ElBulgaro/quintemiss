import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validatePassword = (value: string) => {
    if (value.length < 6) {
      setPasswordError("Le mot de passe doit contenir au moins 6 caractères");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword(password)) {
      return;
    }

    setIsLoading(true);

    try {
      const email = `${username}@temp.com`;
      const savedPredictions = localStorage.getItem('predictions');
      const predictions = savedPredictions ? JSON.parse(savedPredictions) : [];

      if (isSignUp) {
        // Check if user exists in profiles
        const { data: existingUsers } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', username);

        if (existingUsers && existingUsers.length > 0) {
          toast.error("Ce nom d'utilisateur est déjà pris");
          setIsLoading(false);
          return;
        }

        // Sign up flow with metadata
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username,
            }
          }
        });

        if (signUpError) {
          if (signUpError.message.includes("email_provider_disabled")) {
            toast.error("L'authentification par email n'est pas activée. Veuillez contacter l'administrateur.");
          } else {
            toast.error("Erreur lors de l'inscription: " + signUpError.message);
          }
          setIsLoading(false);
          return;
        }

        // After successful signup, try to sign in immediately
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          toast.error("Compte créé mais erreur lors de la connexion automatique. Veuillez vous connecter manuellement.");
          setIsSignUp(false);
          setIsLoading(false);
          return;
        }

        // If there were predictions stored locally, save them to the database
        if (predictions.length > 0) {
          const { error: predictionError } = await supabase
            .from('predictions')
            .insert({
              user_id: signUpData.user?.id,
              predictions: predictions,
              submitted_at: new Date().toISOString(),
            });

          if (predictionError) {
            console.error('Error saving predictions:', predictionError);
            toast.error("Erreur lors de la sauvegarde des prédictions");
          }
        }

        toast.success("Compte créé avec succès!");
        navigate("/predictions");
      } else {
        // For login, first check if the user exists
        const { data: existingUsers } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', username);

        if (!existingUsers || existingUsers.length === 0) {
          toast.error("Ce nom d'utilisateur n'existe pas");
          setIsLoading(false);
          return;
        }

        // Sign in flow
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          if (signInError.message.includes("Invalid login credentials")) {
            toast.error("Mot de passe incorrect");
          } else if (signInError.message.includes("email_provider_disabled")) {
            toast.error("L'authentification par email n'est pas activée. Veuillez contacter l'administrateur.");
          } else {
            toast.error("Erreur lors de la connexion: " + signInError.message);
          }
          setIsLoading(false);
          return;
        }

        toast.success("Connexion réussie!");
        navigate("/predictions");
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream pt-24 pb-16">
      <div className="max-w-md mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-rich-black mb-4">
            {isSignUp ? "Créer un compte" : "Connexion"}
          </h1>
          <p className="text-rich-black/60">
            {isSignUp 
              ? "Inscrivez-vous pour commencer à faire vos prédictions"
              : "Connectez-vous pour sauvegarder vos prédictions"}
          </p>
        </div>
        
        <div className="glass-card p-6 rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nom d'utilisateur</Label>
              <Input
                id="username"
                placeholder="Choisissez un nom d'utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="Choisissez un mot de passe"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  validatePassword(e.target.value);
                }}
                required
              />
              {passwordError && (
                <p className="text-sm text-red-500 mt-1">{passwordError}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading || !!passwordError}
            >
              {isLoading ? "Chargement..." : (isSignUp ? "S'inscrire" : "Se connecter")}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-rich-black/60 hover:text-rich-black"
            >
              {isSignUp 
                ? "Déjà un compte ? Connectez-vous" 
                : "Pas encore de compte ? Inscrivez-vous"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}