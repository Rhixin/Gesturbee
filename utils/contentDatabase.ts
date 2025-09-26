import { MinigameContent, MinigameCategory } from "../types/minigame";

// Comprehensive content database for all stages
export const CONTENT_DATABASE: Record<MinigameCategory, MinigameContent[]> = {
  alphabets: [
    // A-C
    {
      id: "a1",
      word: "A",
      videoPath: "a.mp4",
      category: "alphabets",
      difficulty: "easy",
    },
    {
      id: "b1",
      word: "B",
      videoPath: "b.mp4",
      category: "alphabets",
      difficulty: "easy",
    },
    {
      id: "c1",
      word: "C",
      videoPath: "c.mp4",
      category: "alphabets",
      difficulty: "easy",
    },
    // D-F
    {
      id: "d1",
      word: "D",
      videoPath: "d.mp4",
      category: "alphabets",
      difficulty: "easy",
    },
    {
      id: "e1",
      word: "E",
      videoPath: "e.mp4",
      category: "alphabets",
      difficulty: "easy",
    },
    {
      id: "f1",
      word: "F",
      videoPath: "f.mp4",
      category: "alphabets",
      difficulty: "easy",
    },
    // G-I
    {
      id: "g1",
      word: "G",
      videoPath: "g.mp4",
      category: "alphabets",
      difficulty: "medium",
    },
    {
      id: "h1",
      word: "H",
      videoPath: "h.mp4",
      category: "alphabets",
      difficulty: "medium",
    },
    {
      id: "i1",
      word: "I",
      videoPath: "i.mp4",
      category: "alphabets",
      difficulty: "medium",
    },
    // Continue for all letters...
  ],

  numbers: [
    // 1-10
    {
      id: "n1",
      word: "1",
      videoPath: "one.mp4",
      category: "numbers",
      difficulty: "easy",
    },
    {
      id: "n2",
      word: "2",
      videoPath: "two.mp4",
      category: "numbers",
      difficulty: "easy",
    },
    {
      id: "n3",
      word: "3",
      videoPath: "three.mp4",
      category: "numbers",
      difficulty: "easy",
    },
    {
      id: "n4",
      word: "4",
      videoPath: "four.mp4",
      category: "numbers",
      difficulty: "easy",
    },
    {
      id: "n5",
      word: "5",
      videoPath: "five.mp4",
      category: "numbers",
      difficulty: "easy",
    },
    {
      id: "n6",
      word: "6",
      videoPath: "six.mp4",
      category: "numbers",
      difficulty: "easy",
    },
    {
      id: "n7",
      word: "7",
      videoPath: "seven.mp4",
      category: "numbers",
      difficulty: "easy",
    },
    {
      id: "n8",
      word: "8",
      videoPath: "eight.mp4",
      category: "numbers",
      difficulty: "easy",
    },
    {
      id: "n9",
      word: "9",
      videoPath: "nine.mp4",
      category: "numbers",
      difficulty: "easy",
    },
    {
      id: "n10",
      word: "10",
      videoPath: "ten.mp4",
      category: "numbers",
      difficulty: "easy",
    },
  ],

  greetings: [
    // Basic Greetings
    {
      id: "g1",
      word: "Hello",
      videoPath: "hello.mp4",
      category: "greetings",
      difficulty: "easy",
    },
    {
      id: "g2",
      word: "Good Morning",
      videoPath: "good_morning.mp4",
      category: "greetings",
      difficulty: "easy",
    },
    {
      id: "g3",
      word: "Good Afternoon",
      videoPath: "good_afternoon.mp4",
      category: "greetings",
      difficulty: "easy",
    },
    {
      id: "g4",
      word: "Good Evening",
      videoPath: "good_evening.mp4",
      category: "greetings",
      difficulty: "easy",
    },
    // Polite Expressions
    {
      id: "g5",
      word: "Please",
      videoPath: "please.mp4",
      category: "greetings",
      difficulty: "medium",
    },
    {
      id: "g6",
      word: "Thank You",
      videoPath: "thank_you.mp4",
      category: "greetings",
      difficulty: "medium",
    },
    {
      id: "g7",
      word: "You are Welcome",
      videoPath: "welcome.mp4",
      category: "greetings",
      difficulty: "medium",
    },
    {
      id: "g8",
      word: "Excuse Me",
      videoPath: "excuse_me.mp4",
      category: "greetings",
      difficulty: "medium",
    },
    // Farewells
    {
      id: "g9",
      word: "Goodbye",
      videoPath: "goodbye.mp4",
      category: "greetings",
      difficulty: "medium",
    },
    {
      id: "g10",
      word: "See You Later",
      videoPath: "see_you_later.mp4",
      category: "greetings",
      difficulty: "hard",
    },
    {
      id: "g11",
      word: "Take Care",
      videoPath: "take_care.mp4",
      category: "greetings",
      difficulty: "hard",
    },
  ],

  colors: [
    // Primary Colors
    {
      id: "c1",
      word: "Red",
      videoPath: "red.mp4",
      category: "colors",
      difficulty: "easy",
    },
    {
      id: "c2",
      word: "Blue",
      videoPath: "blue.mp4",
      category: "colors",
      difficulty: "easy",
    },
    {
      id: "c3",
      word: "Yellow",
      videoPath: "yellow.mp4",
      category: "colors",
      difficulty: "easy",
    },
    // Secondary Colors
    {
      id: "c4",
      word: "Green",
      videoPath: "green.mp4",
      category: "colors",
      difficulty: "medium",
    },
    {
      id: "c5",
      word: "Orange",
      videoPath: "orange.mp4",
      category: "colors",
      difficulty: "medium",
    },
    {
      id: "c6",
      word: "Purple",
      videoPath: "purple.mp4",
      category: "colors",
      difficulty: "medium",
    },
    // Mixed Colors
    {
      id: "c7",
      word: "Pink",
      videoPath: "pink.mp4",
      category: "colors",
      difficulty: "hard",
    },
    {
      id: "c8",
      word: "Brown",
      videoPath: "brown.mp4",
      category: "colors",
      difficulty: "hard",
    },
    {
      id: "c9",
      word: "Black",
      videoPath: "black.mp4",
      category: "colors",
      difficulty: "hard",
    },
    {
      id: "c10",
      word: "White",
      videoPath: "white.mp4",
      category: "colors",
      difficulty: "hard",
    },
  ],

  questions: [
    // What & Who
    {
      id: "q1",
      word: "What",
      videoPath: "what.mp4",
      category: "questions",
      difficulty: "easy",
    },
    {
      id: "q2",
      word: "Who",
      videoPath: "who.mp4",
      category: "questions",
      difficulty: "easy",
    },
    // Where & When
    {
      id: "q3",
      word: "Where",
      videoPath: "where.mp4",
      category: "questions",
      difficulty: "medium",
    },
    {
      id: "q4",
      word: "When",
      videoPath: "when.mp4",
      category: "questions",
      difficulty: "medium",
    },
    // Why & How
    {
      id: "q5",
      word: "Why",
      videoPath: "why.mp4",
      category: "questions",
      difficulty: "hard",
    },
    {
      id: "q6",
      word: "How",
      videoPath: "how.mp4",
      category: "questions",
      difficulty: "hard",
    },
  ],

  days: [
    // Mon-Wed
    {
      id: "d1",
      word: "Monday",
      videoPath: "monday.mp4",
      category: "days",
      difficulty: "easy",
    },
    {
      id: "d2",
      word: "Tuesday",
      videoPath: "tuesday.mp4",
      category: "days",
      difficulty: "easy",
    },
    {
      id: "d3",
      word: "Wednesday",
      videoPath: "wednesday.mp4",
      category: "days",
      difficulty: "easy",
    },
    // Thu-Fri
    {
      id: "d4",
      word: "Thursday",
      videoPath: "thursday.mp4",
      category: "days",
      difficulty: "medium",
    },
    {
      id: "d5",
      word: "Friday",
      videoPath: "friday.mp4",
      category: "days",
      difficulty: "medium",
    },
    // Sat-Sun
    {
      id: "d6",
      word: "Saturday",
      videoPath: "saturday.mp4",
      category: "days",
      difficulty: "hard",
    },
    {
      id: "d7",
      word: "Sunday",
      videoPath: "sunday.mp4",
      category: "days",
      difficulty: "hard",
    },
  ],

  months: [
    // Jan-Mar
    {
      id: "m1",
      word: "January",
      videoPath: "january.mp4",
      category: "months",
      difficulty: "easy",
    },
    {
      id: "m2",
      word: "February",
      videoPath: "february.mp4",
      category: "months",
      difficulty: "easy",
    },
    {
      id: "m3",
      word: "March",
      videoPath: "march.mp4",
      category: "months",
      difficulty: "easy",
    },
    // Apr-Jun
    {
      id: "m4",
      word: "April",
      videoPath: "april.mp4",
      category: "months",
      difficulty: "medium",
    },
    {
      id: "m5",
      word: "May",
      videoPath: "may.mp4",
      category: "months",
      difficulty: "medium",
    },
    {
      id: "m6",
      word: "June",
      videoPath: "june.mp4",
      category: "months",
      difficulty: "medium",
    },
    // Jul-Sep
    {
      id: "m7",
      word: "July",
      videoPath: "july.mp4",
      category: "months",
      difficulty: "hard",
    },
    {
      id: "m8",
      word: "August",
      videoPath: "august.mp4",
      category: "months",
      difficulty: "hard",
    },
    {
      id: "m9",
      word: "September",
      videoPath: "september.mp4",
      category: "months",
      difficulty: "hard",
    },
    // Oct-Dec
    {
      id: "m10",
      word: "October",
      videoPath: "october.mp4",
      category: "months",
      difficulty: "hard",
    },
    {
      id: "m11",
      word: "November",
      videoPath: "november.mp4",
      category: "months",
      difficulty: "hard",
    },
    {
      id: "m12",
      word: "December",
      videoPath: "december.mp4",
      category: "months",
      difficulty: "hard",
    },
  ],
};

// Words for different minigames
export const SPELLING_WORDS: Record<MinigameCategory, string[]> = {
  alphabets: [
    "AWARD",
    "BEAR",
    "CABIN",
    "DANCE",
    "EAGLE",
    "FLAME",
    "GRACE",
    "HOUSE",
    "IMAGE",
  ],
  numbers: [
    "ONE",
    "TWO",
    "THREE",
    "FOUR",
    "FIVE",
    "SIX",
    "SEVEN",
    "EIGHT",
    "NINE",
    "TEN",
  ],
  greetings: ["HELLO", "THANKS", "PLEASE", "WELCOME", "GOODBYE"],
  colors: [
    "RED",
    "BLUE",
    "GREEN",
    "YELLOW",
    "PURPLE",
    "ORANGE",
    "PINK",
    "BROWN",
  ],
  questions: ["WHAT", "WHO", "WHERE", "WHEN", "WHY", "HOW"],
  days: [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ],
  months: [
    "JANUARY",
    "FEBRUARY",
    "MARCH",
    "APRIL",
    "MAY",
    "JUNE",
    "JULY",
    "AUGUST",
    "SEPTEMBER",
    "OCTOBER",
    "NOVEMBER",
    "DECEMBER",
  ],
};
