export async function GET() {
  // Public liveness probe: no auth, no Supabase dependency.
  return Response.json({
    status: 'ok',
    version: '1.0.0',
    time: new Date().toISOString(),
  });
}
