import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { C, FONT } from "../theme";

type Props = {
  index: number;
  title: string;
  bullets: string[];
  image: string;
};

export const StepScene: React.FC<Props> = ({ index, title, bullets, image }) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const vertical = height > width;

  const imgIn = spring({ frame, fps, config: { damping: 20, stiffness: 90 } });
  const ken = interpolate(frame, [0, durationInFrames], [1.02, 1.1]);
  const shift = interpolate(frame, [0, durationInFrames], [0, vertical ? -18 : -26]);
  const titleIn = spring({ frame: frame - 8, fps, config: { damping: 18, stiffness: 120 } });
  const numIn = spring({ frame, fps, config: { damping: 12, stiffness: 160 } });

  const media = (
    <div
      style={{
        flex: vertical ? "0 0 auto" : 1.25,
        width: vertical ? "100%" : undefined,
        height: vertical ? height * 0.42 : "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: imgIn,
        transform: `translateX(${interpolate(imgIn, [0, 1], [vertical ? 0 : -60, 0])}px) translateY(${
          interpolate(imgIn, [0, 1], [vertical ? 40 : 0, 0]) + shift
        }px)`,
      }}
    >
      <div
        style={{
          borderRadius: 26,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 40px 90px rgba(0,0,0,0.55)",
          background: "rgba(255,255,255,0.03)",
          maxWidth: "100%",
          maxHeight: "100%",
        }}
      >
        <Img
          src={staticFile(image)}
          style={{
            display: "block",
            width: "100%",
            maxHeight: vertical ? height * 0.4 : height * 0.74,
            objectFit: "contain",
            transform: `scale(${ken})`,
          }}
        />
      </div>
    </div>
  );

  const text = (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: vertical ? 22 : 28,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 22,
          opacity: numIn,
          transform: `scale(${interpolate(numIn, [0, 1], [0.7, 1])})`,
        }}
      >
        <div
          style={{
            width: vertical ? 84 : 96,
            height: vertical ? 84 : 96,
            borderRadius: 24,
            background: C.gold,
            color: "#1A1207",
            fontWeight: 700,
            fontSize: vertical ? 46 : 52,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {index}
        </div>
        <div style={{ color: C.goldSoft, fontSize: vertical ? 32 : 34, letterSpacing: 2 }}>
          الخطوة {index} من ٣
        </div>
      </div>

      <div
        style={{
          opacity: titleIn,
          transform: `translateY(${interpolate(titleIn, [0, 1], [34, 0])}px)`,
          color: C.cream,
          fontSize: vertical ? 60 : 72,
          fontWeight: 700,
          lineHeight: 1.22,
        }}
      >
        {title}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: vertical ? 16 : 20 }}>
        {bullets.map((b, i) => {
          const a = spring({ frame: frame - 26 - i * 12, fps, config: { damping: 200 } });
          return (
            <div
              key={b}
              style={{
                opacity: a,
                transform: `translateX(${interpolate(a, [0, 1], [40, 0])}px)`,
                color: C.muted,
                fontSize: vertical ? 38 : 42,
                lineHeight: 1.5,
                display: "flex",
                gap: 16,
              }}
            >
              <span style={{ color: C.green }}>●</span>
              <span>{b}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <AbsoluteFill
      style={{
        fontFamily: FONT,
        direction: "rtl",
        display: "flex",
        flexDirection: vertical ? "column" : "row",
        alignItems: "center",
        gap: vertical ? 50 : 70,
        padding: vertical ? "90px 70px" : "90px 120px",
      }}
    >
      {text}
      {media}
    </AbsoluteFill>
  );
};
