import onChange from 'on-change';
import * as yup from 'yup';
import renderForm from './view.js';

const validate = (url, list) => {
  const formSchema = yup.string().url().notOneOf(list);
  return formSchema.validate(url);
};

export default () => {
  const state = {
    form: {
      state: 'filing',
      error: null,
    },
    posts: [],
  };

  const watchedState = onChange(state, (path, value) => {
    if (path === 'form') {
      renderForm(value);
    }
  });

  const form = document.querySelector('form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newUrl = formData.get('url');
    validate(newUrl, state.posts)
      .then(() => {
        state.posts.push(newUrl);
        watchedState.form = {
          state: 'correctUrl',
        };
        e.target.reset();
      })
      .catch((ex) => {
        watchedState.form = {
          state: 'wrongUrl',
          error: ex.type,
        };
      });
  });
};
