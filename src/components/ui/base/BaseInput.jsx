import React, { forwardRef } from 'react'
import styles from './BaseInput.module.css'

/**
 * BaseInput - Componente base reutilizable para todos los inputs
 * 
 * Variantes:
 * - text: Input de texto básico
 * - search: Input de búsqueda con icono
 * - textarea: Área de texto multilínea
 * - select: Selector dropdown
 * - password: Input de contraseña
 * - email: Input de email
 * - number: Input numérico
 * 
 * Tamaños:
 * - sm: Pequeño
 * - md: Mediano (default)
 * - lg: Grande
 * 
 * @param {Object} props
 * @param {'text'|'search'|'textarea'|'select'|'password'|'email'|'number'} props.variant
 * @param {'sm'|'md'|'lg'} props.size
 * @param {React.ReactNode} props.icon - Icono opcional (para search)
 * @param {'left'|'right'} props.iconPosition
 * @param {string} props.placeholder
 * @param {string} props.value
 * @param {Function} props.onChange
 * @param {Function} props.onFocus
 * @param {Function} props.onBlur
 * @param {string|React.ReactNode} props.error - Mensaje de error
 * @param {string} props.label - Etiqueta del campo
 * @param {boolean} props.required
 * @param {boolean} props.disabled
 * @param {boolean} props.fullWidth
 * @param {Array} props.options - Para variant="select"
 * @param {string} props.className - Clases adicionales
 */
const BaseInput = forwardRef(({
  variant = 'text',
  size = 'md',
  icon = null,
  iconPosition = 'left',
  placeholder = '',
  value = '',
  onChange = () => {},
  onFocus = () => {},
  onBlur = () => {},
  error = null,
  label = '',
  required = false,
  disabled = false,
  fullWidth = false,
  options = [],
  className = '',
  rows = 4, // Para textarea
  ...props
}, ref) => {
  const containerClasses = [
    styles.inputContainer,
    styles[size],
    error && styles.hasError,
    disabled && styles.disabled,
    fullWidth && styles.fullWidth,
    className
  ].filter(Boolean).join(' ')

  const inputClasses = [
    styles.baseInput,
    styles[variant],
    icon && styles.hasIcon,
    icon && iconPosition === 'right' && styles.iconRight
  ].filter(Boolean).join(' ')

  const renderIcon = () => {
    if (!icon) return null
    
    return (
      <div className={`${styles.iconWrapper} ${styles[`icon${iconPosition.charAt(0).toUpperCase() + iconPosition.slice(1)}`]}`}>
        {icon}
      </div>
    )
  }

  const renderInput = () => {
    const commonProps = {
      ref,
      className: inputClasses,
      placeholder,
      value,
      onChange,
      onFocus,
      onBlur,
      disabled,
      required,
      'aria-invalid': !!error,
      'aria-describedby': error ? `${props.id || 'input'}-error` : undefined,
      ...props
    }

    switch (variant) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={rows}
          />
        )
      
      case 'select':
        return (
          <select {...commonProps}>
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option, index) => (
              <option 
                key={option.value || index} 
                value={option.value || option}
              >
                {option.label || option}
              </option>
            ))}
          </select>
        )
      
      case 'search':
        return (
          <input
            {...commonProps}
            type="text"
            autoComplete="off"
            spellCheck="false"
          />
        )
      
      default:
        return (
          <input
            {...commonProps}
            type={variant}
          />
        )
    }
  }

  return (
    <div className={containerClasses}>
      {label && (
        <label className={styles.label} htmlFor={props.id}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      
      <div className={styles.inputWrapper}>
        {icon && iconPosition === 'left' && renderIcon()}
        {renderInput()}
        {icon && iconPosition === 'right' && renderIcon()}
      </div>
      
      {error && (
        <div 
          className={styles.errorMessage}
          id={`${props.id || 'input'}-error`}
          role="alert"
        >
          {error}
        </div>
      )}
    </div>
  )
})

BaseInput.displayName = 'BaseInput'

export default BaseInput