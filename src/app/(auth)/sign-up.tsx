import { AuthPlaceholder } from "@/features/auth/auth-placeholder";

export default function SignUp() {
  return (
    <AuthPlaceholder
      title="Create your account"
      body="Account creation is coming next. For now you can look around as a guest."
      switchTitle="Already have an account? Sign in"
      switchHref="/sign-in"
    />
  );
}
