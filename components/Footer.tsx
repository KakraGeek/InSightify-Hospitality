import { Button } from '../components/components/ui/button'

export default function Footer() {
  return (
    <footer className="bg-brand-light text-brand-navy border-t border-brand-gray/30 mt-auto">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <p className="text-center md:text-left">
            © 2025 InSightify. All rights reserved. | Powered by The Geek Toolbox
          </p>
          <nav className="flex items-center gap-2">
            <Button asChild variant="link" className="text-brand-orange p-0 text-sm">
              <a href="#">Contact</a>
            </Button>
          </nav>
        </div>
      </div>
    </footer>
  )
}
