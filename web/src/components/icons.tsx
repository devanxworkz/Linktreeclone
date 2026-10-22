/* Original, minimal icon set drawn in-house (stroke style). No third-party
   icon assets are copied. Sized by className, coloured by currentColor. */
import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="1em"
      height="1em"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const IconHome = (p: IconProps) => (
  <Base {...p}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M9 21v-6h6v6" /></Base>
);
export const IconUser = (p: IconProps) => (
  <Base {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.5-6 8-6s8 2 8 6" /></Base>
);
export const IconLink = (p: IconProps) => (
  <Base {...p}><path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" /><path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" /></Base>
);
export const IconBag = (p: IconProps) => (
  <Base {...p}><path d="M6 7h12l1 13H5L6 7Z" /><path d="M9 7a3 3 0 0 1 6 0" /></Base>
);
export const IconPalette = (p: IconProps) => (
  <Base {...p}><path d="M12 3a9 9 0 1 0 0 18h1a3 3 0 0 0 0-6h-1a2 2 0 0 1 0-4h4a4 4 0 0 0 4-4 9 9 0 0 0-8-4Z" /><circle cx="8" cy="9" r="1" /><circle cx="8" cy="14" r="1" /></Base>
);
export const IconEye = (p: IconProps) => (
  <Base {...p}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></Base>
);
export const IconGear = (p: IconProps) => (
  <Base {...p}><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" /></Base>
);
export const IconChart = (p: IconProps) => (
  <Base {...p}><path d="M4 20V4" /><path d="M4 20h16" /><path d="M8 16v-5M12 16V7M16 16v-8" /></Base>
);
export const IconUsers = (p: IconProps) => (
  <Base {...p}><circle cx="9" cy="8" r="3.5" /><path d="M3 20c0-3 2.7-5 6-5s6 2 6 5" /><path d="M16 5.5a3.5 3.5 0 0 1 0 7M21 20c0-2.4-1.6-4.2-4-4.8" /></Base>
);
export const IconPlus = (p: IconProps) => (
  <Base {...p}><path d="M12 5v14M5 12h14" /></Base>
);
export const IconTrash = (p: IconProps) => (
  <Base {...p}><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" /></Base>
);
export const IconGrip = (p: IconProps) => (
  <Base {...p}><circle cx="9" cy="6" r="1" /><circle cx="15" cy="6" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="9" cy="18" r="1" /><circle cx="15" cy="18" r="1" /></Base>
);
export const IconExternal = (p: IconProps) => (
  <Base {...p}><path d="M14 4h6v6" /><path d="M20 4 11 13" /><path d="M18 14v5H5V6h5" /></Base>
);
export const IconLogo = (p: IconProps) => (
  <Base {...p} strokeWidth="2"><path d="M12 3v18" /><path d="M12 8c-2-3-6-3-8 0 2 3 6 3 8 0Z" /><path d="M12 8c2-3 6-3 8 0-2 3-6 3-8 0Z" /></Base>
);
export const IconInstagram = (p: IconProps) => (
  <Base {...p}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></Base>
);
export const IconYoutube = (p: IconProps) => (
  <Base {...p}><rect x="2.5" y="6" width="19" height="12" rx="4" /><path d="M11 9.5 15 12l-4 2.5v-5Z" fill="currentColor" stroke="none" /></Base>
);
export const IconX = (p: IconProps) => (
  <Base {...p}><path d="M4 4l16 16M20 4 4 20" /></Base>
);
export const IconLinkedin = (p: IconProps) => (
  <Base {...p}><rect x="3" y="3" width="18" height="18" rx="4" /><path d="M8 10.5V17" /><circle cx="8" cy="7.5" r="0.8" fill="currentColor" stroke="none" /><path d="M12 17v-6.5" /><path d="M12 13.5c0-1.7 1.2-3 2.75-3s2.75 1.3 2.75 3V17" /></Base>
);
export const IconFacebook = (p: IconProps) => (
  <Base {...p}><rect x="3" y="3" width="18" height="18" rx="5" /><path d="M15.5 8H14a2.5 2.5 0 0 0-2.5 2.5V21" /><path d="M10 13.5h5" /></Base>
);
export const IconTiktok = (p: IconProps) => (
  <Base {...p}><path d="M14.5 4.5v9a3.5 3.5 0 1 1-3.4-3.5" /><path d="M14.5 6.5c.9 1.5 2.3 2.2 3.9 2.3" /></Base>
);
export const IconGlobe = (p: IconProps) => (
  <Base {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></Base>
);
export const IconWhatsapp = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width="1em" height="1em" {...p}>
    <path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.95.56 3.77 1.54 5.31L2 22l4.98-1.7a9.9 9.9 0 0 0 5.06 1.39h.01c5.43 0 9.84-4.4 9.84-9.84 0-2.63-1.02-5.1-2.88-6.96A9.78 9.78 0 0 0 12.04 2Zm0 1.8c2.14 0 4.14.83 5.65 2.34a7.95 7.95 0 0 1 2.34 5.66c0 4.43-3.6 8.03-8.03 8.03a8.1 8.1 0 0 1-4.12-1.13l-.3-.17-3.1 1.06 1.05-3-.18-.31a7.96 7.96 0 0 1-1.22-4.25c0-4.43 3.6-8.03 8.03-8.03Zm-2.6 4.2c-.14 0-.36.05-.55.26-.19.2-.72.7-.72 1.71 0 1 .73 1.98.83 2.12.1.14 1.42 2.17 3.45 3.05.48.2.86.33 1.15.42.48.15.92.13 1.27.08.39-.06 1.19-.49 1.36-.96.17-.47.17-.87.12-.96-.05-.08-.19-.13-.4-.23-.2-.1-1.2-.59-1.38-.66-.18-.07-.32-.1-.46.1-.13.2-.52.66-.64.8-.12.13-.24.15-.44.05-.2-.1-.86-.32-1.63-1.01-.6-.54-1.01-1.2-1.13-1.4-.12-.2-.01-.31.09-.41.09-.09.2-.24.3-.36.1-.12.14-.2.2-.34.07-.13.04-.25-.01-.35-.05-.1-.44-1.1-.63-1.5-.16-.34-.33-.35-.45-.36h-.4Z" />
  </svg>
);
export const IconCopy = (p: IconProps) => (
  <Base {...p}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></Base>
);
export const IconCheck = (p: IconProps) => (
  <Base {...p}><path d="m5 13 4 4L19 7" /></Base>
);
export const IconShield = (p: IconProps) => (
  <Base {...p}><path d="M12 3 4 6v6c0 5 3.4 8 8 9 4.6-1 8-4 8-9V6l-8-3Z" /><path d="m9 12 2 2 4-4" /></Base>
);
export const IconUp = (p: IconProps) => (<Base {...p}><path d="m6 15 6-6 6 6" /></Base>);
export const IconDown = (p: IconProps) => (<Base {...p}><path d="m6 9 6 6 6-6" /></Base>);
export const IconMenu = (p: IconProps) => (<Base {...p}><path d="M4 7h16M4 12h16M4 17h16" /></Base>);
export const IconClose = (p: IconProps) => (<Base {...p}><path d="M6 6l12 12M18 6 6 18" /></Base>);
export const IconMegaphone = (p: IconProps) => (
  <Base {...p}><path d="M3 11v2a1 1 0 0 0 1 1h2l4 4V6L6 10H4a1 1 0 0 0-1 1Z" /><path d="M14 7.5a5 5 0 0 1 0 9" /><path d="M17 5a8 8 0 0 1 0 14" /></Base>
);
export const IconFlag = (p: IconProps) => (
  <Base {...p}><path d="M5 3v18" /><path d="M5 4h11l-1.5 4L16 12H5" /></Base>
);
export const IconCard = (p: IconProps) => (
  <Base {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18" /><path d="M7 15h3" /></Base>
);
export const IconList = (p: IconProps) => (
  <Base {...p}><path d="M8 6h12M8 12h12M8 18h12" /><circle cx="4" cy="6" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" /></Base>
);
export const IconRefresh = (p: IconProps) => (
  <Base {...p}><path d="M20 11a8 8 0 0 0-14-4L4 9" /><path d="M4 5v4h4" /><path d="M4 13a8 8 0 0 0 14 4l2-2" /><path d="M20 19v-4h-4" /></Base>
);
