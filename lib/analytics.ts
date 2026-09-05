'use client';

import { supabase } from './supabase';

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sid = localStorage.getItem('na_session_id');
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem('na_session_id', sid);
  }
  return sid;
}

export async function trackEvent(
  eventType: string,
  productId?: string,
  metadata?: Record<string, unknown>
) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    await supabase.from('analytics_events').insert({
      anonymous_session_id: getSessionId(),
      user_id: session?.user?.id ?? null,
      event_type: eventType,
      product_id: productId ?? null,
      metadata: {
        ...metadata,
        device_type: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
        browser: navigator.userAgent.split(' ').pop() ?? '',
        url: window.location.pathname,
      },
    });
  } catch {
    // Analytics failures should never break the UI
  }
}
