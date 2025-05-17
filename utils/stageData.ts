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
    id: 5,
    stage: 5,
    title: "Interpreting a Song",
    type: 1,
    levels: [
      { levelid: 1, levelname: "Song 1", percent: 0 },
      { levelid: 2, levelname: "Song 2", percent: 0 },
      { levelid: 3, levelname: "Song 3", percent: 0 },
    ],
  },
  {
    id: 4,
    stage: 4,
    title: "Simple Phrases",
    type: 1,
    levels: [
      { levelid: 1, levelname: "Greetings", percent: 0 },
      { levelid: 2, levelname: "Questions", percent: 0 },
      { levelid: 3, levelname: "Responses", percent: 0 },
    ],
  },
  {
    id: 3,
    stage: 3,
    title: "Common Words",
    type: 1,
    levels: [
      { levelid: 1, levelname: "People", percent: 0 },
      { levelid: 2, levelname: "Places", percent: 0 },
      { levelid: 3, levelname: "Things", percent: 0 },
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
