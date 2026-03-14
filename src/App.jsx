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
  proximo:      { label:"Próximo",      color:"#fff", bg:"#6366f1", dot:"#818cf8" },
  en_discusion: { label:"En Discusión", color:"#fff", bg:"#f59e0b", dot:"#fcd34d" },
  pendiente:    { label:"Pendiente",    color:"#475569", bg:"#e2e8f0", dot:"#94a3b8" },
  cancelado:    { label:"Cancelado",    color:"#fff", bg:"#ef4444", dot:"#fca5a5" },
  finalizado:   { label:"Finalizado",   color:"#fff", bg:"#10b981", dot:"#6ee7b7" },
  descanso:     { label:"Descanso",     color:"#94a3b8", bg:"#f1f5f9", dot:"#e2e8f0" },
};

const PALETA = ["#6366f1","#f43f5e","#0ea5e9","#f59e0b","#10b981","#8b5cf6","#ec4899","#f97316","#14b8a6","#ef4444"];

// ── Logo SVG inline — cambia color con el prop `color`
function LogoSVG({ color = "#fc0000ff", height = 32 }) {
  return (
    <svg height={height} viewBox="0 0 935.4 1360.6" xmlns="http://www.w3.org/2000/svg" style={{ display:"block", flexShrink:0 }}>
      <path fill={color} d="M460,768c-31,0-62,0.5-93-0.1c-47.7-0.9-81.6-24.1-102.1-66.7c-6.8-14.1-9.6-29.4-9.6-45.1c0-63.5-0.3-127,0.1-190.5c0.3-52.2,41.9-99,93.7-106.5c6.1-0.9,12.3-1.1,18.4-1.1c61.8,0,123.7,0.6,185.5-0.2c54.3-0.7,101.6,38.9,110.8,92.1c1.1,6.1,1.6,12.2,1.6,18.4c0,62-0.2,124,0.1,186c0.3,51.5-32.3,93.4-77.1,108.4c-11.6,3.9-23.7,5.4-35.9,5.3C521.7,768.1,490.8,768.1,460,768z"/>
      <path fill={color} d="M617.2,723.3c-3.4,3.2-5.6,7.9-10.7,9c1.5-12.5,5.2-24.9,3.5-38.3c-8.3,5.5-16.6,5.1-25,2.5c-8.4-2.5-14.7-7.8-19.3-15.5c-2.6,3.3-3.4,6.7-4.3,10.1c-3.1,12.3-6.1,24.5-9,36.8c-0.7,3.1-2.3,4.9-5.6,4.2c-3.4-0.7-3.8-3.3-3.1-6.2c1.4-5.8,2.6-11.7,4.3-17.5c1.3-4.5,1-8.8-0.9-13.1c-2.2-4.9-4.1-9.8-6.5-14.6c-4.1-8.2-8.7-16-15.7-22.2c-1.4,1.2-1.3,2.6-1.6,3.9c-3.8,16-10.7,21.9-27.2,22.9c-3.2,0.2-3.2,1.4-3,4c1,13.1,1.7,26.3,2.6,39.4c0.2,3.3-0.3,6.5-4.3,6.4c-3.8,0-5.2-2.8-5-6.6c0.6-9.3-1-18.6-1.2-27.9c-0.1-5.1-1.2-10.2-1.8-15.2c-0.3-2.5-2.5-3.4-4.3-4.2c-1.9-0.8-2.3,1.1-3.2,2.2c-3.7,4.6-5.2,4.7-10.4,1.2c-3.2-2.2-6-4.9-10.7-5.8c3.7,17.7,3.9,35.2,4.3,52.6c0.1,3.9,2.7,10.6-4.3,10.6c-6.4,0.1-4.3-6.3-4.6-10.3c-0.5-8.8-0.5-17.7-0.8-26.5c-0.2-6.1-0.8-12.2-2.2-18.5c-0.9,0.4-1.5,0.6-2.1,0.9c-17.5,8.5-38.7,1-45.5-17.4c-2.7-7.3-7.1-11-13.5-13.8c-2.1-0.9-4.4-1.6-6.4-2.8c-11.9-6.6-22.4-3.4-32.3,4.4c-11.6,9.2-17.5,22-22.2,35.4c-4.5,12.6-6.8,25.7-9.9,38.6c-3.6-0.7-6.7-2.1-7.9-6c1.4-5.8,2.6-11.7,4.1-17.5c5-19.1,10.7-37.9,24.9-52.6c1.3-1.4,1.5-2.6,0.9-4.4c-4.3-12-2.8-22.9,6.6-32.2c1.4-1.3,2-2.9,1.8-4.9c-1.4-14.4,6.8-22.6,18.5-28.4c8.8-4.4,18.3-6,27.9-7.3c1.4-0.2,4.5,0.8,3.3-2.5c-0.7-1.9,0.3-5.6-4.5-4.6c-7.6,1.5-14.8-0.6-20.1-6.3c-3.8-4-7.7-4.8-12.8-4.2c-8.9,0.9-17.6-0.2-26.1-3.3c-11.9-4.3-15-15.1-7.2-25c1.7-2.2,3.9-4.1,5.9-6c10.2-9.2,21.1-17.5,32.6-24.9c2.2-1.4,3.3-2.7,2.6-5.6c-1.1-4.9-1.7-9.8-2.1-14.8c-1.6-18.3,0.6-35.6,13.5-50c9.6-10.8,21.6-18.1,35-23.3c2.4-0.9,4.2-2,5.5-4.6c4-7.9,13.4-10.3,20.8-5.4c1.8,1.2,3.4,1.5,5.5,1.3c11.8-1.3,23.6-1.1,35.3,1.7c16.7,4,29.8,12.6,38.5,27.8c5.2,9.1,8.4,18.8,10.3,29c0.6,3.2,1.7,4,5,3.4c5.5-1,10.4-3.1,15-6.4c3.5-2.6,5.5-1.5,5.9,2.8c0.3,4.1-0.8,7.9-1.9,11.8c-0.7,2.3-4,4.8-2.4,6.4c2,2.1,5.7,0.2,8.6,0c1-0.1,1.9-0.6,2.9-0.9c1.9-0.5,3.8-1.8,5.6,0.1c2,2.1,1.2,4.3,0.3,6.5c-3.5,9.2-9.8,15.7-18.8,19.7c-2.7,1.2-3.2,2.4-1.8,5.2c3.3,6.7,4.4,13.9,4.1,21.4c-0.2,4.6-2.2,5.6-6,3.1c-4.6-3.1-9.5-5.3-15.3-6.8c0,8.8,0,17.2,0,25.7c0.1,16.5-2.8,32.1-12.9,45.8c-2.7,3.6-7.1,7-7.6,10.9c-0.5,4.2,4.9,7.4,6.9,11.6c3.7,7.8,5.4,16.4,8.3,24.4c0.7,1.9,0.9,3.8,2.6,5.1c11.1,8.8,18.3,20.5,24,33.3c0.6,1.4,0.6,3.3,2.7,4c1.8-5.1,5.2-9.3,7.6-13.9c3.4-6.4,6.6-13.3,3.5-21.3c-2.7-6.9-3-14.4-1.2-21.7c3.9-15.4,9.8-30.3,8.8-46.8c-0.4-7.4,6.9-11.8,14.5-10.6c8.1,1.2,11.7,7,14,14c1.6,5,1.6,10.2,1.1,15.4c-0.3,3.4,0.9,4.2,4.1,4.3c4,0,8,0.5,11.9,1.3c9.5,2,13.8,7.6,13.7,17.3c0,1.6-0.5,3.3,0.4,4.9c5.3,9.6,0.6,19.4-0.2,29c-0.3,3.9-0.9,8.2-2.3,12.1c-1.5,4-4,7.5-8,9.1c-3.3,1.3-3.8,3.8-3.2,6.3C620.9,697.6,618.8,710.5,617.2,723.3z"/>
      <path fill={color} d="M665.6,838.6c0-10.4,0-19.4,0-28.4c0-6.2,2.6-9.5,7.6-9.6c5.4-0.2,7.9,2.9,8,9.6c0,16.2-0.1,32.3,0,48.4c0,3.8-0.5,7.3-4.4,8.5c-4.1,1.3-8.4,1-11.3-2.9c-4.1-5.6-8-11.3-11.9-17c-3.8-5.6-7.6-11.2-12.3-17.9c0,10.9,0,20.3,0,29.7c0,6.3-3.4,9.5-9.4,9.2c-4.1-0.2-6.7-4.6-6.6-9.8c0.3-16.1,0.4-32.3,0.6-48.4c0.1-7.1,3-9.7,9.9-9.2c3.1,0.2,4.7,2.3,6.3,4.4c6.8,9.5,13.4,19,20.1,28.6C663,835,663.9,836.2,665.6,838.6z"/>
      <path fill={color} d="M335.2,837.8c0-9.6,0-19.2,0-28.8c0-5.8,2.1-8,7.6-8.1c6-0.1,7.9,1.8,7.9,8c0,17-0.1,34-0.2,51c0,3,0.6,6.6-3.4,7.3c-3.9,0.7-8.4,2.1-11.7-1.7c-2.1-2.4-3.9-5-5.7-7.6c-6.2-8.9-12.4-17.8-19.2-27.7c0,10.1,0,19.1,0,28.1c0,1.7,0.1,3.4-0.3,5c-1.1,3.6-5.5,4.9-12,4.1c-4.2-0.5-3.2-3.7-3.2-6.1c-0.1-17.2,0-34.3-0.1-51.5c0-3.8,0.4-7.5,4.5-8.4c4.3-0.9,8.8-1.5,12,3.4c6,9.4,12.5,18.5,18.8,27.7c1.3,1.9,2.7,3.7,4.1,5.6C334.6,838,334.9,837.9,335.2,837.8z"/>
      <path fill={color} d="M564.6,835.4c0-8.2-0.1-16.3,0-24.5c0.1-7,2.7-9.8,9.6-9.6c9.1,0.2,18.3-1,27.4,0.9c8.6,1.8,13.9,7.2,15.5,15.6c1.5,8.1-0.2,15.7-7.5,20.7c-2.5,1.7-2.8,2.6-1,5.1c2.8,4,4.9,8.6,7.4,12.9c2.1,3.5,3.6,7-0.5,10.1c-3.1,2.4-11.1,1.4-13.1-1.9c-3.6-5.8-6.8-11.8-10.1-17.7c-1-1.7-1.8-3.3-4.3-3.5c-6.9-0.6-6.9-0.7-6.9,6.2c0,3.7,0.1,7.3-0.2,11c-0.3,5-3.3,7.5-8.2,7.3c-4.9-0.2-8.1-3.3-8.1-8c0-8.2,0-16.3,0-24.5z M588.5,830.4c2.2-0.1,4.4,0.1,6.4-0.4c6.1-1.3,8.5-8,4.6-12.8c-2.4-2.9-5.7-3-9.1-3c-9.5-0.1-9.5-0.1-9.5,9C581,830.3,581,830.3,588.5,830.4z"/>
      <path fill={color} d="M689.5,835.3c-0.6-11.3,1.4-21.2,9.7-29.1c2.6-2.5,5.7-3.6,8.9-4.6c13.6-4.5,28.5-0.3,35.2,10.3c6,9.4,4.8,20,4.4,30.5c-1,22.7-25.1,33-46.7,21.6c-7.7-4-11.1-12.5-11.4-21.5C689.4,839.9,689.5,837.4,689.5,835.3z M706,833.9c0.2,3.8-0.2,7.6,1,11.3c2,5.8,6.5,9.2,12.3,9c5.5-0.2,9.8-3.6,11.1-9.6c1.6-7.2,1.5-14.5-0.1-21.7c-1.3-5.6-5.5-8.7-11.1-8.8c-5.6-0.2-9.9,2.7-11.9,8C705.9,826,706.2,830,706,833.9z"/>
      <path fill={color} d="M256.6,854.4c-7.3-0.9-13.4-0.2-14.5,9.1c-0.5,4-4,4.2-7.4,4.1c-10.3-0.1-10.7-0.2-7.3-9.8c6.2-17.3,13-34.3,19.5-51.5c1.3-3.5,3.7-5.4,7.6-5.2c1.3,0.1,2.7,0.1,4,0c6.5-0.8,10,2.4,12.3,8.3c6.5,17.4,13.4,34.7,20.1,52c1.8,4.7,1,5.9-4.2,6.1c-1.8,0.1-3.7-0.2-5.5,0c-3.3,0.4-5.8-0.9-6.4-4.1c-1.5-8.7-7.2-10.3-14.7-9.1z M248.4,841.1c5,0,9.5-0.1,13.9,0c2.5,0.1,2.3-1.2,1.7-2.8c-2.3-6.3-4.7-12.7-7.4-20C253.8,826.4,251.2,833.5,248.4,841.1z"/>
      <path fill={color} d="M412.7,867.4c-8,2.6-8.3-5-10.5-9.9c-1.1-2.5-2.3-3.2-4.9-3.2c-6.1,0.2-12.3,0.1-18.5,0.1c-2.5,0-4,0.3-4.7,3.6c-1.8,8.8-8.1,12.1-16.8,9.3c-2.6-0.8-2-2.7-1.4-4.4c2.1-5.9,4.1-11.9,6.4-17.8c4.8-12.4,9.6-24.7,14.5-37.1c2.5-6.4,3.6-7,12.4-7c8,0,8.8,0.5,11.3,7.1c3.6,9.3,7.1,18.6,10.7,27.9c3.1,8,6.2,16,9.2,24.1c2.5,6.7,2.1,7.3-4.9,7.3z M380.2,841.1c5,0,9.4-0.1,13.8,0c1.9,0,2.8-0.4,2.1-2.5c-2.4-6.4-4.7-12.8-7.5-20.3C385.6,826.5,383,833.6,380.2,841.1z"/>
      <path fill={color} d="M499.3,826.2c0-5.8,0-11.7,0-17.5c0-3.6,1-6.7,5-7.4c6-1,8.4,0.6,10.3,5.4c1.4,3.5,0.7,6.9,0.8,10.3c0.2,7.8,0,15.7,0,23.5c0,8.6,3.8,12.9,11.6,13.2c7.6,0.2,11.8-3.9,12.1-12.6c0.3-10.5,0.1-21,0.1-31.5c0-3.4,0.9-6.2,4.1-7.9c5.1-2.7,11.2-0.3,11.4,5.3c0.6,14.4,2.2,29-1.1,43.2c-3.1,13.3-16,20.2-31.3,17.9c-15.6-2.3-22.9-10.6-23.1-26.4C499.2,836.5,499.3,831.4,499.3,826.2z"/>
      <path fill={color} d="M173.9,834.1c0-8.2-0.1-16.3,0-24.5c0.1-6.2,2.3-8.3,8.6-8.4c8-0.1,16-0.2,24,0.1c14.5,0.6,22.8,10.7,21.1,25c-1.2,10.4-9,16.6-21.7,17.9c-4.2,0.4-8.3,0.1-12.5-0.1c-2.4-0.1-3.2,0.6-3.1,3c0.2,4.3,0.1,8.7,0,13c-0.1,3.9-0.8,7.2-6.1,7.2c-8.5,0-10.2-0.7-10.4-6.9C173.5,851.6,173.9,842.9,173.9,834.1z M190.4,822.4c0,2,0.1,4,0,6c-0.1,1.8,0.3,2.9,2.4,2.7c4-0.2,8,0.1,11.9-0.4c3.8-0.5,6.5-2.6,6.5-6.9c0-4.4-1.1-8-6-9c-2.3-0.4-4.6-0.5-6.9-0.5C190.4,814.2,190.4,814.3,190.4,822.4z"/>
      <path fill={color} d="M466.7,801.3c7,0,14,0,21,0c5.8,0,7.1,1.4,7.1,7.5c0,5.2-1.5,6.6-6.9,6.7c-3,0-6,0.2-9,0c-3.2-0.3-3.8,1.1-3.8,4c0.1,13.1,0.1,26.3,0,39.4c-0.1,6.6-2.9,9.1-9.2,8.9c-4.2-0.1-6.7-2-7-6.1c-0.3-4.8-0.3-9.6-0.4-14.4c-0.1-9.3-0.2-18.6,0.1-28c0.1-3.2-0.9-4-3.9-3.8c-3.1,0.3-6.3-0.1-9.5,0.1c-4.3,0.2-6.1-1.6-6-5.8c0.1-5.7,1.6-8.3,6.1-8.4C452.4,801.1,459.5,801.2,466.7,801.3z"/>
      <path fill={color} d="M523.7,748.5c-0.2-14.9-1.9-29.8-3.4-44.6c-0.3-3,0.3-5.6,3.8-5.8c3.4-0.2,4.5,2.2,4.8,5.1c1.5,15.4,3,30.7,4.5,46.1C530.1,749.3,526.8,750.2,523.7,748.5z"/>
      <path fill={color} d="M376.3,749.3c0.6-11.6,1.2-23.2,1.6-34.8c0.1-3.3,0.8-6.3,4.7-6.2c4.3,0.1,4.2,3.4,4,6.5c-0.7,11.5-1.5,23-2.2,34.5C381.7,749.3,379,749.3,376.3,749.3z"/>
      <path fill={color} d="M471.2,588.3c-10.2-0.1-19.7-2.8-28.2-8.6c-1.8-1.2-3.3-2.9-6.2-1.4c-2.4,1.3-4.7-1.4-4.1-4.2c0.8-3.9,6.1-9,10-9.6c2.7-0.4,5,0.8,3.5,3.4c-1.9,3.5,0.3,4.5,2.4,5.7c11.5,6.6,23.7,8.3,36.5,4.5c1.9-0.6,3.8-1.3,5.6-2.1c2.1-0.9,3.9-0.9,4.9,1.5c1.1,2.6-0.4,4.2-2.4,5.3C486.3,586.5,479,588.4,471.2,588.3z"/>
      <path fill={color} d="M474.8,567.7c-3.5-0.2-7-0.8-9.9-2.9c-1.6-1.2-2.4-2.9-1.3-4.8c1-1.7,2.6-1.8,4.4-1.3c2.8,0.9,5.6,2.1,8.7,1c5.3-1.9,6.6-4.7,3.5-9.4c-4-6.2-6.5-12.7-6.6-20.1c0-1.3,0-2.7,0.3-4c0.4-1.8,1.7-2.9,3.6-2.7c1.6,0.2,2.9,1.1,2.9,2.9c0,8.7,3.9,15.9,7.9,23.3C492.8,558,485,567.9,474.8,567.7z"/>
      <path fill={color} d="M442.8,506.5c4.5,0.1,8,0.5,11.3,1.9c2.2,0.9,3.8,2.4,3,4.9c-0.7,2.3-2.6,3.3-5.1,3.1c-0.8-0.1-1.7-0.2-2.5-0.4c-7.7-1.8-14.9-0.4-21.5,3.8c-2.5,1.6-5.4,3-7.4-0.2c-1.9-3.1,0.5-5.2,3-6.9C429.8,508.7,436.5,506.4,442.8,506.5z"/>
      <path fill={color} d="M517.2,517.1c-0.2,2.8-3.4,4.6-6,2.8c-6-4.2-12.3-4.4-19-2.3c-2.3,0.7-4.3,0.4-5.4-2.1c-1.1-2.5,0.3-4,2.3-5.4c6.6-4.4,21.3-2.5,26.5,3.5C516.4,514.6,517.2,515.7,517.2,517.1z"/>
      <path fill={color} d="M433.2,533.5c0.1-5.3,3.7-9.3,8-9c3.9,0.3,7.2,4.6,7.2,9.4c0,5.1-3.3,9.2-7.3,9.2C436.7,543.3,433.1,538.9,433.2,533.5z"/>
      <path fill={color} d="M379.4,532.1c7-0.1,13.2,8.7,11,15.3c-0.3,0.9-0.7,1.9-0.7,2.9c0,2.2-0.1,4.2-2.9,4.2c-2.9,0-3.9-2.1-4.3-4.5c-0.3-1.8,0.3-3.6,0.8-5.3c0.8-2.9-2.7-6-5.4-4.8c-2,0.9-3.6,2-4.9-0.5c-1.4-2.7,0.4-4.4,2-6C376.1,532.1,377.9,532.4,379.4,532.1z"/>
      <path fill={color} d="M506.2,533.8c0,4.9-3.1,8.5-7.1,8.6c-4.1,0-7.6-4.1-7.6-8.9c0-4.9,3.5-9,7.5-9C503,524.6,506.3,528.8,506.2,533.8z"/>
      <path fill={color} d="M470.5,601.9c-3.2-0.1-6.3-0.3-9.1-2.3c-1.3-0.9-2.6-2-2-3.7c0.6-1.7,2.4-1.8,3.9-1.4c4.8,1.1,9.5,1.4,14.3,0.1c1.3-0.4,2.4,0.1,2.8,1.4c0.6,1.6,0.1,2.9-1.3,3.9C476.5,601.5,473.4,601.6,470.5,601.9z"/>
    </svg>
  );
}

function parseRow(row, i) {
  return {
    id:          String(row.id || row.ID || i),
    grupo:       row.grupo || row.group || row.equipo || "",
    integrantes: row.integrantes || row.members || row.estudiantes || "",
    propuesta:   row.propuesta || row.proyecto || row.nombre || row.title || "",
    materia:     row.materia || row.asignatura || row.subject || "",
    profesor:    row.profesor || row.teacher || row.docente || "",
    fecha:       (row.fecha || row.date || "").trim(),
    hora_inicio: row.hora_inicio || row.hora || row.time || "",
    hora_fin:    row.hora_fin || row.end_time || "",
    salon:       row.salon || row.aula || row.room || "",
    estado:      (row.estado || row.status || "pendiente").toLowerCase().replace(/ /g,"_"),
    notas:       row.notas || row.notes || "",
    color:       row.color || PALETA[i % PALETA.length],
  };
}

// FIX Invalid Date — acepta DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY
function normalizaFecha(str) {
  if (!str) return "";
  str = str.trim();
  // YYYY-MM-DD → ok
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  // DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
    const [d,m,y] = str.split("/");
    return `${y}-${m}-${d}`;
  }
  // DD-MM-YYYY
  if (/^\d{2}-\d{2}-\d{4}$/.test(str)) {
    const [d,m,y] = str.split("-");
    return `${y}-${m}-${d}`;
  }
  return str;
}

function formatDate(d) {
  const nd = normalizaFecha(d);
  if (!nd) return "";
  try {
    const dt = new Date(nd + "T00:00:00");
    if (isNaN(dt)) return d;
    return dt.toLocaleDateString("es-VE", { weekday:"long", day:"numeric", month:"long" });
  } catch { return d; }
}

function formatDateShort(d) {
  const nd = normalizaFecha(d);
  if (!nd) return "";
  try {
    const dt = new Date(nd + "T00:00:00");
    if (isNaN(dt)) return d;
    return dt.toLocaleDateString("es-VE", { day:"numeric", month:"short" });
  } catch { return d; }
}

function groupByDate(evs) {
  const g = {};
  evs.forEach(e => {
    const k = normalizaFecha(e.fecha) || "Sin fecha";
    if (!g[k]) g[k] = [];
    g[k].push(e);
  });
  return Object.entries(g).sort(([a],[b]) => a.localeCompare(b));
}

function initials(name) {
  return name.trim().split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase();
}

function Badge({ estado }) {
  const c = ESTADOS[estado] || ESTADOS.pendiente;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:4,
      background: c.bg, color: c.color,
      fontSize:9.5, fontWeight:800,
      padding:"3px 9px", borderRadius:99,
      whiteSpace:"nowrap", flexShrink:0,
      boxShadow: c.bg !== "#e2e8f0" ? `0 2px 6px ${c.bg}55` : "none",
    }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:c.dot, display:"inline-block" }} />
      {c.label}
    </span>
  );
}

// ── MODAL ────────────────────────────────────────────────────────
function Modal({ ev, onClose }) {
  const members = ev.integrantes ? ev.integrantes.split(",").map(s=>s.trim()).filter(Boolean) : [];
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:9999,
      display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
      <div style={{ position:"absolute", inset:0,
        background:"rgba(0,0,0,.6)", backdropFilter:"blur(10px)",
        animation:"fadeIn .2s ease" }} />
      <div onClick={e=>e.stopPropagation()} style={{
        position:"relative", width:"100%", maxWidth:520,
        background:"#fff", borderRadius:"24px 24px 0 0",
        maxHeight:"90vh", overflowY:"auto",
        animation:"slideUp .3s cubic-bezier(.34,1.56,.64,1)",
        boxShadow:"0 -20px 60px rgba(0,0,0,.25)",
      }}>
        <div style={{ background:`linear-gradient(135deg,${ev.color},${ev.color}bb)`,
          padding:"20px 20px 24px", borderRadius:"24px 24px 0 0", position:"relative" }}>
          <button onClick={onClose} style={{ position:"absolute", top:16, right:16,
            width:32, height:32, borderRadius:"50%", border:"none",
            background:"rgba(255,255,255,.25)", color:"#fff", fontSize:18,
            cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
            fontWeight:900 }}>×</button>
          <Badge estado={ev.estado} />
          <h2 style={{ color:"#fff", fontSize:21, fontWeight:900,
            fontFamily:"'Plus Jakarta Sans',sans-serif",
            lineHeight:1.2, margin:"10px 0 6px",
            textShadow:"0 2px 8px rgba(0,0,0,.15)" }}>{ev.grupo}</h2>
          <p style={{ color:"rgba(255,255,255,.85)", fontSize:13,
            lineHeight:1.6, fontStyle:"italic" }}>"{ev.propuesta}"</p>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6,
            background:"rgba(0,0,0,.2)", color:"#fff",
            fontSize:11.5, fontWeight:800, padding:"5px 13px",
            borderRadius:99, marginTop:12 }}>
            🕐 {ev.hora_inicio}{ev.hora_fin && ` — ${ev.hora_fin}`}
            {ev.fecha && ` · ${formatDate(ev.fecha)}`}
          </div>
        </div>

        <div style={{ padding:"16px 20px 40px", display:"flex", flexDirection:"column", gap:10 }}>
          <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
            {[ev.salon&&{icon:"🏫",val:ev.salon}, ev.profesor&&{icon:"👤",val:ev.profesor}, ev.materia&&{icon:"📚",val:ev.materia}]
              .filter(Boolean).map(({icon,val}) => (
              <span key={val} style={{ display:"inline-flex", alignItems:"center", gap:5,
                background:"#f8fafc", border:"1.5px solid #e2e8f0",
                borderRadius:99, padding:"5px 12px",
                fontSize:12, fontWeight:700, color:"#334155" }}>{icon} {val}</span>
            ))}
          </div>

          {members.length > 0 && (
            <div style={{ background:"#f8fafc", borderRadius:14,
              border:"1.5px solid #e2e8f0", overflow:"hidden" }}>
              <p style={{ fontSize:9.5, fontWeight:800, color:"#94a3b8",
                textTransform:"uppercase", letterSpacing:1, padding:"10px 14px 7px" }}>
                👥 Integrantes
              </p>
              {members.map((n,i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10,
                  padding:"8px 14px", borderTop: i>0 ? "1px solid #f1f5f9" : "none" }}>
                  <div style={{ width:30, height:30, borderRadius:"50%", flexShrink:0,
                    background:`hsl(${(i*97+parseInt(ev.id||0)*43)%360},55%,62%)`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:10, fontWeight:900, color:"#fff" }}>{initials(n)}</div>
                  <span style={{ fontSize:13.5, fontWeight:600, color:"#1e293b" }}>{n}</span>
                </div>
              ))}
            </div>
          )}

          {ev.notas && (
            <div style={{ background:"#fffbeb", border:"1.5px solid #fde68a",
              borderRadius:13, padding:"12px 14px" }}>
              <p style={{ fontSize:9.5, fontWeight:800, color:"#92400e",
                textTransform:"uppercase", letterSpacing:.8, marginBottom:5 }}>📝 Notas del profesor</p>
              <p style={{ fontSize:13, color:"#78350f", lineHeight:1.7, margin:0 }}>{ev.notas}</p>
            </div>
          )}

          <button onClick={onClose} style={{ padding:"14px", borderRadius:14,
            background:`linear-gradient(135deg,${ev.color},${ev.color}cc)`,
            color:"#fff", border:"none", fontSize:14, fontWeight:800,
            cursor:"pointer", fontFamily:"inherit",
            boxShadow:`0 4px 16px ${ev.color}55` }}>Cerrar</button>
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

  // Normalizar fechas para filtros
  const fechasNorm = Array.from(new Set(events.map(e => normalizaFecha(e.fecha)).filter(Boolean))).sort();
  const fechas = ["todas", ...fechasNorm];

  const real = events.filter(e => e.estado !== "descanso");

  const filtered = events.filter(ev => {
    const fn = normalizaFecha(ev.fecha);
    if (ev.estado === "descanso") return filtroFecha === "todas" || fn === filtroFecha;
    if (filtroEstado !== "todos" && ev.estado !== filtroEstado) return false;
    if (filtroFecha !== "todas" && fn !== filtroFecha) return false;
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
    proximos:     real.filter(e=>e.estado==="proximo").length,
    en_discusion: real.filter(e=>e.estado==="en_discusion").length,
    finalizados:  real.filter(e=>e.estado==="finalizado").length,
  };

  const FILTROS = [
    { id:"todos",        label:"Todos" },
    { id:"proximo",      label:"Próximos",     dot:"#6366f1" },
    { id:"en_discusion", label:"En Discusión", dot:"#f59e0b" },
    { id:"pendiente",    label:"Pendientes",   dot:"#94a3b8" },
    { id:"finalizado",   label:"Finalizados",  dot:"#10b981" },
    { id:"cancelado",    label:"Cancelados",   dot:"#ef4444" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800;900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        html{overflow-y:scroll;}
        body{background:#f1f5f9;font-family:'DM Sans',system-ui,sans-serif;overflow-x:hidden;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:#c7d2fe;border-radius:99px;}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideUp{from{transform:translateY(60px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .row{transition:background .12s;cursor:pointer;}
        .row:hover{background:#f8fafc !important;}
        .row:active{transform:scale(.99);}
        .fchip{transition:all .15s;cursor:pointer;font-family:inherit;}
        .fchip:hover{filter:brightness(1.1);transform:scale(1.04);}
      `}</style>

      {/* ══ HEADER sticky ══ */}
      <div style={{ background:"linear-gradient(135deg,#0f172a 0%,#1e293b 100%)",
        padding:"18px 16px 14px",
        position:"sticky", top:0, zIndex:50,
        boxShadow:"0 4px 24px rgba(0,0,0,.35)" }}>

        {/* Logo row */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
          {/* Logo SVG en blanco */}
          <LogoSVG color="#ffffff" height={34} />

          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontSize:8.5, color:"rgba(255,255,255,.4)",
              letterSpacing:2, textTransform:"uppercase", fontWeight:700, marginBottom:0 }}>
              Sistema de Turnos
            </p>
            {usingDemo && (
              <span style={{ background:"#fbbf24", color:"#78350f",
                fontSize:8, fontWeight:900, padding:"1px 7px",
                borderRadius:99, letterSpacing:.5 }}>DEMO</span>
            )}
          </div>

          {/* Stats bubbles */}
          <div style={{ display:"flex", gap:6 }}>
            {[
              { v:stats.proximos,     bg:"#6366f1" },
              { v:stats.en_discusion, bg:"#f59e0b" },
              { v:stats.finalizados,  bg:"#10b981" },
            ].map((s,i) => (
              <div key={i} style={{ width:32, height:32, borderRadius:10,
                background:s.bg, display:"flex", alignItems:"center",
                justifyContent:"center", flexShrink:0,
                boxShadow:`0 3px 10px ${s.bg}66` }}>
                <span style={{ color:"#fff", fontSize:13, fontWeight:900,
                  fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{s.v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Search */}
        <div style={{ position:"relative", marginBottom:10 }}>
          <span style={{ position:"absolute", left:13, top:"50%",
            transform:"translateY(-50%)", fontSize:14, opacity:.4, pointerEvents:"none" }}>🔍</span>
          <input type="text"
            placeholder="Buscar grupo, integrante, propuesta…"
            value={busqueda} onChange={e=>setBusqueda(e.target.value)}
            style={{ width:"100%", padding:"10px 36px 10px 38px",
              borderRadius:12, border:"2px solid rgba(255,255,255,.08)",
              fontSize:13, color:"#0f172a", background:"rgba(255,255,255,.96)",
              fontFamily:"inherit", fontWeight:500, outline:"none",
              boxSizing:"border-box", transition:"border-color .2s" }} />
          {busqueda && (
            <button onClick={()=>setBusqueda("")} style={{
              position:"absolute", right:10, top:"50%", transform:"translateY(-50%)",
              border:"none", background:"#e2e8f0", cursor:"pointer",
              borderRadius:"50%", width:22, height:22,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:11, color:"#64748b", fontWeight:900 }}>✕</button>
          )}
        </div>

        {/* Filtro fechas */}
        {fechas.length > 2 && (
          <div style={{ display:"flex", gap:5, overflowX:"auto",
            scrollbarWidth:"none", marginBottom:7, paddingBottom:1 }}>
            {fechas.map(f => {
              const active = filtroFecha === f;
              return (
                <button key={f} className="fchip" onClick={()=>setFiltroFecha(f)}
                  style={{ padding:"4px 11px", borderRadius:99, border:"none",
                    fontSize:11, fontWeight:700, flexShrink:0,
                    background: active ? "#fff" : "rgba(255,255,255,.12)",
                    color: active ? "#0f172a" : "rgba(255,255,255,.6)" }}>
                  📅 {f==="todas" ? "Todas" : formatDateShort(f)}
                </button>
              );
            })}
          </div>
        )}

        {/* Filtro estado */}
        <div style={{ display:"flex", gap:5, overflowX:"auto", scrollbarWidth:"none" }}>
          {FILTROS.map(f => {
            const active = filtroEstado === f.id;
            const cfg = ESTADOS[f.id];
            return (
              <button key={f.id} className="fchip" onClick={()=>setFiltroEstado(f.id)}
                style={{ padding:"4px 11px", borderRadius:99, border:"none",
                  fontSize:11, fontWeight:800, flexShrink:0,
                  background: active ? (cfg ? cfg.bg : "#fff") : "rgba(255,255,255,.12)",
                  color: active ? (cfg ? cfg.color : "#0f172a") : "rgba(255,255,255,.65)",
                  boxShadow: active && cfg && cfg.bg !== "#e2e8f0" ? `0 2px 8px ${cfg.bg}55` : "none" }}>
                {f.dot && <span style={{ width:5.5, height:5.5, borderRadius:"50%",
                  background: active ? (cfg?.dot||"#fff") : "rgba(255,255,255,.4)",
                  display:"inline-block", marginRight:4 }} />}
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ══ CONTENIDO ══ */}
      <div style={{ padding:"8px 0 80px" }}>

        {loading && (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center",
            padding:"80px 20px", gap:14 }}>
            <div style={{ width:40, height:40, border:"3px solid #e0e7ff",
              borderTopColor:"#6366f1", borderRadius:"50%",
              animation:"spin .7s linear infinite" }} />
            <p style={{ fontSize:13, color:"#94a3b8", fontWeight:600 }}>Cargando turnos…</p>
          </div>
        )}

        {!loading && grouped.map(([fecha, evs]) => (
          <div key={fecha}>
            {/* Cabecera fecha */}
            <div style={{ display:"flex", alignItems:"center", gap:10,
              padding:"14px 16px 8px" }}>
              <div style={{ background:"linear-gradient(135deg,#1e293b,#334155)",
                borderRadius:12, padding:"6px 14px",
                display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:12 }}>📅</span>
                <span style={{ color:"#fff", fontSize:12, fontWeight:800,
                  fontFamily:"'Plus Jakarta Sans',sans-serif", textTransform:"capitalize" }}>
                  {fecha === "Sin fecha" ? "Sin fecha" : formatDate(fecha)}
                </span>
                <span style={{ background:"#6366f1", color:"#fff",
                  fontSize:10, fontWeight:900, width:20, height:20,
                  borderRadius:"50%", display:"flex", alignItems:"center",
                  justifyContent:"center" }}>
                  {evs.filter(e=>e.estado!=="descanso").length}
                </span>
              </div>
            </div>

            {/* Filas */}
            {evs.map((ev, i) => {
              const isBreak = ev.estado === "descanso";
              const members = ev.integrantes
                ? ev.integrantes.split(",").map(s=>s.trim()).filter(Boolean)
                : [];

              if (isBreak) return (
                <div key={ev.id} style={{ display:"flex", alignItems:"center", gap:12,
                  padding:"10px 16px", margin:"3px 12px",
                  background:"#f1f5f9", borderRadius:12,
                  animation:`fadeUp .3s ease ${i*40}ms both` }}>
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
                <div key={ev.id} className="row"
                  onClick={() => setSelected(ev)}
                  style={{ display:"flex", alignItems:"center",
                    padding:"0 16px", background:"#fff",
                    borderBottom:"1px solid #f1f5f9",
                    animation:`fadeUp .35s ease ${i*50}ms both` }}>

                  {/* Timeline */}
                  <div style={{ display:"flex", flexDirection:"column",
                    alignItems:"center", width:28, flexShrink:0, alignSelf:"stretch" }}>
                    <div style={{ width:1, flex:1, background:"#e2e8f0", minHeight:8 }} />
                    <div style={{ width:11, height:11, borderRadius:"50%", flexShrink:0,
                      background:ev.color, border:"2.5px solid #fff",
                      boxShadow:`0 0 0 2px ${ev.color}44` }} />
                    <div style={{ width:1, flex:1, background:"#e2e8f0", minHeight:8 }} />
                  </div>

                  {/* Contenido */}
                  <div style={{ flex:1, padding:"13px 0 13px 12px",
                    borderLeft:"none", minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"flex-start",
                      justifyContent:"space-between", gap:8, marginBottom:4 }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <span style={{ fontSize:10, fontWeight:800, color:ev.color,
                          display:"block", marginBottom:2, letterSpacing:.2 }}>
                          {ev.hora_inicio}{ev.hora_fin && ` — ${ev.hora_fin}`}
                        </span>
                        <p style={{ fontSize:15, fontWeight:800, color:"#0f172a",
                          fontFamily:"'Plus Jakarta Sans',sans-serif",
                          lineHeight:1.25, marginBottom:2,
                          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {ev.grupo}
                        </p>
                        <p style={{ fontSize:12, color:"#64748b", lineHeight:1.5, marginBottom:6,
                          overflow:"hidden", display:"-webkit-box",
                          WebkitLineClamp:1, WebkitBoxOrient:"vertical" }}>
                          {ev.propuesta}
                        </p>
                      </div>
                      <Badge estado={ev.estado} />
                    </div>

                    <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                      {members.length > 0 && (
                        <div style={{ display:"flex" }}>
                          {members.slice(0,3).map((n,j) => (
                            <div key={j} title={n} style={{ width:20, height:20,
                              borderRadius:"50%", border:"1.5px solid #fff",
                              marginLeft: j>0 ? -6 : 0,
                              background:`hsl(${(j*97+parseInt(ev.id||0)*43)%360},55%,62%)`,
                              display:"flex", alignItems:"center", justifyContent:"center",
                              fontSize:7.5, fontWeight:900, color:"#fff" }}>
                              {initials(n)}
                            </div>
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
                      {ev.salon && <span style={{ fontSize:10, color:"#94a3b8", fontWeight:600 }}>🏫 {ev.salon}</span>}
                      {ev.profesor && <span style={{ fontSize:10, color:"#94a3b8", fontWeight:600 }}>· 👤 {ev.profesor}</span>}
                      {ev.materia && (
                        <span style={{ fontSize:9.5, fontWeight:700, color:ev.color,
                          background:`${ev.color}15`, padding:"2px 7px",
                          borderRadius:99, marginLeft:"auto" }}>{ev.materia}</span>
                      )}
                    </div>
                  </div>

                  <span style={{ color:"#d1d5db", fontSize:18, paddingLeft:8, flexShrink:0 }}>›</span>
                </div>
              );
            })}
          </div>
        ))}

        {/* Empty */}
        {!loading && filtered.filter(e=>e.estado!=="descanso").length === 0 && (
          <div style={{ textAlign:"center", padding:"60px 24px",
            animation:"fadeUp .4s ease both" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🔍</div>
            <p style={{ fontSize:16, fontWeight:800, color:"#1e293b",
              fontFamily:"'Plus Jakarta Sans',sans-serif", marginBottom:6 }}>Sin resultados</p>
            <p style={{ fontSize:12.5, color:"#94a3b8", marginBottom:18 }}>Prueba con otros filtros</p>
            <button onClick={()=>{setFiltroEstado("todos");setFiltroFecha("todas");setBusqueda("");}}
              style={{ padding:"10px 22px",
                background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
                color:"#fff", border:"none", borderRadius:12,
                fontSize:13, fontWeight:800, cursor:"pointer", fontFamily:"inherit" }}>
              Limpiar filtros
            </button>
          </div>
        )}

        {!loading && filtered.filter(e=>e.estado!=="descanso").length > 0 && (
          <p style={{ textAlign:"center", fontSize:11, color:"#cbd5e1",
            fontWeight:600, padding:"20px 0 0" }}>
            — {filtered.filter(e=>e.estado!=="descanso").length} grupos —
          </p>
        )}
      </div>

      {selected && <Modal ev={selected} onClose={()=>setSelected(null)} />}
    </>
  );
}