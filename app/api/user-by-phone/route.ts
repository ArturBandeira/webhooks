import { NextRequest } from 'next/server';
import { wrapConteudo, authorize } from '../../../lib/moveo/helpers';
import { findEmailByPhone } from '../../../lib/google/sheets';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const unauth = authorize(req);
  if (unauth) return unauth;

  let body: any;
  try { body = await req.json(); }
  catch { return wrapConteudo('Invalid JSON', 400); }

  const {
    spreadsheetId,
    phoneColumnRange = 'Aba1!A2:A100',
    emailColumnRange = 'Aba1!B2:B100',
    phone,
  } = body;

  if (!spreadsheetId || !phone) {
    return wrapConteudo('Missing parameters', 400);
  }

  try {
    const email = await findEmailByPhone(
      spreadsheetId,
      phoneColumnRange,
      emailColumnRange,
      phone
    );
    if (!email) {
      return wrapConteudo(`Telefone ${phone} não encontrado.`);
    }
    return wrapConteudo({ email });
  } catch (err) {
    console.error(err);
    return wrapConteudo('Erro interno do servidor.', 500);
  }
}
