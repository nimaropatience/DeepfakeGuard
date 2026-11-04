"""PDF forensic report generation using ReportLab."""

# This is a placeholder. Full implementation would use reportlab
# to create a professional PDF with:
# - Verdict, probability, threshold
# - Grad-CAM heatmap images
# - EAR chart
# - Metadata (timestamps, SHA-256, model info)
# - Disclaimer text


def generate_pdf_report(result: dict, output_path: str) -> str:
    """Generate a PDF forensic report from an analysis result."""
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.pdfgen import canvas

        c = canvas.Canvas(output_path, pagesize=A4)
        width, height = A4

        # Title
        c.setFont("Helvetica-Bold", 24)
        c.drawString(50, height - 60, "DeepfakeGuard Forensic Report")

        c.setFont("Helvetica", 10)
        c.drawString(50, height - 80, "BSc Final Year Project, Uganda Christian University")
        c.drawString(50, height - 95, "Nimaro Patience Torach")

        # Verdict
        c.setFont("Helvetica-Bold", 18)
        y = height - 140
        c.drawString(50, y, f"Verdict: {result.get('verdict', 'N/A')}")

        c.setFont("Helvetica", 14)
        y -= 30
        c.drawString(50, y, f"Probability: {result.get('probability', 'N/A')}")
        y -= 25
        c.drawString(50, y, f"Threshold: {result.get('threshold', 'N/A')}")
        y -= 25
        c.drawString(50, y, f"Model: {result.get('model_id', 'N/A')}")

        # Metadata
        y -= 40
        c.setFont("Helvetica-Bold", 14)
        c.drawString(50, y, "Technical Details")
        c.setFont("Helvetica", 11)

        details = [
            ("Processing Time", f"{result.get('processing_time', 'N/A')}s"),
            ("Device", result.get("device", "N/A")),
            ("Resolution", result.get("resolution", "N/A")),
            ("Duration", f"{result.get('duration', 'N/A')}s"),
            ("Frames Sampled", str(result.get("frames_sampled", "N/A"))),
            ("SHA-256", result.get("file_sha256", "N/A")[:32] + "..."),
            ("Timestamp", result.get("timestamp", "N/A")),
        ]

        for label, value in details:
            y -= 20
            c.drawString(60, y, f"{label}: {value}")

        # Disclaimer
        y -= 50
        c.setFont("Helvetica-Oblique", 9)
        c.drawString(50, y, "Results are probabilistic and support, not replace, expert forensic review.")

        c.save()
        return output_path

    except ImportError:
        return ""
