export interface PatternOption {
  id: string;
  label: string;
  description: string;
  assetSrc?: string;
}

export interface ColorOption {
  id: string;
  label: string;
  value: string;
}

export const centerPatternOptions: PatternOption[] = [
  {
    id: "cloud",
    label: "云纹",
    description: "默认星中纹样，适合浅色底面",
    assetSrc: "/diy-assets/patterns/center/1.svg",
  },
  {
    id: "flower",
    label: "花纹",
    description: "装饰性星中纹样",
    assetSrc: "/diy-assets/patterns/center/2.svg",
  },
  {
    id: "wave",
    label: "水波",
    description: "连续曲线星中纹样",
    assetSrc: "/diy-assets/patterns/center/3.svg",
  },
  {
    id: "spiral",
    label: "回旋",
    description: "placeholder 星中纹样",
    assetSrc: "/diy-assets/patterns/center/4.svg",
  },
];

export const cornerPatternOptions: PatternOption[] = [
  {
    id: "geometric",
    label: "几何",
    description: "默认星角纹样",
    assetSrc: "/diy-assets/patterns/corner/1.svg",
  },
  {
    id: "traditional-corner",
    label: "传统角花",
    description: "适合边角重复装饰",
    assetSrc: "/diy-assets/patterns/corner/2.svg",
  },
  {
    id: "wing-corner",
    label: "翼角",
    description: "placeholder 星角纹样",
    assetSrc: "/diy-assets/patterns/corner/3.svg",
  },
];

export const defaultColorOptions: ColorOption[] = [
  {
    id: "paper-cream",
    label: "纸本米白",
    value: "#F7F1D4",
  },
  {
    id: "sky-cyan",
    label: "天青",
    value: "#8FD6D0",
  },
  {
    id: "apricot",
    label: "杏橙",
    value: "#FFB36B",
  },
  {
    id: "surface-blue",
    label: "鹞面浅蓝",
    value: "#BFE6E6",
  },
  {
    id: "ink-blue",
    label: "靛蓝",
    value: "#2E5F8A",
  },
];
