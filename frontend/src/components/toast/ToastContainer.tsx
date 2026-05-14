import './Toast.css';
import type { Toast } from './useToast';

const ICONS: Record<string, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
};

interface Props {
  toasts: Toast[];
  onRemove: (id: number) => void;
}

const ToastContainer = ({ toasts, onRemove }: Props) => {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast toast-${t.type}`}
          onClick={() => onRemove(t.id)}
        >
          <span className="toast-icon">{ICONS[t.type]}</span>
          <span className="toast-message">{t.message}</span>
          <button
            className="toast-close"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(t.id);
            }}
          >
            ✕
          </button>
          <div className="toast-bar" />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;