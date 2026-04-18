// Biblical connections — deeper patterns, types, symbols, and thematic links
// Scans verse text for biblical patterns and generates explanatory connections

const BIBLICAL_NUMBERS = {
  '3': 'The number 3 in Scripture represents divine completeness and the Trinity (Father, Son, Holy Spirit). Jesus rose on the 3rd day (1 Corinthians 15:4), was tempted 3 times (Matthew 4:1-11), and Peter denied Him 3 times then was restored 3 times (John 21:15-17).',
  '7': 'The number 7 in Scripture represents spiritual perfection and completion. God rested on the 7th day (Genesis 2:2), there are 7 churches in Revelation (Revelation 1:4), and Jesus taught to forgive 70 times 7 (Matthew 18:22).',
  '12': 'The number 12 in Scripture represents God\'s governmental authority and His people. There were 12 tribes of Israel (Genesis 49), 12 apostles (Matthew 10:1-4), 12 baskets of bread left over (Matthew 14:20), and 12 gates in the New Jerusalem (Revelation 21:12).',
  '40': 'The number 40 in Scripture represents a period of testing, trial, or preparation. It rained 40 days in the flood (Genesis 7:12), Israel wandered 40 years (Numbers 14:33), Moses was on the mountain 40 days (Exodus 24:18), and Jesus fasted 40 days (Matthew 4:2).',
  '70': 'The number 70 represents a complete period of judgment or restoration. Israel spent 70 years in Babylonian captivity (Jeremiah 25:11), and Daniel\'s prophecy speaks of 70 weeks (Daniel 9:24).',
}

const BIBLICAL_SYMBOLS = [
  { pattern: /\b(lamb|lambs)\b/i, symbol: 'Lamb',
    connection: 'The lamb is one of the Bible\'s most important symbols. It points to Christ as "the Lamb of God who takes away the sin of the world" (John 1:29). This imagery connects to the Passover lamb whose blood saved Israel from death (Exodus 12:1-13), the sacrificial lambs of the temple, and Isaiah\'s prophecy of the Suffering Servant "led like a lamb to the slaughter" (Isaiah 53:7). In Revelation, Jesus is worshipped as the Lamb who was slain (Revelation 5:6-12).' },
  { pattern: /\b(bread|loaves|manna)\b/i, symbol: 'Bread',
    connection: 'Bread in Scripture represents God\'s provision and sustenance — both physical and spiritual. God provided manna (bread from heaven) for Israel in the wilderness (Exodus 16). Jesus called Himself "the bread of life" (John 6:35), broke bread at the Last Supper representing His body given for us (Luke 22:19), and fed 5,000 with five loaves (Matthew 14:13-21). The leftover baskets connect to God\'s abundant provision that exceeds our needs.' },
  { pattern: /\b(water|waters|river|rivers|well|fountain|spring)\b/i, symbol: 'Water',
    connection: 'Water in Scripture represents the Holy Spirit, spiritual cleansing, and eternal life. Jesus offered the Samaritan woman "living water" (John 4:10-14), rivers of living water flow from believers (John 7:38-39), and baptism by water symbolizes death to sin and new life in Christ (Romans 6:3-4). Water also represents God\'s Word that washes and renews (Ephesians 5:26).' },
  { pattern: /\b(blood)\b/i, symbol: 'Blood',
    connection: 'Blood in Scripture represents life, atonement, and covenant. "The life of a creature is in the blood" (Leviticus 17:11). The blood of the Passover lamb saved Israel (Exodus 12:13), the Old Covenant was sealed with blood (Exodus 24:8), and Jesus\' blood established the New Covenant for the forgiveness of sins (Matthew 26:28, Hebrews 9:22). "Without the shedding of blood there is no forgiveness" (Hebrews 9:22).' },
  { pattern: /\b(light|lamp|lamps|candle|shine|shining)\b/i, symbol: 'Light',
    connection: 'Light in Scripture represents God\'s truth, presence, and righteousness. God\'s first creation was light (Genesis 1:3), Jesus declared "I am the light of the world" (John 8:12), and believers are called to be "the light of the world" (Matthew 5:14). Light exposes darkness (John 3:19-21) and God Himself is light with no darkness at all (1 John 1:5).' },
  { pattern: /\b(shepherd|shepherds|flock|sheep|pasture)\b/i, symbol: 'Shepherd',
    connection: 'The shepherd image represents God\'s loving care and guidance for His people. The Lord is our shepherd (Psalm 23:1), Jesus is "the good shepherd" who lays down His life for the sheep (John 10:11), and He is the "great Shepherd of the sheep" (Hebrews 13:20). Jesus also described seeking one lost sheep out of 100 (Luke 15:3-7), showing God\'s pursuit of every individual.' },
  { pattern: /\b(vine|branches|fruit|tree|trees|root|roots)\b/i, symbol: 'Vine/Tree',
    connection: 'Vines and trees in Scripture represent life, fruitfulness, and spiritual connection. Jesus said "I am the vine; you are the branches" (John 15:5), teaching that spiritual fruit comes only from abiding in Him. The righteous are "like a tree planted by streams of water" (Psalm 1:3). The tree of life appears in both Genesis (2:9) and Revelation (22:2), bookending the Bible\'s story of redemption.' },
  { pattern: /\b(rock|stone|stones|cornerstone|foundation)\b/i, symbol: 'Rock/Stone',
    connection: 'Rock and stone in Scripture represent stability, Christ, and foundation. God is called "the Rock" (Deuteronomy 32:4), Christ is the "cornerstone" (Ephesians 2:20, 1 Peter 2:6), and believers are "living stones" built into a spiritual house (1 Peter 2:5). Jesus told Peter "on this rock I will build my church" (Matthew 16:18) and warned about building on sand versus rock (Matthew 7:24-27).' },
  { pattern: /\b(fire|flame|flames|burn|burning)\b/i, symbol: 'Fire',
    connection: 'Fire in Scripture represents God\'s presence, purification, and judgment. God appeared to Moses in a burning bush (Exodus 3:2), led Israel as a pillar of fire (Exodus 13:21), and the Holy Spirit came as tongues of fire at Pentecost (Acts 2:3). Fire also refines and purifies faith (1 Peter 1:7) and represents God\'s judgment (Hebrews 12:29).' },
  { pattern: /\b(oil|anoint|anointed|anointing)\b/i, symbol: 'Oil/Anointing',
    connection: 'Oil in Scripture represents the Holy Spirit and divine commissioning. Kings, priests, and prophets were anointed with oil (1 Samuel 16:13). "Christ" (Christos) and "Messiah" (Mashiach) both mean "Anointed One." The oil of gladness (Psalm 45:7), the wise virgins with oil (Matthew 25:1-13), and anointing the sick (James 5:14) all point to the Spirit\'s empowering presence.' },
  { pattern: /\b(seed|seeds|sow|sown|sower|harvest|reap)\b/i, symbol: 'Seed/Harvest',
    connection: 'Seeds and harvest in Scripture represent God\'s Word, faith, and spiritual outcomes. Jesus taught the Parable of the Sower (Matthew 13:1-23) where the seed is God\'s Word falling on different hearts. Paul taught "a man reaps what he sows" (Galatians 6:7) and that Christ\'s death was like a seed falling into the ground to bear fruit (John 12:24). The final harvest represents God\'s judgment (Revelation 14:15).' },
  { pattern: /\b(bride|bridegroom|wedding|marriage|husband|wife)\b/i, symbol: 'Marriage/Bride',
    connection: 'Marriage in Scripture represents the covenant relationship between Christ and His Church. The Church is called the "bride of Christ" (Ephesians 5:25-32, Revelation 19:7-9). Jesus\' first miracle was at a wedding (John 2:1-11), He told parables about wedding feasts (Matthew 22:1-14, 25:1-13), and Scripture ends with the marriage supper of the Lamb (Revelation 19:9).' },
  { pattern: /\b(temple|tabernacle|sanctuary|holy place|dwelling)\b/i, symbol: 'Temple',
    connection: 'The temple represents God\'s dwelling among His people. The tabernacle was where God\'s presence dwelt with Israel (Exodus 25:8). Solomon built the temple (1 Kings 6), Jesus called His body a temple (John 2:19-21), and believers are now the temple of the Holy Spirit (1 Corinthians 6:19). In the New Jerusalem, God Himself is the temple (Revelation 21:22).' },
  { pattern: /\b(wilderness|desert)\b/i, symbol: 'Wilderness',
    connection: 'The wilderness in Scripture represents a place of testing, dependence on God, and preparation. Israel wandered 40 years in the wilderness learning to trust God (Deuteronomy 8:2). Jesus was tested 40 days in the wilderness (Matthew 4:1-11). God often leads His people through wilderness seasons to deepen their faith before bringing them into promised blessings.' },
  { pattern: /\b(cross|crucified|crucify|crucifixion)\b/i, symbol: 'Cross',
    connection: 'The cross represents the heart of the gospel — where God\'s justice and mercy meet. Christ "became a curse for us" on the cross (Galatians 3:13), reconciling God and man (2 Corinthians 5:18-19). Jesus calls believers to "take up their cross" and follow Him (Matthew 16:24), meaning dying to self and living for God. The cross is foolishness to the world but the power of God to those being saved (1 Corinthians 1:18).' },
  { pattern: /\b(covenant|promise|oath|swear|swore)\b/i, symbol: 'Covenant',
    connection: 'Covenants are binding agreements that structure God\'s relationship with humanity. God made covenants with Noah (Genesis 9:8-17), Abraham (Genesis 15), Moses/Israel (Exodus 19-24), and David (2 Samuel 7). Jesus established the New Covenant through His blood (Luke 22:20, Hebrews 8:6-13), fulfilling and surpassing all previous covenants. God is always faithful to His covenant promises.' },
]

export function getBiblicalConnections(verseText, bookId, chapter, verse) {
  if (!verseText) return []
  const v = verseText.toLowerCase()
  const connections = []

  // Check for number patterns
  const numbers = verseText.match(/\b(three|third|seven|seventh|twelve|forty|seventy|3|7|12|40|70)\b/gi)
  if (numbers) {
    const numMap = { 'three': '3', 'third': '3', 'seven': '7', 'seventh': '7', 'twelve': '12', 'forty': '40', 'seventy': '70' }
    const seen = new Set()
    for (const n of numbers) {
      const key = numMap[n.toLowerCase()] || n
      if (BIBLICAL_NUMBERS[key] && !seen.has(key)) {
        seen.add(key)
        connections.push({ title: `The Number ${key} in Scripture`, text: BIBLICAL_NUMBERS[key] })
      }
    }
  }

  // Check for symbol patterns
  for (const sym of BIBLICAL_SYMBOLS) {
    if (sym.pattern.test(verseText)) {
      connections.push({ title: `${sym.symbol} in Scripture`, text: sym.connection })
    }
  }

  // Limit to 3 most relevant connections per verse
  return connections.slice(0, 3)
}
