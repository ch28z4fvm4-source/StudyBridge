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
  const { signIn, signInWithDemo } = useAuth();

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

  const handleDemo = () => {
    signInWithDemo("google");
    onSuccess?.();
  };

  if (!isGoogleConfigured) {
    return (
      <button type="button" className="sso-btn sso-btn-google" onClick={handleDemo}>
        <GoogleIcon />
        Continue with Google
      </button>
    );
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

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c3.42-3.15 5.37-7.78 5.37-13.275z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}
