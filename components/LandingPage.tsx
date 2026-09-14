"use client";

import React, { useState } from "react";
import AuthModal from "./AuthModal";

interface LandingPageProps {
  onOpenApp: (tab?: string) => void;
}

export default function LandingPage({ onOpenApp }: LandingPageProps) {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authPlan, setAuthPlan] = useState<"Obra Única" | "Empresa" | "Multi-empresa">("Empresa");

  const handleAuthSuccess = () => {
    setAuthModalOpen(false);
    onOpenApp("dashboard");
  };

  const handleOpenAuth = (plan?: "Obra Única" | "Empresa" | "Multi-empresa") => {
    if (plan) setAuthPlan(plan);
    setAuthModalOpen(true);
  };
  return (
    <div className="landing-root">
      {/* HEADER */}
      <header className="landing-header">
        <div className="landing-nav">
          <div className="landing-brand" onClick={() => onOpenApp("dashboard")}>
            <span className="landing-brand-mark">OL</span>
            Obra<span>Logix</span>
          </div>

          <nav className="landing-links">
            <a href="#modulos">Módulos</a>
            <a href="#como-funciona">Cómo funciona</a>
            <a href="#planes">Planes</a>
          </nav>

          <div className="landing-nav-actions">
            <button onClick={() => onOpenApp("dashboard")} className="landing-nav-cta" style={{ background: '#3BC97C', color: '#181205', fontWeight: 'bold', cursor: 'pointer' }}>
              🚀 Entrar al Sistema
            </button>
            <a href="/login" className="landing-nav-ghost" style={{ textDecoration: 'none' }}>
              Iniciar Sesión
            </a>
            <a href="/registro" className="landing-nav-cta" style={{ textDecoration: 'none' }}>
              Registrarse
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="landing-hero">
        <div className="wrap landing-hero-grid">
          <div>
            <div className="landing-hero-tag">
              <span className="dot"></span> Hecho para constructoras y empresas eléctricas del Paraguay
            </div>
            <h1 className="landing-hero-title heading-font">
              Tu obra, tu cuadrilla y tu pañol, <em>ordenados desde el celular.</em>
            </h1>
            <p className="landing-hero-sub">
              ObraLogix reemplaza la planilla de Excel, el cuaderno de bitácora y los audios de WhatsApp por un solo sistema donde ves el avance real de cada obra, quién trabajó hoy y dónde está cada herramienta.
            </p>

            <div className="landing-hero-actions">
              <button onClick={() => onOpenApp("dashboard")} className="landing-btn-primary" style={{ cursor: 'pointer' }}>
                <span>🚀 Entrar al Sistema (Probar en Vivo)</span>
                <span>→</span>
              </button>
              <a href="/registro" className="landing-btn-ghost" style={{ cursor: 'pointer', textDecoration: 'none' }}>
                Crear Cuenta Nueva
              </a>
            </div>

            <div className="landing-hero-proof">
              <div><b>2</b>tipos de obra: civil y eléctrica</div>
              <div><b>6</b>módulos operativos en un solo login</div>
              <div><b>100%</b>en guaraníes, pensado para Paraguay</div>
            </div>
          </div>

          {/* MOCK PANEL INTERACTIVO */}
          <div className="landing-mock" onClick={() => onOpenApp("obras")}>
            <div className="landing-mock-head">
              <div className="who">
                <b>OBR-EL-01 · Cervepar S.A.</b>
                Montaje TGBT y alimentadores (Ypané)
              </div>
              <span className="landing-pill">En ejecución</span>
            </div>

            <div className="landing-mock-row" onClick={(e) => { e.stopPropagation(); onOpenApp("obras"); }}>
              <div className="name">
                Avance de obra
                <small>65% ejecutado</small>
              </div>
              <div className="landing-bar-track">
                <div className="landing-bar-fill" style={{ width: "65%" }}></div>
              </div>
            </div>

            <div className="landing-mock-row" onClick={(e) => { e.stopPropagation(); onOpenApp("cuadrilla"); }}>
              <div className="name">
                Ronaldo Peña
                <small>Electricista matriculado · presente hoy</small>
              </div>
              <div className="landing-bar-track">
                <div className="landing-bar-fill" style={{ width: "100%", background: "var(--green)" }}></div>
              </div>
            </div>

            <div className="landing-mock-row" onClick={(e) => { e.stopPropagation(); onOpenApp("panol"); }}>
              <div className="name">
                Rotomartillo SDS-Max
                <small>Asignado en obra desde el 02/09</small>
              </div>
              <div className="landing-bar-track">
                <div className="landing-bar-fill" style={{ width: "100%", background: "var(--steel)" }}></div>
              </div>
            </div>

            <div className="landing-mock-foot">
              <div className="landing-mock-chip" onClick={(e) => { e.stopPropagation(); onOpenApp("cuadrilla"); }}>
                <b>6</b>
                <span>trabajadores en obra</span>
              </div>
              <div className="landing-mock-chip" onClick={(e) => { e.stopPropagation(); onOpenApp("obras"); }}>
                <b>₲215M</b>
                <span>ejecutado de ₲340M</span>
              </div>
            </div>

            <div className="landing-mock-banner-action">
              ⚡ Haz clic aquí para interactuar con este proyecto en vivo
            </div>
          </div>
        </div>
      </section>

      {/* STRIPE DE DOLORES */}
      <div className="landing-stripe">
        <div className="wrap landing-stripe-grid">
          <div className="landing-stripe-item">
            <b>La planilla nunca está al día.</b>
            Cada capataz anota distinto y el dueño se entera del atraso cuando ya es tarde.
          </div>
          <div className="landing-stripe-item">
            <b>Las herramientas se pierden entre obras.</b>
            Nadie sabe si el rotomartillo quedó en Ypané o en San Lorenzo.
          </div>
          <div className="landing-stripe-item">
            <b>El avance vive en la cabeza del capataz.</b>
            Si no manda el audio de WhatsApp, la oficina no sabe qué pasó hoy.
          </div>
        </div>
      </div>

      {/* MODULOS */}
      <section id="modulos" className="wrap landing-section">
        <div className="landing-section-head">
          <h2 className="heading-font">Un módulo para cada parte del trabajo diario</h2>
          <p>Nada de plantillas genéricas: cada pantalla está armada para cómo realmente se maneja una obra civil o un montaje eléctrico en Paraguay.</p>
        </div>

        <div className="landing-feat-grid">
          <div className="landing-feat" onClick={() => onOpenApp("obras")}>
            <span className="ic">🏗️</span>
            <h3 className="heading-font">Obras</h3>
            <p>Presupuesto, avance físico y costo ejecutado de cada obra, civil o eléctrica, con estado y responsable a la vista.</p>
            <span className="landing-feat-link">Abrir módulo de obras →</span>
          </div>

          <div className="landing-feat" onClick={() => onOpenApp("cuadrilla")}>
            <span className="ic">👷</span>
            <h3 className="heading-font">Cuadrilla</h3>
            <p>Asistencia diaria, horas extra y vales por trabajador, con su categoría y jornal cargados una sola vez.</p>
            <span className="landing-feat-link">Llamar lista y diarias →</span>
          </div>

          <div className="landing-feat" onClick={() => onOpenApp("panol")}>
            <span className="ic">🧰</span>
            <h3 className="heading-font">Pañol de herramientas</h3>
            <p>Cada herramienta con su código QR: quién la tiene, en qué obra está y cuándo debe volver.</p>
            <span className="landing-feat-link">Ver stock y custodia QR →</span>
          </div>

          <div className="landing-feat" onClick={() => onOpenApp("bitacora")}>
            <span className="ic">📓</span>
            <h3 className="heading-font">Bitácora de obra</h3>
            <p>Clima, personal presente, avance del día y trabas, con fotos, cargado desde el celular en la obra.</p>
            <span className="landing-feat-link">Ver bitácora digital →</span>
          </div>

          <div className="landing-feat" onClick={() => onOpenApp("tableros")}>
            <span className="ic">⚡</span>
            <h3 className="heading-font">Tableros eléctricos</h3>
            <p>Seguimiento por fase: diseño, mecanizado, cableado y pruebas FAT, con lista de materiales y compra.</p>
            <span className="landing-feat-link">Pipeline de Construlógica →</span>
          </div>

          <div className="landing-feat" onClick={() => onOpenApp("dashboard")}>
            <span className="ic">📊</span>
            <h3 className="heading-font">Panel general</h3>
            <p>Una vista única de todas las obras y empresas del grupo, para saber en qué gastar la próxima visita.</p>
            <span className="landing-feat-link">Ir al panel general →</span>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="landing-how landing-section" id="como-funciona">
        <div className="wrap">
          <div className="landing-section-head">
            <h2 className="heading-font">De la planilla suelta a un sistema en tres pasos</h2>
            <p>Sin capacitaciones largas ni curva de aprendizaje: el capataz ya sabe usar un celular, esto no es distinto.</p>
          </div>

          <div className="landing-how-grid">
            <div className="landing-how-step">
              <div className="landing-how-num">1</div>
              <h3 className="heading-font">Cargá tu obra</h3>
              <p>Código, cliente, presupuesto y fechas. Definí si es civil, eléctrica o mixta.</p>
            </div>
            <div className="landing-how-step">
              <div className="landing-how-num">2</div>
              <h3 className="heading-font">Sumá tu cuadrilla y tu pañol</h3>
              <p>Trabajadores con su jornal y categoría, herramientas con su código QR.</p>
            </div>
            <div className="landing-how-step">
              <div className="landing-how-num">3</div>
              <h3 className="heading-font">Seguí el avance todos los días</h3>
              <p>Bitácora, asistencia y progreso se cargan desde la obra y se ven al instante en la oficina.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CIVIL VS ELECTRICO */}
      <section className="wrap landing-section">
        <div className="landing-section-head">
          <h2 className="heading-font">Pensado para dos mundos que trabajan distinto</h2>
          <p>ObraLogix no mezcla todo en una sola planilla genérica: separa lo civil de lo eléctrico donde hace falta.</p>
        </div>

        <div className="landing-aud-grid">
          <div className="landing-aud civil" onClick={() => onOpenApp("obras")}>
            <div className="tag">Obra civil</div>
            <h3 className="heading-font">Estructura, mampostería y avance físico</h3>
            <ul>
              <li>Progreso por obra en base a avance real, no a fecha calendario.</li>
              <li>Cuadrillas grandes con categorías: oficial, ayudante, capataz.</li>
              <li>Bitácora diaria con clima y trabas, con respaldo fotográfico.</li>
            </ul>
          </div>

          <div className="landing-aud elec" onClick={() => onOpenApp("tableros")}>
            <div className="tag">Obra eléctrica</div>
            <h3 className="heading-font">Tableros, tensión y fases de montaje</h3>
            <ul>
              <li>Seguimiento de tableros por fase, desde diseño hasta entrega en obra.</li>
              <li>Lista de materiales por tablero, con estado de compra.</li>
              <li>Cuadrilla matriculada: electricistas y técnicos tableristas.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* PLANES */}
      <section id="planes" className="wrap landing-section">
        <div className="landing-section-head">
          <h2 className="heading-font">Planes en guaraníes, sin sorpresas</h2>
          <p>Empezá con una obra activa y subí de plan cuando tu operación crezca.</p>
        </div>

        <div className="landing-price-grid">
          <div className="landing-price">
            <span className="landing-price-badge">Contratista</span>
            <h3 className="heading-font">Obra Única</h3>
            <div className="sub">Para una obra activa a la vez</div>
            <div className="cost">₲350.000<span>/mes</span></div>
            <ul>
              <li>1 obra activa, hasta 10 trabajadores</li>
              <li>Pañol de herramientas con QR</li>
              <li>Bitácora diaria con fotos</li>
            </ul>
            <button onClick={() => handleOpenAuth("Obra Única")}>Empezar prueba</button>
          </div>

          <div className="landing-price feat-plan">
            <span className="landing-price-badge">Más elegido</span>
            <h3 className="heading-font">Empresa</h3>
            <div className="sub">Para constructoras y eléctricas activas</div>
            <div className="cost">₲890.000<span>/mes</span></div>
            <ul>
              <li>Obras ilimitadas, hasta 40 trabajadores</li>
              <li>Módulo de tableros eléctricos por fase</li>
              <li>Panel general de todas las obras</li>
              <li>Soporte prioritario por WhatsApp</li>
            </ul>
            <button onClick={() => handleOpenAuth("Empresa")}>Probar en Vivo</button>
          </div>

          <div className="landing-price">
            <span className="landing-price-badge">Grupo</span>
            <h3 className="heading-font">Multi-empresa</h3>
            <div className="sub">Para grupos con varias razones sociales</div>
            <div className="cost">A medida</div>
            <ul>
              <li>Varias empresas bajo un mismo panel</li>
              <li>Usuarios y permisos por obra</li>
              <li>Onboarding asistido para tu equipo</li>
            </ul>
            <button onClick={() => handleOpenAuth("Multi-empresa")}>Hablar con ventas</button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="wrap landing-section" style={{ paddingTop: 0 }}>
        <div className="landing-cta">
          <h2 className="heading-font">Dejá de buscar el rotomartillo por teléfono.</h2>
          <p>Mostranos tu obra actual y te armamos ObraLogix con tus datos reales en la primera llamada.</p>
          <div className="landing-hero-actions" style={{ justifyContent: "center" }}>
            <button onClick={() => handleOpenAuth("Empresa")} className="landing-btn-primary">
              Empezar Prueba Gratis Ahora
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="wrap landing-foot-row">
          <div className="landing-brand" style={{ fontSize: "1rem" }} onClick={() => onOpenApp("dashboard")}>
            <span className="landing-brand-mark" style={{ width: "26px", height: "26px", fontSize: "0.8rem" }}>OL</span>
            Obra<span style={{ color: "var(--orange)" }}>Logix</span>
          </div>
          <div>Hecho en Paraguay, para obras civiles y eléctricas.</div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        planInicial={authPlan}
      />
    </div>
  );
}
