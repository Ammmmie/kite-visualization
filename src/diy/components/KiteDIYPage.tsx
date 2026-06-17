import { useState } from "react";
import { frameInfo } from "../data/frameInfo";
import { frameOptions } from "../data/frameOptions";
import { createDefaultKiteDIYConfig, saveKiteConfig } from "../logic/kiteConfig";
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

const diySteps: PanelKey[] = ["frame", "surface", "whistle"];

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
  const [previewEnabled, setPreviewEnabled] = useState(true);
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

  function goToStep(nextPanel: PanelKey) {
    setActivePanel(nextPanel);
  }

  function goToPreviousStep() {
    const currentIndex = diySteps.indexOf(config.activePanel);

    if (currentIndex <= 0) {
      onBack?.();
      return;
    }

    goToStep(diySteps[currentIndex - 1]);
  }

  function goToNextStep() {
    const currentIndex = diySteps.indexOf(config.activePanel);

    if (currentIndex < diySteps.length - 1) {
      goToStep(diySteps[currentIndex + 1]);
      return;
    }

    handleFinish();
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

  function handleFinish() {
    const configForStorage = {
      ...config,
      centerPatternSelected,
      cornerPatternSelected,
      previewEnabled,
      surfaceEnabled,
      whistlesEnabled,
    };

    saveKiteConfig(configForStorage);
    onFinish?.();
  }

  return (
    <section className={`diy-page ${isStandalone ? "diy-page-standalone" : "diy-page-embedded"}`}>
      <div className="diy-stage">
        <h1 className="visually-hidden">{"\u5357\u901a\u677f\u9e5e\u98ce\u7b5d DIY Demo"}</h1>

        <div className="diy-title-lockup" aria-hidden="true">
          <p>制作风筝</p>
          <span className="diy-title-icon diy-title-icon-primary" />
          <span className="diy-title-icon diy-title-icon-muted" />
        </div>

        <nav className="diy-step-tabs" aria-label="DIY 模块">
          {diySteps.map((step) => (
            <button
              aria-pressed={config.activePanel === step}
              className={`diy-step-tab${config.activePanel === step ? " diy-step-tab-active" : ""}`}
              key={step}
              onClick={() => goToStep(step)}
              type="button"
            >
              <span>{panelLabels[step]}</span>
              <span aria-hidden="true" className="diy-step-tab-mark">
                {config.activePanel === step ? "\u00d7" : ""}
              </span>
            </button>
          ))}
        </nav>

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

        <StepDial
          activePanel={config.activePanel}
          onBack={goToPreviousStep}
          onNext={goToNextStep}
        />

        <aside className="diy-info-panel" aria-label="DIY 说明和控制面板">
          <div className="diy-info-header">
            <h2>ABOUT</h2>
            <button className="diy-ok-button" onClick={goToNextStep} type="button">
              OK
            </button>
          </div>

          <div className="diy-info-content">
            {config.activePanel === "frame" ? (
              <FrameAboutContent
                onShapeChange={handleShapeChange}
                selectedShape={config.kiteShape}
              />
            ) : null}

            {config.activePanel === "surface" ? (
              <div className="diy-module-panel diy-module-panel-surface">
                <div className="diy-module-copy">
                  <h3>鹞面</h3>
                  <p>选择星中与星角纹样，并为图案指定颜色。左侧预览会实时叠加到当前骨架上。</p>
                </div>
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
              </div>
            ) : null}

            {config.activePanel === "whistle" ? (
              <div className="diy-module-panel diy-module-panel-whistle">
                <div className="diy-module-copy">
                  <h3>哨口</h3>
                  <p>选择覆盖式密度，或切换边缘式后在左侧风筝主轴上悬停和点击来选择哨口组。</p>
                </div>
                <WhistlePanel
                  config={config}
                  onDensityChange={handleWhistleFillDensityChange}
                  onEdgeToggle={handleEdgeToggle}
                  onLayoutChange={handleWhistleLayoutChange}
                  onWhistleSizeToggle={handleWhistleSizeToggle}
                />
              </div>
            ) : null}
          </div>
        </aside>
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

interface FrameAboutContentProps {
  onShapeChange: (shape: KiteShape) => void;
  selectedShape: KiteShape;
}

function FrameAboutContent({ onShapeChange, selectedShape }: FrameAboutContentProps) {
  const info = frameInfo[selectedShape];

  return (
    <div className="frame-about-content">
      <div className="frame-about-copy">
        <h3>{info.title}</h3>
        <p>{info.cn}</p>
        <p className="frame-about-copy-en">{info.en}</p>
      </div>

      <FramePanel onShapeChange={onShapeChange} selectedShape={selectedShape} />

      <p className="frame-about-hint">
        选择一种基础形状，观察简单的几何单元如何逐步生长为完整的板鹞骨架
      </p>
    </div>
  );
}

interface StepDialProps {
  activePanel: PanelKey;
  onBack: () => void;
  onNext: () => void;
}

function StepDial({ activePanel, onBack, onNext }: StepDialProps) {
  const currentStep = diySteps.indexOf(activePanel) + 1;

  return (
    <div className="diy-step-dial" aria-label={`当前步骤 ${currentStep} / 3`}>
      <button className="diy-step-dial-action diy-step-dial-back" onClick={onBack} type="button">
        <span>back</span>
        <strong>{currentStep}</strong>
        <i aria-hidden="true">{"\u2190"}</i>
      </button>

      <span className="diy-step-dial-divider" aria-hidden="true" />

      <button className="diy-step-dial-action diy-step-dial-next" onClick={onNext} type="button">
        <i aria-hidden="true">{"\u2192"}</i>
        <strong>3</strong>
        <span>next</span>
      </button>
    </div>
  );
}
