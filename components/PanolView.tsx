"use client";

import React, { useState, useRef } from "react";
import { useObraStore } from "@/lib/store";
import { Herramienta } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { compressImageFile } from "@/lib/storage-appwrite";
import { 
  Wrench, 
  Search, 
  QrCode, 
  UserCheck, 
  RotateCcw, 
  ShieldAlert, 
  CheckCircle2,
  PlusCircle,
  Printer,
  Camera,
  Layers,
  X,
  Eye,
  Download
} from "lucide-react";
import toast from "react-hot-toast";

export default function PanolView() {
  const { 
    empresaActual, 
    herramientas, 
    trabajadores, 
    obras, 
    asignarHerramienta, 
    devolverHerramienta,
    agregarHerramienta
  } = useObraStore();

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("todas");
  const [modalAsignar, setModalAsignar] = useState<Herramienta | null>(null);

  // Modal para crear nueva herramienta / stock
  const [modalCrear, setModalCrear] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevaMarca, setNuevaMarca] = useState("Bosch");
  const [nuevoModeloSerie, setNuevoModeloSerie] = useState("");
  const [nuevaCategoria, setNuevaCategoria] = useState<Herramienta["categoria"]>("Electromecánica");
  const [cantidadStock, setCantidadStock] = useState(1);
  const [codigoPersonalizado, setCodigoPersonalizado] = useState("");
  const [imagenHerramienta, setImagenHerramienta] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal para imprimir etiqueta QR
  const [etiquetasParaImprimir, setEtiquetasParaImprimir] = useState<Herramienta[] | null>(null);

  // Formulario de asignación
  const [funcionarioSeleccionado, setFuncionarioSeleccionado] = useState("");
  const [obraSeleccionada, setObraSeleccionada] = useState("");
  const [fechaDevolucion, setFechaDevolucion] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );

  const herramientasEmpresa = herramientas.filter((h) => h.empresaId === empresaActual.id);
  const trabajadoresEmpresa = trabajadores.filter((t) => t.empresaId === empresaActual.id);
  const obrasEmpresa = obras.filter((o) => o.empresaId === empresaActual.id);

  const herramientasFiltradas = herramientasEmpresa.filter((h) => {
    const coincideTexto = 
      h.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      h.marca.toLowerCase().includes(busqueda.toLowerCase()) ||
      h.codigoQR.toLowerCase().includes(busqueda.toLowerCase()) ||
      (h.asignadoA && h.asignadoA.toLowerCase().includes(busqueda.toLowerCase()));
    
    if (!coincideTexto) return false;
    if (filtroEstado === "todas") return true;
    return h.estado === filtroEstado;
  });

  // Procesar carga de foto con compresión WebP
  const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      const compressed = await compressImageFile(file, 1024, 0.75);
      setImagenHerramienta(compressed);
      toast.success("Foto procesada y optimizada");
    } catch {
      toast.error("Error al procesar la fotografía.");
    } finally {
      setIsCompressing(false);
    }
  };

  const abrirModalCrear = () => {
    const sigNum = herramientasEmpresa.length + 1;
    setNuevoNombre("");
    setNuevaMarca("Bosch");
    setNuevoModeloSerie("");
    setNuevaCategoria("Electromecánica");
    setCantidadStock(1);
    setCodigoPersonalizado(`HERR-${String(sigNum).padStart(3, "0")}`);
    setImagenHerramienta(null);
    setModalCrear(true);
  };

  const handleGuardarHerramienta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) {
      toast.error("Ingresa el nombre de la herramienta.");
      return;
    }

    const cantidad = Math.max(1, Math.min(50, cantidadStock));
    const nuevasCreadas: Herramienta[] = [];

    for (let i = 0; i < cantidad; i++) {
      const sufijo = cantidad > 1 ? `-${i + 1}` : "";
      const codigoQR = (codigoPersonalizado.trim() || `HERR-${Date.now().toString().slice(-4)}`) + sufijo;
      const serie = nuevoModeloSerie.trim() ? (cantidad > 1 ? `${nuevoModeloSerie.trim()}-${i + 1}` : nuevoModeloSerie.trim()) : `SN-${Math.floor(100000 + Math.random() * 900000)}`;

      const herramientaData: Omit<Herramienta, "id"> = {
        empresaId: empresaActual.id,
        codigoQR,
        nombre: nuevoNombre.trim(),
        marca: nuevaMarca.trim() || "Genérica",
        numeroSerie: serie,
        categoria: nuevaCategoria,
        estado: "Disponible en Pañol",
        imagen: imagenHerramienta || undefined,
      };

      agregarHerramienta(herramientaData);
      nuevasCreadas.push({ ...herramientaData, id: `temp-${Date.now()}-${i}` });
    }

    toast.success(`Se registraron ${cantidad} herramienta(s) con código QR en pañol.`);
    setModalCrear(false);
    // Abrir modal de etiquetas para imprimir de inmediato
    setEtiquetasParaImprimir(nuevasCreadas);
  };

  const handleConfirmarAsignacion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalAsignar) return;
    if (!funcionarioSeleccionado) {
      toast.error("Selecciona el funcionario responsable de la herramienta.");
      return;
    }

    const obraNombre = obraSeleccionada || (obrasEmpresa[0]?.nombre ?? "Obra General");
    asignarHerramienta(modalAsignar.id, funcionarioSeleccionado, obraNombre, fechaDevolucion);

    toast.success(`Herramienta ${modalAsignar.codigoQR} asignada a ${funcionarioSeleccionado}`);
    setModalAsignar(null);
    setFuncionarioSeleccionado("");
  };

  const handleDevolucion = (herramienta: Herramienta) => {
    devolverHerramienta(herramienta.id);
    toast.success(`Herramienta ${herramienta.codigoQR} reingresada a Pañol central.`);
  };

  // URL del código QR para renderizar o imprimir
  const getQrUrl = (codigo: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
      `OBRALOGIX-HERR:${codigo}|${empresaActual.nombre}`
    )}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Header y Acciones */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#181c24] border border-white/10 p-6 rounded-3xl shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-[#F4F1EA] font-heading flex items-center gap-2">
            <Wrench className="h-6 w-6 text-[#FF6A1F]" />
            Pañol & Control de Herramientas (Custodia QR)
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA2AE] mt-1">
            Gestión de instrumental eléctrico, rotomartillos y equipos: alta de stock con foto, generación de QR e impresión de etiquetas.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setEtiquetasParaImprimir(herramientasEmpresa)}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-3.5 py-2.5 text-xs font-bold text-white transition-all cursor-pointer shadow-sm active:scale-95"
            title="Imprimir etiquetas de todo el pañol"
          >
            <Printer className="h-4 w-4 text-[#FFC93C]" />
            <span>Imprimir Lote QR</span>
          </button>

          <button
            onClick={abrirModalCrear}
            className="inline-flex items-center gap-2 rounded-xl bg-[#FF6A1F] hover:bg-[#ff7b38] px-4 py-2.5 text-xs font-black text-[#181205] transition-all cursor-pointer shadow-lg shadow-orange-500/25 active:scale-95"
          >
            <PlusCircle className="h-4 w-4" />
            <span>+ Cargar Herramienta / Stock</span>
          </button>
        </div>
      </div>

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#181c24] border border-white/10 p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-[#9AA2AE] tracking-wider block">Total en Inventario</span>
          <p className="text-2xl font-black text-white font-mono mt-1">{herramientasEmpresa.length}</p>
          <span className="text-[11px] text-[#9AA2AE]">unidades registradas</span>
        </div>

        <div className="bg-[#181c24] border border-emerald-500/20 bg-emerald-950/10 p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">Disponibles en Pañol</span>
          <p className="text-2xl font-black text-emerald-400 font-mono mt-1">
            {herramientasEmpresa.filter((h) => h.estado === "Disponible en Pañol").length}
          </p>
          <span className="text-[11px] text-emerald-300/80">Listas para retiro</span>
        </div>

        <div className="bg-[#181c24] border border-amber-500/20 bg-amber-950/10 p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">En Obra / Asignadas</span>
          <p className="text-2xl font-black text-amber-400 font-mono mt-1">
            {herramientasEmpresa.filter((h) => h.estado === "En Obra / Asignada").length}
          </p>
          <span className="text-[11px] text-amber-300/80">En poder de operarios</span>
        </div>

        <div className="bg-[#181c24] border border-white/10 p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-[#45B2FF] tracking-wider block">Con Código QR</span>
          <p className="text-2xl font-black text-[#45B2FF] font-mono mt-1">
            {herramientasEmpresa.length}
          </p>
          <span className="text-[11px] text-[#9AA2AE]">100% etiquetadas</span>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Buscador */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[#9AA2AE]" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, marca, código QR o funcionario custodio..."
            className="w-full rounded-2xl border border-white/10 bg-[#181c24] pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#F4F1EA] focus:outline-none focus:border-[#FF6A1F] shadow-xl placeholder:text-[#6b7280]"
          />
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-1.5 text-xs overflow-x-auto scrollbar-none">
          {["todas", "Disponible en Pañol", "En Obra / Asignada"].map((st) => (
            <button
              key={st}
              onClick={() => setFiltroEstado(st)}
              className={`rounded-xl px-3.5 py-2 font-semibold transition-all whitespace-nowrap cursor-pointer ${
                filtroEstado === st
                  ? "bg-[#FF6A1F] text-[#181205] shadow-xs font-bold"
                  : "bg-[#181c24] text-[#9AA2AE] border border-white/10 hover:bg-white/5 hover:text-[#F4F1EA]"
              }`}
            >
              {st === "todas" ? "Todas las Herramientas" : st}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Herramientas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {herramientasFiltradas.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-dashed border-white/15 p-12 text-center text-[#9AA2AE] bg-[#181c24] space-y-3">
            <Wrench className="mx-auto h-12 w-12 text-[#9AA2AE]/50" />
            <p className="font-bold text-[#F4F1EA]">No se encontraron herramientas con este criterio</p>
            <button
              onClick={abrirModalCrear}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6A1F] text-[#181205] rounded-xl text-xs font-bold cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" /> Cargar la primera herramienta
            </button>
          </div>
        ) : (
          herramientasFiltradas.map((her) => {
            const estaEnObra = her.estado === "En Obra / Asignada";

            return (
              <Card 
                key={her.id} 
                className={`transition-all rounded-3xl shadow-xl flex flex-col justify-between ${
                  estaEnObra 
                    ? "border-amber-500/30 bg-[#241c18]" 
                    : "border-white/10 hover:border-white/20 bg-[#181c24]"
                }`}
              >
                <CardContent className="p-5 space-y-4 text-xs flex-1 flex flex-col justify-between">
                  
                  {/* Top: Foto o Icono + Datos */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      {/* Foto miniatura o QR badge */}
                      {her.imagen ? (
                        <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/15 shrink-0 bg-black/30 relative group cursor-pointer" onClick={() => setEtiquetasParaImprimir([her])}>
                          <img src={her.imagen} alt={her.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                          <Wrench className="h-6 w-6 text-[#FF6A1F]" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-mono text-[11px] font-bold bg-[#12151b] text-[#FFC93C] border border-white/10 px-2 py-0.5 rounded flex items-center gap-1">
                            <QrCode className="h-3 w-3 text-[#FF6A1F]" />
                            {her.codigoQR}
                          </span>
                          <span className="text-[9px] text-[#9AA2AE] font-bold uppercase truncate max-w-[120px]">
                            {her.categoria}
                          </span>
                        </div>
                        <h3 className="font-bold text-[#F4F1EA] text-sm leading-snug font-heading truncate">{her.nombre}</h3>
                        <p className="text-[#9AA2AE] font-medium text-[11px] mt-0.5">
                          {her.marca} {her.numeroSerie ? `• SN: ${her.numeroSerie}` : ""}
                        </p>
                      </div>

                      <Badge variant={estaEnObra ? "warning" : "success"}>
                        {estaEnObra ? "En Obra" : "En Pañol"}
                      </Badge>
                    </div>

                    {/* Estado de Asignación / Custodia */}
                    {estaEnObra ? (
                      <div className="rounded-2xl bg-[#1e1713] border border-amber-500/30 p-3 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-[#F4F1EA]">
                          <span className="text-[#9AA2AE] text-[11px]">Custodio:</span>
                          <strong className="font-bold text-[#FFC93C]">{her.asignadoA}</strong>
                        </div>
                        <div className="flex items-center justify-between text-[#F4F1EA]">
                          <span className="text-[#9AA2AE] text-[11px]">Obra:</span>
                          <span className="font-medium truncate max-w-[150px] text-right">{her.obraAsignada}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-amber-300 pt-1.5 border-t border-white/10">
                          <span className="text-[#9AA2AE]">Retiro: {her.fechaPrestamo}</span>
                          <span className="font-bold text-[#FF6A1F]">Devolución: {her.fechaDevolucionEstimada}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl bg-[#12151b] border border-white/5 p-3 text-center">
                        <p className="text-[#3BC97C] font-bold text-xs">Disponible en Pañol Central</p>
                        <p className="text-[10px] text-[#6b7280] mt-0.5">Listo para asignación con firma QR</p>
                      </div>
                    )}
                  </div>

                  {/* Botones de Acción */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setEtiquetasParaImprimir([her])}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-white/10 transition-all cursor-pointer"
                      title="Ver e imprimir etiqueta QR"
                    >
                      <QrCode className="h-3.5 w-3.5 text-[#FF6A1F]" />
                      <span>Etiqueta QR</span>
                    </button>

                    {estaEnObra ? (
                      <button
                        onClick={() => handleDevolucion(her)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold text-[#F4F1EA] hover:bg-white/10 transition-all cursor-pointer"
                      >
                        <RotateCcw className="h-3.5 w-3.5 text-[#3BC97C]" />
                        <span>Reingresar</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setModalAsignar(her);
                          setFuncionarioSeleccionado(trabajadoresEmpresa[0]?.nombre || "");
                          setObraSeleccionada(obrasEmpresa[0]?.nombre || "");
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6A1F] px-3 py-1.5 text-xs font-bold text-[#181205] hover:bg-[#ff7b38] transition-all cursor-pointer shadow-md shadow-orange-500/20"
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        <span>Asignar</span>
                      </button>
                    )}
                  </div>

                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* MODAL 1: CARGAR NUEVA HERRAMIENTA O STOCK */}
      {modalCrear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-[#181c24] border border-white/15 p-6 shadow-2xl space-y-5 text-[#F4F1EA] my-8">
            <div className="flex items-start justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6A1F]">
                  Inventario de Pañol
                </span>
                <h2 className="text-lg font-bold text-white font-heading mt-0.5 flex items-center gap-2">
                  <PlusCircle className="h-5 w-5 text-[#FF6A1F]" />
                  Cargar Nueva Herramienta / Stock
                </h2>
              </div>
              <button
                onClick={() => setModalCrear(false)}
                className="rounded-lg p-1 text-[#9AA2AE] hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarHerramienta} className="space-y-4 text-xs">
              
              {/* Nombre y Marca */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-white block">Nombre de la Herramienta *</label>
                  <input
                    type="text"
                    required
                    value={nuevoNombre}
                    onChange={(e) => setNuevoNombre(e.target.value)}
                    placeholder="Ej: Rotomartillo SDS-Max 1500W"
                    className="w-full rounded-xl border border-white/15 bg-[#12151b] p-2.5 text-white placeholder-white/20 focus:border-[#FF6A1F] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-white block">Marca *</label>
                  <input
                    type="text"
                    required
                    value={nuevaMarca}
                    onChange={(e) => setNuevaMarca(e.target.value)}
                    placeholder="Bosch, DeWalt, Fluke, Makita..."
                    className="w-full rounded-xl border border-white/15 bg-[#12151b] p-2.5 text-white placeholder-white/20 focus:border-[#FF6A1F] focus:outline-none"
                  />
                </div>
              </div>

              {/* Categoría y Número de Serie */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-white block">Categoría Técnica</label>
                  <select
                    value={nuevaCategoria}
                    onChange={(e) => setNuevaCategoria(e.target.value as any)}
                    className="w-full rounded-xl border border-white/15 bg-[#12151b] p-2.5 text-white font-medium focus:border-[#FF6A1F] focus:outline-none cursor-pointer"
                  >
                    <option value="Electromecánica">⚡ Electromecánica</option>
                    <option value="Medición y Ensayos">📊 Medición y Ensayos (Fluke/Megger)</option>
                    <option value="Fijación y Corte">🪚 Fijación y Corte (Rotomartillos/Amoladoras)</option>
                    <option value="Seguridad y Altura">🪜 Seguridad y Altura (Escaleras/Arneses)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-white block">Modelo / N° de Serie Base</label>
                  <input
                    type="text"
                    value={nuevoModeloSerie}
                    onChange={(e) => setNuevoModeloSerie(e.target.value)}
                    placeholder="Ej: GBH 2-28 / SN-45210"
                    className="w-full rounded-xl border border-white/15 bg-[#12151b] p-2.5 text-white placeholder-white/20 focus:border-[#FF6A1F] focus:outline-none"
                  />
                </div>
              </div>

              {/* Cantidad de Stock y Código QR Base */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white/[0.02] border border-white/10 rounded-2xl">
                <div className="space-y-1">
                  <label className="font-bold text-white flex items-center justify-between">
                    <span>Cantidad en Stock:</span>
                    <span className="text-[#FF6A1F] font-mono font-black">{cantidadStock} u.</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={cantidadStock}
                    onChange={(e) => setCantidadStock(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/15 bg-[#12151b] p-2.5 text-white focus:border-[#FF6A1F] focus:outline-none font-mono"
                  />
                  <span className="text-[10px] text-[#9AA2AE] block">
                    {cantidadStock > 1 ? "Generará QRs secuenciales para cada unidad física" : "1 unidad individual"}
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-white block">Código QR Base:</label>
                  <input
                    type="text"
                    required
                    value={codigoPersonalizado}
                    onChange={(e) => setCodigoPersonalizado(e.target.value)}
                    placeholder="HERR-001"
                    className="w-full rounded-xl border border-white/15 bg-[#12151b] p-2.5 text-white font-mono uppercase focus:border-[#FF6A1F] focus:outline-none"
                  />
                  <span className="text-[10px] text-[#9AA2AE] block">Identificador que llevará la etiqueta</span>
                </div>
              </div>

              {/* Fotografía de la Herramienta con Compresión */}
              <div className="space-y-2">
                <label className="font-bold text-white flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Camera className="h-4 w-4 text-[#FF6A1F]" />
                    <span>Fotografía de la Herramienta (opcional)</span>
                  </span>
                  {imagenHerramienta && (
                    <span className="text-[10px] text-[#3BC97C] font-mono font-bold bg-[#3BC97C]/15 px-2 py-0.5 rounded border border-[#3BC97C]/30">
                      Optimizada WebP
                    </span>
                  )}
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFotoChange}
                  className="hidden"
                />

                {imagenHerramienta ? (
                  <div className="relative rounded-2xl overflow-hidden border border-white/15 h-32 bg-black/40 flex items-center justify-center">
                    <img src={imagenHerramienta} alt="Herramienta" className="h-full w-full object-contain" />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-2 right-2 bg-black/80 hover:bg-black text-white text-[11px] px-3 py-1.5 rounded-xl cursor-pointer flex items-center gap-1"
                    >
                      <Camera className="h-3.5 w-3.5" /> Cambiar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={isCompressing}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-5 border-2 border-dashed border-white/20 hover:border-[#FF6A1F] rounded-2xl flex flex-col items-center justify-center gap-1.5 text-xs text-[#9AA2AE] hover:text-white transition-colors cursor-pointer bg-white/[0.02]"
                  >
                    <Camera className="h-6 w-6 text-[#FF6A1F]" />
                    <span className="font-bold text-white">Tomar o subir foto de la herramienta</span>
                    <span className="text-[10px] text-[#9AA2AE]">Se comprime en el navegador sin ocupar espacio</span>
                  </button>
                )}

                {isCompressing && (
                  <p className="text-xs text-[#FFC93C] text-center animate-pulse">
                    Comprimiendo imagen...
                  </p>
                )}
              </div>

              {/* Botones del Modal */}
              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalCrear(false)}
                  className="rounded-xl border border-white/15 px-4 py-2.5 text-xs font-semibold text-[#9AA2AE] hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCompressing}
                  className="rounded-xl bg-[#FF6A1F] hover:bg-[#ff7b38] px-5 py-2.5 text-xs font-black text-[#181205] shadow-lg shadow-orange-500/25 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Guardar y Generar Etiquetas QR</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ETIQUETAS QR PARA IMPRIMIR */}
      {etiquetasParaImprimir && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-[#181c24] border border-white/15 p-6 shadow-2xl space-y-5 text-[#F4F1EA] my-8">
            
            {/* Header modal */}
            <div className="flex items-start justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#3BC97C]">
                  Etiquetas Físicas de Custodia
                </span>
                <h2 className="text-lg font-bold text-white font-heading mt-0.5 flex items-center gap-2">
                  <Printer className="h-5 w-5 text-[#FFC93C]" />
                  Impresión de Etiquetas QR ({etiquetasParaImprimir.length})
                </h2>
              </div>
              <button
                onClick={() => setEtiquetasParaImprimir(null)}
                className="rounded-lg p-1 text-[#9AA2AE] hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-[#9AA2AE]">
              Etiquetas listas para imprimir en impresora térmica adhesiva o papel A4 para plastificar y pegar en la valija o chasis de cada equipo.
            </p>

            {/* Contenedor imprimible */}
            <div id="area-imprimible-etiquetas" className="max-h-[50vh] overflow-y-auto p-3 bg-black/40 rounded-2xl border border-white/10 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {etiquetasParaImprimir.map((her, idx) => (
                  <div
                    key={idx}
                    className="bg-white text-black p-4 rounded-xl border-2 border-dashed border-gray-400 flex flex-col justify-between space-y-2.5 shadow-md"
                    style={{ minHeight: "180px" }}
                  >
                    {/* Encabezado Etiqueta */}
                    <div className="flex items-center justify-between border-b border-gray-300 pb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-black text-white font-black text-[10px] px-1.5 py-0.5 rounded">OL</span>
                        <strong className="text-[11px] font-heading font-black tracking-tight uppercase">
                          {empresaActual.nombre}
                        </strong>
                      </div>
                      <span className="text-[9px] font-bold text-gray-600 font-mono">
                        RUC: {empresaActual.ruc}
                      </span>
                    </div>

                    {/* Centro: QR + Datos */}
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-24 shrink-0 bg-white border border-gray-300 p-1 rounded-lg flex items-center justify-center">
                        <img
                          src={getQrUrl(her.codigoQR)}
                          alt={`QR ${her.codigoQR}`}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <div className="flex-1 space-y-0.5 text-left">
                        <span className="font-mono text-xs font-black bg-black text-white px-2 py-0.5 rounded inline-block">
                          {her.codigoQR}
                        </span>
                        <h4 className="font-black text-xs leading-tight text-gray-900 mt-1 line-clamp-2">
                          {her.nombre}
                        </h4>
                        <p className="text-[10px] font-bold text-gray-700">
                          {her.marca} {her.numeroSerie ? `• SN: ${her.numeroSerie}` : ""}
                        </p>
                        <span className="text-[9px] text-gray-500 uppercase font-semibold block">
                          {her.categoria}
                        </span>
                      </div>
                    </div>

                    {/* Pie Etiqueta */}
                    <div className="text-[8px] text-center text-gray-500 pt-1 border-t border-gray-200 uppercase font-bold tracking-wider">
                      Control de Pañol · Custodia Obligatoria en Faena
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Acciones del Modal */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10 gap-3">
              <button
                type="button"
                onClick={() => setEtiquetasParaImprimir(null)}
                className="rounded-xl border border-white/15 px-4 py-2 text-xs font-semibold text-[#9AA2AE] hover:text-white cursor-pointer"
              >
                Cerrar
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-xl bg-[#3BC97C] hover:bg-[#34b36e] px-5 py-2.5 text-xs font-black text-[#181205] shadow-lg shadow-green-950/40 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                <span>🖨️ Mandar a Imprimir ({etiquetasParaImprimir.length})</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal Asignar Herramienta Existente */}
      {modalAsignar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-[#181c24] border border-white/15 p-6 shadow-2xl space-y-4 text-[#F4F1EA]">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h2 className="text-base font-bold text-[#F4F1EA] font-heading flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-[#FF6A1F]" />
                  Salida de Pañol: {modalAsignar.codigoQR}
                </h2>
                <p className="text-xs text-[#9AA2AE]">{modalAsignar.nombre}</p>
              </div>
              <button 
                onClick={() => setModalAsignar(null)} 
                className="rounded-lg p-1 text-[#9AA2AE] hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmarAsignacion} className="space-y-4 text-xs">
              
              <div className="space-y-1">
                <label className="font-semibold text-[#F4F1EA]">Funcionario Responsable (Custodio) *</label>
                <select
                  required
                  value={funcionarioSeleccionado}
                  onChange={(e) => setFuncionarioSeleccionado(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#12151b] p-2.5 font-bold text-[#F4F1EA] focus:border-[#FF6A1F] focus:outline-none cursor-pointer"
                >
                  <option value="">Seleccionar operario / técnico...</option>
                  {trabajadoresEmpresa.map((t) => (
                    <option key={t.id} value={t.nombre}>
                      {t.nombre} ({t.categoria})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#F4F1EA]">Obra o Destino *</label>
                <select
                  value={obraSeleccionada}
                  onChange={(e) => setObraSeleccionada(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#12151b] p-2.5 font-bold text-[#F4F1EA] focus:border-[#FF6A1F] focus:outline-none cursor-pointer"
                >
                  {obrasEmpresa.map((o) => (
                    <option key={o.id} value={o.nombre}>
                      {o.codigo} - {o.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#F4F1EA]">Fecha Estimada de Devolución</label>
                <input
                  type="date"
                  value={fechaDevolucion}
                  onChange={(e) => setFechaDevolucion(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#12151b] p-2.5 font-medium text-[#F4F1EA] focus:border-[#FF6A1F] focus:outline-none"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-[#12151b] border border-white/5 text-[#9AA2AE] text-[11px] leading-relaxed">
                ℹ️ Al confirmar, el sistema registrará la fecha y hora de entrega y guardará la constancia de custodia para {empresaActual.nombre}.
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalAsignar(null)}
                  className="rounded-xl border border-white/15 px-4 py-2 text-[#9AA2AE] hover:bg-white/5 font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#FF6A1F] px-4 py-2 font-bold text-[#181205] hover:bg-[#ff7b38] transition-all shadow-md cursor-pointer"
                >
                  Confirmar Entrega
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Estilos CSS dedicados para impresión limpia de etiquetas QR */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #area-imprimible-etiquetas,
          #area-imprimible-etiquetas * {
            visibility: visible;
          }
          #area-imprimible-etiquetas {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>

    </div>
  );
}
