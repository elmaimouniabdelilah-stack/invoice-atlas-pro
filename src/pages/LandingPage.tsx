import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  FileText, ShieldCheck, Smartphone, Printer, Users, BarChart3,
  Zap, Layers, ArrowLeft, CheckCircle2, Sparkles,
} from 'lucide-react';


const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'متوافق مع التشريع المغربي',
    desc: 'حقول ICE، IF، RC، CNSS ودعم نظام Auto-entrepreneur. تحويل المبالغ إلى نص فرنسي تلقائياً.',
  },
  {
    icon: Printer,
    title: 'تصدير PDF احترافي',
    desc: 'صفحة A4 واحدة بدقة عالية، جاهزة للطباعة أو الإرسال للعملاء مباشرةً.',
  },
  {
    icon: Smartphone,
    title: 'تطبيق ويب قابل للتثبيت (PWA)',
    desc: 'يعمل دون اتصال بالإنترنت، يُثبّت على الهاتف كتطبيق أصلي ويعمل بسرعة فائقة.',
  },
  {
    icon: Layers,
    title: 'قوالب فواتير متعددة',
    desc: 'عدة تصاميم مغربية وفرنسية مع تخصيص الألوان والخطوط والشعار.',
  },
  {
    icon: BarChart3,
    title: 'لوحة تحكم وإحصائيات',
    desc: 'متابعة الإيرادات الشهرية، عدد الفواتير والعملاء، وأفضل العملاء في نظرة واحدة.',
  },
  {
    icon: Users,
    title: 'إدارة العملاء والمنتجات',
    desc: 'قاعدة بيانات كاملة للعملاء والمنتجات مع حساب المتر المربع والوضع المفصّل.',
  },
];

const STEPS = [
  {
    n: '١',
    title: 'اختر القالب وأدخل بيانات شركتك',
    desc: 'ثلاثة قوالب مغربية، لون رئيسي حسب هويتك، وحقول ICE / IF / RC / CNSS جاهزة — على الحاسوب والهاتف.',
    img: '/landing/step1.png',
  },
  {
    n: '٢',
    title: 'أضف العميل والأصناف مع معاينة حية',
    desc: 'عبّئ بيانات المشتري والأصناف والكميات والأسعار، وتتحدّث الفاتورة أمامك مباشرة مع احتساب TVA والمجاميع.',
    img: '/landing/step2.png',
  },
  {
    n: '٣',
    title: 'اطبع، صدّر PDF أو شارك',
    desc: 'فاتورة كاملة في صفحة A4 واحدة، تصدير PDF، مشاركة عبر واتساب أو البريد، وحفظ في سجل الفواتير.',
    img: '/landing/step3.png',
  },
];


const PLANS = [
  { name: 'تجريبي', price: 'مجاناً', period: 'ساعة واحدة', features: ['كل المزايا', 'كود لمرة واحدة', 'بدون بطاقة بنكية'], highlight: false },
  { name: 'شهري', price: 'اشتراك', period: 'كل شهر', features: ['فواتير غير محدودة', 'كل القوالب', 'دعم فني'], highlight: true },
  { name: 'سنوي', price: 'اشتراك', period: 'كل سنة', features: ['كل مزايا الشهري', 'توفير أكبر', 'أولوية الدعم'], highlight: false },
  { name: 'مدى الحياة', price: 'دفعة واحدة', period: 'دائم', features: ['وصول دائم', 'تحديثات مستقبلية', 'بدون تجديد'], highlight: false },
];

const PREVIEWS = [
  { src: '/landing/dashboard.png', title: 'لوحة التحكم الرئيسية', desc: 'إحصائيات شاملة وفواتيرك في مكان واحد' },
  { src: '/landing/invoice.png', title: 'الفاتورة على الحاسوب والهاتف', desc: 'فاتورة كاملة بمعايير المغرب — نفس التجربة على الحاسوب والهاتف' },
  { src: '/landing/clients.png', title: 'إدارة العملاء', desc: 'قاعدة عملائك جاهزة لكل فاتورة جديدة' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground">
      {/* NAV */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <FileText className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">FacturaPro</span>
          </div>
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <a href="#features" className="transition hover:text-foreground">المزايا</a>
            <a href="#how" className="transition hover:text-foreground">كيف يعمل</a>
            <a href="#preview" className="transition hover:text-foreground">الواجهة</a>
            <a href="#plans" className="transition hover:text-foreground">الاشتراكات</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>دخول</Button>
            <Button size="sm" onClick={() => navigate('/auth')}>ابدأ الآن</Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute -top-24 right-1/4 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-16 text-center md:pt-24">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            تطبيق الفوترة المغربي الأول
          </div>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            فواتير احترافية
            <span className="bg-gradient-to-l from-primary to-primary/60 bg-clip-text text-transparent"> في دقائق</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
            أنشئ، خصّص وصدّر فواتير متوافقة مع التشريع المغربي. يعمل دون اتصال، يُثبّت على هاتفك، ويمنحك لوحة تحكم كاملة لكل اشتراكاتك.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" className="w-full sm:w-auto" onClick={() => navigate('/auth')}>
              جرّب مجاناً الآن
              <ArrowLeft className="mr-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto" onClick={() => document.getElementById('preview')?.scrollIntoView({ behavior: 'smooth' })}>
              شاهد الواجهة
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">كود تجريبي مجاني لمدة ساعة · بدون بطاقة بنكية</p>
        </div>

        {/* hero mockup */}
        <div className="mx-auto max-w-5xl px-4 pb-4">
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-primary/10">
            <div className="flex items-center gap-1.5 border-b border-border bg-muted/50 px-4 py-2.5">
              <span className="h-3 w-3 rounded-full bg-destructive/60" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/60" />
              <span className="h-3 w-3 rounded-full bg-green-500/60" />
              <span className="mr-3 text-xs text-muted-foreground">facturapro.app</span>
            </div>
            <img src="/landing/dashboard.png" alt="لوحة تحكم FacturaPro" className="w-full" loading="lazy" />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">كل ما تحتاجه لإدارة فواتيرك</h2>
          <p className="mt-3 text-muted-foreground">منشئ فواتير كامل مبني للسياق المغربي — سريع، دقيق، وآمن.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="group rounded-2xl border border-border bg-card p-6 transition hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:scale-110">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-1.5 text-base font-semibold">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">ثلاث خطوات فقط</h2>
            <p className="mt-3 text-muted-foreground">من إعداد شركتك إلى فاتورتك الأولى في أقل من دقيقتين — بنفس السلاسة على الهاتف والحاسوب.</p>
          </div>
          <div className="space-y-14 md:space-y-20">
            {STEPS.map((s, i) => (
              <div key={s.n} className={`grid items-center gap-8 md:grid-cols-2 ${i % 2 === 1 ? 'md:[direction:ltr]' : ''}`}>
                <div className={i % 2 === 1 ? 'md:[direction:rtl]' : ''}>
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground shadow-lg shadow-primary/20">
                    {s.n}
                  </div>
                  <h3 className="mb-2 text-xl font-semibold md:text-2xl">{s.title}</h3>
                  <p className="max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">{s.desc}</p>
                  <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="rounded-full border border-border bg-card px-2.5 py-1">حاسوب</span>
                    <span className="rounded-full border border-border bg-card px-2.5 py-1">هاتف</span>
                  </div>
                </div>
                <div className={`overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-primary/5 ${i % 2 === 1 ? 'md:[direction:rtl]' : ''}`}>
                  <img
                    src={s.img}
                    alt={`الخطوة ${s.n}: ${s.title} — عرض على الحاسوب والهاتف`}
                    className="w-full"
                    loading="lazy"
                  />
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* PREVIEW GALLERY */}
      <section id="preview" className="mx-auto max-w-6xl px-4 py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">واجهة احترافية مصمّمة بعناية</h2>
          <p className="mt-3 text-muted-foreground">متوافقة تماماً مع الهاتف والحاسوب — نفس التجربة على كل الأجهزة.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {PREVIEWS.map((p) => (
            <div key={p.src} className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-xl hover:shadow-primary/10">
              <div className="overflow-hidden">
                <img src={p.src} alt={p.title} className="w-full transition duration-500 group-hover:scale-[1.03]" loading="lazy" />
              </div>
              <div className="border-t border-border p-5">
                <h3 className="font-semibold">{p.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PLANS */}
      <section id="plans" className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">باقات اشتراك بسيطة</h2>
            <p className="mt-3 text-muted-foreground">يولّد السوبر أدمن أكواد التفعيل ويحدد نوع الاشتراك لكل مستخدم.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PLANS.map((p) => (
              <div key={p.name} className={`relative rounded-2xl border bg-card p-6 ${p.highlight ? 'border-primary shadow-xl shadow-primary/10' : 'border-border'}`}>
                {p.highlight && (
                  <span className="absolute -top-3 right-6 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">الأكثر اختياراً</span>
                )}
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <div className="mt-2 mb-1 text-2xl font-bold">{p.price}</div>
                <p className="mb-5 text-xs text-muted-foreground">{p.period}</p>
                <ul className="space-y-2.5 text-sm">
                  {p.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-16 text-center text-primary-foreground md:px-12">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <Zap className="mx-auto mb-4 h-10 w-10" />
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">جاهز لإنشاء فاتورتك الأولى؟</h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-foreground/80">ابدأ الآن بكود تجريبي مجاني — لا حاجة لبطاقة بنكية.</p>
          <Button size="lg" variant="secondary" className="mt-7" onClick={() => navigate('/auth')}>
            ابدأ مجاناً
            <ArrowLeft className="mr-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <FileText className="h-4 w-4" />
                </div>
                <span className="font-bold">FacturaPro</span>
              </div>
              <p className="max-w-sm text-sm text-muted-foreground">تطبيق احترافي لإنشاء وإدارة الفواتير المغربية. يعمل دون اتصال، متوافق مع التشريع، وقابل للتثبيت كتطبيق.</p>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">المنتج</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground">المزايا</a></li>
                <li><a href="#how" className="hover:text-foreground">كيف يعمل</a></li>
                <li><a href="#plans" className="hover:text-foreground">الاشتراكات</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">الروابط</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button className="hover:text-foreground" onClick={() => navigate('/auth')}>تسجيل الدخول</button></li>
                <li><button className="hover:text-foreground" onClick={() => navigate('/admin/login')}>لوحة الإدارة</button></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 flex flex-col items-center gap-2 border-t border-border pt-6 text-center sm:flex-row sm:justify-between">
            <div className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} عبدالإله الميموني — مطوّر تطبيقات ومواقع
            </div>
            <a
              href="https://wa.me/212677765847"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-[hsl(142,70%,40%)] hover:underline"
            >
              +212 677-765847 — لطلب تطوير تطبيق
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
