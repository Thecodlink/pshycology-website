/*
 * Single source of truth for the "In action" evidence gallery
 * (Talks, workshops & community work). Real supplied assets only:
 * research publications, speaking and conference activity.
 *
 * Copy rules (§ do-not-invent): titles are the exact publication/activity
 * titles supplied with the assets; categories are short chips for the gallery
 * panels; descriptions are intentionally absent — the work is evidence, not
 * marketing.
 *
 * `width`/`height` are the intrinsic pixel sizes: the DriftWall uses them to
 * render every tile at its TRUE aspect ratio — nothing is ever cropped.
 * `category` is the short label for any caption-style treatment.
 */

export interface InActionItem {
  image: string;
  width: number;
  height: number;
  category: string;
  title: string;
  alt: string;
}

export const inActionItems: InActionItem[] = [
  {
    image:
      "/images/action/research-emotional-intelligence-academic-self-concept-procrastination.jpeg",
    width: 720,
    height: 1032,
    category: "Research",
    title:
      "Systematic Review Study on Emotional Intelligence, Academic Self-Concept and Academic Procrastination",
    alt: "Systematic review publication on emotional intelligence, academic self-concept and academic procrastination",
  },
  {
    image: "/images/action/research-academic-self-concept-procrastination-young-females.jpeg",
    width: 648,
    height: 864,
    category: "Research",
    title:
      "Correlation Between the Subscales of Academic Self-Concept and Academic Procrastination Among Young Females",
    alt: "Research publication on academic self-concept and academic procrastination among young females",
  },
  {
    image: "/images/action/research-women-indian-academia.jpeg",
    width: 598,
    height: 819,
    category: "Research",
    title:
      "From Vedic Scholars to Contemporary Researchers: Women’s Evolving Participation in Indian Academia",
    alt: "Research publication on women’s evolving participation in Indian academia",
  },
  {
    image: "/images/action/research-ai-mental-health-treatment-gap-india.jpeg",
    width: 720,
    height: 1033,
    category: "Research",
    title:
      "The Role of Artificial Intelligence in Reducing the Mental Health Treatment Gap in India: A Critical Scoping Review",
    alt: "Scoping review publication on the role of artificial intelligence in reducing India’s mental health treatment gap",
  },
  {
    image: "/images/action/research-publication-05.jpeg",
    width: 720,
    height: 1103,
    category: "Research",
    title: "Research & Academic Publication",
    alt: "Research and academic publication page",
  },
  {
    image: "/images/action/speaking-presentation.jpeg",
    width: 900,
    height: 1600,
    category: "Speaking",
    title: "Speaking & Presenting",
    alt: "Speaker presenting at an academic conference podium",
  },
  {
    image: "/images/action/conference-participation.jpeg",
    width: 720,
    height: 1280,
    category: "Conference",
    title: "Conference Participation",
    alt: "Conference participation photograph from a professional event",
  },
  {
    image: "/images/action/digital-mental-health-international-conference.jpeg",
    width: 1446,
    height: 887,
    category: "Conference",
    title: "Digital Mental Health International Conference",
    alt: "Digital mental health international conference participation",
  },
  {
    image: "/images/community-work.jpg",
    width: 1536,
    height: 1152,
    category: "Community",
    title: "Community work",
    alt: "Community work and group engagement",
  },
  {
    image: "/images/podcast.webp",
    width: 1676,
    height: 939,
    category: "Podcast",
    title: "Podcast",
    alt: "A podcast recording session",
  },
  {
    image: "/images/news.webp",
    width: 1695,
    height: 928,
    category: "Media",
    title: "In the news",
    alt: "Media and press coverage",
  },
  {
    image: "/images/community.jpg",
    width: 1536,
    height: 864,
    category: "Community",
    title: "Community / events",
    alt: "A community gathering",
  },
];
