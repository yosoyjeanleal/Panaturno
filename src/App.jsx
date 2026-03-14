import { useState, useEffect, useRef, useCallback } from "react";
import Papa from "papaparse";

// ══════════════════════════════════════════════════════
//  CONFIGURACIÓN — pega aquí tu URL de Google Sheet CSV
// ══════════════════════════════════════════════════════
const GOOGLE_SHEET_CSV_URL =
  "TU_URL_AQUI_pub?output=csv";

// ══════════════════════════════════════════════════════
//  DATOS DEMO
// ══════════════════════════════════════════════════════
const DEMO_DATA = [
  {
    id: "1",
    grupo: "Equipo Alpha",
    integrantes: "Carlos Pérez, María González, Luis Rodríguez",
    propuesta: "Sistema de Gestión de Inventarios con IA",
    materia: "Proyecto Final",
    profesor: "Dr. Ramírez",
    fecha: "2025-06-10",
    hora_inicio: "08:00",
    hora_fin: "08:30",
    salon: "Aula 301",
    estado: "proximo",
    notas: "Presentar mockups y diagrama de base de datos",
    color: "#4f46e5",
  },
  {
    id: "2",
    grupo: "Los Innovadores",
    integrantes: "Ana Martínez, Pedro Sánchez, Sofía Torres",
    propuesta: "App Móvil para Registro de Asistencia",
    materia: "Proyecto Final",
    profesor: "Dra. López",
    fecha: "2025-06-10",
    hora_inicio: "08:30",
    hora_fin: "09:00",
    salon: "Aula 301",
    estado: "en_discusion",
    notas: "Revisar arquitectura del sistema",
    color: "#0891b2",
  },
  {
    id: "3",
    grupo: "Tech Visión",
    integrantes: "Roberto Díaz, Carmen Núñez, Jorge Herrera",
    propuesta: "Plataforma E-learning Adaptativa",
    materia: "Proyecto Final",
    profesor: "Dr. Ramírez",
    fecha: "2025-06-10",
    hora_inicio: "09:00",
    hora_fin: "09:30",
    salon: "Aula 301",
    estado: "pendiente",
    notas: "",
    color: "#059669",
  },
  {
    id: "DESCANSO",
    grupo: "🕐 DESCANSO",
    integrantes: "",
    propuesta: "Receso",
    materia: "",
    profesor: "",
    fecha: "2025-06-10",
    hora_inicio: "09:30",
    hora_fin: "09:45",
    salon: "",
    estado: "descanso",
    notas: "Receso entre bloques",
    color: "#94a3b8",
  },
  {
    id: "4",
    grupo: "DataSmart",
    integrantes: "Elena Vargas, Miguel Castro, Daniela Morales",
    propuesta: "Dashboard de Analítica para PYMES",
    materia: "Proyecto Final",
    profesor: "Dra. López",
    fecha: "2025-06-10",
    hora_inicio: "09:45",
    hora_fin: "10:15",
    salon: "Aula 301",
    estado: "finalizado",
    notas: "Excelente presentación",
    color: "#7c3aed",
  },
  {
    id: "5",
    grupo: "CloudBuilders",
    integrantes: "Andrés Medina, Valentina Cruz, Nicolás Reyes",
    propuesta: "Sistema de Monitoreo IoT para Campus",
    materia: "Seminario de Investigación",
    profesor: "Dr. Ramírez",
    fecha: "2025-06-11",
    hora_inicio: "10:00",
    hora_fin: "10:30",
    salon: "Laboratorio A",
    estado: "cancelado",
    notas: "Reprogramado para la próxima semana",
    color: "#dc2626",
  },
  {
    id: "6",
    grupo: "GreenCode",
    integrantes: "Isabella Flores, Santiago Ruiz, Camila Jiménez",
    propuesta: "Gestión Sostenible de Recursos Hídricos",
    materia: "Seminario de Investigación",
    profesor: "Dra. López",
    fecha: "2025-06-11",
    hora_inicio: "10:30",
    hora_fin: "11:00",
    salon: "Laboratorio A",
    estado: "proximo",
    notas: "",
    color: "#16a34a",
  },
];

// ══════════════════════════════════════════════════════
//  ESTADO CONFIGS
// ══════════════════════════════════════════════════════
const ESTADOS = {
  proximo: { label: "Próximo", color: "#4f46e5", bg: "#eef2ff", dot: "#4f46e5", icon: "🔵" },
  en_discusion: { label: "En Discusión", color: "#d97706", bg: "#fffbeb", dot: "#f59e0b", icon: "🟡" },
  pendiente: { label: "Pendiente", color: "#64748b", bg: "#f1f5f9", dot: "#94a3b8", icon: "⚪" },
  cancelado: { label: "Cancelado", color: "#dc2626", bg: "#fef2f2", dot: "#ef4444", icon: "🔴" },
  finalizado: { label: "Finalizado", color: "#16a34a", bg: "#f0fdf4", dot: "#22c55e", icon: "🟢" },
  descanso: { label: "Descanso", color: "#64748b", bg: "#f8fafc", dot: "#cbd5e1", icon: "☕" },
};

function parseRow(row) {
  return {
    id: String(row.id || row.ID || Math.random()),
    grupo: row.grupo || row.group || row.equipo || "",
    integrantes: row.integrantes || row.members || row.estudiantes || "",
    propuesta: row.propuesta || row.proyecto || row.nombre || row.title || "",
    materia: row.materia || row.asignatura || row.subject || "",
    profesor: row.profesor || row.teacher || row.docente || "",
    fecha: row.fecha || row.date || "",
    hora_inicio: row.hora_inicio || row.hora || row.time || "",
    hora_fin: row.hora_fin || row.end_time || "",
    salon: row.salon || row.aula || row.room || "",
    estado: (row.estado || row.status || "pendiente").toLowerCase().replace(" ", "_"),
    notas: row.notas || row.notes || row.comentarios || "",
    color: row.color || "#4f46e5",
  };
}

// ══════════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════════
function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("es-VE", { weekday: "long", day: "numeric", month: "long" });
  } catch {
    return dateStr;
  }
}

function groupByDate(events) {
  const grouped = {};
  events.forEach((ev) => {
    const key = ev.fecha || "Sin fecha";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(ev);
  });
  return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
}

function getInitials(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// ══════════════════════════════════════════════════════
//  BADGE DE ESTADO
// ══════════════════════════════════════════════════════
function EstadoBadge({ estado, size = "sm" }) {
  const cfg = ESTADOS[estado] || ESTADOS.pendiente;
  const pad = size === "sm" ? "3px 10px" : "5px 14px";
  const fs = size === "sm" ? 10 : 12;
  return (
    <span
      style={{
        background: cfg.bg,
        color: cfg.color,
        fontSize: fs,
        fontWeight: 800,
        padding: pad,
        borderRadius: 99,
        letterSpacing: 0.3,
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        border: `1.5px solid ${cfg.color}22`,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: cfg.dot,
          display: "inline-block",
        }}
      />
      {cfg.label}
    </span>
  );
}

// ══════════════════════════════════════════════════════
//  TARJETA DE EVENTO — estilo Pinterest
// ══════════════════════════════════════════════════════
function EventCard({ event, onClick, index }) {
  const cfg = ESTADOS[event.estado] || ESTADOS.pendiente;
  const isBreak = event.estado === "descanso";

  if (isBreak) {
    return (
      <div
        style={{
          gridColumn: "1 / -1",
          background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
          border: "2px dashed #cbd5e1",
          borderRadius: 16,
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          animation: `fadeUp 0.4s ease ${Math.min(index * 50, 300)}ms both`,
        }}
      >
        <span style={{ fontSize: 28 }}>☕</span>
        <div>
          <p style={{ fontSize: 13, fontWeight: 800, color: "#64748b", margin: 0 }}>
            {event.hora_inicio} – {event.hora_fin} · Receso
          </p>
          {event.notas && (
            <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0" }}>{event.notas}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="ecard"
      style={{ animationDelay: `${Math.min(index * 60, 400)}ms` }}
    >
      {/* Color bar top */}
      <div
        style={{
          height: 5,
          background: `linear-gradient(90deg, ${event.color}, ${event.color}88)`,
          borderRadius: "16px 16px 0 0",
          margin: "-1px -1px 0",
        }}
      />

      <div style={{ padding: "14px 14px 12px" }}>
        {/* Hora + Estado */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 8,
          }}
        >
          <div
            style={{
              background: `${event.color}15`,
              color: event.color,
              fontSize: 11,
              fontWeight: 800,
              padding: "4px 10px",
              borderRadius: 99,
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            🕐 {event.hora_inicio}
            {event.hora_fin && ` – ${event.hora_fin}`}
          </div>
          <EstadoBadge estado={event.estado} />
        </div>

        {/* Nombre del grupo */}
        <h3
          style={{
            fontSize: 15,
            fontWeight: 900,
            color: "#0f172a",
            marginBottom: 5,
            lineHeight: 1.3,
            fontFamily: "'Sora', sans-serif",
          }}
        >
          {event.grupo}
        </h3>

        {/* Propuesta */}
        <p
          style={{
            fontSize: 12,
            color: "#475569",
            marginBottom: 10,
            lineHeight: 1.55,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {event.propuesta}
        </p>

        {/* Integrantes avatares */}
        {event.integrantes && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <div style={{ display: "flex" }}>
              {event.integrantes
                .split(",")
                .slice(0, 4)
                .map((name, i) => (
                  <div
                    key={i}
                    title={name.trim()}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      background: `hsl(${(i * 73 + parseInt(event.id) * 31) % 360}, 65%, 55%)`,
                      border: "2px solid #fff",
                      marginLeft: i > 0 ? -8 : 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 9,
                      fontWeight: 800,
                      color: "#fff",
                      flexShrink: 0,
                    }}
                  >
                    {getInitials(name.trim())}
                  </div>
                ))}
            </div>
            <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>
              {event.integrantes.split(",").length} integrante
              {event.integrantes.split(",").length !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* Footer info */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 5,
            paddingTop: 10,
            borderTop: "1px solid #f1f5f9",
          }}
        >
          {event.salon && (
            <span
              style={{
                fontSize: 10,
                color: "#64748b",
                background: "#f8fafc",
                padding: "3px 8px",
                borderRadius: 8,
                fontWeight: 600,
              }}
            >
              🏫 {event.salon}
            </span>
          )}
          {event.profesor && (
            <span
              style={{
                fontSize: 10,
                color: "#64748b",
                background: "#f8fafc",
                padding: "3px 8px",
                borderRadius: 8,
                fontWeight: 600,
              }}
            >
              👤 {event.profesor}
            </span>
          )}
          {event.materia && (
            <span
              style={{
                fontSize: 10,
                color: event.color,
                background: `${event.color}12`,
                padding: "3px 8px",
                borderRadius: 8,
                fontWeight: 700,
              }}
            >
              {event.materia}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
//  MODAL DETALLE
// ══════════════════════════════════════════════════════
function EventModal({ event, onClose }) {
  const cfg = ESTADOS[event.estado] || ESTADOS.pendiente;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const integrantes = event.integrantes
    ? event.integrantes.split(",").map((s) => s.trim())
    : [];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9000,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(2,8,23,0.75)",
          backdropFilter: "blur(10px)",
          animation: "fadeIn 0.2s ease",
        }}
      />
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          background: "#fff",
          borderRadius: "24px 24px 0 0",
          width: "100%",
          maxWidth: 540,
          maxHeight: "92vh",
          overflowY: "auto",
          boxShadow: "0 -30px 80px rgba(0,0,0,0.3)",
          animation: "slideUp 0.32s cubic-bezier(.22,.68,0,1.1)",
        }}
      >
        {/* Banner */}
        <div
          style={{
            height: 110,
            background: `linear-gradient(135deg, ${event.color}22 0%, ${event.color}08 100%)`,
            borderRadius: "24px 24px 0 0",
            padding: "20px 20px 0",
            position: "relative",
          }}
        >
          <div
            style={{
              width: 40,
              height: 4,
              borderRadius: 99,
              background: "#e2e8f0",
              margin: "0 auto 16px",
            }}
          />
          <div
            style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
          >
            <EstadoBadge estado={event.estado} size="md" />
            <button
              onClick={onClose}
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                border: "none",
                background: "rgba(0,0,0,0.1)",
                cursor: "pointer",
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                color: "#475569",
              }}
            >
              ✕
            </button>
          </div>
        </div>

        <div style={{ padding: "0 20px 40px" }}>
          {/* Hora badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: event.color,
              color: "#fff",
              fontSize: 12,
              fontWeight: 800,
              padding: "6px 16px",
              borderRadius: 99,
              marginBottom: 12,
              marginTop: -14,
              position: "relative",
              boxShadow: `0 4px 14px ${event.color}55`,
            }}
          >
            🕐 {event.hora_inicio}
            {event.hora_fin && ` – ${event.hora_fin}`}
            {event.fecha && ` · ${formatDate(event.fecha)}`}
          </div>

          {/* Grupo + propuesta */}
          <h2
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: "#0f172a",
              fontFamily: "'Sora', sans-serif",
              lineHeight: 1.25,
              marginBottom: 6,
            }}
          >
            {event.grupo}
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "#475569",
              lineHeight: 1.7,
              marginBottom: 20,
              fontStyle: "italic",
            }}
          >
            "{event.propuesta}"
          </p>

          {/* Info grid */}
          <div
            style={{
              border: "1.5px solid #f1f5f9",
              borderRadius: 18,
              overflow: "hidden",
              marginBottom: 20,
            }}
          >
            {[
              event.salon && { icon: "🏫", label: "Salón / Aula", val: event.salon },
              event.profesor && { icon: "👤", label: "Profesor(a)", val: event.profesor },
              event.materia && { icon: "📚", label: "Materia", val: event.materia },
              event.fecha && { icon: "📅", label: "Fecha", val: formatDate(event.fecha) },
            ]
              .filter(Boolean)
              .map(({ icon, label, val }, i, arr) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 15px",
                    background: i % 2 === 0 ? "#fff" : "#fafafa",
                    borderBottom: i < arr.length - 1 ? "1px solid #f1f5f9" : "none",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: `${event.color}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                      flexShrink: 0,
                    }}
                  >
                    {icon}
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: 9,
                        color: "#94a3b8",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: 0.9,
                        margin: "0 0 2px",
                      }}
                    >
                      {label}
                    </p>
                    <p
                      style={{
                        fontSize: 13.5,
                        color: "#1e293b",
                        fontWeight: 600,
                        margin: 0,
                      }}
                    >
                      {val}
                    </p>
                  </div>
                </div>
              ))}
          </div>

          {/* Integrantes */}
          {integrantes.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: 0.9,
                  marginBottom: 10,
                }}
              >
                Integrantes del grupo
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {integrantes.map((nombre, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 12px",
                      background: "#f8fafc",
                      borderRadius: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        background: `hsl(${(i * 73 + parseInt(event.id) * 31) % 360}, 65%, 55%)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 800,
                        color: "#fff",
                        flexShrink: 0,
                      }}
                    >
                      {getInitials(nombre)}
                    </div>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: "#334155" }}>
                      {nombre}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notas */}
          {event.notas && (
            <div
              style={{
                background: "#fffbeb",
                border: "1.5px solid #fde68a",
                borderRadius: 14,
                padding: "14px 15px",
                marginBottom: 20,
              }}
            >
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: "#92400e",
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                  margin: "0 0 6px",
                }}
              >
                📝 Notas del profesor
              </p>
              <p style={{ fontSize: 13, color: "#78350f", lineHeight: 1.6, margin: 0 }}>
                {event.notas}
              </p>
            </div>
          )}

          <button
            onClick={onClose}
            style={{
              width: "100%",
              padding: "15px",
              background: "#0f172a",
              color: "#fff",
              border: "none",
              borderRadius: 14,
              fontSize: 14,
              fontWeight: 800,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
//  MODAL CONFIG SHEET
// ══════════════════════════════════════════════════════
function ConfigModal({ sheetUrl, onConnect, onDemo, onClose }) {
  const [url, setUrl] = useState(sheetUrl.includes("TU_URL") ? "" : sheetUrl);

  const COLUMNS = [
    "id",
    "grupo",
    "integrantes",
    "propuesta",
    "materia",
    "profesor",
    "fecha",
    "hora_inicio",
    "hora_fin",
    "salon",
    "estado",
    "notas",
    "color",
  ];
  const ESTADOS_INFO = ["proximo", "en_discusion", "pendiente", "cancelado", "finalizado", "descanso"];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(2,8,23,0.78)",
          backdropFilter: "blur(10px)",
        }}
      />
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          background: "#fff",
          borderRadius: "24px 24px 0 0",
          width: "100%",
          maxWidth: 540,
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "20px 20px 44px",
          boxShadow: "0 -24px 60px rgba(0,0,0,0.28)",
          animation: "slideUp 0.3s cubic-bezier(.22,.68,0,1.1)",
        }}
      >
        <div
          style={{
            width: 40,
            height: 4,
            borderRadius: 99,
            background: "#e2e8f0",
            margin: "0 auto 18px",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              flexShrink: 0,
            }}
          >
            📊
          </div>
          <div>
            <h3
              style={{
                fontSize: 20,
                fontWeight: 900,
                color: "#0f172a",
                fontFamily: "'Sora', sans-serif",
                margin: 0,
              }}
            >
              Conectar Google Sheets
            </h3>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
              Sin API · Solo lectura pública
            </p>
          </div>
        </div>

        <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16, lineHeight: 1.6 }}>
          Los <strong>profesores</strong> editan el Sheet directamente. Los{" "}
          <strong>estudiantes</strong> ven la info aquí en tiempo real.
        </p>

        {/* Pasos */}
        {[
          "Abre tu Google Sheet con los turnos",
          'Ve a Archivo → Compartir → Publicar en la web',
          "Selecciona la hoja y formato CSV",
          "Copia el enlace y pégalo abajo",
        ].map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 12, marginBottom: 9, alignItems: "center" }}>
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              {i + 1}
            </div>
            <p style={{ fontSize: 13, color: "#334155", lineHeight: 1.5, margin: 0 }}>{s}</p>
          </div>
        ))}

        {/* Columnas */}
        <div
          style={{
            background: "#f8fafc",
            borderRadius: 14,
            padding: "13px 14px",
            marginTop: 14,
            marginBottom: 14,
            border: "1.5px solid #e2e8f0",
          }}
        >
          <p
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: "#64748b",
              marginBottom: 8,
              textTransform: "uppercase",
              letterSpacing: 0.8,
            }}
          >
            Columnas del Sheet
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
            {COLUMNS.map((c) => (
              <span
                key={c}
                style={{
                  background: "#e2e8f0",
                  color: "#475569",
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "3px 9px",
                  borderRadius: 99,
                }}
              >
                {c}
              </span>
            ))}
          </div>
          <p
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: "#64748b",
              marginBottom: 6,
              textTransform: "uppercase",
              letterSpacing: 0.8,
            }}
          >
            Valores para "estado"
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {ESTADOS_INFO.map((e) => (
              <EstadoBadge key={e} estado={e} size="sm" />
            ))}
          </div>
          <p style={{ fontSize: 11, color: "#4f46e5", fontWeight: 700, marginTop: 10 }}>
            💡 Para descansos: estado = descanso, id = DESCANSO
          </p>
        </div>

        <input
          type="url"
          placeholder="https://docs.google.com/spreadsheets/d/e/.../pub?output=csv"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{
            width: "100%",
            padding: "13px 15px",
            borderRadius: 13,
            fontSize: 13,
            border: "2px solid #e2e8f0",
            outline: "none",
            color: "#334155",
            marginBottom: 12,
            boxSizing: "border-box",
            fontFamily: "inherit",
            fontWeight: 500,
          }}
        />

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => {
              if (url.trim()) onConnect(url.trim());
              else onClose();
            }}
            style={{
              flex: 1,
              padding: "14px",
              background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
              color: "#fff",
              border: "none",
              borderRadius: 14,
              fontSize: 14,
              fontWeight: 800,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            ✓ Conectar Sheet
          </button>
          <button
            onClick={onDemo}
            style={{
              padding: "14px 20px",
              background: "#f1f5f9",
              color: "#64748b",
              border: "none",
              borderRadius: 14,
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Demo
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
//  APP PRINCIPAL
// ══════════════════════════════════════════════════════
export default function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingDemo, setUsingDemo] = useState(false);
  const [sheetUrl, setSheetUrl] = useState(GOOGLE_SHEET_CSV_URL);
  const [showConfig, setShowConfig] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroFecha, setFiltroFecha] = useState("todas");
  const [busqueda, setBusqueda] = useState("");
  const [viewMode, setViewMode] = useState("cards"); // "cards" | "timeline"
  const mainRef = useRef(null);

  const loadData = (url) => {
    setLoading(true);
    if (!url || url.includes("TU_URL")) {
      setTimeout(() => {
        setEvents(DEMO_DATA.map(parseRow));
        setUsingDemo(true);
        setLoading(false);
      }, 700);
      return;
    }
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (r) => {
        if (r.data?.length > 0) {
          setEvents(r.data.map(parseRow));
          setUsingDemo(false);
        } else {
          setEvents(DEMO_DATA.map(parseRow));
          setUsingDemo(true);
        }
        setLoading(false);
      },
      error: () => {
        setEvents(DEMO_DATA.map(parseRow));
        setUsingDemo(true);
        setLoading(false);
      },
    });
  };

  useEffect(() => {
    loadData(sheetUrl);
  }, [sheetUrl]);

  // Fechas únicas
  const fechas = ["todas", ...Array.from(new Set(events.map((e) => e.fecha).filter(Boolean))).sort()];

  // Filtrado
  const filtered = events.filter((ev) => {
    if (ev.estado === "descanso") {
      // Mostrar descansos si la fecha coincide
      if (filtroFecha !== "todas" && ev.fecha !== filtroFecha) return false;
      return true;
    }
    if (filtroEstado !== "todos" && ev.estado !== filtroEstado) return false;
    if (filtroFecha !== "todas" && ev.fecha !== filtroFecha) return false;
    if (busqueda) {
      const q = busqueda.toLowerCase();
      return (
        ev.grupo.toLowerCase().includes(q) ||
        ev.propuesta.toLowerCase().includes(q) ||
        ev.integrantes.toLowerCase().includes(q) ||
        ev.materia.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const grouped = groupByDate(filtered);

  // Stats
  const stats = {
    total: events.filter((e) => e.estado !== "descanso").length,
    proximos: events.filter((e) => e.estado === "proximo").length,
    finalizados: events.filter((e) => e.estado === "finalizado").length,
    en_discusion: events.filter((e) => e.estado === "en_discusion").length,
  };

  const ESTADO_FILTERS = [
    { id: "todos", label: "Todos" },
    { id: "proximo", label: "Próximos" },
    { id: "en_discusion", label: "En Discusión" },
    { id: "pendiente", label: "Pendientes" },
    { id: "finalizado", label: "Finalizados" },
    { id: "cancelado", label: "Cancelados" },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        background: "#f1f5f9",
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800;900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800;9..40,900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:0;height:0;}

        @keyframes slideUp{
          from{transform:translateY(40px);opacity:0}
          to{transform:translateY(0);opacity:1}
        }
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes fadeUp{
          from{opacity:0;transform:translateY(12px)}
          to{opacity:1;transform:translateY(0)}
        }
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}

        .ecard{
          background:#fff;
          border-radius:16px;
          border:1.5px solid #f1f5f9;
          cursor:pointer;
          overflow:hidden;
          transition:transform 0.18s ease, box-shadow 0.18s ease;
          animation:fadeUp 0.4s ease both;
          break-inside:avoid;
        }
        .ecard:hover{
          transform:translateY(-4px);
          box-shadow:0 12px 40px rgba(0,0,0,0.12);
          border-color:#e2e8f0;
        }
        .ecard:active{transform:translateY(-1px);}

        .filter-chip{
          padding:7px 14px;
          border-radius:99px;
          border:1.5px solid transparent;
          white-space:nowrap;
          font-weight:700;
          cursor:pointer;
          font-size:12px;
          transition:all 0.15s;
          flex-shrink:0;
          font-family:inherit;
        }
        .filter-chip:hover{transform:scale(1.03);}

        .grid-cards{
          columns:1;
          column-gap:12px;
        }
        @media(min-width:520px){
          .grid-cards{columns:2;}
        }
        @media(min-width:900px){
          .grid-cards{columns:3;}
        }

        .search-input:focus{
          border-color:#4f46e5 !important;
          box-shadow:0 0 0 3px rgba(79,70,229,0.15) !important;
          outline:none;
        }
      `}</style>

      {/* ══ HEADER ══ */}
      <header
        style={{
          background: "linear-gradient(160deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)",
          padding: "14px 16px 0",
          flexShrink: 0,
          boxShadow: "0 8px 32px rgba(15,23,42,0.28)",
        }}
      >
        {/* Top row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 12,
          }}
        >
          <div>
            <p
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.45)",
                letterSpacing: 1.5,
                textTransform: "uppercase",
                marginBottom: 4,
                fontWeight: 600,
              }}
            >
              Universidad · Sistema de Turnos
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h1
                style={{
                  color: "#fff",
                  fontSize: 28,
                  fontWeight: 900,
                  fontFamily: "'Sora', sans-serif",
                  letterSpacing: "-0.5px",
                  lineHeight: 1,
                }}
              >
                PanaTurno
              </h1>
              {usingDemo && (
                <span
                  style={{
                    background: "#fbbf24",
                    color: "#78350f",
                    fontSize: 9,
                    fontWeight: 900,
                    padding: "2px 8px",
                    borderRadius: 99,
                    letterSpacing: 0.6,
                  }}
                >
                  DEMO
                </span>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: 7 }}>
            <button
              onClick={() => loadData(sheetUrl)}
              title="Recargar datos"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.18)",
                color: "#fff",
                padding: "8px 13px",
                borderRadius: 11,
                cursor: "pointer",
                fontSize: 15,
                fontWeight: 700,
              }}
            >
              ↻
            </button>
            <button
              onClick={() => setShowConfig(true)}
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.18)",
                color: "#fff",
                padding: "8px 12px",
                borderRadius: 11,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              ⚙ Sheet
            </button>
          </div>
        </div>

        {/* Stats pills */}
        <div
          style={{
            display: "flex",
            gap: 7,
            marginBottom: 11,
            overflowX: "auto",
            scrollbarWidth: "none",
          }}
        >
          {[
            { label: `${stats.total} grupos`, icon: "👥" },
            { label: `${stats.proximos} próximos`, icon: "🔵" },
            { label: `${stats.en_discusion} en discusión`, icon: "🟡" },
            { label: `${stats.finalizados} finalizados`, icon: "🟢" },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: "rgba(255,255,255,0.09)",
                border: "1px solid rgba(255,255,255,0.13)",
                borderRadius: 99,
                padding: "4px 11px",
                fontSize: 11,
                color: "rgba(255,255,255,0.82)",
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              {s.icon} {s.label}
            </div>
          ))}
        </div>

        {/* Buscador */}
        <div style={{ position: "relative", marginBottom: 10 }}>
          <span
            style={{
              position: "absolute",
              left: 13,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 14,
              pointerEvents: "none",
              opacity: 0.6,
            }}
          >
            🔍
          </span>
          <input
            className="search-input"
            type="text"
            placeholder="Buscar grupo, propuesta, integrante…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{
              width: "100%",
              padding: "11px 38px 11px 36px",
              borderRadius: 12,
              border: "2px solid rgba(255,255,255,0.15)",
              boxSizing: "border-box",
              outline: "none",
              fontSize: 13.5,
              color: "#0f172a",
              background: "#fff",
              fontFamily: "inherit",
              fontWeight: 500,
              transition: "all 0.2s",
            }}
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda("")}
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                border: "none",
                background: "#e2e8f0",
                cursor: "pointer",
                borderRadius: "50%",
                width: 22,
                height: 22,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                color: "#64748b",
                fontWeight: 900,
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Filtros de fecha */}
        {fechas.length > 2 && (
          <div
            style={{
              display: "flex",
              gap: 6,
              overflowX: "auto",
              paddingBottom: 6,
              scrollbarWidth: "none",
              marginBottom: 4,
            }}
          >
            {fechas.map((f) => (
              <button
                key={f}
                className="filter-chip"
                onClick={() => setFiltroFecha(f)}
                style={{
                  background: filtroFecha === f ? "#fff" : "rgba(255,255,255,0.1)",
                  color: filtroFecha === f ? "#0f172a" : "rgba(255,255,255,0.82)",
                  border:
                    filtroFecha === f
                      ? "1.5px solid transparent"
                      : "1.5px solid rgba(255,255,255,0.15)",
                  boxShadow: filtroFecha === f ? "0 2px 8px rgba(0,0,0,0.18)" : "none",
                }}
              >
                📅{" "}
                {f === "todas"
                  ? "Todas las fechas"
                  : new Date(f + "T00:00:00").toLocaleDateString("es-VE", {
                      day: "numeric",
                      month: "short",
                    })}
              </button>
            ))}
          </div>
        )}

        {/* Filtros estado */}
        <div
          style={{
            display: "flex",
            gap: 6,
            overflowX: "auto",
            paddingBottom: 12,
            scrollbarWidth: "none",
          }}
        >
          {ESTADO_FILTERS.map((f) => (
            <button
              key={f.id}
              className="filter-chip"
              onClick={() => setFiltroEstado(f.id)}
              style={{
                background: filtroEstado === f.id ? "#fff" : "rgba(255,255,255,0.1)",
                color: filtroEstado === f.id ? "#0f172a" : "rgba(255,255,255,0.82)",
                border:
                  filtroEstado === f.id
                    ? "1.5px solid transparent"
                    : "1.5px solid rgba(255,255,255,0.15)",
                boxShadow: filtroEstado === f.id ? "0 2px 8px rgba(0,0,0,0.18)" : "none",
              }}
            >
              {f.id !== "todos" && (
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: ESTADOS[f.id]?.dot,
                    display: "inline-block",
                    marginRight: 4,
                  }}
                />
              )}
              {f.label}
            </button>
          ))}
        </div>
      </header>

      {/* ══ MAIN ══ */}
      <main
        ref={mainRef}
        style={{
          flex: 1,
          overflowY: "auto",
          background: "#f1f5f9",
          padding: "0 0 60px",
        }}
      >
        {/* Loading */}
        {loading && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "80px 20px",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                border: "4px solid #e2e8f0",
                borderTopColor: "#4f46e5",
                borderRadius: "50%",
                animation: "spin 0.75s linear infinite",
              }}
            />
            <p style={{ fontSize: 14, color: "#64748b", fontWeight: 600 }}>
              Cargando turnos…
            </p>
          </div>
        )}

        {/* Demo banner */}
        {usingDemo && !loading && (
          <div
            onClick={() => setShowConfig(true)}
            style={{
              margin: "12px 14px 0",
              background: "linear-gradient(135deg, #eef2ff, #e0e7ff)",
              border: "1.5px solid #c7d2fe",
              borderRadius: 14,
              padding: "12px 15px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 11,
            }}
          >
            <span style={{ fontSize: 22 }}>📊</span>
            <div>
              <p
                style={{ fontSize: 12, fontWeight: 800, color: "#3730a3", margin: "0 0 1px" }}
              >
                Modo demo activo
              </p>
              <p style={{ fontSize: 11, color: "#4338ca", margin: 0 }}>
                Toca aquí para conectar tu Google Sheet →
              </p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.filter((e) => e.estado !== "descanso").length === 0 && (
          <div style={{ textAlign: "center", padding: "70px 24px" }}>
            <div style={{ fontSize: 54, marginBottom: 14 }}>🔍</div>
            <p
              style={{
                fontSize: 17,
                fontWeight: 800,
                color: "#0f172a",
                marginBottom: 6,
                fontFamily: "'Sora', sans-serif",
              }}
            >
              Sin resultados
            </p>
            <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 18 }}>
              Prueba con otros filtros
            </p>
            <button
              onClick={() => {
                setFiltroEstado("todos");
                setFiltroFecha("todas");
                setBusqueda("");
              }}
              style={{
                padding: "11px 22px",
                background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 800,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Limpiar filtros
            </button>
          </div>
        )}

        {/* Eventos agrupados por fecha */}
        {!loading &&
          grouped.map(([fecha, evs]) => (
            <div key={fecha} style={{ marginBottom: 8 }}>
              {/* Cabecera de fecha */}
              <div
                style={{
                  padding: "16px 16px 10px",
                  position: "sticky",
                  top: 0,
                  background: "#f1f5f9",
                  zIndex: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    height: 1,
                    flex: 1,
                    background: "linear-gradient(90deg, #e2e8f0, transparent)",
                  }}
                />
                <div
                  style={{
                    background: "#fff",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: 99,
                    padding: "5px 14px",
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#334155",
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  📅 {fecha === "Sin fecha" ? "Sin fecha" : formatDate(fecha)}
                  <span
                    style={{
                      background: "#4f46e5",
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: 800,
                      padding: "2px 7px",
                      borderRadius: 99,
                    }}
                  >
                    {evs.filter((e) => e.estado !== "descanso").length}
                  </span>
                </div>
                <div
                  style={{
                    height: 1,
                    flex: 1,
                    background: "linear-gradient(270deg, #e2e8f0, transparent)",
                  }}
                />
              </div>

              {/* Grid de tarjetas */}
              <div className="grid-cards" style={{ padding: "0 12px" }}>
                {evs.map((ev, i) => (
                  <div
                    key={ev.id}
                    style={{ marginBottom: 12, breakInside: "avoid" }}
                  >
                    <EventCard
                      event={ev}
                      index={i}
                      onClick={() => ev.estado !== "descanso" && setSelected(ev)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

        {/* Footer */}
        {!loading && filtered.length > 0 && (
          <div
            style={{
              padding: "20px 16px",
              textAlign: "center",
              borderTop: "1px solid #e2e8f0",
              marginTop: 4,
            }}
          >
            <p style={{ fontSize: 11, color: "#cbd5e1", fontWeight: 600 }}>
              PanaTurno · {filtered.filter((e) => e.estado !== "descanso").length} grupos cargados
            </p>
          </div>
        )}
      </main>

      {/* Modales */}
      {selected && <EventModal event={selected} onClose={() => setSelected(null)} />}
      {showConfig && (
        <ConfigModal
          sheetUrl={sheetUrl}
          onConnect={(url) => {
            setSheetUrl(url);
            setShowConfig(false);
          }}
          onDemo={() => {
            loadData(null);
            setShowConfig(false);
          }}
          onClose={() => setShowConfig(false)}
        />
      )}
    </div>
  );
}
