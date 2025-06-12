import { NextRequest,NextResponse } from 'next/server';
import { authorize } from '../../../lib/moveo/helpers';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    //const unauth = authorize(req);
    //if (unauth) return unauth;
  
    let body: any;
    return output(true);
  }

export default function output(sucess : boolean): NextResponse{
    return NextResponse.json({output : {status : (sucess)}});
}
