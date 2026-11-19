import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";

import { AppText } from "@/components/app-text";
import { Button } from "@/components/button";

import { AuthScreen } from "./auth-screen";
import { authService } from "./mock-auth";
import { OtpInput } from "./otp-input";
import { isCompleteCode } from "./validation";

const RESEND_SECONDS = 30;

export function VerifyForm() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setTimeout(() => setSecondsLeft((seconds) => seconds - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft]);

  async function verify(value: string) {
    setIsLoading(true);
    setError(null);
    try {
      await authService.verifyCode(value);
      router.replace("/home");
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Something went wrong. Try again.");
      setCode("");
      setIsLoading(false);
    }
  }

  function handleChange(value: string) {
    setCode(value);
    setError(null);
    setNotice(null);
    if (isCompleteCode(value)) verify(value);
  }

  async function handleResend() {
    setError(null);
    setCode("");
    try {
      await authService.resendCode(email ?? "");
      setSecondsLeft(RESEND_SECONDS);
      setNotice("We sent you a new code.");
    } catch {
      setError("We couldn't resend the code. Try again.");
    }
  }

  const canResend = secondsLeft <= 0 && !isLoading;

  return (
    <AuthScreen
      title={"Check\nyour email"}
      body={email ? `We sent a 6-digit code to ${email}. Enter it below to verify your account.` : "Enter the 6-digit code we sent you."}
    >
      <View className="gap-sm">
        <OtpInput value={code} onChange={handleChange} hasError={!!error} disabled={isLoading} />
        {error ? (
          <AppText variant="bodySm" className="px-xs text-error" accessibilityLiveRegion="polite">
            {error}
          </AppText>
        ) : null}
        {notice ? (
          <AppText variant="bodySm" className="px-xs text-on-surface-variant" accessibilityLiveRegion="polite">
            {notice}
          </AppText>
        ) : null}
      </View>

      <Button
        title="Verify"
        size="lg"
        loading={isLoading}
        disabled={!isCompleteCode(code)}
        onPress={() => verify(code)}
      />

      <View className="items-center gap-xs">
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !canResend }}
          disabled={!canResend}
          onPress={handleResend}
          className="min-h-11 justify-center"
        >
          <AppText variant="headlineSm" className={canResend ? "text-on-surface underline" : "text-on-surface-variant"}>
            {canResend ? "Resend code" : `Resend code in ${secondsLeft}s`}
          </AppText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          className="min-h-11 justify-center"
        >
          <AppText variant="bodyMd" className="text-on-surface-variant">
            Use a different email
          </AppText>
        </Pressable>
      </View>
    </AuthScreen>
  );
}
