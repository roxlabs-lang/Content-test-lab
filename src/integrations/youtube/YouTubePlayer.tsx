import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink, AlertCircle, Play, Eye } from 'lucide-react';

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YouTubePlayerProps {
  videoId: string;
  isShort?: boolean;
  onPlaybackStarted?: () => void;
  playbackStarted?: boolean;
  playbackStartedAt?: number;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  isShort = false,
  onPlaybackStarted,
  playbackStarted = false,
  playbackStartedAt,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [hasError, setHasError] = useState<string | null>(null);
  const [isApiReady, setIsApiReady] = useState<boolean>(Boolean(window.YT && window.YT.Player));
  const hasTriggeredPlay = useRef(false);

  // Load YouTube IFrame API script once
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setIsApiReady(true);
      return;
    }

    const existingTag = document.getElementById('youtube-iframe-api');
    if (!existingTag) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const previousOnReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (previousOnReady) previousOnReady();
      setIsApiReady(true);
    };
  }, []);

  // Initialize or update player when videoId changes
  useEffect(() => {
    if (!isApiReady || !videoId || !containerRef.current) return;

    setHasError(null);
    hasTriggeredPlay.current = false;

    // Destroy existing player instance
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (e) {
        console.warn('Error destroying player:', e);
      }
      playerRef.current = null;
    }

    // Create mount element
    const playerElement = document.createElement('div');
    playerElement.id = `yt-player-${videoId}`;
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(playerElement);

    try {
      playerRef.current = new window.YT.Player(playerElement.id, {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
          enablejsapi: 1,
          origin: window.location.origin,
          autoplay: 0, // CRITICAL: NO AUTOPLAY per instructions
        },
        events: {
          onReady: () => {
            // Player loaded successfully
          },
          onStateChange: (event: any) => {
            // Listen for YT.PlayerState.PLAYING (value: 1)
            if (event.data === window.YT.PlayerState.PLAYING) {
              if (!hasTriggeredPlay.current) {
                hasTriggeredPlay.current = true;
                if (onPlaybackStarted) {
                  onPlaybackStarted();
                }
              }
            }
          },
          onError: (event: any) => {
            const code = event.data;
            let message = 'This video encountered an error playing.';
            if (code === 101 || code === 150) {
              message = "The owner of this video doesn't allow embedded playback.";
            } else if (code === 100) {
              message = 'This video does not exist or has been marked private/removed.';
            } else if (code === 2 || code === 5) {
              message = 'Invalid video ID or HTML5 playback error.';
            }
            setHasError(message);
          },
        },
      });
    } catch (err: any) {
      console.error('Failed to instantiate YT.Player:', err);
      setHasError('Failed to load YouTube player.');
    }

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {}
        playerRef.current = null;
      }
    };
  }, [isApiReady, videoId]);

  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

  if (hasError) {
    return (
      <div className="w-full aspect-video min-h-[280px] rounded-2xl bg-zinc-950 border border-zinc-800 p-6 flex flex-col items-center justify-center text-center space-y-4 shadow-xl">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="max-w-md space-y-1">
          <h3 className="text-base font-bold text-zinc-100">Video Can't Play Here</h3>
          <p className="text-xs text-zinc-400">{hasError}</p>
        </div>
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-md shadow-indigo-600/20"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Open on YouTube</span>
        </a>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      <div
        className={`w-full relative rounded-2xl overflow-hidden bg-black border border-zinc-800/90 shadow-2xl transition-all ${
          isShort
            ? 'max-w-[340px] sm:max-w-[360px] aspect-[9/16] min-h-[460px]'
            : 'aspect-video min-h-[260px] sm:min-h-[360px]'
        }`}
      >
        <div ref={containerRef} className="w-full h-full" />
      </div>

      {/* Playback status indicator banner */}
      <div className="w-full flex items-center justify-between mt-2.5 px-2">
        <div className="flex items-center gap-2 text-xs">
          {playbackStarted ? (
            <span className="flex items-center gap-1.5 text-emerald-400 font-mono font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Playback started ✓</span>
              {playbackStartedAt && (
                <span className="text-[10px] text-zinc-500">
                  ({new Date(playbackStartedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                </span>
              )}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
              <Play className="w-3.5 h-3.5 text-zinc-500 fill-zinc-500" />
              <span>Press YouTube's native Play button to test view tracking</span>
            </span>
          )}
        </div>

        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 transition"
        >
          <span>Open on YouTube</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
