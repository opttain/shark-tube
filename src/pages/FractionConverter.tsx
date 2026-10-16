import { useState } from "react";
import { KeypadField } from "../components/KeypadField";
import { NumericKeypad } from "../components/NumericKeypad";
import { FRACTION_DENOMINATORS, formatInches, parseInches } from "../lib/fractions";

export function FractionConverter() {
  const [text, setText] = useState("");
  const parsed = parseInches(text);
  const invalid = text.trim() !== "" && parsed === null;

  function handleKey(key: string) {
    setText((prev) => {
      if (key === "del") return prev.slice(0, -1);
      if (key === ".") return prev.includes(".") ? prev : prev + ".";
      return prev + key;
    });
  }

  return (
    <div className="space-y-6">
      <h1 className="page-title">Conversor de frações</h1>
      <p className="text-sm text-slate-400">
        Digite uma medida em decimal ("1.3125") para ver a fração equivalente em cada denominador.
      </p>

      <div className="panel">
        <KeypadField label="Medida" value={text} active onActivate={() => {}} />
      </div>

      <NumericKeypad onKey={handleKey} />

      {invalid && (
        <div className="error-box">
          Não entendi essa medida.
        </div>
      )}

      {parsed !== null && (
        <div className="panel-result space-y-3">
          <Row label="Decimal" value={`${parsed.toFixed(4)}"`} />
          {FRACTION_DENOMINATORS.map((den) => (
            <Row key={den} label={`Fração (1/${den})`} value={formatInches(parsed, den)} />
          ))}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-300">{label}</span>
      <span className="font-mono text-lg font-semibold text-white">{value}</span>
    </div>
  );
}
