/**
 * pages/Terms.jsx — Términos y condiciones de no/limits.
 */

import { motion } from 'motion/react';
import { Link }   from 'react-router-dom';

const SECTIONS = [
  {
    title: '1. Aceptación de los términos',
    content: `Al acceder y utilizar no/limits, aceptas estar sujeto a estos Términos y Condiciones. Si no estás de acuerdo con alguna parte de los términos, no debes usar la plataforma. El uso continuo de la plataforma implica la aceptación de cualquier modificación futura a estos términos.`,
  },
  {
    title: '2. Descripción del servicio',
    content: `no/limits es una plataforma académica de agregación de contenido cultural que reúne información sobre películas, series, videojuegos, libros, música y anime desde fuentes públicas de terceros. La plataforma no almacena ni distribuye el contenido en sí, sino que ofrece referencias e información para que los usuarios puedan encontrarlo en sus fuentes originales.`,
  },
  {
    title: '3. Fuentes de datos de terceros',
    content: `La información mostrada en no/limits proviene de APIs públicas de terceros, incluyendo The Movie Database (TMDB), Jikan/MyAnimeList, Open Library, IGDB y MusicBrainz. Cada una de estas fuentes tiene sus propios términos de uso. no/limits no se hace responsable por la exactitud, completitud o disponibilidad de la información provista por estas fuentes.`,
  },
  {
    title: '4. Uso aceptable',
    content: `Puedes usar no/limits para:
• Buscar y descubrir contenido cultural de interés personal.
• Guardar listas personales de contenido.
• Escribir reseñas personales.
• Explorar sagas y franquicias culturales.

No puedes usar no/limits para:
• Distribuir o reproducir contenido protegido por derechos de autor.
• Realizar scraping automatizado de la plataforma.
• Intentar acceder a sistemas o datos no autorizados.
• Usar la plataforma con fines comerciales sin autorización expresa.`,
  },
  {
    title: '5. Propiedad intelectual',
    content: `Toda la información sobre obras culturales —títulos, sinopsis, imágenes de portada, etc.— pertenece a sus respectivos propietarios y está disponible públicamente a través de las APIs de terceros mencionadas. El diseño, la interfaz y el código de no/limits son propiedad de sus desarrolladores y están protegidos bajo licencia académica.`,
  },
  {
    title: '6. Privacidad y datos del usuario',
    content: `no/limits en su versión actual almacena los datos del usuario (listas guardadas, reseñas, preferencias de tema) únicamente en el dispositivo del usuario mediante almacenamiento local (localStorage). No se transmiten datos personales a servidores externos. En versiones futuras con autenticación, se publicará una política de privacidad independiente.`,
  },
  {
    title: '7. Limitación de responsabilidad',
    content: `no/limits se proporciona "tal como está" sin garantías de ningún tipo. No nos responsabilizamos por:
• Interrupciones o errores en el servicio.
• Información incorrecta proveniente de fuentes de terceros.
• Disponibilidad de contenido en plataformas externas.
• Pérdida de datos almacenados localmente.`,
  },
  {
    title: '8. Modificaciones al servicio',
    content: `nos reservamos el derecho de modificar, suspender o interrumpir el servicio en cualquier momento sin previo aviso. También podemos actualizar estos términos y condiciones. Los cambios entran en vigor desde el momento de su publicación en la plataforma.`,
  },
  {
    title: '9. Proyecto académico',
    content: `no/limits es un proyecto académico desarrollado en el contexto del curso TPY1101. Su desarrollo es con fines educativos. No se ofrecen garantías de servicio continuo, soporte técnico ni disponibilidad prolongada.`,
  },
  {
    title: '10. Contacto',
    content: `Para cualquier consulta relacionada con estos términos, puedes contactar al equipo de desarrollo a través de los canales institucionales del curso TPY1101, Grupo 3.`,
  },
];

function Terms() {
  return (
    <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)', maxWidth: '760px' }}>
      {/* Encabezado */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1,  y: 0  }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--nl-accent)', marginBottom: 'var(--space-3)' }}>
          Legal
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 'var(--space-3)' }}>
          Términos y condiciones
        </h1>
        <p style={{ color: 'var(--nl-text-muted)', fontSize: '13px', fontFamily: 'var(--font-mono)', marginBottom: 'var(--space-8)' }}>
          Última actualización: 2026 — Q1 · Proyecto académico TPY1101
        </p>
        <div style={{ height: '1px', background: 'var(--nl-border)', marginBottom: 'var(--space-8)' }} />
      </motion.div>

      {/* Introducción */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{ fontSize: '15px', lineHeight: 1.75, color: 'var(--nl-text-secondary)', marginBottom: 'var(--space-8)' }}
      >
        Bienvenido a <strong style={{ color: 'var(--nl-text-primary)' }}>no/limits</strong>. Por favor, lee estos términos y condiciones detenidamente antes de usar la plataforma. Al utilizar nuestros servicios, aceptas los términos descritos a continuación.
      </motion.p>

      {/* Secciones */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
        {SECTIONS.map((section, i) => (
          <motion.section
            key={section.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.45, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2
              style={{
                fontFamily:    'var(--font-display)',
                fontSize:      '18px',
                fontWeight:    600,
                letterSpacing: '-0.01em',
                color:         'var(--nl-text-primary)',
                marginBottom:  'var(--space-3)',
              }}
            >
              {section.title}
            </h2>
            <p
              style={{
                fontSize:   '14px',
                lineHeight: 1.75,
                color:      'var(--nl-text-secondary)',
                whiteSpace: 'pre-line',
              }}
            >
              {section.content}
            </p>
          </motion.section>
        ))}
      </div>

      {/* Footer de la página */}
      <div style={{ marginTop: 'var(--space-12)', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--nl-border)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--nl-text-muted)' }}>
          no/limits · Grupo 3 · TPY1101 · 2026
        </p>
        <Link to="/" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--nl-accent)' }}>
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
}

export default Terms;
