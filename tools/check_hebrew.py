#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Check the Hebrew terms the quiz uses against a Hebrew reference corpus.

The book corpus is English, so Hebrew terminology cannot be verified the same
way. HP_CORPUS_HE points at Hebrew reference text; every candidate spelling is
counted there, and the winner is reported. Terms the corpus never mentions are
listed as unresolved — those need a human who knows the translation.

    export HP_CORPUS_HE=/path/to/hebrew/*.txt
    python3 tools/check_hebrew.py
"""

import glob
import os
import re
import sys

# each entry: english gloss, then the candidate Hebrew spellings to weigh
CANDIDATES = [
    ("Seeker",            ["מחפש", "תופס"]),
    ("Keeper",            ["שוער"]),
    ("Chaser",            ["רודף"]),
    ("Beater",            ["חובט"]),
    ("Quaffle",           ["קוואפל", "קואפל"]),
    ("Bludger",           ["בלאדג'ר", "בלאדגר"]),
    ("Golden Snitch",     ["סניץ'", "סניץ"]),
    ("Moaning Myrtle",    ["מירטל המייללת", "מירטל המייבבת"]),
    ("the Owlery",        ["גוזמת הינשופים", "מגדל הינשופים", "שובך הינשופים", "לול הינשופים", "עליית הינשופים"]),
    ("Privet Drive",      ["דרך פריווט", "פריווט דרייב"]),
    ("Dursley",           ["דרסלי", "דורסלי"]),
    ("Hagrid",            ["האגריד", "הגריד"]),
    ("Dementor",          ["סוהרסן", "דמנטור"]),
    ("Sorting Hat",       ["מצנפת המחלקה", "כובע המיון", "מצנפת המיון"]),
    ("The Burrow",        ["המחורה", "המאורה"]),
    ("Whomping Willow",   ["ערבת החבטות", "ערבה מכה"]),
    ("Marauder's Map",    ["מפת השודדים", "מפת הבריונים"]),
    ("house-elf",         ["שדון בית", "שדון-בית"]),
    ("Mudblood",          ["בוצת-דם", "בוצת דם"]),
    ("Ministry of Magic", ["המשרד לקסמות", "משרד הקסמים"]),
    ("Death Eaters",      ["אוכלי המוות", "אוכלי מוות"]),
    ("Room of Requirement", ["חדר הנחוץ", "חדר הדרישות", "החדר הנחוץ"]),
    ("Honeydukes",        ["מתוקי דבש", "האניידיוקס", "דבשדוכס"]),
    ("Leaky Cauldron",    ["הקלחת הדולפת", "הקלחת הרוחשת"]),
    ("Three Broomsticks", ["שלושת המטאטאים"]),
    ("Hog's Head",        ["ראש החזיר"]),
    ("Shrieking Shack",   ["הבקתה הצורחת", "הבקתה היללנית"]),
    ("Beauxbatons",       ["בובטון", "בוקסבטון", "ביובטון"]),
    ("Buckbeak",          ["מקור-הזהב", "מקור הזהב", "באקביק", "כפתור"]),
    ("Fat Lady",          ["הגברת השמנה", "הגבירה השמנה"]),
    ("Parseltongue",      ["לשון-נחש", "לשון נחש", "פרסלטאנג"]),
    ("Occlumency",        ["אוקלומנסיה", "אוקלומנטיה"]),
    ("Apparition",        ["אפריציה", "התמרה", "הופעה"]),
    ("Horcrux",           ["הורקרוקס"]),
    ("Deathly Hallows",   ["אוצרות המוות", "קדושי המוות"]),
    ("Elder Wand",        ["שרביט הסמבוק", "שרביט האלדר"]),
    ("Invisibility Cloak",["גלימת ההיעלמות", "שכמיית ההיעלמות", "גלימת היעלמות"]),
    ("Resurrection Stone",["אבן התחייה", "אבן ההחייה"]),
    ("O.W.L.",            ["בגרויות", "בג\"ם", "בגם"]),
    ("N.E.W.T.",          ["נשלמים", "נשל\"ם", "נשלם"]),
    ("Time-Turner",       ["מהפך-זמן", "מהפך זמן", "גלגל הזמן", "שעון החול"]),
    ("Pensieve",          ["הגיגית", "פנסיב"]),
    ("Remembrall",        ["אבן ההיזכרות", "כדור הזיכרון", "זכרון-כל"]),
    ("Bloody Baron",      ["הברון העקוב מדם", "הברון המדמם"]),
    ("Nearly Headless Nick", ["ניק כמעט-חסר-הראש", "ניק כמעט חסר ראש", "ניק כמעט מחוסר ראש"]),
    ("Peeves",            ["פיבס"]),
    ("Marauders: Moony",  ["ירחי", "מוני"]),
    ("Marauders: Wormtail",["זנבתן", "זנב תולעת", "וורמטייל"]),
    ("Marauders: Padfoot",["כפתן", "כף רגל", "פדפוט"]),
    ("Marauders: Prongs", ["קרנפים", "פרונגס", "קרניים"]),
    ("Dumbledore's Army", ["צבא דמבלדור"]),
    ("Order of the Phoenix", ["מסדר עוף החול"]),
    ("Chamber of Secrets",["חדר הסודות"]),
    ("Half-Blood Prince", ["הנסיך חצוי-הדם", "הנסיך חצוי הדם"]),
    ("Prisoner of Azkaban",["האסיר מאזקבאן"]),
    ("Goblet of Fire",    ["גביע האש"]),
    ("Philosopher's Stone",["אבן החכמים"]),
    ("Squib",             ["סקוויב"]),
    ("boggart",           ["בוגארט", "בוגרט"]),
    ("grindylow",         ["גרינדילו"]),
    ("hippogriff",        ["היפוגריף"]),
    ("Firebolt",          ["פיירבולט", "כידון אש", "רומח אש"]),
    ("Nimbus",            ["נימבוס"]),
    ("Patronus",          ["פטרונוס"]),
    ("Forbidden Forest",  ["היער האסור"]),
    ("Diagon Alley",      ["סמטת דיאגון", "סמטה דיאגון"]),
    ("Knockturn Alley",   ["סמטת קנוקטורן", "סמטת נוקטורן"]),
    ("Gringotts",         ["גרינגוטס"]),
    ("Hogsmeade",         ["הוגסמיד"]),
    ("Grimmauld Place",   ["גרימולד פלייס", "כיכר גרימולד"]),
    ("St Mungo's",        ["סנט מנגו", "סיינט מנגו"]),
    ("Department of Mysteries", ["המחלקה למסתורין", "מחלקת המסתורין"]),
]


def load():
    pattern = os.environ.get("HP_CORPUS_HE", "")
    files = glob.glob(pattern) if pattern else []
    if not files:
        sys.exit("HP_CORPUS_HE must glob at least one Hebrew text file")
    text = "\n".join(open(f, encoding="utf-8", errors="replace").read() for f in files)
    # strip niqqud and normalise whitespace and quote marks
    text = re.sub(r"[֑-ׇ]", "", text)
    text = text.replace("’", "'").replace("׳", "'").replace("”", '"').replace("״", '"')
    return re.sub(r"\s+", " ", text)


def main():
    text = load()
    resolved, disputed, missing = [], [], []

    for gloss, cands in CANDIDATES:
        counts = [(c, len(re.findall(re.escape(c), text))) for c in cands]
        hits = [(c, n) for c, n in counts if n]
        if not hits:
            missing.append((gloss, cands))
        elif len(hits) == 1:
            resolved.append((gloss, hits[0]))
        else:
            hits.sort(key=lambda x: -x[1])
            disputed.append((gloss, hits))

    print(f"===== CONFIRMED BY THE HEBREW CORPUS ({len(resolved)}) =====")
    for gloss, (term, n) in resolved:
        print(f"  {gloss:24} → {term}   ({n}×)")

    print(f"\n===== MORE THAN ONE SPELLING APPEARS ({len(disputed)}) =====")
    for gloss, hits in disputed:
        shown = "   ".join(f"{c} ({n}×)" for c, n in hits)
        print(f"  {gloss:24} → {shown}")

    print(f"\n===== NOT IN THE CORPUS — NEEDS A HUMAN ({len(missing)}) =====")
    for gloss, cands in missing:
        print(f"  {gloss:24} ? {' / '.join(cands)}")


if __name__ == "__main__":
    main()
