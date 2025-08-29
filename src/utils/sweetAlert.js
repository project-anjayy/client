import Swal from 'sweetalert2';

// Custom SweetAlert configuration with dark theme matching the app
const createSwal = (options = {}) => {
  console.log('createSwal called with options:', options);
  
  try {
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
  } catch (error) {
    console.error('Error in createSwal:', error);
    return Swal; // Fallback to default Swal
  }
};

// Success alert
export const showSuccess = (title, text = '') => {
  return createSwal({
    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
    backdrop: 'rgba(0, 0, 0, 0.8)',
    color: '#ffffff',
    customClass: {
      popup: 'themed-swal-popup swal-success-popup',
      title: 'themed-swal-title swal-success-title',
      content: 'themed-swal-content',
      confirmButton: 'themed-swal-button swal-success-confirm'
    },
    buttonsStyling: false
  }).fire({
    icon: 'success',
    title,
    text,
    confirmButtonText: 'Great!',
    iconColor: '#10b981',
    timer: 3000,
    timerProgressBar: true,
    showClass: {
      popup: 'animate__animated animate__fadeInDown animate__faster'
    },
    hideClass: {
      popup: 'animate__animated animate__fadeOutUp animate__faster'
    }
  });
};

// Simple error alert for validation
export const simpleShowError = (title, text = '') => {
  console.log('simpleShowError called with:', { title, text });
  
  try {
    return Swal.fire({
      icon: 'error',
      title,
      text,
      background: 'linear-gradient(135deg, #1e293b, #0f172a)',
      color: '#ffffff',
      customClass: {
        popup: 'themed-swal-popup',
        title: 'themed-swal-title',
        confirmButton: 'themed-swal-button'
      },
      buttonsStyling: false,
      confirmButtonText: 'OK',
      iconColor: '#ef4444'
    });
  } catch (error) {
    console.error('Error in simpleShowError:', error);
    alert(`${title}: ${text}`);
    return Promise.resolve();
  }
};

// Error alert
export const showError = (title, text = '') => {
  console.log('showError called with:', { title, text });
  
  try {
    return createSwal({
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
      backdrop: 'rgba(0, 0, 0, 0.8)',
      color: '#ffffff',
      customClass: {
        popup: 'themed-swal-popup',
        title: 'themed-swal-title',
        content: 'themed-swal-content',
        confirmButton: 'themed-swal-button'
      },
      buttonsStyling: false
    }).fire({
      icon: 'error',
      title,
      text,
      confirmButtonText: 'Try Again',
      iconColor: '#ef4444',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showClass: {
        popup: 'animate__animated animate__fadeInDown animate__faster'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp animate__faster'
      }
    });
  } catch (error) {
    console.error('Error in showError:', error);
    // Fallback to simple alert
    alert(`${title}: ${text}`);
    return Promise.resolve();
  }
};

// Warning alert
export const showWarning = (title, text) => {
  return createSwal({
    background: 'linear-gradient(135deg, #1e293b, #0f172a)',
    color: '#ffffff',
    customClass: {
      popup: 'themed-swal-popup',
      title: 'themed-swal-title',
      confirmButton: 'themed-swal-button swal-warning-confirm'
    },
    buttonsStyling: false
  }).fire({
    icon: 'warning',
    title,
    text,
    confirmButtonText: 'OK',
    iconColor: '#f59e0b'
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
  return createSwal({
    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
    backdrop: 'rgba(0, 0, 0, 0.8)',
    color: '#ffffff',
    customClass: {
      popup: 'swal-dark-popup swal-loading-popup',
      title: 'swal-dark-title swal-loading-title'
    }
  }).fire({
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
