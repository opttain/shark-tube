import { useEffect, useState } from "react";
import { KeypadField } from "../components/KeypadField";
import { NumericKeypad } from "../components/NumericKeypad";
import { BendDrawing } from "../components/BendDrawing";
import { OffsetSolverError, solve3DOffset, type Offset3DResult } from "../lib/pipeMath";
import { PIPE_SIZES, elbowRadiusMm, type RadiusKind } from "../lib/pipeDimensions";

type ActiveField = "a" | "b" | "c" | "radius" | null;

export function Offset3D() {
  const [aText, setAText] = useState("");
  const [bText, setBText] = useState("");
  const [cText, setCText] = useState("");
  const [npsIndex, setNpsIndex] = useState(() =>
    Math.max(0, PIPE_SIZES.findIndex((p) => p.nps === "4")),
  );
  const [radiusKind, setRadiusKind] = useState<RadiusKind>("long");
  const [radiusText, setRadiusText] = useState("");
  const [radiusTouched, setRadiusTouched] = useState(false);
  const [active, setActive] = useState<ActiveField>("a");
  const [result, setResult] = useState<Offset3DResult | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  const pipe = PIPE_SIZES[npsIndex];

  useEffect(() => {
    if (!radiusTouched) {
      setRadiusText(elbowRadiusMm(pipe.npsInches, radiusKind).toFixed(1));
    }
  }, [pipe, radiusKind, radiusTouched]);

  function handleKey(key: string) {
    if (!active) return;
    const apply = (prev: string) => {
      if (key === "del") return prev.slice(0, -1);
      if (key === ".") return prev.includes(".") ? prev : prev + ".";
      return prev + key;
    };
    if (active === "a") setAText(apply);
    if (active === "b") setBText(apply);
    if (active === "c") setCText(apply);
    if (active === "radius") {
      setRadiusText(apply);
      setRadiusTouched(true);
    }
  }

  const heightA = parseFloat(aText);
  const widthB = parseFloat(bText);
  const depthC = parseFloat(cText);
  const radiusMm = parseFloat(radiusText);

  function handleCreate() {
    setCreateError(null);
    if ([heightA, widthB, depthC].some((v) => Number.isNaN(v))) {
      setCreateError("Informe os três deslocamentos (A, B e C).");
      return;
    }
    try {
      setResult(solve3DOffset({ heightA, widthB, depthC, radiusMm }));
    } catch (e) {
      setCreateError(e instanceof OffsetSolverError ? e.message : "Não foi possível calcular.");
    }
  }

  if (result) {
    const hasBend = result.alphaDeg > 0 && result.alphaDeg < 180;
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="page-title">Resultado</h1>
          <button
            type="button"
            onClick={() => setResult(null)}
            className="btn-accent"
          >
            Editar
          </button>
        </div>

        <div className="panel-result space-y-2">
          <Row label="Diagonal teórica (H)" value={`${result.diagonalH.toFixed(1)} mm`} />
          <Row label="Ângulo α (inclinação / corte)" value={`${result.alphaDeg.toFixed(2)}°`} />
          <Row label="Ângulo µ (giro horizontal)" value={`${result.muDeg.toFixed(2)}°`} />
          <Row label="Avanço por cotovelo" value={`${result.advancePerElbow.toFixed(1)} mm`} />
          <Row label="Comprimento real do tubo reto" value={`${result.straightLength.toFixed(1)} mm`} />
        </div>

        {hasBend ? (
          <BendDrawing
            totalAngleDeg={result.alphaDeg}
            numberOfPieces={2}
            diameterMm={pipe.odMm}
            radiusMm={radiusMm}
          />
        ) : (
          <div className="panel text-sm text-slate-300">
            Sem deslocamento lateral — o tubo segue reto, sem cotovelos.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="page-title">Desvio 3D (quiebros)</h1>
      <p className="text-sm text-slate-400">
        Para quando o tubo muda de direção na vertical e na horizontal ao mesmo tempo, em um único
        desvio tridimensional (A = altura, B e C = projeções horizontais).
      </p>

      <div className="panel space-y-3">
        <KeypadField
          label="A (altura)"
          value={aText}
          active={active === "a"}
          onActivate={() => setActive("a")}
        />
        <KeypadField
          label="B (largura)"
          value={bText}
          active={active === "b"}
          onActivate={() => setActive("b")}
        />
        <KeypadField
          label="C (comprimento)"
          value={cText}
          active={active === "c"}
          onActivate={() => setActive("c")}
        />

        <label className="block">
          <span className="field-label">Diâmetro (NPS)</span>
          <select
            value={npsIndex}
            onChange={(e) => setNpsIndex(Number(e.target.value))}
            className="field-select"
          >
            {PIPE_SIZES.map((p, i) => (
              <option key={p.nps} value={i}>
                {p.nps}" — OD {p.odMm.toFixed(1)} mm
              </option>
            ))}
          </select>
        </label>

        <div>
          <span className="field-label mb-0">Raio do cotovelo</span>
          <div className="segmented mt-1 mb-2">
            {(["long", "short"] as RadiusKind[]).map((kind) => (
              <button
                key={kind}
                type="button"
                onClick={() => {
                  setRadiusKind(kind);
                  setRadiusTouched(false);
                }}
                className={radiusKind === kind ? "on" : ""}
              >
                {kind === "long" ? "long" : "short"}
              </button>
            ))}
          </div>
          <KeypadField
            label="Raio (mm)"
            value={radiusText}
            active={active === "radius"}
            onActivate={() => setActive("radius")}
          />
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-300">{label}</span>
      <span className="font-mono text-base font-semibold text-white">{value}</span>
    </div>
  );
}
