import type { EdgeKey, WhistleLayoutMode, WhistleType } from "../types/kite";

export interface WhistleLayoutOption {
  id: WhistleLayoutMode;
  label: string;
  description: string;
}

export interface EdgeOption {
  id: EdgeKey;
  label: string;
}

export interface WhistleTypeOption {
  id: WhistleType;
  label: string;
  soundLayer: string;
  size: number;
  iconSrc: string;
}

export const whistleLayoutOptions: WhistleLayoutOption[] = [
  {
    id: "horizontal-staggered",
    label: "横向交错排列",
    description: "哨口以多行形式分布在板鹞内部，适合表现内部合鸣",
  },
  {
    id: "edge",
    label: "边缘排列",
    description: "哨口沿选中边缘分布，适合表现边缘鸣响",
  },
];

export const edgeOptions: EdgeOption[] = [
  {
    id: "top",
    label: "上",
  },
  {
    id: "right",
    label: "右",
  },
  {
    id: "bottom",
    label: "下",
  },
  {
    id: "left",
    label: "左",
  },
];

export const whistleTypeOptions: WhistleTypeOption[] = [
  {
    id: "low",
    label: "低音",
    soundLayer: "低音层",
    size: 18,
    iconSrc: "/diy-assets/whistles/whistle.png",
  },
  {
    id: "mid",
    label: "中音",
    soundLayer: "中音层",
    size: 14,
    iconSrc: "/diy-assets/whistles/whistle.png",
  },
  {
    id: "high",
    label: "高音",
    soundLayer: "高音层",
    size: 10,
    iconSrc: "/diy-assets/whistles/whistle.png",
  },
];
