import "./globals.css"
import Navbar from "@/components/Navbar"

export const metadata = {
  title: "Group Voting System",
  description: "Create and manage group voting with real-time results",
    generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <div className="main-content">{children}</div>
      </body>
    </html>
  )
}
