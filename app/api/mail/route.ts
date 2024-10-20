import EmailTemplate from '../../../emails';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { response } from '@/lib/utils';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request, res: Response) {
  const { email, requesterName, emailSubject } = await request.json();

  try {
    const { data, error } = await resend.emails.send({
      from: 'Test <onboarding@resend.dev>',
      to: [email],
      subject: emailSubject,
      //   react: EmailTemplate({ requesterName: requesterName }),
      html: render(EmailTemplate({ requesterName: requesterName }))
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
