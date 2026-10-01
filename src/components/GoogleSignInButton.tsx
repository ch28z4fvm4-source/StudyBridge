import { jwtDecode } from "jwt-decode";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { isGoogleConfigured } from "../lib/auth";

interface GoogleJwtPayload {
  sub: string;
  name: string;
  email: string;
  picture?: string;
}

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

export default function GoogleSignInButton({ onSuccess, onError }: GoogleSignInButtonProps) {
  const { signIn } = useAuth();

  const finishSignIn = (profile: {
    id: string;
    name: string;
    email: string;
    picture?: string;
  }) => {
    signIn({ ...profile, provider: "google", emailVerified: false });
    onSuccess?.();
  };

  const handleSuccess = (response: CredentialResponse) => {
    if (!response.credential) {
      onError?.("Google did not return a sign-in credential.");
      return;
    }

    try {
      const profile = jwtDecode<GoogleJwtPayload>(response.credential);
      finishSignIn({
        id: profile.sub,
        name: profile.name,
        email: profile.email,
        picture: profile.picture,
      });
    } catch {
      onError?.("Could not read your Google profile.");
    }
  };

  if (!isGoogleConfigured) {
    return null;
  }

  return (
    <div className="sso-btn-wrap sso-btn-wrap-google">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => onError?.("Google sign-in was cancelled or failed.")}
        useOneTap={false}
        theme="outline"
        size="large"
        text="continue_with"
        shape="rectangular"
        width="360"
        logo_alignment="left"
      />
    </div>
  );
}
