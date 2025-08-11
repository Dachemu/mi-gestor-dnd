/**
 * Utilidades de validación para formularios
 * Provee funciones de validación robustas y reutilizables
 */

/**
 * Valida si un campo requerido tiene valor
 */
export function validateRequired(value, fieldName = 'Campo') {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} es obligatorio`
  }
  return null
}

/**
 * Valida longitud mínima de texto
 */
export function validateMinLength(value, minLength, fieldName = 'Campo') {
  if (!value) return null // Se maneja en validateRequired
  if (value.toString().trim().length < minLength) {
    return `${fieldName} debe tener al menos ${minLength} caracteres`
  }
  return null
}

/**
 * Valida longitud máxima de texto
 */
export function validateMaxLength(value, maxLength, fieldName = 'Campo') {
  if (!value) return null
  if (value.toString().length > maxLength) {
    return `${fieldName} no puede exceder ${maxLength} caracteres`
  }
  return null
}

/**
 * Valida que un número esté dentro de un rango
 */
export function validateNumericRange(value, min, max, fieldName = 'Campo') {
  if (!value && value !== 0) return null
  
  const numValue = parseFloat(value)
  if (isNaN(numValue)) {
    return `${fieldName} debe ser un número válido`
  }
  
  if (min !== undefined && numValue < min) {
    return `${fieldName} debe ser mayor o igual a ${min}`
  }
  
  if (max !== undefined && numValue > max) {
    return `${fieldName} debe ser menor o igual a ${max}`
  }
  
  return null
}

/**
 * Valida que un valor esté en una lista de opciones válidas
 */
export function validateOptions(value, options, fieldName = 'Campo') {
  if (!value) return null
  if (!options.includes(value)) {
    return `${fieldName} debe ser una de las opciones válidas: ${options.join(', ')}`
  }
  return null
}

/**
 * Valida formato de email básico
 */
export function validateEmail(value, fieldName = 'Email') {
  if (!value) return null
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(value)) {
    return `${fieldName} debe tener un formato válido`
  }
  return null
}

/**
 * Valida que una fecha no sea futura (útil para fechas de nacimiento)
 */
export function validatePastDate(value, fieldName = 'Fecha') {
  if (!value) return null
  const date = new Date(value)
  if (date > new Date()) {
    return `${fieldName} no puede ser una fecha futura`
  }
  return null
}

/**
 * Ejecuta múltiples validaciones en un campo
 */
export function runValidations(value, validations) {
  for (const validation of validations) {
    const error = validation(value)
    if (error) return error
  }
  return null
}

/**
 * Valida un formulario completo usando las configuraciones del esquema
 */
export function validateForm(data, schema) {
  const errors = {}
  
  Object.entries(schema).forEach(([fieldName, fieldConfig]) => {
    const value = data[fieldName]
    const validations = []
    
    // Validación de campo requerido
    if (fieldConfig.required) {
      validations.push((val) => validateRequired(val, fieldConfig.label))
    }
    
    // Validación de longitud mínima
    if (fieldConfig.minLength) {
      validations.push((val) => validateMinLength(val, fieldConfig.minLength, fieldConfig.label))
    }
    
    // Validación de longitud máxima
    if (fieldConfig.maxLength) {
      validations.push((val) => validateMaxLength(val, fieldConfig.maxLength, fieldConfig.label))
    }
    
    // Validación de rango numérico
    if (fieldConfig.type === 'number' && (fieldConfig.min !== undefined || fieldConfig.max !== undefined)) {
      validations.push((val) => validateNumericRange(val, fieldConfig.min, fieldConfig.max, fieldConfig.label))
    }
    
    // Validación de opciones (select)
    if (fieldConfig.options) {
      validations.push((val) => validateOptions(val, fieldConfig.options, fieldConfig.label))
    }
    
    // Validación de email
    if (fieldConfig.type === 'email') {
      validations.push((val) => validateEmail(val, fieldConfig.label))
    }
    
    // Ejecutar todas las validaciones
    const error = runValidations(value, validations)
    if (error) {
      errors[fieldName] = error
    }
  })
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Validaciones personalizadas para D&D
 */

/**
 * Valida que un nivel de personaje esté en el rango D&D válido (1-20)
 */
export function validateCharacterLevel(value) {
  return validateNumericRange(value, 1, 20, 'Nivel')
}

/**
 * Valida que los puntos de vida sean positivos
 */
export function validateHitPoints(value) {
  return validateNumericRange(value, 1, 1000, 'Puntos de vida')
}

/**
 * Valida que la clase de armadura esté en un rango razonable
 */
export function validateArmorClass(value) {
  return validateNumericRange(value, 1, 30, 'Clase de armadura')
}

/**
 * Valida que la velocidad esté en un rango razonable
 */
export function validateSpeed(value) {
  return validateNumericRange(value, 0, 120, 'Velocidad')
}