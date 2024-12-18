import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import _ from 'lodash';
import resources from './locales/index.js';
import parseDataFromRss from './parser.js';
import {
  renderForm, renderFeeds, renderPosts, renderModal, initializeUI,
} from './view.js';

const normalizeUrl = (url) => url.trim().replace(/\/$/, '');

const validate = (url, list) => {
  const formSchema = yup.string().url().notOneOf(list);
  return formSchema.validate(url);
};

const defaultLanguage = 'ru';

const buildProxyUrl = (url) => {
  const proxyUrl = new URL('https://allorigins.hexlet.app/get');
  proxyUrl.searchParams.set('disableCache', 'true');
  proxyUrl.searchParams.set('url', url);
  return proxyUrl.toString();
};

export default () => {
  const i18nInstance = i18next.createInstance();
  i18nInstance.init({
    lng: defaultLanguage,
    debug: true,
    resources,
  }).then(() => {
    initializeUI(i18nInstance);
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
      feeds: [],
      posts: [],
      currentPostId: null,
      visitedPostsId: [],
    };

    const delay = 5000;

    const watchedState = onChange(state, (path, value) => {
      switch (path) {
        case 'form':
          renderForm(value, i18nInstance);
          break;
        case 'feeds':
          renderFeeds(value, i18nInstance);
          break;
        case 'posts':
          renderPosts(value, state.visitedPostsId, i18nInstance);
          break;
        case 'currentPostId':
          renderModal(value, state.posts, i18nInstance);
          break;
        default:
          break;
      }
    });

    const fetchRssData = (url) => {
      const apiUrl = buildProxyUrl(url);
      return axios.get(apiUrl)
        .then((response) => {
          if (response.status !== 200) {
            throw new Error('wrongUrl.invalidRss');
          }
          return parseDataFromRss(response.data.contents);
        })
        .catch((error) => {
          if (error.isAxiosError) {
            throw new Error('wrongUrl.network');
          }
          throw error;
        });
    };

    const createFeed = (d, url) => {
      const feed = {};
      feed.id = _.uniqueId('feed_');
      feed.title = d.title;
      feed.link = url;
      feed.description = d.description;
      return feed;
    };

    const createPosts = (d) => d.items.map((item) => {
      const newItem = { ...item, id: _.uniqueId('post_'), feedId: state.feeds.length };
      return newItem;
    });

    const updatePosts = () => {
      const promises = state.feeds.map(({ link }) => fetchRssData(link).then(createPosts));
      Promise.all(promises)
        .then((results) => {
          const existingLinks = new Set(state.posts.map(({ link }) => link));
          const newPosts = results.flat().filter(({ link }) => !existingLinks.has(link));
          watchedState.posts = [...state.posts, ...newPosts];
        })
        .finally(() => {
          setTimeout(updatePosts, delay);
        });
    };

    const form = document.querySelector('form');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const newUrl = normalizeUrl(formData.get('url'));
      const rssLinks = state.feeds.map((feed) => feed.link);

      const submitButton = document.querySelector('button[type="submit"]');
      submitButton.disabled = true;

      validate(newUrl, rssLinks)
        .then(() => fetchRssData(newUrl))
        .then((data) => {
          watchedState.form = { formStatus: 'correctUrl' };
          watchedState.feeds = [...state.feeds, createFeed(data, newUrl)];
          watchedState.posts = [...state.posts, ...createPosts(data)];
        })
        .catch((error) => {
          watchedState.form = {
            error: [error.message],
            formStatus: 'wrongUrl',
          };
        })
        .finally(() => {
          submitButton.disabled = false;
        });
    });

    updatePosts();

    const postsContainer = document.querySelector('.posts');
    postsContainer.addEventListener('click', (e) => {
      if (e.target.nodeName === 'BUTTON' || e.target.nodeName === 'A') {
        const postId = e.target.getAttribute('data-id');
        watchedState.currentPostId = postId;
        watchedState.visitedPostsId.push(postId);
      }
    });
  });
};
