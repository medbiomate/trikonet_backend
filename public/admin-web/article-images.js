import { articleImagePaths } from './article-image-paths.js';

export function restoreArticleImages(html) {
  const template = document.createElement('template');
  template.innerHTML = html;
  for (const image of template.content.querySelectorAll('img')) {
    const id = image.className.match(/\bwp-image-(\d+)\b/)?.[1];
    const migrated = articleImagePaths[id];
    if (!migrated) continue;
    const source = image.getAttribute('src') || '';
    if (!/^https?:\/\/(?:www\.)?trikonet\.com\/wp-content\/uploads\//i.test(source) && !source.startsWith('/wp-content/uploads/')) continue;
    image.setAttribute('src', migrated);
    // Legacy srcset URLs can override src with files from the removed CMS.
    image.removeAttribute('srcset');
    image.removeAttribute('sizes');
  }
  return template.innerHTML;
}
