import { useEffect, useRef } from 'react'
import { useLanguage } from '../lib/LanguageContext'
import './ConfirmDialog.css'

export default function ConfirmDialog({
  message,
  confirmLabel,
  cancelLabel,
  danger = true,
  onConfirm,
  onCancel,
}) {
  const { t } = useLanguage()
  const confirmBtnRef = useRef(null)
  const cancelBtnRef = useRef(null)

  useEffect(() => {
    confirmBtnRef.current?.focus()

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onCancel()
        return
      }
      if (e.key === 'Enter') {
        onConfirm()
        return
      }
      // Basic focus trap: only two focusable elements exist in this
      // dialog, so Tab/Shift+Tab just toggles between them instead of
      // letting focus escape to the page behind the overlay.
      if (e.key === 'Tab') {
        e.preventDefault()
        const isConfirmFocused = document.activeElement === confirmBtnRef.current
        ;(isConfirmFocused ? cancelBtnRef : confirmBtnRef).current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-describedby="confirm-message"
        onClick={(e) => e.stopPropagation()}
      >
        <p id="confirm-message" className="confirm-message">
          {message}
        </p>
        <div className="confirm-actions">
          <button ref={cancelBtnRef} className="confirm-btn confirm-btn-cancel" onClick={onCancel}>
            {cancelLabel || t('common.cancel')}
          </button>
          <button
            ref={confirmBtnRef}
            className={`confirm-btn ${danger ? 'confirm-btn-danger' : 'confirm-btn-primary'}`}
            onClick={onConfirm}
          >
            {confirmLabel || t('common.confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}
