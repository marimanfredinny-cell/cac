export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { event_name, custom_data, user_data, test_event_code } = req.body;
  const token = process.env.META_CAPI_TOKEN;
  const pixelId = '1348713502744731';

  if (!token) return res.status(500).json({ error: 'Token não configurado' });

  const payload = {
    data: [{
      event_name,
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      event_source_url: req.headers.referer || 'https://cac.marimanfredinny.com',
      user_data: user_data || { client_ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress },
      custom_data: custom_data || {}
    }]
  };

  if (test_event_code) payload.test_event_code = test_event_code;

  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${token}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
    );
    const data = await response.json();
    res.status(response.ok ? 200 : 500).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
