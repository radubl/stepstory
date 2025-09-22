export const prerender = true;

/** @type {import('@sveltejs/kit').LayoutLoad} */
export function load({ route }) {
  // Show breadcrumbs on all pages (even homepage for testing)
  const showBreadcrumbs = true;
  
  return {
    showBreadcrumbs
  };
}