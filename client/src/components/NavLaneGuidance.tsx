import { laneArrow } from "../lib/nav-helpers";
import type { Lane } from "../types";

interface Props {
  lanes: Lane[];
}

export default function NavLaneGuidance({ lanes }: Props) {
  return (
    <div className="flex justify-center gap-0.5 px-4 py-1.5 bg-void border-b border-edge shrink-0">
      {lanes.map((lane, i) => (
        <div
          key={i}
          className={`w-9 h-8 flex items-center justify-center text-lg rounded ${
            lane.follow ? "text-void bg-cyan" : "text-muted bg-surface-raised"
          }`}
        >
          {laneArrow(lane.follow !== "" ? lane.follow : lane.directions[0])}
        </div>
      ))}
    </div>
  );
}
