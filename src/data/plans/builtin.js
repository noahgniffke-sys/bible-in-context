// Built-in Bible plans — bundled, offline-first, focused on Christ.
// Each passage has a `ref` (display label) and bookId + chapter (+ optional verse) for nav.
// Reflections are written to drive textual understanding, not sentiment.

export const BUILT_IN_PLANS = [
  // ──────────────────────────────────────────────────────────────────
  {
    slug: 'gospel-of-john',
    title: 'The Gospel of John',
    emoji: '✝️',
    category: 'book_study',
    description:
      'A 21-day walk through the only Gospel written so "you may believe that Jesus is the Christ, the Son of God" (John 20:31). One chapter a day.',
    days: [
      { day: 1, title: 'The Word Made Flesh', passages: [{ ref: 'John 1', bookId: 'JHN', chapter: 1 }], reflection: 'John opens echoing Genesis 1:1. Notice the four claims about the Word in 1:1–3, 14: He was, He was with God, He was God, He became flesh.' },
      { day: 2, title: 'First Sign and Cleansing the Temple', passages: [{ ref: 'John 2', bookId: 'JHN', chapter: 2 }], reflection: 'The water-to-wine miracle and the temple cleansing both reveal the same truth: Jesus has authority over the old order. What old wineskin is being replaced?' },
      { day: 3, title: 'Born Again — Nicodemus', passages: [{ ref: 'John 3', bookId: 'JHN', chapter: 3 }], reflection: 'Compare 3:14–15 with Numbers 21:4–9. Why must the Son of Man be "lifted up"? What does verse 16 say the Father did because He loved the world?' },
      { day: 4, title: 'Living Water — The Samaritan Woman', passages: [{ ref: 'John 4', bookId: 'JHN', chapter: 4 }], reflection: 'Jesus crosses ethnic, gender, and moral boundaries to reach one woman. He also openly identifies as Messiah (4:26). Why this woman, in this place, first?' },
      { day: 5, title: 'The Son\'s Authority', passages: [{ ref: 'John 5', bookId: 'JHN', chapter: 5 }], reflection: 'Read 5:19–29 carefully. List every claim Jesus makes about Himself and His relationship to the Father. These are claims to deity, not just messiahship.' },
      { day: 6, title: 'Bread of Life', passages: [{ ref: 'John 6', bookId: 'JHN', chapter: 6 }], reflection: 'After feeding 5,000, Jesus loses most of His followers (6:60–66) when He calls Himself the bread that must be eaten. What does He mean — and what would you have done?' },
      { day: 7, title: 'Living Water at the Feast', passages: [{ ref: 'John 7', bookId: 'JHN', chapter: 7 }], reflection: 'Jesus speaks at the Feast of Tabernacles, the time when water was poured out at the altar. He claims to be the source. What is verse 39 telling us about the Spirit?' },
      { day: 8, title: 'Light of the World', passages: [{ ref: 'John 8', bookId: 'JHN', chapter: 8 }], reflection: 'In 8:58 Jesus says "before Abraham was, I am" — using the divine name from Exodus 3:14. The crowd picks up stones. Why?' },
      { day: 9, title: 'Healing the Man Born Blind', passages: [{ ref: 'John 9', bookId: 'JHN', chapter: 9 }], reflection: 'The blind man comes to greater and greater clarity about who Jesus is (9:11, 9:17, 9:33, 9:38). The Pharisees move the opposite direction. Where are you on that line?' },
      { day: 10, title: 'The Good Shepherd', passages: [{ ref: 'John 10', bookId: 'JHN', chapter: 10 }], reflection: 'Compare to Ezekiel 34. Jesus is the shepherd God promised when Israel\'s leaders failed. What does He do for His sheep that hirelings will not?' },
      { day: 11, title: 'Resurrection and Life — Lazarus', passages: [{ ref: 'John 11', bookId: 'JHN', chapter: 11 }], reflection: 'Jesus weeps (11:35) at a tomb He is about to empty. What does this reveal about Him — that He grieves death even though He has authority over it?' },
      { day: 12, title: 'Anointed for Burial', passages: [{ ref: 'John 12', bookId: 'JHN', chapter: 12 }], reflection: 'Mary anoints His feet, the crowd cries Hosanna, and Jesus says His soul is troubled (12:27). The cross is in view. What does 12:24 promise about death and fruit?' },
      { day: 13, title: 'The Servant King', passages: [{ ref: 'John 13', bookId: 'JHN', chapter: 13 }], reflection: 'The Lord washes His servants\' feet (13:1–17). New commandment in 13:34. How is "love one another as I have loved you" a higher standard than "love your neighbor as yourself"?' },
      { day: 14, title: 'I Am the Way', passages: [{ ref: 'John 14', bookId: 'JHN', chapter: 14 }], reflection: '"No one comes to the Father except through me" (14:6). Jesus is exclusive — not one way among many. Sit with that claim.' },
      { day: 15, title: 'The True Vine', passages: [{ ref: 'John 15', bookId: 'JHN', chapter: 15 }], reflection: 'Abide. Apart from Him you can do nothing (15:5). What does fruitlessness say about a branch (15:6)?' },
      { day: 16, title: 'The Helper', passages: [{ ref: 'John 16', bookId: 'JHN', chapter: 16 }], reflection: 'It is to your advantage that I go away (16:7). Why is the Spirit\'s coming better than Jesus\' bodily presence with the disciples?' },
      { day: 17, title: 'The High Priestly Prayer', passages: [{ ref: 'John 17', bookId: 'JHN', chapter: 17 }], reflection: 'Jesus prays for you (17:20). Read it as if hearing your name. What does He ask the Father for, on your behalf?' },
      { day: 18, title: 'Arrest and Trial', passages: [{ ref: 'John 18', bookId: 'JHN', chapter: 18 }], reflection: 'When the soldiers come, Jesus says "I am he" — and they fall to the ground (18:6). Even now, He is in command. He lays His life down willingly (10:18).' },
      { day: 19, title: 'The Crucifixion', passages: [{ ref: 'John 19', bookId: 'JHN', chapter: 19 }], reflection: '"It is finished" (19:30) — tetelestai, "paid in full." What is finished? Read Hebrews 10:11–14 alongside.' },
      { day: 20, title: 'He Is Risen', passages: [{ ref: 'John 20', bookId: 'JHN', chapter: 20 }], reflection: 'Thomas calls the risen Jesus "my Lord and my God" (20:28) and is not corrected. The book\'s purpose is stated in 20:30–31. Has it accomplished its purpose in you?' },
      { day: 21, title: 'Restoration of Peter', passages: [{ ref: 'John 21', bookId: 'JHN', chapter: 21 }], reflection: 'Three denials, three "do you love me?" Peter is restored, recommissioned, and told how he will die. Following Jesus is not safe. It is, however, true.' },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  {
    slug: 'sermon-on-the-mount',
    title: 'The Sermon on the Mount',
    emoji: '⛰️',
    category: 'devotional',
    description:
      'Seven days through Matthew 5–7 — the most concentrated teaching of Jesus on what life in His kingdom actually looks like.',
    days: [
      { day: 1, title: 'The Beatitudes', passages: [{ ref: 'Matthew 5:1–12', bookId: 'MAT', chapter: 5 }], reflection: 'Each beatitude inverts the world\'s definition of blessed. Mourning, meekness, persecution — Jesus calls these the path to true happiness. Which of these do you most resist?' },
      { day: 2, title: 'Salt, Light, and the Law', passages: [{ ref: 'Matthew 5:13–20', bookId: 'MAT', chapter: 5, verse: 13 }], reflection: 'Jesus did not come to abolish the law but to fulfill it (5:17). Your righteousness must exceed the Pharisees\' (5:20). How does that drive you to depend on the righteousness Christ provides rather than the kind you can produce?' },
      { day: 3, title: 'The Heart of the Law', passages: [{ ref: 'Matthew 5:21–48', bookId: 'MAT', chapter: 5, verse: 21 }], reflection: 'Murder lives in anger. Adultery lives in the lustful glance. The law goes deeper than behavior. It indicts the heart — and drives us to grace.' },
      { day: 4, title: 'Hidden Religion', passages: [{ ref: 'Matthew 6:1–18', bookId: 'MAT', chapter: 6 }], reflection: 'Giving, praying, fasting — done for the Father\'s eyes, not the crowd\'s. Where is your secret reward chasing you to? Audit your motives.' },
      { day: 5, title: 'Treasure and Worry', passages: [{ ref: 'Matthew 6:19–34', bookId: 'MAT', chapter: 6, verse: 19 }], reflection: 'You cannot serve God and money (6:24). Worry is functional atheism — it doubts the Father\'s care. Seek the kingdom first (6:33).' },
      { day: 6, title: 'Judging, Asking, the Golden Rule', passages: [{ ref: 'Matthew 7:1–12', bookId: 'MAT', chapter: 7 }], reflection: 'Take the log out first. Ask, seek, knock — your Father gives good gifts. The whole law sums up in 7:12.' },
      { day: 7, title: 'Two Ways, Two Foundations', passages: [{ ref: 'Matthew 7:13–29', bookId: 'MAT', chapter: 7, verse: 13 }], reflection: 'Narrow is the gate. Many will say "Lord, Lord" (7:21–23) and not enter. Hearing without doing is sand (7:24–27). Hear and do.' },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  {
    slug: 'i-am-statements',
    title: 'The "I AM" Statements of Jesus',
    emoji: '🕊️',
    category: 'devotional',
    description:
      'Seven days on the seven "I am" sayings in John — each one a self-revelation of Christ that connects back to Exodus 3:14.',
    days: [
      { day: 1, title: 'I Am the Bread of Life', passages: [{ ref: 'John 6:25–59', bookId: 'JHN', chapter: 6, verse: 25 }], reflection: 'Manna kept Israel alive a day at a time and they still died. Jesus is the bread that gives eternal life. What hunger are you trying to satisfy with anything else?' },
      { day: 2, title: 'I Am the Light of the World', passages: [{ ref: 'John 8:12–30', bookId: 'JHN', chapter: 8, verse: 12 }], reflection: 'Spoken at the Feast of Tabernacles, when great lamps lit the temple court at night. Jesus claims to be the light that pillar of fire pointed to (Exodus 13:21).' },
      { day: 3, title: 'I Am the Door', passages: [{ ref: 'John 10:1–10', bookId: 'JHN', chapter: 10 }], reflection: 'Jesus is not "a way in" — He is the door. Anyone who climbs in another way is a thief (10:1). Salvation comes through Him alone (10:9).' },
      { day: 4, title: 'I Am the Good Shepherd', passages: [{ ref: 'John 10:11–18', bookId: 'JHN', chapter: 10, verse: 11 }], reflection: 'The hireling runs. The Good Shepherd lays down His life for the sheep. He knows His own by name. Are you among them?' },
      { day: 5, title: 'I Am the Resurrection and the Life', passages: [{ ref: 'John 11:17–44', bookId: 'JHN', chapter: 11, verse: 17 }], reflection: 'Spoken to a grieving sister at a tomb. Jesus does not just bring resurrection later — He IS the resurrection now. Death does not have the last word.' },
      { day: 6, title: 'I Am the Way, the Truth, and the Life', passages: [{ ref: 'John 14:1–14', bookId: 'JHN', chapter: 14 }], reflection: '"No one comes to the Father except through me." This is the most exclusive claim Jesus makes. Modern pluralism cannot survive this verse.' },
      { day: 7, title: 'I Am the True Vine', passages: [{ ref: 'John 15:1–17', bookId: 'JHN', chapter: 15 }], reflection: 'Israel was the vine that failed (Isaiah 5). Jesus is the true Vine. Abide in Him — apart from Him you can do nothing (15:5).' },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  {
    slug: 'crucifixion-to-resurrection',
    title: 'Crucifixion to Resurrection',
    emoji: '✝️',
    category: 'devotional',
    description:
      'Seven days walking the final week of Jesus — from triumphal entry to empty tomb — across all four Gospels.',
    days: [
      { day: 1, title: 'Triumphal Entry', passages: [{ ref: 'Matthew 21:1–17', bookId: 'MAT', chapter: 21 }], reflection: 'Jesus enters on a donkey, fulfilling Zechariah 9:9. The crowd cries "Hosanna" — "save us." Within a week the same crowd will cry "Crucify."' },
      { day: 2, title: 'The Last Supper', passages: [{ ref: 'John 13:1–30', bookId: 'JHN', chapter: 13 }, { ref: 'Luke 22:14–23', bookId: 'LUK', chapter: 22, verse: 14 }], reflection: 'On the night He was betrayed, He washed feet and instituted the New Covenant in His blood. The bread and the cup announce His death until He comes (1 Cor 11:26).' },
      { day: 3, title: 'Gethsemane and Arrest', passages: [{ ref: 'Matthew 26:36–56', bookId: 'MAT', chapter: 26, verse: 36 }], reflection: '"Not as I will, but as you will" (26:39). The cup represents the judgment against sin (Isaiah 51:17). Jesus willingly drinks it in our place — bearing what we could not bear.' },
      { day: 4, title: 'The Trial', passages: [{ ref: 'John 18:28 – 19:16', bookId: 'JHN', chapter: 18, verse: 28 }], reflection: 'Pilate finds no fault (18:38). Jesus stays silent before His accusers (Isaiah 53:7). The innocent King is condemned in our place.' },
      { day: 5, title: 'The Crucifixion', passages: [{ ref: 'Luke 23:32–49', bookId: 'LUK', chapter: 23, verse: 32 }], reflection: '"Father, forgive them" (23:34). "Today you will be with me in paradise" (23:43). Even at His most broken, He saves. Read Isaiah 53 alongside.' },
      { day: 6, title: 'The Burial', passages: [{ ref: 'Matthew 27:57–66', bookId: 'MAT', chapter: 27, verse: 57 }], reflection: 'Sealed in a borrowed tomb, guarded by Roman soldiers. Heaven held its breath. "He descended" (Eph 4:9). Saturday is part of the gospel.' },
      { day: 7, title: 'The Resurrection', passages: [{ ref: 'John 20', bookId: 'JHN', chapter: 20 }, { ref: 'Matthew 28', bookId: 'MAT', chapter: 28 }], reflection: 'If Christ is not raised, our faith is futile (1 Cor 15:17). But He IS risen. The tomb is empty. Death has been defeated.' },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  {
    slug: 'parables-of-jesus',
    title: 'Parables of Jesus',
    emoji: '🌾',
    category: 'devotional',
    description:
      'Ten of Jesus\' parables — short stories that hide truth from the proud and reveal it to the humble (Matthew 13:10–17).',
    days: [
      { day: 1, title: 'The Sower', passages: [{ ref: 'Matthew 13:1–23', bookId: 'MAT', chapter: 13 }], reflection: 'The seed is the word. The soils are hearts. Which soil are you today — and what would it take to be good ground that bears thirty, sixty, a hundredfold?' },
      { day: 2, title: 'The Wheat and the Tares', passages: [{ ref: 'Matthew 13:24–43', bookId: 'MAT', chapter: 13, verse: 24 }], reflection: 'In this age, the church and the world grow together. The separation comes at the harvest. Don\'t panic at hypocrites — Jesus knows His own.' },
      { day: 3, title: 'Mustard Seed and Leaven', passages: [{ ref: 'Matthew 13:31–35', bookId: 'MAT', chapter: 13, verse: 31 }], reflection: 'The kingdom starts hidden and small but grows pervasive. Don\'t despise small beginnings — they have unstoppable trajectory.' },
      { day: 4, title: 'Hidden Treasure, Pearl, and Net', passages: [{ ref: 'Matthew 13:44–52', bookId: 'MAT', chapter: 13, verse: 44 }], reflection: 'The kingdom is worth selling everything else to have. Joy, not duty, drives the merchant. Has Christ become that valuable to you yet?' },
      { day: 5, title: 'Lost Sheep and Lost Coin', passages: [{ ref: 'Luke 15:1–10', bookId: 'LUK', chapter: 15 }], reflection: 'Heaven rejoices over one repenting sinner. The shepherd searches; the woman sweeps. God is not passive about your soul.' },
      { day: 6, title: 'The Prodigal Son', passages: [{ ref: 'Luke 15:11–32', bookId: 'LUK', chapter: 15, verse: 11 }], reflection: 'Two lost sons. The younger by rebellion, the older by religion. The Father runs to both. Which son have you been more often?' },
      { day: 7, title: 'The Good Samaritan', passages: [{ ref: 'Luke 10:25–37', bookId: 'LUK', chapter: 10, verse: 25 }], reflection: 'A despised foreigner shows what neighbor-love looks like. The lawyer wanted to limit "neighbor"; Jesus widens it past the boundary.' },
      { day: 8, title: 'Rich Man and Lazarus', passages: [{ ref: 'Luke 16:19–31', bookId: 'LUK', chapter: 16, verse: 19 }], reflection: 'The first parable Jesus tells with a name in it. Hell is real, conscious, and final. Money\'s comfort here does not transfer there.' },
      { day: 9, title: 'The Talents', passages: [{ ref: 'Matthew 25:14–30', bookId: 'MAT', chapter: 25, verse: 14 }], reflection: 'The Master will return and settle accounts. Faithfulness is measured by stewardship of what He gave you, not by what you wish you had.' },
      { day: 10, title: 'The Sheep and the Goats', passages: [{ ref: 'Matthew 25:31–46', bookId: 'MAT', chapter: 25, verse: 31 }], reflection: 'The eternal divide is real. The marker is not lip-service but lived service to "the least of these brothers of mine" — fellow disciples in need.' },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  {
    slug: 'jesus-in-the-old-testament',
    title: 'Jesus in the Old Testament',
    emoji: '📜',
    category: 'book_study',
    description:
      'Ten days tracing Christ across the Hebrew Scriptures — the Promised Seed, the Passover Lamb, the Suffering Servant. Luke 24:27.',
    days: [
      { day: 1, title: 'The Promised Seed', passages: [{ ref: 'Genesis 3:14–15', bookId: 'GEN', chapter: 3, verse: 14 }], reflection: 'The first gospel — the protoevangelium. The seed of the woman will crush the serpent\'s head and be wounded in the process. The whole Bible flows from here.' },
      { day: 2, title: 'Melchizedek — Priest-King', passages: [{ ref: 'Genesis 14:18–20', bookId: 'GEN', chapter: 14, verse: 18 }, { ref: 'Hebrews 7:1–17', bookId: 'HEB', chapter: 7 }], reflection: 'Hebrews argues Jesus is a priest after Melchizedek\'s order — superior to Aaron, eternal, both king and priest. A type meets its fulfillment.' },
      { day: 3, title: 'The Passover Lamb', passages: [{ ref: 'Exodus 12:1–14', bookId: 'EXO', chapter: 12 }, { ref: '1 Corinthians 5:7', bookId: '1CO', chapter: 5, verse: 7 }], reflection: 'The lamb without blemish, blood on the doorpost, death passes over. "Christ our Passover lamb has been sacrificed" (1 Cor 5:7). Look for the blood.' },
      { day: 4, title: 'The Bronze Serpent', passages: [{ ref: 'Numbers 21:4–9', bookId: 'NUM', chapter: 21 }, { ref: 'John 3:14–15', bookId: 'JHN', chapter: 3, verse: 14 }], reflection: 'Lifted up to be looked at — and whoever looks lives. Jesus says this is a picture of the cross. Faith is a look at the One lifted up.' },
      { day: 5, title: 'The Prophet Like Moses', passages: [{ ref: 'Deuteronomy 18:15–19', bookId: 'DEU', chapter: 18, verse: 15 }, { ref: 'Acts 3:17–26', bookId: 'ACT', chapter: 3, verse: 17 }], reflection: 'Peter identifies Jesus as the prophet Moses promised. To reject Him is to be cut off from the people (Acts 3:23).' },
      { day: 6, title: 'The Suffering Servant', passages: [{ ref: 'Isaiah 52:13 – 53:12', bookId: 'ISA', chapter: 52, verse: 13 }], reflection: 'Written 700 years before the cross. Pierced, crushed, silent before His shearers, numbered with transgressors, buried with the rich. Read it slowly.' },
      { day: 7, title: 'Prince of Peace', passages: [{ ref: 'Isaiah 9:6–7', bookId: 'ISA', chapter: 9, verse: 6 }], reflection: 'A child is born — and called Mighty God, Everlasting Father. The child of the manger and the eternal God are one Person.' },
      { day: 8, title: 'The Branch of David', passages: [{ ref: 'Jeremiah 23:5–6', bookId: 'JER', chapter: 23, verse: 5 }, { ref: 'Isaiah 11:1–10', bookId: 'ISA', chapter: 11 }], reflection: 'A Davidic king who reigns wisely and is named "The LORD our righteousness" (YHWH-Tsidkenu). Kingship and deity in one person.' },
      { day: 9, title: 'The Pierced One', passages: [{ ref: 'Zechariah 12:10', bookId: 'ZEC', chapter: 12, verse: 10 }, { ref: 'John 19:34–37', bookId: 'JHN', chapter: 19, verse: 34 }], reflection: 'YHWH says "they will look on Me, the One they have pierced." John says this was fulfilled at the cross. The Pierced One IS God.' },
      { day: 10, title: 'Sun of Righteousness', passages: [{ ref: 'Malachi 4:1–3', bookId: 'MAL', chapter: 4 }], reflection: 'The last words of the Old Testament point forward to a Sun that rises with healing in His wings. 400 years of silence. Then Bethlehem.' },
    ],
  },
]

export function getBuiltInPlan(slug) {
  return BUILT_IN_PLANS.find(p => p.slug === slug) || null
}

export const BUILT_IN_PROGRESS_KEY = 'bic_builtin_plan_progress'

export function getBuiltInProgress() {
  try {
    const raw = localStorage.getItem(BUILT_IN_PROGRESS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function getCompletedDays(slug) {
  const all = getBuiltInProgress()
  return all[slug]?.completedDays || []
}

export function toggleBuiltInDay(slug, day) {
  const all = getBuiltInProgress()
  const current = all[slug]?.completedDays || []
  const next = current.includes(day) ? current.filter(d => d !== day) : [...current, day]
  all[slug] = { completedDays: next, updatedAt: Date.now() }
  try {
    localStorage.setItem(BUILT_IN_PROGRESS_KEY, JSON.stringify(all))
  } catch {}
  return next
}
