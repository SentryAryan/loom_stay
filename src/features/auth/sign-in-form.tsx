import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { View } from "react-native";

import { AppText } from "@/components/app-text";
import { Button } from "@/components/button";
import { TextField, type TextInputHandle } from "@/components/text-field";
import { useThemeColors } from "@/theme";

import { AuthScreen, AuthSwitchLink } from "./auth-screen";
import { PasswordField } from "./password-field";
import { SigningInOverlay } from "./signing-in-overlay";
import { SocialButtons } from "./social-buttons";
import { useGoogleSignIn } from "./use-google-sign-in";
import { useSignInFlow } from "./use-sign-in-flow";
import { validateEmail, validatePassword } from "./validation";

type Field = "email" | "password";

export function SignInForm() {
  const colors = useThemeColors();
  const { signInWithPassword } = useSignInFlow();
  const { signInWithGoogle, isFinishing } = useGoogleSignIn();
  const passwordRef = useRef<TextInputHandle>(null);
  const [values, setValues] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState<Record<Field, boolean>>({ email: false, password: false });
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const errors: Record<Field, string | null> = {
    email: validateEmail(values.email),
    password: validatePassword(values.password),
  };
  const visibleError = (field: Field) => (touched[field] || submitted ? errors[field] : null);
  const setValue = (field: Field) => (text: string) => setValues((current) => ({ ...current, [field]: text }));
  const markTouched = (field: Field) => () => setTouched((current) => ({ ...current, [field]: true }));

  async function handleSubmit() {
    setSubmitted(true);
    setFormError(null);
    if (errors.email || errors.password) return;
    setIsLoading(true);
    const email = values.email.trim();
    const { error, needsDeviceCode } = await signInWithPassword(email, values.password);
    setIsLoading(false);
    if (error) {
      setFormError(error);
      return;
    }
    // New device: Clerk emailed a code. Success otherwise is handled by the route guards.
    if (needsDeviceCode) router.push({ pathname: "/verify", params: { email, mode: "device" } });
  }

  async function handleGoogle() {
    setFormError(null);
    setIsLoading(true);
    const message = await signInWithGoogle();
    setIsLoading(false);
    if (message) setFormError(message);
  }

  return (
    <>
    <AuthScreen title={"Welcome\nback"} body="Sign in to pick up your saved stays and recommendations where you left off.">
      <View className="gap-md">
        <TextField
          label="Email address"
          icon="mail-outline"
          placeholder="you@example.com"
          value={values.email}
          onChangeText={setValue("email")}
          onBlur={markTouched("email")}
          error={visibleError("email")}
          editable={!isLoading}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
        />
        <PasswordField
          ref={passwordRef}
          placeholder="Your password"
          value={values.password}
          onChangeText={setValue("password")}
          onBlur={markTouched("password")}
          error={visibleError("password")}
          editable={!isLoading}
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={handleSubmit}
        />
      </View>

      {formError ? (
        <AppText variant="bodyMd" className="text-error" accessibilityLiveRegion="polite">
          {formError}
        </AppText>
      ) : null}

      <Button
        title="Sign in"
        size="lg"
        loading={isLoading}
        onPress={handleSubmit}
        trailing={<Ionicons name="arrow-forward" size={22} color={colors.onPrimaryContainer} />}
      />

      <SocialButtons onGooglePress={handleGoogle} disabled={isLoading} />

      <AuthSwitchLink prompt="New to Loom Stay?" linkLabel="Create account" href="/sign-up" />
    </AuthScreen>
    {isFinishing ? <SigningInOverlay /> : null}
    </>
  );
}
