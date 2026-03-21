import type { EvmAddress } from "@coinbase/cdp-core";
import {
  useEvmAddress,
  useIsSignedIn,
  useSendUserOperation,
} from "@coinbase/cdp-hooks";
import { Camera, CheckCircle } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ReviewData } from "../lib/eas";
import {
  buildAttestCalldata,
  EAS_CONTRACT,
  EAS_NETWORK,
  EASSCAN_URL,
  encodeReviewData,
  hashPhoto,
  REVIEW_SCHEMA_UID,
} from "../lib/eas";
import { extractPhotoGPS, isNearLocation } from "../lib/exif";
import { QUALITY_STYLES } from "../lib/theme";
import { useAppStore } from "../store";
import AuthButton from "./AuthButton";

interface QualityResult {
  score: number;
  label: string;
  flags: string[];
  reason: string;
}

type ReviewStep = "form" | "scoring" | "submitting" | "success" | "error";

export default function ReviewForm() {
  const place = useAppStore((s) => s.selectedPlace)!;
  const setShowReviewForm = useAppStore((s) => s.setShowReviewForm);
  const { isSignedIn } = useIsSignedIn();
  const { evmAddress } = useEvmAddress();
  const { sendUserOperation } = useSendUserOperation();

  const [step, setStep] = useState<ReviewStep>("form");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");
  const [whatOrdered, setWhatOrdered] = useState("");
  const [oneThingToKnow, setOneThingToKnow] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoLocation, setPhotoLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [photoNearPlace, setPhotoNearPlace] = useState<boolean | null>(null);
  const [quality, setQuality] = useState<QualityResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [txHash, setTxHash] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));

    const gps = await extractPhotoGPS(file);
    setPhotoLocation(gps);

    if (gps) {
      const near = isNearLocation(gps, {
        latitude: place.latitude,
        longitude: place.longitude,
      });
      setPhotoNearPlace(near);
    } else {
      setPhotoNearPlace(null);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0 || text.trim().length < 5) return;

    try {
      setStep("scoring");
      const scoreRes = await fetch("/api/reviews/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          text,
          hasPhoto: !!photo,
          structuredResponses: {
            whatOrdered: whatOrdered || undefined,
            oneThingToKnow: oneThingToKnow || undefined,
          },
        }),
      });
      const qualityResult: QualityResult = await scoreRes.json();
      setQuality(qualityResult);

      if (qualityResult.flags.includes("sentiment_mismatch")) {
        setErrorMsg(
          "Your rating and review text seem to contradict each other. Please adjust before submitting.",
        );
        setStep("error");
        return;
      }

      setStep("submitting");

      let photoHashStr =
        "0x0000000000000000000000000000000000000000000000000000000000000000";
      if (photo) {
        const photoBuffer = await photo.arrayBuffer();
        const uploadRes = await fetch("/api/photos", {
          method: "POST",
          headers: { "Content-Type": photo.type },
          body: photoBuffer,
        });
        if (uploadRes.ok) {
          const { hash } = await uploadRes.json();
          photoHashStr = hash;
        } else {
          photoHashStr = await hashPhoto(photo);
        }
      }

      const reviewData: ReviewData = {
        rating,
        text: [
          text,
          whatOrdered && `Ordered: ${whatOrdered}`,
          oneThingToKnow && `Tip: ${oneThingToKnow}`,
        ]
          .filter(Boolean)
          .join(" | "),
        placeId: place.id,
        placeName: place.name,
        photoHash: photoHashStr,
        lat: Math.round(place.latitude * 1e6),
        lng: Math.round(place.longitude * 1e6),
        qualityScore: qualityResult.score,
      };

      const encodedData = encodeReviewData(reviewData);
      const calldata = buildAttestCalldata(REVIEW_SCHEMA_UID, encodedData);

      const result = await sendUserOperation({
        calls: [
          {
            to: EAS_CONTRACT as EvmAddress,
            data: calldata as `0x${string}`,
          },
        ],
        network: EAS_NETWORK,
        evmSmartAccount: evmAddress as EvmAddress,
        useCdpPaymaster: true,
      });

      setTxHash(result.userOperationHash);
      setStep("success");
    } catch (err) {
      console.error("Review submission error:", err);
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to submit review",
      );
      setStep("error");
    }
  };

  if (!isSignedIn) {
    return (
      <Dialog open={true} onOpenChange={() => setShowReviewForm(false)}>
        <DialogContent className="bg-surface border-edge shadow-panel max-w-[480px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-bone">
              Write a Review
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-blue-gray leading-relaxed mb-3">
            Sign in with your email to write a review.
          </p>
          <AuthButton />
        </DialogContent>
      </Dialog>
    );
  }

  if (step === "success") {
    return (
      <Dialog open={true} onOpenChange={() => setShowReviewForm(false)}>
        <DialogContent className="bg-surface border-edge shadow-panel max-w-[480px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-bone">
              Review Submitted!
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <div className="size-12 bg-phosphor/15 text-phosphor rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="size-6" />
            </div>
            <p className="text-sm text-bone">
              Your review for <strong>{place.name}</strong> is now on-chain.
            </p>
            {quality && (
              <div
                className={`inline-block text-sm font-semibold px-3 py-1 rounded-md mt-2 ${QUALITY_STYLES[quality.label]}`}
              >
                Quality: {quality.label} ({quality.score}/100)
              </div>
            )}
            <p className="text-sm text-muted mt-2">
              Permanently stored on Base. No one can delete, modify, or censor
              it.
            </p>
            {txHash && (
              <a
                href={`${EASSCAN_URL}/schema/view/${REVIEW_SCHEMA_UID}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 text-sm text-cyan no-underline hover:underline"
              >
                View on EAS Explorer
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (step === "error") {
    return (
      <Dialog open={true} onOpenChange={() => setShowReviewForm(false)}>
        <DialogContent className="bg-surface border-edge shadow-panel max-w-[480px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-bone">
              Something went wrong
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-coral mb-3">{errorMsg}</p>
          <Button variant="outline" onClick={() => setStep("form")}>
            Try Again
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  if (step === "scoring" || step === "submitting") {
    return (
      <Dialog open={true} onOpenChange={() => setShowReviewForm(false)}>
        <DialogContent className="bg-surface border-edge shadow-panel max-w-[480px] max-h-[85vh] overflow-y-auto">
          <div className="text-center py-8">
            <div className="size-8 border-[3px] border-edge border-t-cyan rounded-full animate-spin mx-auto" />
            <p className="text-sm text-blue-gray mt-3">
              {step === "scoring"
                ? "AI is evaluating your review quality..."
                : "Submitting your review..."}
            </p>
            {quality && step === "submitting" && (
              <div
                className={`inline-block text-sm font-semibold px-3 py-1 rounded-md mt-2 ${QUALITY_STYLES[quality.label]}`}
              >
                Quality score: {quality.score}/100 ({quality.label})
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={() => setShowReviewForm(false)}>
      <DialogContent className="bg-surface border-edge shadow-panel max-w-[480px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-bone">
            Review {place.name}
          </DialogTitle>
        </DialogHeader>

        {/* Star rating */}
        <div className="flex gap-1 mb-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              className={`bg-transparent border-none text-[32px] cursor-pointer p-0 transition-colors ${
                n <= (hoverRating || rating) ? "text-amber" : "text-edge-bright"
              }`}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHoverRating(n)}
              onMouseLeave={() => setHoverRating(0)}
            >
              ★
            </button>
          ))}
        </div>

        {/* Review text */}
        <Textarea
          className="bg-surface-raised border-edge text-bone placeholder:text-muted focus-visible:border-cyan focus-visible:ring-cyan/30 resize-y"
          placeholder="What was your experience like?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
        />

        {/* Structured prompts */}
        <Input
          className="bg-surface-raised border-edge text-bone placeholder:text-muted focus-visible:border-cyan focus-visible:ring-cyan/30"
          placeholder="What did you order? (optional)"
          value={whatOrdered}
          onChange={(e) => setWhatOrdered(e.target.value)}
        />
        <Input
          className="bg-surface-raised border-edge text-bone placeholder:text-muted focus-visible:border-cyan focus-visible:ring-cyan/30"
          placeholder="One thing future visitors should know? (optional)"
          value={oneThingToKnow}
          onChange={(e) => setOneThingToKnow(e.target.value)}
        />

        {/* Photo upload */}
        <div className="my-2">
          <button
            className="w-full flex items-center justify-center gap-2 bg-surface-raised border border-dashed border-edge-bright rounded-lg py-2.5 px-4 text-sm text-blue-gray cursor-pointer transition-colors hover:border-cyan/50 hover:text-cyan"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="size-4" />
            {photo ? "Change Photo" : "Add Photo (proof of visit)"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoChange}
            hidden
          />
          {photoPreview && (
            <div className="relative mt-2">
              <img
                src={photoPreview}
                alt="Review photo"
                className="w-full max-h-[160px] object-cover rounded-lg"
              />
              {photoNearPlace === true && (
                <span className="absolute bottom-2 left-2 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-phosphor/90 text-void">
                  Location verified
                </span>
              )}
              {photoNearPlace === false && (
                <span className="absolute bottom-2 left-2 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber/90 text-void">
                  Photo taken elsewhere
                </span>
              )}
              {photoLocation === null && photo && (
                <span className="absolute bottom-2 left-2 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-void/60 text-bone">
                  No GPS in photo
                </span>
              )}
            </div>
          )}
        </div>

        {/* Submit */}
        <Button
          className="w-full font-display text-[15px]"
          onClick={handleSubmit}
          disabled={rating === 0 || text.trim().length < 5}
        >
          Submit Review
        </Button>

        <p className="text-[11px] text-muted text-center mt-2 mb-0">
          Your review will be permanently stored on Base. Free, no fees.
        </p>
      </DialogContent>
    </Dialog>
  );
}
