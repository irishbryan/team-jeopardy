import { useEffect } from 'react';

interface MetaTagsConfig {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string | null;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string | null;
}

export const useMetaTags = (config: MetaTagsConfig) => {
  useEffect(() => {
    // Store original values to restore later
    const originalTitle = document.title;
    const originalDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const originalOgTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '';
    const originalOgDescription = document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';
    const originalOgImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';
    const originalTwitterTitle = document.querySelector('meta[name="twitter:title"]')?.getAttribute('content') || '';
    const originalTwitterDescription = document.querySelector('meta[name="twitter:description"]')?.getAttribute('content') || '';
    const originalTwitterImage = document.querySelector('meta[name="twitter:image"]')?.getAttribute('content') || '';

    // Update title
    if (config.title) {
      document.title = config.title;
    }

    // Update meta tags
    const updateMetaTag = (selector: string, content: string) => {
      const tag = document.querySelector(selector);
      if (tag) {
        tag.setAttribute('content', content);
      }
    };

    const removeMetaTag = (selector: string) => {
      const tag = document.querySelector(selector);
      if (tag) {
        tag.remove();
      }
    };

    if (config.description) {
      updateMetaTag('meta[name="description"]', config.description);
    }
    if (config.ogTitle) {
      updateMetaTag('meta[property="og:title"]', config.ogTitle);
    }
    if (config.ogDescription) {
      updateMetaTag('meta[property="og:description"]', config.ogDescription);
    }
    if (config.twitterTitle) {
      updateMetaTag('meta[name="twitter:title"]', config.twitterTitle);
    }
    if (config.twitterDescription) {
      updateMetaTag('meta[name="twitter:description"]', config.twitterDescription);
    }
    if (config.ogImage !== undefined) {
      if (config.ogImage === null) {
        removeMetaTag('meta[property="og:image"]');
      } else {
        updateMetaTag('meta[property="og:image"]', config.ogImage);
      }
    }
    if (config.twitterImage !== undefined) {
      if (config.twitterImage === null) {
        removeMetaTag('meta[name="twitter:image"]');
      } else {
        updateMetaTag('meta[name="twitter:image"]', config.twitterImage);
      }
    }

    // Cleanup function to restore original values
    return () => {
      document.title = originalTitle;
      updateMetaTag('meta[name="description"]', originalDescription);
      updateMetaTag('meta[property="og:title"]', originalOgTitle);
      updateMetaTag('meta[property="og:description"]', originalOgDescription);
      updateMetaTag('meta[property="og:image"]', originalOgImage);
      updateMetaTag('meta[name="twitter:title"]', originalTwitterTitle);
      updateMetaTag('meta[name="twitter:description"]', originalTwitterDescription);
      updateMetaTag('meta[name="twitter:image"]', originalTwitterImage);
    };
  }, [config]);
};