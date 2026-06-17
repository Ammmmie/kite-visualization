import { useState, type ReactNode } from "react";
import { createDefaultKiteDIYConfig } from "../logic/kiteConfig";
import type {
  EdgeKey,
  KiteDIYConfig,
  KiteShape,
  PanelKey,
  SurfacePatternId,
  WhistleEdgeAxisGroupId,
  WhistleFillDensity,
  WhistleLayoutMode,
  WhistleSize,
} from "../types/kite";
import { FramePanel } from "./panels/FramePanel";
import { SurfacePanel } from "./panels/SurfacePanel";
import { WhistlePanel } from "./panels/WhistlePanel";
import { KitePreview } from "./preview/KitePreview";

const panelLabels: Record<PanelKey, string> = {
  frame: "\u9aa8\u67b6",
  surface: "\u7b5d\u9762",
  whistle: "\u54e8\u53e3",
};

interface KiteDIYPageProps {
  mode?: "embedded" | "standalone";
  onBack?: () => void;
  onFinish?: () => void;
}

export function KiteDIYPage({
  mode = "embedded",
  onBack,
  onFinish,
}: KiteDIYPageProps) {
  const isStandalone = mode === "standalone";
  const [config, setConfig] = useState<KiteDIYConfig>(() => createDefaultKiteDIYConfig());
  const [previewEnabled, setPreviewEnabled] = useState(false);
  const [surfaceEnabled, setSurfaceEnabled] = useState(false);
  const [whistlesEnabled, setWhistlesEnabled] = useState(false);
  const [centerPatternSelected, setCenterPatternSelected] = useState(false);
  const [cornerPatternSelected, setCornerPatternSelected] = useState(false);
  const [centerColorCustomized, setCenterColorCustomized] = useState(false);
  const [cornerColorCustomized, setCornerColorCustomized] = useState(false);
  const [hoveredWhistleAxisGroupId, setHoveredWhistleAxisGroupId] =
    useState<WhistleEdgeAxisGroupId | null>(null);

  function setActivePanel(activePanel: PanelKey) {
    if (activePanel === "surface") {
      setPreviewEnabled(true);
      setSurfaceEnabled(true);
    }

    setConfig((currentConfig) => ({
      ...currentConfig,
      activePanel,
    }));
  }

  function updateConfig(updater: (currentConfig: KiteDIYConfig) => KiteDIYConfig) {
    setConfig((currentConfig) => updater(currentConfig));
  }

  function handleShapeChange(kiteShape: KiteShape) {
    setPreviewEnabled(true);
    updateConfig((currentConfig) => ({
      ...currentConfig,
      kiteShape,
    }));
  }

  function handleCenterPatternChange(centerPatternId: SurfacePatternId) {
    setPreviewEnabled(true);
    setSurfaceEnabled(true);
    setCenterPatternSelected(true);
    updateConfig((currentConfig) => ({
      ...currentConfig,
      centerPatternId,
    }));
  }

  function handleCornerPatternChange(cornerPatternId: SurfacePatternId) {
    setPreviewEnabled(true);
    setSurfaceEnabled(true);
    setCornerPatternSelected(true);
    updateConfig((currentConfig) => ({
      ...currentConfig,
      cornerPatternId,
    }));
  }

  function handleSurfaceColorChange(field: SurfaceColorField, value: string) {
    setPreviewEnabled(true);
    setSurfaceEnabled(true);

    if (field === "centerPatternPrimaryColor") {
      setCenterColorCustomized(true);
    }

    if (field === "cornerPatternPrimaryColor") {
      setCornerColorCustomized(true);
    }

    updateConfig((currentConfig) => ({
      ...currentConfig,
      [field]: value,
    }));
  }

  function handleWhistleLayoutChange(whistleLayoutMode: WhistleLayoutMode) {
    setPreviewEnabled(true);
    setWhistlesEnabled(true);
    updateConfig((currentConfig) => ({
      ...currentConfig,
      whistleLayoutMode,
      selectedEdges:
        whistleLayoutMode === "edge" && currentConfig.selectedEdges.length === 0
          ? ["bottom"]
          : currentConfig.selectedEdges,
    }));
  }

  function handleWhistleFillDensityChange(whistleFillDensity: WhistleFillDensity) {
    setPreviewEnabled(true);
    setWhistlesEnabled(true);
    updateConfig((currentConfig) => ({
      ...currentConfig,
      whistleFillDensity,
    }));
  }

  function handleWhistleSizeToggle(whistleSize: WhistleSize) {
    setPreviewEnabled(true);
    setWhistlesEnabled(true);
    updateConfig((currentConfig) => {
      const selectedWhistleSizes = currentConfig.selectedWhistleSizes.includes(whistleSize)
        ? currentConfig.selectedWhistleSizes.filter((selectedSize) => selectedSize !== whistleSize)
        : [...currentConfig.selectedWhistleSizes, whistleSize];

      return {
        ...currentConfig,
        selectedWhistleSizes,
      };
    });
  }

  function handleWhistleAxisGroupToggle(axisGroupId: WhistleEdgeAxisGroupId) {
    setPreviewEnabled(true);
    setWhistlesEnabled(true);
    updateConfig((currentConfig) => {
      const selectedWhistleAxisGroupIds =
        currentConfig.selectedWhistleAxisGroupIds.includes(axisGroupId)
          ? currentConfig.selectedWhistleAxisGroupIds.filter(
              (selectedAxisGroupId) => selectedAxisGroupId !== axisGroupId,
            )
          : [...currentConfig.selectedWhistleAxisGroupIds, axisGroupId];

      return {
        ...currentConfig,
        selectedWhistleAxisGroupIds,
      };
    });
  }

  function handleEdgeToggle(edge: EdgeKey) {
    setPreviewEnabled(true);
    setWhistlesEnabled(true);
    updateConfig((currentConfig) => {
      const selectedEdges = currentConfig.selectedEdges.includes(edge)
        ? currentConfig.selectedEdges.filter((selectedEdge) => selectedEdge !== edge)
        : [...currentConfig.selectedEdges, edge];

      return {
        ...currentConfig,
        selectedEdges,
      };
    });
  }

  return (
    <section className={`diy-page ${isStandalone ? "diy-page-standalone" : "diy-page-embedded"}`}>
      <div className="diy-stage">
        <h1 className="visually-hidden">{"\u5357\u901a\u677f\u9e5e\u98ce\u7b5d DIY Demo"}</h1>

        <KitePreview
          config={config}
          centerPatternSelected={centerPatternSelected}
          cornerPatternSelected={cornerPatternSelected}
          hoveredWhistleAxisGroupId={hoveredWhistleAxisGroupId}
          onWhistleAxisGroupHover={setHoveredWhistleAxisGroupId}
          onWhistleAxisGroupToggle={handleWhistleAxisGroupToggle}
          previewEnabled={previewEnabled}
          surfaceEnabled={surfaceEnabled}
          whistlesEnabled={whistlesEnabled}
        />

        <aside className="control-panel" aria-label="\u53c2\u6570\u9009\u62e9\u9762\u677f">
          <AccordionSection
            isOpen={config.activePanel === "frame"}
            label={panelLabels.frame}
            onToggle={() => setActivePanel("frame")}
          >
            <FramePanel onShapeChange={handleShapeChange} selectedShape={config.kiteShape} />
          </AccordionSection>

          <AccordionSection
            isOpen={config.activePanel === "surface"}
            label={panelLabels.surface}
            onToggle={() => setActivePanel("surface")}
          >
            <SurfacePanel
              centerPatternSelected={centerPatternSelected}
              centerPlaceholderColor={
                centerColorCustomized ? config.centerPatternPrimaryColor : "#B4B4B4"
              }
              config={config}
              cornerPatternSelected={cornerPatternSelected}
              cornerPlaceholderColor={
                cornerColorCustomized ? config.cornerPatternPrimaryColor : "#B4B4B4"
              }
              onCenterPatternChange={handleCenterPatternChange}
              onColorChange={handleSurfaceColorChange}
              onCornerPatternChange={handleCornerPatternChange}
            />
          </AccordionSection>

          <AccordionSection
            isOpen={config.activePanel === "whistle"}
            label={panelLabels.whistle}
            onToggle={() => setActivePanel("whistle")}
          >
            <WhistlePanel
              config={config}
              onDensityChange={handleWhistleFillDensityChange}
              onEdgeToggle={handleEdgeToggle}
              onLayoutChange={handleWhistleLayoutChange}
              onWhistleSizeToggle={handleWhistleSizeToggle}
            />
          </AccordionSection>
        </aside>

        {isStandalone ? (
          <>
            <button className="diy-action-button diy-back-button" onClick={onBack} type="button">
              <span aria-hidden="true">{"\u2190"}</span>
              {"\u8fd4\u56de"}
            </button>
            <button
              className="diy-action-button diy-finish-button"
              onClick={onFinish}
              type="button"
            >
              {"\u5b8c\u6210"}
            </button>
          </>
        ) : null}
      </div>
    </section>
  );
}

export type SurfaceColorField =
  | "centerPatternPrimaryColor"
  | "centerPatternSecondaryColor"
  | "cornerPatternPrimaryColor"
  | "cornerPatternSecondaryColor"
  | "surfaceBaseColor";

interface AccordionSectionProps {
  children: ReactNode;
  isOpen: boolean;
  label: string;
  onToggle: () => void;
}

function AccordionSection({ children, isOpen, label, onToggle }: AccordionSectionProps) {
  const contentId = `panel-${label}`;

  return (
    <section className={`accordion-section${isOpen ? " accordion-section-open" : ""}`}>
      <button
        aria-controls={contentId}
        aria-expanded={isOpen}
        className="accordion-trigger"
        onClick={onToggle}
        type="button"
      >
        <span>{label}</span>
        <span aria-hidden="true" className="accordion-chevron" />
      </button>
      {isOpen ? (
        <div className="accordion-content" id={contentId}>
          {children}
        </div>
      ) : null}
    </section>
  );
}
