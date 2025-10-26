import React, { useState } from 'react'
import { AlertTriangle, Clock, Cloud, HardDrive, ChevronDown, ChevronRight, Users, MapPin, Scroll, FileText } from 'lucide-react'
import BaseModal from '../ui/base/BaseModal'
import BaseButton from '../ui/base/BaseButton'
import styles from './ConflictResolutionModal.module.css'

export function ConflictResolutionModal({ 
  isOpen, 
  onClose, 
  conflicts = [], 
  onResolveConflict,
  isLoading = false 
}) {
  const [expandedConflicts, setExpandedConflicts] = useState(new Set())
  
  if (!isOpen || conflicts.length === 0) return null

  const toggleExpanded = (conflictName) => {
    const newExpanded = new Set(expandedConflicts)
    if (newExpanded.has(conflictName)) {
      newExpanded.delete(conflictName)
    } else {
      newExpanded.add(conflictName)
    }
    setExpandedConflicts(newExpanded)
  }

  const handleResolveAll = async (useDriveVersion) => {
    for (const conflict of conflicts) {
      await onResolveConflict(conflict.name, useDriveVersion)
    }
    onClose()
  }

  const handleResolveIndividual = async (conflictName, useDriveVersion) => {
    await onResolveConflict(conflictName, useDriveVersion)
  }

  const formatDate = (date) => {
    if (!date) return 'Fecha desconocida'
    return new Date(date).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getSeverityBadge = (severity) => {
    if (!severity) return null
    
    const severityClass = {
      high: styles.severityHigh,
      medium: styles.severityMedium,
      low: styles.severityLow
    }[severity] || styles.severityMedium

    return (
      <span className={`${styles.severityBadge} ${severityClass}`}>
        {severity.toUpperCase()}
      </span>
    )
  }

  const renderEntityComparison = (conflict) => {
    if (!conflict.localData || !conflict.remoteData) return null

    const sections = [
      { key: 'players', icon: Users, label: 'Jugadores' },
      { key: 'npcs', icon: Users, label: 'NPCs' },
      { key: 'locations', icon: MapPin, label: 'Ubicaciones' },
      { key: 'quests', icon: Scroll, label: 'Misiones' },
      { key: 'objects', icon: FileText, label: 'Objetos' },
      { key: 'notes', icon: FileText, label: 'Notas' }
    ]

    return (
      <div className={styles.entityComparison}>
        <h5>Comparación de Contenido:</h5>
        <div className={styles.comparisonGrid}>
          {sections.map(section => {
            const localCount = (conflict.localData[section.key] || []).length
            const remoteCount = (conflict.remoteData[section.key] || []).length
            const Icon = section.icon
            const isDifferent = localCount !== remoteCount

            return (
              <div key={section.key} className={`${styles.comparisonRow} ${isDifferent ? styles.different : ''}`}>
                <div className={styles.sectionLabel}>
                  <Icon size={16} />
                  <span>{section.label}</span>
                </div>
                <div className={styles.counts}>
                  <span className={styles.localCount}>{localCount}</span>
                  <span className={styles.separator}>vs</span>
                  <span className={styles.remoteCount}>{remoteCount}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderConflictDetails = (conflict) => {
    if (!conflict.conflicts) return null

    return (
      <div className={styles.conflictDetails}>
        <h5>Detalles de Conflictos:</h5>
        <ul className={styles.conflictDetailsList}>
          {conflict.conflicts.map((detail, index) => (
            <li key={index} className={styles.conflictDetailItem}>
              <strong>{detail.type}:</strong> {detail.message}
              {detail.differences && detail.differences.length > 0 && (
                <span className={styles.differenceCount}>
                  ({detail.differences.length} diferencias)
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Resolver Conflictos de Sincronización">
      <div className={styles.modalContent}>
        <div className={styles.header}>
          <AlertTriangle className={styles.warningIcon} />
          <div className={styles.headerText}>
            <h3>Conflictos Detectados</h3>
            <p>
              Se han encontrado {conflicts.length} campaña{conflicts.length > 1 ? 's' : ''} con 
              diferencias entre la versión local y la de Google Drive.
            </p>
          </div>
        </div>

        <div className={styles.conflictsList}>
          {conflicts.map((conflict, _index) => {
            const isExpanded = expandedConflicts.has(conflict.name || conflict.campaignName)
            const conflictName = conflict.name || conflict.campaignName
            const localModified = conflict.localModified || conflict.details?.localModified
            const remoteModified = conflict.driveModified || conflict.details?.remoteModified

            return (
              <div key={conflictName} className={styles.conflictItem}>
                <div className={styles.conflictHeader}>
                  <div className={styles.conflictHeaderContent}>
                    <div className={styles.conflictTitle}>
                      <h4 className={styles.campaignName}>{conflictName}</h4>
                      {getSeverityBadge(conflict.severity)}
                    </div>
                    {conflict.type && (
                      <div className={styles.conflictType}>
                        Tipo: <span className={styles.typeTag}>{conflict.type}</span>
                      </div>
                    )}
                  </div>
                  
                  <BaseButton
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(conflictName)}
                    className={styles.expandButton}
                  >
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    {isExpanded ? 'Ocultar' : 'Detalles'}
                  </BaseButton>
                </div>

                <div className={styles.versionsComparison}>
                  <div className={styles.versionInfo}>
                    <div className={styles.versionHeader}>
                      <HardDrive className={styles.versionIcon} />
                      <span className={styles.versionLabel}>Versión Local</span>
                    </div>
                    <div className={styles.versionDetails}>
                      <div className={styles.timestamp}>
                        <Clock className={styles.clockIcon} />
                        {formatDate(localModified)}
                      </div>
                      {conflict.localData?.description && (
                        <div className={styles.description}>
                          "{conflict.localData.description.substring(0, 50)}..."
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.versionInfo}>
                    <div className={styles.versionHeader}>
                      <Cloud className={styles.versionIcon} />
                      <span className={styles.versionLabel}>Versión en Drive</span>
                    </div>
                    <div className={styles.versionDetails}>
                      <div className={styles.timestamp}>
                        <Clock className={styles.clockIcon} />
                        {formatDate(remoteModified)}
                      </div>
                      {conflict.remoteData?.description && (
                        <div className={styles.description}>
                          "{conflict.remoteData.description.substring(0, 50)}..."
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className={styles.expandedDetails}>
                    {conflict.summary && (
                      <div className={styles.conflictSummary}>
                        <h5>Resumen del Conflicto:</h5>
                        <pre className={styles.summaryText}>{conflict.summary}</pre>
                      </div>
                    )}
                    
                    {renderEntityComparison(conflict)}
                    {renderConflictDetails(conflict)}

                    {conflict.suggestion && (
                      <div className={styles.suggestion}>
                        <h5>Sugerencia:</h5>
                        <p>{conflict.suggestion === 'merge_auto' ? '✅ Puede resolverse automáticamente' : 
                            conflict.suggestion === 'manual_review' ? '⚠️ Requiere revisión manual' : 
                            conflict.suggestion === 'choose_version' ? '🔄 Elige la versión a conservar' :
                            '📝 Merge manual recomendado'}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className={styles.conflictActions}>
                  <BaseButton
                    onClick={() => handleResolveIndividual(conflictName, false)}
                    variant="outline"
                    disabled={isLoading}
                    size="sm"
                  >
                    <HardDrive className={styles.buttonIcon} />
                    Usar Local
                  </BaseButton>
                  
                  <BaseButton
                    onClick={() => handleResolveIndividual(conflictName, true)}
                    variant="primary"
                    disabled={isLoading}
                    size="sm"
                  >
                    <Cloud className={styles.buttonIcon} />
                    Usar Drive
                  </BaseButton>
                </div>
              </div>
            )
          })}
        </div>

        <div className={styles.bulkActions}>
          <h4>Resolver Todos los Conflictos</h4>
          <p className={styles.bulkDescription}>
            Aplicar la misma resolución a todas las campañas con conflictos.
          </p>
          
          <div className={styles.bulkButtons}>
            <BaseButton
              onClick={() => handleResolveAll(false)}
              variant="outline"
              disabled={isLoading}
              className={styles.bulkButton}
            >
              <HardDrive className={styles.buttonIcon} />
              Usar Todas las Locales
            </BaseButton>
            
            <BaseButton
              onClick={() => handleResolveAll(true)}
              variant="primary"
              disabled={isLoading}
              className={styles.bulkButton}
            >
              <Cloud className={styles.buttonIcon} />
              Usar Todas las de Drive
            </BaseButton>
          </div>
        </div>

        <div className={styles.footer}>
          <BaseButton
            onClick={onClose}
            variant="ghost"
            disabled={isLoading}
          >
            Cancelar
          </BaseButton>
        </div>
      </div>
    </BaseModal>
  )
}