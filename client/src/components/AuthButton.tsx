import { useEvmAddress, useIsSignedIn } from "@coinbase/cdp-hooks";
import {
  AuthButton as CDPAuthButton,
  SignOutButton,
} from "@coinbase/cdp-react";
import { truncateAddress } from "../lib/theme";

export default function AuthButton() {
  const { isSignedIn } = useIsSignedIn();
  const { evmAddress } = useEvmAddress();

  if (isSignedIn) {
    const shortAddr = evmAddress ? truncateAddress(evmAddress) : "";

    return (
      <div className="flex items-center gap-2 bg-surface-raised rounded-full px-3 py-1.5 border border-edge">
        <span
          className="text-xs font-mono text-blue-gray"
          title={evmAddress || ""}
        >
          {shortAddr}
        </span>
        <SignOutButton className="text-xs text-muted bg-transparent border-none cursor-pointer hover:text-coral transition-colors" />
      </div>
    );
  }

  return (
    <CDPAuthButton className="bg-surface-raised border border-edge rounded-full px-4 py-2 text-sm font-medium text-bone cursor-pointer hover:border-cyan/50 hover:text-cyan transition-all" />
  );
}
