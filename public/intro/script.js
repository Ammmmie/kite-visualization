(function () {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const container = document.querySelector(".scroll-container");
  const fog = document.getElementById("fog");
  const warm = document.getElementById("warm");
  const bar = document.getElementById("bar");
  const seaLabel = document.getElementById("seaLabel");
  const skyTitle = document.getElementById("skyTitle");
  const seaCanvas = document.getElementById("seaCanvas");
  const farmScroll = document.getElementById("farmScroll");
  const farmStage = document.getElementById("farmStage");
  const farmBg = document.getElementById("farmBg");
  const farmFront = document.getElementById("farmFront");
  const farmHaze = document.getElementById("farmHaze");
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
        ? "http://localhost:5174/?intro=1"
        : `${window.location.origin}/?intro=1`;
    window.location.href = target;
  }

  const point = (a, b, t) => ({
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    s: lerp(a.s, b.s, t),
    r: lerp(a.r, b.r, t),
  });

  // 风筝动线：第一屏由 raw 驱动（海面升空→钻云淡出），
  // 第二屏由 farmRaw 驱动（镜像从右侧云里飞出→定格左上→飞向农庄天空）。
  // x/y 为相对视口的 translate 偏移（vw/vh），flip 表示是否水平镜像。
  function getHeroKite(raw) {
    // 第一屏：先向右飞（末段隐入云层淡出）→ 折返 → 向左飞（从云层飞出淡入）
    const start = { x: 18, y: 36, s: 0.92, r: -6 };  // 起始位置：x 越大越右、y 越大越下
    const right = { x: 56, y: 30, s: 1.04, r: 14 };   // 先飞到右侧
    const left = { x: 14, y: 18, s: 1.0, r: -10 };    // 再飞回左侧偏上
    let state;

    if (raw < 0.32) {
      state = point(start, right, segEaseBy("out", raw, 0, 0.32));
    } else {
      state = point(right, left, segEaseBy("inout", raw, 0.32, 0.7));
    }
    // 在右→左折返点（raw≈0.32）隐入云层：0.24→0.32 淡出，0.32→0.42 飞出淡入
    let opacity;
    if (raw < 0.32) {
      opacity = 1 - segEase(raw, 0.24, 0.32);
    } else {
      opacity = segEase(raw, 0.32, 0.42);
    }

    state.r += Math.sin(raw * Math.PI * 8) * 1.2;
    return { ...state, opacity: q(opacity), flip: false };
  }

  function getFarmKite(farmRaw) {
    // 第二屏：接续第一屏，从云层淡出飞出 → 飞到农庄天空定格
    // 定格后与农庄天空保持相对静止（位移在更新处叠加农庄实际偏移）
    const emerge = { x: 14, y: 20, s: 0.95, r: -8 };   // 从云层飞出，左侧偏上
    const settled = { x: 32, y: 14, s: 1.02, r: 4 };   // 农庄天空定格位
    let state;
    let opacity;

    if (farmRaw < 0.62) {
      // 连贯飞向农庄天空定格点
      state = point(emerge, settled, segEaseBy("out", farmRaw, 0, 0.62));
      opacity = 1;
    } else {
      // 飞到农庄天空后定格停住，不再离场
      state = settled;
      opacity = 1;
    }

    state.r += Math.sin(farmRaw * Math.PI * 6) * 1.0;
    return { ...state, opacity: q(opacity), flip: false };
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
      premultipliedAlpha: false,
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
      "const float WAVE_HEIGHT=0.040;" +      // 波纹幅度（调低，海面更平）
      "const float WAVE_SPEED=0.95;" +        // 流动速度（调快）
      "const float NORMAL_STRENGTH=0.15;" +   // 法线强度（调低，起伏更平）
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
      // Fresnel：越靠下视角越低，反射越强（轻微提亮压低饱和）
      "  float fres=pow(1.0-depth,FRESNEL_POWER);" +
      "  float reflectGain=mix(1.0,1.12,1.0-fres);" +
      "  vec3 col=c.rgb*reflectGain;" +
      // 柔和 shimmer：法线起伏处叠很淡的高光闪烁
      "  float shim=pow(max(h0,0.0),3.0)*SHIMMER*depth;" +
      "  col+=shim;" +
      // 低饱和清晨调：轻微去饱和，向冷调柔化
      "  float luma=dot(col,vec3(0.299,0.587,0.114));" +
      "  col=mix(vec3(luma),col,0.88);" +
      // 远处雾化：水面上缘向天空色淡入融合，避免硬边
      "  float fog=smoothstep(0.40,0.52,uv.y);" +
      "  float a=c.a*u_alpha*fog;" +
      "  gl_FragColor=vec4(col,a);" +
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
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

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

  // ===================== 滚动视差主循环 =====================
  let raf = null;

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

    fog.style.opacity = q(fogOpacity);
    warm.style.opacity = q(segEase(raw, 0.5, 0.9) * 0.9);
    seaLabel.style.opacity = q(clamp(1 - raw * 5, 0, 1));

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

    // ---- 风筝跨屏动线 ----
    if (kite) {
      let fk;
      let followY = 0;
      if (farmScroll) {
        const fr = farmScroll.getBoundingClientRect();
        const ft = Math.max(1, fr.height - window.innerHeight);
        const farmRawForKite = clamp(-fr.top / ft, 0, 1);
        // 第二屏推进到一定程度才接管，让第一屏淡出先走完，避免横向跳变
        if (farmRawForKite > 0.02) {
          fk = getFarmKite(farmRawForKite);
          // 与农庄天空相对静止：农庄 stage sticky 钉住时不动，
          // 被底部内容顶上去时风筝跟着上移，绝不悬浮在后续内容上。
          if (farmStage) {
            const sr = farmStage.getBoundingClientRect();
            // stage 顶部离开视口顶部的距离（vh），钉住时≈0，上滚时为负
            followY = (sr.top / window.innerHeight) * 100;
          }
        } else {
          fk = getHeroKite(raw);
        }
      } else {
        fk = getHeroKite(raw);
      }
      const flip = fk.flip ? " scaleX(-1)" : "";
      kite.style.transform =
        `translate3d(${fk.x}vw, ${fk.y + followY}vh, 0) rotate(${fk.r}deg) scale(${fk.s})${flip}`;
      kite.style.opacity = fk.opacity;
      // 完全透明、或随农庄上移到视口外时彻底移除渲染，杜绝悬浮在后续内容上
      const offTop = fk.y + followY < -30;
      kite.style.display = fk.opacity <= 0.01 || offTop ? "none" : "block";
      kite.style.willChange = fk.opacity > 0.01 ? "transform, opacity" : "auto";
    }

    if (farmScroll && farmStage && farmBg && farmFront && farmHaze) {
      const farmRect = farmScroll.getBoundingClientRect();
      const farmTotal = Math.max(1, farmRect.height - window.innerHeight);
      const farmRaw = clamp(-farmRect.top / farmTotal, 0, 1);
      const farmProgress = easeInOut(farmRaw);
      // 农庄素材顶部带半透明浅色天空，长时间整屏淡入会像一块白色遮罩。
      // 等云层真正散开后再用较短的过渡接入农庄，保留浮现感但避免大面积泛白。
      const farmReveal = segEaseBy("out", farmRaw, 0.32, 0.5);
      const bgScale = lerp(1.12, 1, farmProgress);
      const bgY = lerp(3, -2, farmProgress);
      const frontY = lerp(52, -34, farmProgress);
      const frontScale = lerp(1.01, 1.08, farmProgress);
      farmStage.style.opacity = q(farmReveal);
      farmBg.style.transform = `translate3d(0, ${bgY}vh, 0) scale(${bgScale})`;
      farmFront.style.transform = `translate3d(0, ${frontY}px, 0) scale(${frontScale})`;
      // farm-haze 这层晨雾的矩形渐变边界会造成可见浅色遮罩，CSS 和 JS 双保险关闭。
      farmHaze.style.opacity = 0;

      if (returningFromMain && !allowMainTransition && scrollingUp && farmRaw < 0.96) {
        allowMainTransition = true;
      }

      if (allowMainTransition && scrollingDown && farmRaw >= 0.985) {
        goToMainSite();
      }
    }

    lastScrollY = currentScrollY;
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
    seaLabel.style.opacity = 0;
    // 减少动态效果：风筝静止显示在第一屏定格位
    if (kite) {
      const k = getHeroKite(0.3);
      kite.style.transform = `translate(${k.x}vw, ${k.y}vh) rotate(0deg) scale(${k.s})`;
      kite.style.opacity = 1;
    }
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

  let started = false;
  function begin() {
    if (started) return;
    started = true;
    hideLoader();
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
      "./assert/kite.png",
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
