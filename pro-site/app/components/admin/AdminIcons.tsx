/**
 * Inline icons for the admin.
 *
 * Deliberately not a dependency. Oxford uses lucide-react, but adding a package
 * here would break the admin for anyone who has not run an install yet, and the
 * admin needs about fifteen glyphs. These are drawn in the same 24px stroke
 * style so the two admins read alike.
 */

type Props = { size?: number; className?: string };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
});

export const IconFile = ({ size = 20, className }: Props) => (
  <svg {...base(size)} className={className}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
  </svg>
);

export const IconEye = ({ size = 20, className }: Props) => (
  <svg {...base(size)} className={className}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const IconClock = ({ size = 20, className }: Props) => (
  <svg {...base(size)} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const IconCalendar = ({ size = 20, className }: Props) => (
  <svg {...base(size)} className={className}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
);

export const IconSearch = ({ size = 20, className }: Props) => (
  <svg {...base(size)} className={className}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const IconGrid = ({ size = 20, className }: Props) => (
  <svg {...base(size)} className={className}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

export const IconRows = ({ size = 20, className }: Props) => (
  <svg {...base(size)} className={className}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

export const IconPencil = ({ size = 20, className }: Props) => (
  <svg {...base(size)} className={className}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

export const IconExternal = ({ size = 20, className }: Props) => (
  <svg {...base(size)} className={className}>
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
    <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
  </svg>
);

export const IconTrash = ({ size = 20, className }: Props) => (
  <svg {...base(size)} className={className}>
    <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

export const IconPlus = ({ size = 20, className }: Props) => (
  <svg {...base(size)} className={className}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconQrCode = ({ size = 20, className }: Props) => (
  <svg {...base(size)} className={className}>
    <rect x="3" y="3" width="6" height="6" rx="1" />
    <rect x="15" y="3" width="6" height="6" rx="1" />
    <rect x="3" y="15" width="6" height="6" rx="1" />
    <path d="M13 13h3v3h-3zM18 13h3M21 13v3M13 18v3M16 18h2M18 21h3v-3" />
  </svg>
);

export const IconDownload = ({ size = 20, className }: Props) => (
  <svg {...base(size)} className={className}>
    <path d="M12 3v12M7 10l5 5 5-5" />
    <path d="M4 19h16" />
  </svg>
);

export const IconChart = ({ size = 20, className }: Props) => (
  <svg {...base(size)} className={className}>
    <path d="M3 3v18h18" />
    <path d="M7 15v3M12 10v8M17 6v12" />
  </svg>
);

export const IconTrend = ({ size = 20, className }: Props) => (
  <svg {...base(size)} className={className}>
    <path d="m3 17 6-6 4 4 8-8" />
    <path d="M15 7h6v6" />
  </svg>
);

export const IconCrown = ({ size = 20, className }: Props) => (
  <svg {...base(size)} className={className}>
    <path d="M3 7l4 4 5-7 5 7 4-4-2 12H5Z" />
  </svg>
);

export const IconGlobe = ({ size = 20, className }: Props) => (
  <svg {...base(size)} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18Z" />
  </svg>
);

export const IconPhone = ({ size = 20, className }: Props) => (
  <svg {...base(size)} className={className}>
    <rect x="7" y="2" width="10" height="20" rx="2.5" />
    <path d="M11 18h2" />
  </svg>
);

export const IconPulse = ({ size = 20, className }: Props) => (
  <svg {...base(size)} className={className}>
    <path d="M3 12h4l2.5-7 5 14L17 12h4" />
  </svg>
);

export const IconUsers = ({ size = 20, className }: Props) => (
  <svg {...base(size)} className={className}>
    <path d="M16 20v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V20" />
    <circle cx="9" cy="7" r="3.5" />
    <path d="M22 20v-1.5a4 4 0 0 0-3-3.87M16 3.6a4 4 0 0 1 0 6.8" />
  </svg>
);

export const IconWarning = ({ size = 20, className }: Props) => (
  <svg {...base(size)} className={className}>
    <path d="M12 3.5 22 20H2Z" />
    <path d="M12 10v4M12 17h.01" />
  </svg>
);
