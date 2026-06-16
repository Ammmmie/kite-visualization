import { useMemo, useState, type ReactNode } from "react";
import { createDefaultKiteDIYConfig } from "../logic/kiteConfig";
import { generateWhistles } from "../logic/whistleLayout";
import type {
  EdgeKey,
  KiteDIYConfig,
  KiteShape,
  PanelKey,
  SurfacePatternId,
  WhistleLayoutMode,
} from "../types/kite";
import { FramePanel } from "./panels/FramePanel";
import { SurfacePanel } from "./panels/SurfacePanel";
import { WhistlePanel } from "./panels/WhistlePanel";
import { KitePreview } from "./preview/KitePreview";

const panelLabels: Record<PanelKey, string> = {
  frame: "骨架",
  surface: "筝面",
  whistle: "哨口",
};

interface KiteDIYPageProps {
  mode?: "embedded" | "standalone";
}

export function KiteDIYPage({ mode = "embedded" }: KiteDIYPageProps) {
  const isStandalone = mode === "standalone";
  const [config, setConfig] = useState<KiteDIYConfig>(() => createDefaultKiteDIYConfig());
  const [previewEnabled, setPreviewEnabled] = useState(false);
  const [surfaceEnabled, setSurfaceEnabled] = useState(false);
  const [whistlesEnabled, setWhistlesEnabled] = useState(false);
  const [centerPatternSelected, setCenterPatternSelected] = useState(false);
  const [cornerPatternSelected, setCornerPatternSelected] = useState(false);
  const [centerColorCustomized, setCenterColorCustomized] = useState(false);
  const [cornerColorCustomized, setCornerColorCustomized] = useState(false);

  const generatedWhistles = useMemo(() => generateWhistles(config), [config]);
  const previewConfig = useMemo(
    () => ({
      ...config,
      generatedWhistles,
    }),
    [config, generatedWhistles],
  );

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

  function handleWhistleDensityChange(whistleDensity: number) {
    setPreviewEnabled(true);
    setWhistlesEnabled(true);
    updateConfig((currentConfig) => ({
      ...currentConfig,
      whistleDensity,
    }));
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
        <h1 className="visually-hidden">南通板鹞风筝 DIY Demo</h1>

        <KitePreview
          config={previewConfig}
          centerPatternSelected={centerPatternSelected}
          cornerPatternSelected={cornerPatternSelected}
          previewEnabled={previewEnabled}
          surfaceEnabled={surfaceEnabled}
          whistlesEnabled={whistlesEnabled}
        />

        <aside className="control-panel" aria-label="参数选择面板">
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
              config={previewConfig}
              onDensityChange={handleWhistleDensityChange}
              onEdgeToggle={handleEdgeToggle}
              onLayoutChange={handleWhistleLayoutChange}
            />
          </AccordionSection>
        </aside>

        {isStandalone ? (
          <>
            <button className="diy-action-button diy-back-button" type="button">
              <span aria-hidden="true">←</span>
              返回
            </button>
            <button className="diy-action-button diy-finish-button" type="button">
              完成
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
