import { Link } from 'react-router-dom'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <Link className="brand footer-brand" to="/">
          <span className="brand-mark" aria-hidden="true">L</span>
          <span className="brand-name">lumen</span>
        </Link>
        <p>Aprender también es encontrar a las personas correctas.</p>
        <span className="footer-note">Una plataforma en preparación</span>
      </div>
    </footer>
  )
}
