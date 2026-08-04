import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";
import { SectionHeading } from "@/components/section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { themesQuery } from "@/lib/api";

export function ThemesSection() {
  const { data, isLoading, isError } = useQuery(themesQuery);
  const viewportRef = useRef<HTMLDivElement>(null);
  const inertiaFrameRef = useRef<number | null>(null);
  const isHoveredRef = useRef(false);
  const isDraggingRef = useRef(false);
  const dragRef = useRef({
    pointerId: -1,
    startX: 0,
    startScrollLeft: 0,
    lastX: 0,
    lastTime: 0,
    velocity: 0,
    suppressClickUntil: 0,
  });
  const themes = data ?? [];

  const normalizeScroll = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport || viewport.scrollWidth === 0) return;

    const sequenceWidth = viewport.scrollWidth / 3;
    if (viewport.scrollLeft < sequenceWidth * 0.5) {
      viewport.scrollLeft += sequenceWidth;
    } else if (viewport.scrollLeft > sequenceWidth * 1.5) {
      viewport.scrollLeft -= sequenceWidth;
    }
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || themes.length === 0) return;

    let frameId = 0;
    let previousTime = performance.now();

    const initialise = () => {
      viewport.scrollLeft = viewport.scrollWidth / 3;
    };

    const autoScroll = (time: number) => {
      const elapsed = time - previousTime;
      previousTime = time;

      if (!isHoveredRef.current && !isDraggingRef.current) {
        viewport.scrollLeft += elapsed * 0.025;
        normalizeScroll();
      }

      frameId = requestAnimationFrame(autoScroll);
    };

    initialise();
    frameId = requestAnimationFrame(autoScroll);

    return () => {
      cancelAnimationFrame(frameId);
      if (inertiaFrameRef.current) cancelAnimationFrame(inertiaFrameRef.current);
    };
  }, [normalizeScroll, themes.length]);

  const startInertia = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    if (inertiaFrameRef.current) cancelAnimationFrame(inertiaFrameRef.current);

    let velocity = dragRef.current.velocity;
    let previousTime = performance.now();

    const move = (time: number) => {
      const elapsed = time - previousTime;
      previousTime = time;
      velocity *= 0.94;

      if (Math.abs(velocity) < 0.01) {
        inertiaFrameRef.current = null;
        return;
      }

      viewport.scrollLeft += velocity * elapsed;
      normalizeScroll();
      inertiaFrameRef.current = requestAnimationFrame(move);
    };

    inertiaFrameRef.current = requestAnimationFrame(move);
  };

  return (
    <section id="themes" className="section-pad relative">
      <div className="shell">
        <SectionHeading
          eyebrow="Themes"
          title={
            <>
              Explore the themes. <span className="text-gradient">Pick your battlefield.</span>
            </>
          }
          description="Themes group the problem statements released by ministries and industry partners. Start from the domain your team already loves."
        />

        <div className="mt-14">
          {isLoading ? (
            <div className="flex gap-3">
              <div className="w-[18rem] shrink-0 rounded-3xl border border-border bg-card p-6">
                <Skeleton className="h-11 w-11 rounded-2xl" />
                <Skeleton className="mt-5 h-5 w-2/3" />
              </div>
            </div>
          ) : null}

          {isError ? (
            <p className="text-sm text-muted-foreground">
              Themes could not be loaded right now. Please refresh in a moment.
            </p>
          ) : null}

          {!isLoading && !isError && themes.length > 0 ? (
            <div
              ref={viewportRef}
              className="-mx-1 overflow-x-auto px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              style={{ touchAction: "pan-y" }}
              onMouseEnter={() => {
                isHoveredRef.current = true;
              }}
              onMouseLeave={() => {
                isHoveredRef.current = false;
              }}
              onPointerDown={(event) => {
                const viewport = viewportRef.current;
                if (!viewport) return;

                if (inertiaFrameRef.current) cancelAnimationFrame(inertiaFrameRef.current);
                isDraggingRef.current = true;
                dragRef.current = {
                  ...dragRef.current,
                  pointerId: event.pointerId,
                  startX: event.clientX,
                  startScrollLeft: viewport.scrollLeft,
                  lastX: event.clientX,
                  lastTime: performance.now(),
                  velocity: 0,
                };
                viewport.setPointerCapture(event.pointerId);
              }}
              onPointerMove={(event) => {
                if (!isDraggingRef.current || event.pointerId !== dragRef.current.pointerId) return;

                const viewport = viewportRef.current;
                if (!viewport) return;

                const now = performance.now();
                const elapsed = now - dragRef.current.lastTime || 1;
                const distance = event.clientX - dragRef.current.startX;
                viewport.scrollLeft = dragRef.current.startScrollLeft - distance;
                dragRef.current.velocity = -(event.clientX - dragRef.current.lastX) / elapsed;
                dragRef.current.lastX = event.clientX;
                dragRef.current.lastTime = now;
                normalizeScroll();
              }}
              onPointerUp={(event) => {
                const viewport = viewportRef.current;
                if (!viewport || event.pointerId !== dragRef.current.pointerId) return;

                const wasDragged = Math.abs(event.clientX - dragRef.current.startX) > 6;
                dragRef.current.suppressClickUntil = wasDragged ? Date.now() + 250 : 0;
                isDraggingRef.current = false;
                viewport.releasePointerCapture(event.pointerId);
                startInertia();
              }}
              onPointerCancel={() => {
                isDraggingRef.current = false;
              }}
              onWheel={(event) => {
                if (event.deltaX === 0) return;
                event.preventDefault();
                const viewport = viewportRef.current;
                if (!viewport) return;

                viewport.scrollLeft += event.deltaX;
                normalizeScroll();
              }}
              onScroll={normalizeScroll}
            >
              <div className="flex w-max gap-3 py-1">
                {[...themes, ...themes, ...themes].map((theme, index) => {
                  const isDuplicate = index < themes.length || index >= themes.length * 2;

                  return (
                    <Link
                      key={`${theme.id}-${index}`}
                      to="/themes"
                      aria-hidden={isDuplicate || undefined}
                      tabIndex={isDuplicate ? -1 : undefined}
                      onClick={(event) => {
                        if (Date.now() < dragRef.current.suppressClickUntil) {
                          event.preventDefault();
                        }
                      }}
                      className="group relative grid w-[18rem] shrink-0 place-items-center gap-5 overflow-hidden rounded-3xl border border-border bg-card p-6 text-center shadow-soft transition-colors hover:border-primary/40"
                    >
                      <div
                        aria-hidden
                        className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                      />
                      {theme.icon ? (
                        <img
                          src={theme.icon}
                          alt={theme.name}
                          loading="lazy"
                          draggable={false}
                          className="relative h-16 w-16 object-contain"
                        />
                      ) : null}
                      <h3 className="relative font-display text-base font-semibold">{theme.name}</h3>
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : null}

          {!isLoading && !isError && themes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No themes are available right now.</p>
          ) : null}
        </div>

        {!isLoading && !isError && themes.length > 0 ? (
          <div className="mt-8">
            <Link
              to="/themes"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              View All Themes
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
