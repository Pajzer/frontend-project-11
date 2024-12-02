const renderForm = (st) => {
  const form = document.querySelector('form');
  const input = form.querySelector('input');
  const feedback = document.querySelector('.feedback');

  if (st.state === 'correctUrl') {
    input.classList.remove('border-danger');
    feedback.textContent = 'RSS успешно загружен';
    feedback.classList.remove('text-danger');
    feedback.classList.add('text-success');
  }
  if (st.state === 'wrongUrl') {
    input.classList.add('border-danger');
    feedback.classList.remove('text-success');
    feedback.classList.add('text-danger');
    if (st.error === 'url') {
      feedback.textContent = 'Ссылка должна быть валидным URL';
    }
    if (st.error === 'notOneOf') {
      feedback.textContent = 'RSS уже существует';
    }
  }
};

export default renderForm;
