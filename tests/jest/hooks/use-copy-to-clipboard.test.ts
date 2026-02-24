import { renderHook, act, waitFor } from '@testing-library/react'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'

describe('useCopyToClipboard', () => {
  const originalClipboard = global.navigator.clipboard

  beforeEach(() => {
    jest.useFakeTimers()
    // Mock navigator.clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve()),
      },
      configurable: true,
      writable: true
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.useRealTimers()
    // Restore navigator.clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      configurable: true,
      writable: true
    })
  })

  it('should return initial state', () => {
    const { result } = renderHook(() => useCopyToClipboard())
    expect(result.current.isCopied).toBe(false)
    expect(typeof result.current.copyToClipboard).toBe('function')
  })

  it('should copy to clipboard and update state', async () => {
    const onCopy = jest.fn()
    const { result } = renderHook(() => useCopyToClipboard({ onCopy }))

    act(() => {
      result.current.copyToClipboard('test value')
    })

    await waitFor(() => expect(result.current.isCopied).toBe(true))
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test value')
    expect(onCopy).toHaveBeenCalled()
  })

  it('should reset isCopied after default timeout', async () => {
    const { result } = renderHook(() => useCopyToClipboard())

    act(() => {
      result.current.copyToClipboard('test value')
    })

    await waitFor(() => expect(result.current.isCopied).toBe(true))

    act(() => {
      jest.advanceTimersByTime(2000)
    })

    expect(result.current.isCopied).toBe(false)
  })

  it('should reset isCopied after custom timeout', async () => {
    const { result } = renderHook(() => useCopyToClipboard({ timeout: 500 }))

    act(() => {
      result.current.copyToClipboard('test value')
    })

    await waitFor(() => expect(result.current.isCopied).toBe(true))

    act(() => {
      jest.advanceTimersByTime(500)
    })

    expect(result.current.isCopied).toBe(false)
  })

  it('should not reset isCopied if timeout is 0', async () => {
    const { result } = renderHook(() => useCopyToClipboard({ timeout: 0 }))

    act(() => {
      result.current.copyToClipboard('test value')
    })

    await waitFor(() => expect(result.current.isCopied).toBe(true))

    act(() => {
      jest.advanceTimersByTime(10000)
    })

    expect(result.current.isCopied).toBe(true)
  })

  it('should not copy if value is empty', async () => {
    const { result } = renderHook(() => useCopyToClipboard())

    act(() => {
      result.current.copyToClipboard('')
    })

    expect(navigator.clipboard.writeText).not.toHaveBeenCalled()
    expect(result.current.isCopied).toBe(false)
  })

  it('should not copy if navigator.clipboard is missing', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      configurable: true,
      writable: true
    })
    const { result } = renderHook(() => useCopyToClipboard())

    act(() => {
      result.current.copyToClipboard('test')
    })

    expect(result.current.isCopied).toBe(false)
  })

  it('should handle copy failure', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    ;(navigator.clipboard.writeText as jest.Mock).mockImplementation(() =>
      Promise.reject(new Error('Failed to copy'))
    )

    const { result } = renderHook(() => useCopyToClipboard())

    act(() => {
      result.current.copyToClipboard('test')
    })

    // Wait for the failure to be logged
    await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith(new Error('Failed to copy')))
    expect(result.current.isCopied).toBe(false)

    consoleSpy.mockRestore()
  })
})
