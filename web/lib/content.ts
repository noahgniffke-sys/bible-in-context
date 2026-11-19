export type Caption = {
  start: number;
  end: number;
  eyebrow: string;
  title: string;
  caption: string;
};

export const SCROLL_VH = 540;
export const SEQUENCE_DURATION = 24;

export const CAPTIONS: Caption[] = [
  {
    start: 0,
    end: 5,
    eyebrow: "The Word",
    title: "Read what was actually written.",
    caption:
      "Five public-domain translations, led by the Berean Standard Bible. Bundled, offline, and readable in plain English. NIV, NLT, and ESV stay with their publishers.",
  },
  {
    start: 5,
    end: 10,
    eyebrow: "In Context",
    title: "See every cross-reference.",
    caption:
      "TSK links every verse to the rest of Scripture. The Bible interprets itself when you let it.",
  },
  {
    start: 10,
    end: 15,
    eyebrow: "Greek + Hebrew",
    title: "Know what the original word meant.",
    caption:
      "Tap any word for Strong's, transliteration, root meaning, parsed grammar, and every other place it appears.",
  },
  {
    start: 15,
    end: 20,
    eyebrow: "Verse Type",
    title: "Read prophecy as prophecy. Law as law.",
    caption:
      "Each passage is tagged — narrative, command, blessing, parable, oracle — so you read it the way it was written.",
  },
  {
    start: 20,
    end: 24,
    eyebrow: "Free, forever",
    title: "No subscriptions. No ads.",
    caption:
      "Get the verse of the day at noon, and keep follows in sync. Sign in with Apple or Google. No subscriptions. No ads.",
  },
];

export const FEATURES = [
  {
    title: "Phrase-by-phrase literal meaning",
    body:
      "Every Greek and Hebrew word, parsed. Literal root, extended senses, KJV alternates, full grammar.",
  },
  {
    title: "Cross-references that go deep",
    body: "Powered by the Treasury of Scripture Knowledge — the Bible's own commentary on itself.",
  },
  {
    title: "Interlinear, not just translation",
    body:
      "See the original word over the English. Tap to open the lexicon and every verse that uses it.",
  },
  {
    title: "Community Bible plans",
    body: "Anyone can build and publish a reading plan. Read together. Discuss. Highlight. Share.",
  },
];
