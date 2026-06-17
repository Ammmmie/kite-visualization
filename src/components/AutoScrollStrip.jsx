import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_SCROLL_SPEED = 36;
const REPEAT_COUNT = 13;
const CENTER_GROUP_INDEX = Math.floor(REPEAT_COUNT / 2);

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
  const hasPositionedRef = useRef(false);
  const isPausedRef = useRef(false);
  const isPointerDownRef = useRef(false);
  const isDraggingRef = useRef(false);
  const activePointerIdRef = useRef(null);
  const dragStartXRef = useRef(0);
  const dragStartYRef = useRef(0);
  const dragStartScrollRef = useRef(0);
  const suppressClickRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  const centerScroll = useCallback((preservePhase = true) => {
    const strip = stripRef.current;
    const groupWidth = groupWidthRef.current;
    if (!strip || groupWidth <= 0) {
      return;
    }

    const phase = preservePhase ? ((strip.scrollLeft % groupWidth) + groupWidth) % groupWidth : 0;
    strip.scrollLeft = groupWidth * CENTER_GROUP_INDEX + phase;
    hasPositionedRef.current = true;
  }, []);

  const normalizeScroll = useCallback(() => {
    const strip = stripRef.current;
    const groupWidth = groupWidthRef.current;
    if (!strip || groupWidth <= 0) {
      return;
    }

    const lowerBound = groupWidth * CENTER_GROUP_INDEX;
    const upperBound = lowerBound + groupWidth;

    while (strip.scrollLeft >= upperBound) {
      strip.scrollLeft -= groupWidth;
    }

    while (strip.scrollLeft < lowerBound) {
      strip.scrollLeft += groupWidth;
    }
  }, []);

  useEffect(() => {
    const measure = () => {
      const nextGroupWidth = groupRef.current?.scrollWidth || 0;
      if (nextGroupWidth <= 0) {
        return;
      }

      groupWidthRef.current = nextGroupWidth;
      if (!hasPositionedRef.current) {
        centerScroll(false);
      } else {
        normalizeScroll();
      }
    };

    hasPositionedRef.current = false;
    measure();
    const frameId = window.requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    if (resizeObserver) {
      if (stripRef.current) {
        resizeObserver.observe(stripRef.current);
      }
      if (groupRef.current) {
        resizeObserver.observe(groupRef.current);
      }
    }

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", measure);
      resizeObserver?.disconnect();
    };
  }, [items, centerScroll, normalizeScroll]);

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
      dragStartYRef.current = event.clientY;
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
      const deltaY = event.clientY - dragStartYRef.current;

      if (!isDraggingRef.current && Math.abs(deltaY) > 8 && Math.abs(deltaY) > Math.abs(deltaX)) {
        isPointerDownRef.current = false;
        activePointerIdRef.current = null;
        isPausedRef.current = Boolean(pauseOnHover && strip.matches(":hover"));
        return;
      }

      if (Math.abs(deltaX) > 8 && Math.abs(deltaX) > Math.abs(deltaY)) {
        suppressClickRef.current = true;
        if (!isDraggingRef.current) {
          isDraggingRef.current = true;
          strip.setPointerCapture?.(event.pointerId);
          setIsDragging(true);
        }
      }

      if (isDraggingRef.current) {
        strip.scrollLeft = dragStartScrollRef.current - deltaX;
        const beforeNormalize = strip.scrollLeft;
        normalizeScroll();
        if (strip.scrollLeft !== beforeNormalize) {
          dragStartScrollRef.current = strip.scrollLeft + deltaX;
        }
      }
    },
    [normalizeScroll, pauseOnHover]
  );

  const handleWheel = useCallback(
    (event) => {
      const strip = stripRef.current;
      if (!strip) {
        return;
      }

      const isVerticalGesture = Math.abs(event.deltaY) >= Math.abs(event.deltaX);
      if (isVerticalGesture) {
        event.preventDefault();
        window.scrollBy({ top: event.deltaY, left: 0, behavior: "auto" });
        return;
      }

      event.preventDefault();
      strip.scrollLeft += event.deltaX;
      normalizeScroll();
    },
    [normalizeScroll]
  );

  const stopDrag = useCallback(
    (event) => {
      if (!isPointerDownRef.current || activePointerIdRef.current !== event.pointerId) {
        return;
      }

      const wasDragging = isDraggingRef.current;

      if (wasDragging) {
        stripRef.current?.releasePointerCapture?.(event.pointerId);
      }

      isPointerDownRef.current = false;
      isDraggingRef.current = false;
      activePointerIdRef.current = null;
      setIsDragging(false);

      isPausedRef.current = wasDragging ? false : Boolean(pauseOnHover && stripRef.current?.matches(":hover"));
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
      onWheel={handleWheel}
    >
      <div className="auto-scroll-strip__track">
        {Array.from({ length: REPEAT_COUNT }, (_, groupIndex) => (
          <div
            className="auto-scroll-strip__group"
            key={groupIndex}
            ref={groupIndex === 0 ? groupRef : undefined}
            aria-hidden={groupIndex !== CENTER_GROUP_INDEX}
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
