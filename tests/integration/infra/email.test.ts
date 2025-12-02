import { beforeAll, describe, expect, it } from 'vitest';
import email from '../../../infra/email';
import orchestrator from '../../orchestrator';

beforeAll(async () => {
	await orchestrator.waitForAllServices();
});

describe('infra/email.ts', () => {
	it('send()', async () => {
		await orchestrator.deleteAllEmails();

		await email.send({
			from: 'Samuel Amaro <samuelamaro2018@hotmail.com>',
			to: 'samuel.dev.front@gmail.com',
			subject: 'Teste de assunto',
			text: 'Teste de corpo do email.'
		});

		await email.send({
			from: 'Samuel Amaro <samuelamaro2018@hotmail.com>',
			to: 'samuel.dev.front@gmail.com',
			subject: 'Último email enviado',
			text: 'Corpo do último email.'
		});

		const lastEmail = await orchestrator.getLastEmail();
		expect(lastEmail?.sender).toBe('<samuelamaro2018@hotmail.com>');
		expect(lastEmail?.recipients[0]).toBe('<samuel.dev.front@gmail.com>');
		expect(lastEmail?.subject).toBe('Último email enviado');
		expect(lastEmail?.text).toBe('Corpo do último email.\r\n');
	});
});
