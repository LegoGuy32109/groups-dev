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
export function getBibleBookName(book: BibleBook): string {
  return BibleBook[book];
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
  urls: Partial<Record<BibleTranslation, string>>;
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
  const { urls } = verse;
  const defaultUrl = Object.values(urls)[0];
  if (translation) {
    return urls[translation] ?? defaultUrl;
  }
  return defaultUrl;
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
    urls: {
      [BibleTranslation.CSB]: "https://www.bible.com/bible/1713/PSA.147.3.CSB",
      [BibleTranslation.NIV]: "https://www.bible.com/bible/111/PSA.147.3.NIV",
    },
  },
  {
    verseTemplate:
      "If I look after the sparrows, {name}, I will certainly take care of you.",
    book: BibleBook.Luke,
    chapter: 12,
    verses: [6, 7],
    urls: {
      [BibleTranslation.CSB]: "https://www.bible.com/bible/1713/LUK.12.6-7.CSB",
      [BibleTranslation.NIV]: "https://www.bible.com/bible/111/LUK.12.6-7.NIV",
    },
  },
  //{
  //  verseTemplate:
  //    "No matter what happens, I will not leave you, {name}, when you pass through the waters, I will be with you, and when you pass throught the rivers, they will not sweep over you.",
  //  book: BibleBook.Isaiah,
  //  chapter: 43,
  //  verses: [2],
  //  urls: {},
  //},
  //{
  //  verseTemplate:
  //    "I will not abandon you, {name}, for I am glad to make you My very own.",
  //  book: BibleBook.FirstSamuel,
  //  chapter: 12,
  //  verses: [22],
  //  urls: {},
  //},
  //{
  //  verseTemplate: "Wait paitently for Me, {name}, and I will hear your cry.",
  //  book: BibleBook.Psalms,
  //  chapter: 40,
  //  verses: [1],
  //  urls: {},
  //},
  //{
  //  verseTemplate:
  //    "I will protect and carry you, {name}, all the days of your life.",
  //  book: BibleBook.Isaiah,
  //  chapter: 46,
  //  verses: [4],
  //  urls: {},
  //},
  //{
  //  verseTemplate:
  //    "I will take hold of your hand {name}, To keep you from falling.",
  //  book: BibleBook.Psalms,
  //  chapter: 37,
  //  verses: [24],
  //  urls: {},
  //},
  //{
  //  verseTemplate:
  //    "I will meet your every need, {name}, through My eternal riches in Jesus Christ.",
  //  book: BibleBook.Philippians,
  //  chapter: 4,
  //  verses: [19],
  //  urls: {},
  //},
  //{
  //  verseTemplate: "I will forgive your sins, {name}, and then forget them.",
  //  book: BibleBook.Hebrews,
  //  chapter: 8,
  //  verses: [12],
  //  urls: {},
  //},
  //{
  //  verseTemplate:
  //    "I will Keep you safe, {name}, because no one can snatch you out of My hand.",
  //  book: BibleBook.John,
  //  chapter: 10,
  //  verses: [29],
  //  urls: {},
  //},
  //{
  //  verseTemplate:
  //    "I have chosen you, {name}, to be My own precious possession.",
  //  book: BibleBook.Deuteronomy,
  //  chapter: 7,
  //  verses: [6],
  //  urls: {},
  //},
  //{
  //  verseTemplate: "My spirit made you, {name}, and My breath gives you life.",
  //  book: BibleBook.Job,
  //  chapter: 33,
  //  verses: [4],
  //  urls: {},
  //},
  //{
  //  verseTemplate:
  //    "Be strong and courageous, {name}. Do not be terrified, do not be discouraged, for the Lord your God will be with you wherever you go.",
  //  book: BibleBook.Joshua,
  //  chapter: 1,
  //  verses: [9],
  //  urls: {},
  //},
  //{
  //  verseTemplate: "My Power will rest on you, {name}, When you are weak.",
  //  book: BibleBook.SecondCorinthians,
  //  chapter: 12,
  //  verses: [9],
  //  urls: {},
  //},
  //{
  //  verseTemplate:
  //    "I see all your hardships, {name}, and I care about your suffering.",
  //  book: BibleBook.Psalms,
  //  chapter: 31,
  //  verses: [7],
  //  urls: {},
  //},
  //{
  //  verseTemplate:
  //    "I will be the voice behind you, {name}, guiding you in the way you should go.",
  //  book: BibleBook.Isaiah,
  //  chapter: 30,
  //  verses: [31],
  //  urls: {},
  //},
  //{
  //  verseTemplate:
  //    "Jesus bore your sins on the cross, {name}, so you would be healed.",
  //  book: BibleBook.FirstPeter,
  //  chapter: 2,
  //  verses: [24],
  //  urls: {},
  //},
  //{
  //  verseTemplate:
  //    "The Lord your God is in your midst, {name}, a mighty one who will save; I will rejoice over you with gladness; I will quiet you by my love; I will exult over you with loud singing.",
  //  book: BibleBook.Zephaniah,
  //  chapter: 3,
  //  verses: [17],
  //  urls: {},
  //},
];
