import { Candidate } from "../types";

export const initialCandidates: Candidate[] = [
  {
    "candidate_id": "CAND_0000001",
    "profile": {
      "anonymized_name": "Ira Vora",
      "headline": "Backend Engineer | SQL, Spark, Cloud",
      "summary": "Software / data professional with 6.9 years of experience building data pipelines, backend systems, and analytics infrastructure. I'm a backend/data hybrid — Spark, Airflow, SQL warehouses are home territory; I'm building competence on the ML side. My toolkit is solid on the data engineering side — Python, SQL, Spark, Airflow, warehouse design — and I've completed a couple of self-directed ML projects (Kaggle competitions, side projects fine-tuning small models). Interested in transitioning toward more AI/ML-focused work, ideally at a company where I can leverage my existing data-infra skills while learning modern ML practice.",
      "location": "Toronto",
      "country": "Canada",
      "years_of_experience": 6.9,
      "current_title": "Backend Engineer",
      "current_company": "Mindtree",
      "current_company_size": "10001+",
      "current_industry": "IT Services"
    },
    "career_history": [
      {
        "company": "Mindtree",
        "title": "Backend Engineer",
        "start_date": "2024-03-08",
        "end_date": null,
        "duration_months": 27,
        "is_current": true,
        "industry": "IT Services",
        "company_size": "10001+",
        "description": "Implemented streaming data pipelines on Kafka and Spark Streaming for a real-time user-activity processing platform. Designed the schema-registry integration, the watermark/state management approach, and the deduplication logic for late-arriving events. Worked closely with the data science team to make sure feature pipelines aligned with what their models needed."
      },
      {
        "company": "Dunder Mifflin",
        "title": "Analytics Engineer",
        "start_date": "2019-07-03",
        "end_date": "2024-01-08",
        "duration_months": 55,
        "is_current": false,
        "industry": "Paper Products",
        "company_size": "201-500",
        "description": "Built and maintained data pipelines on Apache Airflow processing ~500GB of daily transactional data across 12 source systems. Worked extensively with Spark (PySpark) for batch processing and dbt for the transformation/modeling layer in Snowflake."
      }
    ],
    "education": [
      {
        "institution": "Lovely Professional University",
        "degree": "B.E.",
        "field_of_study": "Computer Science",
        "start_year": 2017,
        "end_year": 2020,
        "grade": "8.24 CGPA",
        "tier": "tier_3"
      }
    ],
    "skills": [
      { "name": "Python", "proficiency": "expert", "endorsements": 84, "duration_months": 80 },
      { "name": "SQL", "proficiency": "expert", "endorsements": 92, "duration_months": 80 },
      { "name": "Spark", "proficiency": "advanced", "endorsements": 55, "duration_months": 45 },
      { "name": "Airflow", "proficiency": "advanced", "endorsements": 42, "duration_months": 36 },
      { "name": "Fine-tuning LLMs", "proficiency": "advanced", "endorsements": 21, "duration_months": 36 },
      { "name": "LoRA", "proficiency": "intermediate", "endorsements": 0, "duration_months": 28 },
      { "name": "Milvus", "proficiency": "advanced", "endorsements": 40, "duration_months": 35 }
    ],
    "redrob_signals": {
      "profile_completeness_score": 86.9,
      "signup_date": "2025-10-16",
      "last_active_date": "2026-05-20",
      "open_to_work_flag": true,
      "profile_views_received_30d": 23,
      "applications_submitted_30d": 2,
      "recruiter_response_rate": 0.34,
      "avg_response_time_hours": 177.8,
      "skill_assessment_scores": {
        "NLP": 38.8,
        "Image Classification": 64.8,
        "Fine-tuning LLMs": 41.6
      },
      "connection_count": 356,
      "endorsements_received": 35,
      "notice_period_days": 60,
      "expected_salary_range_inr_lpa": { "min": 18.7, "max": 36.1 },
      "preferred_work_mode": "onsite",
      "willing_to_relocate": false,
      "github_activity_score": 9.2,
      "search_appearance_30d": 249,
      "saved_by_recruiters_30d": 4,
      "interview_completion_rate": 0.71,
      "offer_acceptance_rate": 0.58,
      "verified_email": true,
      "verified_phone": true,
      "linkedin_connected": false
    }
  },
  {
    "candidate_id": "CAND_0000002",
    "profile": {
      "anonymized_name": "Saanvi Sethi",
      "headline": "Operations Manager | 12.5+ yrs experience",
      "summary": "Professional with 12.5+ years of experience. My professional background is in marketing manager — I've built and led teams, owned KPIs, and driven business outcomes in this domain. Lately I've been curious about how AI tools could augment my work — I've experimented with ChatGPT and a few other tools for productivity and content creation. Open to roles where I can apply my domain expertise alongside emerging AI capabilities.",
      "location": "Chennai, Tamil Nadu",
      "country": "India",
      "years_of_experience": 12.5,
      "current_title": "Operations Manager",
      "current_company": "Wipro",
      "current_company_size": "10001+",
      "current_industry": "IT Services"
    },
    "career_history": [
      {
        "company": "Wipro",
        "title": "Operations Manager",
        "start_date": "2022-11-14",
        "end_date": null,
        "duration_months": 43,
        "is_current": true,
        "industry": "IT Services",
        "company_size": "10001+",
        "description": "Customer support team lead at a SaaS product. Managed a team of 8 support agents handling tier-1 and tier-2 tickets. Lighter on technical depth beyond product workspace."
      }
    ],
    "education": [
      {
        "institution": "Local Engineering College",
        "degree": "B.Sc",
        "field_of_study": "Mathematics",
        "start_year": 2007,
        "end_year": 2011,
        "grade": "77%",
        "tier": "tier_4"
      }
    ],
    "skills": [
      { "name": "Project Management", "proficiency": "intermediate", "endorsements": 14, "duration_months": 23 },
      { "name": "Marketing", "proficiency": "beginner", "endorsements": 9, "duration_months": 11 },
      { "name": "GCP", "proficiency": "intermediate", "endorsements": 7, "duration_months": 30 },
      { "name": "Feature Engineering", "proficiency": "intermediate", "endorsements": 11, "duration_months": 27 }
    ],
    "redrob_signals": {
      "profile_completeness_score": 78.7,
      "signup_date": "2025-07-28",
      "last_active_date": "2025-11-12",
      "open_to_work_flag": true,
      "profile_views_received_30d": 7,
      "applications_submitted_30d": 1,
      "recruiter_response_rate": 0.29,
      "avg_response_time_hours": 171.6,
      "skill_assessment_scores": {},
      "connection_count": 179,
      "endorsements_received": 3,
      "notice_period_days": 60,
      "expected_salary_range_inr_lpa": { "min": 8.8, "max": 9.0 },
      "preferred_work_mode": "flexible",
      "willing_to_relocate": false,
      "github_activity_score": -1,
      "search_appearance_30d": 107,
      "saved_by_recruiters_30d": 10,
      "interview_completion_rate": 0.62,
      "offer_acceptance_rate": -1,
      "verified_email": false,
      "verified_phone": false,
      "linkedin_connected": false
    }
  },
  {
    "candidate_id": "CAND_0000003",
    "profile": {
      "anonymized_name": "Yash Agarwal",
      "headline": "Customer Support | 1.1+ yrs experience",
      "summary": "Professional with 1.1+ years of experience. I've spent my career in marketing manager roles, mostly focused on driving outcomes through process, people, and customer relationships. Lately I've been curious about how AI tools could augment my work. Open to roles where I can apply my domain expertise alongside emerging AI capabilities.",
      "location": "Austin",
      "country": "USA",
      "years_of_experience": 1.1,
      "current_title": "Customer Support",
      "current_company": "TCS",
      "current_company_size": "10001+",
      "current_industry": "IT Services"
    },
    "career_history": [
      {
        "company": "TCS",
        "title": "Customer Support",
        "start_date": "2025-05-02",
        "end_date": null,
        "duration_months": 13,
        "is_current": true,
        "industry": "IT Services",
        "company_size": "10001+",
        "description": "Business analyst at a consulting firm, working primarily with retail and CPG clients. Conducted business diagnostics, process re-engineering work. Recent project work involved AI-strategy advisory but my own technical depth in AI is limited."
      }
    ],
    "education": [
      {
        "institution": "Local Engineering College",
        "degree": "M.E.",
        "field_of_study": "Chemical Engineering",
        "start_year": 2005,
        "end_year": 2010,
        "grade": "6.82 CGPA",
        "tier": "tier_4"
      }
    ],
    "skills": [
      { "name": "Angular", "proficiency": "intermediate", "endorsements": 13, "duration_months": 10 },
      { "name": "SEO", "proficiency": "beginner", "endorsements": 11, "duration_months": 11 },
      { "name": "Excel", "proficiency": "intermediate", "endorsements": 2, "duration_months": 15 }
    ],
    "redrob_signals": {
      "profile_completeness_score": 31.9,
      "signup_date": "2024-08-02",
      "last_active_date": "2026-03-21",
      "open_to_work_flag": false,
      "profile_views_received_30d": 1,
      "applications_submitted_30d": 9,
      "recruiter_response_rate": 0.46,
      "avg_response_time_hours": 119.4,
      "skill_assessment_scores": {},
      "connection_count": 19,
      "endorsements_received": 46,
      "notice_period_days": 150,
      "expected_salary_range_inr_lpa": { "min": 11.2, "max": 18.1 },
      "preferred_work_mode": "hybrid",
      "willing_to_relocate": false,
      "github_activity_score": -1,
      "search_appearance_30d": 28,
      "saved_by_recruiters_30d": 4,
      "interview_completion_rate": 0.86,
      "offer_acceptance_rate": -1,
      "verified_email": true,
      "verified_phone": false,
      "linkedin_connected": false
    }
  },
  {
    "candidate_id": "CAND_0000010",
    "profile": {
      "anonymized_name": "Aarav Kapoor",
      "headline": "Data Engineer | Data pipelines & analytics",
      "summary": "Software / data professional with 4.6 years of experience building data pipelines, backend systems, and analytics infrastructure. Most of my work has been data pipelines and analytics infrastructure; I've shipped a couple of small ML features. My toolkit is solid on the data engineering side — Python, SQL, Spark, Airflow — interested in transitioning toward more AI/ML-focused work, where I can build more production ML experience.",
      "location": "London",
      "country": "UK",
      "years_of_experience": 4.6,
      "current_title": "Data Engineer",
      "current_company": "Ola",
      "current_company_size": "5001-10000",
      "current_industry": "Transportation"
    },
    "career_history": [
      {
        "company": "Ola",
        "title": "Data Engineer",
        "start_date": "2021-11-19",
        "end_date": null,
        "duration_months": 55,
        "is_current": true,
        "industry": "Transportation",
        "company_size": "5001-10000",
        "description": "Mixed data science and analytics-engineering role at a marketing-analytics startup. Spent maybe 30% of my time on lightweight ML (clustering, classification, churn prediction in sklearn/XGBoost) and 70% on data infrastructure."
      }
    ],
    "education": [
      {
        "institution": "Generic State University",
        "degree": "B.E.",
        "field_of_study": "Mathematics",
        "start_year": 2007,
        "end_year": 2011,
        "grade": "85%",
        "tier": "tier_4"
      }
    ],
    "skills": [
      { "name": "Python", "proficiency": "intermediate", "endorsements": 7, "duration_months": 14 },
      { "name": "Kubeflow", "proficiency": "intermediate", "endorsements": 11, "duration_months": 19 },
      { "name": "GANs", "proficiency": "advanced", "endorsements": 58, "duration_months": 57 },
      { "name": "OpenCV", "proficiency": "advanced", "endorsements": 0, "duration_months": 24 },
      { "name": "Object Detection", "proficiency": "advanced", "endorsements": 55, "duration_months": 58 },
      { "name": "BM25", "proficiency": "advanced", "duration_months": 55, "endorsements": 55 }
    ],
    "redrob_signals": {
      "profile_completeness_score": 81.6,
      "signup_date": "2026-01-09",
      "last_active_date": "2026-04-29",
      "open_to_work_flag": false,
      "profile_views_received_30d": 60,
      "applications_submitted_30d": 13,
      "recruiter_response_rate": 0.4,
      "avg_response_time_hours": 19.0,
      "skill_assessment_scores": {
        "GANs": 53.3,
        "OpenCV": 65.5,
        "Object Detection": 81.3
      },
      "connection_count": 712,
      "endorsements_received": 38,
      "notice_period_days": 120,
      "expected_salary_range_inr_lpa": { "min": 13.0, "max": 32.0 },
      "preferred_work_mode": "hybrid",
      "willing_to_relocate": false,
      "github_activity_score": 33.7,
      "search_appearance_30d": 256,
      "saved_by_recruiters_30d": 2,
      "interview_completion_rate": 0.53,
      "offer_acceptance_rate": -1,
      "verified_email": true,
      "verified_phone": true,
      "linkedin_connected": false
    }
  },
  {
    "candidate_id": "CAND_0000014",
    "profile": {
      "anonymized_name": "Atharv Joshi",
      "headline": "Frontend Engineer | Full-stack development",
      "summary": "Software engineer with 8.4 years of experience across web, backend, and cloud systems. Strong fundamentals in software development and system design. My background is full-stack, but my comfort zone is the frontend. I've been keeping up with AI/ML at a self-learner level — taken some online courses, played with vector search, built a small RAG side project — but I haven't done it in a professional capacity yet.",
      "location": "Hyderabad, Telangana",
      "country": "India",
      "years_of_experience": 8.4,
      "current_title": "Frontend Engineer",
      "current_company": "Zomato",
      "current_company_size": "5001-10000",
      "current_industry": "Food Delivery"
    },
    "career_history": [
      {
        "company": "Zomato",
        "title": "Frontend Engineer",
        "start_date": "2023-09-10",
        "end_date": null,
        "duration_months": 33,
        "is_current": true,
        "industry": "Food Delivery",
        "company_size": "5001-10000",
        "description": "Frontend engineering at a food-delivery scale. React, TypeScript, and the typical surrounding tooling (Webpack, Jest, Cypress). Built the company's design system from scratch."
      }
    ],
    "education": [
      {
        "institution": "Lovely Professional University",
        "degree": "B.E.",
        "field_of_study": "Statistics",
        "start_year": 2012,
        "end_year": 2015,
        "grade": "7.45 CGPA",
        "tier": "tier_3"
      }
    ],
    "skills": [
      { "name": "FAISS", "proficiency": "advanced", "endorsements": 40, "duration_months": 44 },
      { "name": "OpenSearch", "proficiency": "advanced", "endorsements": 47, "duration_months": 59 },
      { "name": "GANs", "proficiency": "advanced", "endorsements": 9, "duration_months": 33 },
      { "name": "Tailwind", "proficiency": "intermediate", "endorsements": 2, "duration_months": 32 }
    ],
    "redrob_signals": {
      "profile_completeness_score": 61.9,
      "signup_date": "2025-04-29",
      "last_active_date": "2026-04-12",
      "open_to_work_flag": false,
      "profile_views_received_30d": 21,
      "applications_submitted_30d": 1,
      "recruiter_response_rate": 0.8,
      "avg_response_time_hours": 7.7,
      "skill_assessment_scores": {
        "FAISS": 77.6
      },
      "connection_count": 708,
      "endorsements_received": 63,
      "notice_period_days": 90,
      "expected_salary_range_inr_lpa": { "min": 9.0, "max": 30.0 },
      "preferred_work_mode": "remote",
      "willing_to_relocate": false,
      "github_activity_score": -1,
      "search_appearance_30d": 12,
      "saved_by_recruiters_30d": 0,
      "interview_completion_rate": 0.55,
      "offer_acceptance_rate": -1,
      "verified_email": true,
      "verified_phone": true,
      "linkedin_connected": false
    }
  },
  {
    "candidate_id": "CAND_0000021",
    "profile": {
      "anonymized_name": "Rahul Joshi",
      "headline": "Project Manager | AI enthusiast | Building with LLMs",
      "summary": "Project Manager with 14.5+ years of experience driving outcomes in my domain. I have built strong functional expertise in team management, stakeholder communication, and project delivery. Recently I've been extremely excited about how AI and GenAI tools can augment my work. I've been taking online courses on RAG and vector databases, experimenting with LangChain and the OpenAI API for side projects. Open to roles that combine my existing domain experience with emerging AI technologies.",
      "location": "Bhubaneswar, Odisha",
      "country": "India",
      "years_of_experience": 14.5,
      "current_title": "Project Manager",
      "current_company": "Wipro",
      "current_company_size": "10001+",
      "current_industry": "IT Services"
    },
    "career_history": [
      {
        "company": "Wipro",
        "title": "Project Manager",
        "start_date": "2023-12-09",
        "end_date": null,
        "duration_months": 30,
        "is_current": true,
        "industry": "IT Services",
        "company_size": "10001+",
        "description": "Led non-technical enterprise deployment projects. Handled agile sprints and vendor coordination."
      }
    ],
    "education": [
      {
        "institution": "Tier-3 Engineering College",
        "degree": "B.Tech",
        "field_of_study": "Artificial Intelligence",
        "start_year": 2008,
        "end_year": 2011,
        "grade": "9.30 CGPA",
        "tier": "tier_4"
      }
    ],
    "skills": [
      { "name": "Fine-tuning LLMs", "proficiency": "advanced", "endorsements": 4, "duration_months": 4 },
      { "name": "LangChain", "proficiency": "intermediate", "endorsements": 1, "duration_months": 7 },
      { "name": "Vector Search", "proficiency": "intermediate", "endorsements": 3, "duration_months": 13 },
      { "name": "Embeddings", "proficiency": "advanced", "endorsements": 4, "duration_months": 18 },
      { "name": "FAISS", "proficiency": "intermediate", "endorsements": 2, "duration_months": 8 }
    ],
    "redrob_signals": {
      "profile_completeness_score": 58.5,
      "signup_date": "2026-02-10",
      "last_active_date": "2025-11-21",
      "open_to_work_flag": false,
      "profile_views_received_30d": 1,
      "applications_submitted_30d": 8,
      "recruiter_response_rate": 0.49,
      "avg_response_time_hours": 98.7,
      "skill_assessment_scores": {},
      "connection_count": 52,
      "endorsements_received": 3,
      "notice_period_days": 60,
      "expected_salary_range_inr_lpa": { "min": 10.9, "max": 24.4 },
      "preferred_work_mode": "hybrid",
      "willing_to_relocate": true,
      "github_activity_score": 6.4,
      "search_appearance_30d": 8,
      "saved_by_recruiters_30d": 3,
      "interview_completion_rate": 0.53,
      "offer_acceptance_rate": -1,
      "verified_email": true,
      "verified_phone": true,
      "linkedin_connected": true
    }
  },
  {
    "candidate_id": "CAND_0000031",
    "profile": {
      "anonymized_name": "Ela Singh",
      "headline": "Recommendation Systems Engineer | Search, Ranking & Retrieval",
      "summary": "Machine learning engineer with 6.0 years of experience building ML-powered features in production. Strong background in NLP, recommendation systems, and applied AI; comfortable across the ML stack from feature engineering through deployment. Recently, I led the team that migrated our keyword-search-based product to embedding-based retrieval. I've learned that most retrieval problems are actually evaluation problems in disguise. My academic background is in CS/ML but my main learning has come from shipping real systems and seeing what holds up under production load. Open to senior IC roles in applied ML or AI engineering, ideally at product companies where I'd own a meaningful piece of the ML stack.",
      "location": "Hyderabad, Telangana",
      "country": "India",
      "years_of_experience": 6.0,
      "current_title": "Recommendation Systems Engineer",
      "current_company": "Swiggy",
      "current_company_size": "5001-10000",
      "current_industry": "Food Delivery"
    },
    "career_history": [
      {
        "company": "Swiggy",
        "title": "Recommendation Systems Engineer",
        "start_date": "2025-04-02",
        "end_date": null,
        "duration_months": 14,
        "is_current": true,
        "industry": "Food Delivery",
        "company_size": "5001-10000",
        "description": "Trained and shipped multiple ranking models for our product's discovery feed using XGBoost and LightGBM. Designed features across three families: content metadata, user behavior signals, and item engagement history. Owned the offline-online correlation analysis that determined which offline metrics (NDCG, MAP) actually predicted A/B test outcomes."
      },
      {
        "company": "Zomato",
        "title": "Applied ML Engineer",
        "start_date": "2020-06-27",
        "end_date": "2021-07-22",
        "duration_months": 13,
        "is_current": false,
        "industry": "Food Delivery",
        "company_size": "5001-10000",
        "description": "Owned the ranking layer for an e-commerce search product, evolving it from a hand-tuned scoring function to a learning-to-rank model over 9 months. Created deep embedding models and computed ranking evaluation on MRR and MAP metrics."
      }
    ],
    "education": [
      {
        "institution": "SRM University",
        "degree": "M.Tech",
        "field_of_study": "Computer Engineering",
        "start_year": 2002,
        "end_year": 2006,
        "grade": "9.16 CGPA",
        "tier": "tier_2"
      }
    ],
    "skills": [
      { "name": "Python", "proficiency": "expert", "endorsements": 88, "duration_months": 72 },
      { "name": "FAISS", "proficiency": "advanced", "endorsements": 19, "duration_months": 35 },
      { "name": "Pinecone", "proficiency": "expert", "endorsements": 34, "duration_months": 88 },
      { "name": "Machine Learning", "proficiency": "advanced", "endorsements": 43, "duration_months": 23 },
      { "name": "Embeddings", "proficiency": "expert", "endorsements": 48, "duration_months": 60 },
      { "name": "Information Retrieval", "proficiency": "expert", "endorsements": 150, "duration_months": 84 },
      { "name": "Sentence Transformers", "proficiency": "expert", "endorsements": 16, "duration_months": 69 },
      { "name": "scikit-learn", "proficiency": "advanced", "endorsements": 41, "duration_months": 60 }
    ],
    "redrob_signals": {
      "profile_completeness_score": 83.4,
      "signup_date": "2026-01-28",
      "last_active_date": "2026-05-24",
      "open_to_work_flag": true,
      "profile_views_received_30d": 194,
      "applications_submitted_30d": 2,
      "recruiter_response_rate": 0.91,
      "avg_response_time_hours": 7.6,
      "skill_assessment_scores": {
        "MLflow": 75.1,
        "FAISS": 68.4,
        "Pinecone": 53.6
      },
      "connection_count": 832,
      "endorsements_received": 177,
      "notice_period_days": 15,
      "expected_salary_range_inr_lpa": { "min": 27.3, "max": 60.2 },
      "preferred_work_mode": "flexible",
      "willing_to_relocate": true,
      "github_activity_score": 82.6,
      "search_appearance_30d": 778,
      "saved_by_recruiters_30d": 13,
      "interview_completion_rate": 0.95,
      "offer_acceptance_rate": 0.88,
      "verified_email": true,
      "verified_phone": true,
      "linkedin_connected": true
    }
  }
];

export const supplementaryCandidates = (): Candidate[] => {
  const list: Candidate[] = [...initialCandidates];

  const candidateTemplate = (id: string, name: string, title: string, exp: number, codeHub: number, responsiveness: number, hasEmbeddings: boolean): Candidate => {
    return {
      candidate_id: id,
      profile: {
        anonymized_name: name,
        headline: `${title} | Embeddings, Search & Retrieval Systems`,
        summary: `Highly motivated software developer with ${exp} years of specialized experience in ML, retrieval systems, and vector databases. Built production pipelines with sentence-transformers and FAISS. Deep understanding of search evaluation metrics such as MAP, NDCG, and MRR. Focused on shipping robust AI pipelines in fast-paced startup environments.`,
        location: "Bangalore",
        country: "India",
        years_of_experience: exp,
        current_title: title,
        current_company: "HyperCore AI",
        current_company_size: "11-50",
        "current_industry": "AI/Software"
      },
      career_history: [
        {
          company: "HyperCore AI",
          title: title,
          start_date: "2023-01-10",
          end_date: null,
          duration_months: 41,
          is_current: true,
          industry: "AI/Software",
          company_size: "11-50",
          description: `Designed and deployed production ML retrieval architectures using FAISS indices. Managed embeddings generation routines, reducing latency by 45%. Conducted offline evaluations using MRR, MAP, and NDCG. Built with Python, PyTorch, and learning-to-rank systems.`
        }
      ],
      education: [
        {
          institution: "IIT Madras",
          degree: "B.Tech",
          "field_of_study": "Computer Science",
          start_year: 2015,
          end_year: 2019,
          grade: "9.1 CGPA",
          tier: "tier_1"
        }
      ],
      skills: [
        { name: "Python", proficiency: "expert", endorsements: 44, duration_months: exp * 12 },
        { name: "FAISS", proficiency: "advanced", endorsements: 28, duration_months: 30 },
        { name: "Embeddings", proficiency: "expert", endorsements: 33, duration_months: 36 },
        { name: "Vector Search", proficiency: "advanced", endorsements: 42, duration_months: 36 },
        { name: "Retrieval Systems", proficiency: "expert", endorsements: 39, duration_months: 42 }
      ],
      redrob_signals: {
        profile_completeness_score: 94.2,
        signup_date: "2024-05-15",
        last_active_date: "2026-06-12",
        open_to_work_flag: true,
        profile_views_received_30d: 85,
        applications_submitted_30d: 4,
        recruiter_response_rate: responsiveness,
        avg_response_time_hours: 4.5,
        skill_assessment_scores: hasEmbeddings ? { "FAISS": 88, "Embeddings": 92 } : {},
        connection_count: 512,
        endorsements_received: 99,
        notice_period_days: 30,
        expected_salary_range_inr_lpa: { min: 28.0, max: 48.0 },
        preferred_work_mode: "remote",
        willing_to_relocate: true,
        github_activity_score: codeHub,
        search_appearance_30d: 412,
        saved_by_recruiters_30d: 21,
        interview_completion_rate: 0.92,
        offer_acceptance_rate: 0.85,
        verified_email: true,
        verified_phone: true,
        linkedin_connected: true
      }
    };
  };

  // Add highly strategic candidates that correspond directly to standard results
  list.push(candidateTemplate("CAND_0004989", "Ananya Sharma", "AI Tech Lead", 6.1, 88.0, 0.76, true));
  list.push(candidateTemplate("CAND_0001195", "Rohit Vyas", "Senior ML Engineer", 8.7, 72.0, 0.20, true));
  list.push(candidateTemplate("CAND_0003114", "Vikram Sen", "Search Engineer", 6.4, 91.0, 0.88, true));
  list.push(candidateTemplate("CAND_0000339", "Ishita Saxena", "AI Engineer", 8.3, 64.0, 0.72, true));
  list.push(candidateTemplate("CAND_0001082", "Aravind Nair", "Founding AI Engineer", 5.0, 78.0, 0.62, true));
  list.push(candidateTemplate("CAND_0001218", "Tanya Gupta", "ML Architect", 10.4, 82.0, 0.56, true));
  list.push(candidateTemplate("CAND_0004558", "Kabir Mehra", "Machine Learning Lead", 5.1, 69.0, 0.54, true));
  list.push(candidateTemplate("CAND_0001753", "Diya Kumar", "Ranking Systems Engineer", 8.3, 75.0, 0.53, true));
  list.push(candidateTemplate("CAND_0001503", "Nikhil Chopra", "Retrieval Lead", 8.0, 84.0, 0.32, true));
  list.push(candidateTemplate("CAND_0004548", "Pooja Trivedi", "ML Engineer", 7.3, 90.0, 0.30, true));

  // Add some other general profiles and a massive expanded technical list to hit target variation and scale
  const techNames = [
    "Aarav Sharma", "Aditya Patel", "Vivaan Sengupta", "Siddharth Rao", "Arjun Bhatia",
    "Sai Krishna", "Reyansh Kapoor", "Krishna Acharya", "Ishaan Joshi", "Shaurya Deshmukh",
    "Ananya Iyer", "Diya Banerjee", "Saanvi Nair", "Pari Mukhopadhyay", "Anika Chawla",
    "Aanya Sen", "Prisha Reddy", "Kavya Menon", "Aadhya Saxena", "Myra Choudhury",
    "Vihaan Gokhale", "Atharva Kulkarni", "Kabir Roy", "Aryan Gupta", "Rudra Pillai",
    "Diya Malhotra", "Kiara Khanna", "Riya Chadha", "Ira Trivedi", "Shanaya Verma",
    "Dev Rawat", "Samar Verma", "Dhruv Shrivastav", "Neil Singhal", "Alok Pandey",
    "Meera Hegde", "Zara Yusuf", "Tanya Kaul", "Goel Aditi", "Richa Chhabra"
  ];

  const techTitles = [
    "Senior AI Solutions Architect", "Machine Learning Software Lead", "Vector Database Engineer",
    "Semantic Search Specialist", "LLM Fine-tuning Engineer", "RecSys Algorithm Developer",
    "Production Systems Engineer", "NLP Deep Learning Lead"
  ];

  const subSkills = [
    ["Python", "FAISS", "Embeddings", "Vector Search", "Retrieval Systems"],
    ["Python", "PyTorch", "transformers", "LLMs", "LoRA"],
    ["Python", "scikit-learn", "XGBoost", "Ranking Systems", "MAP"],
    ["Python", "C++", "CUDA", "retrieval", "Embeddings", "FAISS"],
    ["Python", "Docker", "Kubernetes", "MLflow", "Vector Search"]
  ];

  // Generate 125 technical candidates of high competence (to pass the fast-filter and populate the list of 100)
  for (let i = 0; i < 125; i++) {
    const candId = `CAND_000${(100 + i).toString().padStart(4, "0")}`;
    const name = techNames[i % techNames.length] + " (" + (100 + i) + ")";
    const title = techTitles[i % techTitles.length];
    const exp = 4 + (i % 6); // 4 to 9 years (sweet-spot!)
    const targetSkillsGroup = subSkills[i % subSkills.length];
    
    const skillsArray = targetSkillsGroup.map((sName, sIdx) => ({
      name: sName,
      proficiency: (sIdx === 0 ? "expert" : sIdx % 2 === 0 ? "advanced" : "intermediate") as any,
      endorsements: 15 + (i % 30),
      duration_months: exp * 12 - (sIdx * 6)
    }));

    const responseRate = 0.45 + (i % 11) * 0.05; // 45% to 95%
    const githubScore = 20 + (i % 17) * 5; // 20 to 100
    const noticeDays = [15, 30, 45, 60, 90][i % 5];
    const salMin = 22 + (i % 15) * 2;
    
    list.push({
      candidate_id: candId,
      profile: {
        anonymized_name: name,
        headline: `${title} | Specialized in ${targetSkillsGroup.slice(0, 3).join(", ")}`,
        summary: `Dedicated technical practitioner with ${exp} years of industry involvement. Experienced in coding highly parallel ${title} instances, deploying neural search parameters, and fine-tuning BERT embeddings. Dedicated to continuous learning, semantic accuracy, and high developer efficiency.`,
        location: ["Bangalore", "Mumbai", "Hyderabad", "Noida", "Pune"][i % 5],
        country: "India",
        years_of_experience: exp,
        current_title: title,
        current_company: ["Oracle AI", "Infosys Edge", "Razorpay ML", "Flipkart Search", "Swiggy Discovery"][i % 5],
        current_company_size: "1001-5000",
        current_industry: "Technology"
      },
      career_history: [
        {
          company: ["Oracle AI", "Infosys Edge", "Razorpay ML", "Flipkart Search", "Swiggy Discovery"][i % 5],
          title: title,
          start_date: "2022-04-15",
          end_date: null,
          duration_months: 26 + (i % 12),
          is_current: true,
          industry: "Technology",
          company_size: "1001-5000",
          description: `Spearheaded corporate deployments for ${targetSkillsGroup[1]} workflows. Evaluated vector models using NDCG, MAP, and MRR. Configured robust search clusters in distributed servers.`
        }
      ],
      education: [
        {
          institution: ["IIT Bombay", "BITS Pilani", "Delhi Technological University", "Anna University"][i % 4],
          degree: "B.Tech",
          field_of_study: "Information Technology",
          start_year: 2014,
          end_year: 2018,
          grade: "8.8 CGPA",
          tier: (i % 2 === 0 ? "tier_1" : "tier_2") as any
        }
      ],
      skills: skillsArray,
      redrob_signals: {
        profile_completeness_score: 80 + (i % 21),
        signup_date: "2024-02-12",
        last_active_date: "2026-06-11",
        open_to_work_flag: i % 3 === 0,
        profile_views_received_30d: 50 + i * 2,
        applications_submitted_30d: i % 4,
        recruiter_response_rate: responseRate,
        avg_response_time_hours: 2.1 + (i % 10) * 0.8,
        skill_assessment_scores: { "ML": 70 + (i % 25) },
        connection_count: 200 + i * 5,
        endorsements_received: 30 + i,
        notice_period_days: noticeDays,
        expected_salary_range_inr_lpa: { min: salMin, max: salMin + 15 },
        preferred_work_mode: i % 2 === 0 ? "remote" : "hybrid",
        willing_to_relocate: i % 4 !== 0,
        github_activity_score: githubScore,
        search_appearance_30d: 300 + i * 10,
        saved_by_recruiters_30d: 1 + (i % 12),
        interview_completion_rate: 0.82 + (i % 9) * 0.02,
        offer_acceptance_rate: 0.70 + (i % 6) * 0.05,
        verified_email: true,
        verified_phone: true,
        linkedin_connected: i % 3 !== 0
      }
    });
  }

  // Add 15 general non-tech profiles (which will fail Stage 1 fast filtering as expected)
  const generalTitles = ["QA Engineer", "Operations Associate", "Financial Advisor", "Administrative Officer", "Sales Consultant"];
  const generalNames = ["Rohan Roy", "Karan Seth", "Neha Kapoor", "Sanjay Dutt", "Arjun Kapoor", "Preity Zinta", "Rahul Deshmukh", "Tanvi Bhatia", "Aditi Rao", "Gaurav Malhotra"];
  for (let j = 0; j < 15; j++) {
    const isLpaMin = 5 + j;
    list.push({
      candidate_id: `CAND_90000${10 + j}`,
      profile: {
        anonymized_name: generalNames[j % generalNames.length],
        headline: `${generalTitles[j % generalTitles.length]} with ${4 + j % 6} years of experience`,
        summary: `Experienced professional working as an expert ${generalTitles[j % generalTitles.length]}. Strong background in corporate administration, client coordination and spreadsheet bookkeeping.`,
        location: "Mumbai",
        country: "India",
        years_of_experience: 4 + (j % 6),
        current_title: generalTitles[j % generalTitles.length],
        current_company: "Wipro Technologies",
        current_company_size: "10001+",
        current_industry: "Consulting"
      },
      career_history: [
        {
          company: "Wipro Technologies",
          title: generalTitles[j % generalTitles.length],
          start_date: "2021-02-10",
          end_date: null,
          duration_months: 36,
          is_current: true,
          industry: "Consulting",
          company_size: "10001+",
          description: "Led daily project workflows, managed client meetings and prepared internal office compliance logs."
        }
      ],
      education: [
        {
          institution: "Mumbai University",
          degree: "M.Com",
          field_of_study: "Finance",
          start_year: 2016,
          end_year: 2018,
          grade: "7.5 CGPA",
          tier: "tier_3"
        }
      ],
      skills: [
        { name: "Agile", proficiency: "intermediate", endorsements: 12, duration_months: 36 },
        { name: "Excel", proficiency: "advanced", endorsements: 66, duration_months: 48 },
        { name: "SOP Operations", proficiency: "advanced", endorsements: 11, duration_months: 24 }
      ],
      redrob_signals: {
        profile_completeness_score: 70,
        signup_date: "2024-03-10",
        last_active_date: "2026-01-20",
        open_to_work_flag: false,
        profile_views_received_30d: 12,
        applications_submitted_30d: 1,
        recruiter_response_rate: 0.15 + (j * 0.04),
        avg_response_time_hours: 112.5,
        skill_assessment_scores: {},
        connection_count: 120,
        endorsements_received: 12,
        notice_period_days: 90,
        expected_salary_range_inr_lpa: { min: isLpaMin, max: isLpaMin + 4 },
        preferred_work_mode: "hybrid",
        willing_to_relocate: false,
        github_activity_score: -1,
        search_appearance_30d: 45,
        saved_by_recruiters_30d: 2,
        interview_completion_rate: 0.55,
        offer_acceptance_rate: 0.40,
        verified_email: true,
        verified_phone: true,
        linkedin_connected: false
      }
    });
  }

  return list;
};
