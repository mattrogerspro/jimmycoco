import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { createSupabaseServerClient, isSameOriginPost } from "../lib/supabase.server";

export async function action({ request }: ActionFunctionArgs) {
  if (!isSameOriginPost(request)) return redirect("/portal/login");
  const { supabase, responseHeaders } = createSupabaseServerClient(request);
  await supabase.auth.signOut({ scope: "local" });
  return redirect("/portal/login", { headers: responseHeaders });
}

export async function loader(_: LoaderFunctionArgs) {
  return redirect("/portal/login");
}
