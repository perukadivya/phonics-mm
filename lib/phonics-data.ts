// Complete, high-quality curated phonics dataset for kids (Ages 3-8)
// 100% reliable offline & instant fallback for AI generation

export interface PhonicsLetterItem {
  letter: string
  sound: string
  ipa: string
  word: string
  emoji: string
  secondaryWords: { word: string; emoji: string }[]
  color: string // Tailwind gradient
  rhyme: string
  mouthGuide: string
}

export interface PhonicsWordItem {
  word: string
  sounds: string[]
  emoji: string
  meaning: string
  hint?: string
}

export interface PhonicsSentenceItem {
  sentence: string
  words: string[]
  emoji: string
  difficulty: "easy" | "medium" | "hard"
  translationOrTip?: string
}

export interface PhonicsQuizItem {
  question: string
  type: "multiple-choice" | "spelling"
  options?: string[]
  correct?: number
  answer?: string
  explanation: string
  hint?: string
  soundPrompt?: string
}

export const ALPHABET_DATA: PhonicsLetterItem[] = [
  {
    letter: "A",
    sound: "ah",
    ipa: "/æ/",
    word: "Apple",
    emoji: "🍎",
    secondaryWords: [
      { word: "Ant", emoji: "🐜" },
      { word: "Astronaut", emoji: "👨‍🚀" },
      { word: "Airplane", emoji: "✈️" },
    ],
    color: "from-rose-400 to-red-500",
    rhyme: "A is for Apple, round and sweet! A crunchy red fruit you love to eat!",
    mouthGuide: "Open your mouth wide like you are biting a juicy apple! Say 'ah'!",
  },
  {
    letter: "B",
    sound: "buh",
    ipa: "/b/",
    word: "Ball",
    emoji: "⚽",
    secondaryWords: [
      { word: "Bear", emoji: "🐻" },
      { word: "Banana", emoji: "🍌" },
      { word: "Butterfly", emoji: "🦋" },
    ],
    color: "from-amber-400 to-orange-500",
    rhyme: "B is for Ball that bounces high, up and down into the sky!",
    mouthGuide: "Press both lips together, then pop them open: 'buh'!",
  },
  {
    letter: "C",
    sound: "kuh",
    ipa: "/k/",
    word: "Cat",
    emoji: "🐱",
    secondaryWords: [
      { word: "Car", emoji: "🚗" },
      { word: "Cake", emoji: "🎂" },
      { word: "Cup", emoji: "☕" },
    ],
    color: "from-yellow-400 to-amber-500",
    rhyme: "C is for Cat with whiskers neat, walking soft on tiny feet!",
    mouthGuide: "Lift the back of your tongue to touch the roof of your mouth: 'kuh'!",
  },
  {
    letter: "D",
    sound: "duh",
    ipa: "/d/",
    word: "Dog",
    emoji: "🐶",
    secondaryWords: [
      { word: "Duck", emoji: "🦆" },
      { word: "Dolphin", emoji: "🐬" },
      { word: "Drum", emoji: "🥁" },
    ],
    color: "from-emerald-400 to-teal-500",
    rhyme: "D is for Dog who loves to play, wagging his tail all through the day!",
    mouthGuide: "Tap the tip of your tongue behind your top front teeth: 'duh'!",
  },
  {
    letter: "E",
    sound: "eh",
    ipa: "/e/",
    word: "Elephant",
    emoji: "🐘",
    secondaryWords: [
      { word: "Egg", emoji: "🥚" },
      { word: "Earth", emoji: "🌍" },
      { word: "Eagle", emoji: "🦅" },
    ],
    color: "from-teal-400 to-cyan-500",
    rhyme: "E is for Elephant, big and grand, with a long grey trunk to wave a hand!",
    mouthGuide: "Smile a little and let your tongue sit relaxed: 'eh'!",
  },
  {
    letter: "F",
    sound: "fuh",
    ipa: "/f/",
    word: "Fish",
    emoji: "🐟",
    secondaryWords: [
      { word: "Frog", emoji: "🐸" },
      { word: "Flower", emoji: "🌸" },
      { word: "Fox", emoji: "🦊" },
    ],
    color: "from-cyan-400 to-sky-500",
    rhyme: "F is for Fish who swims so free, splashing around beneath the sea!",
    mouthGuide: "Touch your top teeth gently to your bottom lip and blow air: 'fuh'!",
  },
  {
    letter: "G",
    sound: "guh",
    ipa: "/ɡ/",
    word: "Giraffe",
    emoji: "🦒",
    secondaryWords: [
      { word: "Grapes", emoji: "🍇" },
      { word: "Guitar", emoji: "🎸" },
      { word: "Garden", emoji: "🌻" },
    ],
    color: "from-blue-400 to-indigo-500",
    rhyme: "G is for Giraffe with neck so high, nibbling green leaves near the sky!",
    mouthGuide: "Make a quick throat tap with the back of your tongue: 'guh'!",
  },
  {
    letter: "H",
    sound: "huh",
    ipa: "/h/",
    word: "Hat",
    emoji: "🎩",
    secondaryWords: [
      { word: "Heart", emoji: "❤️" },
      { word: "Horse", emoji: "🐴" },
      { word: "House", emoji: "🏠" },
    ],
    color: "from-indigo-400 to-violet-500",
    rhyme: "H is for Hat you wear with pride, keeping you warm when you play outside!",
    mouthGuide: "Open your mouth and breathe out warm air like fogging a mirror: 'huh'!",
  },
  {
    letter: "I",
    sound: "ih",
    ipa: "/ɪ/",
    word: "Igloo",
    emoji: "🧊",
    secondaryWords: [
      { word: "Iguana", emoji: "🦎" },
      { word: "Island", emoji: "🏝️" },
      { word: "Ink", emoji: "🖋️" },
    ],
    color: "from-violet-400 to-purple-500",
    rhyme: "I is for Igloo, dome of snow, keeping you warm while cold winds blow!",
    mouthGuide: "Pull your lips into a soft smile: 'ih'!",
  },
  {
    letter: "J",
    sound: "juh",
    ipa: "/dʒ/",
    word: "Jellyfish",
    emoji: "🪼",
    secondaryWords: [
      { word: "Juice", emoji: "🧃" },
      { word: "Jet", emoji: "✈️" },
      { word: "Jam", emoji: "🍓" },
    ],
    color: "from-purple-400 to-fuchsia-500",
    rhyme: "J is for Jellyfish dancing bright, glowing and swimming day and night!",
    mouthGuide: "Round your lips forward and push air out: 'juh'!",
  },
  {
    letter: "K",
    sound: "kuh",
    ipa: "/k/",
    word: "Kangaroo",
    emoji: "🦘",
    secondaryWords: [
      { word: "Kite", emoji: "🪁" },
      { word: "Koala", emoji: "🐨" },
      { word: "Key", emoji: "🔑" },
    ],
    color: "from-fuchsia-400 to-pink-500",
    rhyme: "K is for Kangaroo hopping far, jumping as high as a shining star!",
    mouthGuide: "Click the back of your tongue against your soft palate: 'kuh'!",
  },
  {
    letter: "L",
    sound: "luh",
    ipa: "/l/",
    word: "Lion",
    emoji: "🦁",
    secondaryWords: [
      { word: "Leaf", emoji: "🍃" },
      { word: "Lemon", emoji: "🍋" },
      { word: "Lamp", emoji: "💡" },
    ],
    color: "from-pink-400 to-rose-500",
    rhyme: "L is for Lion, brave and bold, with a golden mane of shiny gold!",
    mouthGuide: "Place the tip of your tongue on the roof of your mouth: 'luh'!",
  },
  {
    letter: "M",
    sound: "muh",
    ipa: "/m/",
    word: "Monkey",
    emoji: "🐵",
    secondaryWords: [
      { word: "Moon", emoji: "🌙" },
      { word: "Mango", emoji: "🥭" },
      { word: "Music", emoji: "🎵" },
    ],
    color: "from-rose-400 to-pink-500",
    rhyme: "M is for Monkey swinging fast, having fun till the day has passed!",
    mouthGuide: "Close your lips tight and hum through your nose: 'mmm' -> 'muh'!",
  },
  {
    letter: "N",
    sound: "nuh",
    ipa: "/n/",
    word: "Nest",
    emoji: "🪺",
    secondaryWords: [
      { word: "Nut", emoji: "🥜" },
      { word: "Nose", emoji: "👃" },
      { word: "Night", emoji: "🌃" },
    ],
    color: "from-orange-400 to-amber-500",
    rhyme: "N is for Nest built in a tree, keeping tiny birds safe as can be!",
    mouthGuide: "Put your tongue against the roof of your mouth and hum: 'nuh'!",
  },
  {
    letter: "O",
    sound: "oh",
    ipa: "/ɒ/",
    word: "Octopus",
    emoji: "🐙",
    secondaryWords: [
      { word: "Owl", emoji: "🦉" },
      { word: "Orange", emoji: "🍊" },
      { word: "Ocean", emoji: "🌊" },
    ],
    color: "from-amber-400 to-yellow-500",
    rhyme: "O is for Octopus in the blue, waving eight arms just for you!",
    mouthGuide: "Make an 'O' circle shape with your lips and say 'oh'!",
  },
  {
    letter: "P",
    sound: "puh",
    ipa: "/p/",
    word: "Penguin",
    emoji: "🐧",
    secondaryWords: [
      { word: "Panda", emoji: "🐼" },
      { word: "Pizza", emoji: "🍕" },
      { word: "Parrot", emoji: "🦜" },
    ],
    color: "from-emerald-400 to-green-500",
    rhyme: "P is for Penguin on the ice, sliding around is so very nice!",
    mouthGuide: "Press your lips together and pop a tiny burst of air: 'puh'!",
  },
  {
    letter: "Q",
    sound: "kwuh",
    ipa: "/kw/",
    word: "Queen",
    emoji: "👑",
    secondaryWords: [
      { word: "Quilt", emoji: "🧵" },
      { word: "Quiet", emoji: "🤫" },
      { word: "Quick", emoji: "⚡" },
    ],
    color: "from-teal-400 to-emerald-500",
    rhyme: "Q is for Queen with a sparkling crown, smiling kindly all through the town!",
    mouthGuide: "Round your lips forward like a kiss, then open: 'kwuh'!",
  },
  {
    letter: "R",
    sound: "ruh",
    ipa: "/r/",
    word: "Rainbow",
    emoji: "🌈",
    secondaryWords: [
      { word: "Rabbit", emoji: "🐰" },
      { word: "Rocket", emoji: "🚀" },
      { word: "Rain", emoji: "🌧️" },
    ],
    color: "from-cyan-400 to-blue-500",
    rhyme: "R is for Rainbow in the air, with bright happy colors everywhere!",
    mouthGuide: "Curl the tip of your tongue backward without touching the roof: 'ruh'!",
  },
  {
    letter: "S",
    sound: "sss",
    ipa: "/s/",
    word: "Sun",
    emoji: "☀️",
    secondaryWords: [
      { word: "Star", emoji: "⭐" },
      { word: "Strawberry", emoji: "🍓" },
      { word: "Snake", emoji: "🐍" },
    ],
    color: "from-blue-400 to-indigo-500",
    rhyme: "S is for Sun shining warm and bright, filling our day with happy light!",
    mouthGuide: "Put your teeth lightly together and hiss softly like a gentle breeze: 'sss'!",
  },
  {
    letter: "T",
    sound: "tuh",
    ipa: "/t/",
    word: "Tiger",
    emoji: "🐯",
    secondaryWords: [
      { word: "Tree", emoji: "🌳" },
      { word: "Train", emoji: "🚂" },
      { word: "Turtle", emoji: "🐢" },
    ],
    color: "from-indigo-400 to-violet-500",
    rhyme: "T is for Tiger striped and grand, roaming proudly across the land!",
    mouthGuide: "Tap the tip of your tongue quickly behind your top front teeth: 'tuh'!",
  },
  {
    letter: "U",
    sound: "uh",
    ipa: "/ʌ/",
    word: "Umbrella",
    emoji: "☂️",
    secondaryWords: [
      { word: "Unicorn", emoji: "🦄" },
      { word: "Up", emoji: "⬆️" },
      { word: "Under", emoji: "👇" },
    ],
    color: "from-violet-400 to-purple-500",
    rhyme: "U is for Umbrella opened wide, keeping raindrops on the outside!",
    mouthGuide: "Drop your jaw slightly relaxed: 'uh'!",
  },
  {
    letter: "V",
    sound: "vuh",
    ipa: "/v/",
    word: "Van",
    emoji: "🚐",
    secondaryWords: [
      { word: "Violin", emoji: "🎻" },
      { word: "Vegetable", emoji: "🥕" },
      { word: "Volcano", emoji: "🌋" },
    ],
    color: "from-purple-400 to-fuchsia-500",
    rhyme: "V is for Van rolling down the street, taking friends on a journey sweet!",
    mouthGuide: "Place top teeth on your bottom lip and buzz gently: 'vuh'!",
  },
  {
    letter: "W",
    sound: "wuh",
    ipa: "/w/",
    word: "Whale",
    emoji: "🐋",
    secondaryWords: [
      { word: "Water", emoji: "💧" },
      { word: "Watermelon", emoji: "🍉" },
      { word: "Wind", emoji: "💨" },
    ],
    color: "from-fuchsia-400 to-pink-500",
    rhyme: "W is for Whale swimming deep, singing soft ocean songs to sleep!",
    mouthGuide: "Pucker your lips small and open them quickly: 'wuh'!",
  },
  {
    letter: "X",
    sound: "ks",
    ipa: "/ks/",
    word: "Xylophone",
    emoji: "🪵",
    secondaryWords: [
      { word: "Fox", emoji: "🦊" },
      { word: "Box", emoji: "📦" },
      { word: "X-ray", emoji: "🩻" },
    ],
    color: "from-pink-400 to-rose-500",
    rhyme: "X is for Xylophone you can tap, making happy notes that make you clap!",
    mouthGuide: "Make a 'k' sound followed immediately by an 's' sound: 'ks'!",
  },
  {
    letter: "Y",
    sound: "yuh",
    ipa: "/j/",
    word: "Yak",
    emoji: "🐂",
    secondaryWords: [
      { word: "Yo-yo", emoji: "🪀" },
      { word: "Yogurt", emoji: "🥛" },
      { word: "Yellow", emoji: "💛" },
    ],
    color: "from-amber-400 to-orange-500",
    rhyme: "Y is for Yak with shaggy hair, marching along without a care!",
    mouthGuide: "Spread your lips wide and glide your tongue forward: 'yuh'!",
  },
  {
    letter: "Z",
    sound: "zzz",
    ipa: "/z/",
    word: "Zebra",
    emoji: "🦓",
    secondaryWords: [
      { word: "Zoo", emoji: "🦁" },
      { word: "Zipper", emoji: "🤐" },
      { word: "Zero", emoji: "0️⃣" },
    ],
    color: "from-teal-400 to-cyan-500",
    rhyme: "Z is for Zebra in black and white, running fast in the sunny light!",
    mouthGuide: "Put your teeth together and buzz like a friendly bumblebee: 'zzz'!",
  },
]

export const THREE_LETTER_WORDS: PhonicsWordItem[] = [
  { word: "CAT", sounds: ["C", "A", "T"], emoji: "🐱", meaning: "A furry pet that purrs and meows!", hint: "Says meow!" },
  { word: "DOG", sounds: ["D", "O", "G"], emoji: "🐶", meaning: "A loyal friend that loves to play fetch!", hint: "Barks woof!" },
  { word: "SUN", sounds: ["S", "U", "N"], emoji: "☀️", meaning: "The warm, bright star that lights our daytime sky!", hint: "Shines in the sky!" },
  { word: "BAT", sounds: ["B", "A", "T"], emoji: "🦇", meaning: "A nocturnal creature that flies with silky wings!", hint: "Flies at night!" },
  { word: "HAT", sounds: ["H", "A", "T"], emoji: "👒", meaning: "A cozy or stylish item you wear on your head!", hint: "Goes on your head!" },
  { word: "BED", sounds: ["B", "E", "D"], emoji: "🛏️", meaning: "A soft and comfy place where you dream at night!", hint: "Where you sleep!" },
  { word: "RED", sounds: ["R", "E", "D"], emoji: "🔴", meaning: "A vibrant warm color like roses and strawberries!", hint: "The color of apples!" },
  { word: "BIG", sounds: ["B", "I", "G"], emoji: "🐘", meaning: "Huge and grand, just like an enormous elephant!", hint: "Opposite of small!" },
  { word: "RUN", sounds: ["R", "U", "N"], emoji: "🏃", meaning: "Moving your legs super quickly for lots of fun!", hint: "Move very fast!" },
  { word: "FUN", sounds: ["F", "U", "N"], emoji: "🎉", meaning: "Games, laughter, and enjoyable moments with friends!", hint: "Joy and games!" },
  { word: "CUP", sounds: ["C", "U", "P"], emoji: "☕", meaning: "A handy container for warm milk or cool juice!", hint: "Drink from this!" },
  { word: "BUS", sounds: ["B", "U", "S"], emoji: "🚌", meaning: "A big yellow vehicle that takes kids to school!", hint: "Big yellow ride!" },
  { word: "PIG", sounds: ["P", "I", "G"], emoji: "🐷", meaning: "A cute pink farm animal with a curly tail!", hint: "Oink oink!" },
  { word: "BOX", sounds: ["B", "O", "X"], emoji: "📦", meaning: "A cardboard container full of surprises and toys!", hint: "Holds your toys!" },
  { word: "TOY", sounds: ["T", "O", "Y"], emoji: "🧸", meaning: "A playful item like a teddy bear or racecar!", hint: "Fun to play with!" },
  { word: "BAG", sounds: ["B", "A", "G"], emoji: "👜", meaning: "Something you carry your books and snacks in!", hint: "Carries your books!" },
  { word: "CAR", sounds: ["C", "A", "R"], emoji: "🚗", meaning: "A vehicle with four wheels that drives on roads!", hint: "Beep beep!" },
  { word: "TOP", sounds: ["T", "O", "P"], emoji: "🔝", meaning: "The highest spot on a mountain or tower!", hint: "The very highest!" },
  { word: "NET", sounds: ["N", "E", "T"], emoji: "🥅", meaning: "Made of criss-crossed ropes to catch soccer balls!", hint: "Catches the ball!" },
  { word: "FOX", sounds: ["F", "O", "X"], emoji: "🦊", meaning: "A clever woodland animal with a bushy orange tail!", hint: "Clever orange animal!" },
]

export const FOUR_LETTER_WORDS: PhonicsWordItem[] = [
  { word: "BOOK", sounds: ["B", "OO", "K"], emoji: "📚", meaning: "Pages filled with stories and wonderful pictures!", hint: "Open to read stories!" },
  { word: "TREE", sounds: ["T", "R", "EE"], emoji: "🌳", meaning: "A tall green plant with branches, leaves, and shade!", hint: "Grows tall with green leaves!" },
  { word: "FISH", sounds: ["F", "I", "SH"], emoji: "🐟", meaning: "An aquatic swimmer with shimmering scales and fins!", hint: "Swims underwater!" },
  { word: "BIRD", sounds: ["B", "IR", "D"], emoji: "🐦", meaning: "A feathered friend singing melodies high in trees!", hint: "Flies and sings songs!" },
  { word: "CAKE", sounds: ["C", "A", "KE"], emoji: "🎂", meaning: "A delicious frosted dessert for birthday celebrations!", hint: "Blow out candles on it!" },
  { word: "MOON", sounds: ["M", "OO", "N"], emoji: "🌙", meaning: "The glowing white circle smiling down in the night sky!", hint: "Shines bright at night!" },
  { word: "FROG", sounds: ["F", "R", "OG"], emoji: "🐸", meaning: "A bouncy green amphibian that catches flies with its tongue!", hint: "Ribbit ribbit!" },
  { word: "STAR", sounds: ["S", "T", "AR"], emoji: "⭐", meaning: "A sparkling jewel glittering far away in space!", hint: "Twinkles in space!" },
  { word: "DUCK", sounds: ["D", "U", "CK"], emoji: "🦆", meaning: "A swimming bird with yellow feet that says quack!", hint: "Quack quack!" },
  { word: "BEAR", sounds: ["B", "EAR"], emoji: "🐻", meaning: "A furry woodland animal that loves honey and berries!", hint: "Big cuddly bear!" },
  { word: "BOAT", sounds: ["B", "OA", "T"], emoji: "⛵", meaning: "A vessel that glides smoothly across lakes and oceans!", hint: "Sails on water!" },
  { word: "RAIN", sounds: ["R", "AI", "N"], emoji: "🌧️", meaning: "Fresh cool water droplets showering from clouds!", hint: "Water falling from clouds!" },
  { word: "SNOW", sounds: ["S", "N", "OW"], emoji: "❄️", meaning: "Fluffy white crystalline flakes for building snowmen!", hint: "Cold white flakes!" },
  { word: "FIRE", sounds: ["F", "I", "RE"], emoji: "🔥", meaning: "Crackling flames giving warm golden light and heat!", hint: "Hot and crackly!" },
  { word: "DOOR", sounds: ["D", "OOR"], emoji: "🚪", meaning: "Turn the shiny knob to step into a new room!", hint: "Turn the knob to enter!" },
]

export const FIVE_LETTER_WORDS: PhonicsWordItem[] = [
  { word: "HOUSE", sounds: ["H", "OU", "SE"], emoji: "🏠", meaning: "A warm and safe home where families live happily!", hint: "Where your family lives!" },
  { word: "APPLE", sounds: ["A", "PP", "LE"], emoji: "🍎", meaning: "A crisp and sweet fruit picked right off an orchard tree!", hint: "Sweet crunchy red fruit!" },
  { word: "HAPPY", sounds: ["H", "A", "PP", "Y"], emoji: "😊", meaning: "Full of smiles, cheerfulness, and bubbling laughter!", hint: "Opposite of sad!" },
  { word: "WATER", sounds: ["W", "A", "T", "ER"], emoji: "💧", meaning: "Pure refreshing liquid you drink to stay energized!", hint: "Keeps you hydrated!" },
  { word: "PLANT", sounds: ["P", "L", "A", "NT"], emoji: "🌱", meaning: "A living sprout that reaches upward toward the sunlight!", hint: "Grows in soil!" },
  { word: "SMILE", sounds: ["S", "M", "I", "LE"], emoji: "😄", meaning: "Curving your lips upward to spread kindness!", hint: "Show your happy teeth!" },
  { word: "HEART", sounds: ["H", "EAR", "T"], emoji: "❤️", meaning: "The rhythmic muscle inside your chest that shares love!", hint: "Beats thump-thump!" },
  { word: "LIGHT", sounds: ["L", "IGH", "T"], emoji: "💡", meaning: "Bright illumination chasing away shadows and dark!", hint: "Flips on in dark rooms!" },
  { word: "MUSIC", sounds: ["M", "U", "S", "IC"], emoji: "🎵", meaning: "Harmonies, rhythms, and songs that make you dance!", hint: "Listen and dance along!" },
  { word: "BEACH", sounds: ["B", "EA", "CH"], emoji: "🏖️", meaning: "Sunny golden sand where rolling waves meet the shore!", hint: "Sandcastles and ocean waves!" },
  { word: "BREAD", sounds: ["B", "R", "EA", "D"], emoji: "🍞", meaning: "Warm baked loaf sliced fresh for tasty sandwiches!", hint: "Made from wheat flour!" },
  { word: "CHAIR", sounds: ["CH", "AI", "R"], emoji: "🪑", meaning: "A comfy seat with four legs where you can rest!", hint: "Sit down to rest!" },
]

export const SIMPLE_SENTENCES: PhonicsSentenceItem[] = [
  {
    sentence: "The cat sat on the mat.",
    words: ["The", "cat", "sat", "on", "the", "mat"],
    emoji: "🐱",
    difficulty: "easy",
  },
  {
    sentence: "A big dog can run fast.",
    words: ["A", "big", "dog", "can", "run", "fast"],
    emoji: "🐶",
    difficulty: "easy",
  },
  {
    sentence: "The sun is warm and bright.",
    words: ["The", "sun", "is", "warm", "and", "bright"],
    emoji: "☀️",
    difficulty: "easy",
  },
  {
    sentence: "I see a little red bird.",
    words: ["I", "see", "a", "little", "red", "bird"],
    emoji: "🐦",
    difficulty: "easy",
  },
  {
    sentence: "The green frog can jump high.",
    words: ["The", "green", "frog", "can", "jump", "high"],
    emoji: "🐸",
    difficulty: "medium",
  },
  {
    sentence: "She has a sweet red apple.",
    words: ["She", "has", "a", "sweet", "red", "apple"],
    emoji: "🍎",
    difficulty: "medium",
  },
  {
    sentence: "We love to read a good book.",
    words: ["We", "love", "to", "read", "a", "good", "book"],
    emoji: "📚",
    difficulty: "medium",
  },
  {
    sentence: "The yellow bus goes to school.",
    words: ["The", "yellow", "bus", "goes", "to", "school"],
    emoji: "🚌",
    difficulty: "hard",
  },
  {
    sentence: "A shiny star twinkles at night.",
    words: ["A", "shiny", "star", "twinkles", "at", "night"],
    emoji: "⭐",
    difficulty: "hard",
  },
  {
    sentence: "Look at the colorful rainbow in the sky.",
    words: ["Look", "at", "the", "colorful", "rainbow", "in", "the", "sky"],
    emoji: "🌈",
    difficulty: "hard",
  },
]

export const QUIZ_BANK: Record<string, PhonicsQuizItem[]> = {
  letters: [
    {
      question: "Which letter makes the 'ah' sound as in Apple? 🍎",
      type: "multiple-choice",
      options: ["A", "B", "C", "D"],
      correct: 0,
      explanation: "Letter A makes the 'ah' sound! A is for Apple!",
      hint: "It's the first letter of the alphabet!",
      soundPrompt: "A says ah!",
    },
    {
      question: "What sound does the letter B make in Ball? ⚽",
      type: "multiple-choice",
      options: ["buh", "duh", "muh", "kuh"],
      correct: 0,
      explanation: "Letter B makes the bouncy 'buh' sound! B is for Ball!",
      hint: "Pop your lips together: buh!",
      soundPrompt: "B says buh!",
    },
    {
      question: "Which letter makes the hiss sound 'sss' like a sunny day? ☀️",
      type: "multiple-choice",
      options: ["S", "T", "M", "P"],
      correct: 0,
      explanation: "Letter S says 'sss'! S is for Sun and Star!",
      hint: "It looks like a gentle wavy snake!",
      soundPrompt: "S says sss!",
    },
    {
      question: "Spell the starting letter for this cute pet: 🐱 Cat",
      type: "spelling",
      answer: "C",
      explanation: "Letter C starts the word Cat! C-A-T!",
      hint: "C says kuh!",
    },
    {
      question: "What sound does letter M make when food is delicious? 🐵",
      type: "multiple-choice",
      options: ["muh", "nuh", "tuh", "puh"],
      correct: 0,
      explanation: "Letter M makes the 'mmm' / 'muh' sound! M is for Monkey!",
      hint: "Close your lips and hum: muh!",
      soundPrompt: "M says muh!",
    },
    {
      question: "Spell the starting letter for this animal: 🐶 Dog",
      type: "spelling",
      answer: "D",
      explanation: "Letter D starts Dog! D says duh!",
      hint: "Tap your tongue behind your top teeth!",
    },
    {
      question: "Which letter makes the quiet whispering 'fuh' sound in Fish? 🐟",
      type: "multiple-choice",
      options: ["F", "V", "P", "B"],
      correct: 0,
      explanation: "Letter F makes the soft 'fuh' sound! F is for Fish!",
      hint: "Touch top teeth to bottom lip and blow!",
    },
  ],
  "three-letter": [
    {
      question: "Spell the word for this furry pet that says meow: 🐱",
      type: "spelling",
      answer: "CAT",
      explanation: "C - A - T spells CAT! Great job!",
      hint: "Starts with C, ends with T!",
    },
    {
      question: "Which word rhymes with CAT and flies at night? 🦇",
      type: "multiple-choice",
      options: ["BAT", "DOG", "SUN", "BED"],
      correct: 0,
      explanation: "BAT rhymes with CAT! They both have the '-at' sound family!",
      hint: "Starts with B: Buh-At!",
    },
    {
      question: "Spell the word for the bright star shining in our sky: ☀️",
      type: "spelling",
      answer: "SUN",
      explanation: "S - U - N spells SUN! Warm and bright!",
      hint: "S - U - N!",
    },
    {
      question: "Which word spells where you sleep peacefully at night? 🛏️",
      type: "multiple-choice",
      options: ["BED", "RED", "BAD", "BAG"],
      correct: 0,
      explanation: "B - E - D spells BED!",
      hint: "Starts with B and ends with D!",
    },
    {
      question: "Spell the word for a cute pink farm animal with a curly tail: 🐷",
      type: "spelling",
      answer: "PIG",
      explanation: "P - I - G spells PIG! Oink oink!",
      hint: "P - I - G!",
    },
  ],
  "four-letter": [
    {
      question: "Spell the word for what shines brightly at night in the sky: 🌙",
      type: "spelling",
      answer: "MOON",
      explanation: "M - O - O - N spells MOON!",
      hint: "Double 'O' makes the 'ooo' sound!",
    },
    {
      question: "Which word has the 'ee' sound as in a tall plant with green leaves? 🌳",
      type: "multiple-choice",
      options: ["TREE", "STAR", "FROG", "BOOK"],
      correct: 0,
      explanation: "T - R - E - E has the long 'ee' vowel sound!",
      hint: "Starts with T-R!",
    },
    {
      question: "Spell the word for this little green animal that hops: 🐸",
      type: "spelling",
      answer: "FROG",
      explanation: "F - R - O - G spells FROG! Ribbit ribbit!",
      hint: "Begins with the blend F-R!",
    },
    {
      question: "What shines high in the night sky like a twinkle? ⭐",
      type: "multiple-choice",
      options: ["STAR", "BOAT", "DUCK", "CAKE"],
      correct: 0,
      explanation: "S - T - A - R spells STAR!",
      hint: "Has the 'ar' sound!",
    },
  ],
  "five-letter": [
    {
      question: "Spell the word for where your happy family lives together: 🏠",
      type: "spelling",
      answer: "HOUSE",
      explanation: "H - O - U - S - E spells HOUSE!",
      hint: "H - O - U - S - E",
    },
    {
      question: "Which word means feeling joyful and wearing a big grin? 😊",
      type: "multiple-choice",
      options: ["HAPPY", "WATER", "PLANT", "BREAD"],
      correct: 0,
      explanation: "H - A - P - P - Y means full of smiles!",
      hint: "Opposite of sad!",
    },
    {
      question: "Spell the word for the sweet red fruit that grows on trees: 🍎",
      type: "spelling",
      answer: "APPLE",
      explanation: "A - P - P - L - E spells APPLE! Yummy!",
      hint: "A - P - P - L - E",
    },
  ],
  sentences: [
    {
      question: "Complete the sentence: 'The cat sat on the ___.' 🐱",
      type: "multiple-choice",
      options: ["mat", "sky", "car", "moon"],
      correct: 0,
      explanation: "'The cat sat on the mat' is a classic phonics rhyming sentence!",
      hint: "Rhymes with CAT!",
    },
    {
      question: "Complete the sentence: 'The sun is warm and ___.' ☀️",
      type: "multiple-choice",
      options: ["bright", "cold", "dark", "wet"],
      correct: 0,
      explanation: "The sun is warm and bright!",
      hint: "Full of bright light!",
    },
    {
      question: "Unscramble: 'can / A / dog / run / big'",
      type: "multiple-choice",
      options: ["A big dog can run.", "Run dog big can a.", "Dog big a can run.", "Can run big a dog."],
      correct: 0,
      explanation: "'A big dog can run.' starts with a capital letter and makes full sense!",
      hint: "Start with the capital letter 'A'!",
    },
  ],
}
