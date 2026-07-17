import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import {
  createSupabaseServerClient,
  isSameOriginPost,
  privateNoStoreHeaders,
} from "../lib/supabase.server";

export async function loader(_: LoaderFunctionArgs) {
  return redirect("/admin/login", { headers: privateNoStoreHeaders() });
}

export async function action({ request }: ActionFunctionArgs) {
  if (!isSameOriginPost(request)) {
    throw new Response("Forbidden", {
      status: 403,
      headers: privateNoStoreHeaders(),
    });
  }

  try {
    const { supabase, responseHeaders } = createSupabaseServerClient(request);
    await supabase.auth.signOut({ scope: "local" });
    return redirect("/admin/login", { headers: responseHeaders });
  } catch {
    return redirect("/admin/login", { headers: privateNoStoreHeaders() });
  }
}
