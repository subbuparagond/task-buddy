"use client";
import Image from "next/image";
import { CheckCircle } from "lucide-react";
import useSupabaseClient from "@/utils/supabase/client";

const LoginForm = () => {
  const supabase = useSupabaseClient();

  const loginWithGoogle = () => {
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="relative flex flex-col md:flex-row h-screen w-screen bg-[#f9f5f3] overflow-hidden p-6 md:p-0">
      <div className="flex flex-col justify-center items-center md:items-start px-6 md:px-20 w-full md:w-1/2 text-center md:text-left z-10">
        <h1 className="text-purple-900 text-3xl font-bold flex items-center gap-2">
          <CheckCircle size={35} className="text-purple-900" />
          TaskBuddy
        </h1>
        <p className="mt-3 max-w-xs md:max-w-sm font-semibold text-sm md:text-base text-gray-700">
          Streamline your workflow and track progress effortlessly with our
          all-in-one task management app.
        </p>
        <button
          className="mt-6 flex items-center px-6 py-3 bg-black text-white rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400"
          onClick={loginWithGoogle}
          type="button"
        >
          <Image
            className="mr-3"
            src="/google.svg"
            alt="Google icon"
            width={24}
            height={24}
          />
          Continue with Google
        </button>
      </div>

      <div className="absolute md:relative right-[-30vw] md:right-[-20vw] top-0 bottom-0 w-full md:w-1/2 h-full flex justify-center items-center overflow-hidden">
        <div className="absolute w-[120vw] h-[120vw] md:w-[90vh] md:h-[90vh] rounded-full border border-purple-300"></div>
        <div className="absolute w-[100vw] h-[100vw] md:w-[75vh] md:h-[75vh] rounded-full border border-purple-400"></div>
        <div className="absolute w-[80vw] h-[80vw] md:w-[60vh] md:h-[60vh] rounded-full border border-purple-500"></div>
      </div>
    </div>
  );
};

export default LoginForm;
