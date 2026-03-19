import { laneArrow } from "../lib/nav-helpers";
import type { Lane } from "../types";

interface Props {
  lanes: Lane[];
}

export default function NavLaneGuidance({ lanes }: Props) {
  return (
    <div className="nav-lanes">
      {lanes.map((lane, i) => (
        <div
          key={i}
          className={`nav-lane ${lane.follow ? "nav-lane-follow" : ""}`}
        >
          {laneArrow(lane.follow !== "" ? lane.follow : lane.directions[0])}
        </div>
      ))}
    </div>
  );
}
