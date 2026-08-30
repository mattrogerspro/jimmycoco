import { Config } from "@remotion/cli/config";

// Remotion automatically resolves relative paths from the closest package.json
Config.setPublicDir("../public");
Config.setRspack(true);
Config.setChromiumOpenGlRenderer("angle");
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setPublicLicenseKey("free-license");