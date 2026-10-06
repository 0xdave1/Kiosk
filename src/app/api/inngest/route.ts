/** @format */

import { NextResponse } from "next/server";
import { processPdfInvoiceJob } from "@/inngest/functions/pdfInvoice";
import { processAutoBuildJob } from "@/inngest/functions/autoBuilder";

/**
 * POST /api/inngest - Executes serverless background worker jobs
 */
export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { event, data } = body;

		if (event === "kiosk/payment.completed" && data) {
			const result = await processPdfInvoiceJob(data);
			return NextResponse.json({ status: "completed", result });
		}

		if (event === "kiosk/project.autobuild" && data) {
			const result = await processAutoBuildJob(data);
			return NextResponse.json({ status: "completed", result });
		}

		return NextResponse.json({ status: "ignored", message: "Event not handled" });
	} catch (err) {
		console.error("[INNGEST_ROUTE_ERROR]", err);
		return NextResponse.json({ error: "Failed to process background worker job" }, { status: 500 });
	}
}

export async function GET() {
	return NextResponse.json({ status: "online", worker: "kiosk-inngest-processor" });
}
