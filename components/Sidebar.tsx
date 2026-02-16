'use client'

import { useState } from 'react'

type SidebarSection = 'agent' | 'tokens' | 'heartbeat' | 'kanban' | 'cost'

interface NavItem {
  id: string
  label: string
  icon: string
  section: SidebarSection
}

const navItems: NavItem[] = [
  { id: 'agent', label: 'Agent Status', icon: '🤖', section: 'agent' },
  { id: 'tokens', label: 'Token Usage', icon: '⚡', section: 'tokens' },
  { id: 'heartbeat', label: 'Heartbeat Monitor', icon: '💓', section: 'heartbeat' },
  { id: 'kanban', label: 'Tasks (Kanban)', icon: '📋', section: 'kanban' },
  { id: 'cost', label: 'Cost Report', icon: '💰', section: 'cost' },
]

interface SidebarProps {
  activeSection: string
  onNavigate: (section: SidebarSection) => void
}

export default function Sidebar({ activeSection, onNavigate }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden glass-card p-2 rounded-lg text-white"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Sidebar overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static
          left-0 top-0 h-screen
          w-64 md:w-64
          glass-card rounded-none md:rounded-2xl
          p-6
          overflow-y-auto
          transition-transform duration-300 ease-in-out
          z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          md:max-h-screen md:sticky md:top-0
          border-r border-white border-opacity-20 md:border-r md:border-white md:border-opacity-20
        `}
      >
        {/* Logo/Header */}
        <div className="mb-8 pt-4 md:pt-0">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            Henry
          </h1>
          <p className="text-xs text-gray-400 mt-2">Mission Control</p>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.section)
                setIsOpen(false)
              }}
              className={`
                w-full px-4 py-3 rounded-xl
                flex items-center gap-3
                transition-all duration-200
                ${
                  activeSection === item.section
                    ? 'bg-white bg-opacity-20 border border-white border-opacity-30 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-white hover:bg-opacity-10 border border-white border-opacity-10'
                }
              `}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Status indicator */}
        <div className="mt-8 pt-6 border-t border-white border-opacity-10">
          <div className="bg-white bg-opacity-5 rounded-xl p-4 border border-white border-opacity-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-semibold text-green-400">ONLINE</span>
            </div>
            <p className="text-xs text-gray-400">All systems operational</p>
          </div>
        </div>
      </aside>
    </>
  )
}
