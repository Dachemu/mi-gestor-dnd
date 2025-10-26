/**
 * Servicio de Compresión de Datos Avanzada
 * Implementa múltiples algoritmos de compresión para optimizar transferencias
 */

import { debug, warn } from '../utils/logger'

class DataCompression {
  constructor() {
    this.compressionMethods = {
      'json-minify': this.jsonMinify.bind(this),
      'lz-string': this.lzStringCompress.bind(this), // Simulación
      'gzip-sim': this.gzipSimulation.bind(this),
      'delta-encoding': this.deltaEncoding.bind(this)
    }
    
    this.decompressionMethods = {
      'json-minify': this.jsonExpand.bind(this),
      'lz-string': this.lzStringDecompress.bind(this),
      'gzip-sim': this.gzipDecompression.bind(this),
      'delta-encoding': this.deltaDecode.bind(this)
    }

    this.compressionStats = {
      totalCompressions: 0,
      totalDecompressions: 0,
      bytesSaved: 0,
      averageRatio: 0
    }

    debug('📦 DataCompression inicializado con múltiples algoritmos')
  }

  /**
   * Comprime datos usando el mejor método disponible
   * @param {any} data Datos a comprimir
   * @param {Object} options Opciones de compresión
   * @returns {Object} Datos comprimidos con metadatos
   */
  compress(data, options = {}) {
    const startTime = performance.now()
    const originalString = typeof data === 'string' ? data : JSON.stringify(data)
    const originalSize = originalString.length

    // Configuración por defecto
    const config = {
      method: 'auto', // auto, json-minify, lz-string, gzip-sim, delta-encoding
      level: 'balanced', // fast, balanced, max
      threshold: 1024, // No comprimir si es menor a 1KB
      ...options
    }

    // Si es muy pequeño, no comprimir
    if (originalSize < config.threshold) {
      return {
        compressed: false,
        data: originalString,
        originalSize,
        compressedSize: originalSize,
        ratio: 1,
        method: 'none',
        reason: 'below_threshold'
      }
    }

    // Determinar mejor método
    const method = config.method === 'auto' 
      ? this.selectBestMethod(data, config)
      : config.method

    try {
      const compressedData = this.compressionMethods[method](originalString, config)
      const compressedSize = compressedData.length
      const ratio = originalSize / compressedSize
      const compressionTime = performance.now() - startTime

      // Verificar si vale la pena la compresión
      const minImprovement = 0.1 // Al menos 10% de mejora
      if (ratio < (1 + minImprovement)) {
        debug(`📦 Compresión no eficiente (${ratio.toFixed(2)}x), usando original`)
        return {
          compressed: false,
          data: originalString,
          originalSize,
          compressedSize: originalSize,
          ratio: 1,
          method: 'none',
          reason: 'not_worth_it'
        }
      }

      // Actualizar estadísticas
      this.updateCompressionStats(originalSize, compressedSize, ratio)

      debug(`📦 Compresión exitosa: ${originalSize}B → ${compressedSize}B (${ratio.toFixed(2)}x) con ${method}`)

      return {
        compressed: true,
        data: compressedData,
        originalSize,
        compressedSize,
        ratio,
        method,
        compressionTime,
        metadata: this.generateCompressionMetadata(data, method)
      }

    } catch (error) {
      warn(`📦 Error en compresión con ${method}:`, error.message)
      return {
        compressed: false,
        data: originalString,
        originalSize,
        compressedSize: originalSize,
        ratio: 1,
        method: 'none',
        error: error.message
      }
    }
  }

  /**
   * Descomprime datos comprimidos
   * @param {Object} compressedData Datos comprimidos con metadatos
   * @returns {any} Datos originales
   */
  decompress(compressedData) {
    if (!compressedData.compressed) {
      return typeof compressedData.data === 'string' 
        ? compressedData.data
        : JSON.parse(compressedData.data)
    }

    const startTime = performance.now()

    try {
      const decompressedString = this.decompressionMethods[compressedData.method](
        compressedData.data,
        compressedData.metadata || {}
      )

      const decompressionTime = performance.now() - startTime
      this.compressionStats.totalDecompressions++

      debug(`📦 Descompresión exitosa: ${compressedData.method} en ${decompressionTime.toFixed(2)}ms`)

      // Intentar parsear como JSON si es posible
      try {
        return JSON.parse(decompressedString)
      } catch {
        return decompressedString
      }

    } catch (error) {
      warn(`📦 Error en descompresión:`, error.message)
      throw new Error(`Error al descomprimir datos: ${error.message}`)
    }
  }

  /**
   * Selecciona el mejor método de compresión automáticamente
   */
  selectBestMethod(data, config) {
    const dataString = typeof data === 'string' ? data : JSON.stringify(data)
    const size = dataString.length

    // Estrategia basada en tamaño y tipo de datos
    if (size < 10 * 1024) { // < 10KB
      return 'json-minify'
    } else if (size < 100 * 1024) { // < 100KB
      return this.detectDataType(data) === 'repetitive' ? 'lz-string' : 'json-minify'
    } else { // > 100KB
      return config.level === 'max' ? 'gzip-sim' : 'lz-string'
    }
  }

  /**
   * Detecta el tipo de datos para optimizar compresión
   */
  detectDataType(data) {
    if (typeof data !== 'object') return 'simple'

    const str = JSON.stringify(data)
    const uniqueChars = new Set(str).size
    const totalChars = str.length
    const repetitionRatio = 1 - (uniqueChars / totalChars)

    if (repetitionRatio > 0.7) return 'repetitive'
    if (Array.isArray(data)) return 'array'
    return 'object'
  }

  // =============================================================================
  // MÉTODOS DE COMPRESIÓN ESPECÍFICOS
  // =============================================================================

  /**
   * Compresión básica JSON - Elimina espacios y optimiza
   */
  jsonMinify(jsonString, config) {
    let data
    try {
      data = JSON.parse(jsonString)
    } catch {
      return jsonString // Si no es JSON válido, devolver original
    }

    // Optimizaciones específicas para JSON
    const optimized = this.optimizeJsonStructure(data)
    return JSON.stringify(optimized, (key, value) => {
      // Eliminar campos null/undefined
      if (value === null || value === undefined) return undefined
      
      // Acortar arrays vacíos
      if (Array.isArray(value) && value.length === 0) return undefined
      
      // Acortar objetos vacíos
      if (typeof value === 'object' && value !== null && Object.keys(value).length === 0) {
        return undefined
      }
      
      return value
    })
  }

  jsonExpand(compressedString, metadata) {
    return compressedString // JSON minificado se puede usar directamente
  }

  /**
   * Simulación de LZ-String compression (en producción usar librería real)
   */
  lzStringCompress(str, config) {
    // Implementación simplificada - en producción usar LZString.compress()
    const dictionary = new Map()
    let dictSize = 256
    const result = []
    
    // Inicializar diccionario con caracteres ASCII
    for (let i = 0; i < 256; i++) {
      dictionary.set(String.fromCharCode(i), i)
    }

    let w = ""
    for (let i = 0; i < str.length; i++) {
      const c = str[i]
      const wc = w + c
      
      if (dictionary.has(wc)) {
        w = wc
      } else {
        result.push(dictionary.get(w))
        dictionary.set(wc, dictSize++)
        w = c
      }
    }
    
    if (w) {
      result.push(dictionary.get(w))
    }

    // Convertir a string compacto
    return btoa(result.map(n => String.fromCharCode(n % 256)).join(''))
  }

  lzStringDecompress(compressedStr, metadata) {
    // Implementación simplificada de descompresión
    try {
      return atob(compressedStr)
    } catch {
      return compressedStr
    }
  }

  /**
   * Simulación de compresión GZIP
   */
  gzipSimulation(str, config) {
    // Algoritmo de compresión simple basado en patrones comunes
    let compressed = str
    
    // Reemplazar patrones comunes en JSON de D&D
    const patterns = {
      '"players":[]': '§P§',
      '"npcs":[]': '§N§',
      '"locations":[]': '§L§',
      '"quests":[]': '§Q§',
      '"objects":[]': '§O§',
      '"notes":[]': '§NO§',
      '"linkedItems":': '§LI§',
      '"lastModified":': '§LM§',
      '"createdAt":': '§CA§',
      '"description":': '§D§',
      '"name":': '§NAME§'
    }

    Object.entries(patterns).forEach(([pattern, replacement]) => {
      compressed = compressed.replaceAll(pattern, replacement)
    })

    return btoa(compressed) // Base64 como simulación final
  }

  gzipDecompression(compressedStr, metadata) {
    let decompressed = atob(compressedStr)
    
    // Restaurar patrones
    const patterns = {
      '§P§': '"players":[]',
      '§N§': '"npcs":[]',
      '§L§': '"locations":[]',
      '§Q§': '"quests":[]',
      '§O§': '"objects":[]',
      '§NO§': '"notes":[]',
      '§LI§': '"linkedItems":',
      '§LM§': '"lastModified":',
      '§CA§': '"createdAt":',
      '§D§': '"description":',
      '§NAME§': '"name":'
    }

    Object.entries(patterns).forEach(([pattern, replacement]) => {
      decompressed = decompressed.replaceAll(pattern, replacement)
    })

    return decompressed
  }

  /**
   * Delta encoding - Compresión basada en diferencias
   */
  deltaEncoding(str, config) {
    // Implementación básica de delta encoding
    const data = JSON.parse(str)
    const previousData = config.previousData ? JSON.parse(config.previousData) : {}
    
    const delta = this.createDelta(previousData, data)
    return JSON.stringify({
      type: 'delta',
      base: config.previousData ? 'provided' : 'empty',
      delta: delta
    })
  }

  deltaDecode(compressedStr, metadata) {
    const deltaData = JSON.parse(compressedStr)
    if (deltaData.type !== 'delta') {
      return compressedStr
    }

    // En una implementación real, necesitaríamos la base
    return JSON.stringify(deltaData.delta)
  }

  // =============================================================================
  // OPTIMIZACIONES ESPECÍFICAS
  // =============================================================================

  /**
   * Optimiza estructura JSON para mejor compresión
   */
  optimizeJsonStructure(data) {
    if (typeof data !== 'object' || data === null) return data

    if (Array.isArray(data)) {
      return data
        .filter(item => item !== null && item !== undefined)
        .map(item => this.optimizeJsonStructure(item))
    }

    const optimized = {}
    Object.entries(data).forEach(([key, value]) => {
      // Omitir campos vacíos o por defecto
      if (this.shouldIncludeField(key, value)) {
        optimized[key] = this.optimizeJsonStructure(value)
      }
    })

    return optimized
  }

  /**
   * Determina si un campo debe incluirse en la versión optimizada
   */
  shouldIncludeField(key, value) {
    // Omitir valores null/undefined
    if (value === null || value === undefined) return false
    
    // Omitir arrays vacíos
    if (Array.isArray(value) && value.length === 0) return false
    
    // Omitir objetos vacíos
    if (typeof value === 'object' && value !== null && Object.keys(value).length === 0) return false
    
    // Omitir strings vacíos en campos opcionales
    if (typeof value === 'string' && value === '' && this.isOptionalField(key)) return false
    
    return true
  }

  /**
   * Identifica campos opcionales que pueden omitirse si están vacíos
   */
  isOptionalField(key) {
    const optionalFields = [
      'description', 'notes', 'content', 'setting', 'theme', 
      'rules', 'background', 'personality', 'goals'
    ]
    return optionalFields.includes(key)
  }

  /**
   * Crea un delta entre dos objetos
   */
  createDelta(oldData, newData) {
    const delta = {}
    
    // Campos añadidos o modificados
    Object.entries(newData).forEach(([key, value]) => {
      if (JSON.stringify(oldData[key]) !== JSON.stringify(value)) {
        delta[key] = value
      }
    })

    // Campos eliminados
    Object.keys(oldData).forEach(key => {
      if (!(key in newData)) {
        delta[key] = { __deleted: true }
      }
    })

    return delta
  }

  /**
   * Genera metadatos de compresión
   */
  generateCompressionMetadata(data, method) {
    const metadata = {
      timestamp: new Date().toISOString(),
      method,
      dataType: this.detectDataType(data)
    }

    // Metadatos específicos por método
    if (method === 'delta-encoding') {
      metadata.baseRequired = true
    }

    return metadata
  }

  /**
   * Actualiza estadísticas de compresión
   */
  updateCompressionStats(originalSize, compressedSize, ratio) {
    this.compressionStats.totalCompressions++
    this.compressionStats.bytesSaved += (originalSize - compressedSize)
    
    // Calcular ratio promedio
    this.compressionStats.averageRatio = 
      (this.compressionStats.averageRatio * (this.compressionStats.totalCompressions - 1) + ratio) / 
      this.compressionStats.totalCompressions
  }

  /**
   * Comprime múltiples archivos como batch
   */
  async compressBatch(dataArray, options = {}) {
    const results = []
    let totalOriginalSize = 0
    let totalCompressedSize = 0

    for (let i = 0; i < dataArray.length; i++) {
      const data = dataArray[i]
      const result = this.compress(data, {
        ...options,
        batchIndex: i,
        batchTotal: dataArray.length
      })

      results.push(result)
      totalOriginalSize += result.originalSize
      totalCompressedSize += result.compressedSize

      // Permitir breathing room para UI
      if (i > 0 && i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 1))
      }
    }

    const overallRatio = totalOriginalSize > 0 ? totalOriginalSize / totalCompressedSize : 1

    debug(`📦 Batch compresión completada: ${dataArray.length} archivos, ${overallRatio.toFixed(2)}x ratio`)

    return {
      results,
      summary: {
        totalFiles: dataArray.length,
        totalOriginalSize,
        totalCompressedSize,
        totalBytesSaved: totalOriginalSize - totalCompressedSize,
        overallRatio,
        successfulCompressions: results.filter(r => r.compressed).length
      }
    }
  }

  /**
   * Obtiene estadísticas del servicio
   */
  getStats() {
    return {
      ...this.compressionStats,
      availableMethods: Object.keys(this.compressionMethods),
      memoryUsage: process.memoryUsage ? process.memoryUsage().heapUsed : 0
    }
  }

  /**
   * Reinicia estadísticas
   */
  resetStats() {
    this.compressionStats = {
      totalCompressions: 0,
      totalDecompressions: 0,
      bytesSaved: 0,
      averageRatio: 0
    }
    debug('📦 Estadísticas de compresión reiniciadas')
  }
}

// Exportar instancia singleton
export const dataCompression = new DataCompression()
export default dataCompression