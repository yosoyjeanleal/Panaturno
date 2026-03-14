import { useState, useEffect, useRef } from "react";
import Papa from "papaparse";

// ══════════════════════════════════════════════════════
//  CONFIGURACIÓN — pega aquí tu URL de Google Sheet CSV
// ══════════════════════════════════════════════════════
const GOOGLE_SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRiK0_5iOHK73-cz5TrugjkQNNgOSOWHncP37MNl0eFqMh94Bgysu578J4PV6H_y1gDj2wq_KQoiosa/pub?gid=0&single=true&output=csv";

const DEMO_DATA = [
  { id:"1", grupo:"Equipo Alpha", integrantes:"Carlos Pérez, María González, Luis Rodríguez", propuesta:"Sistema de Gestión de Inventarios con IA", materia:"Proyecto Final", profesor:"Dr. Ramírez", fecha:"2025-06-10", hora_inicio:"08:00", hora_fin:"08:30", salon:"Aula 301", estado:"proximo", notas:"Presentar mockups y diagrama de base de datos", color:"#6366f1" },
  { id:"2", grupo:"Los Innovadores", integrantes:"Ana Martínez, Pedro Sánchez, Sofía Torres", propuesta:"App Móvil para Registro de Asistencia", materia:"Proyecto Final", profesor:"Dra. López", fecha:"2025-06-10", hora_inicio:"08:30", hora_fin:"09:00", salon:"Aula 301", estado:"en_discusion", notas:"Revisar arquitectura del sistema", color:"#0ea5e9" },
  { id:"3", grupo:"Tech Visión", integrantes:"Roberto Díaz, Carmen Núñez, Jorge Herrera", propuesta:"Plataforma E-learning Adaptativa", materia:"Proyecto Final", profesor:"Dr. Ramírez", fecha:"2025-06-10", hora_inicio:"09:00", hora_fin:"09:30", salon:"Aula 301", estado:"pendiente", notas:"", color:"#10b981" },
  { id:"DESCANSO", grupo:"DESCANSO", integrantes:"", propuesta:"Receso", materia:"", profesor:"", fecha:"2025-06-10", hora_inicio:"09:30", hora_fin:"09:45", salon:"", estado:"descanso", notas:"Receso entre bloques", color:"#94a3b8" },
  { id:"4", grupo:"DataSmart", integrantes:"Elena Vargas, Miguel Castro, Daniela Morales", propuesta:"Dashboard de Analítica para PYMES", materia:"Proyecto Final", profesor:"Dra. López", fecha:"2025-06-10", hora_inicio:"09:45", hora_fin:"10:15", salon:"Aula 301", estado:"finalizado", notas:"Excelente presentación", color:"#a855f7" },
  { id:"5", grupo:"CloudBuilders", integrantes:"Andrés Medina, Valentina Cruz, Nicolás Reyes", propuesta:"Sistema de Monitoreo IoT para Campus", materia:"Seminario de Investigación", profesor:"Dr. Ramírez", fecha:"2025-06-11", hora_inicio:"10:00", hora_fin:"10:30", salon:"Laboratorio A", estado:"cancelado", notas:"Reprogramado para la próxima semana", color:"#ef4444" },
  { id:"6", grupo:"GreenCode", integrantes:"Isabella Flores, Santiago Ruiz, Camila Jiménez", propuesta:"Gestión Sostenible de Recursos Hídricos", materia:"Seminario de Investigación", profesor:"Dra. López", fecha:"2025-06-11", hora_inicio:"10:30", hora_fin:"11:00", salon:"Laboratorio A", estado:"proximo", notas:"", color:"#22c55e" },
  { id:"7", grupo:"ByteForce", integrantes:"Marcos Delgado, Laura Vega, Diego Castillo", propuesta:"Red Neuronal para Detección de Plagas", materia:"IA Aplicada", profesor:"Dr. Ramírez", fecha:"2025-06-11", hora_inicio:"11:00", hora_fin:"11:30", salon:"Laboratorio A", estado:"en_discusion", notas:"Muy buena propuesta", color:"#f59e0b" },
];

const ESTADOS = {
  proximo:      { label:"Próximo",       color:"#6366f1", bg:"#eef2ff", dot:"#6366f1" },
  en_discusion: { label:"En Discusión",  color:"#f59e0b", bg:"#fffbeb", dot:"#f59e0b" },
  pendiente:    { label:"Pendiente",     color:"#94a3b8", bg:"#f8fafc", dot:"#cbd5e1" },
  cancelado:    { label:"Cancelado",     color:"#ef4444", bg:"#fef2f2", dot:"#ef4444" },
  finalizado:   { label:"Finalizado",    color:"#22c55e", bg:"#f0fdf4", dot:"#22c55e" },
  descanso:     { label:"Descanso",      color:"#94a3b8", bg:"#f8fafc", dot:"#e2e8f0" },
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
    estado:      (row.estado || row.status || "pendiente").toLowerCase().replace(" ","_"),
    notas:       row.notas || row.notes || "",
    color:       row.color || PALETA[i % PALETA.length],
  };
}

function formatDate(d) {
  if (!d) return "";
  try { return new Date(d+"T00:00:00").toLocaleDateString("es-VE",{weekday:"long",day:"numeric",month:"long"}); }
  catch { return d; }
}

function groupByDate(evs) {
  const g = {};
  evs.forEach(e => { const k = e.fecha||"Sin fecha"; if(!g[k]) g[k]=[]; g[k].push(e); });
  return Object.entries(g).sort(([a],[b]) => a.localeCompare(b));
}

function initials(name) {
  return name.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase();
}

// ── Badge estado ──
function Badge({ estado }) {
  const c = ESTADOS[estado] || ESTADOS.pendiente;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5,
      background:c.bg, color:c.color, fontSize:10, fontWeight:800,
      padding:"3px 10px", borderRadius:99, border:`1.5px solid ${c.color}30` }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:c.dot, display:"inline-block" }} />
      {c.label}
    </span>
  );
}

// ── Tarjeta ──
function Card({ ev, onClick, idx }) {
  const isBreak = ev.estado === "descanso";

  if (isBreak) return (
    <div style={{ gridColumn:"1/-1", display:"flex", alignItems:"center", gap:14,
      background:"#f8fafc", border:"2px dashed #e2e8f0", borderRadius:20,
      padding:"14px 22px", margin:"4px 0",
      animation:`fadeUp .4s ease ${Math.min(idx*50,300)}ms both` }}>
      <span style={{ fontSize:26 }}>☕</span>
      <div>
        <p style={{ fontSize:13, fontWeight:800, color:"#64748b", margin:0 }}>
          {ev.hora_inicio}{ev.hora_fin && ` – ${ev.hora_fin}`} · Descanso
        </p>
        {ev.notas && <p style={{ fontSize:11, color:"#94a3b8", margin:"2px 0 0" }}>{ev.notas}</p>}
      </div>
    </div>
  );

  const members = ev.integrantes ? ev.integrantes.split(",").map(s=>s.trim()) : [];

  return (
    <div onClick={onClick} className="card"
      style={{ animationDelay:`${Math.min(idx*60,500)}ms` }}>

      {/* Franja color top */}
      <div style={{ height:4, background:`linear-gradient(90deg,${ev.color},${ev.color}55)`,
        margin:"-1px -1px 0", borderRadius:"20px 20px 0 0" }} />

      <div style={{ padding:"16px 16px 14px" }}>
        {/* Hora + estado */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <span style={{ fontSize:11, fontWeight:800, color:ev.color,
            background:`${ev.color}15`, padding:"4px 10px", borderRadius:99 }}>
            🕐 {ev.hora_inicio}{ev.hora_fin && ` – ${ev.hora_fin}`}
          </span>
          <Badge estado={ev.estado} />
        </div>

        {/* Nombre grupo */}
        <h3 style={{ fontSize:16, fontWeight:900, color:"#0f172a",
          fontFamily:"'Sora',sans-serif", lineHeight:1.3, marginBottom:5,
          overflow:"hidden", display:"-webkit-box",
          WebkitLineClamp:1, WebkitBoxOrient:"vertical" }}>
          {ev.grupo}
        </h3>

        {/* Propuesta */}
        <p style={{ fontSize:12.5, color:"#64748b", lineHeight:1.6, marginBottom:12,
          overflow:"hidden", display:"-webkit-box",
          WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
          {ev.propuesta}
        </p>

        {/* Avatares */}
        {members.length > 0 && (
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
            <div style={{ display:"flex" }}>
              {members.slice(0,4).map((n,i) => (
                <div key={i} title={n} style={{
                  width:28, height:28, borderRadius:"50%", border:"2.5px solid #fff",
                  marginLeft: i>0 ? -9 : 0, flexShrink:0,
                  background:`hsl(${(i*83+parseInt(ev.id||0)*37)%360},60%,58%)`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:9, fontWeight:900, color:"#fff" }}>
                  {initials(n)}
                </div>
              ))}
              {members.length > 4 && (
                <div style={{ width:28, height:28, borderRadius:"50%", border:"2.5px solid #fff",
                  marginLeft:-9, background:"#e2e8f0", display:"flex", alignItems:"center",
                  justifyContent:"center", fontSize:9, fontWeight:900, color:"#94a3b8" }}>
                  +{members.length-4}
                </div>
              )}
            </div>
            <span style={{ fontSize:10.5, color:"#94a3b8", fontWeight:600 }}>
              {members.length} integrante{members.length!==1?"s":""}
            </span>
          </div>
        )}

        {/* Tags info */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:5, paddingTop:10,
          borderTop:"1px solid #f1f5f9" }}>
          {ev.salon && <span style={{ fontSize:10, color:"#475569", background:"#f1f5f9",
            padding:"3px 9px", borderRadius:8, fontWeight:600 }}>🏫 {ev.salon}</span>}
          {ev.profesor && <span style={{ fontSize:10, color:"#475569", background:"#f1f5f9",
            padding:"3px 9px", borderRadius:8, fontWeight:600 }}>👤 {ev.profesor}</span>}
          {ev.materia && <span style={{ fontSize:10, color:ev.color,
            background:`${ev.color}12`, padding:"3px 9px", borderRadius:8, fontWeight:700 }}>
            {ev.materia}</span>}
        </div>
      </div>
    </div>
  );
}

// ── Modal detalle ──
function Modal({ ev, onClose }) {
  const cfg = ESTADOS[ev.estado] || ESTADOS.pendiente;
  const members = ev.integrantes ? ev.integrantes.split(",").map(s=>s.trim()) : [];

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div style={{ position:"fixed", inset:0, zIndex:9000,
      display:"flex", alignItems:"flex-end", justifyContent:"center" }}
      onClick={onClose}>
      <div style={{ position:"absolute", inset:0,
        background:"rgba(2,8,23,.8)", backdropFilter:"blur(12px)",
        animation:"fadeIn .2s ease" }} />
      <div onClick={e=>e.stopPropagation()} style={{
        position:"relative", background:"#fff",
        borderRadius:"28px 28px 0 0", width:"100%", maxWidth:540,
        maxHeight:"92vh", overflowY:"auto",
        boxShadow:"0 -30px 80px rgba(0,0,0,.3)",
        animation:"slideUp .3s cubic-bezier(.22,.68,0,1.1)" }}>

        {/* Header color */}
        <div style={{ height:130, borderRadius:"28px 28px 0 0",
          background:`linear-gradient(135deg, ${ev.color}25, ${ev.color}08)`,
          padding:"18px 20px 0", position:"relative" }}>
          <div style={{ width:40, height:4, borderRadius:99, background:"#e2e8f0", margin:"0 auto 16px" }} />
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <Badge estado={ev.estado} />
            <button onClick={onClose} style={{ width:34, height:34, borderRadius:"50%",
              border:"none", background:"rgba(0,0,0,.08)", cursor:"pointer",
              fontSize:14, fontWeight:900, color:"#475569",
              display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
          </div>
        </div>

        <div style={{ padding:"0 20px 44px" }}>
          {/* Hora pill */}
          <div style={{ display:"inline-flex", alignItems:"center", gap:6,
            background:ev.color, color:"#fff", fontSize:12, fontWeight:800,
            padding:"7px 16px", borderRadius:99, marginBottom:14, marginTop:-14,
            position:"relative", boxShadow:`0 4px 16px ${ev.color}55` }}>
            🕐 {ev.hora_inicio}{ev.hora_fin && ` – ${ev.hora_fin}`}
            {ev.fecha && ` · ${formatDate(ev.fecha)}`}
          </div>

          <h2 style={{ fontSize:24, fontWeight:900, color:"#0f172a",
            fontFamily:"'Sora',sans-serif", lineHeight:1.2, marginBottom:6 }}>
            {ev.grupo}
          </h2>
          <p style={{ fontSize:14, color:"#475569", lineHeight:1.7, marginBottom:20,
            fontStyle:"italic" }}>"{ev.propuesta}"</p>

          {/* Info */}
          <div style={{ border:"1.5px solid #f1f5f9", borderRadius:20, overflow:"hidden", marginBottom:20 }}>
            {[
              ev.salon   && { icon:"🏫", label:"Salón", val:ev.salon },
              ev.profesor && { icon:"👤", label:"Profesor(a)", val:ev.profesor },
              ev.materia  && { icon:"📚", label:"Materia", val:ev.materia },
              ev.fecha    && { icon:"📅", label:"Fecha", val:formatDate(ev.fecha) },
            ].filter(Boolean).map(({icon,label,val},i,arr) => (
              <div key={label} style={{ display:"flex", alignItems:"center", gap:13,
                padding:"13px 16px",
                background: i%2===0 ? "#fff" : "#fafbff",
                borderBottom: i<arr.length-1 ? "1px solid #f1f5f9" : "none" }}>
                <div style={{ width:38, height:38, borderRadius:12,
                  background:`${ev.color}15`, display:"flex", alignItems:"center",
                  justifyContent:"center", fontSize:17, flexShrink:0 }}>{icon}</div>
                <div>
                  <p style={{ fontSize:9, color:"#94a3b8", fontWeight:800,
                    textTransform:"uppercase", letterSpacing:.9, margin:"0 0 2px" }}>{label}</p>
                  <p style={{ fontSize:14, color:"#1e293b", fontWeight:600, margin:0 }}>{val}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Integrantes */}
          {members.length > 0 && (
            <div style={{ marginBottom:20 }}>
              <p style={{ fontSize:10, fontWeight:800, color:"#94a3b8",
                textTransform:"uppercase", letterSpacing:.9, marginBottom:10 }}>
                Integrantes del grupo
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                {members.map((n,i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:11,
                    padding:"9px 13px", background:"#f8fafc", borderRadius:14 }}>
                    <div style={{ width:36, height:36, borderRadius:"50%", flexShrink:0,
                      background:`hsl(${(i*83+parseInt(ev.id||0)*37)%360},60%,58%)`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:12, fontWeight:900, color:"#fff" }}>{initials(n)}</div>
                    <span style={{ fontSize:14, fontWeight:600, color:"#334155" }}>{n}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notas */}
          {ev.notas && (
            <div style={{ background:"#fffbeb", border:"1.5px solid #fde68a",
              borderRadius:16, padding:"15px 16px", marginBottom:20 }}>
              <p style={{ fontSize:10, fontWeight:800, color:"#92400e",
                textTransform:"uppercase", letterSpacing:.8, margin:"0 0 6px" }}>
                📝 Notas del profesor
              </p>
              <p style={{ fontSize:13.5, color:"#78350f", lineHeight:1.65, margin:0 }}>{ev.notas}</p>
            </div>
          )}

          <button onClick={onClose} style={{ width:"100%", padding:"16px",
            background:`linear-gradient(135deg,${ev.color},${ev.color}cc)`,
            color:"#fff", border:"none", borderRadius:16, fontSize:15,
            fontWeight:800, cursor:"pointer", fontFamily:"inherit",
            boxShadow:`0 4px 16px ${ev.color}44` }}>
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
  const [events, setEvents]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [usingDemo, setUsingDemo]     = useState(false);
  const [selected, setSelected]       = useState(null);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroFecha, setFiltroFecha]  = useState("todas");
  const [busqueda, setBusqueda]        = useState("");

  const loadData = (url) => {
    setLoading(true);
    if (!url || url.includes("TU_URL")) {
      setTimeout(() => { setEvents(DEMO_DATA.map(parseRow)); setUsingDemo(true); setLoading(false); }, 600);
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
    total:        events.filter(e=>e.estado!=="descanso").length,
    proximos:     events.filter(e=>e.estado==="proximo").length,
    en_discusion: events.filter(e=>e.estado==="en_discusion").length,
    finalizados:  events.filter(e=>e.estado==="finalizado").length,
  };

  const FILTROS = [
    {id:"todos",label:"Todos"},
    {id:"proximo",label:"Próximos"},
    {id:"en_discusion",label:"En Discusión"},
    {id:"pendiente",label:"Pendientes"},
    {id:"finalizado",label:"Finalizados"},
    {id:"cancelado",label:"Cancelados"},
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh",
      width:"100vw", overflow:"hidden", background:"#f0f4ff",
      fontFamily:"'DM Sans',system-ui,sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800;900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800;9..40,900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:0;height:0;}

        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideUp{from{transform:translateY(44px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}

        .card{
          background:#fff;
          border-radius:20px;
          border:1.5px solid #e8ecf8;
          cursor:pointer;
          overflow:hidden;
          transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease;
          animation:fadeUp .45s ease both;
          break-inside:avoid;
          margin-bottom:14px;
        }
        .card:hover{
          transform:translateY(-5px) scale(1.01);
          box-shadow:0 16px 48px rgba(99,102,241,.14);
          border-color:#c7d2fe;
        }
        .card:active{transform:translateY(-2px) scale(1);}

        .chip{
          padding:8px 16px;
          border-radius:99px;
          border:2px solid transparent;
          white-space:nowrap;
          font-weight:700;
          cursor:pointer;
          font-size:12px;
          transition:all .15s;
          flex-shrink:0;
          font-family:inherit;
        }
        .chip:hover{transform:scale(1.04);}

        .grid{
          columns:1;
          column-gap:14px;
        }
        @media(min-width:540px){.grid{columns:2;}}
        @media(min-width:860px){.grid{columns:3;}}
        @media(min-width:1200px){.grid{columns:4;}}

        .search:focus{
          border-color:#6366f1 !important;
          box-shadow:0 0 0 4px rgba(99,102,241,.15) !important;
          outline:none;
        }
      `}</style>

      {/* ══ HEADER ══ */}
      <header style={{
        background:"linear-gradient(160deg,#1e1b4b 0%,#312e81 50%,#4338ca 100%)",
        padding:"16px 18px 0",
        flexShrink:0,
        boxShadow:"0 8px 40px rgba(30,27,75,.35)"
      }}>
        {/* Logo */}
        <div style={{ marginBottom:14 }}>
          <p style={{ fontSize:10, color:"rgba(255,255,255,.45)",
            letterSpacing:1.8, textTransform:"uppercase", marginBottom:3, fontWeight:600 }}>
            Universidad · Sistema de Turnos
          </p>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:38, height:38, borderRadius:12,
              background:"linear-gradient(135deg,#818cf8,#6366f1)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:20, boxShadow:"0 4px 14px rgba(99,102,241,.5)" }}>🎓</div>
            <h1 style={{ color:"#fff", fontSize:30, fontWeight:900,
              fontFamily:"'Sora',sans-serif", letterSpacing:"-1px", lineHeight:1 }}>
              PanaTurno
            </h1>
            {usingDemo && (
              <span style={{ background:"#fbbf24", color:"#78350f",
                fontSize:9, fontWeight:900, padding:"2px 9px",
                borderRadius:99, letterSpacing:.6 }}>DEMO</span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:"flex", gap:8, marginBottom:12,
          overflowX:"auto", scrollbarWidth:"none" }}>
          {[
            { v:stats.total,        label:"grupos",       icon:"👥", c:"rgba(255,255,255,.12)" },
            { v:stats.proximos,     label:"próximos",     icon:"🔵", c:"rgba(99,102,241,.35)"  },
            { v:stats.en_discusion, label:"en discusión", icon:"🟡", c:"rgba(245,158,11,.3)"   },
            { v:stats.finalizados,  label:"finalizados",  icon:"🟢", c:"rgba(34,197,94,.3)"    },
          ].map(s => (
            <div key={s.label} style={{ background:s.c,
              border:"1px solid rgba(255,255,255,.15)", borderRadius:14,
              padding:"8px 14px", flexShrink:0, textAlign:"center",
              minWidth:72 }}>
              <p style={{ fontSize:18, fontWeight:900, color:"#fff",
                fontFamily:"'Sora',sans-serif", lineHeight:1, margin:"0 0 2px" }}>{s.v}</p>
              <p style={{ fontSize:9.5, color:"rgba(255,255,255,.65)", fontWeight:600,
                margin:0, whiteSpace:"nowrap" }}>{s.icon} {s.label}</p>
            </div>
          ))}
        </div>

        {/* Buscador */}
        <div style={{ position:"relative", marginBottom:10 }}>
          <span style={{ position:"absolute", left:14, top:"50%",
            transform:"translateY(-50%)", fontSize:15, opacity:.5, pointerEvents:"none" }}>🔍</span>
          <input className="search" type="text"
            placeholder="Buscar grupo, propuesta, integrante…"
            value={busqueda} onChange={e=>setBusqueda(e.target.value)}
            style={{ width:"100%", padding:"12px 40px 12px 40px",
              borderRadius:14, border:"2px solid rgba(255,255,255,.15)",
              boxSizing:"border-box", fontSize:14, color:"#0f172a",
              background:"#fff", fontFamily:"inherit", fontWeight:500,
              transition:"all .2s" }} />
          {busqueda && (
            <button onClick={()=>setBusqueda("")} style={{ position:"absolute",
              right:12, top:"50%", transform:"translateY(-50%)",
              border:"none", background:"#e2e8f0", cursor:"pointer",
              borderRadius:"50%", width:24, height:24,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:11, color:"#64748b", fontWeight:900 }}>✕</button>
          )}
        </div>

        {/* Filtros fecha */}
        {fechas.length > 2 && (
          <div style={{ display:"flex", gap:6, overflowX:"auto",
            scrollbarWidth:"none", marginBottom:6, paddingBottom:2 }}>
            {fechas.map(f => (
              <button key={f} className="chip" onClick={()=>setFiltroFecha(f)}
                style={{ background: filtroFecha===f ? "rgba(255,255,255,.18)" : "transparent",
                  color: filtroFecha===f ? "#fff" : "rgba(255,255,255,.65)",
                  border: filtroFecha===f ? "2px solid rgba(255,255,255,.4)" : "2px solid rgba(255,255,255,.15)" }}>
                📅 {f==="todas" ? "Todas" : new Date(f+"T00:00:00").toLocaleDateString("es-VE",{day:"numeric",month:"short"})}
              </button>
            ))}
          </div>
        )}

        {/* Filtros estado */}
        <div style={{ display:"flex", gap:6, overflowX:"auto",
          scrollbarWidth:"none", paddingBottom:14 }}>
          {FILTROS.map(f => {
            const cfg = ESTADOS[f.id];
            const active = filtroEstado === f.id;
            return (
              <button key={f.id} className="chip" onClick={()=>setFiltroEstado(f.id)}
                style={{ background: active ? "#fff" : "rgba(255,255,255,.1)",
                  color: active ? (cfg ? cfg.color : "#0f172a") : "rgba(255,255,255,.8)",
                  border: active ? "2px solid transparent" : "2px solid rgba(255,255,255,.15)",
                  boxShadow: active ? "0 2px 12px rgba(0,0,0,.2)" : "none" }}>
                {f.id!=="todos" && <span style={{ width:7, height:7, borderRadius:"50%",
                  background: cfg?.dot, display:"inline-block", marginRight:5 }} />}
                {f.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* ══ CONTENIDO ══ */}
      <main style={{ flex:1, overflowY:"auto", padding:"0 0 40px" }}>

        {/* Loading */}
        {loading && (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center",
            justifyContent:"center", padding:"100px 20px", gap:16 }}>
            <div style={{ width:44, height:44, border:"4px solid #e2e8f0",
              borderTopColor:"#6366f1", borderRadius:"50%",
              animation:"spin .7s linear infinite" }} />
            <p style={{ fontSize:14, color:"#94a3b8", fontWeight:600 }}>Cargando turnos…</p>
          </div>
        )}

        {/* Grupos por fecha */}
        {!loading && grouped.map(([fecha, evs]) => (
          <div key={fecha}>
            {/* Separador fecha */}
            <div style={{ display:"flex", alignItems:"center", gap:12,
              padding:"20px 18px 10px", position:"sticky", top:0,
              background:"#f0f4ff", zIndex:10 }}>
              <div style={{ flex:1, height:1.5,
                background:"linear-gradient(90deg,#c7d2fe,transparent)" }} />
              <div style={{ background:"#fff", border:"2px solid #e0e7ff",
                borderRadius:99, padding:"6px 16px",
                display:"flex", alignItems:"center", gap:8, flexShrink:0,
                boxShadow:"0 2px 8px rgba(99,102,241,.1)" }}>
                <span style={{ fontSize:13 }}>📅</span>
                <span style={{ fontSize:12.5, fontWeight:800, color:"#3730a3" }}>
                  {fecha==="Sin fecha" ? "Sin fecha" : formatDate(fecha)}
                </span>
                <span style={{ background:"#6366f1", color:"#fff",
                  fontSize:11, fontWeight:800, padding:"2px 8px",
                  borderRadius:99, minWidth:22, textAlign:"center" }}>
                  {evs.filter(e=>e.estado!=="descanso").length}
                </span>
              </div>
              <div style={{ flex:1, height:1.5,
                background:"linear-gradient(270deg,#c7d2fe,transparent)" }} />
            </div>

            <div className="grid" style={{ padding:"0 14px" }}>
              {evs.map((ev,i) => (
                <Card key={ev.id} ev={ev} idx={i}
                  onClick={() => ev.estado!=="descanso" && setSelected(ev)} />
              ))}
            </div>
          </div>
        ))}

        {/* Empty */}
        {!loading && filtered.filter(e=>e.estado!=="descanso").length===0 && (
          <div style={{ textAlign:"center", padding:"80px 24px" }}>
            <div style={{ fontSize:56, marginBottom:16 }}>🔍</div>
            <p style={{ fontSize:18, fontWeight:900, color:"#1e1b4b",
              fontFamily:"'Sora',sans-serif", marginBottom:8 }}>Sin resultados</p>
            <p style={{ fontSize:13.5, color:"#94a3b8", marginBottom:20 }}>
              Prueba con otros filtros
            </p>
            <button onClick={()=>{setFiltroEstado("todos");setFiltroFecha("todas");setBusqueda("");}}
              style={{ padding:"12px 26px",
                background:"linear-gradient(135deg,#6366f1,#4f46e5)",
                color:"#fff", border:"none", borderRadius:14,
                fontSize:13, fontWeight:800, cursor:"pointer", fontFamily:"inherit",
                boxShadow:"0 4px 16px rgba(99,102,241,.35)" }}>
              Limpiar filtros
            </button>
          </div>
        )}

        {/* Footer */}
        {!loading && filtered.length>0 && (
          <p style={{ textAlign:"center", fontSize:11, color:"#c7d2fe",
            fontWeight:600, padding:"8px 0 20px" }}>
            ✦ PanaTurno · {filtered.filter(e=>e.estado!=="descanso").length} grupos ✦
          </p>
        )}
      </main>

      {selected && <Modal ev={selected} onClose={()=>setSelected(null)} />}
    </div>
  );
}