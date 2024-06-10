import { z } from "zod";
import { env } from "./env";
import Cron from "croner";

const ipSchema = z.object({
	ip: z.array(z.string()),
	headers: z.object({
		"X-Forwarded-For": z.array(z.string()),
		"X-Real-Ip": z.array(z.string()).min(1).max(1),
	}),
});

const job = Cron(env.NANA_CRON, async () => {
	console.log(`[${new Date().toISOString()}] Running firewall update job`);

	/**
	 * Our current IP address. We need this to add it to the firewall rules.
	 */
	const currentIp = await (async () => {
		const ipRes = await fetch("https://ip.radmacher.church/api");
		const ipData = await ipRes.json();
		const parsedIpData = ipSchema.parse(ipData);
		const ip = parsedIpData.headers["X-Real-Ip"][0];
		console.log(`[${new Date().toISOString()}] Current IP: ${ip}`)
		return ip;
	})();

	/**
	 * The new rule we want to apply to the firewall.
	 * This overwrites all existing rules.
	 */
	const newRules: {
		description: string | null;
		direction: "in" | "out";
		port: string | null;
		protocol: "tcp" | "udp" | "icmp";
		source_ips: string[];
		destination_ips: string[];
	}[] = [
		{
			description: "Allow FRP connections (managed my nana)",
			direction: "in",
			port: env.HETZNER_FIREWALL_PORT,
			protocol: "tcp",
			source_ips: [`${currentIp}/32`],
			destination_ips: [],
		},
	];

	const upd = await fetch(
		`https://api.hetzner.cloud/v1/firewalls/${env.HETZNER_FIREWALL_ID}/actions/set_rules`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${env.HETZNER_API_TOKEN}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ rules: newRules }),
		},
	);
	if (!upd.ok) {
		console.log(`[${new Date().toISOString()}] Failed to update firewall rules`);
	} else {
		console.log(`[${new Date().toISOString()}] Updated firewall rules`);
	}
});

console.log(`[${new Date().toISOString()}] Nana is now running! Next run: ${job.nextRun()?.toISOString() ?? "never"}`);

if (env.NANA_RUN_ON_START) {
	console.log(`[${new Date().toISOString()}] Running job on start`);
	await job.trigger();
}
