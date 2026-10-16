type Highlight = "angle" | "offset" | "travel" | "run" | "none";

interface OffsetDiagramProps {
  highlight?: Highlight;
  className?: string;
}

/**
 * Esquema simplificado do "triângulo de offset": dois trechos de tubo
 * retos ligados por um trecho diagonal. O valor em `highlight` é
 * desenhado em laranja com "?" para indicar a incógnita.
 */
export function OffsetDiagram({ highlight = "none", className }: OffsetDiagramProps) {
  const pipeStroke = "#c7ccdb";
  const accent = "#f5a524";
  const dim = "#ef4444";

  const isUnknown = (key: Highlight) => highlight === key;

  return (
    <svg viewBox="0 0 220 160" className={className} fill="none">
      {/* tubo: entrada -> diagonal -> saída */}
      <path
        d="M10 120 H70 L150 40 H210"
        stroke={pipeStroke}
        strokeWidth={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* linha central para indicar tubo (efeito canaleta) */}
      <path
        d="M10 120 H70 L150 40 H210"
        stroke="#0f1533"
        strokeWidth={2}
        strokeDasharray="1 6"
        strokeLinecap="round"
      />

      {/* ângulo no primeiro joelho */}
      <path
        d="M70 120 A 30 30 0 0 0 96 101"
        stroke={isUnknown("angle") ? accent : "#8b90a8"}
        strokeWidth={isUnknown("angle") ? 4 : 2}
      />
      {isUnknown("angle") && (
        <text x="82" y="112" fill={accent} fontSize="16" fontWeight="700">
          ?
        </text>
      )}

      {/* offset: distância vertical entre os dois eixos do tubo */}
      <line
        x1="196"
        y1="40"
        x2="196"
        y2="120"
        stroke={isUnknown("offset") ? dim : "#8b90a8"}
        strokeWidth={isUnknown("offset") ? 3 : 1.5}
        markerStart="url(#arrow)"
        markerEnd="url(#arrow)"
      />
      {isUnknown("offset") && (
        <text x="200" y="84" fill={dim} fontSize="16" fontWeight="700">
          ?
        </text>
      )}

      {/* travel: a diagonal em si */}
      {isUnknown("travel") && (
        <text x="98" y="70" fill={dim} fontSize="16" fontWeight="700">
          ?
        </text>
      )}

      {/* run: distância horizontal do trecho diagonal */}
      <line
        x1="70"
        y1="20"
        x2="150"
        y2="20"
        stroke={isUnknown("run") ? dim : "#8b90a8"}
        strokeWidth={isUnknown("run") ? 3 : 1.5}
        markerStart="url(#arrow)"
        markerEnd="url(#arrow)"
      />
      {isUnknown("run") && (
        <text x="98" y="16" fill={dim} fontSize="16" fontWeight="700">
          ?
        </text>
      )}

      <defs>
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6" fill="none" stroke="#8b90a8" strokeWidth="1" />
        </marker>
      </defs>
    </svg>
  );
}
