import { Request } from "express"

export function getRequestIp(req: Request) {
	const ips = req.headers["x-forwarded-for"] as string | undefined

	if (ips) {
		const realIp = ips.split(",")[0].trim()
		return realIp
	}

	const realIp = req.headers["x-real-ip"] as string | undefined
	if (realIp) {
		return realIp
	}

	return req.ip
}