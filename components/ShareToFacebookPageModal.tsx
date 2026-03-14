"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getShareCaption,
  CAPTION_PERCENT_OPTIONS,
} from "@/lib/shareCaption";

declare global {
  interface Window {
    FB?: {
      init: (params: { appId: string; cookie?: boolean; xfbml?: boolean; version: string }) => void;
      login: (cb: (r: { status: string; authResponse?: { accessToken: string } }) => void, opts: { scope: string }) => void;
      api: (path: string, cb: (r: { data?: { id: string; name: string; access_token: string }[] }) => void) => void;
      getLoginStatus: (cb: (r: { status: string; authResponse?: { accessToken: string } }) => void) => void;
    };
    fbAsyncInit?: () => void;
  }
}

interface FbPage {
  id: string;
  name: string;
  access_token: string;
}

interface ShareToFacebookPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Story body text for caption */
  body: string;
  /** Full URL to story (for link preview) */
  link: string;
  /** Story title/headline for fallback */
  title: string;
  variant?: "light" | "dark";
}

const FB_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || "";
const FB_SCOPE = "pages_show_list,pages_manage_posts";

function loadFbSdk(): Promise<typeof window.FB> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(undefined);
      return;
    }
    if (window.FB) {
      resolve(window.FB);
      return;
    }
    window.fbAsyncInit = () => {
      window.FB?.init({
        appId: FB_APP_ID,
        cookie: true,
        xfbml: true,
        version: "v21.0",
      });
      resolve(window.FB);
    };
    const script = document.getElementById("facebook-jssdk");
    if (script) {
      if (window.FB) resolve(window.FB);
      return;
    }
    const s = document.createElement("script");
    s.id = "facebook-jssdk";
    s.async = true;
    s.defer = true;
    s.crossOrigin = "anonymous";
    s.src = "https://connect.facebook.net/en_US/sdk.js";
    document.body.appendChild(s);
  });
}

export default function ShareToFacebookPageModal({
  isOpen,
  onClose,
  body,
  link,
  title,
  variant = "dark",
}: ShareToFacebookPageModalProps) {
  const [step, setStep] = useState<"login" | "select-page" | "preview">("login");
  const [pages, setPages] = useState<FbPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<FbPage | null>(null);
  const [captionPercent, setCaptionPercent] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const caption = getShareCaption(body, captionPercent);
  /** Caption only — link passed separately so Facebook fetches OG image/title */
  const postMessage = caption || title;
  /** Resolve to absolute URL for Facebook OG fetch */
  const fullLink =
    link.startsWith("http") ? link : (typeof window !== "undefined" ? `${window.location.origin}${link.startsWith("/") ? "" : "/"}${link}` : link);

  const fetchPages = useCallback(async () => {
    if (!window.FB) return;
    return new Promise<void>((resolve, reject) => {
      window.FB!.api("/me/accounts", (res: { data?: FbPage[] }) => {
        if (res.data && res.data.length > 0) {
          setPages(res.data);
          setStep("select-page");
        } else {
          setError("No Facebook Pages found. Create a Page or get admin access.");
        }
        resolve();
      });
    });
  }, []);

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await loadFbSdk();
      if (!window.FB || !FB_APP_ID) {
        setError("Facebook App ID not configured. Add NEXT_PUBLIC_FACEBOOK_APP_ID.");
        return;
      }
      await new Promise<void>((resolve) => {
        window.FB!.getLoginStatus((r) => {
          if (r.status === "connected") {
            fetchPages().then(resolve);
            return;
          }
          window.FB!.login((res) => {
            if (res.status === "connected") {
              fetchPages().then(resolve);
            } else {
              setError("Facebook login cancelled or failed.");
              resolve();
            }
          }, { scope: FB_SCOPE });
        });
      });
    } catch {
      setError("Failed to load Facebook.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPage = (page: FbPage) => {
    setSelectedPage(page);
    setStep("preview");
  };

  const handlePost = async () => {
    if (!selectedPage) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/share-to-facebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId: selectedPage.id,
          pageAccessToken: selectedPage.access_token,
          message: postMessage,
          link: fullLink,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Post failed");
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Post failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setStep("login");
      setPages([]);
      setSelectedPage(null);
      setError("");
      setCaptionPercent(20);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isDark = variant === "dark";
  const bg = isDark ? "bg-[#1a1a1a]" : "bg-white";
  const text = isDark ? "text-white" : "text-gray-900";
  const border = isDark ? "border-white/10" : "border-gray-200";
  const inputBg = isDark ? "bg-white/5" : "bg-gray-100";

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal
      aria-label="Share to Facebook Page"
    >
      <div
        className={`${bg} ${text} w-full max-w-md rounded-xl border ${border} p-6 shadow-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bangla text-lg font-bold">
            Share to Facebook Page
          </h2>
          <button
            type="button"
            onClick={onClose}
            className={`rounded p-1 ${isDark ? "text-white/60 hover:bg-white/10 hover:text-white" : "text-gray-500 hover:bg-gray-200 hover:text-gray-900"}`}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        {step === "login" && (
          <div>
            <p className={`mb-4 text-sm ${isDark ? "text-white/70" : "text-gray-600"}`}>
              Log in with Facebook to post this story to your Page. You will choose the page next.
            </p>
            <button
              type="button"
              onClick={handleLogin}
              disabled={loading}
              className="w-full rounded-lg bg-[#1877f2] py-3 font-semibold text-white hover:bg-[#166fe5] disabled:opacity-50"
            >
              {loading ? "Connecting..." : "Log in with Facebook"}
            </button>
          </div>
        )}

        {step === "select-page" && (
          <div>
            <p className={`mb-4 text-sm ${isDark ? "text-white/70" : "text-gray-600"}`}>
              Select a Page to post to:
            </p>
            <ul className="mb-4 space-y-2">
              {pages.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectPage(p)}
                    className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${border} hover:bg-white/5`}
                  >
                    {p.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {step === "preview" && selectedPage && (
          <div>
            <p className={`mb-2 text-sm ${isDark ? "text-white/70" : "text-gray-600"}`}>
              Posting to: <strong>{selectedPage.name}</strong>
            </p>
            <p className={`mb-2 text-sm ${isDark ? "text-white/70" : "text-gray-600"}`}>
              Caption length (first % of content):
            </p>
            <div className="mb-4 flex gap-2">
              {CAPTION_PERCENT_OPTIONS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setCaptionPercent(p)}
                  className={`rounded px-3 py-1.5 text-sm font-medium ${
                    captionPercent === p
                      ? "bg-[var(--primary)] text-white"
                      : `${inputBg} ${text} hover:bg-white/10`
                  }`}
                >
                  {p}%
                </button>
              ))}
            </div>
            <div
              className={`mb-4 max-h-32 overflow-y-auto rounded-lg ${inputBg} p-3 text-sm`}
            >
              {postMessage}
              {fullLink && (
                <>
                  <br />
                  <br />
                  <span className={isDark ? "text-white/60" : "text-gray-500"}>{fullLink}</span>
                </>
              )}
            </div>
            <p className={`mb-4 text-xs ${isDark ? "text-white/50" : "text-gray-500"}`}>
              Facebook will show the link preview (image + title) automatically.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep("select-page")}
                className={`flex-1 rounded-lg border py-2 font-medium ${border}`}
              >
                Back
              </button>
              <button
                type="button"
                onClick={handlePost}
                disabled={loading}
                className="flex-1 rounded-lg bg-[#1877f2] py-2 font-semibold text-white hover:bg-[#166fe5] disabled:opacity-50"
              >
                {loading ? "Posting..." : "Post to Page"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
