import { useCallback, useEffect, useState } from "react";
import {
  OPEN_CONSENT_EVENT,
  applyConsent,
  readConsent,
  writeConsent,
} from "../../lib/consent";

type Panel = "hidden" | "banner" | "preferences";

export function CookieConsent() {
  const [panel, setPanel] = useState<Panel>("hidden");
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const stored = readConsent();
    if (stored) {
      setAnalytics(stored.analytics);
      setMarketing(stored.marketing);
      applyConsent(stored);
    } else {
      setPanel("banner");
    }

    const reopen = () => {
      const current = readConsent();
      if (current) {
        setAnalytics(current.analytics);
        setMarketing(current.marketing);
      }
      setPanel("preferences");
    };

    window.addEventListener(OPEN_CONSENT_EVENT, reopen);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, reopen);
  }, []);

  const save = useCallback((choice: { analytics: boolean; marketing: boolean }) => {
    writeConsent(choice);
    setAnalytics(choice.analytics);
    setMarketing(choice.marketing);
    setPanel("hidden");
  }, []);

  if (panel === "hidden") return null;

  return (
    <div className="cc-root" role="dialog" aria-modal="false" aria-label="Cookie choices">
      <div className="cc-panel">
        {panel === "banner" ? (
          <>
            <div className="cc-copy">
              <h2>We use cookies</h2>
              <p>
                Essential cookies keep this site working. With your permission we also use
                analytics cookies to understand how salons use the site. You can change your
                mind at any time.
              </p>
            </div>
            <div className="cc-actions">
              <button
                type="button"
                className="cc-btn cc-btn-primary"
                onClick={() => save({ analytics: true, marketing: true })}
              >
                Accept all
              </button>
              <button
                type="button"
                className="cc-btn"
                onClick={() => save({ analytics: false, marketing: false })}
              >
                Reject non-essential
              </button>
              <button type="button" className="cc-link" onClick={() => setPanel("preferences")}>
                Manage preferences
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="cc-copy">
              <h2>Cookie preferences</h2>
              <p>Essential cookies cannot be switched off — they keep sign-in and forms working.</p>
            </div>

            <ul className="cc-options">
              <li>
                <div>
                  <b>Essential</b>
                  <span>Sign-in, security and form submission. Always on.</span>
                </div>
                <span className="cc-always">Always on</span>
              </li>
              <li>
                <label>
                  <div>
                    <b>Analytics</b>
                    <span>Google Analytics — which pages are used, anonymised.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(event) => setAnalytics(event.target.checked)}
                  />
                </label>
              </li>
              <li>
                <label>
                  <div>
                    <b>Marketing</b>
                    <span>Advertising and remarketing measurement.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={marketing}
                    onChange={(event) => setMarketing(event.target.checked)}
                  />
                </label>
              </li>
            </ul>

            <div className="cc-actions">
              <button
                type="button"
                className="cc-btn cc-btn-primary"
                onClick={() => save({ analytics, marketing })}
              >
                Save preferences
              </button>
              <button
                type="button"
                className="cc-btn"
                onClick={() => save({ analytics: true, marketing: true })}
              >
                Accept all
              </button>
            </div>
          </>
        )}

        <p className="cc-legal">
          Read our{" "}
          <a href="https://jimmycoco.co.uk/policies/privacy-policy" target="_blank" rel="noreferrer">
            privacy policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
