import { formatDistanceLive, haversine } from "../lib/geo-utils";
import { maneuverIcon } from "../lib/nav-helpers";
import { useAppStore } from "../store";
import type { RouteInstruction } from "../types";

const IMMINENT_THRESHOLD_M = 152; // ~500 ft

interface Props {
  currentInst: RouteInstruction;
  nextInst: RouteInstruction | undefined;
}

export default function NavNextTurn({ currentInst, nextInst }: Props) {
  const userLocation = useAppStore((s) => s.userLocation);
  const currentSpeedLimit = useAppStore((s) => s.currentSpeedLimit);

  let distToNext = "";
  let isImminent = false;
  if (nextInst && userLocation) {
    const meters = haversine(
      userLocation.lat,
      userLocation.lng,
      nextInst.point[1],
      nextInst.point[0],
    );
    distToNext = formatDistanceLive(meters);
    isImminent = meters < IMMINENT_THRESHOLD_M;
  }

  return (
    <div
      className={`flex items-center gap-4 p-4 border-b shrink-0 ${
        isImminent
          ? "bg-amber/10 border-b-amber/30"
          : "bg-surface-raised border-b-edge"
      }`}
    >
      <div
        className={`text-[40px] size-14 flex items-center justify-center rounded-xl shrink-0 ${
          isImminent ? "bg-amber text-void" : "bg-cyan text-void"
        }`}
      >
        {maneuverIcon(currentInst)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-base font-bold text-bone leading-tight">
          {currentInst.message}
        </div>
        {currentInst.street && (
          <div className="text-sm text-blue-gray mt-0.5 font-medium">
            {currentInst.street}
          </div>
        )}
        {distToNext && (
          <div
            className={`text-xl font-bold mt-1 font-mono ${
              isImminent ? "text-amber" : "text-cyan"
            }`}
          >
            {distToNext}
          </div>
        )}
      </div>

      {currentSpeedLimit != null && currentSpeedLimit > 0 && (
        <div className="shrink-0">
          <div className="size-[52px] rounded-full border-[3px] border-coral bg-surface flex flex-col items-center justify-center leading-none">
            <span className="text-lg font-extrabold text-bone">
              {currentSpeedLimit}
            </span>
            <span className="text-[8px] font-semibold text-muted uppercase">
              mph
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
