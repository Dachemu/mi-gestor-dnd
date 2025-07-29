import { renderHook, act } from '@testing-library/react'
import { useCRUD } from '../useCRUD.jsx'

// Mock dependencies
jest.mock('../../services/storage', () => ({
  generateId: () => 'test-id-123'
}))

jest.mock('../useNotification.jsx', () => ({
  useNotification: () => ({
    showNotification: jest.fn(),
    NotificationComponent: () => null
  })
}))

describe('useCRUD Hook', () => {
  const mockInitialData = [
    { id: '1', name: 'Test Item 1', createdAt: '2023-01-01' },
    { id: '2', name: 'Test Item 2', createdAt: '2023-01-02' }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with provided data', () => {
    const { result } = renderHook(() => useCRUD(mockInitialData, 'test'))
    
    expect(result.current.items).toEqual(mockInitialData)
    expect(result.current.isEmpty).toBe(false)
    expect(result.current.showForm).toBe(false)
    expect(result.current.editingItem).toBe(null)
    expect(result.current.selectedItem).toBe(null)
  })

  it('should handle empty initial data', () => {
    const { result } = renderHook(() => useCRUD())
    
    expect(result.current.items).toEqual([])
    expect(result.current.isEmpty).toBe(true)
  })

  it('should create new item', () => {
    const { result } = renderHook(() => useCRUD([], 'test'))
    
    act(() => {
      const newItem = result.current.handleSave({ name: 'New Item' })
      expect(newItem.id).toBe('test-id-123')
      expect(newItem.name).toBe('New Item')
      expect(newItem.linkedItems).toBeDefined()
    })
    
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].name).toBe('New Item')
  })

  it('should edit existing item', () => {
    const { result } = renderHook(() => useCRUD(mockInitialData, 'test'))
    
    act(() => {
      result.current.openEditForm(mockInitialData[0])
    })
    
    expect(result.current.editingItem).toEqual(mockInitialData[0])
    expect(result.current.showForm).toBe(true)
    
    act(() => {
      result.current.handleSave({ name: 'Updated Item' })
    })
    
    expect(result.current.items[0].name).toBe('Updated Item')
    expect(result.current.items[0].id).toBe('1')
    expect(result.current.showForm).toBe(false)
    expect(result.current.editingItem).toBe(null)
  })

  it('should delete item', () => {
    // Mock window.confirm
    const originalConfirm = window.confirm
    window.confirm = jest.fn(() => true)
    
    const { result } = renderHook(() => useCRUD(mockInitialData, 'test'))
    
    act(() => {
      result.current.handleDelete('1', 'Test Item 1')
    })
    
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].id).toBe('2')
    
    window.confirm = originalConfirm
  })

  it('should not delete item if user cancels', () => {
    const originalConfirm = window.confirm
    window.confirm = jest.fn(() => false)
    
    const { result } = renderHook(() => useCRUD(mockInitialData, 'test'))
    
    act(() => {
      result.current.handleDelete('1', 'Test Item 1')
    })
    
    expect(result.current.items).toHaveLength(2)
    
    window.confirm = originalConfirm
  })

  it('should select and deselect items', () => {
    const { result } = renderHook(() => useCRUD(mockInitialData, 'test'))
    
    act(() => {
      result.current.selectItem(mockInitialData[0])
    })
    
    expect(result.current.selectedItem).toEqual(mockInitialData[0])
    
    act(() => {
      result.current.closeDetails()
    })
    
    expect(result.current.selectedItem).toBe(null)
  })

  it('should handle form operations', () => {
    const { result } = renderHook(() => useCRUD(mockInitialData, 'test'))
    
    act(() => {
      result.current.openCreateForm()
    })
    
    expect(result.current.showForm).toBe(true)
    expect(result.current.editingItem).toBe(null)
    
    act(() => {
      result.current.closeForm()
    })
    
    expect(result.current.showForm).toBe(false)
  })

  it('should ensure linkedItems exists on new items', () => {
    const { result } = renderHook(() => useCRUD([], 'test'))
    
    act(() => {
      result.current.handleSave({ name: 'Test Item' })
    })
    
    const newItem = result.current.items[0]
    expect(newItem.linkedItems).toEqual({
      locations: [],
      players: [],
      npcs: [],
      quests: [],
      objects: [],
      notes: []
    })
  })

  it('should update items when initialData changes', () => {
    const { result, rerender } = renderHook(
      ({ data }) => useCRUD(data, 'test'),
      { initialProps: { data: mockInitialData } }
    )
    
    expect(result.current.items).toEqual(mockInitialData)
    
    const newData = [...mockInitialData, { id: '3', name: 'New Item', createdAt: '2023-01-03' }]
    
    rerender({ data: newData })
    
    expect(result.current.items).toEqual(newData)
  })
})