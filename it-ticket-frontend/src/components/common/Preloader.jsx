import { Headphones } from 'lucide-react'
import Sidebar from './Sidebar'

function PreloaderContent({ message }) {
  return (
    <main className="preloader-page" aria-live="polite" aria-busy="true">
      <div className="preloader-mark" aria-hidden="true">
        <Headphones size={34} strokeWidth={2.2} />
      </div>
      <div className="preloader-copy">
        <p className="preloader-kicker">IT Ticket System</p>
        <h1 className="preloader-title">{message}</h1>
      </div>
      <div className="preloader-loader" aria-label="Loading">
        <span />
        <span />
        <span />
      </div>
    </main>
  )
}

export default function Preloader({ message = 'Preparing your workspace', withSidebar = false }) {
  if (withSidebar) {
    return (
      <div className="app-layout preloader-layout">
        <Sidebar />
        <main className="main-content">
          <PreloaderContent message={message} />
        </main>
      </div>
    )
  }

  return <PreloaderContent message={message} />
}
