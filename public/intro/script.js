(function () {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const container = document.querySelector(".scroll-container");
  const fog = document.getElementById("fog");
  const warm = document.getElementById("warm");
  const vignette = document.querySelector(".vignette");
  const bar = document.getElementById("bar");
  const seaLabel = document.getElementById("seaLabel");
  const heroUi = document.getElementById("heroUi");
  const uiGroup1 = document.getElementById("uiGroup1");
  const uiIcon = document.getElementById("uiIcon");
  const uiGroup2 = document.getElementById("uiGroup2");
  const uiPoem = document.getElementById("uiPoem");
  const uiPlay = document.getElementById("uiPlay");
  const skyTitle = document.getElementById("skyTitle");
  const cloudText1 = document.getElementById("cloudText1");
  const cloudText2 = document.getElementById("cloudText2");
  const farmText3 = document.getElementById("farmText3");
  const farmText4 = document.getElementById("farmText4");
  const seaCanvas = document.getElementById("seaCanvas");
  const farmScroll = document.getElementById("farmScroll");
  const farmStage = document.getElementById("farmStage");
  const farmBg = document.getElementById("farmBg");
  const farmFront = document.getElementById("farmFront");
  const farmHaze = document.getElementById("farmHaze");
  const zoomScroll = document.getElementById("zoomScroll");
  const zoomStage = document.getElementById("zoomStage");
  const zoomFarmBg = document.getElementById("zoomFarmBg");
  const zoomBlueGrade = document.getElementById("zoomBlueGrade");
  const kiteCoverScroll = document.getElementById("kiteCoverScroll");
  const kiteCoverStage = document.getElementById("kiteCoverStage");
  const kiteCoverSky = document.querySelector(".kite-cover-sky");
  const kiteCoverFarm = document.getElementById("kiteCoverFarm");
  const kiteCoverText = document.getElementById("kiteCoverText");
  const kiteFinalText = document.getElementById("kiteFinalText");
  const kiteCover = document.getElementById("kiteCover");
  const skyKite1 = document.getElementById("skyKite1");
  const skyKite3 = document.getElementById("skyKite3");
  const beachScroll = document.getElementById("beachScroll");
  const beachStage = document.getElementById("beachStage");
  const beachBg = document.getElementById("beachBg");
  const beachFront = document.getElementById("beachFront");
  const beachText = document.getElementById("beachText");
  const beachTextTitle = document.getElementById("beachTextTitle");
  const beachTextBless = document.getElementById("beachTextBless");
  const beachNext = document.getElementById("beachNext");
  const kite = document.getElementById("kite");
  const loader = document.getElementById("loader");
  const loaderFill = document.getElementById("loaderFill");
  const params = new URLSearchParams(window.location.search);
  const returningFromMain = params.has("fromMain");
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  if (returningFromMain) history.replaceState(null, "", "/intro/index.html");
  let titleActive = false;
  let mainSiteRequested = false;
  let allowMainTransition = !returningFromMain;
  let lastScrollY = window.scrollY;

  const layers = Array.from(document.querySelectorAll(".layer")).map((el) => {
    const getNumber = (key) => Number.parseFloat(el.dataset[key] ?? 0);

    return {
      el,
      fromY: getNumber("fromY"),
      toY: getNumber("toY"),
      fromX: getNumber("fromX"),
      toX: getNumber("toX"),
      fromS: el.dataset.fromS !== undefined ? getNumber("fromS") : 1,
      toS: el.dataset.toS !== undefined ? getNumber("toS") : 1,
      fromO: getNumber("fromO"),
      toO: getNumber("toO"),
      oStart: getNumber("oStart"),
      oEnd: getNumber("oEnd"),
      moveStart: Math.max(0, getNumber("oStart") - 0.18),
      moveEnd: el.dataset.oEnd !== undefined ? getNumber("oEnd") : 1,
      hasOBlend: el.dataset.fromO !== undefined,
      ease: el.dataset.ease || "inout",
      wcOn: false,
    };
  });

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const lerp = (start, end, progress) => start + (end - start) * progress;
  const mixColor = (from, to, progress) =>
    `rgb(${from.map((value, index) => Math.round(lerp(value, to[index], progress))).join(", ")})`;
  const easeInOut = (progress) =>
    progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
  // 减速缓动：起步快、收尾慢，适合飘入/升起的柔和落定感
  const easeOut = (progress) => 1 - Math.pow(1 - progress, 3);
  const easeFns = { inout: easeInOut, out: easeOut };
  const segEase = (progress, start, end) => easeInOut(clamp((progress - start) / (end - start), 0, 1));
  // 按指定缓动名计算分段进度
  const segEaseBy = (name, progress, start, end) =>
    (easeFns[name] || easeInOut)(clamp((progress - start) / (end - start), 0, 1));
  const q = (n) => Math.round(n * 100) / 100;
  function goToMainSite() {
    if (mainSiteRequested) return;
    mainSiteRequested = true;
    const target =
      window.location.protocol === "file:"
        ? "http://localhost:5173/?intro=1"
        : `${window.location.origin}/?intro=1`;
    window.location.href = target;
  }

  const point = (a, b, t) => ({
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    s: lerp(a.s, b.s, t),
    r: lerp(a.r, b.r, t),
  });

  // 风筝动线（hero 第一屏，含海面+云层两段）：
  // 海面段末尾从右上方出现 → 伴随云聚拢向左飞 → 聚拢完成定格在画面左边。
  // 定格后保持可见，由第二屏 getFarmKite 接手向下飞入农庄（全程不淡出）。
  // x/y 为相对视口的 translate 偏移（vw/vh），flip 表示是否水平镜像。
  function getHeroKite(raw) {
    // enter：海面段末尾从右上方偏右出现；settled：云聚拢完成后定格画面左边
    const enter = { x: 68, y: 16, s: 0.94, r: -8 };    // 右上方偏右
    const settled = { x: 12, y: 26, s: 1.04, r: 6 };   // 左边定格位
    let state;

    // 海面段末尾(0.16)开始动，向左飞放得很慢，几乎贯穿整个第一屏到接近末尾(0.92)
    // 用 inout 缓动：两头慢、中间匀，整体更平缓不突兀
    if (raw < 0.92) {
      state = point(enter, settled, segEaseBy("inout", raw, 0.16, 0.92));
    } else {
      // 接近末尾定格画面左边，停住等散开转场接手
      state = settled;
    }

    // 0.16→0.28 淡入；之后全程保持可见（不淡出，连贯到农庄转场）
    const opacity = segEase(raw, 0.16, 0.28);

    state.r += Math.sin(raw * Math.PI * 6) * 1.0;
    return { ...state, opacity: q(opacity), flip: true };
  }

  // 风筝动线（第二屏农庄转场）：接续第一屏左边定格位，
  // 伴随云层散开飞到农庄天空偏右上定格。全程保持可见，不淡入淡出。
  // x/y 为相对视口的 translate 偏移（vw/vh），flip 表示是否水平镜像。
  function getFarmKite(farmRaw) {
    // 起点 = 第一屏 getHeroKite 的左边定格位，保证跨屏连贯不跳变
    const emerge = { x: 12, y: 26, s: 1.04, r: 6 };    // 接第一屏左边定格位
    const settled = { x: 34, y: 18, s: 1.04, r: -4 };  // 农庄天空定格位（偏右上，落在天空不进田地）
    let state;

    if (farmRaw < 0.6) {
      // 伴随云散开向下飞入农庄
      state = point(emerge, settled, segEaseBy("out", farmRaw, 0, 0.6));
    } else {
      // 飞入农庄后定格停住，不再离场
      state = settled;
    }

    state.r += Math.sin(farmRaw * Math.PI * 5) * 0.9;
    // 转场全程可见，opacity 恒为 1
    return { ...state, opacity: 1, flip: true };
  }

  function getCloudScatter(el, raw) {
    // 节奏：聚拢(~0.68聚齐) → 停顿(0.68→0.80，阳光此时到达，云层完整定格一拍)
    // → 散开(0.80→1.0，与农庄天空揭开咬合：云往两边散的同时农庄从云缝浮现)。
    if (el.classList.contains("cloud-front")) {
      // 最前层先动，幅度最大：向下沉 + 放大虚化淡出
      const s = segEaseBy("out", raw, 0.80, 0.96);
      if (s <= 0) return { x: 0, y: 0, s: 1, o: 1 };
      return { x: -8 * s, y: 12 * s, s: lerp(1, 1.1, s), o: lerp(1, 0, s) };
    }
    if (el.classList.contains("cloud-left")) {
      // 左云：稍后向左飘出，轻微上浮、收缩
      const s = segEaseBy("out", raw, 0.83, 1.0);
      if (s <= 0) return { x: 0, y: 0, s: 1, o: 1 };
      return { x: -44 * s, y: -7 * s, s: lerp(1, 0.93, s), o: lerp(1, 0.16, s) };
    }
    if (el.classList.contains("cloud-right")) {
      // 右云：再错开一拍，向右飘出
      const s = segEaseBy("out", raw, 0.86, 1.0);
      if (s <= 0) return { x: 0, y: 0, s: 1, o: 1 };
      return { x: 48 * s, y: -5 * s, s: lerp(1, 0.93, s), o: lerp(1, 0.16, s) };
    }
    if (el.classList.contains("cloud-mist")) {
      // 薄雾：缓慢膨胀化开淡出，贯穿整段
      const s = segEaseBy("out", raw, 0.82, 1.0);
      if (s <= 0) return { x: 0, y: 0, s: 1, o: 1 };
      return { x: 0, y: -4 * s, s: lerp(1, 1.14, s), o: lerp(1, 0.1, s) };
    }
    if (el.classList.contains("cloud-back")) {
      // 最后层最晚、最慢，几乎不位移，纯靠淡出（远处云慢慢退去）
      const s = segEaseBy("out", raw, 0.88, 1.0);
      if (s <= 0) return { x: 0, y: 0, s: 1, o: 1 };
      return { x: 0, y: 0, s: lerp(1, 1.05, s), o: lerp(1, 0.28, s) };
    }
    return { x: 0, y: 0, s: 1, o: 1 };
  }

  // ===================== WebGL 海面波纹 =====================
  // 整段扭曲在 GPU 的 fragment shader 内并行完成，CPU 几乎零负担。
  const Sea = (function () {
    if (!seaCanvas) return null;
    const gl = seaCanvas.getContext("webgl", {
      antialias: true,
      alpha: true,
      premultipliedAlpha: true,
      powerPreference: "high-performance",
    });
    if (!gl) return null;

    const vsrc =
      "attribute vec2 a_pos;varying vec2 v_uv;" +
      "void main(){v_uv=a_pos*0.5+0.5;v_uv.y=1.0-v_uv.y;gl_Position=vec4(a_pos,0.0,1.0);}";

    const fsrc =
      "precision mediump float;varying vec2 v_uv;" +
      "uniform sampler2D u_tex;uniform float u_time;uniform float u_alpha;uniform bool u_ready;" +
      // 可调参数（取自需求建议区间的中间值，平静镜面湖）
      "const float WAVE_HEIGHT=0.032;" +      // 波纹幅度（调低，海面更平）
      "const float WAVE_SPEED=0.80;" +        // 流动速度（调快）
      "const float NORMAL_STRENGTH=0.08;" +   // 法线强度（调低，起伏更平）
      "const float REFLECT_DISTORT=0.045;" +  // 倒影扭曲（随之略降）
      "const float FRESNEL_POWER=3.0;" +      // Fresnel 幂 2.0-4.0
      "const float SHIMMER=0.06;" +           // 柔和高光强度
      // ---- value noise ----
      "float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}" +
      "float vnoise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);" +
      " float a=hash(i),b=hash(i+vec2(1.0,0.0)),c=hash(i+vec2(0.0,1.0)),d=hash(i+vec2(1.0,1.0));" +
      " return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}" +
      // 三层叠加：横向拉伸（x 频率高、y 频率低 → 波纹沿水平展开），各层不同速度缓慢移动
      "float waveField(vec2 uv,float t){" +
      "  float n=0.0;" +
      "  n+=vnoise(uv*vec2(7.0,2.2)+vec2(t*0.6,t*0.15))*0.55;" +
      "  n+=vnoise(uv*vec2(14.0,4.0)+vec2(-t*0.4,t*0.1))*0.30;" +
      "  n+=vnoise(uv*vec2(26.0,7.0)+vec2(t*0.25,-t*0.08))*0.15;" +
      "  return n;}" +
      "void main(){" +
      "  if(!u_ready){gl_FragColor=vec4(0.0);return;}" +
      "  vec2 uv=v_uv;float t=u_time*WAVE_SPEED;" +
      // 远密近疏：上方（远处 uv.y 小）密而细，下方（近处）稍清晰
      "  float depth=smoothstep(0.40,1.0,uv.y);" +      // 0=远 1=近，水面只在下半部
      "  float denseScale=mix(1.6,1.0,depth);" +         // 远处频率更高
      "  vec2 wuv=uv*denseScale;" +
      // 噪声场 + 数值微分求伪法线
      "  float e=0.0025;" +
      "  float h0=waveField(wuv,t);" +
      "  float hx=waveField(wuv+vec2(e,0.0),t);" +
      "  float hy=waveField(wuv+vec2(0.0,e),t);" +
      "  vec2 grad=vec2(hx-h0,hy-h0)/e;" +
      // 幅度随远近衰减，整体很低
      "  float amp=WAVE_HEIGHT*mix(0.5,1.0,depth);" +
      "  vec2 nrm=grad*NORMAL_STRENGTH*amp;" +
      // 倒影扭曲：用法线偏移采样贴图，横向扭曲更明显（水面反射沿水平拉伸）
      "  vec2 disp=vec2(nrm.x*1.3,nrm.y)*REFLECT_DISTORT*20.0;" +
      "  disp*=depth;" +                                  // 远处几乎镜面，近处略扰
      "  vec4 c=texture2D(u_tex,uv+disp);" +
      // 忠实还原原图颜色：不提亮、不叠高光、不去饱和，保持原图的通透鲜亮
      "  vec3 col=c.rgb;" +
      // 远处雾化：水面上缘向天空色淡入融合
      "  float fog=smoothstep(0.44,0.58,uv.y);" +
      // 左右两侧渐隐
      "  float edgeX=smoothstep(0.0,0.08,uv.x)*smoothstep(1.0,0.75,uv.x);" +
      "  float a=c.a*u_alpha*fog*edgeX;" +
      "  gl_FragColor=vec4(col*a,a);" +
      "}";

    function compile(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error("shader:", gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    }

    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vsrc));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fsrc));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uAlpha = gl.getUniformLocation(prog, "u_alpha");
    const uReady = gl.getUniformLocation(prog, "u_ready");

    let texReady = false;
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    // 加载前先放一个 1x1 透明像素，避免未就绪时报错
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));

    const img = new Image();
    img.onload = function () {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      // 非 2 次幂纹理（如 1920x1080）必须用 CLAMP_TO_EDGE，否则 WebGL1 采样失败变黑
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      texReady = true;
      // 贴图就绪后主动补画一帧（初始海面不透明），避免循环恰好停在未就绪状态
      draw(1);
    };
    img.onerror = function () {
      console.error("sea-front.png 加载失败");
    };
    img.src = "./assert/sea-front.png";

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(seaCanvas.clientWidth * dpr);
      const h = Math.round(seaCanvas.clientHeight * dpr);
      if (seaCanvas.width !== w || seaCanvas.height !== h) {
        seaCanvas.width = w;
        seaCanvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    }

    const start = performance.now();
    function draw(alpha) {
      resize();
      gl.useProgram(prog);
      gl.uniform1f(uTime, (performance.now() - start) / 1000);
      gl.uniform1f(uAlpha, alpha);
      gl.uniform1i(uReady, texReady ? 1 : 0);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    return { draw, resize };
  })();

  // 渲染开关：仅在海面可见时跑 WebGL，滚走即停
  let seaRaf = null;
  let seaAlpha = 1;
  function seaLoop() {
    seaRaf = requestAnimationFrame(seaLoop);
    if (Sea) Sea.draw(seaAlpha);
  }
  function startSea() {
    if (seaRaf === null && Sea) seaRaf = requestAnimationFrame(seaLoop);
  }
  function stopSea() {
    if (seaRaf !== null) {
      cancelAnimationFrame(seaRaf);
      seaRaf = null;
    }
  }

  // ===================== 三个风筝的可调参数 =====================
  // zoom-kite（主风筝）：落点偏移(vw/vh) + 缩小后定格尺寸 + 轻晃幅度
  // sky-kite-1 / sky-kite-3：left/top 百分比 + 宽度(px) + 轻晃幅度
  const kiteConfig = {
    zoom: { x: -12.5, y: 40, scale: 0.76, rot: -28.5, swayX: 0.9, swayY: 0.6, swayR: 1.2 },
    // sky1 / sky3 现在会「飞入」：fromX/fromY 为进场起点偏移(vw/vh)，
    // inStart/inEnd 为各自飞入的 coverRaw 时间窗。主风筝 0.80 已定格，
    // 两只在其后依次飞入：sky1 (0.80→0.89) 先，sky3 (0.88→0.98) 后。
    // 进场偏移加大、起点拉到屏外，飞入动势更明显。
    sky1: { left: 23.5, top: 0, width: 1200, swayX: 0.5, swayY: 0.5, swayR: 0,
            fromX: -70, fromY: -30, fromRot: -22, inStart: 0.80, inEnd: 0.89 },
    sky3: { left: 62.5, top: 9, width: 727, swayX: 0.2, swayY: 2.3, swayR: 2.4,
            fromX: 78, fromY: -34, fromRot: 26, inStart: 0.88, inEnd: 0.98 },
  };

  // ===================== 滚动视差主循环 =====================
  let raf = null;
  // 风筝落定后需持续轻晃：即使没有滚动也要保持帧循环
  let swayActive = false;

  function tick() {
    raf = null;
    const currentScrollY = window.scrollY;
    const scrollDelta = currentScrollY - lastScrollY;
    const scrollingDown = scrollDelta > 2;
    const scrollingUp = scrollDelta < -2;

    const rect = container.getBoundingClientRect();
    const total = Math.max(1, rect.height - window.innerHeight);
    const raw = clamp(-rect.top / total, 0, 1);
    const progress = easeInOut(raw);
    let fieldTransitionBg = 0;
    let currentZoomRaw = 0;
    if (zoomScroll) {
      const zoomRect = zoomScroll.getBoundingClientRect();
      const zoomTotal = Math.max(1, zoomRect.height - window.innerHeight);
      currentZoomRaw = clamp(-zoomRect.top / zoomTotal, 0, 1);
    }

    for (const layer of layers) {
      const layerProgress = layer.hasOBlend
        ? segEaseBy(layer.ease, raw, layer.moveStart, layer.moveEnd)
        : progress;
      const y = lerp(layer.fromY, layer.toY, layerProgress);
      const x = lerp(layer.fromX, layer.toX, layerProgress);
      const scale = lerp(layer.fromS, layer.toS, layerProgress);
      const scatter = getCloudScatter(layer.el, raw);
      layer.el.style.transform = `translate3d(${x + scatter.x}vw, ${y + scatter.y}vh, 0) scale(${scale * scatter.s})`;

      if (layer.hasOBlend) {
        const opacityProgress = segEase(raw, layer.oStart, layer.oEnd);
        let o = q(lerp(layer.fromO, layer.toO, opacityProgress) * scatter.o);
        // light-glow 用 screen 混合且 PNG 透明区 RGB 非黑，到明亮的农庄屏会显出
        // 一块矩形白。它是第一屏的阳光效果，云散开时就该退场，故后期强制淡出归零。
        if (layer.el.classList.contains("light-glow")) {
          o *= 1 - segEase(raw, 0.84, 0.96);
        }
        // sea-front 是 WebGL canvas，透明度交给 shader 的 u_alpha 处理，
        // 避免 canvas 整体 opacity 与 GL 内部混合叠加导致发灰
        if (layer.el === seaCanvas) {
          seaAlpha = o;
        } else {
          layer.el.style.opacity = o;
        }

        const active = raw >= layer.moveStart - 0.05 && raw <= layer.moveEnd + 0.05;
        if (active !== layer.wcOn) {
          layer.el.style.willChange = active ? "transform, opacity" : "auto";
          layer.wcOn = active;
        }
      }
    }

    let fogOpacity = 0;
    if (raw > 0.32 && raw < 0.58) {
      const t = clamp((raw - 0.32) / 0.26, 0, 1);
      fogOpacity = Math.sin(t * Math.PI) * 0.85;
    }

    const heroEffectFade = 1 - segEase(raw, 0.76, 0.94);
    fog.style.opacity = q(fogOpacity * heroEffectFade);
    warm.style.opacity = q(segEase(raw, 0.5, 0.86) * 0.72 * heroEffectFade);
    if (vignette) vignette.style.opacity = q(heroEffectFade);
    // 整组开场 UI 随海面淡出（提前淡出，0.05→0.35）
    if (heroUi) heroUi.style.opacity = q(1 - segEase(raw, 0.05, 0.35));

    // 云层屏浮现文字：随云聚拢依次淡入(0.46起)，随云散开统一淡出(0.80→0.92)
    // 与终幕 skyTitle(0.8→1) 错开：散开期文字退场、标题接力，不撞车
    if (cloudText1 || cloudText2) {
      const cloudOut = 1 - segEase(raw, 0.80, 0.92); // 随散开淡出
      // 文字1 先（淡入 0.46→0.56）
      const c1In = segEaseBy("out", raw, 0.46, 0.56);
      const c1 = c1In * cloudOut;
      // 文字2 后（淡入 0.56→0.66）
      const c2In = segEaseBy("out", raw, 0.56, 0.66);
      const c2 = c2In * cloudOut;
      if (cloudText1) {
        cloudText1.style.opacity = q(c1);
        // 淡入时上移落定 +14→0，淡出时上飘 0→-12
        const rise1 = (1 - c1In) * 14 - (1 - cloudOut) * 12;
        cloudText1.style.transform = `translateY(${q(rise1)}px)`;
        cloudText1.style.willChange = c1 > 0.01 ? "opacity, transform" : "auto";
      }
      if (cloudText2) {
        cloudText2.style.opacity = q(c2);
        const rise2 = (1 - c2In) * 14 - (1 - cloudOut) * 12;
        cloudText2.style.transform = `translateY(${q(rise2)}px)`;
        cloudText2.style.willChange = c2 > 0.01 ? "opacity, transform" : "auto";
      }
    }

    const titleProgress = segEase(raw, 0.8, 1);
    skyTitle.style.opacity = q(titleProgress);
    skyTitle.style.transform = `translateY(${(1 - titleProgress) * 18}px)`;

    if (titleProgress > 0.25 && !titleActive) {
      skyTitle.classList.add("active");
      titleActive = true;
    } else if (titleProgress <= 0.05 && titleActive) {
      skyTitle.classList.remove("active");
      titleActive = false;
    }

    bar.style.width = `${raw * 100}%`;

    // 海面可见时跑 WebGL，滚到云层区彻底停掉省电
    if (raw < 0.72 && seaAlpha > 0.01) {
      startSea();
    } else {
      stopSea();
    }

    // ---- 风筝动线（第一屏云层聚拢时出现 → 第二屏农庄定格） ----
    if (kite) {
      let fk = null;
      let followY = 0;
      let kiteFade = 1; // farm 推进失焦开始时风筝淡出
      if (farmScroll) {
        const fr = farmScroll.getBoundingClientRect();
        const ft = Math.max(1, fr.height - window.innerHeight);
        const farmRawForKite = clamp(-fr.top / ft, 0, 1);
        // 第二屏推进到一定程度才接管，否则仍由第一屏 raw 驱动
        if (farmRawForKite > 0.02) {
          fk = getFarmKite(farmRawForKite);
          // 与农庄天空相对静止：农庄 stage sticky 钉住时不动，
          // 被底部内容顶上去时风筝跟着上移，绝不悬浮在后续内容上。
          if (farmStage) {
            const sr = farmStage.getBoundingClientRect();
            // stage 顶部离开视口顶部的距离（vh），钉住时≈0，上滚时为负
            followY = (sr.top / window.innerHeight) * 100;
          }
          // 镜头开始推进草地(farmRaw≈0.5)、画面将要失焦前，风筝淡出消失
          kiteFade = 1 - segEase(farmRawForKite, 0.5, 0.62);
        } else {
          fk = getHeroKite(raw);
        }
      } else {
        fk = getHeroKite(raw);
      }
      const flip = fk.flip ? " scaleX(-1)" : "";
      kite.style.transform =
        `translate3d(${fk.x}vw, ${fk.y + followY}vh, 0) rotate(${fk.r}deg) scale(${fk.s})${flip}`;
      kite.style.opacity = q(fk.opacity * kiteFade);
      // 完全透明、或随农庄上移到视口外时彻底移除渲染，杜绝悬浮在后续内容上
      const offTop = fk.y + followY < -30;
      kite.style.display = fk.opacity * kiteFade <= 0.01 || offTop ? "none" : "block";
      kite.style.willChange = fk.opacity * kiteFade > 0.01 ? "transform, opacity" : "auto";
    }

    if (farmScroll && farmStage && farmBg && farmFront && farmHaze) {
      const farmRect = farmScroll.getBoundingClientRect();
      const farmTotal = Math.max(1, farmRect.height - window.innerHeight);
      const farmRaw = clamp(-farmRect.top / farmTotal, 0, 1);
      const farmProgress = easeInOut(farmRaw);
      // 农庄素材顶部带半透明浅色天空，长时间整屏淡入会像一块白色遮罩。
      // 等云层真正散开后再用较短的过渡接入农庄，保留浮现感但避免大面积泛白。
      const farmReveal = segEaseBy("out", farmRaw, 0.12, 0.42);
      const bgScale = lerp(1.12, 1, farmProgress);
      const bgY = lerp(3, -2, farmProgress);

      // 末段镜头推进草地：farmFront 加速放大怼进画面（前 70% 平缓上移，后段急推放大）
      const push = segEaseBy("in", farmRaw, 0.55, 1); // 0→1，后段才发力
      // 主要靠放大铺满，上移幅度收小，避免图片顶边离开画面露出底色分界线
      const frontY = lerp(52, -34, farmProgress) - push * 60;
      const frontScale = lerp(1.01, 1.08, farmProgress) + push * 2.2; // 末尾约 scale 3.3，铺满整屏
      // 末段失焦：与放大解耦，单独用更晚的起点(0.7)和 inout 缓动，让模糊上得更慢更平。
      // 放大(push)照旧推进画面，只是虚化推迟发力，避免“一放大就糊”的突兀感。
      const blurProgress = segEaseBy("inout", farmRaw, 0.7, 1);
      const farmBlur = blurProgress * 13; // 末尾约 13px 模糊（略降峰值）
      // 末段淡出：不再让 farmStage 在自身末段就淡到 0，否则在 zoom 段还没盖满的
      // 空窗期会露出 body 的浅绿过渡底色（那块突兀的浅绿大方块）。
      // farmStage(z30) 在 zoomStage(z31) 之下，只要它不透明就会被随后淡入的 zoom
      // 完全盖住，因此把淡出改为“跟随 zoom 淡入进度反向撤场”——zoom 盖到哪、farm 撤到哪，
      // 全程没有两层都不在的空窗，底色不会再露出来。
      const zoomCoverForFarm = segEaseBy("out", currentZoomRaw, 0.04, 0.34);
      const farmFade = 1 - zoomCoverForFarm;
      fieldTransitionBg = Math.max(
        fieldTransitionBg,
        segEaseBy("out", farmRaw, 0.78, 0.94) * (1 - segEase(currentZoomRaw, 0.38, 0.72))
      );

      farmStage.style.opacity = q(farmReveal * farmFade);
      farmBg.style.transform = `translate3d(0, ${bgY}vh, 0) scale(${bgScale})`;
      farmFront.style.transform = `translate3d(0, ${frontY}px, 0) scale(${frontScale})`;
      farmFront.style.filter = farmBlur > 0.2 ? `blur(${farmBlur}px)` : "none";
      // farm-haze 这层晨雾的矩形渐变边界会造成可见浅色遮罩，CSS 和 JS 双保险关闭。
      farmHaze.style.opacity = 0;

      // farmStage 浮现文字：依次淡入(文字3先、文字4后)，随镜头下滑推进(push)统一淡出
      // 注意：farmText 是 farmStage 子元素，stage 自身 opacity 会叠加，故文字淡入放在 stage 基本可见后
      if (farmText3 || farmText4) {
        const fOut = 1 - segEaseBy("out", farmRaw, 0.50, 0.62); // 赶在 push 推走画面前退场
        const f3In = segEaseBy("out", farmRaw, 0.30, 0.42);     // 文字3 先
        const f4In = segEaseBy("out", farmRaw, 0.42, 0.54);     // 文字4 后（依次）
        const f3 = f3In * fOut;
        const f4 = f4In * fOut;
        if (farmText3) {
          farmText3.style.opacity = q(f3);
          // 淡入上移落定 +14→0；淡出随镜头上推向上飘 0→-16
          const r3 = (1 - f3In) * 14 - (1 - fOut) * 16;
          farmText3.style.transform = `translateY(${q(r3)}px)`;
          farmText3.style.willChange = f3 > 0.01 ? "opacity, transform" : "auto";
        }
        if (farmText4) {
          farmText4.style.opacity = q(f4);
          const r4 = (1 - f4In) * 14 - (1 - fOut) * 16;
          farmText4.style.transform = `translateY(${q(r4)}px)`;
          farmText4.style.willChange = f4 > 0.01 ? "opacity, transform" : "auto";
        }
      }

      if (returningFromMain && !allowMainTransition && scrollingUp && farmRaw < 0.96) {
        allowMainTransition = true;
      }
    }

    if (zoomScroll && zoomStage && zoomFarmBg && zoomBlueGrade) {
      const zoomRaw = currentZoomRaw;
      // 淡入再拉长一点，与 farm 末段失焦淡出（0.82→1）有更宽的重叠交叉区，
      // 让两屏靠透明度叠化自然衔接，不再依赖任何色彩遮罩。
      const zoomIn = segEaseBy("out", zoomRaw, 0, 0.24);
      const zoomOut = 1 - segEase(zoomRaw, 0.96, 1);
      fieldTransitionBg = Math.max(fieldTransitionBg, segEaseBy("out", zoomRaw, 0, 0.1) * (1 - segEase(zoomRaw, 0.38, 0.72)));

      // 对焦切换：稻田开场起始虚化值（22px/scale1.28）对齐 farm 末段推进的失焦量，
      // 使得 farmFront 淡出与 zoom 淡入在同一“模糊度”上交接，看不出切换的硬边。
      // 随推进 blur 退去、scale 回落到 1，画面“对上焦”变清晰。
      const focus = segEaseBy("out", zoomRaw, 0, 0.4); // 对焦放慢，收尾更柔
      const zoomBlur = lerp(22, 0, focus);
      const zoomScale = lerp(1.28, 1, focus);

      zoomStage.style.opacity = q(zoomIn * zoomOut);
      zoomFarmBg.style.transform = `scale(${zoomScale})`;
      zoomFarmBg.style.filter = zoomBlur > 0.2 ? `blur(${zoomBlur}px)` : "none";
      // 绿色遮罩彻底移除：恒为 0，纯靠交叉淡入淡出 + 失焦承接衔接两屏。
      zoomBlueGrade.style.opacity = 0;
      zoomFarmBg.style.willChange = zoomRaw > 0 && zoomRaw < 1 ? "transform, filter" : "auto";
      zoomBlueGrade.style.willChange = "auto";
    }

    if (kiteCoverScroll && kiteCoverStage && kiteCover) {
      const coverRect = kiteCoverScroll.getBoundingClientRect();
      const coverTotal = Math.max(1, coverRect.height - window.innerHeight);
      const coverRaw = clamp(-coverRect.top / coverTotal, 0, 1);
      fieldTransitionBg = Math.max(fieldTransitionBg, segEaseBy("out", coverRaw, 0, 0.04) * (1 - segEase(coverRaw, 0.72, 0.92)));

      // ===== 四阶段时序 =====
      // 阶段1 (0→0.30)   ：大风筝局部从很模糊(22px)缓缓浮现，清晰度升到 ~80% 后停下
      // 阶段2 (0.30→0.42)：画面保持，介绍文字从右下淡入
      // 阶段3 (0.42→0.62)：全部静止，留时间阅读
      // 阶段4 (0.62→0.90)：风筝缩小(保持清晰)；草地淡出、天空淡入(交叉叠化)；文字同步淡出
      // 阶段5 (0.90→1)   ：风筝定格在天空

      const coverIn = segEaseBy("out", coverRaw, 0, 0.04);

      // 阶段1：浮现 + 对焦到 80%。整体淡入透明度（纹理浮现感）
      const kiteAppear = segEaseBy("out", coverRaw, 0, 0.22);
      // 清晰度只对到 80%：blur 从 6px 降到 ~1px（保留极轻柔感）就停下
      const focusTo80 = segEaseBy("out", coverRaw, 0.04, 0.30);
      const blur80 = lerp(6, 1, focusTo80);

      // 阶段4：缩小（保持清晰，blur 在缩小段进一步收到 0）——提前到 0.80 定格，
      // 让主风筝先完全落定，再把两只小风筝的飞入留到 0.80 之后依次进行。
      const shrinkProgress = segEaseBy("inout", coverRaw, 0.55, 0.80);
      const zc = kiteConfig.zoom;
      const coverScale = coverRaw < 0.55 ? 21 : lerp(21, zc.scale, shrinkProgress);
      // 落点偏移由 config 驱动（面板可调）
      const coverX = lerp(0, zc.x, shrinkProgress);
      const coverYBase = lerp(0, zc.y, shrinkProgress);
      const coverRotate = lerp(0, zc.rot, shrinkProgress);
      // 缩小时把残留模糊也收干净，定格时完全清晰
      const blur = coverRaw < 0.55 ? blur80 : lerp(1, 0, shrinkProgress);

      // 落定后轻轻晃动：主风筝 0.80 缩小完成即启用（在两只小风筝飞入之前先稳住）
      const settleAmt = segEaseBy("out", coverRaw, 0.80, 0.86);
      const t = performance.now() / 1000;
      const zSwayX = Math.sin(t * 0.9) * zc.swayX * settleAmt;
      const coverY = coverYBase + Math.sin(t * 0.7 + 1.1) * zc.swayY * settleAmt;
      const zSwayRot = Math.sin(t * 0.8 + 0.5) * zc.swayR * settleAmt;

      // 草地淡出 / 天空淡入：交叉叠化，与风筝缩小同段发生（提前到 0.80 前完成）
      const skyReveal = segEaseBy("out", coverRaw, 0.58, 0.78);
      const farmFadeOut = 1 - skyReveal;

      // 文字：阶段2 淡入(0.30→0.42)，阶段4 缩小开始时淡出(0.55→0.66)
      const textIn = segEaseBy("out", coverRaw, 0.30, 0.42);
      const textOut = 1 - segEaseBy("out", coverRaw, 0.55, 0.66);
      const textOpacity = textIn * textOut;
      // 文字淡入时轻微上浮落定，淡出时轻微上飘消散
      const textRise = (1 - textIn) * 12 - (1 - textOut) * 10;

      // 两个天空小风筝：在主风筝缩小落定后，依次「飞入」画面，
      // 各自从屏外偏移(fromX/fromY/fromRot)飞到定位点，飞入完成后随风轻晃。
      // 整体节奏：主风筝先落定 → sky1 飞入 → sky3 飞入 → 三只一起轻飘。
      const applySkyKite = (el, cfg, seed) => {
        if (!el) return;
        // 各自飞入进度（错开时间窗，依次进场）
        const fly = segEaseBy("out", coverRaw, cfg.inStart, cfg.inEnd);
        // 飞入起点偏移 → 0
        const inX = lerp(cfg.fromX || 0, 0, fly);
        const inY = lerp(cfg.fromY || 0, 0, fly);
        const inRot = lerp(cfg.fromRot || 0, 0, fly);
        // 飞入完成度决定轻晃幅度：完全飞入后才开始飘
        const swaySettle = fly;
        const sx = Math.sin(t * 0.85 + seed) * cfg.swayX * swaySettle;
        const sy = Math.sin(t * 0.65 + seed * 1.3) * cfg.swayY * swaySettle;
        const sr = Math.sin(t * 0.75 + seed * 0.7) * cfg.swayR * swaySettle;
        el.style.left = `${cfg.left}%`;
        el.style.top = `${cfg.top}%`;
        el.style.width = `${cfg.width}px`;
        el.style.opacity = q(fly);
        el.style.transform =
          `translate3d(${q(inX + sx)}vw, ${q(inY + sy)}vh, 0) rotate(${q(inRot + sr)}deg)`;
        el.style.willChange = fly > 0.01 && fly < 0.999 ? "transform, opacity" : "auto";
      };

      // 终幕失传风险文字：两只小风筝都飞入落定后浮现(0.90→0.95)，
      // 渐入渐出——短暂停留供阅读后，于本屏末尾(0.985→1.0)淡出退场。
      const finalIn = segEaseBy("out", coverRaw, 0.90, 0.95);
      const finalOut = 1 - segEaseBy("out", coverRaw, 0.985, 1.0);
      const finalOpacity = finalIn * finalOut;
      const finalRise = (1 - finalIn) * 14 - (1 - finalOut) * 12;

      kiteCoverStage.style.opacity = q(coverIn);
      if (kiteCoverFarm) kiteCoverFarm.style.opacity = q(farmFadeOut);
      if (kiteCoverSky) kiteCoverSky.style.opacity = q(skyReveal);
      kiteCover.style.opacity = q(kiteAppear);
      kiteCover.style.filter = `blur(${q(blur)}px) drop-shadow(0 24px 44px rgba(36, 96, 130, 0.18))`;
      kiteCover.style.transform = `translate3d(${q(coverX + zSwayX)}vw, ${q(coverY)}vh, 0) rotate(${q(coverRotate + zSwayRot)}deg) scale(${coverScale})`;
      kiteCover.style.willChange = coverRaw > 0 && coverRaw < 1 ? "transform, opacity, filter" : "auto";
      applySkyKite(skyKite1, kiteConfig.sky1, 0.0);
      applySkyKite(skyKite3, kiteConfig.sky3, 2.1);
      if (kiteCoverText) {
        kiteCoverText.style.opacity = q(textOpacity);
        kiteCoverText.style.transform = `translateY(${q(textRise)}px)`;
        kiteCoverText.style.willChange = textOpacity > 0.01 ? "opacity, transform" : "auto";
      }
      if (kiteFinalText) {
        kiteFinalText.style.opacity = q(finalOpacity);
        kiteFinalText.style.transform = `translate(-2%, ${q(finalRise)}px)`;
        kiteFinalText.style.willChange = finalOpacity > 0.01 ? "opacity, transform" : "auto";
      }
      if (kiteCoverFarm) kiteCoverFarm.style.willChange = farmFadeOut > 0.01 && farmFadeOut < 0.99 ? "opacity" : "auto";

      // 风筝落定且仍可见时保持轻晃帧循环（无滚动也不冻结）
      swayActive = settleAmt > 0.01 && coverRaw < 0.999 && q(kiteAppear) > 0.01;
    } else {
      swayActive = false;
    }

    // body 兜底色：farm/zoom 段正常情况下全程有图层覆盖、不会露出 body。
    // 这里仅作极端帧的兜底，目标色取接近 stage 草地底色（#a9c08a），
    // 即便偶有一帧缝隙也是连续草地色，不会再出现偏白的浅绿方块。
    document.body.style.backgroundColor = mixColor([212, 221, 229], [169, 192, 138], fieldTransitionBg);

    if (beachScroll && beachStage && beachBg && beachFront) {
      const beachRect = beachScroll.getBoundingClientRect();
      const beachTotal = Math.max(1, beachRect.height - window.innerHeight);
      const beachRaw = clamp(-beachRect.top / beachTotal, 0, 1);

      // beach-bg 与 beach-front 是设计好上下拼接的完整静态构图（天空+海+沙滩），
      // 任何缩放/位移都会让拼缝错位、构图变乱，所以这里完全不做 transform，
      // 只用 stage 透明度淡入接入。转场的“干净衔接”靠 CSS 的 margin/重叠控制。
      const beachIn = segEaseBy("out", beachRaw, 0.04, 0.24);

      // 文字：标题(0.40→0.54) 先，祈福(0.56→0.72) 后，依次浮现并轻微上浮落定。
      // 放在中前段，让用户停在定格画面时文字已就位，后段留白供阅读。
      const titleIn = segEaseBy("out", beachRaw, 0.40, 0.54);
      const blessIn = segEaseBy("out", beachRaw, 0.56, 0.72);

      beachStage.style.opacity = q(beachIn);
      // 不缩放不位移：保持图片原始拼接构图
      beachBg.style.transform = "none";
      beachFront.style.transform = "none";
      beachBg.style.willChange = "auto";
      beachFront.style.willChange = "auto";

      if (beachTextTitle) {
        beachTextTitle.style.opacity = q(titleIn);
        beachTextTitle.style.transform = `translateX(-50%) translateY(${q((1 - titleIn) * 16)}px)`;
        beachTextTitle.style.willChange = titleIn > 0.01 && titleIn < 0.99 ? "opacity, transform" : "auto";
      }
      if (beachTextBless) {
        beachTextBless.style.opacity = q(blessIn);
        beachTextBless.style.transform = `translateX(-50%) translateY(${q((1 - blessIn) * 16)}px)`;
        beachTextBless.style.willChange = blessIn > 0.01 && blessIn < 0.99 ? "opacity, transform" : "auto";
      }
      if (beachNext) {
        const buttonIn = segEaseBy("out", beachRaw, 0.78, 0.94);
        beachNext.classList.toggle("is-visible", buttonIn > 0.02);
        beachNext.style.opacity = q(buttonIn);
      }

      if (returningFromMain && !allowMainTransition && scrollingUp && beachRaw < 0.96) {
        allowMainTransition = true;
      }
    }

    lastScrollY = currentScrollY;

    // 风筝落定轻晃期间，即使无滚动也持续请求下一帧，保证轻摆不冻结
    if (swayActive && raf === null) {
      raf = requestAnimationFrame(tick);
    }
  }

  function schedule() {
    if (raf === null) {
      raf = requestAnimationFrame(tick);
    }
  }

  if (!reduced) {
    if (returningFromMain) {
      requestAnimationFrame(() => {
        const targetY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight * 1.18);
        window.scrollTo(0, targetY);
        lastScrollY = targetY;
      });
    } else {
      window.scrollTo(0, 0);
      lastScrollY = 0;
    }

    tick();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
  } else {
    skyTitle.style.opacity = 1;
    skyTitle.style.transform = "none";
    skyTitle.classList.add("active");
    // 减少动态效果：开场 UI 直接显示，不做依次进场动画
    [uiGroup1, uiIcon, uiGroup2, uiPoem, uiPlay, seaLabel].forEach((el) => el && el.classList.add("in"));
    // 减少动态效果：云层屏为终幕标题态，两段聚拢文字隐藏；farm 两段说明文字静态显示
    [cloudText1, cloudText2].forEach((el) => { if (el) el.style.opacity = 0; });
    [farmText3, farmText4].forEach((el) => {
      if (!el) return;
      el.style.opacity = 1;
      el.style.transform = "none";
    });
    // 减少动态效果：风筝静止显示在农庄天空定格位
    if (kite) {
      const k = getFarmKite(0.8);
      kite.style.transform = `translate(${k.x}vw, ${k.y}vh) rotate(0deg) scale(${k.s}) scaleX(-1)`;
      kite.style.opacity = 1;
    }
    if (farmStage) farmStage.style.opacity = 1;
    if (zoomStage) zoomStage.style.opacity = 1;
    if (zoomFarmBg) {
      zoomFarmBg.style.transform = "scale(1)";
      zoomFarmBg.style.filter = "none";
    }
    if (zoomBlueGrade) zoomBlueGrade.style.opacity = 0;
    if (kiteCoverStage) kiteCoverStage.style.opacity = 1;
    if (kiteCoverFarm) kiteCoverFarm.style.opacity = 0;
    if (kiteCoverSky) kiteCoverSky.style.opacity = 1;
    if (kiteCover) kiteCover.style.transform = "scale(0.72)";
    if (kiteCover) kiteCover.style.filter = "none";
    // 减少动态效果：两个天空小风筝静态显示在配置位置（已落定，无飞入/晃动）
    [
      [skyKite1, kiteConfig.sky1],
      [skyKite3, kiteConfig.sky3],
    ].forEach(([el, cfg]) => {
      if (!el) return;
      el.style.left = `${cfg.left}%`;
      el.style.top = `${cfg.top}%`;
      el.style.width = `${cfg.width}px`;
      el.style.opacity = 1;
      el.style.transform = "none";
    });
    if (kiteCoverText) {
      kiteCoverText.style.opacity = 1;
      kiteCoverText.style.transform = "none";
    }
    if (kiteFinalText) {
      kiteFinalText.style.opacity = 1;
      kiteFinalText.style.transform = "translate(-2%, 0)";
    }
    if (beachStage) beachStage.style.opacity = 1;
    if (beachBg) beachBg.style.transform = "none";
    if (beachFront) beachFront.style.transform = "none";
    if (beachTextTitle) {
      beachTextTitle.style.opacity = 1;
      beachTextTitle.style.transform = "translateX(-50%)";
    }
    if (beachTextBless) {
      beachTextBless.style.opacity = 1;
      beachTextBless.style.transform = "translateX(-50%)";
    }
    if (beachNext) beachNext.classList.add("is-visible");
    // 尊重"减少动态效果"：画一帧静止海面，不启动循环
    if (Sea) {
      const drawOnce = () => Sea.draw(1);
      requestAnimationFrame(drawOnce);
      setTimeout(drawOnce, 200); // 等贴图加载完再补画一帧
    }
  }
  function hideLoader() {
    loaderFill.style.width = "100%";
    loader.classList.add("hidden");
    setTimeout(() => loader.remove(), 1000);
  }

  if (beachNext) {
    beachNext.addEventListener("click", () => {
      if (!allowMainTransition && returningFromMain) return;
      goToMainSite();
    });
  }

  // 开场 UI 依次进场：组1（标题+ICON）先，组2（Kitesong+诗文）次之，play/scroll 最后
  function playIntro() {
    const seq = [
      [uiGroup1, 200],
      [uiIcon, 350],
      [uiGroup2, 900],
      [uiPoem, 1050],
      [uiPlay, 1500],
      [seaLabel, 1500],
    ];
    for (const [el, delay] of seq) {
      if (el) setTimeout(() => el.classList.add("in"), delay);
    }
  }

  // ===================== play 按钮：点击展开 + 波形流动 =====================
  (function setupPlayButton() {
    if (!uiPlay) return;
    const wave = document.getElementById("uiPlayWave");
    let open = false;
    let waveRaf = null;
    let phase = 0;

    function drawWave() {
      if (!wave) return;
      const ctx = wave.getContext("2d");
      // 适配 DPR，避免模糊
      const dpr = window.devicePixelRatio || 1;
      const cssW = wave.clientWidth || 70;
      const cssH = wave.clientHeight || 40;
      if (wave.width !== Math.round(cssW * dpr) || wave.height !== Math.round(cssH * dpr)) {
        wave.width = Math.round(cssW * dpr);
        wave.height = Math.round(cssH * dpr);
      }
      const w = wave.width;
      const h = wave.height;
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = Math.max(1, dpr);
      ctx.strokeStyle = "#000";
      ctx.lineCap = "round";

      const mid = h / 2;
      // 两端低、中间高的包络，让波形像声音一样自然收尾
      ctx.beginPath();
      const step = Math.max(1, Math.floor(dpr));
      for (let x = 0; x <= w; x += step) {
        const t = x / w;
        const envelope = Math.sin(t * Math.PI); // 0→1→0
        const y =
          mid +
          Math.sin(t * Math.PI * 6 - phase) * (h * 0.32) * envelope +
          Math.sin(t * Math.PI * 11 - phase * 1.7) * (h * 0.12) * envelope;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    function loop() {
      phase += 0.12;
      drawWave();
      waveRaf = requestAnimationFrame(loop);
    }

    function startWave() {
      if (waveRaf === null) loop();
    }

    function stopWave() {
      if (waveRaf !== null) {
        cancelAnimationFrame(waveRaf);
        waveRaf = null;
      }
    }

    uiPlay.addEventListener("click", () => {
      open = !open;
      uiPlay.classList.toggle("open", open);
      uiPlay.setAttribute("aria-pressed", String(open));
      if (open) {
        // 等展开宽度过渡基本完成再启动绘制，拿到正确的 canvas 宽度
        setTimeout(startWave, 120);
      } else {
        stopWave();
        if (wave) {
          const ctx = wave.getContext("2d");
          ctx && ctx.clearRect(0, 0, wave.width, wave.height);
        }
      }
    });
  })();

  let started = false;
  function begin() {
    if (started) return;
    started = true;
    hideLoader();
    playIntro();
  }

  (function preload() {
    const urls = [
      ...layers
        .map((layer) => {
          const bg = getComputedStyle(layer.el).backgroundImage;
          const match = /url\(["']?(.*?)["']?\)/.exec(bg);
          return match ? match[1] : null;
        })
        .filter(Boolean),
      ...[farmBg, farmFront]
        .map((el) => {
          const img = el?.querySelector("img");
          return img?.getAttribute("src") || null;
        })
        .filter(Boolean),
      ...[zoomFarmBg, kiteCover, beachBg, beachFront]
        .map((el) => {
          const img = el?.querySelector("img");
          return img?.getAttribute("src") || null;
        })
        .filter(Boolean),
      "./assert/kite.png",
      "./assert/kites-sky-bg.png",
      "./assert/kite1-sky.png",
      "./assert/kite3-sky.png",
    ];

    if (urls.length === 0) {
      begin();
      return;
    }

    let done = 0;
    const finish = () => {
      done++;
      loaderFill.style.width = `${Math.round((done / urls.length) * 100)}%`;
      if (done >= urls.length) begin();
    };

    setTimeout(begin, 8000);

    urls.forEach((src) => {
      const img = new Image();
      img.onload = finish;
      img.onerror = finish;
      img.src = src;
    });
  })();
})();
