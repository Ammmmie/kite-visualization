import type { KiteShape } from "../types/kite";

export interface FrameOption {
  id: KiteShape;
  label: string;
  description: string;
  assetSrc?: string;
}

export const frameOptions: FrameOption[] = [
  {
    id: "hexagon",
    label: "六角星",
    description: "单个基础六角板鹞",
    assetSrc: "/diy-assets/frames/frame-六角星.svg?v=20260614-4",
  },
  {
    id: "seven-star",
    label: "七联星",
    description: "默认选项，由多个单元组合",
    assetSrc: "/diy-assets/frames/frame-七连星.svg",
  },
  {
    id: "nineteen-star",
    label: "十九联星",
    description: "大型多单元组合",
    assetSrc: "/diy-assets/frames/frame-十九连星.svg?v=20260614-2",
  },
  {
    id: "eight-star",
    label: "八角星",
    description: "扩展形制",
    assetSrc: "/diy-assets/frames/frame-八角星.svg?v=20260614-2",
  },
  {
    id: "nine-star",
    label: "九联星",
    description: "多单元组合",
    assetSrc: "/diy-assets/frames/frame-九连星.svg?v=20260614-2",
  },
  {
    id: "twenty-three-star",
    label: "二十三联星",
    description: "八角星基础单元的大型组合",
    assetSrc: "/diy-assets/frames/frame-二十三连星.svg",
  },
];
