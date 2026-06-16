# Synapse Hire — AI-Powered Talent Intelligence Platform

> Hire the right talent beyond keywords.

Synapse Hire is an AI-powered candidate ranking platform built for the **:contentReference[oaicite:0]{index=0}**.  
It reimagines hiring by ranking candidates the way an experienced recruiter would — using semantic understanding, behavioral signals, and trust-aware scoring instead of naive keyword matching.

---

## Problem Statement

Traditional Applicant Tracking Systems (ATS) rely heavily on keyword matching.

This causes major issues:

- Strong candidates get missed due to wording mismatch
- Resumes can be keyword-stuffed
- Behavioral signals are ignored
- Recruiters cannot trust automated rankings

Synapse Hire solves this by building an **AI intelligence engine** that understands both:
- **Job requirements**
- **Candidate quality**

…and produces recruiter-ready shortlists.

---

## Core Features

### Intelligent Candidate Ranking
Ranks candidates using a hybrid AI scoring system.

Factors include:
- Semantic role fit
- Skill alignment
- Experience fit
- Career progression
- Behavioral reliability
- Recruiter trust

---

### Trap / Honeypot Detection
Detects suspicious candidates such as:

- Keyword stuffing
- Fake AI profiles
- Impossible timelines
- Chronic job hopping
- Low recruiter responsiveness

This improves shortlist quality.

---

### Interactive Dataset Upload
Upload:

#### Candidate Dataset
Supported:
- `.json`
- `.jsonl`
- `.jsonl.gz`

#### Job Description
Supported:
- `.txt`
- `.md`
- `.pdf`
- `.docx`

---

### Role Configuration
Recruiters can configure:

- Target Profile Title
- Minimum Experience
- Maximum Experience
- Risk Sensitivity
- Ranking Weights

Examples:
- Senior AI Engineer
- ML Engineer
- GenAI Architect

---

### Explainable AI
Each candidate receives recruiter-style reasoning.

Example:

> 7.1 years of production AI experience with strong FAISS and retrieval expertise. Excellent recruiter responsiveness and active GitHub profile indicate strong hiring potential.

---

### Submission Export
Export top-ranked candidates in challenge-ready format:

```csv
candidate_id,rank,score,reasoning
```

Supports:
- CSV
- XLSX

---

# Architecture

```text
Candidate Dataset Upload
        ↓
Schema Validation
        ↓
Feature Extraction
        ↓
Fast Candidate Filtering
        ↓
Semantic Ranking Engine
        ↓
Trap Detection Engine
        ↓
Hybrid Scoring
        ↓
Top 100 Candidates
        ↓
CSV Export
```

---

# Ranking Pipeline

## Stage 1 — Job Intelligence Extraction

The system converts job descriptions into structured role blueprints.

Extracted signals:
- Mandatory skills
- Preferred skills
- Experience range
- Negative indicators
- Ranking weights

---

## Stage 2 — Candidate Understanding Engine

Extracts:

### Hard Features
- Skills
- Experience
- Education
- Career history

### Soft Features
- Leadership
- Growth trajectory
- Stability
- Product mindset

### Behavioral Features
- Recruiter response rate
- Interview completion rate
- Offer acceptance
- GitHub activity

---

## Stage 3 — Semantic Matching

Semantic similarity is computed between:
- Job description
- Candidate profile
- Career summaries

This prevents keyword gaming.

---

## Stage 4 — Trap Detection

Candidates are penalized for anomalies.

Examples:

### Fake AI Profile
Non-technical profile claiming advanced AI expertise.

### Job Hopper
Average tenure < 18 months.

### Low Trust Candidate
Poor responsiveness or inconsistent signals.

---

## Stage 5 — Hybrid Scoring

Final score:

```text
Final Score =
0.30 × Semantic Match +
0.25 × Skill Match +
0.15 × Experience Fit +
0.10 × Career Quality +
0.10 × Behavioral Reliability +
0.10 × Recruiter Trust
− Trap Penalty
```

---

# Tech Stack

## Frontend
- :contentReference[oaicite:1]{index=1}
- :contentReference[oaicite:2]{index=2}
- :contentReference[oaicite:3]{index=3}
- Motion animations

## Backend
- :contentReference[oaicite:4]{index=4}
- :contentReference[oaicite:5]{index=5}

## AI / Ranking
- Semantic scoring
- Hybrid ranking engine
- Rule-based filtering
- Behavioral scoring

---

# UI Design

Synapse Hire uses a premium **Liquid Glass UI** inspired by:

- Apple Vision Pro
- iOS Liquid Glass
- Linear
- Stripe

Design principles:
- Glassmorphism
- Holographic glow
- Premium motion
- Smooth transitions

---

# Dataset Format

Expected candidate schema includes:

```json
{
  "candidate_id": "CAND_0000001",
  "profile": {},
  "career_history": [],
  "education": [],
  "skills": [],
  "redrob_signals": {}
}
```

---

# Installation

Clone repository:

```bash
git clone https://github.com/YOUR_USERNAME/synapse-hire.git
cd synapse-hire
```

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

---

# Usage

1. Open the app  
2. Configure target role  
3. Upload candidate dataset  
4. Upload job description  
5. Start AI ranking  
6. Review dashboard  
7. Export CSV submission  

---

# Output Example

```csv
candidate_id,rank,score,reasoning
CAND_0003114,1,0.983,"Strong retrieval systems experience with high recruiter responsiveness."
```

---

# Performance

Optimized for:

- 100,000 candidates
- CPU-only execution
- Memory-safe processing
- Fast ranking
- Scalable architecture

---

# Future Improvements

- Vector embeddings via :contentReference[oaicite:6]{index=6}
- LLM-based recruiter copilot
- Interview recommendation engine
- Bias detection
- Adaptive ranking feedback loop

---

# Team

**Team Name:** Synapse Labs 
**Team Leader:** Abhinav Punk M
**Team Members:**
         1.Abhinav Punk M
---

# License

This project was developed for the Redrob Data & AI Challenge 2026.

---

# Tagline

> We rank talent like humans — at machine scale.
