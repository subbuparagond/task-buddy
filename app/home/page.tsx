import { createClient } from "@/utils/supabase/server";
import Tasks from "../../components/forms/home";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <Tasks user={user} />;
}
