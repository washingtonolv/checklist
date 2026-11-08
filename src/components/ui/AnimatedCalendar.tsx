"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarClock } from "./material-icons";

/** Flaticon 6416392, Magnific. Attribution is rendered on the dashboard. */
export function AnimatedCalendar({ className = "h-6 w-6" }: { className?: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const element = video.current;
    if (!element || failed) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    function play() {
      if (preference.matches || !element || !element.paused) return;
      element.currentTime = 0;
      void element.play().catch(() => { /* Poster remains visible if playback is unavailable. */ });
    }
    function onPreferenceChange() {
      if (preference.matches && element) { element.pause(); element.currentTime = 0; }
    }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { play(); observer.disconnect(); }
    }, { threshold: .5 });
    observer.observe(element);
    const card = element.closest(".card");
    card?.addEventListener("pointerenter", play);
    card?.addEventListener("focusin", play);
    preference.addEventListener("change", onPreferenceChange);
    return () => {
      observer.disconnect(); element.pause();
      card?.removeEventListener("pointerenter", play);
      card?.removeEventListener("focusin", play);
      preference.removeEventListener("change", onPreferenceChange);
    };
  }, [failed]);
  if (failed) return <CalendarClock className={className} />;
  return <video ref={video} src="/icons/calendar-flaticon.mp4" poster="/icons/calendar-flaticon.webp" className={`shrink-0 rounded object-contain ${className}`} muted playsInline preload="none" aria-hidden="true" tabIndex={-1} disablePictureInPicture onError={() => setFailed(true)} />;
}
