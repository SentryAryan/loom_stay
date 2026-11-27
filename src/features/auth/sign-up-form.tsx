import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { View } from "react-native";

import { AppText } from "@/components/app-text";
import { Button } from "@/components/button";
import { TextField, type TextInputHandle } from "@/components/text-field";
import { posthog } from "@/config/posthog";
import { useThemeColors } from "@/theme";

import { AuthScreen, AuthSwitchLink } from "./auth-screen";
import { PasswordField } from "./password-field";
import { SigningInOverlay } from "./signing-in-overlay";
import { SocialButtons } from "./social-buttons";
import { useGoogleSignIn } from "./use-google-sign-in";
import { useSignUpFlow } from "./use-sign-up-flow";
import { validateEmail, validateName, validatePassword } from "./validation";

type Field = "name" | "email" | "password";

export function SignUpForm() {
  const colors = useThemeColors();
  const { start } = useSignUpFlow();
  const { signInWithGoogle, isFinishing } = useGoogleSignIn();
  const emailRef = useRef<TextInputHandle>(null);
  const passwordRef = useRef<TextInputHandle>(null);
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [touched, setTouched] = useState<Record<Field, boolean>>({ name: false, email: false, password: false });
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const errors: Record<Field, string | null> = {
    name: validateName(values.name),
    email: validateEmail(values.email),
    password: validatePassword(values.password),
  };
  const visibleError = (field: Field) => (touched[field] || submitted ? errors[field] : null);
  const setValue = (field: Field) => (text: string) => setValues((current) => ({ ...current, [field]: text }));
  const markTouched = (field: Field) => () => setTouched((current) => ({ ...current, [field]: true }));

  async function handleSubmit() {
    setSubmitted(true);
    setFormError(null);
    if (errors.name || errors.email || errors.password) return;
    setIsLoading(true);
    const email = values.email.trim();
    const message = await start({ name: values.name, email, password: values.password });
    setIsLoading(false);
    if (message) {
      setFormError(message);
      return;
    }
    posthog?.capture("account_sign_up_started", { method: "password" });
    posthog?.logger.info("account sign-up started", { auth_method: "password" });
    router.push({ pathname: "/verify", params: { email } });
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
    <AuthScreen
      title={"Create\nyour account"}
      body="Join Loom Stay to save your stays, get personalized recommendations and access them across all your devices."
    >
      <View className="gap-md">
        <TextField
          label="Full name"
          icon="person-outline"
          placeholder="e.g. Adrian Hajdin"
          value={values.name}
          onChangeText={setValue("name")}
          onBlur={markTouched("name")}
          error={visibleError("name")}
          editable={!isLoading}
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
          onSubmitEditing={() => emailRef.current?.focus()}
        />
        <TextField
          ref={emailRef}
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
          placeholder="At least 8 characters"
          value={values.password}
          onChangeText={setValue("password")}
          onBlur={markTouched("password")}
          error={visibleError("password")}
          editable={!isLoading}
          autoComplete="new-password"
          textContentType="newPassword"
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
        title="Create account"
        size="lg"
        loading={isLoading}
        onPress={handleSubmit}
        trailing={<Ionicons name="arrow-forward" size={22} color={colors.onPrimaryContainer} />}
      />

      <SocialButtons onGooglePress={handleGoogle} disabled={isLoading} />

      {/* Clerk's bot protection mounts its challenge here. */}
      <View nativeID="clerk-captcha" />

      <AuthSwitchLink prompt="Already have an account?" linkLabel="Sign in" href="/sign-in" />
    </AuthScreen>
    {isFinishing ? <SigningInOverlay /> : null}
    </>
  );
}
