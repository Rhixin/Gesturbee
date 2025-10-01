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
    title: "Bohol Months",
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
    title: "Cebu Days",
    type: 1,
    levels: [
      { levelid: 1, levelname: "Weekdays Part 1", percent: 0 },
      { levelid: 2, levelname: "Weekdays Part 2 + Weekend", percent: 0 },
      { levelid: 3, levelname: "Time References", percent: 0 },
    ],
  },
  {
    id: 5,
    stage: 5,
    title: "Palawan Family",
    type: 1,
    levels: [
      { levelid: 1, levelname: "Immediate Family", percent: 0 },
      { levelid: 2, levelname: "Extended Family", percent: 0 },
      { levelid: 3, levelname: "Other Family", percent: 0 },
    ],
  },
  {
    id: 4,
    stage: 4,
    title: "Siargao Colors",
    type: 1,
    levels: [
      { levelid: 1, levelname: "Primary Colors", percent: 0 },
      { levelid: 2, levelname: "Basic Colors", percent: 0 },
      { levelid: 3, levelname: "Secondary Colors", percent: 0 },
      { levelid: 4, levelname: "Advanced Colors", percent: 0 },
    ],
  },
  {
    id: 3,
    stage: 3,
    title: "Boracay Greetings",
    type: 1,
    levels: [
      { levelid: 1, levelname: "Morning-Evening Greetings", percent: 0 },
      { levelid: 2, levelname: "Social Expressions", percent: 0 },
    ],
  },
  {
    id: 2,
    stage: 2,
    title: "Manila Numbers",
    type: 1,
    levels: [
      { levelid: 1, levelname: "1-5", percent: 0 },
      { levelid: 2, levelname: "6-10", percent: 0 },
    ],
  },
  {
    id: 1,
    stage: 1,
    title: "Vigan Alphabets",
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
