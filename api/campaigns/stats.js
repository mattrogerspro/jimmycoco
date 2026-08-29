// Vercel filesystem entrypoint. The implementation lives in server/ so it can
// be shared and tested without exposing duplicate runtime logic under api/.
export { default } from "../../server/campaigns/stats.js";
export * from "../../server/campaigns/stats.js";
