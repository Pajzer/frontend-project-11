export default (xmlString) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'text/xml');
  if (!doc.querySelector('rss')) {
    throw new Error('wrongUrl.invalidRss');
  }
  const items = [...doc.querySelectorAll('rss>channel>item')].map((item) => ({
    title: item.querySelector('title').textContent,
    link: item.querySelector('link').textContent,
    description: item.querySelector('description').textContent,
  }));

  return {
    title: doc.querySelector('rss>channel>title').textContent,
    description: doc.querySelector('rss>channel>description').textContent,
    items,
  };
};
