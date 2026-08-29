import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import { Form, Link, data, useActionData, useLoaderData, useNavigation } from "react-router";
import { requireArticleStaff } from "../lib/article-auth.server";
import { isSameOriginPost } from "../lib/supabase.server";
import { getTradeDataSettings, updateTradeDataSettings } from "../lib/trade-data-settings.server";

export const meta: MetaFunction = () => [
  { title: "Data mode | Jimmy Coco admin" },
  { name: "robots", content: "noindex, nofollow, noarchive" },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, responseHeaders } = await requireArticleStaff(request);
  return data({ settings: await getTradeDataSettings(supabase) }, { headers: responseHeaders });
}

export async function action({ request }: ActionFunctionArgs) {
  const { supabase, responseHeaders } = await requireArticleStaff(request);
  if (!isSameOriginPost(request)) {
    return data({ error: "That request could not be verified." }, { status: 403, headers: responseHeaders });
  }

  try {
    const form = await request.formData();
    const createNewRecordsAsDemo = form.get("createNewRecordsAsDemo") === "on";
    await updateTradeDataSettings(supabase, createNewRecordsAsDemo);
    return data(
      {
        notice: createNewRecordsAsDemo
          ? "Demo mode is on. New standalone trade records will be marked Demo."
          : "Live mode is on. New standalone trade records will be marked Live.",
      },
      { headers: responseHeaders },
    );
  } catch (error) {
    return data({ error: (error as Error).message }, { status: 400, headers: responseHeaders });
  }
}

export default function AdminDataMode() {
  const { settings } = useLoaderData<typeof loader>();
  const result = useActionData<typeof action>() as { error?: string; notice?: string } | undefined;
  const busy = useNavigation().state === "submitting";
  const demoModeOn = settings.create_new_records_as_demo;

  return (
    <main className="admin-main">
      <p className="admin-crumb">
        <Link to="/admin/resellers">← Trade admin</Link>
      </p>

      <header className="admin-page-head">
        <div>
          <p className="admin-eyebrow">Trade data controls</p>
          <h1>Data mode</h1>
          <p>Control whether the admin works in Live mode only or includes Demo records for testing.</p>
        </div>
        <span className={`admin-status admin-status-mode-${demoModeOn ? "demo" : "live"}`}>
          {demoModeOn ? "Demo mode" : "Live mode"}
        </span>
      </header>

      {result?.error ? (
        <p className="admin-alert" role="alert">
          {result.error}
        </p>
      ) : null}
      {result?.notice ? (
        <p className="admin-alert admin-alert-ok" role="status">
          {result.notice}
        </p>
      ) : null}

      <Form method="post" replace>
        <section className="admin-panel is-primary">
          <div className="admin-panel-head">
            <h2>Admin demo mode</h2>
          </div>
          <div className="admin-panel-body">
            <label className="admin-switch">
              <input type="checkbox" name="createNewRecordsAsDemo" defaultChecked={demoModeOn} />
              <span>
                <b>Show and create Demo records</b>
                On: admin lists, exports and detail pages include Demo records, and new standalone applications and accounts are
                marked Demo. Off: admin pages show Live records only, and new standalone applications and accounts are marked Live.
                Orders and invoices always inherit the classification of their account or order.
              </span>
            </label>

            <p className="admin-hint">
              All applications, accounts, orders and invoices that existed before this control was introduced are marked Demo.
              Switching Live mode on does not delete them; it simply hides Demo rows from normal admin workflows. The switch does
              not rewrite historical classifications, invoice amounts, account status, or order history.
            </p>
          </div>
        </section>

        <div className="admin-actions">
          <button className="admin-primary" type="submit" disabled={busy}>
            {busy ? "Saving…" : "Save data mode"}
          </button>
        </div>
      </Form>
    </main>
  );
}
