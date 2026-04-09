import { Link } from "react-router-dom";

interface ElectricButtonProps {
  to?: string;
  href?: string;
  children: React.ReactNode;
  fullWidth?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export default function ElectricButton({ to, href, children, fullWidth, onClick, type, disabled }: ElectricButtonProps) {
  const content = (
    <div className="d1b0y">
      {/* Text pill */}
      <div className="k6u3f">{children}</div>

      {/* Animated icon circle */}
      <div className="cga8x g3l2a">
        <div className="l9p1n">
          <div className="t5c2e" />
          <div className="r8v6d">
            <div className="w4h9j" />
          </div>
        </div>
        <div className="z3m5q">
          <div className="f2k7s" />
        </div>
        <div className="eb-icon-wrap">
          <svg
            className="s0a8l"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 17L17 7M17 7H7M17 7V17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );

  const cls = `eb-link${fullWidth ? " eb-full" : ""}${disabled ? " opacity-50 pointer-events-none" : ""}`;

  if (type === "submit" || (onClick && !to && !href)) {
    return (
      <button type={type || "button"} onClick={onClick} disabled={disabled} className={cls} style={{ background: "none", border: "none", padding: 0, cursor: disabled ? "not-allowed" : "pointer" }}>
        {content}
      </button>
    );
  }

  if (to && !disabled) {
    return (
      <Link to={to} className={cls} style={{ textDecoration: "none" }}>
        {content}
      </Link>
    );
  }

  if (disabled) {
    return (
      <div className={cls} style={{ textDecoration: "none", cursor: "not-allowed" }}>
        {content}
      </div>
    );
  }

  return (
    <a href={href || "#"} className={cls} style={{ textDecoration: "none" }}>
      {content}
    </a>
  );
}
