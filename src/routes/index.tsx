import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Brain,
  MousePointerClick,
  BriefcaseBusiness,
  CalendarCheck,
  Heart,
  Leaf,
  Mail,
  Phone,
  Users,
} from "lucide-react";
import { Counter } from "@/components/Counter/Counter";
import DriftWall, { type DriftWallItem } from "@/components/DriftWall/DriftWall";
import { ClickSpark } from "@/components/ClickSpark/ClickSpark";
import { ScrollExpand } from "@/components/ScrollExpand/ScrollExpand";
import { ScrollReveal } from "@/components/ScrollReveal/ScrollReveal";
import { AnimatedContent } from "@/components/AnimatedContent/AnimatedContent";
import { SectionFade } from "@/components/SectionFade/SectionFade";
import { WeHeardYou } from "@/components/WeHeardYou/WeHeardYou";
import { WhySukoonNest } from "@/components/WhySukoonNest/WhySukoonNest";
import GlareHover from "@/components/GlareHover/GlareHover";
import { BentoGrid, BentoCard } from "@/components/magicui/bento-grid";
import { SiteNav } from "@/components/layout/SiteNav";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { FaqAccordion } from "@/components/FaqAccordion/FaqAccordion";
import { ReviewMarquee } from "@/components/ReviewMarquee/ReviewMarquee";
import SlideArrowButton from "@/components/buttons/SlideArrowButton";
import { HowItWorks } from "@/components/HowItWorks/HowItWorks";
import SwipeButton from "@/components/buttons/SwipeButton";
import { services } from "@/lib/services";
import { inActionItems, type InActionItem } from "@/lib/inAction";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { openWhatsApp, scrollToId, WHATSAPP_HREF } from "@/lib/links";
import { OG_IMAGE_ABSOLUTE, absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sukoon Nest | Psychology & Career Counselling" },
      {
        name: "description",
        content:
          "Empathetic psychology support and practical career guidance, online and in person.",
      },
      { property: "og:title", content: "Sukoon Nest | Psychology & Career Counselling" },
      {
        property: "og:description",
        content: "A safe space for growth, calm and meaningful change.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: OG_IMAGE_ABSOLUTE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: OG_IMAGE_ABSOLUTE },
    ],
    links: absoluteUrl("/") ? [{ rel: "canonical", href: absoluteUrl("/") as string }] : [],
  }),
  component: Index,
});

const testimonials = [
  {
    quote:
      "Helped me gain clarity about my career path and next steps. The sessions were thoughtful and practical.",
    by: "Student, Lucknow",
  },
  {
    quote: "A safe, non-judgmental space to talk and reflect. I truly felt heard.",
    by: "Individual client",
  },
  {
    quote: "Each session left me calmer, clearer, and more confident in my decisions.",
    by: "Young professional",
  },
];

// Ten service categories are defined in src/lib/services.ts

/* The "In action" wall reads entirely from src/lib/inAction.ts (single source
   of truth: real supplied assets + verified titles). width/height let each
   DriftWall tile keep its image's exact ratio — nothing is cropped. */
const driftItems: DriftWallItem[] = inActionItems.map((item) => ({
  image: item.image,
  title: item.title,
  alt: item.alt,
  width: item.width,
  height: item.height,
}));

const faqItems = [
  {
    question: "Are sessions available online?",
    answer: "Yes. You can choose online sessions or meet in person, depending on availability.",
  },
  {
    question: "Who can book a consultation?",
    answer: "Support is available for students, individuals and working professionals.",
  },
  {
    question: "What happens in the first session?",
    answer: "We begin by understanding what brings you here and what kind of support you'd like.",
  },
];

function Index() {
  // Centered lightbox for the "In action" wall: any tile (click or
  // Enter/Space) opens the same asset whole, at its own ratio.
  const [lightbox, setLightbox] = useState<InActionItem | null>(null);
  const handleTileClick = (item: DriftWallItem) =>
    setLightbox(inActionItems.find((x) => x.image === item.image) ?? null);

  // Column count adapts so every one of the 12 assets is reachable:
  // 2 columns on phones, 3 on tablets, 4 from lg up.
  const [wallColumns, setWallColumns] = useState(4);
  useEffect(() => {
    const on = () => setWallColumns(window.innerWidth < 640 ? 2 : window.innerWidth < 1024 ? 3 : 4);
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);

  return (
    <main id="main-content" className="botanical-bg min-h-screen">
      <ClickSpark className="relative min-h-screen">
        <SiteNav />

        <SectionFade>
          <section
            id="home"
            className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-10 pt-6 lg:grid-cols-[1.03fr_.97fr] lg:px-8 lg:pb-16 lg:pt-10"
          >
            <AnimatedContent
              className="relative z-10"
              distance={36}
              delay={120}
              scale={0.98}
              duration={0.8}
            >
              <p className="mb-6 text-xs font-semibold uppercase tracking-[0.3em] text-accent-foreground">
                Listen &nbsp;·&nbsp; Understand &nbsp;·&nbsp; Grow
              </p>
              <h1 className="max-w-2xl text-6xl leading-[0.98] text-foreground sm:text-7xl lg:text-[5.6rem]">
                A calmer mind
                <br />
                for a <em className="text-peach">brighter</em>
                <br />
                tomorrow.
              </h1>
              <p className="mt-7 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
                Psychological support and career guidance, offered with empathy, evidence-informed
                practice and real-world insight. Available online and in person.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <SlideArrowButton
                  text="Book a consultation"
                  className="h-13 rounded-full px-5 sm:px-8"
                  onClick={openWhatsApp}
                />
                <SwipeButton
                  firstText="Explore services"
                  secondText="Explore services"
                  className="h-13 rounded-full px-6 text-white"
                  onClick={() => scrollToId("services")}
                />
              </div>
              <div className="mt-8 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex -space-x-3">
                  {["A", "M", "R", "S"].map((letter) => (
                    <span
                      key={letter}
                      className="grid size-9 place-items-center rounded-full border-2 border-background bg-sage-soft text-xs font-semibold text-primary"
                    >
                      {letter}
                    </span>
                  ))}
                </div>
                <span>Trusted by students, individuals and professionals</span>
              </div>
            </AnimatedContent>
            <AnimatedContent
              className="relative mx-auto w-full max-w-xl"
              direction="horizontal"
              distance={48}
              delay={260}
              scale={0.985}
              duration={0.8}
            >
              <div className="absolute -left-12 top-14 hidden font-hand text-3xl leading-tight text-primary lg:block">
                A kinder tomorrow
                <br />
                is possible. <span className="inline-block rotate-12">♡</span>
              </div>
              <div className="overflow-hidden rounded-t-[12rem] bg-secondary soft-shadow">
                <img
                  src="/images/hero-image.webp"
                  alt="Counsellor welcoming clients to Sukoon Nest"
                  width={998}
                  height={1576}
                  className="aspect-[4/5] w-full object-cover object-top"
                />
              </div>
              <div className="absolute -right-4 top-20 hidden w-44 rounded-2xl bg-card/95 p-5 soft-shadow xl:block">
                {[
                  { icon: Brain, label: "Listen", sub: "Without judgement" },
                  { icon: Leaf, label: "Understand", sub: "Your unique story" },
                  { icon: Heart, label: "Grow", sub: "At your own pace" },
                ].map(({ icon: Icon, label, sub }) => (
                  <div className="mb-5 flex gap-3 last:mb-0" key={label}>
                    <Icon className="text-primary" />
                    <div>
                      <b className="block text-sm">{label}</b>
                      <span className="text-[11px] text-muted-foreground">{sub}</span>
                    </div>
                  </div>
                ))}
              </div>
            </AnimatedContent>
          </section>
        </SectionFade>

        <AnimatedContent scale={0.985} distance={24} delay={80}>
          <section aria-label="Practice statistics" className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="rounded-[2rem] bg-card/90 py-5 soft-shadow sm:py-6">
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-x-0 sm:divide-x sm:divide-border/40">
                {[
                  { icon: Users, v: 500, s: "+", l: "Individuals supported" },
                  { icon: CalendarCheck, v: 1000, s: "+", l: "Sessions conducted" },
                  { icon: BriefcaseBusiness, v: 3, s: "+", l: "Years of experience" },
                  { icon: Heart, v: 98, s: "%", l: "Positive feedback" },
                ].map(({ icon: Icon, v, s: suf, l: label }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center justify-center py-4 text-center"
                  >
                    <div className="flex h-8 w-8 items-center justify-center">
                      <Icon className="size-6 text-primary" />
                    </div>
                    <strong className="mt-4 inline-block min-w-[6ch] text-center font-display text-3xl font-normal tabular-nums text-foreground sm:text-4xl">
                      <Counter value={v} suffix={suf} />
                    </strong>
                    <span className="mt-2 min-h-[2.5rem] text-xs text-muted-foreground">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </AnimatedContent>

        {/* WE HEARD YOU — first editorial content section (moved above About so the
            homepage reads as a continuous narrative: understand → know the
            practice → see what's different → explore support → the work →
            perspectives → prepare → connect → take the next step). */}
        <WeHeardYou />

        <SectionFade>
          <section
            id="about"
            className="mx-auto max-w-7xl px-5 pb-20 mt-12 md:mt-16 lg:mt-20 lg:px-8 lg:pb-24"
          >
            <div className="grid items-start gap-10 rounded-[2rem] bg-secondary p-8 sm:p-12 lg:grid-cols-2 lg:gap-12">
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                  A gentler way forward
                </p>
                <h2 className="text-4xl sm:text-5xl">
                  <ScrollReveal duration={1}>You matter here.</ScrollReveal>
                </h2>
              </div>
              <p className="self-start max-w-md leading-relaxed text-ink-soft sm:max-w-lg">
                <ScrollReveal duration={1}>
                  Sukoon Nest is built around attentive listening, practical support and steady
                  progress. Every conversation respects your pace, your context and the life you
                  want to create.
                </ScrollReveal>
              </p>
            </div>
          </section>
        </SectionFade>

        <SectionFade>
          <WhySukoonNest />
        </SectionFade>

        <SectionFade>
          <section id="services" className="mx-auto max-w-7xl px-5 pt-0 pb-16 lg:px-8 lg:pb-28">
            <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-peach">
                  What I help with
                </p>
                <h2 className="max-w-xl text-4xl leading-tight sm:text-5xl">
                  <ScrollReveal duration={1}>
                    Support for every stage
                    <br />
                    of your journey.
                  </ScrollReveal>
                </h2>
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                Support spans emotional well-being, relationships, education and career decisions,
                personal development, and life transitions.
              </p>
            </div>

            <BentoGrid>
              {services.map((s, i) => (
                <AnimatedContent
                  key={s.id}
                  delay={i * 25}
                  scale={0.99}
                  distance={16}
                  once
                  className={`${s.colSpan ?? ""} h-full`}
                >
                  <BentoCard
                    {...(s.image ? { image: s.image } : {})}
                    number={s.number}
                    name={s.title}
                    description={s.description}
                    label="What we do"
                    cta="Learn more"
                    to="/services/$slug"
                    params={{ slug: s.slug }}
                  />
                </AnimatedContent>
              ))}
            </BentoGrid>
            <ScrollExpand className="mt-16 text-center" collapsedHeight={0} expandedHeight={240}>
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground/70">
                Not sure where to begin?
              </p>
              <p className="mt-2 text-base text-foreground">
                Start with a conversation and we can explore the right kind of support for you.
              </p>
              <div className="mt-6 flex justify-center">
                <SlideArrowButton
                  text="Book a consultation"
                  primaryColor="var(--peach)"
                  className="h-13 rounded-full px-8 text-base"
                  onClick={openWhatsApp}
                />
              </div>
            </ScrollExpand>
          </section>
        </SectionFade>

        <SectionFade>
          <section
            id="experience"
            className="border-y border-border/70 bg-card/45 pt-14 pb-16 sm:pt-16 lg:pt-20 lg:pb-20"
          >
            <div className="mx-auto max-w-7xl px-5 lg:px-8">
              <div className="mb-8 flex items-end justify-between">
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-peach">
                    In action
                  </p>
                  <h2 className="text-balance text-4xl sm:text-5xl">
                    <ScrollReveal duration={1}>
                      Talks, workshops, Researches &amp; community work
                    </ScrollReveal>
                  </h2>
                </div>
              </div>

              {/* React Bits DriftWall: all twelve evidence assets drift in
                  alternating columns, each tile sized from the image's own
                  intrinsic ratio so nothing is ever cropped; hover/focus
                  lifts a tile to full colour and pauses its column.
                  Column count adapts (2/3/4) so every asset stays
                  reachable; drift freezes under prefers-reduced-motion. */}
              <div className="h-[430px] w-full sm:h-[500px] lg:h-[560px]">
                <DriftWall
                  items={driftItems}
                  columns={wallColumns}
                  tileWidth={200}
                  gap={16}
                  radius={18}
                  tilt={12}
                  turn={-10}
                  perspective={1200}
                  depth={120}
                  speed={28}
                  direction="up"
                  variance={0.35}
                  parallax={0.5}
                  pauseOnHover
                  lift={56}
                  fade={0.62}
                  dim={0.82}
                  grayscale={false}
                  overlayColor="var(--primary)"
                  onTileClick={handleTileClick}
                  ariaLabel="Talks, workshops, Researches and community work"
                />
              </div>

              <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground/80">
                <MousePointerClick size={14} className="text-peach" aria-hidden="true" />
                Click on an image to learn more about it
              </p>

              {/* Centered lightbox: the whole asset at its true ratio, with
                  its verified title as the caption. Radix Dialog provides
                  focus trap, Escape/backdrop close and labelled dialog
                  semantics; the wall keeps drifting behind, nothing else
                  changes. */}
              <Dialog open={lightbox !== null} onOpenChange={(open) => !open && setLightbox(null)}>
                {lightbox && (
                  <DialogContent className="max-w-[min(94vw,1000px)] gap-0 overflow-hidden rounded-[1.5rem] bg-card p-0 sm:rounded-[1.75rem]">
                    <div className="flex items-center justify-center bg-secondary/70 px-4 py-6 sm:px-8">
                      <img
                        src={lightbox.image}
                        alt={lightbox.alt}
                        width={lightbox.width}
                        height={lightbox.height}
                        decoding="async"
                        className="h-auto max-h-[58vh] w-auto max-w-full object-contain"
                      />
                    </div>
                    <div className="px-6 py-5 text-center">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-peach">
                        {lightbox.category}
                      </p>
                      <DialogTitle className="mt-1.5 text-base leading-snug font-medium sm:text-lg">
                        {lightbox.title}
                      </DialogTitle>
                      <DialogDescription className="sr-only">
                        Full view of the asset, shown at its original proportions.
                      </DialogDescription>
                    </div>
                  </DialogContent>
                )}
              </Dialog>
            </div>
          </section>
        </SectionFade>

        <SectionFade>
          <section id="stories" className="pt-8 lg:pt-12 pb-20 lg:pb-24">
            <div className="mx-auto max-w-7xl px-5 pb-2 pt-0 lg:px-8">
              <div className="mb-10 max-w-2xl">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-peach">
                  Kind words
                </p>
                <h2 className="text-4xl sm:text-5xl">
                  <ScrollReveal duration={1}>What people say.</ScrollReveal>
                </h2>
              </div>
            </div>
            {/* Full-viewport-width marquee rail (heading stays in the content
                container; the review track extends to the viewport edges). */}
            <div className="w-full overflow-hidden">
              <ReviewMarquee items={testimonials} />
            </div>
          </section>
        </SectionFade>

        <SectionFade>
          <section id="faq" className="mx-auto max-w-7xl px-5 lg:px-8 pb-16 lg:pb-20">
            <div className="mx-auto max-w-2xl text-center lg:max-w-3xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-peach">
                Common questions
              </p>
              <h2 className="mb-8 text-4xl">
                <ScrollReveal duration={1}>Before we begin</ScrollReveal>
              </h2>
              <FaqAccordion items={faqItems} />
            </div>
          </section>
        </SectionFade>

        {/* "How it works" — five-step editorial journey. NO SectionFade here:
            the section owns its own scroll-driven animation (zones + rail),
            and a second wrapper animating opacity/transform over a 500dvh
            tree is what caused the step/CTA merge and the flicker. */}
        <HowItWorks />

        {/* Closing editorial CTA — pale sage panel, no scarcity, single action.
            One owner for the whole section: a single AnimatedContent plays the
            pop-up + fade-in entrance and REVERSE-PLAYS it (pop-down + fade-out)
            when the panel leaves through the top. SectionFade is removed here
            on purpose — two controllers (framer wrapper + GSAP child) were both
            animating opacity/transform over this subtree. pt-16 keeps it
            visually detached from the How It Works journey above. */}
        <AnimatedContent
          exit
          threshold={0.1}
          distance={30}
          delay={140}
          scale={0.985}
          duration={0.8}
          initialOpacity={0.75}
        >
          <section
            id="cta"
            className="mx-auto max-w-7xl px-5 pt-16 pb-24 lg:px-8 lg:pt-20 lg:pb-28"
          >
            {/* React Bits GlareHover wraps the panel: a slow peach glare sweep
                (brand --peach, low opacity) on hover. Decorative only — it lives
                on a ::before overlay and cannot fight the GSAP entrance/exit. */}
            <GlareHover
              width="100%"
              height="auto"
              background="var(--pale-sage)"
              borderRadius="2.5rem"
              borderColor="var(--border)"
              glareColor="#d99a78"
              glareOpacity={0.28}
              glareAngle={-30}
              glareSize={280}
              transitionDuration={800}
              className="cursor-auto px-7 py-12 text-foreground sm:px-14 sm:py-16"
              style={{ cursor: "auto" }}
            >
              <div
                className="absolute -top-8 -right-10 size-40 rounded-full bg-peach/25 blur-2xl"
                aria-hidden="true"
              />
              <div className="relative flex w-full flex-col items-center gap-6 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-peach">
                  Take the next step
                </p>
                <h2 className="font-display text-3xl leading-tight font-normal sm:text-4xl lg:text-5xl">
                  <ScrollReveal duration={1}>Book a free 10 min call now.</ScrollReveal>
                </h2>
                <p className="max-w-xl text-sm/relaxed text-muted-foreground/80 sm:text-base">
                  <ScrollReveal duration={1}>
                    A short, simple conversation to understand your needs and explore the available
                    options.
                  </ScrollReveal>
                </p>
                <div className="pt-2">
                  <SlideArrowButton
                    text="Book a free 10 min call"
                    primaryColor="var(--peach)"
                    className="h-14 w-full max-w-xs rounded-full px-5 text-[15px] sm:w-auto sm:max-w-none sm:px-8 sm:text-base"
                    onClick={openWhatsApp}
                  />
                </div>
              </div>
            </GlareHover>
          </section>
        </AnimatedContent>

        {/* Contact — two-column editorial layout; reuses existing details only. */}
        <SectionFade>
          <section id="contact" className="mx-auto max-w-7xl px-5 pt-0 pb-20 lg:px-8 lg:pb-24">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-peach">
                  Contact
                </p>
                <h2 className="text-3xl leading-tight sm:text-4xl">
                  <ScrollReveal duration={1}>Let's connect.</ScrollReveal>
                </h2>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                  <ScrollReveal duration={1}>
                    Have a question, want to understand the available options, or ready to enquire?
                    Reach out by email, phone or WhatsApp.
                  </ScrollReveal>
                </p>
              </div>
              <div className="grid gap-3">
                <a
                  href="mailto:sukoonest2016@gmail.com"
                  className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  <Mail size={18} className="text-peach" />
                  <span>sukoonest2016@gmail.com</span>
                </a>
                <a
                  href="tel:+919336566647"
                  className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  <Phone size={18} className="text-peach" />
                  <span>+91 93365 66647</span>
                </a>
                <a
                  href={WHATSAPP_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  <Phone size={18} className="text-peach" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </section>
        </SectionFade>

        <SiteFooter />
      </ClickSpark>
    </main>
  );
}
