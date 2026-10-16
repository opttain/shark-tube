import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { KeypadField } from "../components/KeypadField";
import { NumericKeypad } from "../components/NumericKeypad";
import { OffsetDiagram } from "../components/OffsetDiagram";
import { BendDrawing } from "../components/BendDrawing";
import { COMMON_ANGLES, solveOffset } from "../lib/pipeMath";
import { PIPE_SIZES, elbowRadiusMm, type RadiusKind } from "../lib/pipeDimensions";

type ActiveField = "angle" | "radius" | "offset" | null;

export function SimpleOffset() {
  const [searchParams] = useSearchParams();
  const presetAngle = searchParams.get("angle");

  const [angleText, setAngleText] = useState(presetAngle ?? "45");
  const [npsIndex, setNpsIndex] = useState(() =>
    Math.max(0, PIPE_SIZES.findIndex((p) => p.nps === "4")),
  );
  const [radiusKind, setRadiusKind] = useState<RadiusKind>("long");
  const [radiusText, setRadiusText] = useState("");
  const [radiusTouched, setRadiusTouched] = useState(false);
  const [offsetText, setOffsetText] = useState("");
  const [numberOfPieces, setNumberOfPieces] = useState(3);
  const [active, setActive] = useState<ActiveField>("angle");
  const [showResult, setShowResult] = useState(false);
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
    if (active === "angle") setAngleText(apply);
    if (active === "radius") {
      setRadiusText(apply);
      setRadiusTouched(true);
    }
    if (active === "offset") setOffsetText(apply);
  }

  const angleDeg = parseFloat(angleText);
  const radiusMm = parseFloat(radiusText);
  const offsetMm = offsetText.trim() === "" ? undefined : parseFloat(offsetText);

  function handleCreate() {
    setCreateError(null);
    if (Number.isNaN(angleDeg) || angleDeg <= 0 || angleDeg >= 180) {
      setCreateError("Informe um ângulo válido (entre 0° e 180°).");
      return;
    }
    if (Number.isNaN(radiusMm) || radiusMm <= 0) {
      setCreateError("Informe um raio válido.");
      return;
    }
    setShowResult(true);
  }

  if (showResult) {
    let travelMm: number | undefined;
    let runMm: number | undefined;
    if (offsetMm !== undefined) {
      try {
        const r = solveOffset({ angleDeg, offset: offsetMm });
        travelMm = r.travel;
        runMm = r.run;
      } catch {
        // deixa travel/run em branco se a combinação não for válida
      }
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="page-title">Resultado</h1>
          <button
            type="button"
            onClick={() => setShowResult(false)}
            className="btn-accent"
          >
            Editar
          </button>
        </div>
        <BendDrawing
          totalAngleDeg={angleDeg}
          numberOfPieces={numberOfPieces}
          diameterMm={pipe.odMm}
          radiusMm={radiusMm}
        />
        {offsetMm !== undefined && travelMm !== undefined && runMm !== undefined && (
          <div className="panel-result space-y-1 text-sm">
            <div className="field-label text-emerald-300">
              Triângulo de offset (peça reta + conexão única, sem curva segmentada)
            </div>
            <Row label="Desvio desejado" value={`${offsetMm.toFixed(1)} mm`} />
            <Row label="Travel (diagonal)" value={`${travelMm.toFixed(1)} mm`} />
            <Row label="Run (avanço)" value={`${runMm.toFixed(1)} mm`} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="page-title">Offset / Curva</h1>

      <div>
        <span className="field-label mb-0">Ângulo</span>
        <div className="mt-1 flex flex-wrap gap-2">
          {COMMON_ANGLES.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAngleText(String(a))}
              className={`chip ${parseFloat(angleText) === a ? "chip-on" : ""}`}
            >
              {a}°
            </button>
          ))}
        </div>
      </div>

      <div className="panel space-y-3">
        <KeypadField
          label="Ângulo"
          value={angleText ? `${angleText}°` : ""}
          active={active === "angle"}
          onActivate={() => setActive("angle")}
          icon={<OffsetDiagram highlight="angle" />}
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
          <span className="field-label mb-0">Raio</span>
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

        <KeypadField
          label="Desvio"
          value={offsetText}
          active={active === "offset"}
          onActivate={() => setActive("offset")}
          icon={<OffsetDiagram highlight="offset" />}
          hint="opcional — calcula travel/run à parte, não entra no desenho da curva"
        />

        <div className="flex items-center justify-between">
          <span className="field-label mb-0">Número de peças (curva segmentada)</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setNumberOfPieces((n) => Math.max(2, n - 1))}
              className="stepper-btn"
            >
              −
            </button>
            <span className="w-6 text-center text-lg font-semibold text-white">{numberOfPieces}</span>
            <button
              type="button"
              onClick={() => setNumberOfPieces((n) => Math.min(8, n + 1))}
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-300">{label}</span>
      <span className="font-mono text-base font-semibold text-white">{value}</span>
    </div>
  );
}
