import type { KiteShape } from "../types/kite";

interface FrameInfo {
  cn: string;
  en: string;
  title: string;
}

export const frameInfo: Record<KiteShape, FrameInfo> = {
  hexagon: {
    title: "六角星",
    cn: "六角星是南通板鹞中常见的基础单元，结构简洁、重心明确，适合独立成筝，也便于向外连接扩展。",
    en: "The hexagon is a common basic unit in Nantong board kites. Its clear geometry can stand alone or extend into larger formations.",
  },
  "seven-star": {
    title: "七连星",
    cn: "七连星由六角星基础单元组合而成，中心与周边单元形成稳定的星群结构，是板鹞组合形制中的经典样式。",
    en: "Seven-Star is built from repeated hexagonal units, forming a balanced constellation-like structure around a central core.",
  },
  "nineteen-star": {
    title: "十九连星",
    cn: "十九连星继续扩展六角星单元，通过更密集的阵列形成大型板鹞骨架，视觉上更饱满，也更强调整体平衡。",
    en: "Nineteen-Star expands the hexagonal unit into a larger array, creating a fuller frame that depends on strong overall balance.",
  },
  "eight-star": {
    title: "八角星",
    cn: "八角星以八角形为基础，边角更舒展，形态比六角星更开阔，适合作为另一类组合骨架的起点。",
    en: "The octagonal star uses a more open basic unit, creating broader corners and a different rhythm from hexagonal structures.",
  },
  "nine-star": {
    title: "九连星",
    cn: "九连星由八角星基础单元延展组合，强调横竖方向的秩序感，适合呈现规整而有张力的板鹞形态。",
    en: "Nine-Star extends the octagonal unit into an ordered formation with a stronger horizontal and vertical rhythm.",
  },
  "twenty-three-star": {
    title: "二十三连星",
    cn: "二十三连星是八角星基础单元的大型组合，层级丰富、体量更大，适合承载更复杂的鹞面与哨口排列。",
    en: "Twenty-Three-Star is a large formation based on octagonal units, suited for richer surface patterns and whistle layouts.",
  },
};
