import Swal from 'sweetalert2';

// Simple test function
export const testSweetAlert = () => {
  console.log('Testing SweetAlert...');
  
  // Very basic SweetAlert call
  return Swal.fire({
    title: 'Test Alert',
    text: 'This is a test',
    icon: 'error',
    confirmButtonText: 'OK'
  });
};

// Simple error function with proper theme colors
export const simpleShowError = (title, text = '') => {
  console.log('simpleShowError called with:', { title, text });
  
  return Swal.fire({
    title: title,
    text: text,
    icon: 'error',
    confirmButtonText: 'Try Again',
    confirmButtonColor: '#ef4444', // red-500
    background: 'linear-gradient(135deg, #1e293b, #0f172a)', // sesuai tema website
    color: '#ffffff',
    allowOutsideClick: false,
    allowEscapeKey: false,
    customClass: {
      popup: 'themed-swal-popup',
      title: 'themed-swal-title',
      content: 'themed-swal-content',
      confirmButton: 'themed-swal-button'
    }
  });
};

// Ultra simple alert
export const ultraSimpleAlert = (title, text = '') => {
  console.log('ultraSimpleAlert called');
  
  return Swal.fire(title, text, 'error');
};
