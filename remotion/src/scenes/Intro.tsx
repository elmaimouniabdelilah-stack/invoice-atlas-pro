import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { C, FONT } from "../theme";

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const vertical = height > width;

  const s = spring({ frame, fps, config: { damping: 18, stiffness: 140 } });
  const y = interpolate(s, [0, 1], [70, 0]);
  const sub = spring({ frame: frame - 14, fps, config: { damping: 200 } });
  const line = spring({ frame: frame - 24, fps, config: { damping: 200 } });
  const tag = spring({ frame: frame - 34, fps, config: { damping: 16 } });
  const out = interpolate(frame, [78, 96], [1, 0.94], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        fontFamily: FONT,
        direction: "rtl",
        alignItems: "center",
        justifyContent: "center",
        padding: vertical ? 80 : 120,
      }}
    >
      <div style={{ transform: `scale(${out})`, textAlign: "center" }}>
        <div
          style={{
            opacity: tag,
            transform: `translateY(${interpolate(tag, [0, 1], [24, 0])}px)`,
            display: "inline-block",
            border: `2px solid ${C.gold}`,
            color: C.goldSoft,
            borderRadius: 999,
            padding: vertical ? "14px 34px" : "12px 32px",
            fontSize: vertical ? 34 : 30,
            marginBottom: 44,
            letterSpacing: 1,
          }}
        >
          FacturaPro · المغرب
        </div>
        <div
          style={{
            opacity: s,
            transform: `translateY(${y}px)`,
            color: C.cream,
            fontSize: vertical ? 96 : 128,
            fontWeight: 700,
            lineHeight: 1.15,
          }}
        >
          فاتورتك جاهزة
          <br />
          <span style={{ color: C.gold }}>في ٣ خطوات</span>
        </div>
        <div
          style={{
            width: interpolate(line, [0, 1], [0, vertical ? 420 : 620]),
            height: 6,
            background: C.gold,
            borderRadius: 6,
            margin: "42px auto",
          }}
        />
        <div
          style={{
            opacity: sub,
            color: C.muted,
            fontSize: vertical ? 42 : 46,
            lineHeight: 1.6,
          }}
        >
          على الحاسوب والهاتف — متوافقة مع التشريع المغربي
        </div>
      </div>
    </AbsoluteFill>
  );
};
