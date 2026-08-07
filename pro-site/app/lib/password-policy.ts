/**
 * Password policy ported from above-guide-server (backend/utils/passwordPolicy.js
 * and the PasswordStrength builder component) so the pro site enforces exactly
 * the same rules. Client-safe: the register form and the server action both
 * import this module, so the meter can never disagree with the validation.
 */

const COMMON_PASSWORDS = [
  "password", "passw0rd", "123456", "12345678", "123456789", "qwerty",
  "qwertyuiop", "letmein", "welcome", "admin", "iloveyou", "football",
  "monkey", "dragon", "sunshine", "princess", "abc123", "111111", "000000",
  "654321", "trustno1",
];

const SEQUENCE_BASES = [
  "abcdefghijklmnopqrstuvwxyz",
  "qwertyuiop",
  "asdfghjkl",
  "zxcvbnm",
  "0123456789",
];

export const PASSWORD_POLICY = {
  minLength: 12,
  longLength: 16,
  minClasses: 3,
  minClassesIfLong: 2,
} as const;

export type PasswordChecks = {
  lengthOk: boolean;
  classesOk: boolean;
  noPatterns: boolean;
  noPersonalInfo: boolean;
};

export type PasswordTypes = {
  hasLower: boolean;
  hasUpper: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
};

export type PasswordEvaluation = {
  isStrong: boolean;
  message: string;
  score: number;
  checks: PasswordChecks;
  types: PasswordTypes;
};

function personalFragments(name?: string | null, email?: string | null) {
  const fragments: string[] = [];
  const add = (value: string) => {
    const trimmed = String(value ?? "").trim().toLowerCase();
    if (trimmed.length >= 3) fragments.push(trimmed);
  };

  if (name) String(name).split(/\s+/).forEach(add);

  if (email) {
    const [localPart, domainPart] = String(email).toLowerCase().split("@");
    if (localPart) localPart.split(/[._+-]/).forEach(add);
    if (domainPart) domainPart.split(".").forEach(add);
  }

  return [...new Set(fragments)];
}

function hasSequentialChars(value: string) {
  const normalized = String(value ?? "").toLowerCase();
  return SEQUENCE_BASES.some((sequence) => {
    const reversed = sequence.split("").reverse().join("");
    return [sequence, reversed].some((seq) => {
      for (let i = 0; i <= seq.length - 4; i += 1) {
        if (normalized.includes(seq.slice(i, i + 4))) return true;
      }
      return false;
    });
  });
}

export function evaluatePassword(
  password: string,
  context: { name?: string | null; email?: string | null } = {},
): PasswordEvaluation {
  const value = String(password ?? "");
  const normalized = value.toLowerCase();

  const lengthOk = value.length >= PASSWORD_POLICY.minLength;
  const longLength = value.length >= PASSWORD_POLICY.longLength;
  const hasLower = /[a-z]/.test(value);
  const hasUpper = /[A-Z]/.test(value);
  const hasNumber = /\d/.test(value);
  const hasSymbol = /[^A-Za-z0-9]/.test(value);

  const classCount = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;
  const classesOk =
    classCount >= PASSWORD_POLICY.minClasses ||
    (longLength && classCount >= PASSWORD_POLICY.minClassesIfLong);

  const hasCommon = COMMON_PASSWORDS.some((entry) => normalized.includes(entry));
  const hasSequence = hasSequentialChars(normalized);
  const hasRepeats = /(.)\1\1\1/.test(value);
  const noPatterns = !(hasCommon || hasSequence || hasRepeats);

  const fragments = personalFragments(context.name, context.email);
  const noPersonalInfo = !fragments.some((fragment) => normalized.includes(fragment));

  const checks: PasswordChecks = { lengthOk, classesOk, noPatterns, noPersonalInfo };
  const passed = Object.values(checks).filter(Boolean).length;
  const score = Math.round((passed / Object.keys(checks).length) * 100);

  let message = "";
  if (!lengthOk) {
    message = `Password must be at least ${PASSWORD_POLICY.minLength} characters`;
  } else if (!classesOk) {
    message = `Use at least ${PASSWORD_POLICY.minClasses} character types, or ${PASSWORD_POLICY.minClassesIfLong} types if ${PASSWORD_POLICY.longLength}+ characters`;
  } else if (!noPatterns) {
    message = "Avoid common passwords, sequences, or repeated characters";
  } else if (!noPersonalInfo) {
    message = "Password should not include your name or email";
  }

  return {
    isStrong: lengthOk && classesOk && noPatterns && noPersonalInfo,
    message,
    score,
    checks,
    types: { hasLower, hasUpper, hasNumber, hasSymbol },
  };
}

export function strengthLabel(score: number, hasValue: boolean) {
  if (!hasValue) return "Start typing";
  if (score >= 85) return "Strong";
  if (score >= 65) return "Good";
  if (score >= 40) return "Fair";
  return "Weak";
}

export function strengthTone(score: number, hasValue: boolean) {
  if (!hasValue) return "idle" as const;
  if (score >= 85) return "strong" as const;
  if (score >= 65) return "good" as const;
  if (score >= 40) return "fair" as const;
  return "weak" as const;
}
