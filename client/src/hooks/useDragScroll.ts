import { type RefCallback, useCallback, useRef } from "react";

export function useDragScroll<T extends HTMLElement>(): RefCallback<T> {
  const stateRef = useRef({
    el: null as T | null,
    isDown: false,
    startX: 0,
    scrollLeft: 0,
    lastX: 0,
    velocity: 0,
    animId: 0,
  });

  const stopMomentum = useCallback(() => {
    cancelAnimationFrame(stateRef.current.animId);
  }, []);

  const releaseDrag = useCallback(() => {
    const s = stateRef.current;
    if (!s.isDown) return;
    s.isDown = false;
    s.el!.style.cursor = "grab";
    s.el!.style.removeProperty("user-select");

    let v = s.velocity;
    const tick = () => {
      if (Math.abs(v) < 0.5) return;
      s.el!.scrollLeft -= v;
      v *= 0.92;
      s.animId = requestAnimationFrame(tick);
    };
    s.animId = requestAnimationFrame(tick);
  }, []);

  const onMouseDown = useCallback(
    (e: MouseEvent) => {
      stopMomentum();
      const s = stateRef.current;
      s.isDown = true;
      s.startX = e.pageX;
      s.lastX = e.pageX;
      s.scrollLeft = s.el!.scrollLeft;
      s.velocity = 0;
      s.el!.style.cursor = "grabbing";
      s.el!.style.userSelect = "none";
    },
    [stopMomentum],
  );

  const onMouseMove = useCallback((e: MouseEvent) => {
    const s = stateRef.current;
    if (!s.isDown) return;
    e.preventDefault();
    const dx = e.pageX - s.lastX;
    s.velocity = dx;
    s.lastX = e.pageX;
    s.el!.scrollLeft = s.scrollLeft - (e.pageX - s.startX);
  }, []);

  return useCallback(
    (node: T | null) => {
      const s = stateRef.current;
      if (s.el) {
        s.el.removeEventListener("mousedown", onMouseDown);
        s.el.removeEventListener("mouseleave", releaseDrag);
        s.el.removeEventListener("mouseup", releaseDrag);
        s.el.removeEventListener("mousemove", onMouseMove);
        s.el.style.removeProperty("cursor");
      }
      s.el = node;
      if (node) {
        node.style.cursor = "grab";
        node.addEventListener("mousedown", onMouseDown);
        node.addEventListener("mouseleave", releaseDrag);
        node.addEventListener("mouseup", releaseDrag);
        node.addEventListener("mousemove", onMouseMove);
      }
    },
    [onMouseDown, releaseDrag, onMouseMove],
  );
}
