import React from 'react'
import styles from './Skeleton.module.css'

/**
 * Componente Skeleton para estados de carga
 * Proporciona mejor UX que spinners tradicionales
 */
export const Skeleton = ({ variant = 'text', width, height, className = '' }) => {
  const variantClass = styles[variant] || styles.text

  const style = {
    width: width || '100%',
    height: height || undefined
  }

  return (
    <div
      className={`${styles.skeleton} ${variantClass} ${className}`}
      style={style}
      aria-busy="true"
      aria-live="polite"
    />
  )
}

/**
 * Skeleton para tarjetas (cards)
 */
export const CardSkeleton = ({ count = 1 }) => {
  return (
    <div className={styles.cardSkeletonContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={styles.cardSkeleton}>
          <div className={styles.cardHeader}>
            <Skeleton variant="circle" width="40px" height="40px" />
            <div className={styles.cardHeaderText}>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" />
            </div>
          </div>
          <div className={styles.cardBody}>
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="90%" />
            <Skeleton variant="text" width="70%" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton para listas
 */
export const ListSkeleton = ({ count = 5 }) => {
  return (
    <div className={styles.listSkeletonContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={styles.listItem}>
          <Skeleton variant="circle" width="32px" height="32px" />
          <div className={styles.listItemContent}>
            <Skeleton variant="text" width="70%" />
            <Skeleton variant="text" width="50%" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton para tabla
 */
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className={styles.tableSkeletonContainer}>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className={styles.tableRow}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className={styles.tableCell}>
              <Skeleton variant="text" width="80%" />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default Skeleton
