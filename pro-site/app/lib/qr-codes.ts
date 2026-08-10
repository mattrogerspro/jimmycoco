export const QR_REDIRECT_ORIGIN = "https://jimmycoco.pro";

export function qrRedirectUrl(code: string) {
  return new URL(`/q/${code}`, QR_REDIRECT_ORIGIN).toString();
}
