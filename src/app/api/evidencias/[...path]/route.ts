// Filesystem evidence is deliberately unavailable in the Workers branch.
export const dynamic = "force-dynamic";
export async function GET() { return new Response(null, { status: 404 }); }
