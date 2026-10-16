import { useState } from "react";
import { KeypadField } from "../components/KeypadField";
import { NumericKeypad } from "../components/NumericKeypad";
import { OffsetSolverError, solveTeePlanification, type TeePlanificationPoint } from "../lib/pipeMath";

type ActiveField = "d" | "D" | "H" | "angle" | "t" | null;

export function TeePiece() {
  const [dText, setDText] = useState("76");
  const [DText, setDTextMain] = useState("114");
  const [hText, setHText] = useState("80");
  const [angleText, setAngleText] = useState("90");
  const [tText, setTText] = useState("0");
  const [points, setPoints] = useState(4);
  const [active, setActive] = useState<ActiveField>("d");
  const [result, setResult] = useState<TeePlanificationPoint[] | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  function handleKey(key: string) {
    if (!active) return;
    const apply = (prev: string) => {
      if (key === "del") return prev.slice(0, -1);
      if (key === ".") return prev.includes(".") ? prev : prev + ".";
      return prev + key;
    };
    if (active === "d") setDText(apply);
    if (active === "D") setDTextMain(apply);
    if (active === "H") setHText(apply);
    if (active === "angle") setAngleText(apply);
    if (active === "t") setTText(apply);
  }

  const branchDiameter = parseFloat(dText);
  const mainDiameter = parseFloat(DText);
  const heightRef = parseFloat(hText);
  const angleDeg = parseFloat(angleText);
  const offsetT = parseFloat(tText);

  function handleCreate() {
    setCreateError(null);
    if ([branchDiameter, mainDiameter, heightRef, angleDeg, offsetT].some((v) => Number.isNaN(v))) {
      setCreateError("Preencha todos os campos.");
      return;
    }
    try {
      setResult(
        solveTeePlanification({ branchDiameter, mainDiameter, heightRef, angleDeg, offsetT, pointsPerQuadrant: points }),
      );
    } catch (e) {
      setCreateError(e instanceof OffsetSolverError ? e.message : "Não foi possível calcular.");
    }
  }

  if (result) {
    const xs = result.map((p) => p.x);
    const ys = result.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const viewW = 360;
    const viewH = 220;
    const margin = 24;
    const spanX = maxX - minX || 1;
    const spanY = maxY - minY || 1;
    const scaleX = (viewW - margin * 2) / spanX;
    const scaleY = (viewH - margin * 2) / spanY;
    const toSvg = (p: TeePlanificationPoint) => ({
      x: margin + (p.x - minX) * scaleX,
      y: viewH - margin - (p.y - minY) * scaleY,
    });
    const svgPoints = result.map(toSvg);
    const polyline = svgPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="page-title">Gabarito de corte</h1>
          <button
            type="button"
            onClick={() => setResult(null)}
            className="btn-accent"
          >
            Editar
          </button>
        </div>

        <div className="panel p-3">
          <svg viewBox={`0 0 ${viewW} ${viewH}`} className="w-full drop-shadow-[0_0_6px_rgba(56,189,248,0.7)]">
            <polyline points={polyline} fill="none" stroke="#38bdf8" strokeWidth={2} />
            {svgPoints.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={2.5} fill="#22c55e" />
            ))}
          </svg>
          <p className="mt-1 text-center text-xs text-slate-400">
            Eixo X = contorno do ramal desenrolado · Eixo Y = altura de corte
          </p>
        </div>

        <div className="panel max-h-72 overflow-y-auto p-0">
          <table className="data-table w-full text-center text-sm text-white">
            <thead className="sticky top-0 bg-[#141b45]">
              <tr>
                <th className="py-2">Ponto</th>
                <th className="py-2">Ângulo</th>
                <th className="py-2">X (mm)</th>
                <th className="py-2">Y (mm)</th>
              </tr>
            </thead>
            <tbody>
              {result.map((p) => (
                <tr key={p.index} className="border-t border-slate-700">
                  <td className="py-1.5">{p.index}</td>
                  <td className="py-1.5">{p.angleDeg.toFixed(1)}°</td>
                  <td className="py-1.5">{p.x.toFixed(1)}</td>
                  <td className="py-1.5">{p.y.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="page-title">TEE / boca de lobo</h1>
      <p className="text-sm text-slate-400">
        Planificação do gabarito de corte do ramal para encaixar em um tubo principal (conexão em
        T), incluindo ramais inclinados e com deslocamento lateral.
      </p>

      <div className="panel space-y-3">
        <KeypadField
          label="d — diâmetro do ramal"
          value={dText}
          active={active === "d"}
          onActivate={() => setActive("d")}
        />
        <KeypadField
          label="D — diâmetro do principal"
          value={DText}
          active={active === "D"}
          onActivate={() => setActive("D")}
        />
        <KeypadField
          label="H — altura de referência"
          value={hText}
          active={active === "H"}
          onActivate={() => setActive("H")}
        />
        <KeypadField
          label="Ângulo do ramal"
          value={angleText ? `${angleText}°` : ""}
          active={active === "angle"}
          onActivate={() => setActive("angle")}
        />
        <KeypadField
          label="t — deslocamento lateral"
          value={tText}
          active={active === "t"}
          onActivate={() => setActive("t")}
          hint="0 = ramal centrado no tubo principal"
        />

        <div className="flex items-center justify-between">
          <span className="field-label mb-0">Pontos por quadrante</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPoints((n) => Math.max(1, n - 1))}
              className="stepper-btn"
            >
              −
            </button>
            <span className="w-6 text-center text-lg font-semibold text-white">{points}</span>
            <button
              type="button"
              onClick={() => setPoints((n) => Math.min(12, n + 1))}
              className="stepper-btn"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <NumericKeypad onKey={handleKey} />

      {createError && (
        <div className="error-box">{createError}</div>
      )}

      <button
        type="button"
        onClick={handleCreate}
        className="btn-primary"
      >
        Criar
      </button>
    </div>
  );
}
