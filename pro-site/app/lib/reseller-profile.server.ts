import { createSupabaseServiceClient } from "./supabase.server";

export type ResellerAddress = {
  line1: string;
  line2: string;
  city: string;
  county: string;
  postcode: string;
  country: string;
};

const EMPTY_ADDRESS: ResellerAddress = {
  line1: "",
  line2: "",
  city: "",
  county: "",
  postcode: "",
  country: "",
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function formText(form: FormData, name: string, maxLength: number) {
  const value = text(form.get(name));
  if (value.length > maxLength) throw new Error(`${name} is too long.`);
  return value;
}

export function normaliseResellerAddress(value: unknown): ResellerAddress {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { ...EMPTY_ADDRESS };
  const address = value as Record<string, unknown>;
  return {
    line1: text(address.line1),
    line2: text(address.line2),
    city: text(address.city),
    county: text(address.county),
    postcode: text(address.postcode),
    country: text(address.country),
  };
}

export function resellerAddressFromForm(form: FormData, prefix: string): ResellerAddress {
  return {
    line1: formText(form, `${prefix}Line1`, 200),
    line2: formText(form, `${prefix}Line2`, 200),
    city: formText(form, `${prefix}City`, 120),
    county: formText(form, `${prefix}County`, 120),
    postcode: formText(form, `${prefix}Postcode`, 40),
    country: formText(form, `${prefix}Country`, 120),
  };
}

export function validateCompleteAddress(address: ResellerAddress, label: string) {
  const missing = [
    ["address line 1", address.line1],
    ["town or city", address.city],
    ["postcode", address.postcode],
    ["country", address.country],
  ].filter(([, value]) => !value).map(([field]) => field);

  if (missing.length > 0) {
    throw new Error(`${label} needs ${missing.join(", ")}.`);
  }
}

export function resellerAddressIsComplete(address: ResellerAddress) {
  return Boolean(address.line1 && address.city && address.postcode && address.country);
}

type PortalProfileIdentity = {
  resellerId: string;
  userId: string | null;
};

async function updateOwnProfile(
  identity: PortalProfileIdentity,
  patch: Record<string, unknown>,
) {
  if (!identity.userId) throw new Error("This portal account is not linked to a sign-in.");

  const service = createSupabaseServiceClient();
  const { data, error } = await service
    .from("resellers")
    .update(patch)
    .eq("id", identity.resellerId)
    .eq("user_id", identity.userId)
    .select("id")
    .maybeSingle();

  if (error) throw new Error(`Could not update the account: ${error.message}`);
  if (!data) throw new Error("The account could not be matched to this sign-in.");
}

export async function updatePortalBusinessDetails(
  identity: PortalProfileIdentity,
  form: FormData,
) {
  const businessName = formText(form, "businessName", 200);
  const contactName = formText(form, "contactName", 200);
  const phone = formText(form, "phone", 60);

  if (!businessName) throw new Error("Enter the business name.");
  if (!contactName) throw new Error("Enter the primary contact name.");

  await updateOwnProfile(identity, {
    business_name: businessName,
    contact_name: contactName,
    phone: phone || null,
  });
}

export async function updatePortalAddresses(
  identity: PortalProfileIdentity,
  form: FormData,
) {
  const businessAddress = resellerAddressFromForm(form, "business");
  validateCompleteAddress(businessAddress, "Business address");

  const shippingSameAsBusiness = form.get("shippingSameAsBusiness") === "on";
  const shippingAddress = shippingSameAsBusiness
    ? businessAddress
    : resellerAddressFromForm(form, "shipping");
  validateCompleteAddress(shippingAddress, "Shipping address");

  await updateOwnProfile(identity, {
    address: businessAddress,
    shipping_address: shippingAddress,
  });
}

export function addressesMatch(left: ResellerAddress, right: ResellerAddress) {
  return Object.keys(EMPTY_ADDRESS).every(
    (key) => left[key as keyof ResellerAddress] === right[key as keyof ResellerAddress],
  );
}
