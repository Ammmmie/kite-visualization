import type {
  EdgeKey,
  WhistleFillDensity,
  WhistleLayoutMode,
  WhistleSize,
  WhistleType,
} from "../types/kite";

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

export interface WhistleFillDensityOption {
  id: WhistleFillDensity;
  label: string;
}

export interface WhistleSizeOption {
  id: WhistleSize;
  label: string;
  description: string;
}

export const whistleLayoutOptions: WhistleLayoutOption[] = [
  {
    id: "horizontal-staggered",
    label: "覆盖式",
    description: "按传统规律直接叠加完整哨口图层",
  },
  {
    id: "edge",
    label: "边缘式",
    description: "后续按主要横轴、竖轴选择哨口组",
  },
];

export const whistleFillDensityOptions: WhistleFillDensityOption[] = [
  {
    id: "low",
    label: "低",
  },
  {
    id: "mid",
    label: "中",
  },
  {
    id: "high",
    label: "高",
  },
];

export const whistleSizeOptions: WhistleSizeOption[] = [
  {
    id: "small",
    label: "小哨",
    description: "密集的高音小哨",
  },
  {
    id: "medium",
    label: "中哨",
    description: "中等尺寸哨口",
  },
  {
    id: "large",
    label: "大哨",
    description: "底部大哨，固定排列",
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
