// 全站共用的線條圖示，皆以 currentColor 上色，方便用 CSS 控制顏色
const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function MenuIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" {...props}>
      <g {...base}>
        <path d="M4 7h16M4 12h16M4 17h16" />
      </g>
    </svg>
  );
}

export function CloseIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" {...props}>
      <g {...base}>
        <path d="M6 6l12 12M18 6L6 18" />
      </g>
    </svg>
  );
}

export function UserIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" {...props}>
      <g {...base}>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="10" r="3.2" />
        <path d="M6.2 19a6.2 6.2 0 0 1 11.6 0" />
      </g>
    </svg>
  );
}

export function CartIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" {...props}>
      <g {...base}>
        <path d="M3 4h2.2l2.3 10.4a2 2 0 0 0 2 1.6h7.1a2 2 0 0 0 2-1.5L20 8H6" />
        <circle cx="10" cy="20" r="1.3" />
        <circle cx="17" cy="20" r="1.3" />
      </g>
    </svg>
  );
}

export function HeartIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" {...props}>
      <g {...base}>
        <path d="M12 20s-7.3-4.4-8.8-9A4.6 4.6 0 0 1 12 7.3 4.6 4.6 0 0 1 20.8 11c-1.5 4.6-8.8 9-8.8 9z" />
      </g>
    </svg>
  );
}

export function ReceiptIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" {...props}>
      <g {...base}>
        <path d="M6 3h12v18l-2-1.4L14 21l-2-1.4L10 21l-2-1.4L6 21z" />
        <path d="M9 8h6M9 12h6" />
      </g>
    </svg>
  );
}

export function ChevronRightIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
      <g {...base}>
        <path d="M9 5l7 7-7 7" />
      </g>
    </svg>
  );
}

export function ArrowLeftIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" {...props}>
      <g {...base}>
        <path d="M15 5l-7 7 7 7" />
      </g>
    </svg>
  );
}

export function ArrowRightIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" {...props}>
      <g {...base}>
        <path d="M9 5l7 7-7 7" />
      </g>
    </svg>
  );
}

export function SearchIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" {...props}>
      <g {...base}>
        <circle cx="11" cy="11" r="6.5" />
        <path d="M16 16l4.5 4.5" />
      </g>
    </svg>
  );
}

export function InstagramIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" {...props}>
      <g {...base}>
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}

export function GmailIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" {...props}>
      <g {...base}>
        <rect x="2.5" y="5" width="19" height="14" rx="2.6" />
        <path d="M3.4 7.2 12 13.6l8.6-6.4" />
      </g>
    </svg>
  );
}
