"use client";

import { useEffect, useState, useRef, type RefObject } from "react";
import { useInView, useAnimation } from "framer-motion";

interface UseScrollRevealOptions {
  once?: boolean;
  margin?: string;
  amount?: number;
}

interface UseScrollRevealReturn {
  ref: RefObject<HTMLElement | null>;
  isInView: boolean;
  controls: ReturnType<typeof useAnimation>;
}

export function useScrollReveal(options: UseScrollRevealOptions = {}): UseScrollRevealReturn {
  const { once = true, amount = 0.3 } = options;
  const ref = useRef<HTMLElement | null>(null);
  const controls = useAnimation();
  const isInView = useInView(ref, { once, amount });

  useEffect(() => {
    if (isInView) {
      controls.start("animate");
    } else if (!once) {
      controls.start("initial");
    }
  }, [isInView, controls, once]);

  return { ref, isInView, controls };
}

interface UseScrollProgressReturn {
  scrollYProgress: number;
  scrollY: number;
}

export function useScrollProgress(): UseScrollProgressReturn {
  const [progress, setProgress] = useState({ scrollYProgress: 0, scrollY: 0 });

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollYProgress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
      setProgress({
        scrollYProgress,
        scrollY: window.scrollY,
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return progress;
}

interface UseParallaxOptions {
  speed?: number;
}

export function useParallax(options: UseParallaxOptions = {}): { ref: RefObject<HTMLElement | null>; y: number } {
  const { speed = 0.5 } = options;
  const ref = useRef<HTMLElement | null>(null);
  const [y, setY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      const elementTop = rect.top + scrollY;
      const offset = (scrollY - elementTop) * speed;
      setY(offset);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed]);

  return { ref, y };
}

export function useMousePosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return position;
}

export function useElementMousePosition(ref: RefObject<HTMLElement | null>) {
  const [position, setPosition] = useState({ x: 0, y: 0, isInside: false });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const isInside = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;
      setPosition({ x, y, isInside });
    };

    element.addEventListener("mousemove", handleMouseMove);
    return () => element.removeEventListener("mousemove", handleMouseMove);
  }, [ref]);

  return position;
}
