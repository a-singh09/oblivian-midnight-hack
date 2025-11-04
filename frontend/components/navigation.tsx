"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">OP</span>
            </div>
            <span className="text-lg font-semibold text-foreground">Oblivion Protocol</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/dashboard"
              className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
            >
              Dashboard
            </Link>
            <Link
              href="/for-companies"
              className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
            >
              For Companies
            </Link>
            <Link
              href="/how-it-works"
              className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
            >
              How It Works
            </Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/demo"
              className="px-6 py-2 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
            >
              Start Free Trial
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <Link
              href="/dashboard"
              className="block text-muted-foreground hover:text-foreground transition-colors text-sm font-medium py-2"
            >
              Dashboard
            </Link>
            <Link
              href="/for-companies"
              className="block text-muted-foreground hover:text-foreground transition-colors text-sm font-medium py-2"
            >
              For Companies
            </Link>
            <Link
              href="/how-it-works"
              className="block text-muted-foreground hover:text-foreground transition-colors text-sm font-medium py-2"
            >
              How It Works
            </Link>
            <Link
              href="/demo"
              className="block px-6 py-2 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors text-center"
            >
              Start Free Trial
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
