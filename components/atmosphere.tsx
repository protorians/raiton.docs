"use client";

import { useEffect, useRef } from "react";

type Star = {
  x: number;
  y: number;
  r: number;
  alpha: number;
  phase: number;
  speed: number;
  depth: number;
};

/**
 * One fixed sky behind every page. Very low cost: 50-150 dots, capped DPR,
 * paused when the tab is hidden, drawn once when motion is reduced.
 */
export function Atmosphere() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let frame = 0;
    let visible = true;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.round(Math.min(150, Math.max(48, (width * height) / 17000)));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.25 + 0.35,
        alpha: Math.random() * 0.5 + 0.22,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.00016 + 0.00006,
        depth: Math.random() * 0.7 + 0.3,
      }));
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);

      for (const star of stars) {
        const twinkle =
          reduced.matches ? 1 : 0.62 + 0.38 * Math.sin(time * star.speed + star.phase);
        const x = star.x + pointer.x * star.depth * 14;
        const y = star.y + pointer.y * star.depth * 14;
        context.beginPath();
        context.fillStyle = `rgba(206, 222, 255, ${star.alpha * twinkle})`;
        context.arc(x, y, star.r, 0, Math.PI * 2);
        context.fill();
      }

      if (!reduced.matches && visible) {
        pointer.x += (pointer.tx - pointer.x) * 0.045;
        pointer.y += (pointer.ty - pointer.y) * 0.045;
        frame = window.requestAnimationFrame(draw);
      }
    };

    const onPointer = (event: PointerEvent) => {
      pointer.tx = (event.clientX / Math.max(width, 1) - 0.5) * 2;
      pointer.ty = (event.clientY / Math.max(height, 1) - 0.5) * 2;
    };

    const onVisibility = () => {
      visible = document.visibilityState === "visible";
      if (visible && !reduced.matches) {
        window.cancelAnimationFrame(frame);
        frame = window.requestAnimationFrame(draw);
      }
    };

    const restart = () => {
      window.cancelAnimationFrame(frame);
      resize();
      frame = window.requestAnimationFrame(draw);
    };

    resize();
    frame = window.requestAnimationFrame(draw);
    window.addEventListener("resize", restart);
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    reduced.addEventListener("change", restart);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", restart);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
      reduced.removeEventListener("change", restart);
    };
  }, []);

  return (
    <div className="atmosphere" aria-hidden="true">
      <div className="atmosphere__aurora atmosphere__aurora--one" />
      <div className="atmosphere__aurora atmosphere__aurora--two" />
      <canvas ref={ref} className="atmosphere__stars" />
      <div className="atmosphere__grain" />
    </div>
  );
}
