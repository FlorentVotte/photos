export interface HeroParallax {
  imageY: number;
  textY: number;
  textOpacity: number;
}

/** Parallax values for the album hero from the page scroll and hero height. */
export function heroParallax(scrollY: number, heroHeight: number): HeroParallax {
  const y = Math.max(0, scrollY);
  const fadeSpan = heroHeight * 0.6;
  return {
    imageY: y * 0.35,
    textY: y * 0.18,
    textOpacity: fadeSpan > 0 ? Math.max(0, 1 - y / fadeSpan) : 0,
  };
}
