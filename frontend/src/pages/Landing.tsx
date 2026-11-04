import { ArrowDown, ArrowRight, ArrowUpRight, Fingerprint, ScanFace, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { CapabilityTabs } from "../components/landing/CapabilityTabs";
import { Faq } from "../components/landing/Faq";
import { Card } from "../components/ui/Card";
import { Reveal } from "../components/ui/Reveal";

export function Landing() {
  return (
    <>
      <section className="hero-section container">
        <div className="hero-copy">
          <div className="hero-kicker"><span className="pulse-dot" /> EXPLAINABLE MEDIA INTELLIGENCE</div>
          <h1>Trust what you see.<br /><span>Verify what you share.</span></h1>
          <p className="hero-lede">
            A clearer way to inspect digital media. DeepfakeGuard combines frame-level vision and temporal cues to surface signals of manipulation.
          </p>
          <div className="hero-actions">
            <Link to="/detect" className="button button-primary"><ScanFace size={17} /> Analyze a file <ArrowUpRight size={15} /></Link>
            <Link to="/about" className="text-link">How it works <ArrowRight size={15} /></Link>
          </div>
          <div className="hero-proof">
            <span><ShieldCheck size={15} /> Evidence-led results</span>
            <i />
            <span><Fingerprint size={15} /> Traceable analysis</span>
          </div>
        </div>

        <div className="hero-art" aria-label="Illustration of video analysis">
          <div className="art-glow" />
          <div className="art-topline"><span>LIVE SIGNAL MAP</span><span><span className="tiny-live" /> ACTIVE</span></div>
          <div className="face-frame">
            <div className="face-grid" />
            <div className="scan-line" />
            <div className="face-silhouette">
              <span className="face-eye eye-left" /><span className="face-eye eye-right" />
              <span className="face-nose" /><span className="face-mouth" />
            </div>
            <span className="corner corner-tl" /><span className="corner corner-tr" />
            <span className="corner corner-bl" /><span className="corner corner-br" />
            <span className="face-tag">FRAME 08 / 16</span>
          </div>
          <div className="art-bottom">
            <div><span className="art-metric-label">AUTHENTICITY SIGNAL</span><strong>Analyzing pattern</strong></div>
            <div className="signal-bars"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
          </div>
          <div className="art-float float-score"><Sparkles size={14} /><span>Spatial cues</span><strong>04</strong></div>
          <div className="art-float float-status"><span className="status-check">✓</span><span>Explainable<br />by design</span></div>
        </div>
        <a className="scroll-cue" href="#capabilities"><ArrowDown size={14} /> SCROLL TO EXPLORE</a>
      </section>

      <section className="section-block container" id="capabilities">
        <Reveal>
          <div className="section-heading">
            <div><span className="eyebrow">A BETTER KIND OF DETECTION</span><h2>More than a verdict.<br /><span>A view into the evidence.</span></h2></div>
            <p>Every result is built to be inspected. Explore the signals behind the score, not just the score itself.</p>
          </div>
          <CapabilityTabs />
        </Reveal>
      </section>

      <section className="section-block section-dark">
        <div className="container">
          <Reveal>
            <div className="section-heading dark-heading">
              <div><span className="eyebrow">A SIMPLE WORKFLOW</span><h2>From upload to<br /><span>understanding.</span></h2></div>
              <Link to="/detect" className="dark-text-link">Start an analysis <ArrowRight size={16} /></Link>
            </div>
            <div className="workflow-grid">
              {[
                ["01", "Choose your media", "Upload an image or video, or explore the live camera scanner."],
                ["02", "Run the analysis", "Select a model and decision threshold, then let the pipeline inspect the content."],
                ["03", "Review the evidence", "Explore the verdict, frame-level signals, visualizations, and technical details."],
              ].map(([number, title, copy]) => (
                <Card className="workflow-card" key={number}>
                  <span className="workflow-number">{number}</span><ArrowUpRight className="workflow-arrow" size={18} />
                  <h3>{title}</h3><p>{copy}</p>
                </Card>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-block container faq-section">
        <Reveal>
          <div className="section-heading">
            <div><span className="eyebrow">GOOD TO KNOW</span><h2>Questions, <span>answered.</span></h2></div>
            <p>Clear signals, careful interpretation. Here are a few things to know before you start.</p>
          </div>
          <Faq />
        </Reveal>
      </section>
    </>
  );
}
