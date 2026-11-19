import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { View } from "react-native";

import { AppText } from "@/components/app-text";
import { Button } from "@/components/button";
import { TextField, type TextInputHandle } from "@/components/text-field";
import { useThemeColors } from "@/theme";

import { AuthScreen, AuthSwitchLink } from "./auth-screen";
import { authService, type SocialProvider } from "./mock-auth";
import { PasswordField } from "./password-field";
import { SocialButtons } from "./social-buttons";
import { validateEmail, validateName, validatePassword } from "./validation";

type Field = "name" | "email" | "password";

export function SignUpForm() {
  const colors = useThemeColors();
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
    try {
      await authService.signUp({ name: values.name.trim(), email: values.email.trim(), password: values.password });
      router.push({ pathname: "/verify", params: { email: values.email.trim() } });
    } catch {
      setFormError("We couldn't create your account. Try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleProvider(provider: SocialProvider) {
    setFormError(null);
    setIsLoading(true);
    try {
      await authService.signInWithProvider(provider);
      router.replace("/home");
    } catch {
      setFormError("We couldn't sign you in. Try again.");
      setIsLoading(false);
    }
  }

  return (
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

      <SocialButtons onPress={handleProvider} disabled={isLoading} />

      <AuthSwitchLink prompt="Already have an account?" linkLabel="Sign in" href="/sign-in" />
    </AuthScreen>
  );
}
