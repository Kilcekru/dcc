import * as React from 'react'
import { createRootRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { useEffect } from 'react'
import { userConfigStore } from '../stores/user-config'
import { useStore } from '@kilcekru/dcc-lib-components'
import { loadUserConfig } from '../utils'

export const Route = createRootRoute({
  component: RootComponent
})


function RootComponent() {
  const userConfig = useStore(userConfigStore, (state) => state.config)
  const navigate = useNavigate()

  console.log(userConfig)

  useEffect(() => {
    loadUserConfig()
  }, [])

  useEffect(() => {
    if (userConfig?.setupComplete === false) {
      navigate({ to: "/onboarding" })
    }
  }, [userConfig])

  return <div className="w-full h-full dark dark:bg-black flex flex-col text-white">
    {userConfig == null ? <div>Loading...</div> : <Outlet />}
    <TanStackRouterDevtools />
  </div>
}