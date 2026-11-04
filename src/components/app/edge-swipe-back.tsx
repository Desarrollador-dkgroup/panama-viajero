"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const EDGE_WIDTH = 24;
const MIN_DISTANCE = 80;
const MAX_VERTICAL_DRIFT = 60;

// En celular y tableta, deslizar desde el borde izquierdo hacia la derecha regresa a la página anterior.
export function EdgeSwipeBack() {
  const router = useRouter();

  useEffect(() => {
    const compact = window.matchMedia("(max-width: 767px)");
    let startX = 0;
    let startY = 0;
    let tracking = false;

    function onTouchStart(event: TouchEvent) {
      if (!compact.matches || event.touches.length !== 1) return;
      const touch = event.touches[0];
      if (touch.clientX > EDGE_WIDTH) return;
      tracking = true;
      startX = touch.clientX;
      startY = touch.clientY;
    }

    function onTouchEnd(event: TouchEvent) {
      if (!tracking) return;
      tracking = false;
      const touch = event.changedTouches[0];
      const distance = touch.clientX - startX;
      const drift = Math.abs(touch.clientY - startY);
      if (distance >= MIN_DISTANCE && drift < MAX_VERTICAL_DRIFT && window.history.length > 1) {
        router.back();
      }
    }

    function onTouchCancel() {
      tracking = false;
    }

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchCancel, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchCancel);
    };
  }, [router]);

  return null;
}
