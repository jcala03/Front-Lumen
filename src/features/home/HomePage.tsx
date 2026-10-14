import { Link } from 'react-router-dom'
import { StatusNotice } from '../../components/ui/StatusNotice'

const values = [
  {
    number: '01',
    title: 'Encuentra tu ritmo',
    text: 'Un espacio pensado para que aprender se sienta más claro, cercano y posible.',
  },
  {
    number: '02',
    title: 'Conecta con personas',
    text: 'Lumen está construyendo una comunidad donde compartir conocimiento importa.',
  },
  {
    number: '03',
    title: 'Crece a tu manera',
    text: 'Cada camino de aprendizaje es distinto. El siguiente paso también será tuyo.',
  },
]

export function HomePage() {
  return (
    <>
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow"><span className="eyebrow-dot" /> Aprender juntos, llegar más lejos</p>
            <h1>El conocimiento <span>brilla más</span> cuando se comparte.</h1>
            <p className="hero-description">
              Lumen conecta estudiantes y tutores para que cada persona encuentre nuevas formas de aprender y enseñar.
            </p>
            <div className="hero-actions">
              <Link className="button" to="/registro">Conoce Lumen <span aria-hidden="true">→</span></Link>
              <Link className="text-link" to="/tutores">Explorar la plataforma</Link>
            </div>
            <div className="hero-proof">
              <div className="avatar-stack" aria-hidden="true">
                <span>A</span><span>M</span><span>J</span>
              </div>
              <p><strong>Una comunidad en construcción</strong><br />para aprender con confianza</p>
            </div>
          </div>

          <div className="hero-art" aria-label="Ilustración decorativa de una idea en crecimiento" role="img">
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />
            <div className="art-sun"><span /></div>
            <div className="art-card art-card-top">
              <span className="art-card-icon">✳</span>
              <span><strong>Ideas nuevas</strong><small>empiezan aquí</small></span>
            </div>
            <div className="art-card art-card-bottom">
              <span className="art-card-bubble">↗</span>
              <span><strong>Tu próximo paso</strong><small>está por descubrirse</small></span>
            </div>
            <span className="art-spark spark-one" aria-hidden="true">✳</span>
            <span className="art-spark spark-two" aria-hidden="true">✦</span>
            <span className="art-spark spark-three" aria-hidden="true">·</span>
            <div className="art-caption">Una idea puede<br />encender muchas.</div>
          </div>
        </div>
      </section>

      <section className="intro-section section-space">
        <div className="container intro-grid">
          <div>
            <p className="eyebrow">Un comienzo con intención</p>
            <h2>La educación crece cuando crecemos <span>en comunidad.</span></h2>
          </div>
          <div className="intro-aside">
            <p>
              Estamos preparando un lugar para quienes quieren compartir lo que saben y para quienes tienen ganas de aprender.
            </p>
            <StatusNotice title="Autenticación disponible">
              Puedes crear una cuenta o iniciar sesión. El catálogo de tutores todavía no forma parte de la API.
            </StatusNotice>
          </div>
        </div>
      </section>

      <section className="values-section section-space">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Lo que nos mueve</p>
              <h2>Aprender se siente mejor <span>acompañado.</span></h2>
            </div>
            <p className="section-heading-note">Una idea sencilla: hacer que el conocimiento encuentre su camino.</p>
          </div>
          <div className="value-grid">
            {values.map((value) => (
              <article className="value-card" key={value.number}>
                <span className="value-number">{value.number}</span>
                <h3>{value.title}</h3>
                <p>{value.text}</p>
                <span className="value-arrow" aria-hidden="true">↗</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="closing-section">
        <div className="container closing-card">
          <div>
            <p className="eyebrow">El futuro se aprende</p>
            <h2>Todo gran camino empieza con una pregunta.</h2>
          </div>
          <Link className="button button-light" to="/registro">Da el primer paso <span aria-hidden="true">→</span></Link>
          <span className="closing-spark" aria-hidden="true">✳</span>
        </div>
      </section>
    </>
  )
}
