const VARIANTS = {
  accent: "bg-accent-soft text-accent",
  primary: "bg-primary-soft text-primary",
  neutral: "bg-black/[0.05] text-ink-soft",
  danger: "bg-danger/10 text-danger",
};

export default function Badge({ children, variant = "neutral" }) {
  return (
    <span
      className={`inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-medium tracking-wide ${VARIANTS[variant]}`}
    >
      {children}
    </span>
  );
}
