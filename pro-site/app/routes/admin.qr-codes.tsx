import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import {
  Form,
  data,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";
import { requireArticleStaff } from "../lib/article-auth.server";
import {
  createQrCode,
  listQrCodes,
  normaliseDestinationUrl,
  normaliseQrName,
  updateQrCode,
} from "../lib/qr-codes.server";
import { qrRedirectUrl } from "../lib/qr-codes";
import { isSameOriginPost } from "../lib/supabase.server";
import {
  IconDownload,
  IconExternal,
  IconPlus,
  IconQrCode,
} from "../components/admin/AdminIcons";

export const meta: MetaFunction = () => [
  { title: "QR codes | Jimmy Coco admin" },
  { name: "robots", content: "noindex, nofollow, noarchive" },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, responseHeaders, staff } = await requireArticleStaff(request);
  const { data: qrCodes, error } = await listQrCodes(supabase);

  if (error) {
    const unavailable = error.code === "42P01" || /qr_codes/i.test(error.message);
    if (unavailable) {
      return data({ staff, qrCodes: [], unavailable: true }, { headers: responseHeaders });
    }
    console.error("Unable to load QR codes", error.message);
    throw new Response("The QR code list is temporarily unavailable.", {
      status: 503,
      headers: responseHeaders,
    });
  }

  return data({ staff, qrCodes: qrCodes ?? [], unavailable: false }, { headers: responseHeaders });
}

export async function action({ request }: ActionFunctionArgs) {
  const { supabase, responseHeaders, staff } = await requireArticleStaff(request);
  if (!isSameOriginPost(request)) {
    return data({ error: "That request could not be verified." }, { status: 403, headers: responseHeaders });
  }
  if (staff.role !== "admin") {
    return data({ error: "Only administrators can change QR destinations." }, { status: 403, headers: responseHeaders });
  }

  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");

  try {
    const name = normaliseQrName(form.get("name"));
    const destinationUrl = normaliseDestinationUrl(form.get("destinationUrl"));

    if (intent === "create") {
      const created = await createQrCode(supabase, {
        name,
        destinationUrl,
        userId: staff.userId,
      });
      return data(
        { notice: `${created.name} created. Its printed QR URL will always remain the same.` },
        { headers: responseHeaders },
      );
    }

    if (intent === "update") {
      const id = String(form.get("qrId") ?? "");
      if (!/^[0-9a-f-]{36}$/i.test(id)) throw new Error("The QR record is invalid.");
      const updated = await updateQrCode(supabase, {
        id,
        name,
        destinationUrl,
        isActive: form.get("isActive") === "on",
        userId: staff.userId,
      });
      return data({ notice: `${updated.name} updated.` }, { headers: responseHeaders });
    }

    throw new Error("Unknown QR action.");
  } catch (error) {
    return data({ error: (error as Error).message }, { status: 400, headers: responseHeaders });
  }
}

const number = new Intl.NumberFormat("en-GB");
const date = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default function AdminQrCodes() {
  const { staff, qrCodes, unavailable } = useLoaderData<typeof loader>();
  const result = useActionData<typeof action>() as { error?: string; notice?: string } | undefined;
  const busy = useNavigation().state === "submitting";
  const canManage = staff.role === "admin";
  const active = qrCodes.filter((qr) => qr.is_active).length;
  const scans = qrCodes.reduce((sum, qr) => sum + Number(qr.scan_count), 0);

  return (
    <main className="admin-main qr-admin">
      <header className="admin-page-head">
        <div>
          <p className="admin-eyebrow">Dynamic destinations</p>
          <h1>QR codes</h1>
          <p>Print once, then change where each code lands whenever you need to.</p>
        </div>
      </header>

      {result?.error ? <p className="admin-alert" role="alert">{result.error}</p> : null}
      {result?.notice ? <p className="admin-alert admin-alert-ok" role="status">{result.notice}</p> : null}

      {unavailable ? (
        <div className="admin-alert art-alert-setup" role="status">
          <div>
            <b>The QR database migration has not been applied yet.</b>
            <span>Apply the dynamic QR migration before creating records.</span>
          </div>
        </div>
      ) : (
        <>
          <div className="admin-stat-row">
            <div className="admin-stat"><span>QR records</span><b>{number.format(qrCodes.length)}</b></div>
            <div className="admin-stat"><span>Active codes</span><b>{number.format(active)}</b></div>
            <div className="admin-stat is-flagged"><span>Total scans</span><b>{number.format(scans)}</b></div>
          </div>

          {canManage ? (
            <section className="admin-panel qr-create">
              <div className="admin-panel-head">
                <div>
                  <h2>Create a QR code</h2>
                  <p>The short code is generated automatically and never changes.</p>
                </div>
              </div>
              <Form method="post" replace className="qr-create-form">
                <input type="hidden" name="intent" value="create" />
                <div className="admin-field">
                  <label htmlFor="new-qr-name">Internal name</label>
                  <input id="new-qr-name" name="name" placeholder="Bottle label" maxLength={120} required />
                </div>
                <div className="admin-field">
                  <label htmlFor="new-qr-destination">Destination URL</label>
                  <input id="new-qr-destination" name="destinationUrl" type="url" placeholder="https://jimmycoco.pro/..." maxLength={2048} required />
                </div>
                <button className="admin-primary" type="submit" disabled={busy}>
                  <IconPlus size={17} /> Create QR code
                </button>
              </Form>
            </section>
          ) : (
            <p className="admin-alert art-alert-setup">You can view and download QR codes. An administrator must change destinations.</p>
          )}

          {qrCodes.length === 0 ? (
            <section className="admin-panel">
              <div className="art-empty">
                <IconQrCode size={38} />
                <h3>No QR codes yet</h3>
                <p>Create the first record above, then download its SVG for print.</p>
              </div>
            </section>
          ) : (
            <div className="qr-grid">
              {qrCodes.map((qr) => {
                const shortUrl = qrRedirectUrl(qr.code);
                const assetBase = `/admin/qr-assets/${qr.id}`;
                return (
                  <article className={`qr-card${qr.is_active ? "" : " is-inactive"}`} key={qr.id}>
                    <div className="qr-card-preview">
                      <img src={`${assetBase}/svg`} alt={`QR code for ${qr.name}`} loading="lazy" />
                      <span className={`admin-status admin-status-${qr.is_active ? "active" : "archived"}`}>
                        {qr.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <Form method="post" replace className="qr-card-body">
                      <input type="hidden" name="intent" value="update" />
                      <input type="hidden" name="qrId" value={qr.id} />
                      <div className="admin-field">
                        <label htmlFor={`qr-name-${qr.id}`}>Internal name</label>
                        <input id={`qr-name-${qr.id}`} name="name" defaultValue={qr.name} maxLength={120} required readOnly={!canManage} />
                      </div>
                      <div className="admin-field">
                        <label htmlFor={`qr-destination-${qr.id}`}>Destination URL</label>
                        <input id={`qr-destination-${qr.id}`} name="destinationUrl" type="url" defaultValue={qr.destination_url} maxLength={2048} required readOnly={!canManage} />
                      </div>
                      <div className="qr-short-url">
                        <span>Permanent printed URL</span>
                        <code>{shortUrl}</code>
                      </div>
                      <div className="qr-card-stats">
                        <div><span>Scans</span><b>{number.format(Number(qr.scan_count))}</b></div>
                        <div><span>Last scan</span><b>{qr.last_scanned_at ? date.format(new Date(qr.last_scanned_at)) : "Never"}</b></div>
                      </div>
                      {canManage ? (
                        <label className="admin-switch">
                          <input type="checkbox" name="isActive" defaultChecked={qr.is_active} />
                          <span><b>Redirect is active</b>Turn this off to stop the printed code from redirecting.</span>
                        </label>
                      ) : null}
                      <div className="qr-card-actions">
                        {canManage ? <button className="admin-primary" type="submit" disabled={busy}>Save destination</button> : null}
                        <a className="admin-secondary-link" href={qr.destination_url} target="_blank" rel="noreferrer">
                          <IconExternal size={16} /> Test destination
                        </a>
                      </div>
                    </Form>
                    <div className="qr-downloads">
                      <a href={`${assetBase}/svg?download=1`}><IconDownload size={16} /> SVG for print</a>
                      <a href={`${assetBase}/png?download=1`}><IconDownload size={16} /> 2048px PNG</a>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </main>
  );
}
