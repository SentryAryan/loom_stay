import { AuthPlaceholder } from "@/features/auth/auth-placeholder";

export default function SignIn() {
  return (
    <AuthPlaceholder
      title="Welcome back"
      body="Sign in is coming next, including Continue with Google. For now you can look around as a guest."
      switchTitle="New here? Create an account"
      switchHref="/sign-up"
    />
  );
}
