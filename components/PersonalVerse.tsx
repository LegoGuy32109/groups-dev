import {
  BIBLE_BOOK_INFO,
  BibleBook,
  BibleTranslation,
  getBibleBookName,
  PERSONAL_VERSES,
  PersonalVerseData,
} from "../utilities/bibleInfo.ts";

function getPersonalVerseText(template: string, name?: string) {
  const [first, last] = template.split("{name}");
  return (
    <>
      {first}
      <span>{name}</span>
      {name ? last : last.slice(2)}
    </>
  );
}

function getVerseLink(
  verse: PersonalVerseData,
  translation?: BibleTranslation,
): string {
  const urlPrefix = `https://www.bible.com/bible/`;
  let urlPostfix = "";
  const { osis } = BIBLE_BOOK_INFO[verse.book];
  switch (translation) {
    case BibleTranslation.CSB: {
      // edge cases for api routing
      const chapter = [BibleBook.Psalms].includes(verse.book)
        ? `${verse.chapter}_1`
        : verse.chapter;
      urlPostfix = `1713/${osis}.${chapter}.${verse.verses.join("-")}.CSB`;
      break;
    }
    case BibleTranslation.NIV:
    default:
      urlPostfix = `111/${osis}.${verse.chapter}.${verse.verses.join("-")}.NIV`;
  }
  return urlPrefix.concat(urlPostfix);
}

function getVerseLinkText(verse: PersonalVerseData): string {
  return `${getBibleBookName(verse.book)} ${verse.chapter}:${
    verse.verses.join("-")
  }`;
}

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
