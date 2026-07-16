import { rmSync } from "node:fs";

// Every public route is explicitly prerendered; unknown URLs should receive the
// host's real 404 response rather than falling through to an SPA document.
rmSync(new URL("../build/client/__spa-fallback.html", import.meta.url), { force: true });
