import type { LoaderFunctionArgs } from "react-router";
import { requireArticleStaff } from "../lib/article-auth.server";
import { getInvoice } from "../lib/invoices.server";
import { renderInvoiceDocument } from "../lib/invoice-document.server";

/**
 * The invoice as a standalone A4 document.
 *
 * It is served as its own HTML page rather than a route component because it
 * must not inherit the admin chrome, and because the same markup is what a PDF
 * renderer will be handed later. Opening it triggers the browser's print
 * dialogue, where "Save as PDF" produces the file.
 */
export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase, responseHeaders } = await requireArticleStaff(request);
  const result = await getInvoice(supabase, params.invoiceId as string);
  if (!result) throw new Response("Invoice not found", { status: 404, headers: responseHeaders });

  const url = new URL(request.url);
  const html = renderInvoiceDocument(result, { autoPrint: url.searchParams.get("print") !== "0" });

  const headers = new Headers(responseHeaders);
  headers.set("Content-Type", "text/html; charset=utf-8");
  return new Response(html, { headers });
}
