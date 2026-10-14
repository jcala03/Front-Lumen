type StatusNoticeProps = {
  title: string
  children: string
}

export function StatusNotice({ title, children }: StatusNoticeProps) {
  return (
    <div className="status-notice" role="status">
      <span className="status-indicator" aria-hidden="true" />
      <div>
        <strong>{title}</strong>
        <p>{children}</p>
      </div>
    </div>
  )
}
