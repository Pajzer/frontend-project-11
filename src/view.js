const renderForm = (state, i18nInstance) => {
  const form = document.querySelector('form');
  const input = form.querySelector('input');
  const feedback = document.querySelector('.feedback');

  if (state.formStatus === 'correctUrl') {
    input.classList.remove('is-invalid');
    feedback.textContent = i18nInstance.t('correctUrl');
    feedback.classList.remove('text-danger');
    feedback.classList.add('text-success');
  }
  if (state.formStatus === 'wrongUrl') {
    input.classList.add('is-invalid');
    feedback.classList.remove('text-success');
    feedback.classList.add('text-danger');
    feedback.textContent = state.error.join('\n');
  }
};

export default renderForm;
