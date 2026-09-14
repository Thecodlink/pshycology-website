/*
 * Greeting data for the entry loader — kept separate from the animation logic.
 * The point is not to catalogue every language; it is a short, warm sequence
 * that reads as "Welcome." `lang` lets each greeting render under the correct
 * language for font selection and assistive tech pronunciation.
 */

export interface Greeting {
  text: string;
  lang: string;
}

export const GREETINGS: Greeting[] = [
  { text: "Hi", lang: "en" },
  { text: "Hello", lang: "en-GB" },
  { text: "Hola", lang: "es" },
  { text: "Bonjour", lang: "fr" },
  { text: "Namaste", lang: "hi" },
  { text: "Ciao", lang: "it" },
  { text: "こんにちは", lang: "ja" },
  { text: "Olá", lang: "pt" },
  { text: "Guten Tag", lang: "de" },
];

/** The single static greeting used when motion is reduced. */
export const REDUCED_GREETING: Greeting = GREETINGS[4]!;
