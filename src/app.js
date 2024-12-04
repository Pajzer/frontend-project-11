import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
import resources from './locales/index.js';
import renderForm from './view.js';

const validate = (url, list) => {
  const formSchema = yup.string().url().notOneOf(list);
  return formSchema.validate(url);
};

export default () => {
  const defaultLanguage = 'ru';

  const i18nInstance = i18next.createInstance();

  i18nInstance.init({
    lng: defaultLanguage,
    debug: true,
    resources,
  });

  yup.setLocale({
    string: {
      url: i18nInstance.t('wrongUrl.url'),
    },
    mixed: {
      notOneOf: i18nInstance.t('wrongUrl.notOneOf'),
    },
  });

  const state = {
    form: {
      formStatus: 'filing',
      error: [],
    },
    posts: [],
  };

  const watchedState = onChange(state, (path, value) => {
    if (path === 'form') {
      renderForm(value, i18nInstance);
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
          formStatus: 'correctUrl',
        };
        e.target.reset();
      })
      .catch((ex) => {
        watchedState.form = {
          formStatus: 'wrongUrl',
          error: ex.errors,
        };
      });
  });
};
