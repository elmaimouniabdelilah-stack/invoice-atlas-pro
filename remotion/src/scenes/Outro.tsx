import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { C, FONT } from "../theme";

const POINTS = ["تصدير PDF بصفحة A4", "يعمل بدون إنترنت", "مشاركة عبر واتساب"];

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const vertical = height > width;

  const title = spring({ frame, fps, config: { damping: 18, stiffness: 130 } });
  const cta = spring({ frame: frame - 60, fps, config: { damping: 14 } });
  const pulse = 1 + Math.sin(frame / 12) * 0.015;

  return (
    <AbsoluteFill
      style={{
        fontFamily: FONT,
        direction: "rtl",
        alignItems: "center",
        justifyContent: "center",
        padding: vertical ? 70 : 110,
        textAlign: "center",
      }}
    >
      <div
        style={{
          opacity: title,
          transform: `translateY(${interpolate(title, [0, 1], [50, 0])}px)`,
          color: C.cream,
          fontSize: vertical ? 84 : 110,
          fontWeight: 700,
          lineHeight: 1.2,
        }}
      >
        كل فواتيرك <span style={{ color: C.gold }}>في مكان واحد</span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: vertical ? "column" : "row",
          gap: vertical ? 22 : 30,
          marginTop: 56,
        }}
      >
        {POINTS.map((p, i) => {
          const a = spring({
            frame: frame - 18 - i * 9,
            fps,
            config: { damping: 200 },
          });
          return (
            <div
              key={p}
              style={{
                opacity: a,
                transform: `translateY(${interpolate(a, [0, 1], [30, 0])}px)`,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 20,
                padding: vertical ? "22px 34px" : "24px 40px",
                color: C.cream,
                fontSize: vertical ? 38 : 40,
              }}
            >
              <span style={{ color: C.green, marginLeft: 14 }}>✓</span>
              {p}
            </div>
          );
        })}
      </div>

      <div
        style={{
          opacity: cta,
          transform: `scale(${interpolate(cta, [0, 1], [0.85, 1]) * pulse})`,
          marginTop: vertical ? 70 : 80,
          background: C.gold,
          color: "#1A1207",
          fontWeight: 700,
          fontSize: vertical ? 46 : 52,
          padding: vertical ? "26px 60px" : "28px 74px",
          borderRadius: 999,
          boxShadow: "0 24px 60px rgba(216,166,75,0.35)",
        }}
      >
        جرّب FacturaPro مجاناً
      </div>
    </AbsoluteFill>
  );
};
