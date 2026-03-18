import type { Place } from "./types";

const PLACES_BASE = "https://places.googleapis.com/v1/places";

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
        locationBias: {
          circle: {
            center: { latitude: place.latitude, longitude: place.longitude },
            radius: 200,
          },
        },
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

    // Build photo URI if available
    let photoUri: string | null = null;
    if (item.photos && item.photos.length > 0) {
      photoUri = `https://places.googleapis.com/v1/${item.photos[0].name}/media?maxHeightPx=400&maxWidthPx=600&key=${apiKey}`;
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
    };
  } catch (err) {
    console.error("Google Places enrichment error:", err);
    return emptyEnrichment();
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
  };
}
