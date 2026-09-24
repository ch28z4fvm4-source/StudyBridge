import { useCallback, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../context/AuthContext";
import { appleClientId, appleRedirectUri, isAppleConfigured } from "../lib/auth";

interface AppleJwtPayload {
  sub: string;
  email?: string;
}

interface AppleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

export default function AppleSignInButton({ onSuccess, onError }: AppleSignInButtonProps) {
  const { signIn, signInWithDemo } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAppleConfigured) {
      setReady(true);
      return;
    }

    const initApple = () => {
      if (!window.AppleID) return false;
      window.AppleID.auth.init({
        clientId: appleClientId,
        scope: "name email",
        redirectURI: appleRedirectUri,
        usePopup: true,
      });
      setReady(true);
      return true;
    };

    if (initApple()) return;

    const interval = window.setInterval(() => {
      if (initApple()) window.clearInterval(interval);
    }, 200);

    return () => window.clearInterval(interval);
  }, []);

  const finishSignIn = useCallback(
    (profile: { id: string; name: string; email: string }) => {
      signIn({ ...profile, provider: "apple", emailVerified: false });
      onSuccess?.();
    },
    [onSuccess, signIn],
  );

  const handleAppleSignIn = useCallback(async () => {
    if (!isAppleConfigured) {
      signInWithDemo("apple");
      onSuccess?.();
      return;
    }

    if (!window.AppleID) {
      onError?.("Apple Sign In is still loading. Try again in a moment.");
      return;
    }

    try {
      const response = await window.AppleID.auth.signIn();
      const payload = jwtDecode<AppleJwtPayload>(response.authorization.id_token);
      const first = response.user?.name?.firstName ?? "";
      const last = response.user?.name?.lastName ?? "";
      const name = [first, last].filter(Boolean).join(" ") || "Apple User";
      const email = response.user?.email ?? payload.email ?? "hidden@privaterelay.appleid.com";

      finishSignIn({ id: payload.sub, name, email });
    } catch {
      onError?.("Apple sign-in was cancelled or failed.");
    }
  }, [finishSignIn, onError, onSuccess, signInWithDemo]);

  return (
    <button
      type="button"
      className="sso-btn sso-btn-apple"
      onClick={handleAppleSignIn}
      disabled={!ready}
    >
      <AppleIcon />
      Continue with Apple
    </button>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 814 1000" aria-hidden="true">
      <path
        fill="currentColor"
        d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-163.7-39.5c-76 0-102.7 40.8-165.9 40.8s-105.8-57-155.5-127.4C46 790.7 0 663 0 541.8c0-194.3 126.4-297.5 250.8-297.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"
      />
    </svg>
  );
}
