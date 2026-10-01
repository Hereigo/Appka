import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'

type HelloMessage = {
  message: string
  serverTime: string
}

type WeatherForecast = {
  date: string
  temperatureC: number
  temperatureF: number
  summary: string | null
}

function App() {
  const [hello, setHello] = useState<HelloMessage | null>(null)
  const [forecast, setForecast] = useState<WeatherForecast[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      try {
        const [helloRes, forecastRes] = await Promise.all([
          fetch('/api/hello', { signal: controller.signal }),
          fetch('/api/weatherforecast', { signal: controller.signal }),
        ])

        if (!helloRes.ok || !forecastRes.ok) {
          throw new Error(`API returned ${helloRes.status} / ${forecastRes.status}`)
        }

        setHello(await helloRes.json())
        setForecast(await forecastRes.json())
        setError(null)
      } catch (err) {
        if (controller.signal.aborted) return
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    load()
    return () => controller.abort()
  }, [])

  return (
    <main className="page">
      <header className="header">
        <img src={reactLogo} className="logo" alt="React logo" />
        <div>
          <h1>Appka</h1>
          <p className="subtitle">React client + .NET 10 minimal API</p>
        </div>
      </header>

      <section className="card">
        <h2>Server says</h2>
        {loading && <p className="muted">Loading…</p>}
        {error && (
          <p className="error">
            Could not reach <code>Appka.Server</code>: {error}
          </p>
        )}
        {hello && (
          <>
            <p className="message">{hello.message}</p>
            <p className="muted">
              Server time: {new Date(hello.serverTime).toLocaleString()}
            </p>
          </>
        )}
      </section>

      {forecast.length > 0 && (
        <section className="card">
          <h2>Weather forecast</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>°C</th>
                <th>°F</th>
                <th>Summary</th>
              </tr>
            </thead>
            <tbody>
              {forecast.map((f) => (
                <tr key={f.date}>
                  <td>{new Date(f.date).toLocaleDateString()}</td>
                  <td>{f.temperatureC}</td>
                  <td>{f.temperatureF}</td>
                  <td>{f.summary ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </main>
  )
}

export default App
