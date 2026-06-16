import { useCallback, useState } from "react";
import ImageLightbox from "../components/ImageLightbox.jsx";
import PatternButton from "../components/PatternButton.jsx";
import PatternStrip from "../components/PatternStrip.jsx";
import ProcessIntroSection from "../components/ProcessIntroSection.jsx";
import SectionTitle from "../components/SectionTitle.jsx";
import SkeletonRuleBlock from "../components/SkeletonRuleBlock.jsx";

const assets = {
  ...import.meta.glob("../assets/figma/*.{png,jpg,jpeg,webp}", {
    eager: true,
    query: "?url",
    import: "default"
  }),
  ...import.meta.glob("../assets/figma/\u516b\u89d2\u53d8\u5f62/*.{png,jpg,jpeg,webp}", {
    eager: true,
    query: "?url",
    import: "default"
  }),
  ...import.meta.glob("../assets/figma/\u516d\u89d2\u53d8\u5f62/*.{png,jpg,jpeg,webp}", {
    eager: true,
    query: "?url",
    import: "default"
  }),
  ...import.meta.glob("../assets/figma/\u795e\u8bdd\u4eba\u7269\u7eb9\u6837/*.{png,jpg,jpeg,webp}", {
    eager: true,
    query: "?url",
    import: "default"
  }),
  ...import.meta.glob("../assets/figma/\u52a8\u690d\u7269\u7eb9\u6837/*.{png,jpg,jpeg,webp}", {
    eager: true,
    query: "?url",
    import: "default"
  }),
  ...import.meta.glob("../assets/figma/\u6c11\u95f4\u5de5\u827a\u7eb9\u6837/*.{png,jpg,jpeg,webp}", {
    eager: true,
    query: "?url",
    import: "default"
  })
};

const collator = new Intl.Collator("zh-CN", { numeric: true, sensitivity: "base" });

const folderNames = {
  octagon: "\u516b\u89d2\u53d8\u5f62",
  hexagon: "\u516d\u89d2\u53d8\u5f62",
  people: "\u795e\u8bdd\u4eba\u7269\u7eb9\u6837",
  animal: "\u52a8\u690d\u7269\u7eb9\u6837",
  craft: "\u6c11\u95f4\u5de5\u827a\u7eb9\u6837"
};

const labels = {
  skeletonTopA: "\u9aa8\u67b6",
  skeletonTopB: "\u89c4\u5f8b",
  patternTopA: "\u7b5d\u9762",
  patternTopB: "\u7eb9\u6837",
  octagonTitle: "\u516b\u8fb9\u661f\u5f62",
  hexagonTitle: "\u516d\u8fb9\u661f\u5f62",
  octagonAlt: "\u516b\u89d2\u53d8\u5f62",
  hexagonAlt: "\u516d\u89d2\u53d8\u5f62",
  people: "\u795e\u8bdd\u4eba\u7269\u7eb9\u6837",
  animal: "\u52a8\u690d\u7269\u7eb9\u6837",
  craft: "\u6c11\u95f4\u5de5\u827a\u7eb9\u6837"
};

function figmaAsset(path) {
  const asset = assets[`../assets/figma/${path}`];
  if (!asset) {
    throw new Error(`Missing figma asset: ${path}`);
  }
  return asset;
}

function fileNameFromPath(path) {
  return path.split("/").pop();
}

function assetAlt(path, groupLabel) {
  return `${groupLabel} - ${fileNameFromPath(path).replace(/\.(png|jpe?g|webp)$/i, "")}`;
}

function figmaAssetGroup(folderName, groupLabel) {
  const prefix = `../assets/figma/${folderName}/`;
  return Object.entries(assets)
    .filter(([path]) => path.startsWith(prefix))
    .sort(([a], [b]) => collator.compare(fileNameFromPath(a), fileNameFromPath(b)))
    .map(([path, src]) => {
      const relativePath = path.replace("../assets/figma/", "");
      return {
        src,
        path: relativePath,
        alt: assetAlt(relativePath, groupLabel)
      };
    });
}

const octagonImages = [
  { src: figmaAsset("image 323.png"), x: 67, y: 467, width: 125, height: 125 },
  { src: figmaAsset("image 325.png"), x: 235, y: 472, width: 116, height: 116 },
  { src: figmaAsset("image 327.png"), x: 394, y: 442, width: 175, height: 176 },
  { src: figmaAsset("image 328.png"), x: 635, y: 398, width: 264, height: 264 }
];

const hexagonImages = [
  { src: figmaAsset("image 324.png"), x: 78, y: 912, width: 124, height: 125 },
  { src: figmaAsset("image 326.png"), x: 252, y: 909, width: 98, height: 132 },
  { src: figmaAsset("image 322.png"), x: 409, y: 896, width: 157, height: 157 },
  { src: figmaAsset("image 329.png"), x: 605, y: 843, width: 264, height: 264 }
];

const octagonItems = figmaAssetGroup(folderNames.octagon, labels.octagonAlt);
const hexagonItems = figmaAssetGroup(folderNames.hexagon, labels.hexagonAlt);
const peopleItems = figmaAssetGroup(folderNames.people, labels.people);
const animalItems = figmaAssetGroup(folderNames.animal, labels.animal);
const craftItems = figmaAssetGroup(folderNames.craft, labels.craft);
const titleIcon = figmaAsset("\u5c0ficon1.png");
const buttonIcon = figmaAsset("\u5c0ficon2.png");

export default function SkeletonPatternPage() {
  const [preview, setPreview] = useState(null);

  const openPreview = useCallback((item) => {
    setPreview(item);
  }, []);

  const closePreview = useCallback(() => {
    setPreview(null);
  }, []);

  const scrollToStrip = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest"
    });
  }, []);

  return (
    <main className="skeleton-pattern-page">
      <ProcessIntroSection />

      <div className="skeleton-pattern-stage">
        <div className="skeleton-pattern-stage__canvas">
          <SectionTitle className="skeleton-pattern-stage__title-top" icon={titleIcon}>
            {labels.skeletonTopA}
            <br />
            {labels.skeletonTopB}
          </SectionTitle>

          <SkeletonRuleBlock
            className="skeleton-rule--octagon"
            title={labels.octagonTitle}
            shadowText="octagonal star shape"
            ruleText="Extension rule"
            images={octagonImages}
            transformItems={octagonItems}
            onImageClick={openPreview}
          />

          <SkeletonRuleBlock
            className="skeleton-rule--hexagon"
            title={labels.hexagonTitle}
            shadowText="octagonal star shape"
            ruleText="Extension rule"
            images={hexagonImages}
            transformItems={hexagonItems}
            onImageClick={openPreview}
          />

          <SectionTitle className="skeleton-pattern-stage__title-pattern" icon={titleIcon}>
            {labels.patternTopA}
            <br />
            {labels.patternTopB}
          </SectionTitle>
          <p className="permutation-label">Permutation graphic</p>

          <PatternButton
            className="pattern-button--people"
            icon={buttonIcon}
            onClick={() => scrollToStrip("people-pattern-strip")}
          >
            {labels.people}
          </PatternButton>
          <PatternStrip
            id="people-pattern-strip"
            className="pattern-strip--people"
            label={labels.people}
            detailItems={peopleItems}
            onImageClick={openPreview}
          />

          <PatternButton
            className="pattern-button--animal"
            icon={buttonIcon}
            onClick={() => scrollToStrip("animal-pattern-strip")}
          >
            {labels.animal}
          </PatternButton>
          <PatternStrip
            id="animal-pattern-strip"
            className="pattern-strip--animal"
            label={labels.animal}
            detailItems={animalItems}
            onImageClick={openPreview}
          />

          <PatternButton
            className="pattern-button--craft"
            icon={buttonIcon}
            onClick={() => scrollToStrip("craft-pattern-strip")}
          >
            {labels.craft}
          </PatternButton>
          <PatternStrip
            id="craft-pattern-strip"
            className="pattern-strip--craft"
            label={labels.craft}
            detailItems={craftItems}
            onImageClick={openPreview}
          />
        </div>
      </div>

      <ImageLightbox image={preview?.src} alt={preview?.alt} onClose={closePreview} />
    </main>
  );
}
