/*
 * "We Heard You" editorial story data.
 *
 * These are NOT client testimonials — no names, dates, ratings, or quoted
 * claims. Each step is an empathetic observation of a situation someone might
 * recognise, paired with a transparent character illustration.
 */

export interface HeardYouStory {
  id: string;
  image: string;
  category: string;
  title: string;
  description: string;
}

export const heardYouStories: HeardYouStory[] = [
  {
    id: "01",
    image: "/images/we-heard-you/img6.webp",
    category: "EMOTIONAL WELL-BEING",
    title: "Some days, it's not one big thing. It's just everything arriving at once.",
    description:
      "When stress, overthinking, responsibilities and emotions pile up, it helps to have a space to slow down and make sense of what you're carrying.",
  },
  {
    id: "02",
    image: "/images/we-heard-you/img5.webp",
    category: "CAREER & EDUCATION",
    title: "You know you need to make a decision. You just don't know which way feels right.",
    description:
      "Career choices, academic pressure, shifting interests and uncertainty about the future can make even simple decisions feel complicated.",
  },
  {
    id: "03",
    image: "/images/we-heard-you/img4.webp",
    category: "LIFE TRANSITIONS",
    title: "Sometimes life changes before you feel ready for it.",
    description:
      "Transitions, shifting family dynamics, loss, new responsibilities or a new life stage take time to process.",
  },
  {
    id: "04",
    image: "/images/we-heard-you/img3.webp",
    category: "EMOTIONAL SUPPORT",
    title: "You might be functioning on the outside while carrying a lot on the inside.",
    description:
      "When expressing how you feel has become difficult, having a space to talk, reflect and make sense of your emotions can help.",
  },
  {
    id: "05",
    image: "/images/we-heard-you/img2.webp",
    category: "RELATIONSHIPS",
    title: "Sometimes the hardest part is knowing how to have the conversation.",
    description:
      "Communication difficulties, recurring conflict, shifting boundaries and relationship changes can leave people unsure of what to say or how to move forward.",
  },
  {
    id: "06",
    image: "/images/we-heard-you/img1.webp",
    category: "PERSONAL GROWTH",
    title: "You don't have to wait until everything feels overwhelming to ask for support.",
    description:
      "Support can be as simple as understanding where you are now, finding practical ways forward and taking the next step at a pace that feels manageable.",
  },
];
