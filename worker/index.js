const ALLOWED_ORIGIN = 'https://yairlevinson.github.io';
const AGE_MIN = 0, AGE_MAX = 90;
function headers(origin) {
  return {
    'Access-Control-Allow-Origin': origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Vary': 'Origin', 'Cache-Control': 'no-store'
  };
}
function json(data, status, origin) {
  return new Response(JSON.stringify(data), {status, headers: {'Content-Type': 'application/json', ...headers(origin)}});
}
export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    if (request.method === 'OPTIONS') {
      if (origin !== ALLOWED_ORIGIN) return new Response(null, {status: 403});
      return new Response(null, {status: 204, headers: headers(origin)});
    }
    const path = new URL(request.url).pathname;
    if (path === '/health' && request.method === 'GET') return json({ok:true}, 200, origin);
    if (path !== '/age' || request.method !== 'POST') return json({error:'Not found'},404,origin);
    if (origin !== ALLOWED_ORIGIN) return json({error:'Origin not allowed'},403,origin);
    if (!env.OPENAI_API_KEY || !env.ACCESS_TOKEN) return json({error:'Backend not configured'},503,origin);
    if (request.headers.get('Authorization') !== 'Bearer ' + env.ACCESS_TOKEN) return json({error:'Invalid access token'},401,origin);
    const length = Number(request.headers.get('Content-Length') || '0');
    if (length > 9_000_000) return json({error:'Request too large'},413,origin);
    let payload;
    try { payload = await request.json(); } catch { return json({error:'Invalid JSON'},400,origin); }
    const age = payload?.age;
    const image = payload?.image;
    if (!Number.isInteger(age) || age < AGE_MIN || age > AGE_MAX) return json({error:'Invalid age'},400,origin);
    if (typeof image !== 'string' || image.length > 8_000_000 || !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(image)) {
      return json({error:'Unsupported image. Upload a JPEG, PNG or WebP under 5MB.'},400,origin);
    }
    const prompt = `Photorealistic age transformation of the person in the supplied reference portrait. Depict the SAME person at exactly ${age} years old, preserving recognizable facial identity and natural inherited traits where possible. For infancy or earlier ages, depict a plausible younger version; for later ages, depict plausible natural aging. Keep one person, natural expression, realistic anatomy, front-facing head-and-shoulders composition, similar angle, neutral soft background and clothing appropriate for the age. Do not add text, watermarks, or other people. This is a creative fictional age simulation, not a factual prediction.`;
    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {'Authorization': 'Bearer ' + env.OPENAI_API_KEY, 'Content-Type':'application/json'},
      body: JSON.stringify({
        model: 'gpt-image-2.5-flare',
        images: [{image_url: image}],
        prompt,
        quality: 'medium',
        size: '1024x1024',
        n: 1,
        output_format: 'jpeg'
      })
    });
    const data = await response.json().catch(()=>({}));
    if (!response.ok) return json({error: data.error?.message || 'Image model request failed'}, response.status === 429 ? 429 : 502, origin);
    const b64 = data.data?.[0]?.b64_json;
    if (!b64) return json({error:'Image model returned no image'},502,origin);
    return json({image: 'data:image/jpeg;base64,' + b64},200,origin);
  }
};
