export interface Place {
  id: string;
  name: string;
  category: string;
  address: string;
  phone: string;
  website: string;
  brand: string;
  confidence: number;
  longitude: number;
  latitude: number;
  distanceMeters?: number;
  rating?: number;
  reviewCount?: number;
}

export interface RouteSummary {
  lengthInMeters: number;
  travelTimeInSeconds: number;
  trafficDelayInSeconds: number;
  departureTime: string;
  arrivalTime: string;
}

export interface RouteInstruction {
  distance: number;
  travelTime: number;
  point: [number, number];
  instructionType: string;
  street: string;
  message: string;
  maneuver: string;
  turnAngle: number;
}

export interface SpeedLimitSection {
  startPointIndex: number;
  endPointIndex: number;
  maxSpeedKmh: number;
  maxSpeedMph: number;
}

export interface Lane {
  directions: string[];
  follow: string;
}

export interface LaneGuidanceSection {
  startPointIndex: number;
  endPointIndex: number;
  lanes: Lane[];
}

export interface RouteResponse {
  coordinates: [number, number][];
  instructions: RouteInstruction[];
  summary: RouteSummary;
  speedLimits: SpeedLimitSection[];
  laneGuidance: LaneGuidanceSection[];
}
