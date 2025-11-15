import React from 'react'

export default function Toggle({ options = [], value, onChange }) {
  return (
    <div className="inline-flex bg-gray-100 rounded-full p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={
            'px-4 py-2 rounded-full text-sm font-medium transition-all ' +
            (value === opt.value
              ? 'bg-white shadow text-gray-900'
              : 'text-gray-600 hover:text-gray-900')
          }
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
