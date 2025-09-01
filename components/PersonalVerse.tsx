import {
  BibleTranslation,
  getPersonalVerseText,
  getVerseLink,
  getVerseLinkText,
  PERSONAL_VERSES,
} from "../utilities/inspirationalVerses.tsx";
export function PersonalVerse({ name }: { name?: string }) {
  const verse =
    PERSONAL_VERSES[Math.floor(Math.random() * PERSONAL_VERSES.length)];
  return (
    <div class="p-8 gap-y-2 flex flex-col">
      <h1 class="text-2xl font-semibold p-1 quoteGradient">
        {getPersonalVerseText(verse.verseTemplate, name)}
      </h1>
      <a
        class="text-slate-300 rounded-md bg-slate-900/60 font-extralight
         py-1 px-3 w-min whitespace-nowrap"
        href={getVerseLink(verse, BibleTranslation.CSB)}
      >
        {getVerseLinkText(verse)}
      </a>
    </div>
  );
}
