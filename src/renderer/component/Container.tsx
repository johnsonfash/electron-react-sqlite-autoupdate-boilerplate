import { ReactNode } from "react"
import { Link } from "react-router-dom"

const Container = ({ children }: { children: ReactNode }) => {
  return (
    <main className="flex h-screen">
      <nav className="h-full w-[200px] border">
        <Link className="block p-4 border-b" to='/'>Dashboard</Link>
        <Link className="block p-4 border-b" to='/users'>Users</Link>
        <Link className="block p-4 border-b" to='/invoices'>Invoices</Link>
      </nav>
      <div className="w-[100%-200px] h-full">
        {children}
      </div>
    </main>
  )
}

export default Container