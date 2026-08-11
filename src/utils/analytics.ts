import { track } from '@vercel/analytics';

/**
 * Analytics tracking utilities for Vercel Web Analytics.
 * Only collects non-PII, general statistical usage data.
 */

export const trackWebsiteVisit = () => {
  try {
    track('website_visit');
  } catch (error) {
    console.error('Analytics error:', error);
  }
};

export const trackViewLocation = (name: string, category: string) => {
  if (!name) return;
  try {
    track('view_location', {
      name,
      category,
    });
  } catch (error) {
    console.error('Analytics error:', error);
  }
};

export const trackSearchLocation = (query: string, category: string = 'Tất cả') => {
  const trimmed = query.trim();
  if (!trimmed) return;
  try {
    track('search_location', {
      query: trimmed,
      category,
    });
  } catch (error) {
    console.error('Analytics error:', error);
  }
};

export const trackGetDirections = (name: string, category: string) => {
  if (!name) return;
  try {
    track('get_directions', {
      name,
      category,
    });
  } catch (error) {
    console.error('Analytics error:', error);
  }
};

export const trackOpenStoryMap = () => {
  try {
    track('open_story_map');
  } catch (error) {
    console.error('Analytics error:', error);
  }
};
