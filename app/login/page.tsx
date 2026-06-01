"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Eye, EyeOff, ArrowLeft, Mail, KeyRound, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { checkUserStatus, checkMobileUnique } from "@/lib/actions/auth";

// Login Schema (Email + 6-digit Password)
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().regex(/^\d{6}$/, "Password must be exactly 6 digits."),
});

// Signup Schema (Name, Email, Mobile, 6-digit Password)
const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  mobile: z
    .string()
    .min(10, "Mobile number must be at least 10 digits.")
    .max(15, "Mobile number must be at most 15 digits.")
    .regex(/^\+?[0-9]+$/, "Please enter a valid mobile number."),
  password: z.string().regex(/^\d{6}$/, "Password must be exactly 6 digits."),
});

// Forgot Password - Email Step
const forgotEmailSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

// Forgot Password - Reset Step
const forgotResetSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, "OTP must be exactly 6 digits."),
  newPassword: z.string().regex(/^\d{6}$/, "Password must be exactly 6 digits."),
});

export default function AuthPage() {
  const router = useRouter();
  const [step, setStep] = useState<"login" | "signup" | "forgot">("login");
  const [forgotPhase, setForgotPhase] = useState<"email" | "reset">("email");
  const [forgotEmail, setForgotEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [otpSentCountdown, setOtpSentCountdown] = useState(0);

  // Clear logged_out flag when login page loads
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("logged_out");
    }
  }, []);

  // OTP resend countdown timer
  useEffect(() => {
    if (otpSentCountdown <= 0) return;
    const timer = setTimeout(() => setOtpSentCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [otpSentCountdown]);

  // Form handlers
  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", mobile: "", password: "" },
  });

  const forgotEmailForm = useForm({
    resolver: zodResolver(forgotEmailSchema),
    defaultValues: { email: "" },
  });

  const forgotResetForm = useForm({
    resolver: zodResolver(forgotResetSchema),
    defaultValues: { otp: "", newPassword: "" },
  });

  // Handle Login Sign In
  const handleSignIn = async (data: z.infer<typeof loginSchema>) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const { data: session, error } = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      });

      if (error) {
        setErrorMsg(error.message || "Invalid email or password.");
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Signup Registration
  const handleSignUp = async (data: z.infer<typeof signupSchema>) => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      // 1. Verify mobile uniqueness first
      const mobileRes = await checkMobileUnique(data.mobile);
      if (!mobileRes.success || !mobileRes.unique) {
        setErrorMsg("This mobile number is already registered.");
        setLoading(false);
        return;
      }

      // 2. Perform signup using Better Auth
      const { data: user, error } = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
        mobile: data.mobile.trim(),
      });

      if (error) {
        setErrorMsg(error.message || "Failed to create account.");
      } else {
        setSuccessMsg("Account created successfully! Please login with your password.");
        setTimeout(() => {
          loginForm.setValue("email", data.email);
          setStep("login");
          setSuccessMsg("");
        }, 2000);
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password - Send OTP
  const handleSendOtp = async (data: z.infer<typeof forgotEmailSchema>) => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const { data: result, error } = await authClient.emailOtp.sendVerificationOtp({
        email: data.email,
        type: "forget-password",
      });

      if (error) {
        setErrorMsg(error.message || "Failed to send OTP. Please check your email.");
      } else {
        setForgotEmail(data.email);
        setForgotPhase("reset");
        setOtpSentCountdown(60);
        setSuccessMsg("A 6-digit code has been sent to your email.");
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password - Reset Password
  const handleResetPassword = async (data: z.infer<typeof forgotResetSchema>) => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const { data: result, error } = await authClient.emailOtp.resetPassword({
        email: forgotEmail,
        otp: data.otp,
        password: data.newPassword,
      });

      if (error) {
        setErrorMsg(error.message || "Invalid or expired OTP. Please try again.");
      } else {
        setSuccessMsg("Password reset successfully! Redirecting to login...");
        setTimeout(() => {
          loginForm.setValue("email", forgotEmail);
          forgotResetForm.reset();
          forgotEmailForm.reset();
          setForgotPhase("email");
          setForgotEmail("");
          setStep("login");
          setSuccessMsg("");
          setErrorMsg("");
        }, 2000);
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (otpSentCountdown > 0) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const { data: result, error } = await authClient.emailOtp.sendVerificationOtp({
        email: forgotEmail,
        type: "forget-password",
      });

      if (error) {
        setErrorMsg(error.message || "Failed to resend OTP.");
      } else {
        setOtpSentCountdown(60);
        setSuccessMsg("A new OTP has been sent to your email.");
      }
    } catch (err) {
      setErrorMsg("Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Dynamic header
  const heading =
    step === "signup"
      ? "Create your account"
      : step === "forgot"
        ? forgotPhase === "email"
          ? "Forgot password"
          : "Reset password"
        : "Please login";

  const subHeading =
    step === "forgot"
      ? forgotPhase === "email"
        ? "Enter your email to receive a reset code"
        : `Enter the code sent to ${forgotEmail}`
      : undefined;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050816] px-4 relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />

      <Card className="w-full max-w-[420px] border-[#1a2340] bg-[#0b132b]/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl relative z-10">
        <CardContent className="p-6 sm:p-8">
          {/* Dynamic Header */}
          <div className="text-center mb-8">
            {step === "forgot" && (
              <div className="flex justify-center mb-4">
                <div className="h-14 w-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                  {forgotPhase === "email" ? (
                    <Mail className="h-6 w-6 text-blue-400" />
                  ) : (
                    <ShieldCheck className="h-6 w-6 text-blue-400" />
                  )}
                </div>
              </div>
            )}
            <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-wide">
              {heading}
            </h1>
            {subHeading && (
              <p className="mt-2 text-sm text-slate-400">{subHeading}</p>
            )}
          </div>

          {errorMsg && (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400 text-center">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-6 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-400 text-center">
              {successMsg}
            </div>
          )}

          {/* LOGIN FORM */}
          {step === "login" && (
            <form onSubmit={loginForm.handleSubmit(handleSignIn)} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-slate-300">Email</Label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  {...loginForm.register("email")}
                  className="bg-[#050816] border-[#1a2340] text-white h-12 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
                {loginForm.formState.errors.email && (
                  <p className="text-red-500 text-xs mt-1">{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Password</Label>
                <div className="relative">
                  <Input
                    type={showLoginPassword ? "text" : "password"}
                    maxLength={6}
                    placeholder="Password"
                    {...loginForm.register("password")}
                    className="bg-[#050816] border-[#1a2340] text-white h-12 rounded-xl tracking-[0.3em] font-mono text-lg focus:ring-blue-500 focus:border-blue-500 pr-12"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors h-8 w-8 flex items-center justify-center focus:outline-none z-10 cursor-pointer"
                  >
                    {showLoginPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-red-500 text-xs mt-1">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all shadow-lg shadow-blue-600/10"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Login"}
              </Button>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg("");
                    setSuccessMsg("");
                    setForgotPhase("email");
                    const emailVal = loginForm.getValues("email");
                    forgotEmailForm.setValue("email", emailVal);
                    setStep("forgot");
                  }}
                  className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
                >
                  Forgot password?
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg("");
                    setSuccessMsg("");
                    const emailVal = loginForm.getValues("email");
                    signupForm.setValue("email", emailVal);
                    setStep("signup");
                  }}
                  className="text-sm text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                >
                  Please create your account
                </button>
              </div>
            </form>
          )}

          {/* SIGNUP FORM */}
          {step === "signup" && (
            <form onSubmit={signupForm.handleSubmit(handleSignUp)} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Administrator Name</Label>
                <Input
                  type="text"
                  placeholder="Your Name"
                  {...signupForm.register("name")}
                  className="bg-[#050816] border-[#1a2340] text-white h-12 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
                {signupForm.formState.errors.name && (
                  <p className="text-red-500 text-xs mt-1">{signupForm.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Email</Label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  {...signupForm.register("email")}
                  className="bg-[#050816] border-[#1a2340] text-white h-12 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
                {signupForm.formState.errors.email && (
                  <p className="text-red-500 text-xs mt-1">{signupForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Mobile Number</Label>
                <Input
                  type="tel"
                  placeholder="e.g. +88017XXXXXXXX"
                  {...signupForm.register("mobile")}
                  className="bg-[#050816] border-[#1a2340] text-white h-12 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
                {signupForm.formState.errors.mobile && (
                  <p className="text-red-500 text-xs mt-1">{signupForm.formState.errors.mobile.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Password</Label>
                <div className="relative">
                  <Input
                    type={showSignupPassword ? "text" : "password"}
                    maxLength={6}
                    placeholder="Password"
                    {...signupForm.register("password")}
                    className="bg-[#050816] border-[#1a2340] text-white h-12 rounded-xl tracking-[0.3em] font-mono text-lg focus:ring-blue-500 focus:border-blue-500 pr-12"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors h-8 w-8 flex items-center justify-center focus:outline-none z-10 cursor-pointer"
                  >
                    {showSignupPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {signupForm.formState.errors.password && (
                  <p className="text-red-500 text-xs mt-1">{signupForm.formState.errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all shadow-lg shadow-blue-600/10"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Sign Up"}
              </Button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg("");
                    setSuccessMsg("");
                    const emailVal = signupForm.getValues("email");
                    loginForm.setValue("email", emailVal);
                    setStep("login");
                  }}
                  className="text-sm text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                >
                  Please login
                </button>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD - EMAIL PHASE */}
          {step === "forgot" && forgotPhase === "email" && (
            <form onSubmit={forgotEmailForm.handleSubmit(handleSendOtp)} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-slate-300">Email Address</Label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  {...forgotEmailForm.register("email")}
                  className="bg-[#050816] border-[#1a2340] text-white h-12 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
                {forgotEmailForm.formState.errors.email && (
                  <p className="text-red-500 text-xs mt-1">{forgotEmailForm.formState.errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all shadow-lg shadow-blue-600/10"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Mail className="h-4 w-4" />
                    Send Reset Code
                  </span>
                )}
              </Button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg("");
                    setSuccessMsg("");
                    setStep("login");
                  }}
                  className="text-sm text-slate-400 hover:text-blue-400 transition-colors inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to login
                </button>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD - RESET PHASE */}
          {step === "forgot" && forgotPhase === "reset" && (
            <form onSubmit={forgotResetForm.handleSubmit(handleResetPassword)} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-slate-300">6-Digit Code</Label>
                <Input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  {...forgotResetForm.register("otp")}
                  className="bg-[#050816] border-[#1a2340] text-white h-12 rounded-xl tracking-[0.3em] font-mono text-lg text-center focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
                {forgotResetForm.formState.errors.otp && (
                  <p className="text-red-500 text-xs mt-1">{forgotResetForm.formState.errors.otp.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">New Password</Label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    maxLength={6}
                    placeholder="New 6-digit password"
                    {...forgotResetForm.register("newPassword")}
                    className="bg-[#050816] border-[#1a2340] text-white h-12 rounded-xl tracking-[0.3em] font-mono text-lg focus:ring-blue-500 focus:border-blue-500 pr-12"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors h-8 w-8 flex items-center justify-center focus:outline-none z-10 cursor-pointer"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {forgotResetForm.formState.errors.newPassword && (
                  <p className="text-red-500 text-xs mt-1">{forgotResetForm.formState.errors.newPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all shadow-lg shadow-blue-600/10"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <KeyRound className="h-4 w-4" />
                    Reset Password
                  </span>
                )}
              </Button>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg("");
                    setSuccessMsg("");
                    setForgotPhase("email");
                    setStep("login");
                  }}
                  className="text-sm text-slate-400 hover:text-blue-400 transition-colors inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to login
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={otpSentCountdown > 0 || loading}
                  className={`text-sm transition-colors ${
                    otpSentCountdown > 0
                      ? "text-slate-500 cursor-not-allowed"
                      : "text-blue-400 hover:text-blue-300 cursor-pointer"
                  }`}
                >
                  {otpSentCountdown > 0 ? `Resend in ${otpSentCountdown}s` : "Resend code"}
                </button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
