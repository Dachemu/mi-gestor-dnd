import { renderHook, act } from '@testing-library/react'
import { debounce, useDebounce } from '../debounce.js'

describe('debounce utility', () => {
  beforeEach(() => {
    jest.clearAllTimers()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('debounce function', () => {
    it('should delay function execution', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn('test')
      expect(mockFn).not.toHaveBeenCalled()

      act(() => {
        jest.advanceTimersByTime(100)
      })

      expect(mockFn).toHaveBeenCalledWith('test')
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should cancel previous executions', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn('first')
      debouncedFn('second')
      debouncedFn('third')

      act(() => {
        jest.advanceTimersByTime(100)
      })

      expect(mockFn).toHaveBeenCalledWith('third')
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should preserve context and arguments', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn('arg1', 'arg2', 'arg3')

      act(() => {
        jest.advanceTimersByTime(100)
      })

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 'arg3')
    })

    it('should handle multiple rapid calls', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)

      // Rapid calls within delay period
      debouncedFn('call1')
      
      act(() => {
        jest.advanceTimersByTime(50)
      })
      
      debouncedFn('call2')
      
      act(() => {
        jest.advanceTimersByTime(50)
      })
      
      debouncedFn('call3')

      // Only the last call should execute
      act(() => {
        jest.advanceTimersByTime(100)
      })

      expect(mockFn).toHaveBeenCalledWith('call3')
      expect(mockFn).toHaveBeenCalledTimes(1)
    })
  })

  describe('useDebounce hook', () => {
    it('should return initial value immediately', () => {
      const { result } = renderHook(() => useDebounce('initial', 100))
      
      expect(result.current).toBe('initial')
    })

    it('should debounce value changes', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 100 } }
      )

      expect(result.current).toBe('initial')

      // Change value
      rerender({ value: 'updated', delay: 100 })
      
      // Value should still be old until delay passes
      expect(result.current).toBe('initial')

      // Advance timers
      act(() => {
        jest.advanceTimersByTime(100)
      })

      expect(result.current).toBe('updated')
    })

    it('should cancel previous updates on rapid changes', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 100 } }
      )

      // Rapid changes
      rerender({ value: 'first', delay: 100 })
      
      act(() => {
        jest.advanceTimersByTime(50)
      })
      
      rerender({ value: 'second', delay: 100 })
      
      act(() => {
        jest.advanceTimersByTime(50)
      })
      
      rerender({ value: 'final', delay: 100 })

      // Advance full delay
      act(() => {
        jest.advanceTimersByTime(100)
      })

      // Should only update to final value
      expect(result.current).toBe('final')
    })

    it('should handle delay changes', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 100 } }
      )

      rerender({ value: 'updated', delay: 200 })

      act(() => {
        jest.advanceTimersByTime(100)
      })

      // Should still be old value because delay was increased
      expect(result.current).toBe('initial')

      act(() => {
        jest.advanceTimersByTime(100)
      })

      // Now should be updated
      expect(result.current).toBe('updated')
    })

    it('should cleanup timeouts on unmount', () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')
      
      const { unmount, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 100 } }
      )

      rerender({ value: 'updated', delay: 100 })
      
      unmount()

      // Should have called clearTimeout on unmount
      expect(clearTimeoutSpy).toHaveBeenCalled()
      
      clearTimeoutSpy.mockRestore()
    })

    it('should handle zero delay', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 0 } }
      )

      rerender({ value: 'updated', delay: 0 })

      act(() => {
        jest.advanceTimersByTime(0)
      })

      expect(result.current).toBe('updated')
    })
  })
})