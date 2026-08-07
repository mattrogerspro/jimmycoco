import { useMemo } from "react";
import {
  PASSWORD_POLICY,
  evaluatePassword,
  strengthLabel,
  strengthTone,
} from "../../lib/password-policy";

function Tick({ passed }: { passed: boolean }) {
  return passed ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="m8.2 12.4 2.6 2.6 5-5.4" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

type Props = { password: string; email?: string; name?: string };

export function PasswordStrength({ password, email, name }: Props) {
  const result = useMemo(
    () => evaluatePassword(password, { email, name }),
    [password, email, name],
  );
  const hasValue = Boolean(password);
  const tone = strengthTone(result.score, hasValue);

  const requirements: Array<[boolean, string]> = [
    [result.checks.lengthOk, `At least ${PASSWORD_POLICY.minLength} characters`],
    [
      result.checks.classesOk,
      `${PASSWORD_POLICY.minClasses} of 4 types, or ${PASSWORD_POLICY.minClassesIfLong} types if ${PASSWORD_POLICY.longLength}+ characters`,
    ],
    [result.checks.noPatterns, "Avoid common passwords, sequences or repeats"],
    [result.checks.noPersonalInfo, "Does not include your name or email"],
  ];

  const types: Array<[boolean, string]> = [
    [result.types.hasUpper, "Uppercase"],
    [result.types.hasLower, "Lowercase"],
    [result.types.hasNumber, "Number"],
    [result.types.hasSymbol, "Symbol"],
  ];

  return (
    <div className="pw-strength" data-tone={tone}>
      <div className="pw-head">
        <b>Password strength</b>
        <span className="pw-label">{strengthLabel(result.score, hasValue)}</span>
      </div>

      <div
        className="pw-meter"
        role="progressbar"
        aria-valuenow={hasValue ? result.score : 0}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Password strength"
      >
        <span style={{ width: `${hasValue ? result.score : 0}%` }} />
      </div>

      <p className="pw-title">Requirements</p>
      <ul className="pw-reqs">
        {requirements.map(([passed, text]) => (
          <li key={text} data-passed={passed ? "true" : "false"}>
            <i aria-hidden="true">
              <Tick passed={passed} />
            </i>
            <span>{text}</span>
          </li>
        ))}
      </ul>

      <p className="pw-title">Character types</p>
      <ul className="pw-types">
        {types.map(([active, label]) => (
          <li key={label} data-active={active ? "true" : "false"}>
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
