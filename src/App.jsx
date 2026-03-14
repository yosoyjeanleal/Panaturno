import { useState, useEffect } from "react";
import Papa from "papaparse";

const GOOGLE_SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRiK0_5iOHK73-cz5TrugjkQNNgOSOWHncP37MNl0eFqMh94Bgysu578J4PV6H_y1gDj2wq_KQoiosa/pub?gid=0&single=true&output=csv";

const DEMO_DATA = [
  { id:"1", grupo:"Equipo Alpha", integrantes:"Carlos Pérez, María González, Luis Rodríguez", propuesta:"Sistema de Gestión de Inventarios con IA", materia:"Proyecto Final", profesor:"Dr. Ramírez", fecha:"2025-06-10", hora_inicio:"08:00", hora_fin:"08:30", salon:"Aula 301", estado:"proximo", notas:"Presentar mockups y diagrama de base de datos", color:"#6366f1" },
  { id:"2", grupo:"Los Innovadores", integrantes:"Ana Martínez, Pedro Sánchez, Sofía Torres", propuesta:"App Móvil para Registro de Asistencia", materia:"Proyecto Final", profesor:"Dra. López", fecha:"2025-06-10", hora_inicio:"08:30", hora_fin:"09:00", salon:"Aula 301", estado:"en_discusion", notas:"Revisar arquitectura del sistema", color:"#f43f5e" },
  { id:"3", grupo:"Tech Visión", integrantes:"Roberto Díaz, Carmen Núñez, Jorge Herrera", propuesta:"Plataforma E-learning Adaptativa", materia:"Proyecto Final", profesor:"Dr. Ramírez", fecha:"2025-06-10", hora_inicio:"09:00", hora_fin:"09:30", salon:"Aula 301", estado:"pendiente", notas:"", color:"#0ea5e9" },
  { id:"DESCANSO1", grupo:"DESCANSO", integrantes:"", propuesta:"Receso entre bloques", materia:"", profesor:"", fecha:"2025-06-10", hora_inicio:"09:30", hora_fin:"09:45", salon:"", estado:"descanso", notas:"", color:"" },
  { id:"4", grupo:"DataSmart", integrantes:"Elena Vargas, Miguel Castro, Daniela Morales", propuesta:"Dashboard de Analítica para PYMES", materia:"Proyecto Final", profesor:"Dra. López", fecha:"2025-06-10", hora_inicio:"09:45", hora_fin:"10:15", salon:"Aula 301", estado:"finalizado", notas:"Excelente presentación", color:"#10b981" },
  { id:"5", grupo:"CloudBuilders", integrantes:"Andrés Medina, Valentina Cruz, Nicolás Reyes", propuesta:"Sistema de Monitoreo IoT para Campus", materia:"Seminario de Investigación", profesor:"Dr. Ramírez", fecha:"2025-06-11", hora_inicio:"10:00", hora_fin:"10:30", salon:"Laboratorio A", estado:"cancelado", notas:"Reprogramado para próxima semana", color:"#ef4444" },
  { id:"6", grupo:"GreenCode", integrantes:"Isabella Flores, Santiago Ruiz, Camila Jiménez", propuesta:"Gestión Sostenible de Recursos Hídricos", materia:"Seminario", profesor:"Dra. López", fecha:"2025-06-11", hora_inicio:"10:30", hora_fin:"11:00", salon:"Laboratorio A", estado:"proximo", notas:"", color:"#8b5cf6" },
  { id:"7", grupo:"ByteForce", integrantes:"Marcos Delgado, Laura Vega, Diego Castillo", propuesta:"Red Neuronal para Detección de Plagas", materia:"IA Aplicada", profesor:"Dr. Ramírez", fecha:"2025-06-11", hora_inicio:"11:00", hora_fin:"11:30", salon:"Laboratorio A", estado:"en_discusion", notas:"Muy buena propuesta", color:"#f59e0b" },
  { id:"DESCANSO2", grupo:"DESCANSO", integrantes:"", propuesta:"Almuerzo", materia:"", profesor:"", fecha:"2025-06-11", hora_inicio:"11:30", hora_fin:"13:00", salon:"", estado:"descanso", notas:"", color:"" },
  { id:"8", grupo:"PixelCraft", integrantes:"Natalia Moreno, Hernán López, Paola Suárez", propuesta:"Plataforma de Portafolios Digitales", materia:"IA Aplicada", profesor:"Dra. López", fecha:"2025-06-11", hora_inicio:"13:00", hora_fin:"13:30", salon:"Laboratorio A", estado:"proximo", notas:"Traer demo funcional", color:"#ec4899" },
];

const ESTADOS = {
  proximo:      { label:"Próximo",      color:"#fff", bg:"#6366f1", icon:"🔵" },
  en_discusion: { label:"En Discusión", color:"#fff", bg:"#f59e0b", icon:"🟡" },
  pendiente:    { label:"Pendiente",    color:"#64748b", bg:"#e2e8f0", icon:"⚪" },
  cancelado:    { label:"Cancelado",    color:"#fff", bg:"#ef4444", icon:"🔴" },
  finalizado:   { label:"Finalizado",   color:"#fff", bg:"#10b981", icon:"🟢" },
  descanso:     { label:"Descanso",     color:"#94a3b8", bg:"#f1f5f9", icon:"☕" },
};

const PALETA = ["#6366f1","#f43f5e","#0ea5e9","#f59e0b","#10b981","#8b5cf6","#ec4899","#f97316","#14b8a6","#ef4444"];

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
  try { return new Date(d+"T00:00:00").toLocaleDateString("es-VE",{weekday:"long",day:"numeric",month:"long"}); }
  catch { return d; }
}

function formatDateShort(d) {
  if (!d) return "";
  try { return new Date(d+"T00:00:00").toLocaleDateString("es-VE",{weekday:"short",day:"numeric",month:"short"}); }
  catch { return d; }
}

function groupByDate(evs) {
  const g = {};
  evs.forEach(e => { const k = e.fecha||"Sin fecha"; if(!g[k]) g[k]=[]; g[k].push(e); });
  return Object.entries(g).sort(([a],[b]) => a.localeCompare(b));
}

function initials(name) {
  return name.trim().split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase();
}

// ── MODAL ────────────────────────────────────────────────────────
function Modal({ ev, onClose }) {
  const cfg = ESTADOS[ev.estado] || ESTADOS.pendiente;
  const members = ev.integrantes ? ev.integrantes.split(",").map(s=>s.trim()).filter(Boolean) : [];

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div onClick={onClose} style={{
      position:"fixed", inset:0, zIndex:9999,
      display:"flex", alignItems:"flex-end", justifyContent:"center",
    }}>
      <div style={{
        position:"absolute", inset:0,
        background:"rgba(0,0,0,.6)", backdropFilter:"blur(10px)",
        animation:"fadeIn .2s ease",
      }}/>
      <div onClick={e=>e.stopPropagation()} style={{
        position:"relative", width:"100%", maxWidth:520,
        background:"#fff", borderRadius:"24px 24px 0 0",
        maxHeight:"90vh", overflowY:"auto",
        animation:"slideUp .3s cubic-bezier(.34,1.56,.64,1)",
        boxShadow:"0 -20px 60px rgba(0,0,0,.25)",
      }}>
        {/* Color header */}
        <div style={{
          background:`linear-gradient(135deg, ${ev.color}, ${ev.color}bb)`,
          padding:"20px 20px 24px", borderRadius:"24px 24px 0 0",
          position:"relative",
        }}>
          <button onClick={onClose} style={{
            position:"absolute", top:16, right:16,
            width:32, height:32, borderRadius:"50%",
            border:"none", background:"rgba(255,255,255,.25)",
            color:"#fff", fontSize:16, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontWeight:900, backdropFilter:"blur(4px)",
          }}>×</button>

          <span style={{
            display:"inline-block", background:"rgba(255,255,255,.25)",
            color:"#fff", fontSize:10, fontWeight:800,
            padding:"3px 10px", borderRadius:99, marginBottom:10,
            backdropFilter:"blur(4px)",
          }}>{cfg.label.toUpperCase()}</span>

          <h2 style={{
            color:"#fff", fontSize:22, fontWeight:900,
            fontFamily:"'Plus Jakarta Sans',sans-serif",
            lineHeight:1.2, marginBottom:6,
            textShadow:"0 2px 8px rgba(0,0,0,.15)",
          }}>{ev.grupo}</h2>

          <p style={{
            color:"rgba(255,255,255,.85)", fontSize:13,
            lineHeight:1.6, fontStyle:"italic",
          }}>"{ev.propuesta}"</p>

          {/* Hora pill */}
          <div style={{
            display:"inline-flex", alignItems:"center", gap:6,
            background:"rgba(0,0,0,.2)", color:"#fff",
            fontSize:12, fontWeight:800,
            padding:"6px 14px", borderRadius:99, marginTop:12,
            backdropFilter:"blur(4px)",
          }}>
            🕐 {ev.hora_inicio}{ev.hora_fin && ` — ${ev.hora_fin}`}
            {ev.fecha && ` · ${formatDateShort(ev.fecha)}`}
          </div>
        </div>

        <div style={{ padding:"20px 20px 40px", display:"flex", flexDirection:"column", gap:12 }}>
          {/* Info pills */}
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {[
              ev.salon    && { icon:"🏫", val:ev.salon },
              ev.profesor && { icon:"👤", val:ev.profesor },
              ev.materia  && { icon:"📚", val:ev.materia },
            ].filter(Boolean).map(({icon,val}) => (
              <span key={val} style={{
                display:"inline-flex", alignItems:"center", gap:5,
                background:"#f8fafc", border:"1.5px solid #e2e8f0",
                borderRadius:99, padding:"6px 13px",
                fontSize:12, fontWeight:700, color:"#334155",
              }}>{icon} {val}</span>
            ))}
          </div>

          {/* Integrantes */}
          {members.length > 0 && (
            <div style={{
              background:"#f8fafc", borderRadius:16,
              border:"1.5px solid #e2e8f0", overflow:"hidden",
            }}>
              <p style={{
                fontSize:10, fontWeight:800, color:"#94a3b8",
                textTransform:"uppercase", letterSpacing:1,
                padding:"11px 14px 8px",
              }}>👥 Integrantes</p>
              {members.map((n,i) => (
                <div key={i} style={{
                  display:"flex", alignItems:"center", gap:10,
                  padding:"9px 14px",
                  borderTop: i>0 ? "1px solid #f1f5f9" : "none",
                }}>
                  <div style={{
                    width:32, height:32, borderRadius:"50%", flexShrink:0,
                    background:`hsl(${(i*97+parseInt(ev.id||0)*43)%360},55%,62%)`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:11, fontWeight:900, color:"#fff",
                  }}>{initials(n)}</div>
                  <span style={{ fontSize:13.5, fontWeight:600, color:"#1e293b" }}>{n}</span>
                </div>
              ))}
            </div>
          )}

          {/* Notas */}
          {ev.notas && (
            <div style={{
              background:"#fffbeb", border:"1.5px solid #fde68a",
              borderRadius:14, padding:"13px 14px",
            }}>
              <p style={{ fontSize:9.5, fontWeight:800, color:"#92400e",
                textTransform:"uppercase", letterSpacing:.8, marginBottom:5 }}>
                📝 Notas del profesor
              </p>
              <p style={{ fontSize:13, color:"#78350f", lineHeight:1.7, margin:0 }}>{ev.notas}</p>
            </div>
          )}

          <button onClick={onClose} style={{
            padding:"14px", borderRadius:14,
            background:`linear-gradient(135deg,${ev.color},${ev.color}cc)`,
            color:"#fff", border:"none", fontSize:14, fontWeight:800,
            cursor:"pointer", fontFamily:"inherit",
            boxShadow:`0 4px 16px ${ev.color}55`,
          }}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
//  APP
// ══════════════════════════════════════════════════════
export default function App() {
  const [events, setEvents]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [usingDemo, setUsingDemo]       = useState(false);
  const [selected, setSelected]         = useState(null);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroFecha, setFiltroFecha]   = useState("todas");
  const [busqueda, setBusqueda]         = useState("");

  const loadData = url => {
    setLoading(true);
    if (!url || url.includes("TU_URL")) {
      setTimeout(() => { setEvents(DEMO_DATA.map(parseRow)); setUsingDemo(true); setLoading(false); }, 500);
      return;
    }
    Papa.parse(url, {
      download:true, header:true, skipEmptyLines:true,
      complete: r => {
        if (r.data?.length > 0) { setEvents(r.data.map(parseRow)); setUsingDemo(false); }
        else { setEvents(DEMO_DATA.map(parseRow)); setUsingDemo(true); }
        setLoading(false);
      },
      error: () => { setEvents(DEMO_DATA.map(parseRow)); setUsingDemo(true); setLoading(false); },
    });
  };

  useEffect(() => { loadData(GOOGLE_SHEET_CSV_URL); }, []);

  const fechas = ["todas", ...Array.from(new Set(events.map(e=>e.fecha).filter(Boolean))).sort()];
  const real   = events.filter(e => e.estado !== "descanso");

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
  const stats = {
    total:        real.length,
    proximos:     real.filter(e=>e.estado==="proximo").length,
    en_discusion: real.filter(e=>e.estado==="en_discusion").length,
    finalizados:  real.filter(e=>e.estado==="finalizado").length,
  };

  const FILTROS = [
    { id:"todos",        label:"Todos",        dot:null },
    { id:"proximo",      label:"Próximos",     dot:"#6366f1" },
    { id:"en_discusion", label:"En Discusión", dot:"#f59e0b" },
    { id:"pendiente",    label:"Pendientes",   dot:"#94a3b8" },
    { id:"finalizado",   label:"Finalizados",  dot:"#10b981" },
    { id:"cancelado",    label:"Cancelados",   dot:"#ef4444" },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"#f8fafc",
      fontFamily:"'DM Sans',system-ui,sans-serif", overflowX:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800;900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{overflow-x:hidden;}
        ::-webkit-scrollbar{width:0;}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideUp{from{transform:translateY(60px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .row:active{transform:scale(.985);}
        .fchip:hover{opacity:.85;}
        .fchip:active{transform:scale(.95);}
      `}</style>

      {/* ══ HEADER ══ */}
      <div style={{
        background:"linear-gradient(135deg,#0f172a 0%,#1e293b 100%)",
        padding:"22px 18px 18px",
        position:"sticky", top:0, zIndex:50,
      }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}>
          <div style={{
            width:40, height:40, borderRadius:12, flexShrink:0,
            background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:20, boxShadow:"0 4px 12px rgba(99,102,241,.5)",
          }}>🎓</div>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:9, color:"rgba(255,255,255,.4)",
              letterSpacing:2, textTransform:"uppercase", fontWeight:700, marginBottom:1 }}>
              Sistema de Turnos
            </p>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <h1 style={{ color:"#fff", fontSize:24, fontWeight:900,
                fontFamily:"'Plus Jakarta Sans',sans-serif", letterSpacing:"-.5px" }}>
                PanaTurno
              </h1>
              {usingDemo && (
                <span style={{ background:"#fbbf24", color:"#78350f",
                  fontSize:8, fontWeight:900, padding:"2px 7px",
                  borderRadius:99, letterSpacing:.5 }}>DEMO</span>
              )}
            </div>
          </div>
          {/* Stats inline */}
          <div style={{ display:"flex", gap:6 }}>
            {[
              { v:stats.proximos,     bg:"#6366f1" },
              { v:stats.en_discusion, bg:"#f59e0b" },
              { v:stats.finalizados,  bg:"#10b981" },
            ].map((s,i) => (
              <div key={i} style={{
                width:34, height:34, borderRadius:10,
                background:s.bg, display:"flex", alignItems:"center",
                justifyContent:"center", flexShrink:0,
                boxShadow:`0 4px 10px ${s.bg}55`,
              }}>
                <span style={{ color:"#fff", fontSize:14, fontWeight:900,
                  fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{s.v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Search */}
        <div style={{ position:"relative", marginBottom:12 }}>
          <span style={{ position:"absolute", left:13, top:"50%",
            transform:"translateY(-50%)", fontSize:14, opacity:.4, pointerEvents:"none" }}>🔍</span>
          <input type="text"
            placeholder="Buscar grupo, integrante, propuesta…"
            value={busqueda} onChange={e=>setBusqueda(e.target.value)}
            style={{ width:"100%", padding:"11px 36px 11px 38px",
              borderRadius:12, border:"none",
              fontSize:13, color:"#0f172a", background:"rgba(255,255,255,.95)",
              fontFamily:"inherit", fontWeight:500, outline:"none",
              boxSizing:"border-box",
              boxShadow:"0 2px 8px rgba(0,0,0,.2)" }} />
          {busqueda && (
            <button onClick={()=>setBusqueda("")} style={{
              position:"absolute", right:10, top:"50%", transform:"translateY(-50%)",
              border:"none", background:"#e2e8f0", cursor:"pointer",
              borderRadius:"50%", width:22, height:22,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:11, color:"#64748b", fontWeight:900,
            }}>✕</button>
          )}
        </div>

        {/* Filtros fecha */}
        {fechas.length > 2 && (
          <div style={{ display:"flex", gap:6, overflowX:"auto",
            scrollbarWidth:"none", marginBottom:8 }}>
            {fechas.map(f => {
              const active = filtroFecha === f;
              return (
                <button key={f} className="fchip" onClick={()=>setFiltroFecha(f)}
                  style={{
                    padding:"5px 12px", borderRadius:99, border:"none",
                    fontSize:11, fontWeight:700, cursor:"pointer",
                    flexShrink:0, fontFamily:"inherit", transition:"all .15s",
                    background: active ? "#fff" : "rgba(255,255,255,.12)",
                    color: active ? "#0f172a" : "rgba(255,255,255,.65)",
                  }}>
                  {f==="todas" ? "📅 Todas" : `📅 ${new Date(f+"T00:00:00").toLocaleDateString("es-VE",{day:"numeric",month:"short"})}`}
                </button>
              );
            })}
          </div>
        )}

        {/* Filtros estado — chips de colores */}
        <div style={{ display:"flex", gap:6, overflowX:"auto", scrollbarWidth:"none" }}>
          {FILTROS.map(f => {
            const active = filtroEstado === f.id;
            const cfg = ESTADOS[f.id];
            return (
              <button key={f.id} className="fchip" onClick={()=>setFiltroEstado(f.id)}
                style={{
                  padding:"5px 12px", borderRadius:99, border:"none",
                  fontSize:11, fontWeight:800, cursor:"pointer",
                  flexShrink:0, fontFamily:"inherit", transition:"all .15s",
                  background: active
                    ? (cfg ? cfg.bg : "#fff")
                    : "rgba(255,255,255,.12)",
                  color: active
                    ? (cfg ? cfg.color : "#0f172a")
                    : "rgba(255,255,255,.65)",
                  boxShadow: active ? `0 2px 8px ${cfg?.bg || "#fff"}44` : "none",
                }}>
                {f.dot && <span style={{ width:6, height:6, borderRadius:"50%",
                  background: active ? cfg.color : "rgba(255,255,255,.5)",
                  display:"inline-block", marginRight:5 }} />}
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ══ LISTA ══ */}
      <div style={{ padding:"12px 0 80px" }}>

        {loading && (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center",
            padding:"80px 20px", gap:14 }}>
            <div style={{ width:40, height:40, border:"3px solid #e2e8f0",
              borderTopColor:"#6366f1", borderRadius:"50%",
              animation:"spin .7s linear infinite" }}/>
            <p style={{ fontSize:13, color:"#94a3b8", fontWeight:600 }}>Cargando turnos…</p>
          </div>
        )}

        {!loading && grouped.map(([fecha, evs]) => (
          <div key={fecha}>
            {/* Date header */}
            <div style={{
              display:"flex", alignItems:"center", gap:10,
              padding:"16px 18px 8px",
            }}>
              <div style={{
                background:"linear-gradient(135deg,#1e293b,#334155)",
                borderRadius:12, padding:"6px 14px",
                display:"flex", alignItems:"center", gap:8,
              }}>
                <span style={{ fontSize:12 }}>📅</span>
                <span style={{ color:"#fff", fontSize:12, fontWeight:800,
                  fontFamily:"'Plus Jakarta Sans',sans-serif",
                  textTransform:"capitalize" }}>
                  {fecha==="Sin fecha" ? "Sin fecha" : formatDate(fecha)}
                </span>
                <span style={{
                  background:"#6366f1", color:"#fff",
                  fontSize:10, fontWeight:900,
                  width:20, height:20, borderRadius:"50%",
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>{evs.filter(e=>e.estado!=="descanso").length}</span>
              </div>
            </div>

            {/* Rows */}
            <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
              {evs.map((ev, i) => {
                const cfg = ESTADOS[ev.estado] || ESTADOS.pendiente;
                const isBreak = ev.estado === "descanso";
                const members = ev.integrantes
                  ? ev.integrantes.split(",").map(s=>s.trim()).filter(Boolean)
                  : [];

                if (isBreak) return (
                  <div key={ev.id} style={{
                    display:"flex", alignItems:"center", gap:12,
                    padding:"10px 18px", margin:"4px 12px",
                    background:"#f1f5f9", borderRadius:12,
                    animation:`fadeUp .3s ease ${i*40}ms both`,
                  }}>
                    <span style={{ fontSize:18 }}>☕</span>
                    <div>
                      <p style={{ fontSize:11, fontWeight:800, color:"#64748b", margin:0 }}>
                        {ev.hora_inicio}{ev.hora_fin && ` – ${ev.hora_fin}`} · Receso
                      </p>
                      {ev.propuesta && <p style={{ fontSize:10, color:"#94a3b8", margin:0 }}>{ev.propuesta}</p>}
                    </div>
                  </div>
                );

                return (
                  <div key={ev.id}
                    className="row"
                    onClick={() => setSelected(ev)}
                    style={{
                      display:"flex", alignItems:"center", gap:0,
                      padding:"0 18px",
                      cursor:"pointer", transition:"background .12s",
                      animation:`fadeUp .35s ease ${i*50}ms both`,
                      background:"transparent",
                    }}
                    onMouseEnter={e=>e.currentTarget.style.background="#f1f5f9"}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                  >
                    {/* Timeline dot + line */}
                    <div style={{ display:"flex", flexDirection:"column",
                      alignItems:"center", width:32, flexShrink:0, alignSelf:"stretch" }}>
                      <div style={{ width:1, flex:1, background:"#e2e8f0",
                        minHeight:10, marginBottom:2 }} />
                      <div style={{
                        width:12, height:12, borderRadius:"50%", flexShrink:0,
                        background:ev.color, border:"2.5px solid #fff",
                        boxShadow:`0 0 0 2px ${ev.color}44`,
                        zIndex:1,
                      }}/>
                      <div style={{ width:1, flex:1, background:"#e2e8f0",
                        minHeight:10, marginTop:2 }} />
                    </div>

                    {/* Card content */}
                    <div style={{
                      flex:1, borderBottom:"1px solid #f1f5f9",
                      padding:"14px 0 14px 12px", minWidth:0,
                    }}>
                      <div style={{ display:"flex", alignItems:"flex-start",
                        justifyContent:"space-between", gap:8, marginBottom:4 }}>
                        <div style={{ minWidth:0, flex:1 }}>
                          {/* Hora */}
                          <span style={{
                            fontSize:10, fontWeight:800, color:ev.color,
                            letterSpacing:.3, display:"block", marginBottom:3,
                          }}>
                            {ev.hora_inicio}{ev.hora_fin && ` — ${ev.hora_fin}`}
                          </span>
                          {/* Nombre grupo */}
                          <p style={{
                            fontSize:15, fontWeight:800, color:"#0f172a",
                            fontFamily:"'Plus Jakarta Sans',sans-serif",
                            lineHeight:1.25, marginBottom:2,
                            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                          }}>{ev.grupo}</p>
                          {/* Propuesta */}
                          <p style={{
                            fontSize:12, color:"#64748b", lineHeight:1.5,
                            overflow:"hidden", display:"-webkit-box",
                            WebkitLineClamp:1, WebkitBoxOrient:"vertical",
                            marginBottom:6,
                          }}>{ev.propuesta}</p>
                        </div>

                        {/* Badge estado */}
                        <span style={{
                          flexShrink:0, fontSize:9.5, fontWeight:800,
                          padding:"4px 9px", borderRadius:99,
                          background:cfg.bg, color:cfg.color,
                          border:`1px solid ${cfg.bg === "#e2e8f0" ? "#cbd5e1" : "transparent"}`,
                          whiteSpace:"nowrap",
                        }}>{cfg.label}</span>
                      </div>

                      {/* Footer row */}
                      <div style={{ display:"flex", alignItems:"center",
                        gap:6, flexWrap:"wrap" }}>
                        {/* Avatares */}
                        {members.length > 0 && (
                          <div style={{ display:"flex", marginRight:2 }}>
                            {members.slice(0,3).map((n,j) => (
                              <div key={j} title={n} style={{
                                width:20, height:20, borderRadius:"50%",
                                border:"1.5px solid #fff",
                                marginLeft: j>0 ? -6 : 0,
                                background:`hsl(${(j*97+parseInt(ev.id||0)*43)%360},55%,62%)`,
                                display:"flex", alignItems:"center", justifyContent:"center",
                                fontSize:7, fontWeight:900, color:"#fff",
                              }}>{initials(n)}</div>
                            ))}
                            {members.length > 3 && (
                              <div style={{ width:20, height:20, borderRadius:"50%",
                                border:"1.5px solid #fff", marginLeft:-6,
                                background:"#e2e8f0", display:"flex",
                                alignItems:"center", justifyContent:"center",
                                fontSize:7, fontWeight:900, color:"#94a3b8" }}>
                                +{members.length-3}
                              </div>
                            )}
                          </div>
                        )}
                        {ev.salon && (
                          <span style={{ fontSize:10, color:"#94a3b8", fontWeight:600 }}>
                            🏫 {ev.salon}
                          </span>
                        )}
                        {ev.profesor && (
                          <span style={{ fontSize:10, color:"#94a3b8", fontWeight:600 }}>
                            · 👤 {ev.profesor}
                          </span>
                        )}
                        {ev.materia && (
                          <span style={{
                            fontSize:9.5, fontWeight:700,
                            color:ev.color, background:`${ev.color}15`,
                            padding:"2px 7px", borderRadius:99, marginLeft:"auto",
                          }}>{ev.materia}</span>
                        )}
                      </div>
                    </div>

                    {/* Chevron */}
                    <div style={{ width:24, flexShrink:0, display:"flex",
                      alignItems:"center", justifyContent:"center",
                      color:"#cbd5e1", fontSize:16, paddingLeft:8 }}>›</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Empty */}
        {!loading && filtered.filter(e=>e.estado!=="descanso").length===0 && (
          <div style={{ textAlign:"center", padding:"60px 24px",
            animation:"fadeUp .4s ease both" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🔍</div>
            <p style={{ fontSize:16, fontWeight:800, color:"#1e293b",
              fontFamily:"'Plus Jakarta Sans',sans-serif", marginBottom:6 }}>Sin resultados</p>
            <p style={{ fontSize:12.5, color:"#94a3b8", marginBottom:18 }}>
              Prueba con otros filtros
            </p>
            <button onClick={()=>{setFiltroEstado("todos");setFiltroFecha("todas");setBusqueda("");}}
              style={{ padding:"10px 22px",
                background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
                color:"#fff", border:"none", borderRadius:12,
                fontSize:13, fontWeight:800, cursor:"pointer",
                fontFamily:"inherit" }}>
              Limpiar filtros
            </button>
          </div>
        )}

        {!loading && filtered.filter(e=>e.estado!=="descanso").length>0 && (
          <p style={{ textAlign:"center", fontSize:11, color:"#cbd5e1",
            fontWeight:600, padding:"20px 0 0" }}>
            — {filtered.filter(e=>e.estado!=="descanso").length} grupos —
          </p>
        )}
      </div>

      {selected && <Modal ev={selected} onClose={()=>setSelected(null)} />}
    </div>
  );
}