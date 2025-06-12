import { NextRequest, NextResponse } from 'next/server';
import { wrapConteudo, authorize } from '../../../lib/moveo/helpers';
import { findEmailByPhone } from '../../../lib/google/sheets';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  //const unauth = authorize(req);
  //if (unauth) return unauth;

  let body: any;
  try { body = await req.json(); }
  catch { return wrapConteudo('Invalid JSON', 400); }
  
  const phone_v = body.context.user.phone;
  const spreadsheetId_v = body.context.user.spreadsheetId;

  if (!spreadsheetId_v || !phone_v) {
    return wrapConteudo('Missing parameters', 400);
  }

  try {
    const phoneColumnRange = "Aba1!A2:A100";
    const emailColumnRange = "Aba1!B2:B100";

    const email = await findEmailByPhone(
      spreadsheetId_v,
      phoneColumnRange,
      emailColumnRange,
      phone_v
    );
    if (!email) {
      
      return NextResponse.json({
        output: {
          live_instructions: {
            conteudo: `Telefone ${phone_v} não encontrado.`
          }
        }
      })
    }
    return NextResponse.json({
      output: {
        email ,
        live_instructions: {
          conteudo: `1. Email do usuario: ${email}\n2`
        }
      }
    });
  } catch (err) {
    console.error(err);
    return wrapConteudo('Erro interno do servidor.', 500);
  }
}
