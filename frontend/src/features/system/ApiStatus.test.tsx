import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiStatus } from './ApiStatus'

describe('ApiStatus', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows healthy when the readiness endpoint returns 200', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('Healthy', { status: 200 })))

    render(<ApiStatus />)

    expect(await screen.findByText('Healthy')).toBeInTheDocument()
  })

  it('shows unavailable when the readiness endpoint returns 503', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('Unhealthy', { status: 503 })))

    render(<ApiStatus />)

    expect(await screen.findByText('Unavailable')).toBeInTheDocument()
  })

  it('shows unavailable when the API cannot be reached', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    render(<ApiStatus />)

    expect(await screen.findByText('Unavailable')).toBeInTheDocument()
  })
})
