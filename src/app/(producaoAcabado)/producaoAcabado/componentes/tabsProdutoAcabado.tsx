'use client'
import React from 'react'
import { usePathname } from 'next/navigation';

const TabsProdutoAcabado = () => {
  const pathname = usePathname()

  const tabs = [
      { name: "Transferência", href: "/producaoAcabado", current: pathname.endsWith('/producaoAcabado')},
      { name: "Rotulagem", href: "/producaoAcabado/rotulagem", current: pathname.endsWith('/producaoAcabado/rotulagem') },
    ];

  return (
    <div className='m-2'>
    <div className="sm:hidden">
      <label htmlFor="tabs" className="sr-only">
        Select a tab
      </label>
      <select
        id="tabs"
        name="tabs"
        defaultValue={tabs.find((tab) => tab.current)?.name}
        >
        {tabs.map((tab) => (
          <option key={tab.name}>{tab.name}</option>
        ))}
      </select>
    </div>
    <div className="hidden sm:block">
      <nav aria-label="Tabs" className="flex space-x-4">
        {tabs.map((tab) => (
          <a
            key={tab.name}
            href={tab.href}
            aria-current={tab.current ? "page" : undefined}
            className={
              tab.current
                ? `rounded-md px-3 py-2 text-sm font-medium bg-lime-500 text-white`
                : `text-black hover:text-gray-700
          rounded-md px-3 py-2 text-sm font-medium`
            }
          >
            {tab.name}
          </a>
        ))}
      </nav>
    </div>
  </div>
  )
}

export default TabsProdutoAcabado