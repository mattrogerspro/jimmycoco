import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import { Form, data, useActionData, useLoaderData, useNavigation } from "react-router";
import { requireReseller } from "../lib/reseller-auth.server";
import {
  addressesMatch,
  normaliseResellerAddress,
  updatePortalAddresses,
  type ResellerAddress,
} from "../lib/reseller-profile.server";
import { isSameOriginPost } from "../lib/supabase.server";

type ActionData = { error?: string; notice?: string };

export const meta: MetaFunction = () => [
  { title: "Business and shipping addresses | Sunless by Jimmy Coco" },
  { name: "robots", content: "noindex, nofollow, noarchive" },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const { responseHeaders, reseller } = await requireReseller(request);
  const businessAddress = normaliseResellerAddress(reseller.address);
  const shippingAddress = normaliseResellerAddress(reseller.shipping_address);
  const shippingIsEmpty = Object.values(shippingAddress).every((value) => !value);

  return data({
    businessAddress,
    shippingAddress: shippingIsEmpty ? businessAddress : shippingAddress,
    shippingSameAsBusiness: shippingIsEmpty || addressesMatch(businessAddress, shippingAddress),
    market: reseller.market,
  }, { headers: responseHeaders });
}

export async function action({ request }: ActionFunctionArgs) {
  const { responseHeaders, reseller } = await requireReseller(request);
  if (!isSameOriginPost(request)) {
    return data<ActionData>({ error: "That request could not be verified." }, { status: 403, headers: responseHeaders });
  }

  try {
    await updatePortalAddresses(
      { resellerId: reseller.id, userId: reseller.user_id },
      await request.formData(),
    );
    return data<ActionData>({ notice: "Business and shipping addresses saved." }, { headers: responseHeaders });
  } catch (error) {
    return data<ActionData>({ error: (error as Error).message }, { status: 400, headers: responseHeaders });
  }
}

function AddressFields({ prefix, address, disabled = false }: {
  prefix: "business" | "shipping";
  address: ResellerAddress;
  disabled?: boolean;
}) {
  const id = (field: string) => `${prefix}${field}`;
  return (
    <div className="portal-field-grid">
      <label className="portal-edit-field portal-field-wide" htmlFor={id("Line1")}>
        <span>Address line 1</span>
        <input id={id("Line1")} name={id("Line1")} maxLength={200} autoComplete={prefix === "shipping" ? "shipping address-line1" : "section-business address-line1"} required={!disabled} disabled={disabled} defaultValue={address.line1} />
      </label>
      <label className="portal-edit-field portal-field-wide" htmlFor={id("Line2")}>
        <span>Address line 2 <small>Optional</small></span>
        <input id={id("Line2")} name={id("Line2")} maxLength={200} autoComplete={prefix === "shipping" ? "shipping address-line2" : "section-business address-line2"} disabled={disabled} defaultValue={address.line2} />
      </label>
      <label className="portal-edit-field" htmlFor={id("City")}>
        <span>Town or city</span>
        <input id={id("City")} name={id("City")} maxLength={120} autoComplete={prefix === "shipping" ? "shipping address-level2" : "section-business address-level2"} required={!disabled} disabled={disabled} defaultValue={address.city} />
      </label>
      <label className="portal-edit-field" htmlFor={id("County")}>
        <span>County / state / region <small>Optional</small></span>
        <input id={id("County")} name={id("County")} maxLength={120} autoComplete={prefix === "shipping" ? "shipping address-level1" : "section-business address-level1"} disabled={disabled} defaultValue={address.county} />
      </label>
      <label className="portal-edit-field" htmlFor={id("Postcode")}>
        <span>Postcode / ZIP code</span>
        <input id={id("Postcode")} name={id("Postcode")} maxLength={40} autoComplete={prefix === "shipping" ? "shipping postal-code" : "section-business postal-code"} required={!disabled} disabled={disabled} defaultValue={address.postcode} />
      </label>
      <label className="portal-edit-field" htmlFor={id("Country")}>
        <span>Country</span>
        <input id={id("Country")} name={id("Country")} maxLength={120} autoComplete={prefix === "shipping" ? "shipping country-name" : "section-business country-name"} required={!disabled} disabled={disabled} defaultValue={address.country} />
      </label>
    </div>
  );
}

export default function PortalAddresses() {
  const { businessAddress, shippingAddress, shippingSameAsBusiness, market } = useLoaderData<typeof loader>();
  const result = useActionData<typeof action>();
  const navigation = useNavigation();
  const busy = navigation.state === "submitting";
  const [sameAsBusiness, setSameAsBusiness] = useState(shippingSameAsBusiness);
  const defaultCountry = market === "UK" ? "United Kingdom" : market;
  const business = { ...businessAddress, country: businessAddress.country || defaultCountry };
  const shipping = { ...shippingAddress, country: shippingAddress.country || defaultCountry };

  return (
    <main className="portal-main">
      <header className="portal-page-head">
        <div>
          <p className="portal-eyebrow">Address book</p>
          <h1>Business and shipping</h1>
          <p>Keep both addresses complete so invoices and deliveries go to the right place.</p>
        </div>
      </header>

      {result?.error ? <p className="portal-alert alert-error" role="alert">{result.error}</p> : null}
      {result?.notice ? <p className="portal-alert alert-ok" role="status">{result.notice}</p> : null}

      <Form method="post" replace className="portal-address-form">
        <section className="portal-panel">
          <div className="portal-panel-head">
            <div>
              <p className="portal-eyebrow">Registered location</p>
              <h2>Business address</h2>
            </div>
          </div>
          <div className="portal-panel-body">
            <AddressFields prefix="business" address={business} />
          </div>
        </section>

        <section className="portal-panel">
          <div className="portal-panel-head portal-panel-head-check">
            <div>
              <p className="portal-eyebrow">Delivery destination</p>
              <h2>Shipping address</h2>
            </div>
            <label className="portal-check">
              <input
                type="checkbox"
                name="shippingSameAsBusiness"
                checked={sameAsBusiness}
                onChange={(event) => setSameAsBusiness(event.currentTarget.checked)}
              />
              <span>Same as business address</span>
            </label>
          </div>
          <div className={`portal-panel-body${sameAsBusiness ? " is-disabled" : ""}`}>
            {sameAsBusiness ? (
              <p className="portal-address-copy-note">The business address above will be used for shipping.</p>
            ) : null}
            <AddressFields prefix="shipping" address={shipping} disabled={sameAsBusiness} />
          </div>
        </section>

        <div className="portal-form-actions portal-form-actions-sticky">
          <button className="portal-primary" type="submit" disabled={busy}>
            {busy ? "Saving…" : "Save both addresses"}
          </button>
        </div>
      </Form>
    </main>
  );
}
