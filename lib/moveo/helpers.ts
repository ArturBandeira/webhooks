import { NextRequest, NextResponse } from 'next/server';

export function wrapConteudo(conteudo: any, status = 200): NextResponse {
  return NextResponse.json(
    { output: conteudo },
    { status }
  );
}

export function authorize(req: NextRequest): NextResponse | null {
  const token = req.headers.get('x-moveo-token');
  if (token !== process.env.WEBHOOK_TOKEN) {
    return wrapConteudo('Unauthorized', 401);
  }
  return null;
}
