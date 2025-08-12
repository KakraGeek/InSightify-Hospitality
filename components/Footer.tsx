import { Button } from '../components/components/ui/button'

export default function Footer() {
  return (
    <footer className="bg-brand-light text-brand-navy border-t border-brand-gray/30">
      <div className="mx-auto max-w-6xl px-4 py-6 text-sm flex items-center justify-between">
        <p>© 2025 InSightify. All rights reserved. | Powered by The Geek Toolbox</p>
        <nav className="flex items-center gap-2">
          <Button asChild variant="link" className="text-brand-orange p-0">
            <a href="#">Contact</a>
          </Button>
        </nav>
      </div>
    </footer>
  )
}
