import { renderHook, act } from '@testing-library/react'
import { useSearch } from '../useSearch.js'

// Mock debounce utility
jest.mock('../../utils/debounce', () => ({
  useDebounce: (value) => value // Return value immediately for testing
}))

describe('useSearch Hook', () => {
  const mockCampaign = {
    locations: [
      { id: '1', name: 'Taverna del Dragón', description: 'Una taverna acogedora' },
      { id: '2', name: 'Castillo Negro', description: 'Fortaleza siniestra' }
    ],
    players: [
      { id: '1', name: 'Aragorn', class: 'Guerrero', race: 'Humano' },
      { id: '2', name: 'Legolas', class: 'Explorador', race: 'Elfo' }
    ],
    npcs: [
      { id: '1', name: 'Gandalf', role: 'Mago', location: 'Taverna' },
      { id: '2', name: 'Boromir', role: 'Capitán', location: 'Castillo' }
    ],
    objects: [
      { id: '1', name: 'Espada Flamígera', type: 'Arma', description: 'Espada mágica' },
      { id: '2', name: 'Escudo de Mithril', type: 'Escudo', description: 'Protección élfica' }
    ],
    quests: [
      { id: '1', title: 'Recuperar el Anillo', description: 'Misión principal', status: 'En progreso' },
      { id: '2', title: 'Defender la Villa', description: 'Misión secundaria', status: 'Completada' }
    ],
    notes: [
      { id: '1', title: 'Notas de sesión 1', content: 'Los jugadores llegaron a la taverna' },
      { id: '2', title: 'Pistas importantes', content: 'El anillo está en las montañas' }
    ]
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with empty values', () => {
    const { result } = renderHook(() => useSearch(mockCampaign))
    
    expect(result.current.searchTerm).toBe('')
    expect(result.current.searchResults).toEqual([])
    expect(result.current.showSearchDropdown).toBe(false)
  })

  it('should return empty results for short search terms', () => {
    const { result } = renderHook(() => useSearch(mockCampaign))
    
    act(() => {
      result.current.handleSearchChange('a')
    })
    
    expect(result.current.searchResults).toEqual([])
  })

  it('should search across all entity types', () => {
    const { result } = renderHook(() => useSearch(mockCampaign))
    
    act(() => {
      result.current.handleSearchChange('Taverna')
    })
    
    const results = result.current.searchResults
    expect(results.length).toBeGreaterThan(0)
    
    // Should find location
    expect(results.some(r => r.type === 'locations' && r.name.includes('Taverna'))).toBe(true)
    // Should find NPC by location
    expect(results.some(r => r.type === 'npcs' && r.location.includes('Taverna'))).toBe(true)
  })

  it('should search players by name, class, and race', () => {
    const { result } = renderHook(() => useSearch(mockCampaign))
    
    act(() => {
      result.current.handleSearchChange('Guerrero')
    })
    
    const results = result.current.searchResults
    expect(results.some(r => r.type === 'players' && r.class === 'Guerrero')).toBe(true)
    
    act(() => {
      result.current.handleSearchChange('Elfo')
    })
    
    const elfResults = result.current.searchResults
    expect(elfResults.some(r => r.type === 'players' && r.race === 'Elfo')).toBe(true)
  })

  it('should search objects by name, type, and description', () => {
    const { result } = renderHook(() => useSearch(mockCampaign))
    
    act(() => {
      result.current.handleSearchChange('Espada')
    })
    
    const results = result.current.searchResults
    expect(results.some(r => r.type === 'objects' && r.name.includes('Espada'))).toBe(true)
    
    act(() => {
      result.current.handleSearchChange('mágica')
    })
    
    const magicResults = result.current.searchResults
    expect(magicResults.some(r => r.type === 'objects' && r.description.includes('mágica'))).toBe(true)
  })

  it('should search quests by title, description, and status', () => {
    const { result } = renderHook(() => useSearch(mockCampaign))
    
    act(() => {
      result.current.handleSearchChange('Anillo')
    })
    
    const results = result.current.searchResults
    expect(results.some(r => r.type === 'quests' && r.title.includes('Anillo'))).toBe(true)
    
    act(() => {
      result.current.handleSearchChange('Completada')
    })
    
    const statusResults = result.current.searchResults
    expect(statusResults.some(r => r.type === 'quests' && r.status === 'Completada')).toBe(true)
  })

  it('should search notes by title and content', () => {
    const { result } = renderHook(() => useSearch(mockCampaign))
    
    act(() => {
      result.current.handleSearchChange('sesión')
    })
    
    const results = result.current.searchResults
    expect(results.some(r => r.type === 'notes' && r.title.includes('sesión'))).toBe(true)
    
    act(() => {
      result.current.handleSearchChange('montañas')
    })
    
    const contentResults = result.current.searchResults
    expect(contentResults.some(r => r.type === 'notes' && r.content.includes('montañas'))).toBe(true)
  })

  it('should handle search focus and blur', () => {
    const { result } = renderHook(() => useSearch(mockCampaign))
    
    act(() => {
      result.current.handleSearchChange('test')
    })
    
    expect(result.current.showSearchDropdown).toBe(true)
    
    act(() => {
      result.current.handleSearchFocus()
    })
    
    expect(result.current.showSearchDropdown).toBe(true)
    
    // Mock blur event
    const mockEvent = {
      currentTarget: {
        contains: jest.fn(() => false)
      }
    }
    
    act(() => {
      result.current.handleSearchBlur(mockEvent)
    })
    
    // Should close after timeout
    setTimeout(() => {
      expect(result.current.showSearchDropdown).toBe(false)
    }, 250)
  })

  it('should close search', () => {
    const { result } = renderHook(() => useSearch(mockCampaign))
    
    act(() => {
      result.current.handleSearchChange('test')
    })
    
    expect(result.current.searchTerm).toBe('test')
    expect(result.current.showSearchDropdown).toBe(true)
    
    act(() => {
      result.current.closeSearch()
    })
    
    expect(result.current.searchTerm).toBe('')
    expect(result.current.showSearchDropdown).toBe(false)
  })

  it('should limit results to 10 items', () => {
    // Create campaign with many items
    const largeCampaign = {
      locations: Array.from({ length: 15 }, (_, i) => ({
        id: i.toString(),
        name: `Location ${i}`,
        description: 'test description'
      }))
    }
    
    const { result } = renderHook(() => useSearch(largeCampaign))
    
    act(() => {
      result.current.handleSearchChange('test')
    })
    
    expect(result.current.searchResults.length).toBeLessThanOrEqual(10)
  })

  it('should handle campaign without some entity types', () => {
    const incompleteCampaign = {
      locations: [{ id: '1', name: 'Test Location', description: 'test' }]
      // Missing other entity types
    }
    
    const { result } = renderHook(() => useSearch(incompleteCampaign))
    
    act(() => {
      result.current.handleSearchChange('test')
    })
    
    // Should not crash and should find the location
    expect(result.current.searchResults.length).toBe(1)
    expect(result.current.searchResults[0].type).toBe('locations')
  })
})