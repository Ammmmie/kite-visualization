import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_SCROLL_SPEED = 36;

export default function AutoScrollStrip({
  title,
  items,
  speed = DEFAULT_SCROLL_SPEED,
  imageClassName = "",
  onImageClick,
  pauseOnHover = true,
  draggable = true,
  renderItem,
  className = ""
}) {
  const stripRef = useRef(null);
  const groupRef = useRef(null);
  const rafRef = useRef(0);
  const lastFrameRef = useRef(0);
  const groupWidthRef = useRef(0);
  const isPausedRef = useRef(false);
  const isPointerDownRef = useRef(false);
  const isDraggingRef = useRef(false);
  const activePointerIdRef = useRef(null);
  const dragStartXRef = useRef(0);
  const dragStartScrollRef = useRef(0);
  const suppressClickRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  const normalizeScroll = useCallback(() => {
    const strip = stripRef.current;
    const groupWidth = groupWidthRef.current;
    if (!strip || groupWidth <= 0) {
      return;
    }

    while (strip.scrollLeft >= groupWidth) {
      strip.scrollLeft -= groupWidth;
    }

    while (strip.scrollLeft < 0) {
      strip.scrollLeft += groupWidth;
    }
  }, []);

  useEffect(() => {
    const measure = () => {
      groupWidthRef.current = groupRef.current?.scrollWidth || 0;
      normalizeScroll();
    };

    measure();
    window.addEventListener("resize", measure);

    return () => {
      window.removeEventListener("resize", measure);
    };
  }, [items, normalizeScroll]);

  useEffect(() => {
    const tick = (timestamp) => {
      const strip = stripRef.current;
      if (!lastFrameRef.current) {
        lastFrameRef.current = timestamp;
      }

      const deltaSeconds = (timestamp - lastFrameRef.current) / 1000;
      lastFrameRef.current = timestamp;

      if (strip && !isPausedRef.current && !isDraggingRef.current) {
        strip.scrollLeft += speed * deltaSeconds;
        normalizeScroll();
      }

      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafRef.current);
      lastFrameRef.current = 0;
    };
  }, [normalizeScroll, speed]);

  const pause = useCallback(() => {
    if (pauseOnHover) {
      isPausedRef.current = true;
    }
  }, [pauseOnHover]);

  const resume = useCallback(() => {
    if (!isDraggingRef.current && !isPointerDownRef.current) {
      isPausedRef.current = false;
    }
  }, []);

  const handlePointerDown = useCallback(
    (event) => {
      if (!draggable || event.button !== 0) {
        return;
      }

      const strip = stripRef.current;
      if (!strip) {
        return;
      }

      isPointerDownRef.current = true;
      isPausedRef.current = true;
      activePointerIdRef.current = event.pointerId;
      suppressClickRef.current = false;
      dragStartXRef.current = event.clientX;
      dragStartScrollRef.current = strip.scrollLeft;
    },
    [draggable]
  );

  const handlePointerMove = useCallback(
    (event) => {
      if (!isPointerDownRef.current || activePointerIdRef.current !== event.pointerId) {
        return;
      }

      const strip = stripRef.current;
      if (!strip) {
        return;
      }

      const deltaX = event.clientX - dragStartXRef.current;
      if (Math.abs(deltaX) > 5) {
        suppressClickRef.current = true;
        if (!isDraggingRef.current) {
          isDraggingRef.current = true;
          strip.setPointerCapture?.(event.pointerId);
          setIsDragging(true);
        }
      }

      if (isDraggingRef.current) {
        strip.scrollLeft = dragStartScrollRef.current - deltaX;
        normalizeScroll();
      }
    },
    [normalizeScroll]
  );

  const stopDrag = useCallback(
    (event) => {
      if (!isPointerDownRef.current || activePointerIdRef.current !== event.pointerId) {
        return;
      }

      if (isDraggingRef.current) {
        stripRef.current?.releasePointerCapture?.(event.pointerId);
      }

      isPointerDownRef.current = false;
      isDraggingRef.current = false;
      activePointerIdRef.current = null;
      setIsDragging(false);

      isPausedRef.current = Boolean(pauseOnHover && stripRef.current?.matches(":hover"));
    },
    [pauseOnHover]
  );

  const handleItemClick = useCallback(
    (event, item) => {
      if (suppressClickRef.current) {
        event.preventDefault();
        event.stopPropagation();
        suppressClickRef.current = false;
        return;
      }

      onImageClick?.(item, event);
    },
    [onImageClick]
  );

  const renderDefaultItem = (item) => (
    <img
      className={`auto-scroll-strip__image ${imageClassName}`}
      src={item.src}
      alt={item.alt || title}
      draggable="false"
    />
  );

  return (
    <section
      ref={stripRef}
      className={`auto-scroll-strip ${isDragging ? "auto-scroll-strip--dragging" : ""} ${className}`}
      aria-label={title}
      onPointerEnter={pause}
      onPointerLeave={resume}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDrag}
      onPointerCancel={stopDrag}
    >
      <div className="auto-scroll-strip__track">
        {[0, 1].map((groupIndex) => (
          <div
            className="auto-scroll-strip__group"
            key={groupIndex}
            ref={groupIndex === 0 ? groupRef : undefined}
            aria-hidden={groupIndex === 1}
          >
            {items.map((item, itemIndex) => (
              <button
                className={`auto-scroll-strip__item ${renderItem ? "auto-scroll-strip__item--custom" : ""}`}
                type="button"
                key={`${item.id || item.src || item.alt}-${groupIndex}-${itemIndex}`}
                onClick={(event) => handleItemClick(event, item)}
                aria-label={item.ariaLabel || `Preview ${item.path || item.alt || title}`}
              >
                {renderItem ? renderItem(item, itemIndex, groupIndex) : renderDefaultItem(item)}
              </button>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
