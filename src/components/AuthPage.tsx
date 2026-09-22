import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, User } from "lucide-react";
import { LogoMark } from "./Logo";
import { IMG } from "../assets";
import { cn } from "../utils/cn";
import { authAPI } from "../api";

declare global {
  interface Window {
    google?: any;
    googleSignIn?: (response: any) => void;
  }
}

const P = IMG.posters;
const collage = [P[0], P[2], P[3], P[5], P[4], P[1], P[6], P[2], P[3], P[5], P[0], P[4], P[6], P[1], P[5], P[3]];

export function AuthPage({ onAuth }: { onAuth: (user: { name: string; email: string; token: string }) => void }) {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.googleSignIn = async (response: any) => {
      if (!response?.credential) {
        setError("Google sign-in failed. Please try again.");
        return;
      }
      setLoading(true);
      setError("");
      try {
        const { data } = await authAPI.googleLogin(response.credential);
        localStorage.setItem("token", data.token);
        onAuth({ name: data.name, email: data.email, token: data.token });
      } catch (err: any) {
        const msg = err?.response?.data?.message || "Google login failed";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    const checkGoogle = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(checkGoogle);
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
          callback: window.googleSignIn,
        });
        const googleBtn = document.getElementById("google-signin-btn");
        if (googleBtn) {
          googleBtn.innerHTML = "";
          window.google.accounts.id.renderButton(googleBtn, {
            theme: "filled_black",
            size: "large",
            text: "continue_with",
            shape: "rectangular",
            width: 300,
          });
        }
      }
    }, 200);

    return () => clearInterval(checkGoogle);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let data;
      if (mode === "in") {
        const res = await authAPI.login({ email, password: pw });
        data = res.data;
      } else {
        const res = await authAPI.register({ name, email, password: pw });
        data = res.data;
      }
      localStorage.setItem("token", data.token);
      onAuth({ name: data.name, email: data.email, token: data.token });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Authentication failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSkipLogin = () => {
    const fakeName = mode === "up" && name.trim() ? name.trim() : "User";
    onAuth({
      name: fakeName,
      email: email || "user@cinematic.com",
      token: "local-" + Date.now(),
    });
  };

  return (
    <div className="relative min-h-svh w-full overflow-hidden bg-ink-950">
      {/* blurred poster collage background */}
      <div className="absolute inset-0 scale-110">
        <div className="grid h-full w-full grid-cols-4 gap-2 opacity-45 blur-[26px] sm:grid-cols-6 lg:grid-cols-8">
          {collage.concat(collage).map((src, i) => (
            <div key={i} className="aspect-[2/3] overflow-hidden rounded-xl">
              <img src={src} alt="" className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      </div>
      <div className="absolute inset-0 bg-ink-950/72" />
      <div className="animate-aurora pointer-events-none absolute -left-40 top-0 h-[60vh] w-[60vh] rounded-full bg-neon-600/35 blur-[130px]" />
      <div className="animate-aurora pointer-events-none absolute -right-40 bottom-0 h-[55vh] w-[55vh] rounded-full bg-aqua-400/20 blur-[140px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-ink-950/80" />

      {/* header */}
      <div className="relative z-10 flex items-center justify-between px-5 py-6 sm:px-10">
        <div className="flex items-center gap-2.5">
          <LogoMark className="h-9 w-9 text-[19px]" />
          <span className="text-[16px] font-semibold tracking-tight text-white">Cinematic</span>
        </div>
        <button
          type="button"
          onClick={handleSkipLogin}
          className="rounded-full border border-white/12 bg-white/[0.06] px-4 py-1.5 text-[12.5px] font-medium text-white/80 backdrop-blur-md transition hover:bg-white/12"
        >
          Skip for now
        </button>
      </div>

      {/* card */}
      <div className="relative z-10 flex min-h-[calc(100svh-96px)] items-center justify-center px-5 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 34, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[420px] overflow-hidden rounded-[28px] glass p-7 shadow-[0_40px_120px_-25px_rgba(0,0,0,0.95)] sm:p-9"
        >
          <div className="mb-7 text-center">
            <motion.h1
              key={mode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-[30px] leading-tight text-white"
            >
              {mode === "in" ? "Welcome Back" : "Create Account"}
            </motion.h1>
            <p className="mt-1.5 text-[13px] text-white/50">
              {mode === "in"
                ? "Unlimited movies, anime and originals."
                : "Start your 30-day cinematic free trial."}
            </p>
          </div>

          {/* Google Sign-In Button */}
          <div className="mb-5">
            <div id="google-signin-btn" className="flex justify-center" />
          </div>

          <div className="my-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-white/10" />
            <span className="text-[11px] uppercase tracking-widest text-white/30">or</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <AnimatePresence initial={false}>
              {mode === "up" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <Field icon={User} placeholder="Full name" value={name} onChange={setName} />
                </motion.div>
              )}
            </AnimatePresence>

            <Field
              icon={Mail}
              type="email"
              placeholder="Email address"
              value={email}
              onChange={setEmail}
            />

            <Field
              icon={Lock}
              type={show ? "text" : "password"}
              placeholder="Password"
              value={pw}
              onChange={setPw}
              trailing={
                <button type="button" onClick={() => setShow((s) => !s)} className="text-white/40 hover:text-white/80">
                  {show ? <EyeOff className="h-[16px] w-[16px]" /> : <Eye className="h-[16px] w-[16px]" />}
                </button>
              }
            />

            <div className="flex items-center justify-between pt-1 text-[12px]">
              <label className="flex cursor-pointer items-center gap-2 text-white/55">
                <input type="checkbox" defaultChecked className="peer sr-only" />
                <span className="grid h-4 w-4 place-items-center rounded-[5px] border border-white/25 bg-white/5 text-transparent transition peer-checked:border-neon-400 peer-checked:bg-neon-500 peer-checked:text-white">
                  <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M2 6.2 4.6 8.8 10 3.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                Remember me
              </label>
              <button type="button" className="text-neon-300 transition hover:text-neon-200">
                Forgot password?
              </button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-[12.5px] text-red-400">
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="group mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-neon-400 via-neon-500 to-neon-600 py-3.5 text-[14px] font-semibold text-white neon-glow disabled:opacity-50"
            >
              {loading ? "Please wait..." : mode === "in" ? "Sign In" : "Create Account"}
              {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-[12.5px] text-white/45">
            {mode === "in" ? "New to the platform?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => { setMode(mode === "in" ? "up" : "in"); setError(""); }}
              className="font-semibold text-white underline decoration-neon-400/60 underline-offset-4 transition hover:text-neon-300"
            >
              {mode === "in" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  placeholder,
  type = "text",
  value,
  onChange,
  trailing,
}: {
  icon: typeof Mail;
  placeholder: string;
  type?: string;
  value?: string;
  onChange?: (v: string) => void;
  trailing?: React.ReactNode;
}) {
  return (
    <div className={cn("group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3.5 transition-all focus-within:border-neon-400/60 focus-within:bg-white/[0.08] focus-within:shadow-[0_0_0_4px_rgba(124,77,255,0.12)]")}>
      <Icon className="h-[17px] w-[17px] shrink-0 text-white/35 transition-colors group-focus-within:text-neon-300" strokeWidth={1.7} />
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-[13.5px] text-white placeholder:text-white/30 focus:outline-none"
      />
      {trailing}
    </div>
  );
}
