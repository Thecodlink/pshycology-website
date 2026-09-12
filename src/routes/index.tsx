import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  GraduationCap,
  Heart,
  Instagram,
  Leaf,
  Linkedin,
  Mail,
  Menu,
  Play,
  Sprout,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import counsellorPortrait from "@/assets/counsellor-portrait.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sukoon Nest | Psychology & Career Counselling" },
      { name: "description", content: "Empathetic psychology support and practical career guidance, online and in person." },
      { property: "og:title", content: "Sukoon Nest | Psychology & Career Counselling" },
      { property: "og:description", content: "A safe space for growth, calm and meaningful change." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const testimonials = [
  { quote: "Helped me gain clarity about my career path and next steps. The sessions were thoughtful and practical.", by: "Student, Lucknow" },
  { quote: "A safe and non-judgmental space to talk and reflect. I feel genuinely heard.", by: "Individual client" },
  { quote: "I left each conversation feeling calmer, clearer and more confident in my decisions.", by: "Young professional" },
];

const services = [
  {
    id: "psychology",
    icon: Heart,
    title: "Psychology & Counselling",
    description: "A safe, confidential space to explore challenges, understand your emotions and build coping strategies.",
    items: [
      "Individual Counselling & Therapy",
      "Couple Counselling",
      "Family Therapy & Counselling",
      "Emotional Well-being",
      "Stress & Burnout",
      "Anxiety & Worry",
      "Overthinking",
      "Emotional Regulation",
      "Self-Esteem & Confidence",
      "Personal Growth & Self-Discovery",
      "Relationship & Interpersonal Concerns",
      "Family & Parenting Support",
      "Life Transitions & Loneliness",
      "Workplace Stress & Life Transitions",
      "Trauma-Informed & Psychosocial Support",
    ],
  },
  {
    id: "career",
    icon: BriefcaseBusiness,
    title: "Career & Educational Counselling",
    description: "Personalised guidance to help you make informed decisions about study, work and transitions.",
    items: [
      "Career Exploration",
      "Career Planning",
      "Career Confusion",
      "Strengths & Interests",
      "Career Decision-Making",
      "Educational Guidance",
      "Higher Education Planning",
      "Academic Stress",
      "Exam Anxiety",
      "Study Habits & Motivation",
      "Goal Setting",
      "Personalized Assessment & Counselling Report",
    ],
  },
  {
    id: "workshops",
    icon: Users,
    title: "Workshops, Training & Psychoeducation",
    description: "Engaging group sessions that build skills, raise awareness and support communities.",
    items: [
      "Personality Development Workshops",
      "Communication Skills Training",
      "Emotional Intelligence Workshops",
      "Stress Management Workshops",
      "Life Skills Training",
      "Psychoeducation Sessions",
      "Mental Health Awareness Programs",
      "School & College Mental Health Programs",
      "Community Mental Health Initiatives",
      "Journaling & Expressive Writing Workshops",
    ],
  },
];

function Index() {
  const [testimonial, setTestimonial] = useState(0);
  const [expandedService, setExpandedService] = useState<string | null>(null);

  const toggleService = (id: string) => {
    setExpandedService((current) => (current === id ? null : id));
  };
  const activeTestimonial = testimonials[testimonial] ?? {
    quote: "A thoughtful, supportive experience that helped me find a clearer way forward.",
    by: "Sukoon Nest client",
  };

  const moveTestimonial = (step: number) => {
    setTestimonial((current) => (current + step + testimonials.length) % testimonials.length);
  };

  return (
    <main className="botanical-bg min-h-screen">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
        <a href="#home" className="flex items-center gap-3" aria-label="Sukoon Nest home">
          <span className="grid size-12 place-items-center rounded-full border border-primary/40 text-primary"><Sprout size={25} /></span>
          <span><strong className="block font-display text-2xl font-normal leading-none">Sukoon Nest</strong><small className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Growth · Calm · Clarity</small></span>
        </a>
        <nav className="hidden items-center gap-8 text-sm font-medium lg:flex" aria-label="Main navigation">
          <a className="border-b border-primary pb-1" href="#home">Home</a><a href="#about">About</a><a href="#services">Services</a><a href="#experience">Experience</a><a href="#stories">Stories</a><a href="#faq">FAQ</a>
        </nav>
        <Button asChild variant="warm" size="lg" className="hidden rounded-full px-6 lg:inline-flex"><a href="#contact">Book a consultation <ArrowRight /></a></Button>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu"><Menu /></Button>
      </header>

      <section id="home" className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-10 pt-6 lg:grid-cols-[1.03fr_.97fr] lg:px-8 lg:pb-16 lg:pt-10">
        <div className="reveal-up relative z-10">
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.3em] text-accent-foreground">Listen &nbsp;·&nbsp; Understand &nbsp;·&nbsp; Grow</p>
          <h1 className="max-w-2xl text-6xl leading-[0.98] text-foreground sm:text-7xl lg:text-[5.6rem]">A calmer mind<br />for a <em className="text-peach">brighter</em><br />tomorrow.</h1>
          <p className="mt-7 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">Psychological support and career guidance, offered with empathy, evidence-informed practice and real-world insight. Available online and in person.</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button asChild variant="warm" size="lg" className="h-14 rounded-full px-7"><a href="#contact">Book a consultation <ArrowRight /></a></Button>
            <Button asChild variant="quiet" size="lg" className="h-14 rounded-full px-7"><a href="#services">Explore services</a></Button>
          </div>
          <div className="mt-8 flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex -space-x-3">{["A","M","R","S"].map((letter) => <span key={letter} className="grid size-9 place-items-center rounded-full border-2 border-background bg-sage-soft text-xs font-semibold text-primary">{letter}</span>)}</div>
            <span>Trusted by students, individuals and professionals</span>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute -left-12 top-14 hidden font-hand text-3xl leading-tight text-primary lg:block">A kinder tomorrow<br />is possible. <span className="inline-block rotate-12">♡</span></div>
          <div className="overflow-hidden rounded-t-[12rem] bg-secondary soft-shadow">
            <img src={counsellorPortrait} alt="Counsellor welcoming clients to Sukoon Nest" width={1024} height={1280} className="aspect-[4/5] w-full object-cover object-top" />
          </div>
          <div className="absolute -right-4 top-20 hidden w-44 rounded-2xl bg-card/95 p-5 soft-shadow xl:block">
            {[{icon: Brain,label:"Listen",sub:"Without judgement"},{icon: Leaf,label:"Understand",sub:"Your unique story"},{icon: Heart,label:"Grow",sub:"At your own pace"}].map(({icon: Icon,label,sub}) => <div className="mb-5 flex gap-3 last:mb-0" key={label}><Icon className="text-primary" /><div><b className="block text-sm">{label}</b><span className="text-[11px] text-muted-foreground">{sub}</span></div></div>)}
          </div>
          <button type="button" aria-label="Play my story" className="absolute bottom-7 right-4 flex items-center gap-3 rounded-full bg-card/95 p-2 pr-5 text-left soft-shadow"><span className="grid size-12 place-items-center rounded-full bg-primary text-primary-foreground"><Play size={18} fill="currentColor" /></span><span className="text-xs"><b className="block text-sm">Watch</b>My story</span></button>
        </div>
      </section>

      <section aria-label="Practice statistics" className="relative z-10 mx-auto grid max-w-7xl grid-cols-2 gap-y-7 rounded-[2rem] bg-card/90 px-6 py-7 soft-shadow md:grid-cols-4 lg:px-10">
        {[{icon:Users,n:"500+",l:"Individuals supported"},{icon:GraduationCap,n:"1,000+",l:"Sessions conducted"},{icon:BriefcaseBusiness,n:"3+",l:"Years of experience"},{icon:Heart,n:"98%",l:"Positive feedback"}].map(({icon:Icon,n,l},i) => <div key={l} className={`flex items-center gap-4 px-2 md:px-6 ${i > 0 ? "md:border-l md:border-border" : ""}`}><Icon className="size-8 text-primary"/><div><strong className="font-display text-2xl font-normal">{n}</strong><span className="block text-xs text-muted-foreground">{l}</span></div></div>)}
      </section>

      <section id="services" className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-peach">What I help with</p>
            <h2 className="max-w-xl text-4xl leading-tight sm:text-5xl">Support for every stage<br />of your journey.</h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">Three areas of practice, each taken forward with care, clarity and attention.</p>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {services.map(({ id, icon: Icon, title, description, items }) => (
            <article key={id} className="flex flex-col rounded-xl bg-card p-7 soft-shadow lg:p-9">
              <Icon className="mb-5 text-primary" size={28} />
              <h3 className="text-2xl leading-tight">{title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{description}</p>
              <button
                type="button"
                onClick={() => toggleService(id)}
                className="mt-6 inline-flex items-center gap-2 self-start text-sm font-semibold underline underline-offset-4 transition-opacity hover:opacity-75"
                aria-expanded={expandedService === id}
                aria-controls={`service-panel-${id}`}
              >
                {expandedService === id ? "Show less" : "Learn more"} <ArrowRight size={16} className={cn("transition-transform", expandedService === id && "rotate-90")} />
              </button>
              {expandedService === id && (
                <div id={`service-panel-${id}`} className="mt-6 border-t border-border pt-6">
                  <ul className="flex flex-wrap gap-2">
                    {items.map((item) => (
                      <li key={item} className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      <section id="experience" className="border-y border-border/70 bg-card/45 py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="mb-8 flex items-end justify-between"><div><p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-peach">In action</p><h2 className="text-4xl sm:text-5xl">Talks, workshops & community work</h2></div><Button asChild variant="quiet" className="hidden rounded-full sm:inline-flex"><a href="#contact">View all <ArrowRight /></a></Button></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[
            ["Student workshop","Building confidence and emotional skills"],["Interactive session","Open conversations with young adults"],["Recognition moment","Celebrating meaningful community work"],["Well-being conversation","Sharing practical mental health insights"]
          ].map(([title,desc],i) => <article key={title} className="overflow-hidden rounded-lg border border-border bg-card"><div className={`grid aspect-[4/3] place-items-center ${i % 2 ? "bg-sage-soft" : "bg-secondary"}`}><span className="grid size-16 place-items-center rounded-full border border-primary/25 text-primary"><Users size={28}/></span></div><div className="p-4"><h3 className="font-sans text-base font-semibold">{title}</h3><p className="mt-1 text-xs text-muted-foreground">{desc}</p></div></article>)}</div>
        </div>
      </section>

      <section id="stories" className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-[.7fr_1.3fr] lg:px-8">
        <div><p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-peach">Kind words</p><h2 className="text-5xl">What people say.</h2><div className="mt-7 flex gap-3"><Button variant="quiet" size="icon" className="rounded-full" onClick={() => moveTestimonial(-1)} aria-label="Previous testimonial"><ArrowLeft /></Button><Button variant="quiet" size="icon" className="rounded-full" onClick={() => moveTestimonial(1)} aria-label="Next testimonial"><ArrowRight /></Button></div></div>
        <blockquote className="rounded-xl bg-card p-8 soft-shadow sm:p-10"><span className="font-display text-6xl leading-none text-peach">“</span><p className="max-w-2xl text-xl leading-relaxed text-ink-soft">{activeTestimonial.quote}</p><footer className="mt-6 text-sm font-semibold">— {activeTestimonial.by}</footer></blockquote>
      </section>

      <section id="about" className="mx-auto max-w-7xl px-5 pb-20 lg:px-8"><div className="grid gap-8 rounded-[2rem] bg-sage-soft p-8 sm:p-12 lg:grid-cols-2"><div><p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-primary">A gentler way forward</p><h2 className="text-4xl sm:text-5xl">You matter here.</h2></div><p className="self-center leading-relaxed text-ink-soft">Sukoon Nest is built around attentive listening, practical support and steady progress. Every conversation respects your pace, your context and the life you want to create.</p></div></section>

      <section id="faq" className="mx-auto max-w-4xl px-5 pb-20"><p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.28em] text-peach">Common questions</p><h2 className="mb-8 text-center text-4xl">Before we begin</h2>{[ ["Are sessions available online?","Yes. You can choose online sessions or meet in person, depending on availability."],["Who can book a consultation?","Support is available for students, individuals and working professionals."],["What happens in the first session?","We begin by understanding what brings you here and what you would like support with."]].map(([q,a]) => <details key={q} className="border-t border-border py-5 last:border-b"><summary className="cursor-pointer list-none font-semibold">{q}<span className="float-right text-primary">+</span></summary><p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{a}</p></details>)}</section>

      <section id="contact" className="mx-auto max-w-7xl px-5 pb-10 lg:px-8"><div className="flex flex-col items-start justify-between gap-6 rounded-[2rem] bg-primary px-7 py-9 text-primary-foreground sm:flex-row sm:items-center sm:px-12"><div><h2 className="text-3xl sm:text-4xl">Ready to take the next step?</h2><p className="mt-2 text-sm opacity-85">Book a consultation or send an enquiry. We’ll respond within one working day.</p></div><div className="flex flex-wrap gap-3"><Button asChild variant="secondary" size="lg" className="rounded-full"><a href="mailto:sukoonest2016@gmail.com">Book a consultation <ArrowRight /></a></Button><Button asChild variant="outline" size="lg" className="rounded-full border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"><a href="mailto:sukoonest2016@gmail.com">Contact me</a></Button></div></div></section>

      <footer className="border-t border-border bg-card/70"><div className="mx-auto flex max-w-7xl flex-col gap-7 px-5 py-9 lg:flex-row lg:items-center lg:justify-between lg:px-8"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full border border-primary/40 text-primary"><Sprout size={21}/></span><span><strong className="block font-display text-xl font-normal">Sukoon Nest</strong><small className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground">A safe space for growth & calm</small></span></div><nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs"><a href="#about">About</a><a href="#services">Services</a><a href="#experience">Experience</a><a href="#stories">Stories</a><a href="#faq">FAQ</a></nav><div className="flex gap-4 text-primary"><a href="https://in.linkedin.com/in/sukoon-nest-381833379" target="_blank" rel="noopener noreferrer" aria-label="Sukoon Nest on LinkedIn"><Linkedin size={19}/></a><a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Sukoon Nest on Instagram"><Instagram size={19}/></a><a href="mailto:sukoonest2016@gmail.com" aria-label="Email Sukoon Nest"><Mail size={19}/></a></div></div><div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-3 border-t border-border px-5 py-5 text-[11px] text-muted-foreground lg:px-8"><span>© 2026 Sukoon Nest. All rights reserved.</span><span>Privacy Policy &nbsp; | &nbsp; Disclaimer</span></div></footer>
    </main>
  );
}
