import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="page-section">
      <div className="container narrow-container not-found">
        <p className="eyebrow">Error 404</p>
        <h1 className="page-title">Esta página aún no <span>existe.</span></h1>
        <p className="page-lead">Puede que la dirección haya cambiado o que todavía no hayamos llegado hasta aquí.</p>
        <Link className="button" to="/">Volver al inicio <span aria-hidden="true">→</span></Link>
      </div>
    </section>
  )
}
