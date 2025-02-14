"use client";
import { useEffect, useState } from "react";
import { type User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, LogOut } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Avatars from "../../app/account/avatar";
import { signOutAction } from "@/app/actions";
import { useGetProfile } from "@/hooks/query/task";
import { useUpdateProfile } from "@/hooks/mutation/task";

export default function AccountForm({ user }: { user: User | null }) {
  const { data: profile } = useGetProfile(user?.id);
  const updateProfileMutation = useUpdateProfile();

  const [fullname, setFullname] = useState<string | null>(
    profile?.full_name || null
  );
  const [username, setUsername] = useState<string | null>(
    profile?.username || null
  );
  const [website, setWebsite] = useState<string | null>(
    profile?.website || null
  );
  const [avatar_url, setAvatarUrl] = useState<string | null>(
    profile?.avatar_url || null
  );
  useEffect(() => {
    if (profile) {
      setFullname(profile.full_name || "");
      setUsername(profile.username || "");
      setWebsite(profile.website || "");
      setAvatarUrl(profile.avatar_url || "");
    }
  }, [profile]);
  const handleUpdateProfile = () => {
    if (!user?.id) return;

    updateProfileMutation.mutate({
      userId: user.id,
      fullname,
      username,
      website,
      avatar_url,
    });
  };

  return (
    <Card className="w-full max-w-lg p-4 bg-white mx-auto">
      <CardContent className="flex flex-col space-y-5">
        <div className="flex flex-col items-center">
          <Avatars
            uid={user?.id ?? null}
            url={avatar_url}
            size={100}
            onUpload={(url) => {
              setAvatarUrl(url);
              handleUpdateProfile();
            }}
          />
          <span className="text-gray-600 text-sm mt-2">{user?.email}</span>
        </div>

        <div className="space-y-3">
          <Input
            id="fullName"
            type="text"
            placeholder="Full Name"
            value={fullname || ""}
            onChange={(e) => setFullname(e.target.value)}
            className="w-full"
          />
          <Input
            id="username"
            type="text"
            placeholder="Username"
            value={username || ""}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full"
          />
          <Input
            id="website"
            type="url"
            placeholder="Website"
            value={website || ""}
            onChange={(e) => setWebsite(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <Button
            className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2"
            onClick={handleUpdateProfile}
            disabled={updateProfileMutation.isPending}
          >
            {updateProfileMutation.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Update Profile"
            )}
          </Button>
          <Button
            onClick={() => signOutAction()}
            className="w-full bg-red-500 hover:bg-red-600 text-white rounded-lg py-2 flex items-center justify-center gap-2"
          >
            <LogOut size={16} />
            Sign Out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
