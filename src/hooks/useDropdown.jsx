import { useState, useRef, useEffect } from 'react'

/**
 * Custom hook for dropdown functionality
 * Handles open/close state and click outside behavior
 * Eliminates duplicate logic across selector components
 */
function useDropdown(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen)
  const dropdownRef = useRef(null)
  const buttonRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Toggle dropdown state
  const toggleDropdown = () => {
    setIsOpen(prev => !prev)
  }

  // Open dropdown
  const openDropdown = () => {
    setIsOpen(true)
  }

  // Close dropdown
  const closeDropdown = () => {
    setIsOpen(false)
  }

  // Handle escape key to close dropdown
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  return {
    isOpen,
    setIsOpen,
    toggleDropdown,
    openDropdown,
    closeDropdown,
    dropdownRef,
    buttonRef
  }
}

export default useDropdown