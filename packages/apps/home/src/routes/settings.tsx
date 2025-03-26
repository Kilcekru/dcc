import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'

export const Route = createFileRoute('/settings')({
    component: Settings,
})

function Settings() {
    return <div className="p-2">Hello from Settings!</div>
}