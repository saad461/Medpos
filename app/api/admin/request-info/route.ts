import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.app_metadata.role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { email, medicineName, question } = await request.json();

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'Resend API key not configured' }, { status: 500 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: email,
      replyTo: process.env.ADMIN_EMAIL,
      subject: `Question regarding your medicine submission: ${medicineName}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #1e3a5f;">Question regarding your submission</h2>
          <p>Hello,</p>
          <p>Our team has a question regarding your submission for <strong>${medicineName}</strong>:</p>
          <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
            ${question}
          </div>
          <p>Please reply to this email with the requested information so we can proceed with your submission.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b;">MedPOS Admin Team</p>
        </div>
      `
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
