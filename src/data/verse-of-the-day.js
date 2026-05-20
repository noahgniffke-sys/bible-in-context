// Verse of the Day — curated list, deterministically rotated by PST date.
// Each entry has: ref (display), bookId/chapter/verse for nav, the verse text (WEB, public domain),
// an explanation, and 3 study questions.

export const VERSES = [
  {
    ref: 'John 3:16',
    bookId: 'JHN',
    chapter: 3,
    verse: 16,
    text: 'For God so loved the world, that he gave his one and only Son, that whoever believes in him should not perish, but have eternal life.',
    explanation:
      "The most concentrated summary of the gospel. God's love is the source; the giving of the Son is the proof; faith is the means; eternal life is the result. Love that costs nothing proves nothing — God's love cost His Son.",
    questions: [
      'What does it cost God to love the world?',
      'What does "perish" mean as the alternative to eternal life?',
      "Is your faith placed in Christ Himself, or in the strength of your believing?",
    ],
  },
  {
    ref: 'Romans 5:8',
    bookId: 'ROM',
    chapter: 5,
    verse: 8,
    text: 'But God commends his own love toward us, in that while we were yet sinners, Christ died for us.',
    explanation:
      "God did not wait until we cleaned ourselves up. The cross happened while we were still hostile to Him. This is the death blow to performance-based religion.",
    questions: [
      'How does this verse rule out earning God\'s love?',
      "Why is the timing — 'while we were yet sinners' — the heart of the gospel?",
      'What changes when you stop trying to deserve grace?',
    ],
  },
  {
    ref: 'Ephesians 2:8–9',
    bookId: 'EPH',
    chapter: 2,
    verse: 8,
    text: 'For by grace you have been saved through faith, and that not of yourselves; it is the gift of God, not of works, that no one would boast.',
    explanation:
      'Salvation is by grace, through faith, not by works. Even the faith itself is a gift. Boasting is excluded forever — heaven will not echo with self-congratulation.',
    questions: [
      'Why does Paul anticipate the threat of boasting?',
      'How is faith a gift and not a work?',
      'What sins are you tempted to think disqualify you from grace?',
    ],
  },
  {
    ref: 'John 1:14',
    bookId: 'JHN',
    chapter: 1,
    verse: 14,
    text: 'The Word became flesh, and lived among us. We saw his glory, such glory as of the one and only Son of the Father, full of grace and truth.',
    explanation:
      'The eternal Word — God Himself — took on human flesh. Not a phantom, not an avatar; real flesh. This is the foundation of Christian hope: God came near.',
    questions: [
      'Why does it matter that the Word became flesh and not just appeared in flesh?',
      'How are grace and truth held together in Jesus?',
      'What does "glory" look like in the gospels — was it what people expected?',
    ],
  },
  {
    ref: 'Isaiah 53:5',
    bookId: 'ISA',
    chapter: 53,
    verse: 5,
    text: 'But he was pierced for our transgressions. He was crushed for our iniquities. The punishment that brought our peace was on him; and by his wounds we are healed.',
    explanation:
      'Written 700 years before the cross. Substitutionary atonement is not a New Testament invention — it was prophesied in the Hebrew scriptures. Our peace cost Him His wounds.',
    questions: [
      'What does substitution mean — that He took what was ours?',
      'Why does Isaiah use four different words for the suffering He bore?',
      'What "healing" is Isaiah talking about — physical, spiritual, or both?',
    ],
  },
  {
    ref: 'Romans 8:28',
    bookId: 'ROM',
    chapter: 8,
    verse: 28,
    text: 'We know that all things work together for good for those who love God, for those who are called according to his purpose.',
    explanation:
      'Not "all things ARE good." All things work together — past, present, future — toward a good end for those in Christ. Read in context: that good is conformity to Christ (8:29).',
    questions: [
      'Why is it dangerous to take this verse out of context?',
      'What is the "good" Paul has in mind (read v.29)?',
      'How has God used hard things in your life to shape you?',
    ],
  },
  {
    ref: 'Philippians 4:6–7',
    bookId: 'PHP',
    chapter: 4,
    verse: 6,
    text: 'In nothing be anxious, but in everything, by prayer and petition with thanksgiving, let your requests be made known to God. And the peace of God, which surpasses all understanding, will guard your hearts and your thoughts in Christ Jesus.',
    explanation:
      'The antidote to anxiety is not denial — it is honest prayer with thanksgiving. The peace that comes is supernatural, beyond circumstantial. It guards your heart like a soldier on watch.',
    questions: [
      'Why is thanksgiving paired with petition?',
      "How is God's peace different from feeling calm?",
      'What anxieties can you bring to God right now, specifically?',
    ],
  },
  {
    ref: 'Galatians 2:20',
    bookId: 'GAL',
    chapter: 2,
    verse: 20,
    text: 'I have been crucified with Christ, and it is no longer I that live, but Christ lives in me. That life which I now live in the flesh, I live by faith in the Son of God, who loved me, and gave himself up for me.',
    explanation:
      'Union with Christ: the believer\'s old self died with Him; the life now lived is His life through us. Christianity is not self-improvement — it is self-replacement.',
    questions: [
      'What does it mean that you have been crucified with Christ?',
      'How does daily faith differ from a one-time decision?',
      'Where in your life are you still trying to live in the flesh?',
    ],
  },
  {
    ref: 'Matthew 11:28–30',
    bookId: 'MAT',
    chapter: 11,
    verse: 28,
    text: 'Come to me, all you who labor and are heavily burdened, and I will give you rest. Take my yoke upon you, and learn from me, for I am gentle and lowly in heart; and you will find rest for your souls. For my yoke is easy, and my burden is light.',
    explanation:
      'Jesus does not invite the qualified — He invites the exhausted. His yoke is easy because He pulls beside us. The way to rest is not removal of burden but trade of yokes.',
    questions: [
      'What burdens are you carrying that He never asked you to carry?',
      "What does 'gentle and lowly' tell you about His heart toward you?",
      'How is rest under His yoke different from rest with no yoke at all?',
    ],
  },
  {
    ref: '2 Corinthians 5:17',
    bookId: '2CO',
    chapter: 5,
    verse: 17,
    text: 'Therefore if anyone is in Christ, he is a new creation. The old things have passed away. Behold, all things have become new.',
    explanation:
      'New creation — not improved version. The old self is past tense. This is identity language: who you ARE in Christ, not who you must work to become.',
    questions: [
      'What "old things" most need to feel past tense in your life?',
      'How does new-creation identity change how you fight sin?',
      'Where are you still letting the old self define you?',
    ],
  },
  {
    ref: 'Proverbs 3:5–6',
    bookId: 'PRO',
    chapter: 3,
    verse: 5,
    text: 'Trust in Yahweh with all your heart, and don\'t lean on your own understanding. In all your ways acknowledge him, and he will make your paths straight.',
    explanation:
      'Trust is the opposite of self-reliance, not the opposite of thinking. The verse calls for surrender of confidence, not the abandonment of the mind.',
    questions: [
      'In what areas are you leaning on your own understanding?',
      'What does it look like to "acknowledge" God in a decision?',
      'Has God ever made your path straight in a way you didn\'t expect?',
    ],
  },
  {
    ref: 'Hebrews 4:15–16',
    bookId: 'HEB',
    chapter: 4,
    verse: 15,
    text: 'For we don\'t have a high priest who can\'t be touched with the feeling of our infirmities, but one who has been in all points tempted like we are, yet without sin. Let us therefore draw near with boldness to the throne of grace, that we may receive mercy and find grace for help in time of need.',
    explanation:
      'Jesus is sympathetic, not because He failed, but because He faced everything we face — and triumphed without sin. That is why we can come boldly, not despite His holiness but because of it.',
    questions: [
      'Why does His sinlessness make Him MORE able to help, not less?',
      'What keeps you from coming boldly when you fail?',
      'What time of need are you in right now?',
    ],
  },
  {
    ref: 'Psalm 23:1',
    bookId: 'PSA',
    chapter: 23,
    verse: 1,
    text: 'Yahweh is my shepherd: I shall lack nothing.',
    explanation:
      'David, who had been a shepherd, knew what shepherds do: lead, feed, protect, find lost ones. To say YHWH is my shepherd is to say my life is in competent, loving hands.',
    questions: [
      'Where do you feel "lacking" right now — and what does He promise?',
      'How is shepherd-care different from a parent or friend?',
      'Read the rest of Psalm 23 — what specific shepherd-acts is He doing?',
    ],
  },
  {
    ref: 'John 14:6',
    bookId: 'JHN',
    chapter: 14,
    verse: 6,
    text: 'Jesus said to him, "I am the way, the truth, and the life. No one comes to the Father, except through me."',
    explanation:
      'The most exclusive claim Jesus ever made. Not "a way among many" — THE way. Modern pluralism cannot survive this verse, and that is exactly the point.',
    questions: [
      'How does "the way" rule out other religions as parallel paths?',
      'Why is exclusivity actually loving, not narrow?',
      'How would you explain this to a friend who says "all paths lead to God"?',
    ],
  },
  {
    ref: 'Colossians 1:15–17',
    bookId: 'COL',
    chapter: 1,
    verse: 15,
    text: 'He is the image of the invisible God, the firstborn of all creation. For by him all things were created in the heavens and on the earth, visible things and invisible things, whether thrones or dominions or principalities or powers; all things have been created through him, and for him. He is before all things, and in him all things are held together.',
    explanation:
      'Jesus is not "first thing made" — "firstborn" means rank, not order. He created all things, holds all things together, exists before all things. The atoms in your body cohere because He commands them to.',
    questions: [
      'How does this passage rule out Jesus being a created being?',
      'What does it mean that all things were created "for Him"?',
      'How does "all things hold together in Him" change how you see ordinary reality?',
    ],
  },
  {
    ref: '1 Peter 5:7',
    bookId: '1PE',
    chapter: 5,
    verse: 7,
    text: 'Cast all your worries on him, because he cares for you.',
    explanation:
      'A command grounded in a fact. Cast — throw away from yourself. Why? Because He cares. Worry implies orphan-thinking. Casting implies sonship.',
    questions: [
      'What worry are you carrying that you have not yet cast on Him?',
      'Why is "He cares for you" the necessary foundation for casting?',
      'What does it look like to take a worry back from God? (Read 1 Pet 5:5–9 in context)',
    ],
  },
  {
    ref: 'Romans 12:1–2',
    bookId: 'ROM',
    chapter: 12,
    verse: 1,
    text: 'Therefore I urge you, brothers, by the mercies of God, to present your bodies a living sacrifice, holy, acceptable to God, which is your spiritual service. Don\'t be conformed to this world, but be transformed by the renewing of your mind, so that you may prove what is the good, well-pleasing, and perfect will of God.',
    explanation:
      'Worship is not just a Sunday hour — it is presenting your body. Transformation comes through renewed thinking, not willpower. The world conforms; the Word renews.',
    questions: [
      'How is your body a living sacrifice today?',
      'What worldly thinking is shaping you that needs to be renewed?',
      'How can Scripture intake become regular mental renewal?',
    ],
  },
  {
    ref: 'Revelation 21:3–4',
    bookId: 'REV',
    chapter: 21,
    verse: 3,
    text: 'I heard a loud voice out of heaven saying, "Behold, God\'s dwelling is with people; and he will dwell with them, and they will be his people, and God himself will be with them as their God. He will wipe away every tear from their eyes. Death will be no more; neither will there be mourning, nor crying, nor pain, any more. The first things have passed away."',
    explanation:
      'The Bible does not end with souls floating in heaven — it ends with God dwelling on a renewed earth. Every tear wiped. No more death. The story does not end in a graveyard.',
    questions: [
      'What pain are you grieving that this verse promises will end?',
      'Why does God Himself wipe the tears, rather than just removing them?',
      'How does eternal hope change today\'s grief?',
    ],
  },
  {
    ref: 'James 1:2–4',
    bookId: 'JAS',
    chapter: 1,
    verse: 2,
    text: 'Count it all joy, my brothers, when you fall into various temptations, knowing that the testing of your faith produces endurance. Let endurance have its perfect work, that you may be perfect and complete, lacking in nothing.',
    explanation:
      'James does not say "feel happy about pain." He says "count" — reckon, calculate. Pain is not pointless; it is producing something. The endurance you wish you had is being grown in trials you wish you hadn\'t had.',
    questions: [
      'What trial are you in that James would say is producing endurance?',
      'Why does perfection-in-Christ require endurance, not just info?',
      'Is "joy" here a feeling or a reckoning?',
    ],
  },
  {
    ref: 'Psalm 51:10',
    bookId: 'PSA',
    chapter: 51,
    verse: 10,
    text: 'Create in me a clean heart, O God. Renew a right spirit within me.',
    explanation:
      'David, after his sin with Bathsheba, asks not for management but for creation. The verb "create" (bara) is the same word used in Genesis 1. Only God creates. Only God can give a clean heart.',
    questions: [
      'What sin needs more than rearrangement — it needs a new heart?',
      'Why is "create" the right verb here, not "improve"?',
      'Have you been trying to clean what only God can create?',
    ],
  },
  {
    ref: 'Matthew 6:33',
    bookId: 'MAT',
    chapter: 6,
    verse: 33,
    text: 'But seek first God\'s Kingdom and his righteousness; and all these things will be given to you as well.',
    explanation:
      'In context (Matt 6:25-34), Jesus addresses anxiety over food, drink, clothing. The kingdom is sought first — not added on. When that priority is right, the rest is provided.',
    questions: [
      'What "things" are you seeking first that should be added, not chased?',
      'How is seeking the kingdom different from being religious?',
      'Where does seeking first show up in your daily schedule?',
    ],
  },
  {
    ref: '1 John 1:9',
    bookId: '1JN',
    chapter: 1,
    verse: 9,
    text: 'If we confess our sins, he is faithful and righteous to forgive us the sins, and to cleanse us from all unrighteousness.',
    explanation:
      'Forgiveness is not God being lenient — it is God being faithful and just. The cross paid for sin; confession agrees with God about sin. Cleansing extends past forgiveness to all unrighteousness.',
    questions: [
      "How is God's forgiveness based on His justice, not just His mercy?",
      'Is there a sin you have stopped confessing because it keeps coming back?',
      'What does it mean that He cleanses ALL unrighteousness?',
    ],
  },
  {
    ref: 'John 10:27–28',
    bookId: 'JHN',
    chapter: 10,
    verse: 27,
    text: 'My sheep hear my voice, and I know them, and they follow me. I give eternal life to them. They will never perish, and no one will snatch them out of my hand.',
    explanation:
      'Jesus describes His sheep with three marks: they hear His voice, He knows them, they follow Him. He gives eternal life and promises no one can snatch them from His hand. The emphasis is the strength and faithfulness of the Shepherd.',
    questions: [
      'Which mark of His sheep is strongest in your life right now — hearing, being known, or following?',
      'What does it mean that the Shepherd Himself holds His sheep?',
      'How do you "hear His voice" today?',
    ],
  },
  {
    ref: 'Hebrews 12:1–2',
    bookId: 'HEB',
    chapter: 12,
    verse: 1,
    text: 'Therefore let us also, seeing we are surrounded by so great a cloud of witnesses, lay aside every weight and the sin which so easily entangles us, and let us run with patience the race that is set before us, looking to Jesus, the author and perfecter of faith, who for the joy that was set before him endured the cross, despising its shame, and has sat down at the right hand of the throne of God.',
    explanation:
      'The Christian life is a marathon, not a sprint. Strip down. Look forward to Jesus, not backward at failures. He endured the cross by looking at the joy beyond it — so can you.',
    questions: [
      'What "weight" (not sin, but extra) is slowing your race?',
      'What sin most easily entangles you?',
      'What "joy set before you" can fuel endurance through hard obedience?',
    ],
  },
  {
    ref: 'Psalm 46:10',
    bookId: 'PSA',
    chapter: 46,
    verse: 10,
    text: 'Be still, and know that I am God. I will be exalted among the nations. I will be exalted in the earth.',
    explanation:
      "'Be still' in Hebrew (raphah) means cease striving, drop your hands. The command is not relaxation — it is surrender. He WILL be exalted; the only question is whether you stop striving against Him.",
    questions: [
      'What striving is God asking you to drop?',
      'How is stillness an act of faith, not laziness?',
      "What if 'be still' is more about ceasing than relaxing?",
    ],
  },
  {
    ref: 'Lamentations 3:22–23',
    bookId: 'LAM',
    chapter: 3,
    verse: 22,
    text: "It is because of Yahweh's loving kindnesses that we are not consumed, because his compassion doesn't fail. They are new every morning. Great is your faithfulness.",
    explanation:
      "Written in the smoking ruins of Jerusalem. Mercy ARRIVES new each morning — yesterday's grace was for yesterday. You don't need to ration. New mercies came at sunrise.",
    questions: [
      'How does it change today to know mercy is "new" — not yesterday\'s leftovers?',
      'What does it say that Lamentations sees mercy in the worst chapter?',
      'How will you receive His new mercies tomorrow morning?',
    ],
  },
  {
    ref: '2 Timothy 3:16–17',
    bookId: '2TI',
    chapter: 3,
    verse: 16,
    text: 'Every Scripture is God-breathed and profitable for teaching, for reproof, for correction, and for instruction in righteousness, that each person who belongs to God may be complete, thoroughly equipped for every good work.',
    explanation:
      'Scripture is God-breathed (theopneustos) — a word Paul may have coined. It profits in four ways: teaches what is true, reproves what is false, corrects what is wrong, instructs in what is right. Every Christian is equipped through it.',
    questions: [
      'Of the four uses, which does Scripture do most often in your life?',
      'Are you using Scripture to comfort yourself, or also to reprove and correct yourself?',
      'What good work is Scripture currently equipping you for?',
    ],
  },
  {
    ref: 'Mark 8:34–35',
    bookId: 'MRK',
    chapter: 8,
    verse: 34,
    text: '"If anyone wants to come after me, let him deny himself, and take up his cross, and follow me. For whoever wants to save his life will lose it; and whoever will lose his life for my sake and the sake of the Good News will save it."',
    explanation:
      'The cross was an instrument of execution. Taking it up meant walking to your death. Following Jesus is gain, but it is gain on the other side of dying to self. This is not metaphor.',
    questions: [
      'Where are you trying to "save your life" in a way Jesus says will lose it?',
      'What self-denial is He asking of you specifically?',
      'How is following Jesus actually the way to find life, not lose it?',
    ],
  },
  {
    ref: 'Ephesians 1:3–4',
    bookId: 'EPH',
    chapter: 1,
    verse: 3,
    text: 'Blessed be the God and Father of our Lord Jesus Christ, who has blessed us with every spiritual blessing in the heavenly places in Christ; even as he chose us in him before the foundation of the world, that we would be holy and without defect before him in love.',
    explanation:
      'Every spiritual blessing the believer enjoys is found "in Christ" — chosen in Him, before the foundation of the world, for the purpose of holiness and love. Notice that the location of these blessings (in Christ) is the emphasis, not the mechanics of how anyone comes to be in Him.',
    questions: [
      'What does it mean that every spiritual blessing is found "in Christ" and nowhere else?',
      'What "spiritual blessings" do you tend to forget you already have?',
      'How does being chosen for holiness reshape what holiness is for?',
    ],
  },
  {
    ref: 'Joshua 1:9',
    bookId: 'JOS',
    chapter: 1,
    verse: 9,
    text: "Haven't I commanded you? Be strong and courageous. Don't be afraid. Don't be dismayed, for Yahweh your God is with you wherever you go.",
    explanation:
      'Spoken to a leader stepping into a job he did not feel qualified for, after Moses\' death. Courage is commanded, not summoned from within — and the basis is presence, not capability.',
    questions: [
      'What dismay are you fighting that this verse addresses?',
      'How is courage a command and not a personality?',
      'Where does presence outweigh capability for you right now?',
    ],
  },
  {
    ref: '1 Corinthians 13:4–7',
    bookId: '1CO',
    chapter: 13,
    verse: 4,
    text: 'Love is patient and is kind. Love doesn\'t envy. Love doesn\'t brag, is not proud, doesn\'t behave itself inappropriately, doesn\'t seek its own way, is not provoked, takes no account of evil; doesn\'t rejoice in unrighteousness, but rejoices with the truth; bears all things, believes all things, hopes all things, endures all things.',
    explanation:
      'Read it with your name in place of "love" — that\'s the test. Then read it with "Christ" in place of love — that\'s the model. The gap between the two is what He came to close.',
    questions: [
      'Which of these is hardest for you to live out?',
      'How does putting "Christ" in place of "love" change what love is?',
      'In which relationship is this list most needed for you today?',
    ],
  },
  {
    ref: 'Psalm 1:1–3',
    bookId: 'PSA',
    chapter: 1,
    verse: 1,
    text: 'Blessed is the man who doesn\'t walk in the counsel of the wicked, nor stand in the way of sinners, nor sit in the seat of scoffers; but his delight is in Yahweh\'s law. On his law he meditates day and night. He will be like a tree planted by the streams of water, that produces its fruit in its season, whose leaf also does not wither. Whatever he does shall prosper.',
    explanation:
      'Walk, stand, sit — note the progression of compromise. The blessed man instead delights in and meditates on God\'s Word. The picture: a tree by water, deep-rooted, fruitful in season.',
    questions: [
      'Where is "walking → standing → sitting" with sin happening in your life?',
      'Is meditating on Scripture day and night realistic — and if not, what would?',
      'What season of fruitfulness are you in right now?',
    ],
  },
  {
    ref: '2 Corinthians 12:9',
    bookId: '2CO',
    chapter: 12,
    verse: 9,
    text: 'He has said to me, "My grace is sufficient for you, for my power is made perfect in weakness." Most gladly therefore I will rather glory in my weaknesses, that the power of Christ may rest on me.',
    explanation:
      "Paul prayed three times for his thorn to be removed. God said no — not because He wasn't listening, but because power perfects in weakness. The thorn became the platform for grace.",
    questions: [
      "What 'thorn' have you prayed against that may be God's chosen platform?",
      "Why does His power perfect IN weakness rather than instead of it?",
      "How is glorying in weakness counter-cultural?",
    ],
  },
  {
    ref: 'Genesis 50:20',
    bookId: 'GEN',
    chapter: 50,
    verse: 20,
    text: 'As for you, you meant evil against me, but God meant it for good, to save many people alive, as is happening today.',
    explanation:
      "Joseph speaks to his brothers, decades after they sold him into slavery. He doesn't deny their evil — he sees God's overarching good through it. Same event, two intentions, both real.",
    questions: [
      'What evil event in your life might God be weaving for good?',
      'How is this NOT the same as saying "everything happens for a reason"?',
      'Who needs your forgiveness as Joseph forgave?',
    ],
  },
  {
    ref: 'Acts 4:12',
    bookId: 'ACT',
    chapter: 4,
    verse: 12,
    text: 'There is salvation in no one else, for there is no other name under heaven that is given among men, by which we must be saved.',
    explanation:
      'Peter, before the very people who crucified Jesus, names exclusivity as gospel. Not "no other name we prefer" — no other name that saves. Pluralism cannot survive this declaration either.',
    questions: [
      'How is exclusivity actually the loving truth, not narrowness?',
      'What other "names" do you trust for salvation — career, family, morality?',
      'What courage was required for Peter to say this here?',
    ],
  },
  {
    ref: 'Matthew 28:18–20',
    bookId: 'MAT',
    chapter: 28,
    verse: 18,
    text: 'Jesus came to them and spoke to them, saying, "All authority has been given to me in heaven and on earth. Go, and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit, teaching them to observe all things that I commanded you. Behold, I am with you always, even to the end of the age."',
    explanation:
      'The Great Commission rests on a claim: ALL authority. The "Go" follows the "I have." Teaching to observe — discipleship is not just doctrine, it is obedience. And He goes with the goer.',
    questions: [
      'How does His all-authority change your sense of fear in witness?',
      'What is the difference between teaching info and teaching to observe?',
      'Who in your life are you currently helping become a disciple?',
    ],
  },
  {
    ref: 'Romans 8:38–39',
    bookId: 'ROM',
    chapter: 8,
    verse: 38,
    text: 'For I am persuaded that neither death, nor life, nor angels, nor principalities, nor things present, nor things to come, nor powers, nor height, nor depth, nor any other created thing will be able to separate us from God\'s love which is in Christ Jesus our Lord.',
    explanation:
      'Paul covers every possible threat — and rules them all out. Nothing in creation can separate you from the love of God in Christ. Including the worst things you fear, including yourself (you are also a created thing).',
    questions: [
      'Which item on Paul\'s list most threatens your assurance?',
      'Why does Paul say "in Christ Jesus" — what does that location guarantee?',
      'How is "I am persuaded" different from "I hope"?',
    ],
  },
  {
    ref: 'Isaiah 9:6',
    bookId: 'ISA',
    chapter: 9,
    verse: 6,
    text: 'For a child is born to us. A son is given to us; and the government will be on his shoulders. His name will be called Wonderful Counselor, Mighty God, Everlasting Father, Prince of Peace.',
    explanation:
      'A child born — the manger. A son given — the cross. Mighty God and Everlasting Father — the deity. Prince of Peace — the kingdom. All four titles attach to one person, and the prophecy is over 700 years old.',
    questions: [
      'How can the same person be both child born AND Mighty God?',
      'Which of the four names speaks most to your need today?',
      "What 'government on His shoulders' looks like in your life?",
    ],
  },
  {
    ref: 'Luke 9:23',
    bookId: 'LUK',
    chapter: 9,
    verse: 23,
    text: 'He said to all, "If anyone desires to come after me, let him deny himself, take up his cross, and follow me."',
    explanation:
      "Luke adds 'daily' to Mark's version. Self-denial isn't a one-time decision — it is a recurring posture. Each day, the cross. Each day, the choice.",
    questions: [
      'What does daily self-denial look like in your week?',
      'In what area is "self" most demanding to be served right now?',
      'How is self-denial not the same as self-hatred?',
    ],
  },
  {
    ref: 'Hebrews 13:8',
    bookId: 'HEB',
    chapter: 13,
    verse: 8,
    text: 'Jesus Christ is the same yesterday, today, and forever.',
    explanation:
      'In a world where everything changes, He does not. His character, His promises, His love — unchanged. The Jesus of the gospels, the Jesus of your prayer this morning, the Jesus of your final breath: same Person.',
    questions: [
      'How is the unchanging-ness of Jesus an anchor in change?',
      'What attribute of Jesus do you most need to remember as unchanging right now?',
      'What does His unchanging character mean for how we read older parts of Scripture today?',
    ],
  },
  {
    ref: 'Jeremiah 29:11',
    bookId: 'JER',
    chapter: 29,
    verse: 11,
    text: '"For I know the thoughts that I think toward you," says Yahweh, "thoughts of peace, and not of evil, to give you hope and a future."',
    explanation:
      "Spoken to exiles in Babylon. The 70-year exile WAS the plan — the 'future and hope' was on the other side of decades of hard. Don't yank this verse out of its captivity context.",
    questions: [
      'How does the exile context reshape "future and hope"?',
      'What captivity are you in that may also be God\'s plan with hope on the far side?',
      'Why is corporate context (the people of Israel) important here, before personal application?',
    ],
  },
  {
    ref: '1 Thessalonians 4:16–17',
    bookId: '1TH',
    chapter: 4,
    verse: 16,
    text: 'For the Lord himself will descend from heaven with a shout, with the voice of the archangel and with God\'s trumpet. The dead in Christ will rise first, then we who are alive, who are left, will be caught up together with them in the clouds, to meet the Lord in the air. So we will be with the Lord forever.',
    explanation:
      "Christian hope at the funeral isn't 'they're in a better place' — it is 'they will rise.' Resurrection of the body. Reunion with the saints. Forever with the Lord. The grave is not the end.",
    questions: [
      'How is bodily resurrection different from "spiritual life after death"?',
      'Whose resurrection are you most longing to witness?',
      'How can this hope reshape grief without erasing it?',
    ],
  },
  {
    ref: 'Psalm 139:13–14',
    bookId: 'PSA',
    chapter: 139,
    verse: 13,
    text: 'For you formed my inmost being. You knit me together in my mother\'s womb. I will give thanks to you, for I am fearfully and wonderfully made. Your works are wonderful. My soul knows that very well.',
    explanation:
      'Personal, intentional, sovereign creation — even before birth. You are not an accident, not a mistake, not a glitch. The God of the universe knit you on purpose.',
    questions: [
      'Where do you struggle to believe you were "wonderfully" made?',
      'How does this verse speak into self-image and identity?',
      'What does it mean for the unborn?',
    ],
  },
  {
    ref: '1 Corinthians 15:3–4',
    bookId: '1CO',
    chapter: 15,
    verse: 3,
    text: 'For I delivered to you first of all that which I also received: that Christ died for our sins according to the Scriptures, that he was buried, that he was raised on the third day according to the Scriptures.',
    explanation:
      "Paul's earliest creed. The gospel in three lines: Christ died, was buried, was raised — all according to the Scriptures. The whole Old Testament was building toward this.",
    questions: [
      "Why does Paul stress 'according to the Scriptures' twice?",
      'What is gained by including the burial — what does it confirm?',
      'How would you summarize the gospel in three lines yourself?',
    ],
  },
  {
    ref: 'James 4:7–8',
    bookId: 'JAS',
    chapter: 4,
    verse: 7,
    text: 'Be subject therefore to God. But resist the devil, and he will flee from you. Draw near to God, and he will draw near to you. Cleanse your hands, you sinners. Purify your hearts, you double-minded.',
    explanation:
      'Submission to God is not weakness — it is the precondition of resisting the devil. Draw near to Him; He draws near. The double-minded heart is divided between God and the world.',
    questions: [
      'Where is your heart double-minded right now?',
      "How is resisting the devil tied to submitting to God — not separate from it?",
      "What does drawing near to God look like in your week?",
    ],
  },
  {
    ref: 'John 16:33',
    bookId: 'JHN',
    chapter: 16,
    verse: 33,
    text: '"I have told you these things, that in me you may have peace. In the world you have trouble; but cheer up! I have overcome the world."',
    explanation:
      "Jesus does not promise the world will be easy. He promises He has overcome it. Peace is found IN HIM, not in circumstances. Trouble is realistic; cheer is grounded in His victory.",
    questions: [
      'How is peace possible IN trouble, not just after it?',
      "What does it mean that He has already overcome — past tense?",
      "What 'trouble' do you most need His overcoming peace for today?",
    ],
  },
  {
    ref: 'Philippians 2:5–8',
    bookId: 'PHP',
    chapter: 2,
    verse: 5,
    text: 'Have this in your mind, which was also in Christ Jesus, who, existing in the form of God, didn\'t consider equality with God a thing to be grasped, but emptied himself, taking the form of a servant, being made in the likeness of men. And being found in human form, he humbled himself, becoming obedient to death, yes, the death of the cross.',
    explanation:
      "The hymn of incarnation. Jesus did not stop being God — He emptied Himself by adding humanity, not by subtracting deity. The trajectory: throne → crib → towel → cross. Then exaltation (v.9-11).",
    questions: [
      'In what specific situation does Christ-mindedness call you to humble yourself?',
      'How is "emptying" really "adding limits" rather than losing deity?',
      "What does it teach you that the cross was a chosen humility, not a forced one?",
    ],
  },
  {
    ref: 'Proverbs 18:10',
    bookId: 'PRO',
    chapter: 18,
    verse: 10,
    text: 'Yahweh\'s name is a strong tower: the righteous run to him, and are safe.',
    explanation:
      "His name is a strong tower — meaning His revealed character. The righteous don't conjure courage; they run. Safety is not in absence of danger but in arrival at a fortress.",
    questions: [
      'When fear hits, what tower do you run to first?',
      'What attribute of God is the strongest tower for what you face today?',
      "How is running a humble action — not just a brave one?",
    ],
  },
  {
    ref: 'Romans 10:9–10',
    bookId: 'ROM',
    chapter: 10,
    verse: 9,
    text: 'If you will confess with your mouth that Jesus is Lord, and believe in your heart that God raised him from the dead, you will be saved. For with the heart, one believes resulting in righteousness; and with the mouth confession is made resulting in salvation.',
    explanation:
      'Heart belief and mouth confession — internal trust and external allegiance — together. Faith that stays silent is suspect; mouth-words without heart-trust are empty. Both matter.',
    questions: [
      'Have you ever confessed Jesus as Lord publicly?',
      'Is your faith quiet because of fear, or because no one has asked?',
      'How is confessing "Lord" different from confessing "Savior"?',
    ],
  },
  {
    ref: '1 John 3:1',
    bookId: '1JN',
    chapter: 3,
    verse: 1,
    text: 'Behold, how great a love the Father has bestowed on us, that we should be called children of God! For this cause the world doesn\'t know us, because it didn\'t know him.',
    explanation:
      "Not 'called children for a moment' — children, full stop. Adoption, not orientation. The world will not understand you for the same reason it didn\'t understand Him. This is family resemblance.",
    questions: [
      'How does being a child of God shape how you see your worth?',
      'In what ways does the world misread you for following Jesus?',
      'Are you living from sonship or trying to earn it?',
    ],
  },
  {
    ref: 'Isaiah 41:10',
    bookId: 'ISA',
    chapter: 41,
    verse: 10,
    text: '"Don\'t you be afraid, for I am with you. Don\'t be dismayed, for I am your God. I will strengthen you. Yes, I will help you. Yes, I will uphold you with the right hand of my righteousness."',
    explanation:
      'Five "I will"s in one verse. Spoken to a fearful people. Notice the order — "for I am" before "I will." Presence first, then provision.',
    questions: [
      'Which "I will" does your soul need most right now?',
      'How is presence the foundation for not fearing, not just provision?',
      'Where in your week can you remember "I am with you"?',
    ],
  },
  {
    ref: 'Matthew 22:37–39',
    bookId: 'MAT',
    chapter: 22,
    verse: 37,
    text: 'Jesus said to him, "\'You shall love the Lord your God with all your heart, with all your soul, and with all your mind.\' This is the first and great commandment. A second likewise is this, \'You shall love your neighbor as yourself.\' The whole law and the prophets depend on these two commandments."',
    explanation:
      'The whole law summed in two commands. Heart, soul, mind — the totality of you. Then neighbor as yourself. The horizontal flows from the vertical; love for God produces love for people.',
    questions: [
      'Which faculty (heart/soul/mind) do you most withhold from God?',
      'Who is the neighbor you find hardest to love right now?',
      'How does loving God first prevent love-of-neighbor from becoming people-pleasing?',
    ],
  },
  {
    ref: 'Psalm 27:1',
    bookId: 'PSA',
    chapter: 27,
    verse: 1,
    text: 'Yahweh is my light and my salvation. Whom shall I fear? Yahweh is the strength of my life. Of whom shall I be afraid?',
    explanation:
      'Light overcomes darkness; salvation overcomes danger; strength overcomes weakness. David rolls up the threats and answers them all with one Person.',
    questions: [
      'What darkness in your life does His light most need to address?',
      'Is the question "whom shall I fear" rhetorical or honest for you today?',
      'How are light, salvation, and strength tied together?',
    ],
  },
  {
    ref: '1 Corinthians 10:13',
    bookId: '1CO',
    chapter: 10,
    verse: 13,
    text: 'No temptation has taken you except what is common to man. God is faithful, who will not allow you to be tempted above what you are able, but will with the temptation also make the way of escape, that you may be able to endure it.',
    explanation:
      'You are not unique in your temptation. God limits intensity to your capacity-in-Christ. He always provides an escape — the question is whether you take it.',
    questions: [
      'What temptation feels uniquely yours — but actually is not?',
      'Where in past temptation did God provide an escape you missed or took?',
      'How does His faithfulness ground your endurance?',
    ],
  },
  {
    ref: 'Hebrews 11:1',
    bookId: 'HEB',
    chapter: 11,
    verse: 1,
    text: 'Now faith is assurance of things hoped for, proof of things not seen.',
    explanation:
      'Faith is not blind — it is the substance and evidence of unseen reality. It is more than feeling; it is conviction. The chapter goes on to show what this kind of faith DID through history.',
    questions: [
      'How is faith "evidence" — not the absence of evidence?',
      'What unseen thing are you holding by faith right now?',
      'How is faith different from optimism?',
    ],
  },
  {
    ref: 'Galatians 5:22–23',
    bookId: 'GAL',
    chapter: 5,
    verse: 22,
    text: 'But the fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faith, gentleness, and self-control. Against such things there is no law.',
    explanation:
      'Fruit, not works. You don\'t manufacture this — the Spirit grows it. The list is singular fruit (one fruit, nine facets) — they come together as a package, not as line items to pick.',
    questions: [
      'Which fruit is the Spirit currently growing in you (where there used to be none)?',
      'Which is least visible in your life right now?',
      'How is fruit different from gritted-teeth effort?',
    ],
  },
  {
    ref: 'John 15:5',
    bookId: 'JHN',
    chapter: 15,
    verse: 5,
    text: '"I am the vine. You are the branches. He who remains in me, and I in him, the same bears much fruit, for apart from me you can do nothing."',
    explanation:
      'Apart from Him: nothing. Not "less than your potential" — nothing. Fruit is not effort, it is abiding. Branches don\'t strain to bear fruit; they stay connected to the vine.',
    questions: [
      'What does "abide" look like for you in a normal day?',
      'Where are you trying to bear fruit while disconnected?',
      'What "nothing" have you been producing while believing it was something?',
    ],
  },
  {
    ref: 'Psalm 119:105',
    bookId: 'PSA',
    chapter: 119,
    verse: 105,
    text: 'Your word is a lamp to my feet, and a light for my path.',
    explanation:
      'Lamp to my feet — enough light for the next step, not the whole journey. God\'s Word does not always show the destination, but it always shows the next move of faithfulness.',
    questions: [
      'Are you frustrated because Scripture only lights the next step, not the whole road?',
      'What is the next step of obedience the Word has shown you?',
      'How is "next step" light actually a gift, not a limitation?',
    ],
  },
  {
    ref: 'Romans 1:16',
    bookId: 'ROM',
    chapter: 1,
    verse: 16,
    text: 'For I am not ashamed of the Good News of Christ, for it is the power of God for salvation for everyone who believes; for the Jew first, and also for the Greek.',
    explanation:
      'The gospel is power — not advice, not principles. It changes who you are, not just what you do. Paul says he is unashamed because the message itself is doing the work.',
    questions: [
      'Are you ever embarrassed of the gospel — and where does shame come from?',
      'How is the gospel power, not information?',
      'Who are you most reluctant to share the gospel with?',
    ],
  },
  {
    ref: 'Philippians 4:13',
    bookId: 'PHP',
    chapter: 4,
    verse: 13,
    text: 'I can do all things through Christ, who strengthens me.',
    explanation:
      'Paul writes this from prison, in context of contentment in plenty AND want (4:11–12). It is not a sports-victory verse — it is a contentment-in-suffering verse. Through Him, you can do hard, ordinary, suffering things.',
    questions: [
      'How does the prison context reshape this verse for you?',
      'Where do you need strength for hard ordinary obedience, not just achievement?',
      'How is contentment a learned skill, not a feeling?',
    ],
  },
  {
    ref: 'Romans 6:23',
    bookId: 'ROM',
    chapter: 6,
    verse: 23,
    text: 'For the wages of sin is death, but the free gift of God is eternal life in Christ Jesus our Lord.',
    explanation:
      'Sin pays — and the wage is death. Eternal life is not a wage; it is a gift. You earn one, you receive the other. Mixing the two is the heart of every false gospel.',
    questions: [
      'Where in your thinking are you trying to earn what only comes as a gift?',
      'Why must wages be contrasted with gifts here?',
      'How is "in Christ Jesus" the sphere where the gift is found?',
    ],
  },
  {
    ref: 'Ephesians 6:10–11',
    bookId: 'EPH',
    chapter: 6,
    verse: 10,
    text: 'Finally, be strong in the Lord, and in the strength of his might. Put on the whole armor of God, that you may be able to stand against the wiles of the devil.',
    explanation:
      'Strength comes from union with Him. The armor is His, not yours — you put it on. Standing is the goal; we are not asked to advance and conquer in our own power, but to stand firm in His.',
    questions: [
      'Which piece of armor (Eph 6:14–17) do you most lack today?',
      'Why is "stand" the verb, rather than "march"?',
      'Where are the wiles (schemes) of the devil at work in your life?',
    ],
  },
  {
    ref: 'John 8:31–32',
    bookId: 'JHN',
    chapter: 8,
    verse: 31,
    text: 'Jesus therefore said to those Jews who had believed him, "If you remain in my word, then you are truly my disciples. You will know the truth, and the truth will make you free."',
    explanation:
      'Freedom is not the absence of authority — it is alignment with truth. Discipleship is abiding in His word. Freedom and bondage are determined by what you abide in.',
    questions: [
      'What "truths" of the world have made you LESS free?',
      'How does abiding in His word produce freedom from sin?',
      'Why does Jesus tie discipleship to remaining in His word, not just to a one-time decision?',
    ],
  },
  {
    ref: '2 Corinthians 4:16–18',
    bookId: '2CO',
    chapter: 4,
    verse: 16,
    text: 'Therefore we don\'t faint, but though our outward man is decaying, yet our inward man is renewed day by day. For our light affliction, which is for the moment, works for us more and more exceedingly an eternal weight of glory; while we don\'t look at the things which are seen, but at the things which are not seen. For the things which are seen are temporal, but the things which are not seen are eternal.',
    explanation:
      'The body wears out. The inner self is being renewed. Suffering is not just endurance — it is producing eternal weight of glory. Look at the unseen, because the seen is the temporary thing.',
    questions: [
      'In what way is your outward decaying right now?',
      'How does Paul call this affliction "light" — given his beatings, shipwrecks, prison?',
      'How can you fix your eyes on what is unseen this week?',
    ],
  },
  {
    ref: 'Psalm 19:1',
    bookId: 'PSA',
    chapter: 19,
    verse: 1,
    text: 'The heavens declare the glory of God. The expanse shows his handiwork.',
    explanation:
      'Creation is preaching. Every star, sunrise, mountain — testifies. The atheist must silence the heavens to maintain his position. Romans 1 says they are without excuse.',
    questions: [
      'When did you last simply look up and worship?',
      'How does general revelation in nature work alongside special revelation in Scripture?',
      'What does the universe\'s scale tell you about God\'s greatness?',
    ],
  },
  {
    ref: 'Matthew 5:14–16',
    bookId: 'MAT',
    chapter: 5,
    verse: 14,
    text: '"You are the light of the world. A city located on a hill can\'t be hidden. Neither do you light a lamp and put it under a measuring basket, but on a stand; and it shines to all who are in the house. Even so, let your light shine before men, that they may see your good works and glorify your Father who is in heaven."',
    explanation:
      'You ARE light — present tense, derivative. Jesus is the light of the world (John 8:12); you reflect Him. The point of shining is not your reputation but the Father\'s glory.',
    questions: [
      'Where are you tempted to hide your light?',
      'How is shining for the Father\'s glory different from shining for your own reputation?',
      'What good work is God currently asking you to do publicly?',
    ],
  },
  {
    ref: 'John 6:35',
    bookId: 'JHN',
    chapter: 6,
    verse: 35,
    text: 'Jesus said to them, "I am the bread of life. He who comes to me will not be hungry, and he who believes in me will never be thirsty."',
    explanation:
      'After feeding 5,000, the crowd wants more bread. Jesus offers Himself instead. Physical bread leaves you hungry tomorrow; the Bread of Life satisfies forever.',
    questions: [
      'What soul-hunger are you trying to satisfy with anything but Him?',
      'Why did the crowd reject Him after this teaching (read 6:60–66)?',
      'How is "coming" and "believing" the same thing here?',
    ],
  },
  {
    ref: '1 Peter 1:3–4',
    bookId: '1PE',
    chapter: 1,
    verse: 3,
    text: 'Blessed be the God and Father of our Lord Jesus Christ, who according to his great mercy became our father again to a living hope through the resurrection of Jesus Christ from the dead, to an incorruptible and undefiled inheritance that doesn\'t fade away, reserved in Heaven for you.',
    explanation:
      'Living hope — not wishful, not dead. Tied to a real resurrection of a real Person. Your inheritance is undefiled, unfading, and reserved (the word means kept under guard) in heaven.',
    questions: [
      'How is "living hope" different from optimism?',
      'What dead hopes have you been holding that need replacing with living hope?',
      'What does it do to anxiety to know your inheritance is reserved by Him?',
    ],
  },
  {
    ref: '2 Peter 1:3',
    bookId: '2PE',
    chapter: 1,
    verse: 3,
    text: 'Seeing that his divine power has granted to us all things that pertain to life and godliness, through the knowledge of him who called us by his own glory and virtue.',
    explanation:
      'You already have everything needed for godliness. It is granted, not pending. The bottleneck is not God\'s supply; it is your knowledge of Him.',
    questions: [
      'What do you think you "need more of" that He has already granted?',
      'How does growth in knowing Him unlock godliness?',
      'Where are you waiting for what is already given?',
    ],
  },
  {
    ref: 'Galatians 6:9',
    bookId: 'GAL',
    chapter: 6,
    verse: 9,
    text: 'Let us not be weary in doing good, for we will reap in due season if we don\'t give up.',
    explanation:
      'Doing good IS wearying. Paul does not deny it. The promise is reaping — but in the right season. Quitting is the only thing that forfeits the harvest.',
    questions: [
      'In what good work are you weary right now?',
      'What is the harvest you are tempted to forfeit by quitting?',
      'How is patience a form of faith?',
    ],
  },
  {
    ref: 'Psalm 103:11–12',
    bookId: 'PSA',
    chapter: 103,
    verse: 11,
    text: 'For as the heavens are high above the earth, so great is his loving kindness toward those who fear him. As far as the east is from the west, so far has he removed our transgressions from us.',
    explanation:
      'East and west never meet — they are infinite directions. North and south DO meet at poles. David picks the right axis on purpose. Your forgiven sin is not stored where you can find it again.',
    questions: [
      'What sin do you keep dragging back from the east-west distance?',
      'Why does the choice of "east and west" matter (vs. north and south)?',
      'How does fearing Him relate to receiving His kindness?',
    ],
  },
  {
    ref: 'John 11:25–26',
    bookId: 'JHN',
    chapter: 11,
    verse: 25,
    text: 'Jesus said to her, "I am the resurrection and the life. He who believes in me will still live, even if he dies. Whoever lives and believes in me will never die. Do you believe this?"',
    explanation:
      'Spoken to a grieving sister at her brother\'s tomb. Jesus does not just bring resurrection later — He IS the resurrection now. Then He asks the question every grieving believer must answer: do you believe this?',
    questions: [
      'How does "I am" change resurrection from a future event to a present Person?',
      'Whose grave do you most need this hope at?',
      'What is your honest answer to His question?',
    ],
  },
  {
    ref: 'Mark 10:45',
    bookId: 'MRK',
    chapter: 10,
    verse: 45,
    text: '"For the Son of Man also came not to be served, but to serve, and to give his life as a ransom for many."',
    explanation:
      'Service was not Jesus\' afterthought — it was His mission. The cross was a ransom: a payment that releases captives. He paid the price; we walk free.',
    questions: [
      'Where do you slip into wanting to be served instead of serving?',
      'What does "ransom" tell you about the price of your freedom?',
      'How does Jesus\' service shape your view of leadership?',
    ],
  },
  {
    ref: 'Romans 8:1',
    bookId: 'ROM',
    chapter: 8,
    verse: 1,
    text: 'There is therefore now no condemnation to those who are in Christ Jesus, who don\'t walk according to the flesh, but according to the Spirit.',
    explanation:
      'No. Condemnation. Now. For those in Christ. Not "less" condemnation, not "deferred" — none. The verse begins with "therefore" — pointing back to chapters 1–7. The condemnation you feared is gone in Christ.',
    questions: [
      'What past sin still functionally condemns you in your conscience?',
      'How is "no condemnation" different from "no consequences"?',
      'What does walking according to the Spirit (vs. flesh) look like in your week?',
    ],
  },
  {
    ref: '1 John 4:19',
    bookId: '1JN',
    chapter: 4,
    verse: 19,
    text: 'We love him, because he first loved us.',
    explanation:
      'Christian love is response, not initiation. You can\'t generate love from a self that has not been loved first. The cross gives love its source; we just pass it on.',
    questions: [
      'Where are you trying to love from an empty tank?',
      'How does receiving His love change how you love hard people?',
      'What does it mean that He loved you FIRST?',
    ],
  },
  {
    ref: 'Psalm 16:11',
    bookId: 'PSA',
    chapter: 16,
    verse: 11,
    text: 'You will show me the path of life. In your presence is fullness of joy. In your right hand there are pleasures forever more.',
    explanation:
      'Fullness of joy is a place — His presence. Not a feeling to chase, but a Person to be near. The right hand is the place of honor, of power, of permanent pleasure.',
    questions: [
      'Where have you sought fullness of joy that left you empty?',
      'How is joy a fruit of presence, not effort?',
      'What does "pleasures forever more" tell you about heaven\'s nature?',
    ],
  },
  {
    ref: 'Habakkuk 3:17–18',
    bookId: 'HAB',
    chapter: 3,
    verse: 17,
    text: 'For though the fig tree doesn\'t flourish, nor fruit be in the vines, the labor of the olive fails, the fields yield no food, the flocks are cut off from the fold, and there is no herd in the stalls: yet I will rejoice in Yahweh. I will be joyful in the God of my salvation!',
    explanation:
      'Even when every source of provision fails — Habakkuk worships. Joy is not in the harvest; joy is in the God of the harvest. This is faith stripped of every prop except the Person.',
    questions: [
      'What "fig tree" of yours is not flourishing right now?',
      'What stands between you and saying "yet I will rejoice"?',
      'How is this verse different from forced positivity?',
    ],
  },
  {
    ref: 'Matthew 16:26',
    bookId: 'MAT',
    chapter: 16,
    verse: 26,
    text: '"For what will it profit a man, if he gains the whole world, and forfeits his life? Or what will a man give in exchange for his life?"',
    explanation:
      'A person\'s soul is more valuable than every other asset combined. The world is the trade everyone is making. Jesus warns: the deal will not be worth it.',
    questions: [
      'What "world" are you tempted to trade your soul for?',
      'How is success without Christ a loss disguised as a gain?',
      'What would change if eternity weighed more than today in your decisions?',
    ],
  },
  {
    ref: 'Colossians 3:1–2',
    bookId: 'COL',
    chapter: 3,
    verse: 1,
    text: 'If then you were raised together with Christ, seek the things that are above, where Christ is, seated on the right hand of God. Set your mind on the things that are above, not on the things that are on the earth.',
    explanation:
      'Resurrection is not future for the believer — it has happened already (positionally). Therefore: seek above, set your mind above. The verb is intentional thinking, not drifting.',
    questions: [
      'What "earthly things" are crowding your mental space?',
      'What does it mean that you have ALREADY been raised with Him?',
      'How can you re-set your mind in the morning?',
    ],
  },
  {
    ref: 'Isaiah 40:31',
    bookId: 'ISA',
    chapter: 40,
    verse: 31,
    text: 'But those who wait for Yahweh will renew their strength. They will mount up with wings like eagles. They will run, and not be weary. They will walk, and not faint.',
    explanation:
      'Waiting in Hebrew (qavah) means binding by twisting threads — actively trusting, not passively idling. The promise is renewed strength, not no-strength-needed. Eagles, runners, walkers — every speed of obedience.',
    questions: [
      'What are you waiting on God for right now?',
      'How is biblical waiting active, not passive?',
      'In what season are you currently — flying, running, or walking?',
    ],
  },
  {
    ref: 'Romans 15:13',
    bookId: 'ROM',
    chapter: 15,
    verse: 13,
    text: 'Now may the God of hope fill you with all joy and peace in believing, that you may abound in hope, in the power of the Holy Spirit.',
    explanation:
      'God Himself is the God of hope — not just the giver of it. Joy and peace are the byproducts of believing. Hope abounds (overflows) by the Spirit\'s power, not your effort to muster it.',
    questions: [
      'What does it mean that hope is sourced in His power, not your optimism?',
      'How does believing produce joy and peace, in that order?',
      'Where do you most need hope to abound right now?',
    ],
  },
  {
    ref: 'Ephesians 6:12',
    bookId: 'EPH',
    chapter: 6,
    verse: 12,
    text: 'For our wrestling is not against flesh and blood, but against the principalities, against the powers, against the world\'s rulers of the darkness of this age, and against the spiritual forces of wickedness in the heavenly places.',
    explanation:
      'The real enemy is not the difficult person. Behind every visible conflict is an invisible one. Spiritual warfare is real, intelligent, organized — and outmatched by Christ.',
    questions: [
      'Whom in your life have you been treating as the enemy when they are not?',
      'How does seeing the spiritual layer change how you respond?',
      'How does Eph 6:13–18 equip you for this fight?',
    ],
  },
  {
    ref: 'John 4:13–14',
    bookId: 'JHN',
    chapter: 4,
    verse: 13,
    text: 'Jesus answered her, "Everyone who drinks of this water will thirst again, but whoever drinks of the water that I will give him will never thirst again; but the water that I will give him will become in him a well of water springing up to eternal life."',
    explanation:
      'Spoken to a Samaritan woman at a literal well. Religious systems and worldly pleasures are buckets — temporary. Jesus is a spring within. Internal source, not external supply.',
    questions: [
      'What well are you returning to that always leaves you thirsty again?',
      'How is the Spirit a "spring within" in your daily life?',
      'What does this say about religious activity vs. relational life with Christ?',
    ],
  },
  {
    ref: '1 Timothy 2:5–6',
    bookId: '1TI',
    chapter: 2,
    verse: 5,
    text: 'For there is one God, and one mediator between God and men, the man Christ Jesus, who gave himself as a ransom for all; the testimony in its own times.',
    explanation:
      'One Mediator. Not Mary, not the saints, not a priest — one. He is uniquely qualified because He is fully God and fully man. The mediator must touch both sides.',
    questions: [
      'Who or what do you tend to put between yourself and God?',
      'Why does the mediator need to be both God AND man?',
      'How is "ransom for all" both a reach and a real payment?',
    ],
  },
  {
    ref: 'Psalm 73:25–26',
    bookId: 'PSA',
    chapter: 73,
    verse: 25,
    text: 'Whom do I have in heaven? There is no one on earth whom I desire besides you. My flesh and my heart fails, but God is the strength of my heart and my portion forever.',
    explanation:
      'Asaph almost lost his faith watching the wicked prosper (73:2). Then he went into the sanctuary and saw the end of it all. He emerges with God Himself as the prize, not the gifts.',
    questions: [
      'Have you fallen into envying the world\'s prosperity?',
      'What is your "portion" — what you ultimately want?',
      'How is God Himself the gift, not just the giver?',
    ],
  },
  {
    ref: 'Hebrews 9:27–28',
    bookId: 'HEB',
    chapter: 9,
    verse: 27,
    text: 'Inasmuch as it is appointed for men to die once, and after this, judgment, so Christ also, having been offered once to bear the sins of many, will appear a second time, without sin, to those who are eagerly waiting for him for salvation.',
    explanation:
      'No reincarnation. One life, one death, one judgment. Christ also died once — sufficient, final. He returns not to deal with sin again, but to bring final salvation.',
    questions: [
      'How does "appointed once to die" reframe how you spend today?',
      'Why is Christ\'s second coming for those "eagerly waiting" — and are you?',
      'What does the once-for-all nature of His death do to recurring guilt?',
    ],
  },
  {
    ref: 'Mark 1:14–15',
    bookId: 'MRK',
    chapter: 1,
    verse: 14,
    text: 'Now after John was taken into custody, Jesus came into Galilee, preaching the Good News of the Kingdom of God, and saying, "The time is fulfilled, and God\'s Kingdom is at hand! Repent, and believe in the Good News."',
    explanation:
      'Jesus\' very first preached message. Two commands: repent and believe. Not "behave better" — change your mind, then trust the news. The kingdom has arrived in His person.',
    questions: [
      'When was the last time you repented — not just felt sorry, but changed your mind?',
      'What "good news" do you need to actually believe today?',
      'How is the kingdom both at hand AND not yet?',
    ],
  },
  {
    ref: '2 Corinthians 5:21',
    bookId: '2CO',
    chapter: 5,
    verse: 21,
    text: 'For him who knew no sin he made to be sin on our behalf; so that in him we might become the righteousness of God.',
    explanation:
      'The Great Exchange. Jesus, who knew no sin, was treated as sin so that we, who know sin, might become righteousness. Not just forgiven — counted righteous.',
    questions: [
      'How does "becoming the righteousness of God" go beyond forgiveness?',
      'Why is it crucial that He "knew no sin"?',
      'What changes when you stop trying to be righteous and start receiving His?',
    ],
  },
  {
    ref: 'Proverbs 16:9',
    bookId: 'PRO',
    chapter: 16,
    verse: 9,
    text: 'A man\'s heart plans his course, but Yahweh directs his steps.',
    explanation:
      'You plan; God directs. Both are real. Not fatalism (don\'t plan), not autonomy (your plans win) — partnership where He has final say. Hold plans loosely; trust steps tightly.',
    questions: [
      'What plan do you need to surrender to His direction?',
      'How is planning a good thing, even when steps are redirected?',
      'When has a redirected step turned out better than your plan?',
    ],
  },
  {
    ref: 'Psalm 90:12',
    bookId: 'PSA',
    chapter: 90,
    verse: 12,
    text: 'So teach us to count our days, that we may gain a heart of wisdom.',
    explanation:
      'Wisdom begins with mortality awareness. Moses asks God to teach this counting — it does not come naturally. Knowing days are numbered is the start of using them well.',
    questions: [
      'If you knew you had a year left, what would change today?',
      'Why is awareness of death a path to wisdom, not depression?',
      'How are you currently spending the days you have?',
    ],
  },
  {
    ref: 'Hebrews 10:24–25',
    bookId: 'HEB',
    chapter: 10,
    verse: 24,
    text: 'Let\'s consider how to provoke one another to love and good works, not forsaking our own assembling together, as the custom of some is, but exhorting one another, and so much the more, as you see the Day approaching.',
    explanation:
      'The Christian life is corporate. "Provoke" means to stir up — gathered believers should energize each other toward love and good works. Lone-ranger Christianity is unbiblical.',
    questions: [
      'Are you regularly gathered with other believers — not just attending, but engaged?',
      'Who is currently provoking you toward love and good works?',
      'Whom are you provoking?',
    ],
  },
  {
    ref: 'Daniel 3:17–18',
    bookId: 'DAN',
    chapter: 3,
    verse: 17,
    text: '"If it happens, our God whom we serve is able to deliver us from the burning fiery furnace; and he will deliver us out of your hand, O king. But if not, let it be known to you, O king, that we will not serve your gods, nor worship the golden image which you have set up."',
    explanation:
      'Three Hebrew exiles, facing fire. They believe God CAN deliver, hope He WILL — and will obey even if He DOES NOT. This is the highest faith: obedience without conditions.',
    questions: [
      'What "fiery furnace" do you face right now?',
      'Is your faith conditional on God doing what you want?',
      'What "even if not" do you need to surrender to today?',
    ],
  },
  {
    ref: 'Isaiah 6:8',
    bookId: 'ISA',
    chapter: 6,
    verse: 8,
    text: 'I heard the Lord\'s voice, saying, "Whom shall I send, and who will go for us?" Then I said, "Here I am. Send me!"',
    explanation:
      'Spoken AFTER Isaiah saw God\'s holiness, AFTER his uncleanness was burned away with a coal. Mission flows from worship and forgiveness. The "send me" of someone who has been cleansed first.',
    questions: [
      'Have you skipped the worship and cleansing on the way to "go"?',
      'What is God currently asking you to volunteer for?',
      'Why does seeing God\'s holiness produce missionary willingness?',
    ],
  },
  {
    ref: 'Luke 19:10',
    bookId: 'LUK',
    chapter: 19,
    verse: 10,
    text: '"For the Son of Man came to seek and to save that which was lost."',
    explanation:
      'Jesus\' mission statement. Not to be admired. Not to give moral examples. To seek (active pursuit) and to save (effective rescue) the lost. He came for the people you might have given up on.',
    questions: [
      'Whom in your life have you given up on that He has not?',
      'Why does He seek before He saves?',
      'How is your view of "the lost" different after this verse?',
    ],
  },
  {
    ref: 'Acts 2:38',
    bookId: 'ACT',
    chapter: 2,
    verse: 38,
    text: 'Peter said to them, "Repent, and be baptized, every one of you, in the name of Jesus Christ for the forgiveness of sins, and you will receive the gift of the Holy Spirit."',
    explanation:
      'Pentecost crowd, cut to the heart, asks "what shall we do?" Peter\'s answer: repent, be baptized, receive the Spirit. Not three steps to earn salvation — the right response to the gospel they just heard.',
    questions: [
      'Have you been baptized — and what did (or would) that step mean as a public response to the gospel?',
      'How is repentance a daily life-direction, not just a one-time prayer?',
      'What does receiving the Spirit mean for everyday life?',
    ],
  },
  {
    ref: '1 John 5:4–5',
    bookId: '1JN',
    chapter: 5,
    verse: 4,
    text: 'For whatever is born of God overcomes the world. This is the victory that has overcome the world: your faith. Who is he who overcomes the world, but he who believes that Jesus is the Son of God?',
    explanation:
      'The world overcomes most. But faith in Jesus overcomes the world. Note the perfect tense: "has overcome." The fight is real, but the outcome is settled in Christ.',
    questions: [
      'Where is the world currently winning in your life?',
      'How is faith itself the victory, not just the path to it?',
      'How does belief in His Sonship specifically overcome?',
    ],
  },
  {
    ref: 'Revelation 3:20',
    bookId: 'REV',
    chapter: 3,
    verse: 20,
    text: '"Behold, I stand at the door and knock. If anyone hears my voice and opens the door, then I will come in to him, and will dine with him, and he with me."',
    explanation:
      'Spoken to the LUKEWARM CHURCH at Laodicea — not to outsiders. Christ stands outside His own church, knocking. The application is shocking: He may be outside the door of an "active" believer\'s heart.',
    questions: [
      'Are there rooms in your life where He has been kept outside?',
      'What does it mean that He invites you to dine — intimate fellowship?',
      'Why is this verse harder when read in its Laodicean context?',
    ],
  },
  {
    ref: 'Psalm 34:8',
    bookId: 'PSA',
    chapter: 34,
    verse: 8,
    text: 'Oh taste and see that Yahweh is good. Blessed is the man who takes refuge in him.',
    explanation:
      'Don\'t just hear about Him — taste. The proof of God is experiential, not merely propositional. The blessing comes to those who actually run to Him for refuge.',
    questions: [
      'What does it mean to "taste" His goodness practically?',
      'Where have you settled for hearing-about instead of tasting?',
      'What refuge is He calling you to take today?',
    ],
  },
  {
    ref: 'John 17:3',
    bookId: 'JHN',
    chapter: 17,
    verse: 3,
    text: '"This is eternal life, that they should know you, the only true God, and him whom you sent, Jesus Christ."',
    explanation:
      'Jesus defines eternal life Himself. Not "going to heaven when you die" — knowing the only true God and the Christ He sent. Eternal life is relational, and it starts now.',
    questions: [
      'How does this definition challenge a heaven-as-destination-only view?',
      'Are you growing in knowing Him, or just knowing about Him?',
      'What does it mean that knowing Him IS eternal life?',
    ],
  },
  {
    ref: 'Romans 12:9–10',
    bookId: 'ROM',
    chapter: 12,
    verse: 9,
    text: 'Let love be without hypocrisy. Abhor that which is evil. Cling to that which is good. In love of the brothers be tenderly affectionate to one another; in honor preferring one another.',
    explanation:
      'Real love hates evil and clings to good — moral edges, not just niceness. "Tenderly affectionate" is family language. "Preferring one another" means putting their honor before yours.',
    questions: [
      'Where is your love currently hypocritical (performing without substance)?',
      'What evil are you tolerating that love calls you to abhor?',
      'In what relationship do you need to prefer the other\'s honor over your own?',
    ],
  },
]

if (process.env.NODE_ENV !== 'production') {
  // Sanity assertions during dev
  const slugs = new Set()
  for (const v of VERSES) {
    const key = `${v.bookId}.${v.chapter}.${v.verse}`
    if (slugs.has(key)) {
      console.warn('[verse-of-the-day] duplicate:', key)
    }
    slugs.add(key)
  }
}
