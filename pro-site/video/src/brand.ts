import {continueRender, delayRender} from "remotion";

const walbaumUrl = new URL("../../public/fonts/walbaum.woff2", import.meta.url).href;
const montserratUrl = new URL(
  "../../public/fonts/montserrat-var.woff2",
  import.meta.url,
).href;

const loadBrandFonts = async () => {
  if (typeof window === "undefined" || typeof FontFace === "undefined") {
    return;
  }

  const registerFont = async ({
    family,
    url,
    weight,
  }: {
    readonly family: string;
    readonly url: string;
    readonly weight: string;
  }) => {
    const font = new FontFace(family, `url("${url}") format("woff2")`, {
      display: "block",
      style: "normal",
      weight,
    });

    await font.load();
    (
      document.fonts as FontFaceSet & {
        add: (fontFace: FontFace) => void;
      }
    ).add(font);
  };

  await Promise.allSettled([
    registerFont({
      family: "Walbaum",
      url: walbaumUrl,
      weight: "400",
    }),
    registerFont({
      family: "Montserrat",
      url: montserratUrl,
      weight: "100 900",
    }),
  ]);
};

const fontsHandle = delayRender("Load Jimmy Coco brand fonts");

void Promise.race([
  loadBrandFonts(),
  new Promise((resolve) => {
    window.setTimeout(resolve, 4000);
  }),
]).finally(() => {
  continueRender(fontsHandle);
});

export const brand = {
  bronze: "#a96135",
  cream: "#f4ede4",
  ink: "#241b16",
  navy: "#123c4d",
  sand: "#ddc8b5",
  white: "#fffaf5",
};

export const sans = "Montserrat, Arial, sans-serif";
export const serif = "Walbaum, Georgia, serif";
