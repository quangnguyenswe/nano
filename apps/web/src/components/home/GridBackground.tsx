import React from "react";

const GRID_COLS = 27;
const GRID_ROWS = 8;
const CELL_SIZE = 56.815;
const GRID_WIDTH = 1534;
const GRID_HEIGHT = 454.52;

interface AnimationValue {
  delay: number;
  duration: number;
}

/**
 * Generates animation values (delay and duration) based on distance from center.
 * Creates a ripple effect that emanates from the center of the grid.
 */
function generateAnimationValues(): AnimationValue[] {
  const centerX = (GRID_COLS - 1) / 2;
  const centerY = (GRID_ROWS - 1) / 2;

  const values: AnimationValue[] = [];

  // Calculate max distance for normalization
  const maxDistance = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2));

  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      // Calculate Euclidean distance from center
      const distX = col - centerX;
      const distY = row - centerY;
      const distance = Math.sqrt(distX * distX + distY * distY);

      // Normalize distance to 0-1 range
      const normalizedDistance = distance / maxDistance;

      // Base values: min at center (0), max at edges (1)
      const minDelay = 330;
      const maxDelay = 1201;
      const minDuration = 680;
      const maxDuration = 1947;

      // Interpolate based on distance
      const delay = minDelay + (maxDelay - minDelay) * normalizedDistance;
      const duration =
        minDuration + (maxDuration - minDuration) * normalizedDistance;

      values.push({ delay, duration });
    }
  }

  return values;
}

const gridAnimations = generateAnimationValues();

export default function GridBackground() {
  return (
    <div className="absolute inset-0 h-full w-full object-center [--cell-border-color:color-mix(in_oklab,var(--accent),black_10%)] [--cell-fill-color:var(--accent)] [--cell-shadow-color:color-mix(in_oklab,var(--accent),black_43%)] dark:[--cell-border-color:color-mix(in_oklab,var(--accent),white_14%)] dark:[--cell-fill-color:color-mix(in_oklab,var(--accent),black_22%)] dark:[--cell-shadow-color:var(--accent)]">
      <div className="relative flex h-auto w-auto justify-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-[2] h-full w-full overflow-hidden"></div>
        <div
          className="relative z-[3] mask-radial-from-20% mask-radial-at-top opacity-600"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${GRID_COLS}, ${CELL_SIZE}px)`,
            gridTemplateRows: `repeat(${GRID_ROWS}, ${CELL_SIZE}px)`,
            width: `${GRID_WIDTH}px`,
            height: `${GRID_HEIGHT}px`,
            marginInline: "auto",
          }}
        >
          {gridAnimations.map((animation, index) => (
            <div
              key={index}
              className="cell relative border-[0.5px] opacity-40 transition-all duration-150 will-change-transform hover:opacity-60 hover:brightness-95 dark:shadow-[0px_0px_40px_1px_var(--cell-shadow-color)_inset] dark:hover:opacity-90 animate-cell-ripple [animation-fill-mode:none]"
              style={
                {
                  backgroundColor: "var(--cell-fill-color)",
                  borderColor: "var(--cell-border-color)",
                  "--delay": `${animation.delay}ms`,
                  "--duration": `${animation.duration}ms`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
