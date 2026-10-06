import { ApiStatus } from './features/system/ApiStatus'

export default function App() {
  return (
    <>
      <header className="app-header">
        <h1>Logistics Dispatch</h1>
      </header>
      <main>
        <ApiStatus />
      </main>
    </>
  )
}
