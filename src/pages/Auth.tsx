
import { useState, useEffect } from "react";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MouseGlow } from "@/components/effects/MouseGlow";
import { Film, Sparkles, Star } from "lucide-react";

const Auth = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [showFlash, setShowFlash] = useState(false);

  useEffect(() => {
    if (session) {
      setShowFlash(true);
      const timer = setTimeout(() => navigate("/"), 800);
      return () => clearTimeout(timer);
    }
  }, [session, navigate]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#02020a] selection:bg-purple-500/30">
      <MouseGlow />

      {/* Projector flash on login */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[200] bg-white pointer-events-none"
          />
        )}
      </AnimatePresence>

      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left side - Cinema imagery */}
        <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden">
          {/* Background image */}
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1200"
              alt="Cinema"
              className="w-full h-full object-cover opacity-40"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#02020a] via-[#02020a]/60 to-[#02020a]" />
          </div>

          {/* Projector beam effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(139,92,246,0.15)_0%,transparent_70%)] pointer-events-none" />

          {/* Content */}
          <div className="relative z-10 p-12 max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-black uppercase tracking-[0.2em] mb-8">
                <Sparkles className="w-3.5 h-3.5" />
                VIP Access Only
              </div>

              <h1 className="text-5xl xl:text-7xl font-black font-display tracking-tighter uppercase italic text-white leading-none mb-6">
                Welcome
                <br />
                <span className="text-purple-500">To The</span>
                <br />
                Club
              </h1>

              <p className="text-white/30 text-lg font-medium leading-relaxed">
                Your personal cinema experience awaits. Sign in to unlock
                AI-powered recommendations, curated collections, and your
                private screening room.
              </p>

              {/* Floating stats */}
              <div className="flex gap-6 mt-12">
                {[
                  { value: "50K+", label: "Films" },
                  { value: "AI", label: "Powered" },
                  { value: "∞", label: "Discovery" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-white font-mono font-black text-2xl">
                      {stat.value}
                    </div>
                    <div className="text-white/20 text-[10px] font-bold uppercase tracking-widest">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right side - Auth form */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12 lg:py-0">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="w-full max-w-md"
          >
            {/* Mobile header */}
            <div className="lg:hidden text-center mb-10">
              <div className="w-16 h-16 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-4">
                <Film className="w-8 h-8 text-purple-400" />
              </div>
              <h1 className="text-3xl font-black font-display tracking-tighter uppercase italic text-white">
                VIP Access
              </h1>
              <p className="text-white/30 text-sm mt-2">Enter the cinema club</p>
            </div>

            <div className="p-6 sm:p-10 rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-2xl shadow-[0_0_80px_rgba(0,0,0,0.5)]">
              <div className="hidden lg:block mb-8">
                <h2 className="text-2xl font-black font-display tracking-tighter uppercase text-white">
                  Enter Cinema
                </h2>
                <p className="text-white/30 text-sm mt-1">
                  Sign in or create your account
                </p>
              </div>

              <SupabaseAuth
                supabaseClient={supabase}
                appearance={{
                  theme: ThemeSupa,
                  variables: {
                    default: {
                      colors: {
                        brand: "rgb(147, 51, 234)",
                        brandAccent: "rgb(126, 34, 206)",
                        inputBackground: "rgba(255,255,255,0.03)",
                        inputBorder: "rgba(255,255,255,0.1)",
                        inputText: "white",
                        inputLabelText: "rgba(255,255,255,0.4)",
                        inputPlaceholder: "rgba(255,255,255,0.2)",
                        messageText: "rgb(248, 113, 113)",
                        anchorTextColor: "rgb(147, 51, 234)",
                        dividerBackground: "rgba(255,255,255,0.05)",
                      },
                      borderWidths: {
                        buttonBorderWidth: "1px",
                        inputBorderWidth: "0px",
                      },
                      radii: {
                        borderRadiusButton: "1rem",
                        buttonBorderRadius: "1rem",
                        inputBorderRadius: "1rem",
                      },
                      space: {
                        inputPadding: "14px 16px",
                        buttonPadding: "14px 24px",
                      },
                      fonts: {
                        bodyFontFamily: "'Outfit', sans-serif",
                        buttonFontFamily: "'Space Grotesk', sans-serif",
                        inputFontFamily: "'Outfit', sans-serif",
                        labelFontFamily: "'Outfit', sans-serif",
                      },
                      fontSizes: {
                        baseBodySize: "14px",
                        baseInputSize: "15px",
                        baseLabelSize: "12px",
                        baseButtonSize: "14px",
                      },
                    },
                  },
                  className: {
                    button:
                      "!font-bold !uppercase !tracking-widest !shadow-lg !shadow-purple-500/20 !transition-all hover:!shadow-xl",
                    container: "!gap-5",
                    divider: "!opacity-20",
                    label: "!uppercase !tracking-widest !text-[10px] !font-bold",
                    input:
                      "!bg-white/[0.03] !border-b-2 !border-white/10 !rounded-none !rounded-t-xl focus:!border-purple-500 !transition-colors",
                    message: "!text-red-400 !text-xs",
                    anchor: "!text-purple-400 !text-xs !font-bold hover:!text-purple-300",
                  },
                }}
                theme="dark"
                providers={["google"]}
                redirectTo={window.location.origin}
              />

              <p className="text-center text-white/10 text-xs mt-8 font-medium">
                Forgot password?{" "}
                <span className="text-white/20 italic">
                  Contact the projectionist.
                </span>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
