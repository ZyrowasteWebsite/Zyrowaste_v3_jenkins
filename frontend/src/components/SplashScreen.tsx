import { useCallback, useEffect, useRef } from "react";

const SPLASH_VIDEO_SRC = "/splash.mp4";
const FALLBACK_MAX_MS = 30000;

type SplashScreenProps = {
  onComplete: () => void;
};

/**
 * Full-screen intro video on app load at normal speed; dismisses when playback ends.
 */
export function SplashScreen({ onComplete }: SplashScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const completedRef = useRef(false);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    const fallbackId = window.setTimeout(finish, FALLBACK_MAX_MS);
    const video = videoRef.current;

    if (video) {
      video.playbackRate = 1;
      video.play().catch(finish);
    }

    return () => window.clearTimeout(fallbackId);
  }, [finish]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
      role="presentation"
      aria-hidden="true"
    >
      <video
        ref={videoRef}
        src={SPLASH_VIDEO_SRC}
        className="h-full w-full object-cover"
        autoPlay
        muted
        playsInline
        onEnded={finish}
        onError={finish}
      />
    </div>
  );
}
