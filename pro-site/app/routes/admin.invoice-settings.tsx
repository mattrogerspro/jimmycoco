import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import { Form, Link, data, useActionData, useLoaderData, useNavigation } from "react-router";
import { requireArticleStaff } from "../lib/article-auth.server";
import { isSameOriginPost } from "../lib/supabase.server";
import { getInvoiceSettings, updateInvoiceSettings } from "../lib/invoices.server";

export const meta: MetaFunction = () => [
  { title: "Invoice settings | Jimmy Coco admin" },
  { name: "robots", content: "noindex, nofollow, noarchive" },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, responseHeaders } = await requireArticleStaff(request);
  return data({ settings: await getInvoiceSettings(supabase) }, { headers: responseHeaders });
}

export async function action({ request }: ActionFunctionArgs) {
  const { supabase, responseHeaders } = await requireArticleStaff(request);
  if (!isSameOriginPost(request)) {
    return data({ error: "That request could not be verified." }, { status: 403, headers: responseHeaders });
  }

  const form = await request.formData();
  const text = (key: string) => String(form.get(key) ?? "").trim() || null;
  const rate = Number.parseFloat(String(form.get("vatRate") ?? "20"));

  try {
    await updateInvoiceSettings(supabase, {
      legal_name: String(form.get("legalName") ?? "").trim() || "Sunless by Jimmy Coco",
      address: {
        line1: String(form.get("line1") ?? "").trim(),
        line2: String(form.get("line2") ?? "").trim(),
        city: String(form.get("city") ?? "").trim(),
        county: String(form.get("county") ?? "").trim(),
        postcode: String(form.get("postcode") ?? "").trim(),
        country: String(form.get("country") ?? "").trim(),
      },
      contact_email: text("contactEmail"),
      contact_phone: text("contactPhone"),
      company_number: text("companyNumber"),
      vat_registered: form.get("vatRegistered") === "on",
      vat_number: text("vatNumber"),
      vat_rate_bps: Number.isFinite(rate) ? Math.round(rate * 100) : 2000,
      prices_include_vat: form.get("pricesIncludeVat") === "on",
      invoice_prefix: (String(form.get("prefix") ?? "JC-INV-").trim().toUpperCase() || "JC-INV-"),
      number_pad: Number.parseInt(String(form.get("pad") ?? "5"), 10) || 5,
      default_payment_terms_days: Number.parseInt(String(form.get("terms") ?? "30"), 10) || 30,
      bank_details: text("bankDetails"),
      footer_terms: text("footerTerms"),
    });
    return data({ notice: "Settings saved." }, { headers: responseHeaders });
  } catch (error) {
    return data({ error: (error as Error).message }, { status: 400, headers: responseHeaders });
  }
}

export default function InvoiceSettings() {
  const { settings } = useLoaderData<typeof loader>();
  const result = useActionData<typeof action>() as { error?: string; notice?: string } | undefined;
  const busy = useNavigation().state === "submitting";
  const address = (settings.address ?? {}) as Record<string, string>;
  const nextNumber = `${settings.invoice_prefix}${String(settings.next_number).padStart(settings.number_pad, "0")}`;

  return (
    <main className="admin-main">
      <p className="admin-crumb">
        <Link to="/admin/invoices">← Invoices</Link>
      </p>

      <header className="admin-page-head">
        <div>
          <p className="admin-eyebrow">Trade invoicing</p>
          <h1>Invoice settings</h1>
          <p>Who is issuing, how VAT is treated, and how invoices are numbered.</p>
        </div>
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
        <div className="admin-split">
          <div>
            <section className="admin-panel is-primary">
              <div className="admin-panel-head">
                <h2>VAT</h2>
              </div>
              <div className="admin-panel-body">
                <label className="admin-switch">
                  <input type="checkbox" name="vatRegistered" defaultChecked={settings.vat_registered} />
                  <span>
                    <b>We are VAT registered</b>
                    Until this is on, no invoice shows VAT or implies it is charged.
                  </span>
                </label>

                <div className="admin-field">
                  <label htmlFor="vatNumber">VAT number</label>
                  <input id="vatNumber" name="vatNumber" defaultValue={settings.vat_number ?? ""} placeholder="GB123456789" />
                </div>
                <div className="admin-field">
                  <label htmlFor="vatRate">VAT rate (%)</label>
                  <input
                    id="vatRate"
                    name="vatRate"
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    defaultValue={(settings.vat_rate_bps / 100).toString()}
                  />
                </div>

                <label className="admin-switch">
                  <input type="checkbox" name="pricesIncludeVat" defaultChecked={settings.prices_include_vat} />
                  <span>
                    <b>Trade prices already include VAT</b>
                    On: the £60 litre is £60 inclusive and the VAT is backed out of it. Off: VAT is added on top.
                  </span>
                </label>

                <p className="admin-hint">
                  Changing any of this affects new drafts only. Invoices already drafted or issued keep the treatment
                  they were created with, so an old invoice can never be silently rewritten.
                </p>
              </div>
            </section>

            <section className="admin-panel is-primary">
              <div className="admin-panel-head">
                <h2>Issuing business</h2>
              </div>
              <div className="admin-panel-body">
                <div className="admin-field">
                  <label htmlFor="legalName">Legal name</label>
                  <input id="legalName" name="legalName" defaultValue={settings.legal_name} required />
                </div>
                <div className="admin-field">
                  <label htmlFor="line1">Address line 1</label>
                  <input id="line1" name="line1" defaultValue={address.line1 ?? ""} />
                </div>
                <div className="admin-field">
                  <label htmlFor="line2">Address line 2</label>
                  <input id="line2" name="line2" defaultValue={address.line2 ?? ""} />
                </div>
                <div className="admin-field">
                  <label htmlFor="city">Town or city</label>
                  <input id="city" name="city" defaultValue={address.city ?? ""} />
                </div>
                <div className="admin-field">
                  <label htmlFor="county">County</label>
                  <input id="county" name="county" defaultValue={address.county ?? ""} />
                </div>
                <div className="admin-field">
                  <label htmlFor="postcode">Postcode</label>
                  <input id="postcode" name="postcode" defaultValue={address.postcode ?? ""} />
                </div>
                <div className="admin-field">
                  <label htmlFor="country">Country</label>
                  <input id="country" name="country" defaultValue={address.country ?? "United Kingdom"} />
                </div>
                <div className="admin-field">
                  <label htmlFor="companyNumber">Company number</label>
                  <input id="companyNumber" name="companyNumber" defaultValue={settings.company_number ?? ""} />
                </div>
                <div className="admin-field">
                  <label htmlFor="contactEmail">Invoice email</label>
                  <input id="contactEmail" name="contactEmail" type="email" defaultValue={settings.contact_email ?? ""} />
                </div>
                <div className="admin-field">
                  <label htmlFor="contactPhone">Phone</label>
                  <input id="contactPhone" name="contactPhone" defaultValue={settings.contact_phone ?? ""} />
                </div>
              </div>
            </section>
          </div>

          <aside>
            <section className="admin-panel is-secondary">
              <div className="admin-panel-head">
                <h2>Numbering</h2>
              </div>
              <div className="admin-panel-body">
                <p className="admin-kv">
                  <span>Next invoice</span>
                  <b>{nextNumber}</b>
                </p>
                <div className="admin-field">
                  <label htmlFor="prefix">Prefix</label>
                  <input id="prefix" name="prefix" defaultValue={settings.invoice_prefix} pattern="[A-Za-z0-9-]{1,12}" />
                </div>
                <div className="admin-field">
                  <label htmlFor="pad">Digits</label>
                  <input id="pad" name="pad" type="number" min="1" max="10" defaultValue={settings.number_pad} />
                </div>
                <p className="admin-hint">
                  The counter itself cannot be edited here. Numbers must never be reused, and moving it backwards is the
                  one change that would allow that.
                </p>
              </div>
            </section>

            <section className="admin-panel is-secondary">
              <div className="admin-panel-head">
                <h2>Terms</h2>
              </div>
              <div className="admin-panel-body">
                <div className="admin-field">
                  <label htmlFor="terms">Payment terms (days)</label>
                  <input id="terms" name="terms" type="number" min="0" max="365" defaultValue={settings.default_payment_terms_days} />
                </div>
                <div className="admin-field">
                  <label htmlFor="bankDetails">Bank details</label>
                  <textarea id="bankDetails" name="bankDetails" rows={4} defaultValue={settings.bank_details ?? ""} />
                </div>
                <div className="admin-field">
                  <label htmlFor="footerTerms">Footer terms</label>
                  <textarea id="footerTerms" name="footerTerms" rows={4} defaultValue={settings.footer_terms ?? ""} />
                </div>
              </div>
            </section>
          </aside>
        </div>

        <div className="admin-actions">
          <button className="admin-primary" type="submit" disabled={busy}>
            Save settings
          </button>
        </div>
      </Form>
    </main>
  );
}
