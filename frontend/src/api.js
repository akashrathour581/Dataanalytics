export async function api(url, options={}) {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) throw new Error(typeof data.detail==='string'?data.detail:'Please check the input and try again.');
  return data;
}
export const post = (url, body) => api(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
// Optional first-party integration point. Only an allowlisted event and tool slug leave this function.
const allowed = new Set(['tool_opened','file_uploaded','analysis_completed','conversion_completed','download_clicked','calculator_used','error_occurred']);
export function track(event, tool) {
  if (import.meta.env.VITE_METRICS_ENABLED !== 'true' || !allowed.has(event)) return;
  window.dispatchEvent(new CustomEvent('datasphere:metric',{detail:{event,tool}}));
}
