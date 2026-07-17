import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";

export async function loader(_: LoaderFunctionArgs) {
  return redirect("/admin/articles");
}

export default function AdminIndex() {
  return null;
}
