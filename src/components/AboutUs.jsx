import React from "react";
import { Link } from "react-router-dom";

const AboutUs = () => {
  return (
    <main className="about-page">
      <section className="page-shell about-hero">
        <div className="eyebrow">Built for clear decisions</div>
        <h1 className="main-title">Follster helps groups choose better—together.</h1>
        <p className="lead">
          We make ranked-choice polling effortless so any team, club, or community can
          surface the option that most people actually support. No spin, no vote splitting,
          just transparent outcomes you can trust.
        </p>
        <div className="hero-actions">
          <Link to="/new-poll" className="but-color">Create a poll</Link>
          <Link to="/polls" className="ghost-btn">See live polls</Link>
        </div>
        <div className="hero-inline-stats">
          <div className="stat-chip">
            <span className="stat-number">IRV</span>
            <span className="stat-label">Instant runoff</span>
          </div>
          <div className="stat-chip">
            <span className="stat-number">0 setup</span>
            <span className="stat-label">No login required</span>
          </div>
          <div className="stat-chip">
            <span className="stat-number">Live</span>
            <span className="stat-label">Real-time timers</span>
          </div>
        </div>
      </section>

      <section className="page-shell feature-grid">
        <div className="feature-card">
          <div className="feature-icon">🧭</div>
          <h3>Crystal clear flow</h3>
          <p>Guided steps, inline validation, and crisp typography keep every action obvious and error-free.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h3>Ranked-choice by default</h3>
          <p>IRV backed ballots with transparent rankings and instant result reveal when the poll closes.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🔒</div>
          <h3>Smart access controls</h3>
          <p>Limit viewing and voting, allow anonymous ballots, or invite specific users with one click.</p>
        </div>
      </section>

      <section className="page-shell about-grid">
        <div className="about-card">
          <h3>Fair by design</h3>
          <p>Ranked-choice eliminates the “spoiler” effect. Voters list preferences; our instant runoff rounds keep transferring support until a true majority emerges.</p>
        </div>
        <div className="about-card">
          <h3>Transparent outcomes</h3>
          <p>Every ballot is counted, and you can see rankings and results the moment a poll closes. No hidden weights—just clean math.</p>
        </div>
        <div className="about-card">
          <h3>Secure access</h3>
          <p>Decide who can view or vote: public, friends-only, or hand-picked users. Enable or disable anonymous voting with a single switch.</p>
        </div>
      </section>

      <section className="page-shell about-columns">
        <div className="about-panel">
          <h3>How Follster works</h3>
          <ol className="about-steps">
            <li><strong>Create</strong> a poll with options, timing, and access rules.</li>
            <li><strong>Share</strong> the link or invite friends directly.</li>
            <li><strong>Rank</strong> options in order of preference—no forced single picks.</li>
            <li><strong>Trust</strong> the instant-runoff tally to surface the consensus choice.</li>
          </ol>
        </div>
        <div className="about-panel">
          <h3>What we believe</h3>
          <ul className="about-list">
            <li>Decisions should be inclusive and quick, not political.</li>
            <li>Great UX reduces drop-off—so we obsess over clarity and speed.</li>
            <li>Every voice matters: ranked ballots ensure minority options still shape outcomes.</li>
            <li>Admins need control: permissions, duplicate-vote prevention, and drafts are built in.</li>
          </ul>
        </div>
      </section>

      <section className="page-shell about-highlight">
        <div>
          <div className="eyebrow">Made for modern teams</div>
          <h2>From weekend plans to product decisions</h2>
          <p className="lead">Clubs, classrooms, product squads, and friend groups rely on Follster to settle choices with confidence. No meetings required—just send a poll and move forward.</p>
        </div>
        <div className="hero-actions">
          <Link to="/new-poll" className="but-color">Start a poll</Link>
          <Link to="/signup" className="ghost-btn">Create your account</Link>
        </div>
      </section>
    </main>
  );
};

export default AboutUs;
