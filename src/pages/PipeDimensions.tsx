import { useState } from "react";
import { PIPE_SIZES, elbowRadiusMm, mmToInch, type RadiusKind } from "../lib/pipeDimensions";
import { formatInches } from "../lib/fractions";

type Unit = "mm" | "inch";

export function PipeDimensions() {
  const [unit, setUnit] = useState<Unit>("mm");
  const [radiusKind, setRadiusKind] = useState<RadiusKind>("long");

  function formatLength(mm: number) {
    if (unit === "mm") return mm.toFixed(1);
    return formatInches(mmToInch(mm));
  }

  return (
    <div className="space-y-4">
      <h1 className="page-title">Dimensões de tubo</h1>
      <p className="text-sm text-slate-400">
        Diâmetros conforme ASME B36.10M/B36.19M e raios de cotovelo conforme ASME B16.9 (raio
        longo = 1.5×NPS, raio curto = 1.0×NPS).
      </p>

      <div className="flex gap-3">
        <ToggleGroup
          label="Milímetros/Polegadas"
          value={unit}
          onChange={setUnit}
          options={[
            { value: "mm", label: "mm" },
            { value: "inch", label: "inch" },
          ]}
        />
        <ToggleGroup
          label="Raio longo/Raio curto"
          value={radiusKind}
          onChange={setRadiusKind}
          options={[
            { value: "long", label: "long" },
            { value: "short", label: "short" },
          ]}
        />
      </div>

      <div className="panel overflow-hidden p-0">
        <table className="data-table w-full text-center">
          <thead>
            <tr className="bg-[#141b45]">
              <Th>NPS</Th>
              <Th>DN</Th>
              <Th>Diâmetro</Th>
              <Th>Raio</Th>
            </tr>
          </thead>
          <tbody>
            {PIPE_SIZES.map((size, i) => (
              <tr
                key={size.nps}
                className={`border-t border-white/5 ${i % 2 === 0 ? "bg-white/[0.03]" : ""}`}
              >
                <Td>{size.nps}"</Td>
                <Td>{size.dn}</Td>
                <Td>{formatLength(size.odMm)}</Td>
                <Td>{formatLength(elbowRadiusMm(size.npsInches, radiusKind))}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-2 py-3 text-sm font-semibold">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-2 py-2.5 text-sm text-white">{children}</td>;
}

function ToggleGroup<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="flex-1">
      <span className="field-label">{label}</span>
      <div className="segmented">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={value === opt.value ? "on" : ""}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
