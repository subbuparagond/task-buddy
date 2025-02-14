import { signOutAction } from "@/app/actions";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { useEffect, useState } from "react";
import useSupabaseClient from "@/utils/supabase/client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import AccountForm from "@/components/forms/account-form";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";
import { useProfile } from "@/hooks/query/profile";

export default function AuthButton() {
  const [user, setUser] = useState<any>(null);
  const supabase = useSupabaseClient();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, [supabase]);

  const { data: profile } = useProfile(user?.id);

  if (!hasEnvVars) {
    return (
      <div className="flex gap-4 items-center text-red-500">
        Please update .env.local file with anon key and URL
      </div>
    );
  }

  return user ? (
    <div className="flex flex-col items-center gap-3 p-0">
      <Popover>
        <PopoverTrigger asChild>
          <div className="flex items-center gap-2 cursor-pointer">
            <Avatar className="w-10 h-10 border">
              <AvatarImage
                src={profile?.avatar_url || "https://github.com/shadcn.png"}
                alt="Profile"
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <span className="text-lg font-semibold text-gray-700">
              {profile?.full_name || "User"}
            </span>
          </div>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          side="bottom"
          avoidCollisions={true}
          className="w-80 max-w-lg z-50 bg-white shadow-lg rounded-xl border p-4 overflow-auto max-h-[80vh]"
        >
          <AccountForm user={user} />
        </PopoverContent>
      </Popover>

      <form action={signOutAction} className="w-full">
        <Button
          type="submit"
          variant="outline"
          className="w-full flex items-center gap-2 border border-pink-300 bg-pink-50 text-pink-700 hover:bg-pink-100 rounded-lg p-2"
        >
          <LogOut size={16} />
          Logout
        </Button>
      </form>
    </div>
  ) : (
    <div className="flex gap-2">null</div>
  );
}
