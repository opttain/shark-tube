import { useMemo, useState } from "react";
import { KeypadField } from "../components/KeypadField";
import { NumericKeypad } from "../components/NumericKeypad";
import { OffsetDiagram } from "../components/OffsetDiagram";
import { COMMON_ANGLES, OffsetSolverError, solveRollingOffset } from "../lib/pipeMath";
import { formatInches } from "../lib/fractions";

type ActiveField = "x" | "y" | "angle" | null;

export function RollingOffset() {
  const [xText, setXText] = useState("");
  const [yText, setYText] = useState("");
  const [angleText, setAngleText] = useState("45");
  const [active, setActive] = useState<ActiveField>("x");

  function handleKey(key: string) {
    if (!active) return;
    const apply = (prev: string) => {
      if (key === "del") return prev.slice(0, -1);
      if (key === ".") return prev.includes(".") ? prev : prev + ".";
      return prev + key;
    };
    if (active === "x") setXText(apply);
    if (active === "y") setYText(apply);
    if (active === "angle") setAngleText(apply);
  }

  const horizontalOffset = xText.trim() === "" ? undefined : parseFloat(xText);
  const verticalOffset = yText.trim() === "" ? undefined : parseFloat(yText);
  const angleDeg = parseFloat(angleText);
  const angleValid = !Number.isNaN(angleDeg);

  const { result, error } = useMemo(() => {
    if (horizontalOffset === undefined || verticalOffset === undefined || !angleValid) {
      return { result: null, error: null };
    }
    try {
      return {
        result: solveRollingOffset({ horizontalOffset, verticalOffset, angleDeg }),
        error: null,
      };
    } catch (e) {
      return { result: null, error: e instanceof OffsetSolverError ? e.message : "Erro" };
    }
  }, [horizontalOffset, verticalOffset, angleDeg, angleValid]);

  return (
    <div className="space-y-5">
      <h1 className="page-title">Desvio X Y (rolling offset)</h1>
      <p className="text-sm text-slate-400">
        Para tubulação que se desvia em duas direções ao mesmo tempo (ex: sobe e vira).
      </p>

      <div className="panel space-y-3">
        <KeypadField
          label="Desvio X"
          value={xText}
          active={active === "x"}
          onActivate={() => setActive("x")}
          icon={<OffsetDiagram highlight="offset" />}
          hint={horizontalOffset !== undefined ? formatInches(horizontalOffset) : undefined}
        />
        <KeypadField
          label="Desvio Y"
          value={yText}
          active={active === "y"}
          onActivate={() => setActive("y")}
          icon={<OffsetDiagram highlight="run" />}
          hint={verticalOffset !== undefined ? formatInches(verticalOffset) : undefined}
        />

        <div>
          <span className="field-label mb-0">Ângulo da conexão</span>
          <div className="mt-1 flex flex-wrap gap-2">
            {COMMON_ANGLES.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAngleText(String(a))}
                className={`chip ${angleValid && angleDeg === a ? "chip-on" : ""}`}
              >
                {a}°
              </button>
            ))}
          </div>
        </div>
        <KeypadField
          label="Ângulo"
          value={angleText ? `${angleText}°` : ""}
          active={active === "angle"}
          onActivate={() => setActive("angle")}
          icon={<OffsetDiagram highlight="angle" />}
        />
      </div>

      <NumericKeypad onKey={handleKey} />

      {error && <div className="error-box">{error}</div>}

      {result && (
        <div className="panel-result space-y-2">
          <h2 className="field-label text-emerald-300">Resultado</h2>
          <ResultRow label="Desvio verdadeiro (true offset)" value={formatInches(result.trueOffset)} />
          <ResultRow label="Ângulo de rolamento" value={`${result.rollAngleDeg.toFixed(2)}°`} />
          <div className="mt-2 border-t border-emerald-900 pt-2" />
          <ResultRow label="Travel (diagonal)" value={formatInches(result.offsetResult.travel)} />
          <ResultRow label="Run (avanço)" value={formatInches(result.offsetResult.run)} />
        </div>
      )}
    </div>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-300">{label}</span>
      <span className="font-mono text-lg font-semibold text-white">{value}</span>
    </div>
  );
}
