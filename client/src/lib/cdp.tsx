import { CDPReactProvider } from "@coinbase/cdp-react";
import type { ReactNode } from "react";

const CDP_PROJECT_ID = import.meta.env.VITE_CDP_PROJECT_ID;

if (!CDP_PROJECT_ID) {
  console.warn("VITE_CDP_PROJECT_ID not set — auth will not work");
}

export function CDPProvider({ children }: { children: ReactNode }) {
  if (!CDP_PROJECT_ID) return <>{children}</>;

  return (
    <CDPReactProvider
      config={{
        projectId: CDP_PROJECT_ID,
        ethereum: { createOnLogin: "smart" },
        authMethods: ["email"],
      }}
    >
      {children}
    </CDPReactProvider>
  );
}
