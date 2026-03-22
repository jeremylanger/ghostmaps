import { useEvmAddress, useIsSignedIn } from "@coinbase/cdp-hooks";
import { useGhostBalance } from "../hooks/useGhostBalance";

function formatBalance(balance: string): string {
  const num = Number.parseFloat(balance);
  if (num === 0) return "0";
  if (num < 0.01) return "<0.01";
  return num.toFixed(2);
}

export default function GhostBalance() {
  const { isSignedIn } = useIsSignedIn();
  const { evmAddress } = useEvmAddress();
  const { data, isLoading } = useGhostBalance(
    isSignedIn ? evmAddress : undefined,
  );

  if (!isSignedIn || !evmAddress) return null;

  return (
    <div className="flex items-center gap-1.5 bg-surface-raised rounded-full px-3 py-1.5 border border-edge text-sm">
      <span className="text-base leading-none" aria-hidden="true">
        👻
      </span>
      {isLoading ? (
        <span className="text-blue-gray text-xs">...</span>
      ) : (
        <span className="font-mono text-xs text-bone">
          {data ? formatBalance(data.balance) : "—"}{" "}
          <span className="text-blue-gray">GHOST</span>
        </span>
      )}
    </div>
  );
}
