import Swal from 'sweetalert2';

// Custom SweetAlert configuration with dark theme matching the app
const createSwal = (options = {}) => {
  return Swal.mixin({
    background: 'rgba(0, 0, 0, 0.9)',
    backdrop: 'rgba(0, 0, 0, 0.8)',
    color: '#ffffff',
    customClass: {
      popup: 'swal-dark-popup',
      title: 'swal-dark-title',
      content: 'swal-dark-content',
      confirmButton: 'swal-dark-confirm',
      cancelButton: 'swal-dark-cancel',
      denyButton: 'swal-dark-deny'
    },
    ...options
  });
};

// Success alert
export const showSuccess = (title, text = '') => {
  return createSwal().fire({
    icon: 'success',
    title,
    text,
    confirmButtonText: 'Great!',
    confirmButtonColor: '#10b981', // green-500
    timer: 3000,
    timerProgressBar: true
  });
};

// Error alert
export const showError = (title, text = '') => {
  return createSwal().fire({
    icon: 'error',
    title,
    text,
    confirmButtonText: 'Try Again',
    confirmButtonColor: '#ef4444', // red-500
  });
};

// Warning alert
export const showWarning = (title, text = '') => {
  return createSwal().fire({
    icon: 'warning',
    title,
    text,
    confirmButtonText: 'OK',
    confirmButtonColor: '#f59e0b', // yellow-500
  });
};

// Info alert
export const showInfo = (title, text = '') => {
  return createSwal().fire({
    icon: 'info',
    title,
    text,
    confirmButtonText: 'Got it',
    confirmButtonColor: '#3b82f6', // blue-500
  });
};

// Confirmation dialog
export const showConfirm = async (title, text = '', confirmText = 'Yes', cancelText = 'No', icon = 'question') => {
  const result = await createSwal().fire({
    icon: icon,
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: icon === 'error' ? '#ef4444' : '#3b82f6', // red-500 for error, blue-500 for others
    cancelButtonColor: '#6b7280', // gray-500
  });
  
  return result.isConfirmed;
};

// Loading alert
export const showLoading = (title = 'Loading...') => {
  return createSwal().fire({
    title,
    allowOutsideClick: false,
    allowEscapeKey: false,
    allowEnterKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
};

// Close loading
export const closeLoading = () => {
  Swal.close();
};

// Toast notification
export const showToast = (icon, title) => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: 'rgba(0, 0, 0, 0.9)',
    color: '#ffffff',
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });

  return Toast.fire({
    icon,
    title
  });
};

export default createSwal;
