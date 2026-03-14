/**
 * Ad placement — Balanced. Content first, ads non-overwhelming.
 *
 * Cardinal Tangible: 1 banner + smart links per page max.
 * Set ADS_ENABLED=false to disable all ads.
 */

/** Master switch: set true to enable any ads */
export const ADS_ENABLED = true;

/** Max ads per story page. Phase 1: 1 banner at bottom only. */
export const STORY_MAX_ADS = 1;

/** Homepage: 1 smart link in sidebar (balanced). */
export const HOME_MAX_ADS = 1;

/** Videos page: 1 banner on detail only (Phase 1). */
export const VIDEOS_MAX_ADS = 1;

/** Popup: show on internal link click (rate-limited). */
export const POPUP_MAX_PER_MINUTE = 4;

/** Popup: seconds to view before navigate. */
export const POPUP_VIEW_SECONDS = 5;

/** Show mid-story ad? Never. */
export function shouldShowPartBreakAd(_partIndex: number, _totalParts: number): boolean {
  return false;
}
