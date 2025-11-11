import toastBase from 'react-hot-toast';

const baseOptions = {
  duration: 3000,
};

export const toast = {
  success: (message, options = {}) => toastBase.success(message, { ...baseOptions, ...options }),
  error: (message, options = {}) => toastBase.error(message, { ...baseOptions, ...options }),
  info: (message, options = {}) => toastBase(message, { icon: 'ℹ️', ...baseOptions, ...options }),
  loading: (message, options = {}) => toastBase.loading(message, { ...options }),
  dismiss: (id) => toastBase.dismiss(id),
};

export default toast;


