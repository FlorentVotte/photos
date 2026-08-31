"use client";

// Ported from the design handoff's `globe-hero.js` custom element, which was
// itself adapted from Globe3D. Kept separate from Globe3D on purpose: the hero
// needs travel arcs, an imperative focusOn, drag inertia and screen-projected
// hotspots, while Globe3D needs album thumbnails and OrbitControls. Folding
// both into one component would serve neither.
//
// Differences from the prototype: three comes from the installed package rather
// than a CDN, textures load from /globe/, the accent colour is read from the
// live theme, `preserveDrawingBuffer` is dropped (it existed for prototype
// screenshots and costs fill rate), and everything is disposed on unmount.

import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  type RefObject,
} from "react";
import * as THREE from "three";
import type { AlbumMarker } from "@/lib/types";

export interface GlobeHeroHandle {
  /** Ease the globe until the named album's marker faces the camera. */
  focusOn: (slug: string) => void;
  /** Drop the focus target and let the idle spin resume. */
  releaseFocus: () => void;
}

interface GlobeHeroProps {
  markers: AlbumMarker[];
  /** Camera distance as a multiple of the globe radius. */
  distance?: number;
  /** Resting tilt of the globe, in radians. */
  tilt?: number;
  /** Marker hit-target diameter in CSS pixels. */
  hotspotSize?: number;
  handleRef?: RefObject<GlobeHeroHandle | null>;
  onMarkerEnter?: (marker: AlbumMarker) => void;
  onMarkerLeave?: (marker: AlbumMarker) => void;
  onMarkerClick?: (marker: AlbumMarker) => void;
  className?: string;
}

const RADIUS = 1;
const IDLE_SPIN = 0.075;
const ACCENT_FALLBACK = "#6c9bb5";

function latLngToVector3(lat: number, lng: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
  );
}

export default function GlobeHero({
  markers,
  distance = 2.9,
  tilt = 0.3,
  hotspotSize = 34,
  handleRef,
  onMarkerEnter,
  onMarkerLeave,
  onMarkerClick,
  className = "",
}: GlobeHeroProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<GlobeHeroHandle | null>(null);

  // The callbacks live in a ref so the scene is built once rather than torn
  // down whenever the parent re-renders with new function identities.
  const callbacks = useRef({ onMarkerEnter, onMarkerLeave, onMarkerClick });
  useEffect(() => {
    callbacks.current = { onMarkerEnter, onMarkerLeave, onMarkerClick };
  }, [onMarkerEnter, onMarkerLeave, onMarkerClick]);

  const focusOn = useCallback((slug: string) => apiRef.current?.focusOn(slug), []);
  const releaseFocus = useCallback(() => apiRef.current?.releaseFocus(), []);

  useImperativeHandle(handleRef, () => ({ focusOn, releaseFocus }), [
    focusOn,
    releaseFocus,
  ]);

  const markerKey = markers
    .map((m) => `${m.slug}:${m.lat.toFixed(4)},${m.lng.toFixed(4)}`)
    .join("|");

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduceMotion = prefersReducedMotion();

    // Accent comes from the theme's CSS variables so the globe follows a theme
    // switch instead of hardcoding Ocean Blue's slate.
    const accentValue = getComputedStyle(mount)
      .getPropertyValue("--color-primary")
      .trim();
    const accent = new THREE.Color(accentValue || ACCENT_FALLBACK);

    const overlay = document.createElement("div");
    Object.assign(overlay.style, {
      position: "absolute",
      inset: "0",
      pointerEvents: "none",
      zIndex: "2",
    });
    mount.appendChild(overlay);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, RADIUS * distance);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    Object.assign(renderer.domElement.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      zIndex: "1",
      cursor: "grab",
      touchAction: "pan-y",
    });
    mount.insertBefore(renderer.domElement, overlay);

    const world = new THREE.Group();
    world.rotation.x = tilt;
    scene.add(world);

    const spin = new THREE.Group();
    // Bring the album cluster (roughly 10°E) round to face the camera.
    spin.rotation.y = -((10 + 90) * Math.PI) / 180;
    world.add(spin);

    const disposables: { dispose: () => void }[] = [];
    const track = <T extends { dispose: () => void }>(item: T) => {
      disposables.push(item);
      return item;
    };

    const loader = new THREE.TextureLoader();
    const earthTexture = track(
      loader.load("/globe/earth-blue-marble.jpg", (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 16;
      })
    );
    const bumpTexture = track(
      loader.load("/globe/earth-topology.png", (t) => {
        t.anisotropy = 8;
      })
    );

    const globe = new THREE.Mesh(
      track(new THREE.SphereGeometry(RADIUS, 64, 64)),
      track(
        new THREE.MeshStandardMaterial({
          map: earthTexture,
          bumpMap: bumpTexture,
          bumpScale: 0.04,
          roughness: 0.82,
          metalness: 0,
        })
      )
    );
    spin.add(globe);

    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(5, 2, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x88ccff, 0.45);
    rim.position.set(-3, 1, -2);
    scene.add(rim);

    // ---- markers -----------------------------------------------------------
    const points = markers.map((m) =>
      latLngToVector3(m.lat, m.lng, RADIUS * 1.005)
    );
    const rings: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>[] = [];

    points.forEach((point, index) => {
      const dot = new THREE.Mesh(
        track(new THREE.SphereGeometry(0.014, 12, 12)),
        track(new THREE.MeshBasicMaterial({ color: accent }))
      );
      dot.position.copy(point);
      spin.add(dot);

      const ring = new THREE.Mesh(
        track(new THREE.RingGeometry(0.026, 0.034, 32)),
        track(
          new THREE.MeshBasicMaterial({
            color: accent,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide,
          })
        )
      );
      ring.position.copy(point);
      ring.lookAt(0, 0, 0);
      ring.userData.phase = index * 0.7;
      spin.add(ring);
      rings.push(ring);
    });

    // ---- travel arcs between consecutive albums ----------------------------
    const arcs = points.slice(0, -1).map((from, index) => {
      const to = points[index + 1];
      const mid = from.clone().add(to).multiplyScalar(0.5);
      const lift = 1 + 0.18 + from.distanceTo(to) * 0.16;
      mid.normalize().multiplyScalar(lift);

      const curve = new THREE.QuadraticBezierCurve3(from.clone(), mid, to.clone());
      const curvePoints = curve.getPoints(96);
      const geometry = track(
        new THREE.BufferGeometry().setFromPoints(curvePoints)
      );
      // Reduced motion gets the finished arc rather than a drawing animation.
      geometry.setDrawRange(0, reduceMotion ? curvePoints.length : 0);

      const line = new THREE.Line(
        geometry,
        track(
          new THREE.LineBasicMaterial({
            color: accent,
            transparent: true,
            opacity: reduceMotion ? 0.8 : 0.75,
          })
        )
      );
      spin.add(line);

      const head = new THREE.Mesh(
        track(new THREE.SphereGeometry(0.012, 10, 10)),
        track(new THREE.MeshBasicMaterial({ color: 0xffffff }))
      );
      head.visible = false;
      spin.add(head);

      return {
        curve,
        geometry,
        line,
        head,
        count: curvePoints.length,
        start: index * 0.55,
      };
    });

    // ---- screen-projected hotspots -----------------------------------------
    let hovering = false;
    const cleanups: (() => void)[] = [];

    const hotspots = markers.map((marker) => {
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("aria-label", marker.label);
      Object.assign(button.style, {
        position: "absolute",
        left: "0",
        top: "0",
        width: `${hotspotSize}px`,
        height: `${hotspotSize}px`,
        margin: `${-hotspotSize / 2}px 0 0 ${-hotspotSize / 2}px`,
        borderRadius: "9999px",
        border: "0",
        background: "transparent",
        padding: "0",
        cursor: "pointer",
        pointerEvents: "auto",
        opacity: "0",
        transition: "opacity 180ms ease-out",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      });

      const label = document.createElement("span");
      label.textContent = marker.label;
      label.className = "globe-hero-label";
      button.appendChild(label);

      const enter = () => {
        hovering = true;
        label.dataset.shown = "true";
        callbacks.current.onMarkerEnter?.(marker);
      };
      const leave = () => {
        hovering = false;
        delete label.dataset.shown;
        callbacks.current.onMarkerLeave?.(marker);
      };
      const click = () => callbacks.current.onMarkerClick?.(marker);

      button.addEventListener("pointerenter", enter);
      button.addEventListener("pointerleave", leave);
      button.addEventListener("focus", enter);
      button.addEventListener("blur", leave);
      button.addEventListener("click", click);
      cleanups.push(() => {
        button.removeEventListener("pointerenter", enter);
        button.removeEventListener("pointerleave", leave);
        button.removeEventListener("focus", enter);
        button.removeEventListener("blur", leave);
        button.removeEventListener("click", click);
      });

      overlay.appendChild(button);
      return button;
    });

    // ---- focus target ------------------------------------------------------
    let target: { x: number; y: number } | null = null;

    apiRef.current = {
      focusOn: (slug) => {
        const index = markers.findIndex((m) => m.slug === slug);
        if (index < 0) return;
        const point = points[index];
        const radial = Math.hypot(point.x, point.z);
        // Unwrap to the shortest way round from where the globe currently sits.
        const current = spin.rotation.y;
        const raw = Math.atan2(-point.x, point.z);
        const y =
          current +
          ((((raw - current) % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2)) -
          Math.PI;
        target = {
          y,
          x: Math.max(-0.6, Math.min(0.8, Math.atan2(point.y, radial))),
        };
        hovering = true;
      },
      releaseFocus: () => {
        target = null;
        hovering = false;
      },
    };

    // ---- drag to spin ------------------------------------------------------
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let velocity = 0;
    const canvas = renderer.domElement;

    const onPointerDown = (event: PointerEvent) => {
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      canvas.setPointerCapture(event.pointerId);
      canvas.style.cursor = "grabbing";
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      lastX = event.clientX;
      lastY = event.clientY;
      spin.rotation.y += dx * 0.005;
      world.rotation.x = Math.max(
        -0.7,
        Math.min(0.9, world.rotation.x + dy * 0.004)
      );
      velocity = dx * 0.005;
    };
    const endDrag = (event: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      canvas.style.cursor = "grab";
      try {
        canvas.releasePointerCapture(event.pointerId);
      } catch {
        // The pointer may already have been released; nothing to undo.
      }
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", endDrag);
    canvas.addEventListener("pointercancel", endDrag);
    cleanups.push(() => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", endDrag);
      canvas.removeEventListener("pointercancel", endDrag);
    });

    // ---- sizing ------------------------------------------------------------
    const resize = () => {
      const width = mount.clientWidth || 1;
      const height = mount.clientHeight || 1;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();

    // ---- frame loop --------------------------------------------------------
    const projected = new THREE.Vector3();
    const startedAt = performance.now();
    let previous = startedAt;
    let frame = 0;

    const tick = () => {
      frame = requestAnimationFrame(tick);
      const now = performance.now();
      const elapsed = (now - startedAt) / 1000;
      const delta = Math.min(0.05, (now - previous) / 1000);
      previous = now;

      if (!dragging) {
        if (target) {
          const k = 1 - Math.pow(0.004, delta);
          spin.rotation.y += (target.y - spin.rotation.y) * k;
          world.rotation.x += (target.x - world.rotation.x) * k;
          velocity = 0;
        } else {
          const idle = hovering || reduceMotion ? 0 : IDLE_SPIN;
          spin.rotation.y += idle * delta + velocity;
          world.rotation.x += (tilt - world.rotation.x) * (1 - Math.pow(0.15, delta));
          velocity *= 0.94;
          if (Math.abs(velocity) < 1e-5) velocity = 0;
        }
      }

      if (!reduceMotion) {
        rings.forEach((ring) => {
          const phase = (elapsed * 0.7 + (ring.userData.phase as number)) % 1;
          ring.scale.setScalar(1 + phase * 1.6);
          ring.material.opacity = 0.5 * (1 - phase);
        });

        arcs.forEach((arc) => {
          const local = elapsed - arc.start;
          if (local < 0) return;
          // Draw over 3.2s, then hold for the rest of a 6s cycle.
          const progress = Math.min(1, (local % 6) / 3.2);
          arc.geometry.setDrawRange(0, Math.floor(progress * arc.count));
          arc.line.material.opacity = 0.25 + 0.55 * Math.min(1, progress * 2);
          arc.head.visible = progress < 1;
          if (progress < 1) arc.head.position.copy(arc.curve.getPoint(progress));
        });
      }

      const width = mount.clientWidth;
      const height = mount.clientHeight;
      const cameraDirection = camera.position.clone().normalize();
      points.forEach((point, index) => {
        projected.copy(point).applyMatrix4(spin.matrixWorld);
        const facing =
          projected.clone().normalize().dot(cameraDirection) > 0.12;
        const button = hotspots[index];
        button.style.opacity = facing ? "1" : "0";
        button.style.pointerEvents = facing ? "auto" : "none";
        projected.project(camera);
        button.style.transform = `translate(${
          (projected.x * 0.5 + 0.5) * width
        }px, ${(-projected.y * 0.5 + 0.5) * height}px)`;
      });

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      cleanups.forEach((fn) => fn());
      apiRef.current = null;
      disposables.forEach((item) => item.dispose());
      renderer.dispose();
      renderer.domElement.remove();
      overlay.remove();
    };
    // markerKey stands in for `markers`: the scene is rebuilt when the set of
    // albums or their coordinates change, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markerKey, distance, tilt, hotspotSize]);

  return <div ref={mountRef} className={`absolute inset-0 ${className}`} />;
}
