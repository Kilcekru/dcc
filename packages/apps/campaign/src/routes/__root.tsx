import * as React from 'react'
import { createRootRoute, Link, Outlet, useNavigate } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export const Route = createRootRoute({
    component: RootComponent
})

const queryClient = new QueryClient()

function RootComponent() {
    const navigate = useNavigate()

    console.log(window.location.href)

    /* React.useEffect(() => {
        navigate({ to: '/' })
    }, [navigate]) */

    return <QueryClientProvider client={queryClient}>
        <div className="w-full h-full dark dark:bg-black flex flex-col text-white">
            <Outlet />
            <TanStackRouterDevtools />
        </div>
    </QueryClientProvider>
}