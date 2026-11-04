import { ArrowRight, Eye, Fingerprint, Layers3, ScanFace, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Reveal } from "../components/ui/Reveal";

const principles = [
  { icon: ScanFace, number: "01", title: "Spatial analysis", copy: "The vision branch inspects sampled frames for visual artifacts and signs of inconsistent image generation." },
  { icon: Eye, number: "02", title: "Temporal signals", copy: "Eye movement and blink measurements add a time-based perspective to the image-level evidence." },
  { icon: Layers3, number: "03", title: "Evidence fusion", copy: "A hybrid model brings learned visual and temporal signals together for an interpretable score." },
  { icon: Fingerprint, number: "04", title: "Audit details", copy: "Frame scores, processing metadata, and a SHA-256 fingerprint help make each report easier to review." },
];

export function About() {
  return (
    <div className="container page-content">
      <Reveal>
        <section className="about-hero">
          <div><span className="eyebrow">ABOUT DEEPFAKEGUARD</span><h1>Make the invisible<br /><span>easier to inspect.</span></h1></div>
          <div className="about-intro"><p>DeepfakeGuard is an explainable media forensics interface built to help people examine AI-generated or manipulated video and image content.</p><span><ShieldCheck size={16} /> Designed for transparency, not certainty.</span></div>
        </section>
      </Reveal>
      <Reveal>
        <section className="about-principles">
          <div className="section-heading">
            <div><span className="eyebrow">THE APPROACH</span><h2>Evidence at every <span>step.</span></h2></div>
            <p>Detection is a complex problem. We organize the analysis into signals that can be reviewed and questioned.</p>
          </div>
          <div className="principle-grid">
            {principles.map(({ icon: Icon, number, title, copy }) => (
              <Card className="principle-card" key={number}>
                <span className="principle-number">{number}</span><span className="principle-icon"><Icon size={20} /></span><h3>{title}</h3><p>{copy}</p>
              </Card>
            ))}
          </div>
        </section>
      </Reveal>
      <Card className="about-caveat">
        <div className="caveat-mark">!</div>
        <div><span className="eyebrow">IMPORTANT CONTEXT</span><h2>AI detection is not proof.</h2><p>Models can make mistakes and may perform differently across content, contexts, and generation methods. DeepfakeGuard results should be treated as a starting point for careful review—not a definitive finding.</p></div>
      </Card>
      <div className="about-bottom">
        <div><span className="eyebrow">TAKE A CLOSER LOOK</span><h2>Explore the evidence for yourself.</h2></div>
        <Link to="/detect" className="button button-primary">Run an analysis <ArrowRight size={16} /></Link>
      </div>
    </div>
  );
}
