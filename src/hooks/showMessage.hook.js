import { useToast } from 'primevue/usetoast';

export default function showMessage() {
  const toast = useToast();

  function showSuccessMessage(message) {
    toast.add({
      severity: 'success',
      summary: 'Информация',
      detail: message,
      life: 3000,
    });
  }

  function showErrMessage(message) {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: message,
      life: 3000,
    });
  }

  return {
    showSuccessMessage,
    showErrMessage,
  };
}
