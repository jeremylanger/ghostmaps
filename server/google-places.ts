import type { Place } from "./types";

const PLACES_BASE = "https://places.googleapis.com/v1/places";
const DEFAULT_BIAS_RADIUS = 50000; // 50km

function locationBias(lat: number, lng: number, radius = DEFAULT_BIAS_RADIUS) {
  return { circle: { center: { latitude: lat, longitude: lng }, radius } };
}

export interface PlaceEnrichment {
  openingHours: string[] | null;
  isOpen: boolean | null;
  foodTypes: string[];
  website: string | null;
  phone: string | null;
  rating: number | null;
  reviewCount: number | null;
  priceLevel: string | null;
  dineIn: boolean | null;
  takeout: boolean | null;
  delivery: boolean | null;
  wheelchairAccessible: boolean | null;
  photoUri: string | null;
  photoUris: string[];
}

interface GooglePlace {
  id: string;
  displayName?: { text: string };
  currentOpeningHours?: {
    openNow: boolean;
    weekdayDescriptions: string[];
  };
  regularOpeningHours?: {
    openNow: boolean;
    weekdayDescriptions: string[];
  };
  websiteUri?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  rating?: number;
  userRatingCount?: number;
  priceLevel?: string;
  dineIn?: boolean;
  takeout?: boolean;
  delivery?: boolean;
  accessibilityOptions?: { wheelchairAccessibleEntrance?: boolean };
  primaryType?: string;
  types?: string[];
  photos?: { name: string }[];
}

const FIELD_MASK = [
  "displayName",
  "currentOpeningHours",
  "regularOpeningHours",
  "websiteUri",
  "nationalPhoneNumber",
  "internationalPhoneNumber",
  "rating",
  "userRatingCount",
  "priceLevel",
  "dineIn",
  "takeout",
  "delivery",
  "accessibilityOptions",
  "primaryType",
  "types",
  "photos",
].join(",");

export async function enrichPlace(
  place: Place,
  apiKey: string,
): Promise<PlaceEnrichment> {
  try {
    // Use Text Search to find the place by name + location
    const response = await fetch(`${PLACES_BASE}:searchText`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": `places.${FIELD_MASK.split(",").join(",places.")}`,
      },
      body: JSON.stringify({
        textQuery: `${place.name} ${place.address}`,
        locationBias: locationBias(place.latitude, place.longitude, 200),
        maxResultCount: 1,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Google Places API error:", response.status, text);
      return emptyEnrichment();
    }

    const data = await response.json();
    const items: GooglePlace[] = data.places || [];

    if (items.length === 0) return emptyEnrichment();

    const item = items[0];
    const hours = item.currentOpeningHours || item.regularOpeningHours;

    // Price level mapping
    const priceLevelMap: Record<string, string> = {
      PRICE_LEVEL_FREE: "Free",
      PRICE_LEVEL_INEXPENSIVE: "$",
      PRICE_LEVEL_MODERATE: "$$",
      PRICE_LEVEL_EXPENSIVE: "$$$",
      PRICE_LEVEL_VERY_EXPENSIVE: "$$$$",
    };

    // Build photo URIs if available
    let photoUri: string | null = null;
    const photoUris: string[] = [];
    if (item.photos && item.photos.length > 0) {
      for (const photo of item.photos.slice(0, 5)) {
        photoUris.push(
          `https://places.googleapis.com/v1/${photo.name}/media?maxHeightPx=400&maxWidthPx=600&key=${apiKey}`,
        );
      }
      photoUri = photoUris[0];
    }

    return {
      openingHours: hours?.weekdayDescriptions || null,
      isOpen: hours?.openNow ?? null,
      foodTypes: (item.types || [])
        .filter(
          (t) =>
            t.startsWith("restaurant") ||
            t.includes("food") ||
            t.includes("cafe") ||
            t.includes("bar") ||
            t.includes("bakery"),
        )
        .map((t) => t.replace(/_/g, " ")),
      website: item.websiteUri || null,
      phone: item.internationalPhoneNumber || item.nationalPhoneNumber || null,
      rating: item.rating || null,
      reviewCount: item.userRatingCount || null,
      priceLevel: item.priceLevel
        ? priceLevelMap[item.priceLevel] || null
        : null,
      dineIn: item.dineIn ?? null,
      takeout: item.takeout ?? null,
      delivery: item.delivery ?? null,
      wheelchairAccessible:
        item.accessibilityOptions?.wheelchairAccessibleEntrance ?? null,
      photoUri,
      photoUris,
    };
  } catch (err) {
    console.error("Google Places enrichment error:", err);
    return emptyEnrichment();
  }
}

const SEARCH_FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.primaryType",
  "places.types",
  "places.rating",
  "places.userRatingCount",
].join(",");

/** Search Google Places by name, returning results as Place objects. */
export async function searchByName(
  query: string,
  apiKey: string,
  userLat?: number,
  userLng?: number,
): Promise<Place[]> {
  try {
    const body: Record<string, unknown> = {
      textQuery: query,
      maxResultCount: 10,
    };
    if (userLat != null && userLng != null) {
      body.locationBias = locationBias(userLat, userLng);
    }

    const response = await fetch(`${PLACES_BASE}:searchText`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": SEARCH_FIELD_MASK,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      console.error(
        `Google Places name search failed: ${response.status} ${errText}`,
      );
      return [];
    }

    const data = await response.json();
    const items = data.places || [];

    return items.map(
      (item: {
        id: string;
        displayName?: { text: string };
        formattedAddress?: string;
        location?: { latitude: number; longitude: number };
        primaryType?: string;
        rating?: number;
      }) => ({
        id: `gp-${item.id}`,
        name: item.displayName?.text || "Unknown",
        category: item.primaryType?.replace(/_/g, " ") || "",
        address: item.formattedAddress || "",
        phone: "",
        website: "",
        brand: "",
        confidence: 0.9,
        longitude: item.location?.longitude || 0,
        latitude: item.location?.latitude || 0,
      }),
    );
  } catch (err) {
    console.error("Google Places name search error:", err);
    return [];
  }
}

/** Geocode an address using Google Places Text Search. */
export async function geocodeAddress(
  address: string,
  apiKey: string,
  userLat?: number,
  userLng?: number,
): Promise<Place | null> {
  try {
    const body: Record<string, unknown> = {
      textQuery: address,
      maxResultCount: 1,
    };
    if (userLat != null && userLng != null) {
      body.locationBias = locationBias(userLat, userLng);
    }

    const response = await fetch(`${PLACES_BASE}:searchText`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "places.displayName,places.formattedAddress,places.location",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      console.error(
        `Google Places geocode failed: ${response.status} ${errText}`,
      );
      return null;
    }
    const data = await response.json();
    const item = data.places?.[0];
    if (!item) return null;

    return {
      id: `addr-${Date.now()}`,
      name: item.displayName?.text || address,
      category: "address",
      address: item.formattedAddress || address,
      phone: "",
      website: "",
      brand: "",
      confidence: 1,
      longitude: item.location?.longitude || 0,
      latitude: item.location?.latitude || 0,
    };
  } catch (err) {
    console.error("Google Places geocode error:", err);
    return null;
  }
}

function emptyEnrichment(): PlaceEnrichment {
  return {
    openingHours: null,
    isOpen: null,
    foodTypes: [],
    website: null,
    phone: null,
    rating: null,
    reviewCount: null,
    priceLevel: null,
    dineIn: null,
    takeout: null,
    delivery: null,
    wheelchairAccessible: null,
    photoUri: null,
    photoUris: [],
  };
}
