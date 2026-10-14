import { Link } from 'react-router-dom'
import { StatusNotice } from '../../components/ui/StatusNotice'

export function TutorsPage() {
  return (
    <section className="page-section">
      <div className="container narrow-container">
        <p className="eyebrow">Un espacio para conectar</p>
        <h1 className="page-title">Conoce a la comunidad <span>Lumen.</span></h1>
        <p className="page-lead">Estamos preparando una experiencia para descubrir tutores y encontrar nuevas formas de aprender.</p>
        <div className="coming-soon-card">
          <span className="coming-soon-symbol" aria-hidden="true">✳</span>
          <h2>La comunidad está tomando forma.</h2>
          <p>Aún no hay perfiles de tutores disponibles. Esta página no carga ni simula información.</p>
          <StatusNotice title="Sin datos conectados">
            El backend actual no ofrece un endpoint para listar tutores.
          </StatusNotice>
          <Link className="text-link" to="/registro">Descubre cómo participar <span aria-hidden="true">→</span></Link>
        </div>
      </div>
    </section>
  )
}
