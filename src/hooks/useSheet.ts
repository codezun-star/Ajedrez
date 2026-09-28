/**
 * useSheet — open/close state for a bottom sheet, kept in the browser history.
 *
 * An installed app is expected to close its open menu when the phone's back
 * button (or the back swipe) is used, not to leave the page underneath it.
 * Holding the flag in component state can't do that: back would navigate away
 * with the sheet still up. So opening pushes a history entry for the same URL
 * carrying `{ sheet: name }`, and closing pops it — back closes the sheet for
 * free, and the address bar never changes.
 *
 * Browsers restore `history.state` on reload, which would bring a sheet back
 * up on a page the reader just refreshed. `armed` is set only when a sheet is
 * opened from this document, so a restored flag is ignored and cleared.
 */

import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export type SheetName = 'settings';

let armed = false;

interface SheetState {
  sheet?: SheetName;
}

export function useSheet(name: SheetName) {
  const location = useLocation();
  const navigate = useNavigate();
  const flagged = (location.state as SheetState | null)?.sheet === name;
  const open = flagged && armed;

  useEffect(() => {
    if (flagged && !armed)
      navigate(location.pathname + location.search, { replace: true, state: null });
  }, [flagged, location.pathname, location.search, navigate]);

  const show = useCallback(() => {
    if (flagged) return;
    armed = true;
    navigate(location.pathname + location.search, { state: { sheet: name } satisfies SheetState });
  }, [flagged, location.pathname, location.search, name, navigate]);

  const hide = useCallback(() => {
    if (flagged) navigate(-1);
  }, [flagged, navigate]);

  return { open, show, hide };
}
