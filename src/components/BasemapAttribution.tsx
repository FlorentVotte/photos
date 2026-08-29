// Credit for the OpenFreeMap basemap, for maps that render without Leaflet's
// attribution control. Maps that keep the control get the same credits from the
// style's own tile sources and must not render this as well.
//
// Deliberately free of any leaflet/maplibre import so it stays safe to import
// statically from a component that reaches the server bundle.
export default function BasemapAttribution({
  className = "",
}: {
  className?: string;
}) {
  return (
    <p className={`text-[10px] leading-relaxed text-text-muted/60 ${className}`}>
      &copy;{" "}
      <a
        href="https://openfreemap.org/"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-text-muted"
      >
        OpenFreeMap
      </a>{" "}
      &copy;{" "}
      <a
        href="https://www.openstreetmap.org/copyright"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-text-muted"
      >
        OpenStreetMap
      </a>
    </p>
  );
}
