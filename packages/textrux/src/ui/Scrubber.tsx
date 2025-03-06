import React, { useState, useRef, useEffect } from "react";

/**
 * Simple "play/stop + time slider" to demonstrate the same UI
 * from the wave-simulation example.
 */
export function Scrubber() {
  // time state
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // for animation
  const requestRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);

  // how long (in seconds) the timeline is:
  const maxTime = 10;

  const handlePlayStop = () => {
    setIsPlaying((prev) => !prev);
  };

  // If playing, animate:
  useEffect(() => {
    if (!isPlaying) {
      // Stop the animation
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
      lastTimestampRef.current = null;
      return;
    }

    function animate(timestamp: number) {
      if (lastTimestampRef.current == null) {
        lastTimestampRef.current = timestamp;
      }
      const delta = (timestamp - lastTimestampRef.current) / 1000; // ms => s
      lastTimestampRef.current = timestamp;

      setCurrentTime((prev) => {
        let newTime = prev + delta;
        if (newTime >= maxTime) {
          newTime = maxTime;
          // optionally stop once we hit the end:
          setIsPlaying(false);
        }
        return newTime;
      });

      requestRef.current = requestAnimationFrame(animate);
    }

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    };
  }, [isPlaying]);

  // Keep time in [0, maxTime]:
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
  };

  return (
    <div style={styles.timeControls}>
      <button style={styles.playButton} onClick={handlePlayStop}>
        {isPlaying ? "Stop" : "Play"}
      </button>

      <input
        type="range"
        min={0}
        max={maxTime}
        step={0.01}
        value={currentTime}
        onChange={handleSliderChange}
        style={{ flex: 1 }}
      />

      <div style={styles.timeIndicator}>{currentTime.toFixed(2)}s</div>
    </div>
  );
}

// inline style objects that replicate the sample's CSS
const styles: Record<string, React.CSSProperties> = {
  timeControls: {
    marginTop: "0px",
    display: "flex",
    alignItems: "center",
  },
  playButton: {
    marginRight: "10px",
    padding: "5px 10px",
    fontSize: "14px",
    cursor: "pointer",
  },
  timeIndicator: {
    fontWeight: "bold",
    marginLeft: "10px",
    width: "60px",
    textAlign: "center",
  },
};
