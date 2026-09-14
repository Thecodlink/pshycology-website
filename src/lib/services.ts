/*
 * Single source of truth for the "What I help with" service categories.
 * Used by the Bento Grid on the home page AND the /services/:slug detail routes,
 * so service names, descriptions and topics never drift between pages.
 *
 * NOTE: these are service *categories*, not therapeutic modalities
 * (CBT / REBT / DBT / ACT / etc. are intentionally kept separate).
 */

export type BentoCardColSpan = "md:col-span-2" | "lg:col-span-2" | "lg:col-span-3";

export interface Service {
  id: string;
  number: string;
  title: string;
  description: string;
  /** Decorative illustration, web-safe public path. */
  image?: string;
  /** Accessible alt text describing the service image (purpose-based). */
  imageAlt?: string;
  slug: string;
  topics: string[];
  /** Label shown above the description. Defaults to "What we do". */
  label?: string;
  /** Editorial card span for the Bento Grid. */
  colSpan?: BentoCardColSpan;
  /** Warm surface tint applied to the BentoCard. */
  bg?: string;
}

const LABEL = "What we do";

export const services: Service[] = [
  {
    id: "01",
    number: "01",
    title: "Individual Counselling & Therapy",
    description:
      "A confidential space to work through stress, difficult feelings and relationships, building coping skills, self-understanding and personal growth.",
    slug: "individual-counselling",
    image: "/images/services/individual-counselling-therapy.webp",
    imageAlt: "Individual Counselling & Therapy — one-to-one supportive setting",
    topics: [
      "Stress & Anxiety",
      "Low Mood & Self-Esteem",
      "Emotional Regulation",
      "Grief & Loss Support",
      "Life Transitions",
      "Personal Growth",
    ],
    colSpan: "lg:col-span-2",
    bg: "bg-secondary",
  },
  {
    id: "02",
    number: "02",
    title: "Couple & Marital Counselling",
    description:
      "For partners and married couples working through communication, conflict and how to rebuild emotional connection.",
    slug: "couple-marital-counselling",
    image: "/images/services/couple-marital-counselling.webp",
    imageAlt: "Couple & Marital Counselling — partners in thoughtful dialogue",
    topics: [
      "Communication",
      "Conflict Resolution",
      "Rebuilding Trust",
      "Intimacy & Emotional Connection",
      "Marriage Preparation",
      "Separation & Divorce Support",
    ],
    bg: "bg-card",
  },
  {
    id: "03",
    number: "03",
    title: "Relationship & Breakup Counselling",
    description:
      "Thoughtful, non-judgmental support for relationships, breakups, boundaries and adjusting to change.",
    slug: "relationship-breakup-counselling",
    image: "/images/services/relationship-breakup-counselling.webp",
    imageAlt: "Relationship & Breakup Counselling — reflective support after separation",
    topics: [
      "Breakup Recovery",
      "Setting & Communicating Boundaries",
      "Attachment & Dating",
      "Co-existing with a Narcissist",
      "Loneliness & Adjustment",
      "Rebuilding Identity Post-Relationship",
    ],
    bg: "bg-sage-soft",
  },
  {
    id: "04",
    number: "04",
    title: "Family & Parenting Support",
    description:
      "Support with family dynamics, communication, parenting and relationship concerns across the lifespan.",
    slug: "family-parenting-support",
    image: "/images/services/family-parenting-support.webp",
    imageAlt: "Family & Parenting Support — caring family dynamic scene",
    topics: [
      "Parent-Child Relationships",
      "Non-Violent Anger Management",
      "Co-parenting After Separation",
      "Stepfamily Dynamics",
      "Family Communication",
      "Teen Behaviour & Boundaries",
    ],
    bg: "bg-peach/25",
  },
  {
    id: "05",
    number: "05",
    title: "Career & Educational Counselling",
    description:
      "Personalised guidance for exploring careers, educational choices, strengths, interests and decision-making.",
    slug: "career-educational-counselling",
    image: "/images/services/career-educational-counselling.webp",
    imageAlt: "Career & Educational Counselling — guidance and planning",
    topics: [
      "Career Exploration",
      "Strengths & Interest Assessment",
      "Educational Choices",
      "Decision-Making",
      "Career Change & Transition",
      "Personalised Assessment & Counselling Report",
    ],
    bg: "bg-secondary",
  },
  {
    id: "06",
    number: "06",
    title: "Academic & Exam Stress Support",
    description:
      "Help with academic stress, exam anxiety, study habits, motivation and study-life transitions.",
    slug: "academic-exam-stress",
    image: "/images/services/academic-exam-stress-support.webp",
    imageAlt: "Academic & Exam Stress Support — focused study and calm focus",
    topics: [
      "Exam Anxiety",
      "Study Skills & Habits",
      "Time Management",
      "Motivation & Procrastination",
      "Performance Pressure",
      "Academic Transitions",
    ],
    bg: "bg-card",
  },
  {
    id: "07",
    number: "07",
    title: "Workplace Stress & Job Burnout Support",
    description:
      "Support with workplace stress, job burnout prevention, work-life balance and professional transitions.",
    slug: "workplace-stress-burnout",
    image: "/images/services/workplace-stress-burnout-support.webp",
    imageAlt: "Workplace Stress & Job Burnout Support — quiet recovery and balance",
    topics: [
      "Workplace Stress",
      "Burnout Prevention & Recovery",
      "Work-Life Balance",
      "Major Professional Transitions",
      "Resilience & Adaptability",
      "Setting Professional Boundaries",
    ],
    bg: "bg-sage-soft",
  },
  {
    id: "08",
    number: "08",
    title: "Trauma & Past Emotional Healing",
    description:
      "Trauma-informed support for grief, loss and difficult life experiences, at your own pace.",
    slug: "trauma-emotional-healing",
    image: "/images/services/trauma-emotional-healing.webp",
    imageAlt: "Trauma & Past Emotional Healing — gentle grounded scene",
    topics: [
      "Childhood Adversity (ACEs)",
      "Grief & Loss Support",
      "Trauma-Informed Care",
      "Difficult Life Experiences",
      "Emotional Resilience",
      "Recovery & Healing",
    ],
    bg: "bg-peach/25",
  },
  {
    id: "09",
    number: "09",
    title: "Expressive Art & Life Transition Support",
    description:
      "Creative, reflective approaches to self-expression, personal growth and navigating major life changes.",
    slug: "expressive-art-life-transitions",
    image: "/images/services/expressive-art-life-transitions.webp",
    imageAlt: "Expressive Art & Life Transition Support — creative reflection",
    topics: [
      "Expressive Art Therapy",
      "Self-Expression & Creativity",
      "Journaling & Reflective Practices",
      "Navigating Life Transitions",
      "Personal Growth",
      "Positive Psychology & Well-being",
    ],
    colSpan: "lg:col-span-2",
    bg: "bg-secondary",
  },
  {
    id: "10",
    number: "10",
    title: "Workshops, Corporate & Campus Programs",
    description:
      "Interactive workshops on emotional intelligence, communication, stress management and life skills for teams and campuses.",
    slug: "workshops-corporate-campus",
    image: "/images/services/workshops-corporate-campus.webp",
    imageAlt: "Workshops, Corporate & Campus Programs — group learning scene",
    topics: [
      "Emotional Intelligence Workshops",
      "Communication Skills Training",
      "Stress Management Programs",
      "Life Skills Training",
      "Mental Health Awareness Sessions",
      "School & College Well-being Programs",
    ],
    bg: "bg-sage-soft",
  },
];

export const SERVICE_LABEL = LABEL;

export const getService = (id: string): Service | undefined => services.find((s) => s.id === id);

export const getServiceBySlug = (slug: string): Service | undefined =>
  services.find((s) => s.slug === slug);

export const serviceSlugs = services.map((s) => s.slug);
