import React from 'react'
import { Cloud } from 'lucide-react'
import BaseButton from '../ui/base/BaseButton'
import styles from './GoogleSyncButton.module.css'

export function SimpleSyncButton() {
  const handleClick = () => {
    console.log('Sync button clicked - coming soon!')
  }

  return (
    <div className={styles.syncContainer}>
      <BaseButton
        onClick={handleClick}
        variant="outline"
        className={styles.connectButton}
      >
        <Cloud className={styles.icon} />
        Sync con Drive (próximamente)
      </BaseButton>
    </div>
  )
}