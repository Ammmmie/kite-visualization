import { useCallback, useMemo, useState } from "react";
import AutoScrollStrip from "./AutoScrollStrip.jsx";
import StepInfoPopover from "./StepInfoPopover.jsx";
import "../styles/processIntro.css";

import titleIcon from "../assets/figma/小icon1.png?url";
import completeShape from "../assets/figma/process/complete-icon.png?url";

import step01Image from "../assets/figma/process/image 327.png?url";
import step02Image from "../assets/figma/process/image 329.png?url";
import step03Image from "../assets/figma/process/image 331.png?url";
import step04Image from "../assets/figma/process/image 333.png?url";
import step05Image from "../assets/figma/process/image 334.png?url";
import step06Image from "../assets/figma/process/image 335.png?url";
import step07Image from "../assets/figma/process/image 376.png?url";
import step08Image from "../assets/figma/process/image 377.png?url";
import step09Image from "../assets/figma/process/Group 401 2.png?url";
import step10Image from "../assets/figma/process/image 378.png?url";
import step11Image from "../assets/figma/process/image 379.png?url";
import step12Image from "../assets/figma/process/image 380.png?url";
import step13Image from "../assets/figma/process/image 381.png?url";
import step14Image from "../assets/figma/process/image 382.png?url";
import step15Image from "../assets/figma/process/Group 443 1.png?url";
import step16Image from "../assets/figma/process/Group 444 1.png?url";

import step01Gif from "../assets/figma/process-gif/取材.gif?url";
import step02Gif from "../assets/figma/process-gif/劈竹.gif?url";
import step03Gif from "../assets/figma/process-gif/烤制.gif?url";
import step04Gif from "../assets/figma/process-gif/刷清漆.gif?url";
import step05Gif from "../assets/figma/process-gif/定骨.gif?url";
import step06Gif from "../assets/figma/process-gif/扎绑.gif?url";
import step07Gif from "../assets/figma/process-gif/绘制鹞面.gif?url";
import step08Gif from "../assets/figma/process-gif/裁剪鹞面.gif?url";
import step09Gif from "../assets/figma/process-gif/糊面.gif?url";
import step10Gif from "../assets/figma/process-gif/雕刻哨口.gif?url";
import step11Gif from "../assets/figma/process-gif/雕刻哨帽.gif?url";
import step12Gif from "../assets/figma/process-gif/哨口黏合.gif?url";
import step13Gif from "../assets/figma/process-gif/搭建哨口竹架.gif?url";
import step14Gif from "../assets/figma/process-gif/安装哨口哨组.gif?url";
import step15Gif from "../assets/figma/process-gif/安装引线.gif?url";
import step16Gif from "../assets/figma/process-gif/安装鹞尾.gif?url";

const processSteps = [
  {
    number: "01",
    title: "取材",
    fileName: "image 327.png",
    gifFileName: "取材.gif",
    src: step01Image,
    gif: step01Gif,
    image: { width: 356, height: 503 },
    placement: "low",
    offsetY: 42,
    description: "挑选生长周期三年以上的竹子，比如江南笔竹或本地上乘老竹。"
  },
  {
    number: "02",
    title: "劈篾",
    fileName: "image 329.png",
    gifFileName: "劈竹.gif",
    src: step02Image,
    gif: step02Gif,
    image: { width: 383, height: 383 },
    placement: "high",
    offsetY: -64,
    description: "使用劈刀将竹材劈成细薄竹篾，控制宽度和厚薄。"
  },
  {
    number: "03",
    title: "烤竹",
    fileName: "image 331.png",
    gifFileName: "烤制.gif",
    src: step03Image,
    gif: step03Gif,
    image: { width: 357, height: 357 },
    placement: "low",
    offsetY: 54,
    description: "用文火加热竹篾，一边烘烤一边弯折、矫直，使竹篾更容易定型并保持弹性。"
  },
  {
    number: "04",
    title: "刷清漆",
    fileName: "image 333.png",
    gifFileName: "刷清漆.gif",
    src: step04Image,
    gif: step04Gif,
    image: { width: 384, height: 288 },
    placement: "high",
    offsetY: -48,
    description: "毛刷在竹篾表面刷上清漆，起到防潮、防腐和增强耐用性的作用。"
  },
  {
    number: "05",
    title: "定骨",
    fileName: "image 334.png",
    gifFileName: "定骨.gif",
    src: step05Image,
    gif: step05Gif,
    image: { width: 238, height: 298 },
    placement: "low",
    offsetY: 14,
    description: "将处理好的竹篾按照板鹞的几何比例摆放，搭出基本骨架。"
  },
  {
    number: "06",
    title: "绑扎",
    fileName: "image 335.png",
    gifFileName: "扎绑.gif",
    src: step06Image,
    gif: step06Gif,
    image: { width: 342, height: 308 },
    placement: "high",
    offsetY: -72,
    description: "用棉线或细线缠绕骨架交接点，将竹篾固定牢靠。"
  },
  {
    number: "07",
    title: "绘制鹞面",
    fileName: "image 376.png",
    gifFileName: "绘制鹞面.gif",
    src: step07Image,
    gif: step07Gif,
    image: { width: 256, height: 320 },
    placement: "low",
    offsetY: 62,
    description: "根据骨架形状安排纹样，在选定的纸布上绘制板鹞图案。富有韧性的纸或布如牛皮纸、高丽纸、棉布、丝绸。"
  },
  {
    number: "08",
    title: "裁剪鹞面",
    fileName: "image 377.png",
    gifFileName: "裁剪鹞面.gif",
    src: step08Image,
    gif: step08Gif,
    image: { width: 304, height: 380 },
    placement: "high",
    offsetY: -58,
    description: "按照骨架轮廓裁剪纸面或绢面，预留边缘包覆空间，使鹞面能够完整贴合骨架。"
  },
  {
    number: "09",
    title: "糊面",
    fileName: "Group 401 2.png",
    gifFileName: "糊面.gif",
    src: step09Image,
    gif: step09Gif,
    image: { width: 376, height: 369 },
    placement: "low",
    offsetY: 46,
    description: "用毛刷涂胶，将裁好的鹞面覆在骨架上，并压实边缘，使风筝形成完整平面。"
  },
  {
    number: "10",
    title: "雕刻哨口",
    fileName: "image 378.png",
    gifFileName: "雕刻哨口.gif",
    src: step10Image,
    gif: step10Gif,
    image: { width: 403, height: 403 },
    placement: "high",
    offsetY: -66,
    description: "将选定的材料锯开，阳光均匀暴晒，定期翻动使材料得到充分干燥，作为哨口的下半部分。毛竹、本竹、芦苇等管状材料称“哨”；白果、蚕茧、桂圆、鸟蛋和葫芦等球状材料称“口”。"
  },
  {
    number: "11",
    title: "雕刻哨帽",
    fileName: "image 379.png",
    gifFileName: "雕刻哨帽.gif",
    src: step11Image,
    gif: step11Gif,
    image: { width: 360, height: 269 },
    placement: "low",
    offsetY: 38,
    description: "用刻刀在哨面中间斜切，凿出长方形的出风口。"
  },
  {
    number: "12",
    title: "哨口黏合",
    fileName: "image 380.png",
    gifFileName: "哨口黏合.gif",
    src: step12Image,
    gif: step12Gif,
    image: { width: 406, height: 304 },
    placement: "high",
    offsetY: -52,
    description: "哨口和哨帽都刷上清漆防腐后，将两者进行黏合。"
  },
  {
    number: "13",
    title: "搭建哨口竹架",
    fileName: "image 381.png",
    gifFileName: "搭建哨口竹架.gif",
    src: step13Image,
    gif: step13Gif,
    image: { width: 308, height: 385 },
    placement: "low",
    offsetY: 58,
    description: "使用细竹篾在板鹞骨架上继续搭建固定哨口的小竹架，为后续安装哨口提供支撑位置。"
  },
  {
    number: "14",
    title: "安装哨口",
    fileName: "image 382.png",
    gifFileName: "安装哨口哨组.gif",
    src: step14Image,
    gif: step14Gif,
    image: { width: 294, height: 367 },
    placement: "high",
    offsetY: -44,
    description: "将不同大小的哨口/哨组固定到鹞面指定位置，使多个哨口形成有层次的鸣响效果。"
  },
  {
    number: "15",
    title: "安装引线",
    fileName: "Group 443 1.png",
    gifFileName: "安装引线.gif",
    src: step15Image,
    gif: step15Gif,
    image: { width: 309, height: 363 },
    placement: "low",
    offsetY: 50,
    description: "安装、拉伸引线到指定位置，让板鹞在放飞时保持平衡和稳定。"
  },
  {
    number: "16",
    title: "安装鹞尾",
    fileName: "Group 444 1.png",
    gifFileName: "安装鹞尾.gif",
    src: step16Image,
    gif: step16Gif,
    image: { width: 554, height: 797 },
    placement: "final",
    offsetY: 76,
    description: "最后安装鹞尾，用来调整风筝飞行时的重心和姿态，使板鹞升空后更加平稳。"
  }
].map((step) => ({
  ...step,
  id: `process-step-${step.number}`,
  alt: `${step.number} ${step.title}`
}));

const processItems = [
  ...processSteps,
  {
    id: "process-complete",
    type: "complete",
    itemClassName: "process-complete-item",
    title: "完成！",
    ariaLabel: "完成"
  }
];

function getPopoverPosition(rect) {
  const gap = 22;
  const cardWidth = Math.min(360, window.innerWidth - 32);
  const cardHeight = 280;
  const showLeft = rect.right + gap + cardWidth > window.innerWidth;
  const left = showLeft ? Math.max(16, rect.left - cardWidth - gap) : Math.min(rect.right + gap, window.innerWidth - cardWidth - 16);
  const top = Math.max(16, Math.min(rect.top + rect.height * 0.2, window.innerHeight - cardHeight - 16));

  return { left, top };
}

function findProcessStep(item) {
  return processSteps.find((step) => step.id === item.id || step.number === item.number);
}

function ProcessStepCard({ step }) {
  const [isHovered, setIsHovered] = useState(false);
  const imageSrc = isHovered && step.gif ? step.gif : step.src;
  const imageScale = step.placement === "final" ? 0.5 : 0.58;

  return (
    <article
      className={`process-step-card process-step-card--${step.placement}`}
      style={{
        "--process-image-width": `${Math.round(step.image.width * imageScale)}px`,
        "--process-image-height": `${Math.round(step.image.height * imageScale)}px`,
        "--step-offset-y": `${step.offsetY || 0}px`
      }}
      aria-label={`${step.number} ${step.title}`}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="process-step-card__image-frame">
        <img className="process-step-card__image" src={imageSrc} alt={step.alt} draggable="false" />
      </div>
      <div className="process-step-card__label">
        <span className="process-step-card__number">{step.number}</span>
        <span className="process-step-card__name">{step.title}</span>
      </div>
    </article>
  );
}

function ProcessCompleteCard() {
  return (
    <div className="process-complete-card" aria-label="完成">
      <img className="process-complete-card__shape" src={completeShape} alt="完成" draggable="false" />
    </div>
  );
}

export { processSteps };

export default function ProcessIntroSection() {
  const [activeStep, setActiveStep] = useState(null);
  const [popoverPosition, setPopoverPosition] = useState(null);

  const handleProcessClick = useCallback((item, event) => {
    if (item.type === "complete") {
      setActiveStep(null);
      setPopoverPosition(null);
      return;
    }

    const clickedStep = findProcessStep(item);
    if (!clickedStep) {
      return;
    }

    setActiveStep(clickedStep);
    setPopoverPosition(getPopoverPosition(event.currentTarget.getBoundingClientRect()));
  }, []);

  const renderedItems = useMemo(() => processItems, []);

  return (
    <section className="process-intro-section" aria-label="制作流程">
      <div className="process-title-block">
        <img className="process-title-icon" src={titleIcon} alt="" aria-hidden="true" />
        <h2 className="process-title-text">
          <span>制作</span>
          <span>流程</span>
        </h2>
        <p className="process-title-subtitle">octagonal star shape</p>
      </div>

      <AutoScrollStrip
        className="process-auto-strip"
        title="制作流程"
        items={renderedItems}
        initialIndex={0}
        onImageClick={handleProcessClick}
        renderItem={(item) => (item.type === "complete" ? <ProcessCompleteCard /> : <ProcessStepCard step={item} />)}
      />

      <StepInfoPopover step={activeStep} position={popoverPosition} onClose={() => setActiveStep(null)} />
    </section>
  );
}
