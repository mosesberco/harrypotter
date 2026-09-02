/* Sample of the real question shape. In production these live in
   content/questions/*.json, are verified against source, and are seeded to
   Supabase; answers are never sent to the browser. */

export type Scope = "book" | "film" | "both";

export type Question = {
  id: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  scope: Scope;
  topics: string[];
  spoilerBook: number;
  answer: number;
  verified: boolean;
  he: { prompt: string; choices: string[]; explanation: string; source: string };
  en: { prompt: string; choices: string[]; explanation: string; source: string };
};

export const SAMPLE: Question[] = [
  {
    id: "gryffindor-beast",
    difficulty: 1,
    scope: "both",
    topics: ["houses"],
    spoilerBook: 1,
    answer: 2,
    verified: true,
    he: {
      prompt: "איזו חיה מסמלת את בית גריפינדור?",
      choices: ["נחש", "גיריט", "אריה", "עורב"],
      explanation: "אריה — לעומת הנחש של סלית'רין, הגיריט של האפלפאף והעורב של רייבנקלו.",
      source: "הארי פוטר ואבן החכמים, פרק 7",
    },
    en: {
      prompt: "Which beast stands for Gryffindor house?",
      choices: ["A serpent", "A badger", "A lion", "A raven"],
      explanation: "A lion — against Slytherin's serpent, Hufflepuff's badger and Ravenclaw's raven.",
      source: "Philosopher's Stone, ch. 7",
    },
  },
  {
    id: "nick-full-name",
    difficulty: 2,
    scope: "book",
    topics: ["ghosts", "names"],
    spoilerBook: 2,
    answer: 1,
    verified: true,
    he: {
      prompt: "מה שמו המלא של ניק כמעט-חסר-הראש?",
      choices: [
        "סר ניקולס דה וימבורן-פורפינגטון",
        "סר ניקולס דה מימסי-פורפינגטון",
        "סר ניקולס דה מימסי-פנינגטון",
        "סר ניקולס דה מורנינגטון-מימסי",
      ],
      explanation:
        "ניק מקפיד על שמו המלא דווקא כשהוא נדחה מן המסדר של הפרשים חסרי הראש — הוא נכרת בארבעים וחמש מהלומות גרזן קהה, ולכן 'כמעט'.",
      source: "הארי פוטר וחדר הסודות, פרק 8",
    },
    en: {
      prompt: "What is Nearly Headless Nick's full name?",
      choices: [
        "Sir Nicholas de Wimborne-Porpington",
        "Sir Nicholas de Mimsy-Porpington",
        "Sir Nicholas de Mimsy-Pennington",
        "Sir Nicholas de Mornington-Mimsy",
      ],
      explanation:
        "Nick insists on the full name precisely when the Headless Hunt turns him away — forty-five strokes of a blunt axe left him only nearly headless.",
      source: "Chamber of Secrets, ch. 8",
    },
  },
  {
    id: "vault-713",
    difficulty: 3,
    scope: "both",
    topics: ["gringotts", "numbers"],
    spoilerBook: 1,
    answer: 3,
    verified: true,
    he: {
      prompt: "באיזו כספת בגרינגוטס הוחזקה אבן החכמים לפני שהועברה להוגוורטס?",
      choices: ["687", "711", "731", "713"],
      explanation:
        "כספת 687 היא של הארי. האגריד רוקן את 713 באותו ביקור עצמו — צרור קטן עטוף בנייר חום.",
      source: "הארי פוטר ואבן החכמים, פרק 5",
    },
    en: {
      prompt: "Which Gringotts vault held the Philosopher's Stone before it moved to Hogwarts?",
      choices: ["687", "711", "731", "713"],
      explanation:
        "687 is Harry's own. Hagrid emptied 713 on that same visit — a small, grubby brown-paper package.",
      source: "Philosopher's Stone, ch. 5",
    },
  },
  {
    id: "lupin-office-tank",
    difficulty: 4,
    scope: "book",
    topics: ["lupin", "creatures", "rooms"],
    spoilerBook: 3,
    answer: 0,
    verified: true,
    he: {
      prompt: "מה שחה באקווריום הגדול במשרדו של לופין, כשהארי נכנס אליו בפעם הראשונה?",
      choices: ["גרינדילו", "מרמן", "קאפה", "בת ים מן האגם"],
      explanation:
        "גרינדילו — שד מים ירקרק עם אצבעות ארוכות ושבירות. לופין הציע להארי תה בדיוק כשסנייפ הביא את השיקוי.",
      source: "הארי פוטר והאסיר מאזקבאן, פרק 8",
    },
    en: {
      prompt: "What was swimming in the large tank in Lupin's office the first time Harry walked in?",
      choices: ["A grindylow", "A merman", "A kappa", "A lake mermaid"],
      explanation:
        "A grindylow — a sickly green water demon with long, brittle fingers. Lupin was offering Harry tea just as Snape brought the potion in.",
      source: "Prisoner of Azkaban, ch. 8",
    },
  },
  {
    id: "hogwarts-staircases",
    difficulty: 5,
    scope: "book",
    topics: ["castle", "numbers"],
    spoilerBook: 1,
    answer: 2,
    verified: true,
    he: {
      prompt: "כמה גרמי מדרגות יש בהוגוורטס?",
      choices: ["112", "124", "142", "148"],
      explanation:
        "מאה ארבעים ושתיים — רחבים ומרווחים, צרים ורעועים, כאלה שמובילים למקום אחר בימי שישי, וכאלה עם מדרגה נעלמת שצריך לזכור לדלג עליה.",
      source: "הארי פוטר ואבן החכמים, פרק 8",
    },
    en: {
      prompt: "How many staircases does Hogwarts have?",
      choices: ["112", "124", "142", "148"],
      explanation:
        "A hundred and forty-two — wide and sweeping, narrow and rickety, some that led somewhere different on a Friday, some with a vanishing step you had to remember to jump.",
      source: "Philosopher's Stone, ch. 8",
    },
  },
];
