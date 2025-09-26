import Stage1Level1 from "@/components/lessons/stage1/Stage1Level1";

export interface Level {
  levelid: number;
  levelname: string;
  percent: number;
}

export interface Stage {
  id: number;
  stage: number;
  title: string;
  type: number;
  levels: Level[];
}

export const stageData: Stage[] = [
  {
    id: 7,
    stage: 7,
    title: "Months",
    type: 1,
    levels: [
      { levelid: 1, levelname: "Jan-Mar", percent: 0 },
      { levelid: 2, levelname: "Apr-Jun", percent: 0 },
      { levelid: 3, levelname: "Jul-Sep", percent: 0 },
      { levelid: 4, levelname: "Oct-Dec", percent: 0 },
    ],
  },
  {
    id: 6,
    stage: 6,
    title: "Days",
    type: 1,
    levels: [
      { levelid: 1, levelname: "Mon-Wed", percent: 0 },
      { levelid: 2, levelname: "Thu-Fri", percent: 0 },
      { levelid: 3, levelname: "Sat-Sun", percent: 0 },
    ],
  },
  {
    id: 5,
    stage: 5,
    title: "Questions",
    type: 1,
    levels: [
      { levelid: 1, levelname: "What & Who", percent: 0 },
      { levelid: 2, levelname: "Where & When", percent: 0 },
      { levelid: 3, levelname: "Why & How", percent: 0 },
    ],
  },
  {
    id: 4,
    stage: 4,
    title: "Colors",
    type: 1,
    levels: [
      { levelid: 1, levelname: "Primary Colors", percent: 0 },
      { levelid: 2, levelname: "Secondary Colors", percent: 0 },
      { levelid: 3, levelname: "Mixed Colors", percent: 0 },
    ],
  },
  {
    id: 3,
    stage: 3,
    title: "Greetings",
    type: 1,
    levels: [
      { levelid: 1, levelname: "Basic Greetings", percent: 0 },
      { levelid: 2, levelname: "Polite Expressions", percent: 0 },
      { levelid: 3, levelname: "Farewells", percent: 0 },
    ],
  },
  {
    id: 2,
    stage: 2,
    title: "Numbers",
    type: 1,
    levels: [
      { levelid: 1, levelname: "1-10", percent: 0 },
      { levelid: 2, levelname: "11-20", percent: 0 },
      { levelid: 3, levelname: "21-100", percent: 0 },
    ],
  },
  {
    id: 1,
    stage: 1,
    title: "Alphabets",
    type: 1,
    levels: [
      { levelid: 1, levelname: "A-C", percent: 0 },
      { levelid: 2, levelname: "D-F", percent: 0 },
      { levelid: 3, levelname: "G-I", percent: 0 },
      { levelid: 4, levelname: "J-L", percent: 0 },
      { levelid: 5, levelname: "M-O", percent: 0 },
      { levelid: 6, levelname: "P-R", percent: 0 },
      { levelid: 7, levelname: "S-U", percent: 0 },
      { levelid: 8, levelname: "V-X", percent: 0 },
      { levelid: 9, levelname: "Y-Z", percent: 0 },
    ],
  },
];

// 🧠 Utility functions
export function getStageById(id: number): Stage | undefined {
  return stageData.find((s) => s.id === id);
}

export function getLevelByStageIdByLevelId(
  stageId: number,
  levelId: number
): Level | undefined {
  const stage = getStageById(stageId);
  return stage?.levels.find((l) => l.levelid === levelId);
}
