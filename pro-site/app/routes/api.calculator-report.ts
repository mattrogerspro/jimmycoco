import type { ActionFunctionArgs } from "react-router";
import { handleCalculatorReportSubmit } from "../lib/calculator-report.server";

/**
 * Receives calculator PDF requests separately from the prerendered calculator
 * page. Posting to the page itself targets its static `.data` asset on Vercel,
 * which cannot execute an action and therefore returns 405.
 */
export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: { Allow: "POST", "Cache-Control": "no-store" },
    });
  }

  return handleCalculatorReportSubmit(request);
}

export function loader() {
  return new Response("Not found", {
    status: 404,
    headers: { "Cache-Control": "no-store" },
  });
}
