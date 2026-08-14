import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { C } from "../theme";

export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 90) * 40;
  const drift2 = Math.cos(frame / 120) * 60;
  const glow = interpolate(Math.sin(frame / 60), [-1, 1], [0.18, 0.32]);

  return (
    <AbsoluteFill style={{ backgroundColor: C.bgDeep }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${50 + drift / 20}% 20%, ${C.panel} 0%, ${C.bg} 45%, ${C.bgDeep} 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          left: drift,
          top: drift2,
          background: `radial-gradient(circle at 15% 85%, rgba(216,166,75,${glow}) 0%, rgba(216,166,75,0) 38%)`,
        }}
      />
      <AbsoluteFill
        style={{
          right: drift,
          background: `radial-gradient(circle at 88% 12%, rgba(76,175,125,0.16) 0%, rgba(76,175,125,0) 34%)`,
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.06,
          backgroundImage:
            "repeating-linear-gradient(45deg, #fff 0 2px, transparent 2px 26px)",
        }}
      />
    </AbsoluteFill>
  );
};
