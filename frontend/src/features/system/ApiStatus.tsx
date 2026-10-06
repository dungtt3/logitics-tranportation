import { useEffect, useState } from 'react'

type Status = 'checking' | 'healthy' | 'unhealthy'

const labels: Record<Status, string> = {
  checking: 'Checking…',
  healthy: 'Healthy',
  unhealthy: 'Unavailable',
}

export function ApiStatus() {
  const [status, setStatus] = useState<Status>('checking')

  useEffect(() => {
    const controller = new AbortController()

    fetch('/health/ready', { signal: controller.signal })
      .then((response) => setStatus(response.ok ? 'healthy' : 'unhealthy'))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          console.error('API readiness check failed', error)
          setStatus('unhealthy')
        }
      })

    return () => controller.abort()
  }, [])

  return (
    <section className="status-card" aria-live="polite">
      <h2>API</h2>
      <p data-status={status}>{labels[status]}</p>
    </section>
  )
}
