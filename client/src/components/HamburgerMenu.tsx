import { useCallback, useState } from "react";
import { useAppStore } from "../store";
import AuthButton from "./AuthButton";

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const setShowPrivacy = useAppStore((s) => s.setShowPrivacy);

  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      {open && (
        <button
          type="button"
          className="hamburger-backdrop"
          aria-label="Close menu"
          onClick={close}
        />
      )}
      <div className="hamburger-menu">
        <button
          type="button"
          className="hamburger-toggle"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Menu"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            role="img"
            aria-label="Menu icon"
          >
            <rect y="3" width="20" height="2" rx="1" fill="#333" />
            <rect y="9" width="20" height="2" rx="1" fill="#333" />
            <rect y="15" width="20" height="2" rx="1" fill="#333" />
          </svg>
        </button>

        {open && (
          <div className="hamburger-dropdown">
            <div className="hamburger-item hamburger-auth">
              <AuthButton />
            </div>
            <button
              type="button"
              className="hamburger-item"
              onClick={() => {
                setShowPrivacy(true);
                close();
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                role="img"
                aria-label="Shield icon"
              >
                <path
                  d="M8 1L2 4v4c0 3.5 2.5 6.4 6 7 3.5-.6 6-3.5 6-7V4L8 1z"
                  stroke="#333"
                  strokeWidth="1.5"
                  fill="none"
                />
              </svg>
              Privacy
            </button>
          </div>
        )}
      </div>
    </>
  );
}
