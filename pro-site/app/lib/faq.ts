/**
 * Salon FAQ — single source of truth.
 *
 * The visible accordion on the product page and the FAQPage JSON-LD are both
 * generated from this array. Do not hand-write either one separately: Google
 * requires that marked-up answers are visible on the page, and keeping two
 * copies is how they silently drift apart.
 *
 * Every answer here must be traceable to a fact stated elsewhere on the site.
 * If you cannot point at the source, do not add the answer.
 *
 * House style, because these are written to be quoted by AI assistants as much
 * as read by people:
 *  - Lead with the direct answer in the first sentence. No preamble.
 *  - Include the specific number. "Approximately 28" beats "plenty".
 *  - Keep each answer self-contained, so it still makes sense lifted out alone.
 *  - 40-90 words. Long enough to be useful, short enough to quote whole.
 */

export type FaqItem = { question: string; answer: string };

export const SALON_FAQ: FaqItem[] = [
  {
    question: "How many spray tans do you get from a 1 litre bottle?",
    answer:
      "Approximately 28 full-body tans from one litre, based on the recommended dose of under 35ml per session. At the standard list price of \u00a360 per litre that works out at roughly \u00a32.14 of solution per tan. A salon charging \u00a325 a tan therefore recovers the cost of the bottle within the first three clients.",
  },
  {
    question: "What DHA percentage is the Malibu professional solution?",
    answer:
      "The Malibu professional solution is 10% DHA. That sits in the mid-to-upper range for professional salon use: strong enough to build a deep bronze on olive and darker skin, but controllable enough on fair skin that a single light pass gives a natural sunkissed result rather than an obvious tan.",
  },
  {
    question: "How long does the tan take to develop?",
    answer:
      "Colour develops over 6 to 8 hours. The client can continue their day normally while it develops, then rinse. Because development is gradual, depth is controlled by how many layers you apply rather than by how long the client waits, which is what makes the single universal shade workable across every skin tone.",
  },
  {
    question: "Does one universal shade really suit every skin tone?",
    answer:
      "Yes. The Malibu shade is a single custom-blended universal bronze designed to work with a client\u2019s own undertones rather than override them, and depth is built through application rather than through picking a different bottle. Apply one light layer for fair skin, and build a second pass for deeper or more experienced tanners.",
  },
  {
    question: "Which shade depths should a salon stock?",
    answer:
      "Most salons stock two or three depths to cover their full client mix. Light suits fair skin and first-time clients, Medium covers light-to-medium skin at any experience level, Medium/Dark is the most popular choice and suits medium-to-olive skin, and Dark suits olive-to-dark skin and experienced tanners. All four develop over the same 6 to 8 hours.",
  },
  {
    question: "Will it turn clients orange?",
    answer:
      "No. The formula is blended with an anti-orange tone correction and skin-tone-sympathetic pigments that enhance a client\u2019s natural undertones instead of sitting on top of them. The most common cause of an orange result is over-application rather than the solution itself, which is why the shade method training covers dose control on the first call.",
  },
  {
    question: "Will it work with my existing spray tan machine?",
    answer:
      "The solution is formulated for standard professional HVLP spray systems, so in most cases it works with equipment a salon already owns and there is nothing new to buy. Your specific setup is confirmed on the trade call before your first order, so you are not guessing about compatibility.",
  },
  {
    question: "What is actually in the formula?",
    answer:
      "Colloidal gold for a soft-focus radiant finish, hyaluronic acid which attracts up to 1000 times its weight in water, Pentavitin to lock moisture in place, blue daisy to soothe sensitive skin, and Jimmy\u2019s signature scent with aromaguard fine-fragrance technology to counter the usual developing-tan smell.",
  },
  {
    question: "Can I try it on a real client before ordering?",
    answer:
      "Yes. New salons can request a complimentary professional trial at no cost and with no commitment, so you can judge the colour on a real client in your own booth before committing to a first litre. Salons that would rather start with stock can order the litre directly at standard list price.",
  },
  {
    question: "Do you supply mobile spray tan professionals?",
    answer:
      "Yes. Trade accounts cover salons, spas, mobile professionals and multi-site groups. The 1 litre salon size is the standard trade unit for all of them, and mobile professionals are not held to a different minimum than a fixed-site salon.",
  },
  {
    question: "Is training included with a trade account?",
    answer:
      "Yes, at no extra cost. Every salon account includes Jimmy\u2019s shade method training and guide, plus one hour of online training with Jimmy Coco. Salons that complete the training and short assessment become a Jimmy Coco Certified Salon and receive an official certificate and accreditation badge to display in the salon, on their website and across social channels.",
  },
  {
    question: "What are the trade terms and how fast is delivery?",
    answer:
      "Trade terms are confirmed on your setup call before any payment is taken; the pricing shown on the product page is standard list. UK and Northern Ireland delivery is 1 to 3 working days at \u00a35.50, free over \u00a340. Orders placed after 1pm dispatch the following working day. Every order carries a 14-day return policy with a 100% money-back guarantee.",
  },
];

/** FAQPage JSON-LD, generated from the same array the page renders. */
export const faqPageSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: SALON_FAQ.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};
