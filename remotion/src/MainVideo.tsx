import { AbsoluteFill, useVideoConfig } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { Background } from "./components/Background";
import { Intro } from "./scenes/Intro";
import { Outro } from "./scenes/Outro";
import { StepScene } from "./scenes/StepScene";
import { C, FONT } from "./theme";

const STEPS = [
  {
    title: "أدخل بيانات شركتك واختر القالب",
    bullets: [
      "حقول ICE و IF و RC و CNSS جاهزة",
      "ثلاثة قوالب مغربية مع لونك الخاص",
      "نفس التجربة على الحاسوب والهاتف",
    ],
    image: "images/step1.png",
  },
  {
    title: "أضف العميل والأصناف مع معاينة حية",
    bullets: [
      "الكميات والأسعار واحتساب TVA تلقائياً",
      "الفاتورة تتحدّث أمامك مباشرة",
      "المبلغ بالحروف بالفرنسية تلقائياً",
    ],
    image: "images/step2.png",
  },
  {
    title: "اطبع، صدّر PDF أو شارك",
    bullets: [
      "صفحة A4 واحدة بدقة عالية",
      "مشاركة عبر واتساب أو البريد",
      "حفظ تلقائي في سجل الفواتير",
    ],
    image: "images/step3.png",
  },
];

export const MainVideo: React.FC<{ vertical?: boolean }> = () => {
  const { width, height } = useVideoConfig();
  const vertical = height > width;

  return (
    <AbsoluteFill>
      <Background />

      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={130}>
          <Intro />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        <TransitionSeries.Sequence durationInFrames={250}>
          <StepScene index={1} {...STEPS[0]} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-left" })}
          timing={linearTiming({ durationInFrames: 20 })}
        />
        <TransitionSeries.Sequence durationInFrames={250}>
          <StepScene index={2} {...STEPS[1]} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-left" })}
          timing={linearTiming({ durationInFrames: 20 })}
        />
        <TransitionSeries.Sequence durationInFrames={250}>
          <StepScene index={3} {...STEPS[2]} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        <TransitionSeries.Sequence durationInFrames={180}>
          <Outro />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <AbsoluteFill
        style={{
          fontFamily: FONT,
          direction: "rtl",
          justifyContent: "flex-end",
          alignItems: "center",
          padding: vertical ? 40 : 44,
          pointerEvents: "none",
        }}
      >
        <div style={{ color: C.muted, fontSize: vertical ? 28 : 26, opacity: 0.75 }}>
          facturapro.pro
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
