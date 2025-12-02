import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
	host: process.env.EMAIL_SMTP_HOST,
	port: parseInt(process.env.EMAIL_SMTP_PORT ?? '1025'),
	auth: {
		user: process.env.EMAIL_SMTP_USER,
		pass: process.env.EMAIL_SMTP_PASSWORD
	},
	secure: process.env.MODE === 'production' ? true : false
});

async function send(mailOptions: {
	from: string;
	to: string;
	subject: string;
	text: string;
	html?: string;
}) {
	try {
		await transporter.sendMail(mailOptions);
		const error = await transporter.verify();
		if (error) {
			console.log('\n🟢 Servidor SMTP está pronto para enviar e-mails');
		} else {
			console.error('\n\n🔴 Erro de verificação no servidor SMTP');
		}
	} catch (error) {
		console.error('Erro de conexão no servidor SMTP: ', error);
	}
}

const email = {
	send
};

export default email;
