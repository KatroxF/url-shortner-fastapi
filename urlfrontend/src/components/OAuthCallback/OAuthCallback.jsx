import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      navigate("/login?error=google_auth_failed");
      return;
    }

    if (token) {
      localStorage.setItem("access_token", token);
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  }, [searchParams, navigate]);

  return <p>Signing you in…</p>;
}

export default OAuthCallback;