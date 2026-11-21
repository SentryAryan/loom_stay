import { Redirect, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";

import { AppText } from "@/components/app-text";
import { Button } from "@/components/button";

import { AuthScreen } from "./auth-screen";
import { OtpInput } from "./otp-input";
import { useSignInFlow } from "./use-sign-in-flow";
import { useSignUpFlow } from "./use-sign-up-flow";
import { isCompleteCode } from "./validation";

const RESEND_SECONDS = 30;

export function VerifyForm() {
  const { email: emailParam, mode } = useLocalSearchParams<{ email?: string; mode?: string }>();
  const signUpFlow = useSignUpFlow();
  const signInFlow = useSignInFlow();
  // "device": signing in from a device Clerk hasn't seen for this account. Otherwise this
  // is the email check after sign-up.
  const isDeviceCheck = mode === "device";
  const hasFlowInProgress = isDeviceCheck ? signInFlow.hasDeviceVerification : signUpFlow.hasSignUpInProgress;
  const emailAddress = isDeviceCheck ? signInFlow.emailAddress : signUpFlow.emailAddress;
  const resend = isDeviceCheck ? signInFlow.resendDeviceCode : signUpFlow.resend;
  const verify = isDeviceCheck ? signInFlow.verifyDeviceCode : signUpFlow.verify;
  const restart = isDeviceCheck ? signInFlow.restart : signUpFlow.restart;
  const email = emailAddress ?? emailParam;
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

  async function submitCode(value: string) {
    setIsLoading(true);
    setError(null);
    const message = await verify(value);
    setIsLoading(false);
    // On success the route guards move the guest to /home once the session is active.
    if (message) {
      setError(message);
      setCode("");
    }
  }

  function handleChange(value: string) {
    setCode(value);
    setError(null);
    setNotice(null);
    if (isCompleteCode(value)) submitCode(value);
  }

  async function handleResend() {
    setError(null);
    setCode("");
    const message = await resend();
    if (message) {
      setError(message);
      return;
    }
    setSecondsLeft(RESEND_SECONDS);
    setNotice("We sent you a new code.");
  }

  function handleUseDifferentEmail() {
    restart();
    router.back();
  }

  const canResend = secondsLeft <= 0 && !isLoading;

  // Nothing in progress (for example the app restarted mid-way): start over.
  if (!hasFlowInProgress && !isLoading) return <Redirect href={isDeviceCheck ? "/sign-in" : "/sign-up"} />;

  const purpose = isDeviceCheck ? "confirm it's you signing in on this device" : "verify your account";
  return (
    <AuthScreen
      title={isDeviceCheck ? "Confirm\nit's you" : "Check\nyour email"}
      body={email ? `We sent a 6-digit code to ${email}. Enter it below to ${purpose}.` : "Enter the 6-digit code we sent you."}
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
        onPress={() => submitCode(code)}
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
          onPress={handleUseDifferentEmail}
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
