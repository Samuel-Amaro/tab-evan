import nodedmailer from 'nodemailer';

const transporter = nodedmailer.createTransport({
	host: import.meta.env.EMAIL_SMTP_HOST,
	port: Number(import.meta.env.EMAIL_SMTP_PORT),
	auth: {
		user: import.meta.env.EMAIL_SMTP_USER,
		pass: import.meta.env.EMAIL_SMTP_PASSWORD
	},
	secure: import.meta.env.MODE === 'production' ? true : false
});

async function send(mailOptions: {
	from: string;
	to: string;
	subject: string;
	text: string;
	html?: string;
}) {
	await transporter.sendMail(mailOptions);
}

const email = {
	send
};

export default email;
