import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Scrolls to top on every route change. Place inside <BrowserRouter>. */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}
