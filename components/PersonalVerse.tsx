import {
  BibleTranslation,
  getVerseLink,
  getVerseLinkText,
  PERSONAL_VERSES,
} from "../utilities/inspirationalVerses.ts";
function getLinkText(template: string, name: string) {
  const [first, last] = template.split("{name}");
  return (
    <>
      {first}
      <span>{name}</span>
      {last}
    </>
  );
}
export function PersonalVerse({ name = "child" }: { name?: string }) {
  const verse =
    PERSONAL_VERSES[Math.floor(Math.random() * PERSONAL_VERSES.length)];
  return (
    <div class="mt-16 mx-2 gap-y-2 flex flex-col">
      <h1 class="text-2xl font-semibold p-1 quoteGradient">
        {getLinkText(verse.verseTemplate, name)}
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
