import { useState, useEffect } from "react";
import Papa from "papaparse";

const GOOGLE_SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRiK0_5iOHK73-cz5TrugjkQNNgOSOWHncP37MNl0eFqMh94Bgysu578J4PV6H_y1gDj2wq_KQoiosa/pub?gid=0&single=true&output=csv";

const DEMO_DATA = [
  { id:"1", grupo:"Equipo Alpha", integrantes:"Carlos Pérez, María González, Luis Rodríguez", propuesta:"Sistema de Gestión de Inventarios con IA", materia:"Proyecto Final", profesor:"Dr. Ramírez", fecha:"2025-06-10", hora_inicio:"08:00", hora_fin:"08:30", salon:"Aula 301", estado:"proximo", notas:"Presentar mockups y diagrama de base de datos", color:"#6366f1" },
  { id:"2", grupo:"Los Innovadores", integrantes:"Ana Martínez, Pedro Sánchez, Sofía Torres", propuesta:"App Móvil para Registro de Asistencia", materia:"Proyecto Final", profesor:"Dra. López", fecha:"2025-06-10", hora_inicio:"08:30", hora_fin:"09:00", salon:"Aula 301", estado:"en_discusion", notas:"Revisar arquitectura del sistema", color:"#0ea5e9" },
  { id:"3", grupo:"Tech Visión", integrantes:"Roberto Díaz, Carmen Núñez, Jorge Herrera", propuesta:"Plataforma E-learning Adaptativa", materia:"Proyecto Final", profesor:"Dr. Ramírez", fecha:"2025-06-10", hora_inicio:"09:00", hora_fin:"09:30", salon:"Aula 301", estado:"pendiente", notas:"", color:"#10b981" },
  { id:"DESCANSO1", grupo:"DESCANSO", integrantes:"", propuesta:"Receso entre bloques", materia:"", profesor:"", fecha:"2025-06-10", hora_inicio:"09:30", hora_fin:"09:45", salon:"", estado:"descanso", notas:"", color:"#94a3b8" },
  { id:"4", grupo:"DataSmart", integrantes:"Elena Vargas, Miguel Castro, Daniela Morales", propuesta:"Dashboard de Analítica para PYMES", materia:"Proyecto Final", profesor:"Dra. López", fecha:"2025-06-10", hora_inicio:"09:45", hora_fin:"10:15", salon:"Aula 301", estado:"finalizado", notas:"Excelente presentación, muy completa", color:"#a855f7" },
  { id:"5", grupo:"CloudBuilders", integrantes:"Andrés Medina, Valentina Cruz, Nicolás Reyes", propuesta:"Sistema de Monitoreo IoT para Campus", materia:"Seminario de Investigación", profesor:"Dr. Ramírez", fecha:"2025-06-11", hora_inicio:"10:00", hora_fin:"10:30", salon:"Laboratorio A", estado:"cancelado", notas:"Reprogramado para la próxima semana", color:"#ef4444" },
  { id:"6", grupo:"GreenCode", integrantes:"Isabella Flores, Santiago Ruiz, Camila Jiménez", propuesta:"Gestión Sostenible de Recursos Hídricos", materia:"Seminario de Investigación", profesor:"Dra. López", fecha:"2025-06-11", hora_inicio:"10:30", hora_fin:"11:00", salon:"Laboratorio A", estado:"proximo", notas:"", color:"#22c55e" },
  { id:"7", grupo:"ByteForce", integrantes:"Marcos Delgado, Laura Vega, Diego Castillo", propuesta:"Red Neuronal para Detección de Plagas", materia:"IA Aplicada", profesor:"Dr. Ramírez", fecha:"2025-06-11", hora_inicio:"11:00", hora_fin:"11:30", salon:"Laboratorio A", estado:"en_discusion", notas:"Muy buena propuesta", color:"#f59e0b" },
  { id:"DESCANSO2", grupo:"DESCANSO", integrantes:"", propuesta:"Almuerzo", materia:"", profesor:"", fecha:"2025-06-11", hora_inicio:"11:30", hora_fin:"13:00", salon:"", estado:"descanso", notas:"", color:"#94a3b8" },
  { id:"8", grupo:"PixelCraft", integrantes:"Natalia Moreno, Hernán López, Paola Suárez", propuesta:"Plataforma de Portafolios Digitales", materia:"IA Aplicada", profesor:"Dra. López", fecha:"2025-06-11", hora_inicio:"13:00", hora_fin:"13:30", salon:"Laboratorio A", estado:"proximo", notas:"Traer demo funcional", color:"#ec4899" },
];

const ESTADOS = {
  proximo:      { label:"Próximo",      color:"#6366f1", bg:"#eef2ff", dot:"#6366f1", glow:"rgba(99,102,241,.25)" },
  en_discusion: { label:"En Discusión", color:"#f59e0b", bg:"#fefce8", dot:"#f59e0b", glow:"rgba(245,158,11,.25)" },
  pendiente:    { label:"Pendiente",    color:"#94a3b8", bg:"#f8fafc", dot:"#cbd5e1", glow:"rgba(148,163,184,.15)" },
  cancelado:    { label:"Cancelado",    color:"#ef4444", bg:"#fff1f2", dot:"#ef4444", glow:"rgba(239,68,68,.2)" },
  finalizado:   { label:"Finalizado",   color:"#10b981", bg:"#ecfdf5", dot:"#10b981", glow:"rgba(16,185,129,.2)" },
  descanso:     { label:"Descanso",     color:"#94a3b8", bg:"#f8fafc", dot:"#e2e8f0", glow:"" },
};

const PALETA = ["#6366f1","#0ea5e9","#10b981","#f59e0b","#ef4444","#a855f7","#22c55e","#f97316","#ec4899","#14b8a6"];

function parseRow(row, i) {
  return {
    id:          String(row.id || row.ID || i),
    grupo:       row.grupo || row.group || row.equipo || "",
    integrantes: row.integrantes || row.members || row.estudiantes || "",
    propuesta:   row.propuesta || row.proyecto || row.nombre || row.title || "",
    materia:     row.materia || row.asignatura || row.subject || "",
    profesor:    row.profesor || row.teacher || row.docente || "",
    fecha:       row.fecha || row.date || "",
    hora_inicio: row.hora_inicio || row.hora || row.time || "",
    hora_fin:    row.hora_fin || row.end_time || "",
    salon:       row.salon || row.aula || row.room || "",
    estado:      (row.estado || row.status || "pendiente").toLowerCase().replace(/ /g,"_"),
    notas:       row.notas || row.notes || "",
    color:       row.color || PALETA[i % PALETA.length],
  };
}

function formatDate(d) {
  if (!d) return "";
  try {
    return new Date(d + "T00:00:00").toLocaleDateString("es-VE", {
      weekday: "long", day: "numeric", month: "long",
    });
  } catch { return d; }
}

function groupByDate(evs) {
  const g = {};
  evs.forEach(e => {
    const k = e.fecha || "Sin fecha";
    if (!g[k]) g[k] = [];
    g[k].push(e);
  });
  return Object.entries(g).sort(([a],[b]) => a.localeCompare(b));
}

function initials(name) {
  return name.trim().split(" ").map(w => w[0]).slice(0,2).join("").toUpperCase();
}

function Badge({ estado, size = "sm" }) {
  const c = ESTADOS[estado] || ESTADOS.pendiente;
  const fs = size === "lg" ? 11 : 9.5;
  const pad = size === "lg" ? "5px 12px" : "3px 9px";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: c.bg, color: c.color, fontSize: fs, fontWeight: 800,
      padding: pad, borderRadius: 99, border: `1.5px solid ${c.color}28`,
      letterSpacing: .2, flexShrink: 0,
    }}>
      <span style={{ width: size==="lg"?7:5.5, height: size==="lg"?7:5.5,
        borderRadius: "50%", background: c.dot, display: "inline-block",
        boxShadow: `0 0 6px ${c.dot}` }} />
      {c.label}
    </span>
  );
}

function Avatars({ integrantes, color, id }) {
  if (!integrantes) return null;
  const members = integrantes.split(",").map(s => s.trim()).filter(Boolean);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ display: "flex" }}>
        {members.slice(0, 4).map((n, i) => (
          <div key={i} title={n} style={{
            width: 26, height: 26, borderRadius: "50%",
            border: "2px solid #fff",
            marginLeft: i > 0 ? -8 : 0, flexShrink: 0, zIndex: 4-i,
            background: `hsl(${(i*79 + parseInt(id||0)*41) % 360},55%,60%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 8.5, fontWeight: 900, color: "#fff",
            boxShadow: "0 1px 4px rgba(0,0,0,.15)",
          }}>{initials(n)}</div>
        ))}
        {members.length > 4 && (
          <div style={{ width: 26, height: 26, borderRadius: "50%",
            border: "2px solid #fff", marginLeft: -8, background: "#e2e8f0",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 8, fontWeight: 900, color: "#94a3b8" }}>
            +{members.length - 4}
          </div>
        )}
      </div>
      <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>
        {members.length} integrante{members.length !== 1 ? "s" : ""}
      </span>
    </div>
  );
}

// ── CARD PRINCIPAL ──────────────────────────────────────────────
function Card({ ev, onClick, idx }) {
  const [hov, setHov] = useState(false);
  const isBreak = ev.estado === "descanso";
  const cfg = ESTADOS[ev.estado] || ESTADOS.pendiente;

  if (isBreak) return (
    <div style={{
      display: "flex", alignItems: "center", gap: 14,
      background: "linear-gradient(135deg,#f8fafc,#f1f5f9)",
      border: "2px dashed #cbd5e1", borderRadius: 18,
      padding: "13px 18px", marginBottom: 14,
      animation: `fadeUp .35s ease ${Math.min(idx*50,350)}ms both`,
    }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: "#e2e8f0",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
        ☕
      </div>
      <div>
        <p style={{ fontSize: 12, fontWeight: 800, color: "#64748b", margin: "0 0 2px" }}>
          {ev.hora_inicio}{ev.hora_fin && ` – ${ev.hora_fin}`} · Receso
        </p>
        {ev.propuesta && <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>{ev.propuesta}</p>}
      </div>
    </div>
  );

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "#fff",
        borderRadius: 22,
        border: `1.5px solid ${hov ? ev.color+"44" : "#eaecf5"}`,
        cursor: "pointer",
        overflow: "hidden",
        marginBottom: 16,
        breakInside: "avoid",
        transition: "transform .2s ease, box-shadow .2s ease, border-color .2s ease",
        transform: hov ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hov
          ? `0 20px 60px ${ev.color}22, 0 4px 16px rgba(0,0,0,.08)`
          : "0 2px 12px rgba(0,0,0,.05)",
        animation: `fadeUp .4s ease ${Math.min(idx*55,450)}ms both`,
      }}
    >
      {/* Top accent bar */}
      <div style={{
        height: 5,
        background: `linear-gradient(90deg, ${ev.color}, ${ev.color}66)`,
      }} />

      {/* Color wash header */}
      <div style={{
        background: `linear-gradient(180deg, ${ev.color}0f 0%, transparent 100%)`,
        padding: "14px 16px 0",
      }}>
        {/* Hora + Badge */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            background: `${ev.color}18`, color: ev.color,
            fontSize: 11, fontWeight: 800,
            padding: "4px 11px", borderRadius: 99,
            border: `1px solid ${ev.color}22`,
          }}>
            <span style={{ fontSize: 12 }}>🕐</span>
            {ev.hora_inicio}{ev.hora_fin && ` – ${ev.hora_fin}`}
          </div>
          <Badge estado={ev.estado} />
        </div>

        {/* Nombre grupo */}
        <h3 style={{
          fontSize: 15.5, fontWeight: 900, color: "#0f172a",
          fontFamily: "'Sora', sans-serif", lineHeight: 1.3,
          marginBottom: 5, letterSpacing: "-.3px",
          overflow: "hidden", display: "-webkit-box",
          WebkitLineClamp: 1, WebkitBoxOrient: "vertical",
        }}>{ev.grupo}</h3>
      </div>

      <div style={{ padding: "8px 16px 14px" }}>
        {/* Propuesta */}
        <p style={{
          fontSize: 12.5, color: "#64748b", lineHeight: 1.65,
          marginBottom: 12, overflow: "hidden", display: "-webkit-box",
          WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        }}>{ev.propuesta}</p>

        {/* Avatares */}
        {ev.integrantes && (
          <div style={{ marginBottom: 12 }}>
            <Avatars integrantes={ev.integrantes} color={ev.color} id={ev.id} />
          </div>
        )}

        {/* Footer tags */}
        <div style={{
          display: "flex", flexWrap: "wrap", gap: 5,
          paddingTop: 10, borderTop: "1px solid #f1f5f9",
        }}>
          {ev.salon && (
            <span style={{ fontSize: 10, color: "#475569", background: "#f8fafc",
              padding: "3px 9px", borderRadius: 8, fontWeight: 600,
              border: "1px solid #e2e8f0" }}>🏫 {ev.salon}</span>
          )}
          {ev.profesor && (
            <span style={{ fontSize: 10, color: "#475569", background: "#f8fafc",
              padding: "3px 9px", borderRadius: 8, fontWeight: 600,
              border: "1px solid #e2e8f0" }}>👤 {ev.profesor}</span>
          )}
          {ev.materia && (
            <span style={{ fontSize: 10, color: ev.color, fontWeight: 700,
              background: `${ev.color}12`, padding: "3px 9px", borderRadius: 8,
              border: `1px solid ${ev.color}22` }}>{ev.materia}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── MODAL ────────────────────────────────────────────────────────
function Modal({ ev, onClose }) {
  const members = ev.integrantes ? ev.integrantes.split(",").map(s => s.trim()).filter(Boolean) : [];

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }} onClick={onClose}>
      <div style={{
        position: "absolute", inset: 0,
        background: "rgba(2,6,23,.85)", backdropFilter: "blur(14px)",
        animation: "fadeIn .2s ease",
      }} />
      <div onClick={e => e.stopPropagation()} style={{
        position: "relative", background: "#fff",
        borderRadius: "28px 28px 0 0",
        width: "100%", maxWidth: 560, maxHeight: "93vh", overflowY: "auto",
        boxShadow: `0 -40px 100px rgba(0,0,0,.4), 0 -4px 0 ${ev.color}`,
        animation: "slideUp .32s cubic-bezier(.22,.68,0,1.1)",
      }}>
        {/* Drag handle */}
        <div style={{ padding: "14px 20px 0", display: "flex", justifyContent: "center" }}>
          <div style={{ width: 44, height: 4, borderRadius: 99, background: "#e2e8f0" }} />
        </div>

        {/* Hero header */}
        <div style={{
          padding: "16px 20px 20px",
          background: `linear-gradient(160deg, ${ev.color}18 0%, ${ev.color}06 100%)`,
          margin: "8px 12px 0", borderRadius: 20,
          border: `1.5px solid ${ev.color}20`,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <Badge estado={ev.estado} size="lg" />
            <button onClick={onClose} style={{
              width: 32, height: 32, borderRadius: "50%",
              border: "none", background: "rgba(0,0,0,.07)",
              cursor: "pointer", fontSize: 14, fontWeight: 900,
              color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center",
            }}>✕</button>
          </div>

          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: ev.color, color: "#fff", fontSize: 11.5, fontWeight: 800,
            padding: "6px 14px", borderRadius: 99, marginBottom: 10,
            boxShadow: `0 4px 14px ${ev.color}55`,
          }}>
            🕐 {ev.hora_inicio}{ev.hora_fin && ` – ${ev.hora_fin}`}
            {ev.fecha && ` · ${formatDate(ev.fecha)}`}
          </div>

          <h2 style={{
            fontSize: 22, fontWeight: 900, color: "#0f172a",
            fontFamily: "'Sora', sans-serif", lineHeight: 1.25,
            marginBottom: 6, letterSpacing: "-.4px",
          }}>{ev.grupo}</h2>

          <p style={{
            fontSize: 13.5, color: "#475569", lineHeight: 1.7,
            fontStyle: "italic", margin: 0,
          }}>"{ev.propuesta}"</p>
        </div>

        <div style={{ padding: "16px 20px 44px" }}>
          {/* Info grid */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: 8, marginBottom: 16,
          }}>
            {[
              ev.salon    && { icon:"🏫", label:"Salón",      val: ev.salon },
              ev.profesor && { icon:"👤", label:"Profesor(a)", val: ev.profesor },
              ev.materia  && { icon:"📚", label:"Materia",    val: ev.materia },
              ev.fecha    && { icon:"📅", label:"Fecha",      val: formatDate(ev.fecha) },
            ].filter(Boolean).map(({ icon, label, val }) => (
              <div key={label} style={{
                background: "#f8fafc", borderRadius: 14, padding: "11px 13px",
                border: "1.5px solid #f1f5f9",
              }}>
                <p style={{ fontSize: 9, color: "#94a3b8", fontWeight: 800,
                  textTransform: "uppercase", letterSpacing: .9, margin: "0 0 4px" }}>
                  {icon} {label}
                </p>
                <p style={{ fontSize: 13, color: "#1e293b", fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
                  {val}
                </p>
              </div>
            ))}
          </div>

          {/* Integrantes */}
          {members.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <p style={{
                fontSize: 10, fontWeight: 800, color: "#94a3b8",
                textTransform: "uppercase", letterSpacing: .9, marginBottom: 10,
              }}>
                👥 Integrantes del grupo
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {members.map((n, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 11,
                    padding: "9px 13px", background: "#f8fafc", borderRadius: 13,
                    border: "1.5px solid #f1f5f9",
                  }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                      background: `hsl(${(i*79+parseInt(ev.id||0)*41)%360},55%,60%)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 900, color: "#fff",
                    }}>{initials(n)}</div>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: "#334155" }}>{n}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notas */}
          {ev.notas && (
            <div style={{
              background: "linear-gradient(135deg,#fffbeb,#fef9c3)",
              border: "1.5px solid #fde68a", borderRadius: 16,
              padding: "14px 15px", marginBottom: 16,
            }}>
              <p style={{ fontSize: 9.5, fontWeight: 800, color: "#92400e",
                textTransform: "uppercase", letterSpacing: .8, margin: "0 0 6px" }}>
                📝 Notas del Profesor
              </p>
              <p style={{ fontSize: 13.5, color: "#78350f", lineHeight: 1.7, margin: 0 }}>
                {ev.notas}
              </p>
            </div>
          )}

          <button onClick={onClose} style={{
            width: "100%", padding: "15px",
            background: `linear-gradient(135deg, ${ev.color}, ${ev.color}bb)`,
            color: "#fff", border: "none", borderRadius: 16,
            fontSize: 14, fontWeight: 800, cursor: "pointer",
            fontFamily: "inherit", letterSpacing: .3,
            boxShadow: `0 6px 20px ${ev.color}44`,
            transition: "opacity .15s",
          }}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
//  APP
// ══════════════════════════════════════════════════════
export default function App() {
  const [events, setEvents]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [usingDemo, setUsingDemo]         = useState(false);
  const [selected, setSelected]           = useState(null);
  const [filtroEstado, setFiltroEstado]   = useState("todos");
  const [filtroFecha, setFiltroFecha]     = useState("todas");
  const [busqueda, setBusqueda]           = useState("");

  const loadData = url => {
    setLoading(true);
    if (!url || url.includes("TU_URL")) {
      setTimeout(() => { setEvents(DEMO_DATA.map(parseRow)); setUsingDemo(true); setLoading(false); }, 550);
      return;
    }
    Papa.parse(url, {
      download: true, header: true, skipEmptyLines: true,
      complete: r => {
        if (r.data?.length > 0) { setEvents(r.data.map(parseRow)); setUsingDemo(false); }
        else { setEvents(DEMO_DATA.map(parseRow)); setUsingDemo(true); }
        setLoading(false);
      },
      error: () => { setEvents(DEMO_DATA.map(parseRow)); setUsingDemo(true); setLoading(false); },
    });
  };

  useEffect(() => { loadData(GOOGLE_SHEET_CSV_URL); }, []);

  const fechas = ["todas", ...Array.from(new Set(events.map(e => e.fecha).filter(Boolean))).sort()];

  const filtered = events.filter(ev => {
    if (ev.estado === "descanso") return filtroFecha === "todas" || ev.fecha === filtroFecha;
    if (filtroEstado !== "todos" && ev.estado !== filtroEstado) return false;
    if (filtroFecha !== "todas" && ev.fecha !== filtroFecha) return false;
    if (busqueda) {
      const q = busqueda.toLowerCase();
      return ev.grupo.toLowerCase().includes(q) ||
        ev.propuesta.toLowerCase().includes(q) ||
        ev.integrantes.toLowerCase().includes(q);
    }
    return true;
  });

  const grouped = groupByDate(filtered);
  const real = events.filter(e => e.estado !== "descanso");
  const stats = {
    total:        real.length,
    proximos:     real.filter(e => e.estado === "proximo").length,
    en_discusion: real.filter(e => e.estado === "en_discusion").length,
    finalizados:  real.filter(e => e.estado === "finalizado").length,
  };

  const FILTROS = [
    { id:"todos",        label:"Todos" },
    { id:"proximo",      label:"Próximos" },
    { id:"en_discusion", label:"En Discusión" },
    { id:"pendiente",    label:"Pendientes" },
    { id:"finalizado",   label:"Finalizados" },
    { id:"cancelado",    label:"Cancelados" },
  ];

  return (
    <div style={{
      minHeight: "100vh", width: "100%",
      background: "linear-gradient(180deg,#f0f4ff 0%,#fafbff 400px)",
      fontFamily: "'DM Sans', system-ui, sans-serif",
      overflowX: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800;900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800;9..40,900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{overflow-x:hidden;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:#c7d2fe;border-radius:99px;}

        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideUp{from{transform:translateY(50px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}

        .chip{
          display:inline-flex;align-items:center;gap:5px;
          padding:7px 15px;border-radius:99px;
          border:1.5px solid transparent;
          white-space:nowrap;font-weight:700;
          cursor:pointer;font-size:12px;
          transition:all .15s;flex-shrink:0;
          font-family:inherit;
        }
        .chip:hover{transform:scale(1.05);}
        .chip:active{transform:scale(.97);}

        .masonry{
          columns:1;column-gap:14px;
        }
        @media(min-width:500px){.masonry{columns:2;}}
        @media(min-width:800px){.masonry{columns:3;}}
        @media(min-width:1100px){.masonry{columns:4;}}

        .search:focus{
          border-color:#6366f1!important;
          box-shadow:0 0 0 4px rgba(99,102,241,.13)!important;
          outline:none;
        }

        .stat-card{
          background:rgba(255,255,255,.12);
          border:1px solid rgba(255,255,255,.2);
          border-radius:16px;
          padding:10px 16px;
          text-align:center;
          flex-shrink:0;
          backdrop-filter:blur(8px);
          transition:transform .15s,background .15s;
        }
        .stat-card:hover{
          background:rgba(255,255,255,.18);
          transform:translateY(-2px);
        }
      `}</style>

      {/* ══════════════ HEADER ══════════════ */}
      <header style={{
        background: "linear-gradient(155deg,#0f0c29 0%,#1e1b4b 35%,#302b63 65%,#24243e 100%)",
        padding: "20px 20px 0",
        position: "sticky", top: 0, zIndex: 100,
        boxShadow: "0 8px 40px rgba(15,12,41,.5)",
      }}>
        {/* Decorative blobs */}
        <div style={{ position:"absolute", top:-60, right:-60, width:220, height:220,
          borderRadius:"50%", background:"radial-gradient(circle,rgba(99,102,241,.25),transparent 70%)",
          pointerEvents:"none" }} />
        <div style={{ position:"absolute", top:20, left:"40%", width:160, height:160,
          borderRadius:"50%", background:"radial-gradient(circle,rgba(139,92,246,.18),transparent 70%)",
          pointerEvents:"none" }} />

        {/* Logo row */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16, position:"relative" }}>
          <div style={{
            width:42, height:42, borderRadius:14,
            background:"linear-gradient(135deg,#818cf8,#6366f1)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:22, boxShadow:"0 4px 16px rgba(99,102,241,.55)",
            animation:"float 3s ease-in-out infinite",
          }}>🎓</div>
          <div>
            <p style={{ fontSize:9.5, color:"rgba(255,255,255,.4)",
              letterSpacing:2, textTransform:"uppercase", marginBottom:1, fontWeight:700 }}>
              Universidad · Sistema de Turnos
            </p>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <h1 style={{ color:"#fff", fontSize:28, fontWeight:900,
                fontFamily:"'Sora',sans-serif", letterSpacing:"-1px", lineHeight:1 }}>
                PanaTurno
              </h1>
              {usingDemo && (
                <span style={{ background:"linear-gradient(135deg,#fbbf24,#f59e0b)",
                  color:"#78350f", fontSize:8.5, fontWeight:900,
                  padding:"2px 8px", borderRadius:99, letterSpacing:.6,
                  boxShadow:"0 2px 8px rgba(245,158,11,.4)" }}>DEMO</span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:"flex", gap:8, marginBottom:14,
          overflowX:"auto", scrollbarWidth:"none", paddingBottom:2 }}>
          {[
            { v:stats.total,        icon:"👥", label:"grupos" },
            { v:stats.proximos,     icon:"🔵", label:"próximos",     accent:"rgba(99,102,241,.4)" },
            { v:stats.en_discusion, icon:"🟡", label:"discusión",    accent:"rgba(245,158,11,.35)" },
            { v:stats.finalizados,  icon:"🟢", label:"finalizados",  accent:"rgba(16,185,129,.35)" },
          ].map(s => (
            <div key={s.label} className="stat-card"
              style={{ background: s.accent || "rgba(255,255,255,.1)" }}>
              <p style={{ fontSize:20, fontWeight:900, color:"#fff",
                fontFamily:"'Sora',sans-serif", lineHeight:1, margin:"0 0 2px" }}>{s.v}</p>
              <p style={{ fontSize:9, color:"rgba(255,255,255,.6)",
                fontWeight:700, margin:0, whiteSpace:"nowrap" }}>
                {s.icon} {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ position:"relative", marginBottom:10 }}>
          <span style={{ position:"absolute", left:14, top:"50%",
            transform:"translateY(-50%)", fontSize:15, opacity:.45, pointerEvents:"none" }}>🔍</span>
          <input className="search" type="text"
            placeholder="Buscar grupo, propuesta, integrante…"
            value={busqueda} onChange={e => setBusqueda(e.target.value)}
            style={{ width:"100%", padding:"12px 40px 12px 42px",
              borderRadius:15, border:"2px solid rgba(255,255,255,.12)",
              fontSize:13.5, color:"#0f172a", background:"rgba(255,255,255,.97)",
              fontFamily:"inherit", fontWeight:500, transition:"all .2s",
              boxSizing:"border-box" }} />
          {busqueda && (
            <button onClick={() => setBusqueda("")} style={{
              position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
              border:"none", background:"#e2e8f0", cursor:"pointer",
              borderRadius:"50%", width:24, height:24,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:11, color:"#64748b", fontWeight:900,
            }}>✕</button>
          )}
        </div>

        {/* Fechas */}
        {fechas.length > 2 && (
          <div style={{ display:"flex", gap:6, overflowX:"auto",
            scrollbarWidth:"none", marginBottom:6, paddingBottom:2 }}>
            {fechas.map(f => (
              <button key={f} className="chip" onClick={() => setFiltroFecha(f)}
                style={{
                  background: filtroFecha===f ? "rgba(255,255,255,.2)" : "transparent",
                  color: filtroFecha===f ? "#fff" : "rgba(255,255,255,.6)",
                  border: `1.5px solid ${filtroFecha===f ? "rgba(255,255,255,.4)" : "rgba(255,255,255,.15)"}`,
                }}>
                📅 {f==="todas" ? "Todas" : new Date(f+"T00:00:00").toLocaleDateString("es-VE",{day:"numeric",month:"short"})}
              </button>
            ))}
          </div>
        )}

        {/* Estado filters */}
        <div style={{ display:"flex", gap:6, overflowX:"auto",
          scrollbarWidth:"none", paddingBottom:16 }}>
          {FILTROS.map(f => {
            const cfg = ESTADOS[f.id];
            const active = filtroEstado === f.id;
            return (
              <button key={f.id} className="chip" onClick={() => setFiltroEstado(f.id)}
                style={{
                  background: active ? "#fff" : "rgba(255,255,255,.1)",
                  color: active ? (cfg?.color || "#0f172a") : "rgba(255,255,255,.78)",
                  border: `1.5px solid ${active ? "transparent" : "rgba(255,255,255,.15)"}`,
                  boxShadow: active ? "0 3px 14px rgba(0,0,0,.25)" : "none",
                }}>
                {f.id !== "todos" && (
                  <span style={{ width:6, height:6, borderRadius:"50%",
                    background: active ? cfg?.dot : "rgba(255,255,255,.4)",
                    display:"inline-block" }} />
                )}
                {f.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* ══════════════ CONTENIDO ══════════════ */}
      <main style={{ padding:"8px 16px 60px", maxWidth:1400, margin:"0 auto" }}>

        {/* Loading */}
        {loading && (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center",
            justifyContent:"center", padding:"100px 20px", gap:16 }}>
            <div style={{ width:46, height:46, border:"4px solid #e0e7ff",
              borderTopColor:"#6366f1", borderRadius:"50%",
              animation:"spin .7s linear infinite" }} />
            <p style={{ fontSize:14, color:"#94a3b8", fontWeight:600 }}>Cargando turnos…</p>
          </div>
        )}

        {/* Grupos por fecha */}
        {!loading && grouped.map(([fecha, evs]) => (
          <div key={fecha} style={{ marginBottom:8 }}>
            {/* Date divider */}
            <div style={{ display:"flex", alignItems:"center", gap:12,
              padding:"20px 0 12px", position:"sticky", top:196, zIndex:9,
              background:"linear-gradient(180deg,#f0f4ff 80%,transparent)" }}>
              <div style={{ flex:1, height:1.5,
                background:"linear-gradient(90deg,#c7d2fe 0%,transparent 100%)" }} />
              <div style={{
                background:"#fff", border:"2px solid #e0e7ff",
                borderRadius:99, padding:"7px 18px",
                display:"flex", alignItems:"center", gap:8, flexShrink:0,
                boxShadow:"0 4px 16px rgba(99,102,241,.12)",
              }}>
                <span style={{ fontSize:14 }}>📅</span>
                <span style={{ fontSize:12.5, fontWeight:800, color:"#3730a3",
                  fontFamily:"'Sora',sans-serif", textTransform:"capitalize" }}>
                  {fecha === "Sin fecha" ? "Sin fecha" : formatDate(fecha)}
                </span>
                <span style={{ background:"linear-gradient(135deg,#6366f1,#4f46e5)",
                  color:"#fff", fontSize:10.5, fontWeight:800,
                  padding:"2px 9px", borderRadius:99,
                  boxShadow:"0 2px 8px rgba(99,102,241,.4)" }}>
                  {evs.filter(e => e.estado !== "descanso").length}
                </span>
              </div>
              <div style={{ flex:1, height:1.5,
                background:"linear-gradient(270deg,#c7d2fe 0%,transparent 100%)" }} />
            </div>

            <div className="masonry">
              {evs.map((ev, i) => (
                <Card key={ev.id} ev={ev} idx={i}
                  onClick={() => ev.estado !== "descanso" && setSelected(ev)} />
              ))}
            </div>
          </div>
        ))}

        {/* Empty */}
        {!loading && filtered.filter(e => e.estado !== "descanso").length === 0 && (
          <div style={{ textAlign:"center", padding:"80px 24px",
            animation:"fadeUp .4s ease both" }}>
            <div style={{ fontSize:58, marginBottom:16,
              animation:"float 3s ease-in-out infinite" }}>🔍</div>
            <p style={{ fontSize:18, fontWeight:900, color:"#1e1b4b",
              fontFamily:"'Sora',sans-serif", marginBottom:8 }}>Sin resultados</p>
            <p style={{ fontSize:13.5, color:"#94a3b8", marginBottom:22 }}>
              Prueba con otros filtros o términos de búsqueda
            </p>
            <button onClick={() => {
              setFiltroEstado("todos"); setFiltroFecha("todas"); setBusqueda("");
            }} style={{
              padding:"12px 28px",
              background:"linear-gradient(135deg,#6366f1,#4f46e5)",
              color:"#fff", border:"none", borderRadius:14,
              fontSize:13, fontWeight:800, cursor:"pointer",
              fontFamily:"inherit",
              boxShadow:"0 6px 20px rgba(99,102,241,.4)",
            }}>Limpiar filtros</button>
          </div>
        )}

        {/* Footer */}
        {!loading && filtered.length > 0 && (
          <p style={{ textAlign:"center", fontSize:11, color:"#a5b4fc",
            fontWeight:700, padding:"20px 0 0", letterSpacing:.5 }}>
            ✦ PanaTurno · {filtered.filter(e => e.estado !== "descanso").length} grupos ✦
          </p>
        )}
      </main>

      {selected && <Modal ev={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}