import React, { useEffect } from 'react';

const NotificationToast = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 8000); // 8 seconds

    return () => clearTimeout(timer);
  }, [onClose, message]);

  if (!message) return null;

  return (
    <>
      <div className="toast-notification">
        <div className="toast-content">
          <div className="toast-icon">
            <i className="fa-solid fa-bell"></i>
          </div>
          <div className="toast-message">
            <div className="toast-title">Thông báo mới</div>
            <div className="toast-text">{message}</div>
          </div>
        </div>
        <button className="toast-close" onClick={onClose}>
          <i className="fa-solid fa-times"></i>
        </button>
      </div>

      <style>{`
        .toast-notification {
          position: fixed;
          bottom: 24px;
          right: 24px;
          min-width: 320px;
          max-width: 420px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          z-index: 10000;
          animation: slideInRight 0.3s ease-out, fadeIn 0.3s ease-out;
        }

        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .toast-content {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          flex: 1;
        }

        .toast-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .toast-icon i {
          color: white;
          font-size: 18px;
        }

        .toast-message {
          flex: 1;
          padding-top: 2px;
        }

        .toast-title {
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 4px;
        }

        .toast-text {
          font-size: 13px;
          color: #64748b;
          line-height: 1.5;
        }

        .toast-close {
          background: transparent;
          border: none;
          width: 28px;
          height: 28px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #94a3b8;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .toast-close:hover {
          background: #f1f5f9;
          color: #475569;
        }

        .toast-close i {
          font-size: 14px;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .toast-notification {
            bottom: 16px;
            right: 16px;
            left: 16px;
            min-width: auto;
            max-width: none;
          }
        }
      `}</style>
    </>
  );
};

export default NotificationToast;