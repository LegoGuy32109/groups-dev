enum BibleBook {
  Genesis = 0,
  Exodus,
  Leviticus,
  Numbers,
  Deuteronomy,
  Joshua,
  Judges,
  Ruth,
  FirstSamuel,
  SecondSamuel,
  FirstKings,
  SecondKings,
  FirstChronicles,
  SecondChronicles,
  Ezra,
  Nehemiah,
  Esther,
  Job,
  Psalms,
  Proverbs,
  Ecclesiastes,
  SongOfSongs,
  Isaiah,
  Jeremiah,
  Lamentations,
  Ezekiel,
  Daniel,
  Hosea,
  Joel,
  Amos,
  Obadiah,
  Jonah,
  Micah,
  Nahum,
  Habakkuk,
  Zephaniah,
  Haggai,
  Zechariah,
  Malachi,
  Matthew,
  Mark,
  Luke,
  John,
  Acts,
  Romans,
  FirstCorinthians,
  SecondCorinthians,
  Galatians,
  Ephesians,
  Philippians,
  Colossians,
  FirstThessalonians,
  SecondThessalonians,
  FirstTimothy,
  SecondTimothy,
  Titus,
  Philemon,
  Hebrews,
  James,
  FirstPeter,
  SecondPeter,
  FirstJohn,
  SecondJohn,
  ThirdJohn,
  Jude,
  Revelation,
}
export const BIBLE_BOOK_INFO: Array<{ display: string; osis: string }> = [
  { display: "Genesis", osis: "GEN" },
  { display: "Exodus", osis: "EXO" },
  { display: "Leviticus", osis: "LEV" },
  { display: "Numbers", osis: "NUM" },
  { display: "Deuteronomy", osis: "DEU" },
  { display: "Joshua", osis: "JOS" },
  { display: "Judges", osis: "JDG" },
  { display: "Ruth", osis: "RUT" },
  { display: "1 Samuel", osis: "1SA" },
  { display: "2 Samuel", osis: "2SA" },
  { display: "1 Kings", osis: "1KI" },
  { display: "2 Kings", osis: "2KI" },
  { display: "1 Chronicles", osis: "1CH" },
  { display: "2 Chronicles", osis: "2CH" },
  { display: "Ezra", osis: "EZR" },
  { display: "Nehemiah", osis: "NEH" },
  { display: "Esther", osis: "EST" },
  { display: "Job", osis: "JOB" },
  { display: "Psalms", osis: "PSA" },
  { display: "Proverbs", osis: "PRO" },
  { display: "Ecclesiastes", osis: "ECC" },
  { display: "Song of Songs", osis: "SNG" },
  { display: "Isaiah", osis: "ISA" },
  { display: "Jeremiah", osis: "JER" },
  { display: "Lamentations", osis: "LAM" },
  { display: "Ezekiel", osis: "EZK" },
  { display: "Daniel", osis: "DAN" },
  { display: "Hosea", osis: "HOS" },
  { display: "Joel", osis: "JOL" },
  { display: "Amos", osis: "AMO" },
  { display: "Obadiah", osis: "OBA" },
  { display: "Jonah", osis: "JON" },
  { display: "Micah", osis: "MIC" },
  { display: "Nahum", osis: "NAM" },
  { display: "Habakkuk", osis: "HAB" },
  { display: "Zephaniah", osis: "ZEP" },
  { display: "Haggai", osis: "HAG" },
  { display: "Zechariah", osis: "ZEC" },
  { display: "Malachi", osis: "MAL" },
  { display: "Matthew", osis: "MAT" },
  { display: "Mark", osis: "MRK" },
  { display: "Luke", osis: "LUK" },
  { display: "John", osis: "JHN" },
  { display: "Acts", osis: "ACT" },
  { display: "Romans", osis: "ROM" },
  { display: "1 Corinthians", osis: "1CO" },
  { display: "2 Corinthians", osis: "2CO" },
  { display: "Galatians", osis: "GAL" },
  { display: "Ephesians", osis: "EPH" },
  { display: "Philippians", osis: "PHP" },
  { display: "Colossians", osis: "COL" },
  { display: "1 Thessalonians", osis: "1TH" },
  { display: "2 Thessalonians", osis: "2TH" },
  { display: "1 Timothy", osis: "1TI" },
  { display: "2 Timothy", osis: "2TI" },
  { display: "Titus", osis: "TIT" },
  { display: "Philemon", osis: "PHM" },
  { display: "Hebrews", osis: "HEB" },
  { display: "James", osis: "JAM" },
  { display: "1 Peter", osis: "1PE" },
  { display: "2 Peter", osis: "2PE" },
  { display: "1 John", osis: "1JN" },
  { display: "2 John", osis: "2JN" },
  { display: "3 John", osis: "3JN" },
  { display: "Jude", osis: "JUD" },
  { display: "Revelation", osis: "REV" },
];
export function getBibleBookName(book: BibleBook): string {
  return BIBLE_BOOK_INFO[book].display;
}
export enum BibleTranslation {
  CSB = "CSB",
  NIV = "NIV",
}
interface PersonalVerseData {
  verseTemplate: string;
  book: BibleBook;
  chapter: number;
  verses: Array<number>;
}
export function getPersonalVerseText(
  name: string,
  verse: PersonalVerseData,
): string {
  return verse.verseTemplate.replace("{name}", name);
}
export function getVerseLink(
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
      urlPostfix = `1713/${osis}.${chapter}.${verse.verses.join("-")}.NIV`;
      break;
    }
    case BibleTranslation.NIV:
    default:
      urlPostfix = `111/${osis}.${verse.chapter}.${verse.verses.join("-")}.NIV`;
  }
  return urlPrefix.concat(urlPostfix);
}
export function getVerseLinkText(verse: PersonalVerseData): string {
  return `${getBibleBookName(verse.book)} ${verse.chapter}:${
    verse.verses.join("-")
  }`;
}
export const PERSONAL_VERSES: Array<PersonalVerseData> = [
  {
    verseTemplate:
      "I will heal your broken heart, {name}, and mend all your wounds.",
    book: BibleBook.Psalms,
    chapter: 147,
    verses: [3],
  },
  {
    verseTemplate:
      "If I look after the sparrows, {name}, I will certainly take care of you.",
    book: BibleBook.Luke,
    chapter: 12,
    verses: [6, 7],
  },
  {
    verseTemplate:
      "No matter what happens, I will not leave you, {name}, when you pass through the waters, I will be with you, and when you pass throught the rivers, they will not sweep over you.",
    book: BibleBook.Isaiah,
    chapter: 43,
    verses: [2],
  },
  {
    verseTemplate:
      "I will not abandon you, {name}, for I am glad to make you My very own.",
    book: BibleBook.FirstSamuel,
    chapter: 12,
    verses: [22],
  },
  {
    verseTemplate: "Wait paitently for Me, {name}, and I will hear your cry.",
    book: BibleBook.Psalms,
    chapter: 40,
    verses: [1],
  },
  {
    verseTemplate:
      "I will protect and carry you, {name}, all the days of your life.",
    book: BibleBook.Isaiah,
    chapter: 46,
    verses: [4],
  },
  {
    verseTemplate:
      "I will take hold of your hand {name}, To keep you from falling.",
    book: BibleBook.Psalms,
    chapter: 37,
    verses: [24],
  },
  {
    verseTemplate:
      "I will meet your every need, {name}, through My eternal riches in Jesus Christ.",
    book: BibleBook.Philippians,
    chapter: 4,
    verses: [19],
  },
  {
    verseTemplate: "I will forgive your sins, {name}, and then forget them.",
    book: BibleBook.Hebrews,
    chapter: 8,
    verses: [12],
  },
  {
    verseTemplate:
      "I will Keep you safe, {name}, because no one can snatch you out of My hand.",
    book: BibleBook.John,
    chapter: 10,
    verses: [29],
  },
  {
    verseTemplate:
      "I have chosen you, {name}, to be My own precious possession.",
    book: BibleBook.Deuteronomy,
    chapter: 7,
    verses: [6],
  },
  {
    verseTemplate: "My spirit made you, {name}, and My breath gives you life.",
    book: BibleBook.Job,
    chapter: 33,
    verses: [4],
  },
  {
    verseTemplate:
      "Be strong and courageous, {name}. Do not be terrified, do not be discouraged, for the Lord your God will be with you wherever you go.",
    book: BibleBook.Joshua,
    chapter: 1,
    verses: [9],
  },
  {
    verseTemplate: "My Power will rest on you, {name}, When you are weak.",
    book: BibleBook.SecondCorinthians,
    chapter: 12,
    verses: [9],
  },
  {
    verseTemplate:
      "I see all your hardships, {name}, and I care about your suffering.",
    book: BibleBook.Psalms,
    chapter: 31,
    verses: [7],
  },
  {
    verseTemplate:
      "I will be the voice behind you, {name}, guiding you in the way you should go.",
    book: BibleBook.Isaiah,
    chapter: 30,
    verses: [31],
  },
  {
    verseTemplate:
      "Jesus bore your sins on the cross, {name}, so you would be healed.",
    book: BibleBook.FirstPeter,
    chapter: 2,
    verses: [24],
  },
  {
    verseTemplate:
      "The Lord your God is in your midst, {name}, a mighty one who will save; I will rejoice over you with gladness; I will quiet you by my love; I will exult over you with loud singing.",
    book: BibleBook.Zephaniah,
    chapter: 3,
    verses: [17],
  },
];
