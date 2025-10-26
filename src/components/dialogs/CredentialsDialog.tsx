import React, { useState, useRef, useEffect } from 'react';
import "./CredentialDialog.css"

interface LoginData {
  shopId: string;
  password: string;
}

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LoginData) => void;
  isLoading?: boolean;
  preventEscExit?: boolean;
}

const LoginDialog: React.FC<LoginDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  preventEscExit = false,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [formData, setFormData] = useState<LoginData>({
    shopId: '',
    password: ''
  });
  const [errors, setErrors] = useState<Partial<LoginData>>({});

  // Управление открытием/закрытием диалога
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  // Обработка закрытия диалога через ESC
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e: Event) => {
      if (!preventEscExit)
        e.preventDefault();
      else
        handleClose();
    };

    dialog.addEventListener('cancel', handleCancel);

    return () => {
      dialog.removeEventListener('cancel', handleCancel);
    };
  }, [preventEscExit]);

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginData> = {};

    if (!formData.shopId.trim()) {
      newErrors.shopId = 'ID магазина обязателен';
    }

    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (formData.password.length < 4) {
      newErrors.password = 'Пароль должен быть не менее 4 символов';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof LoginData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Очищаем ошибку при вводе
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleClose = () => {
    setFormData({ shopId: '', password: '' });
    setErrors({});
    onClose();
  };

  return (
    <dialog ref={dialogRef} className="login-dialog">
      <div className="dialog-content">
        <h2>Авторизация</h2>

        <form method="dialog" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="shopId">ID магазина:</label>
            <input
              type="text"
              id="shopId"
              value={formData.shopId}
              onChange={(e) => handleInputChange('shopId', e.target.value)}
              placeholder="Введите ID магазина"
              className={errors.shopId ? 'error' : ''}
              disabled={isLoading}
              autoComplete="username"
            />
            {errors.shopId && <span className="error-message">{errors.shopId}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Пароль:</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="Введите пароль"
              className={errors.password ? 'error' : ''}
              disabled={isLoading}
              autoComplete="current-password"
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className="dialog-actions">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="cancel-button"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="submit-button"
            >
              {isLoading ? 'Вход...' : 'Войти'}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

export default LoginDialog;
