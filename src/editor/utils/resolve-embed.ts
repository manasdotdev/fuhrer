import { isValidUrl, normalizeUrl } from './is-valid-url';

export type ResolvedEmbed = {
  /** Original pasted URL (or page URL extracted from iframe HTML). */
  url: string;
  /** iframe src to render. */
  embedUrl: string;
  provider: string;
  /** CSS aspect-ratio value, e.g. `16 / 9`. */
  aspectRatio: string;
  /** Fixed iframe height when aspect-ratio is a poor fit (Spotify, etc.). */
  height?: number;
};

function hostOf(url: URL) {
  return url.hostname.replace(/^www\./, '').toLowerCase();
}

/** Pull src (+ optional page url) from pasted iframe HTML. */
function fromIframeHtml(raw: string): ResolvedEmbed | null {
  const trimmed = raw.trim();
  if (!trimmed.toLowerCase().includes('<iframe')) return null;

  const doc = new DOMParser().parseFromString(trimmed, 'text/html');
  const iframe = doc.querySelector('iframe');
  const src = iframe?.getAttribute('src')?.trim();
  if (!src || !isValidUrl(src)) return null;

  const embedUrl = normalizeUrl(src);
  const resolved = resolveEmbedUrl(embedUrl);
  if (resolved) return resolved;

  return {
    url: embedUrl,
    embedUrl,
    provider: 'iframe',
    aspectRatio: '16 / 9',
  };
}

function youtubeId(url: URL): string | null {
  const host = hostOf(url);
  if (host === 'youtu.be') {
    const id = url.pathname.split('/').filter(Boolean)[0];
    return id || null;
  }
  if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com' || host === 'youtube-nocookie.com') {
    if (url.pathname.startsWith('/embed/') || url.pathname.startsWith('/shorts/') || url.pathname.startsWith('/live/')) {
      return url.pathname.split('/').filter(Boolean)[1] || null;
    }
    return url.searchParams.get('v');
  }
  return null;
}

function resolveEmbedUrl(raw: string): ResolvedEmbed | null {
  if (!isValidUrl(raw)) return null;

  const url = new URL(normalizeUrl(raw));
  const host = hostOf(url);
  const href = url.href;

  const yt = youtubeId(url);
  if (yt) {
    return {
      url: href,
      embedUrl: `https://www.youtube.com/embed/${yt}`,
      provider: 'youtube',
      aspectRatio: '16 / 9',
    };
  }

  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const parts = url.pathname.split('/').filter(Boolean);
    const id = host === 'player.vimeo.com' ? parts[1] : parts[0];
    if (id && /^\d+$/.test(id)) {
      return {
        url: href,
        embedUrl: `https://player.vimeo.com/video/${id}`,
        provider: 'vimeo',
        aspectRatio: '16 / 9',
      };
    }
  }

  if (host === 'open.spotify.com') {
    const path = url.pathname.replace(/\/$/, '');
    if (/^\/(track|album|playlist|episode|show|artist)\//.test(path)) {
      const isTrackOrEpisode = /^\/(track|episode)\//.test(path);
      return {
        url: href,
        embedUrl: `https://open.spotify.com/embed${path}`,
        provider: 'spotify',
        aspectRatio: '1 / 1',
        height: isTrackOrEpisode ? 152 : 352,
      };
    }
  }

  if (host === 'soundcloud.com' || host === 'w.soundcloud.com') {
    if (host === 'w.soundcloud.com' && url.searchParams.get('url')) {
      return {
        url: href,
        embedUrl: href,
        provider: 'soundcloud',
        aspectRatio: '16 / 9',
        height: 166,
      };
    }
    const encoded = encodeURIComponent(href);
    return {
      url: href,
      embedUrl: `https://w.soundcloud.com/player/?url=${encoded}&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=true`,
      provider: 'soundcloud',
      aspectRatio: '16 / 9',
      height: 300,
    };
  }

  if (host === 'codepen.io') {
    const match = url.pathname.match(/^\/([^/]+)\/(?:pen|embed)\/([^/]+)/);
    if (match) {
      return {
        url: href,
        embedUrl: `https://codepen.io/${match[1]}/embed/${match[2]}?default-tab=result`,
        provider: 'codepen',
        aspectRatio: '16 / 9',
        height: 400,
      };
    }
  }

  if (host === 'loom.com') {
    const match = url.pathname.match(/^\/(?:share|embed)\/([a-zA-Z0-9]+)/);
    if (match) {
      return {
        url: href,
        embedUrl: `https://www.loom.com/embed/${match[1]}`,
        provider: 'loom',
        aspectRatio: '16 / 9',
      };
    }
  }

  if (host === 'twitch.tv' || host === 'clips.twitch.tv') {
    const parent = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    if (host === 'clips.twitch.tv') {
      const slug = url.pathname.split('/').filter(Boolean)[0];
      if (slug) {
        return {
          url: href,
          embedUrl: `https://clips.twitch.tv/embed?clip=${slug}&parent=${parent}`,
          provider: 'twitch',
          aspectRatio: '16 / 9',
        };
      }
    }
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts[0] === 'videos' && parts[1]) {
      return {
        url: href,
        embedUrl: `https://player.twitch.tv/?video=${parts[1]}&parent=${parent}`,
        provider: 'twitch',
        aspectRatio: '16 / 9',
      };
    }
    if (parts[0]) {
      return {
        url: href,
        embedUrl: `https://player.twitch.tv/?channel=${parts[0]}&parent=${parent}`,
        provider: 'twitch',
        aspectRatio: '16 / 9',
      };
    }
  }

  // Already an embeddable player URL — use as-is.
  if (href.includes('/embed') || host.startsWith('player.')) {
    return {
      url: href,
      embedUrl: href,
      provider: 'iframe',
      aspectRatio: '16 / 9',
    };
  }

  return null;
}

/**
 * Turn a pasted page URL or iframe HTML into embed attrs.
 * Returns null when the URL isn't a known provider.
 */
export function resolveEmbed(raw: string): ResolvedEmbed | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const fromHtml = fromIframeHtml(trimmed);
  if (fromHtml) return fromHtml;

  return resolveEmbedUrl(trimmed);
}
