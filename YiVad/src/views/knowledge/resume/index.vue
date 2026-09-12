<template>
  <div class="resume-container">
    <!-- Header -->
    <div class="resume-header">
      <div class="header-avatar">
        <el-avatar :size="96" icon="UserFilled" />
      </div>
      <div class="header-info">
        <h1 class="header-name">Forward Deployed Engineer</h1>
        <p class="header-tagline">
          Technical Special Forces &mdash; between SWE, AI Architect, and Strategy Consultant
        </p>
        <div class="header-meta">
          <el-tag type="primary" effect="dark" round>FDE</el-tag>
          <el-tag effect="plain" round>Glue Code, Not Feature Code</el-tag>
          <el-tag effect="plain" round>50% Integration + 50% Strategy</el-tag>
          <el-tag effect="plain" round>Embedded Engineering</el-tag>
        </div>
      </div>
    </div>

    <!-- Professional Summary -->
    <el-card class="resume-section" shadow="hover">
      <template #header>
        <span class="section-title">Professional Summary</span>
      </template>
      <div class="summary-grid">
        <div class="summary-item">
          <el-icon :size="20" color="#409eff"><Aim /></el-icon>
          <div>
            <strong>The Delta</strong>
            <p>Bridge the gap between product out-of-the-box capability and the customer's mission. Write glue code that stitches modern SaaS/AI into legacy, messy reality.</p>
          </div>
        </div>
        <div class="summary-item">
          <el-icon :size="20" color="#67c23a"><Connection /></el-icon>
          <div>
            <strong>Embedded Engineering</strong>
            <p>Hold customer credentials, join customer Slack, submit directly to customer production. Not remote advice — on the ground, in the environment.</p>
          </div>
        </div>
        <div class="summary-item">
          <el-icon :size="20" color="#e6a23c"><TrendCharts /></el-icon>
          <div>
            <strong>Productized Consulting</strong>
            <p>Solve customer-unique problems with code, abstract solutions back into the core product. Make yourself redundant — the system runs itself after FDE exit.</p>
          </div>
        </div>
        <div class="summary-item">
          <el-icon :size="20" color="#f56c6c"><Opportunity /></el-icon>
          <div>
            <strong>80/20 Value Scoping</strong>
            <p>Identify the 20% of features that solve 80% of pain points. No gold-plating. Every integration connects to a business measurement.</p>
          </div>
        </div>
      </div>
    </el-card>

    <!-- Core Competencies -->
    <el-row :gutter="16">
      <el-col :span="12">
        <el-card class="resume-section" shadow="hover">
          <template #header>
            <span class="section-title">Core Competencies</span>
          </template>
          <div class="competency-list">
            <div class="competency-item">
              <div class="competency-label">
                <span>Last-Mile Integration</span>
                <el-tag size="small" type="primary">95%</el-tag>
              </div>
              <el-progress :percentage="95" :stroke-width="8" color="#409eff" />
            </div>
            <div class="competency-item">
              <div class="competency-label">
                <span>Delta Identification</span>
                <el-tag size="small" type="success">90%</el-tag>
              </div>
              <el-progress :percentage="90" :stroke-width="8" color="#67c23a" />
            </div>
            <div class="competency-item">
              <div class="competency-label">
                <span>Consulting Frameworks</span>
                <el-tag size="small" type="warning">88%</el-tag>
              </div>
              <el-progress :percentage="88" :stroke-width="8" color="#e6a23c" />
            </div>
            <div class="competency-item">
              <div class="competency-label">
                <span>Site Survey & Discovery</span>
                <el-tag size="small" type="primary">92%</el-tag>
              </div>
              <el-progress :percentage="92" :stroke-width="8" color="#409eff" />
            </div>
            <div class="competency-item">
              <div class="competency-label">
                <span>Statement of Work (SOW)</span>
                <el-tag size="small" type="success">85%</el-tag>
              </div>
              <el-progress :percentage="85" :stroke-width="8" color="#67c23a" />
            </div>
            <div class="competency-item">
              <div class="competency-label">
                <span>Day 2 Operations</span>
                <el-tag size="small" type="warning">82%</el-tag>
              </div>
              <el-progress :percentage="82" :stroke-width="8" color="#e6a23c" />
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="resume-section" shadow="hover">
          <template #header>
            <span class="section-title">Technical Toolchain</span>
          </template>
          <div class="toolchain-grid">
            <div class="toolchain-group">
              <h4>Languages & Data</h4>
              <div class="tag-row">
                <el-tag size="small" type="primary">Python</el-tag>
                <el-tag size="small" type="primary">Go</el-tag>
                <el-tag size="small" type="primary">SQL</el-tag>
                <el-tag size="small" type="primary">dbt</el-tag>
                <el-tag size="small" type="primary">DuckDB</el-tag>
              </div>
            </div>
            <div class="toolchain-group">
              <h4>Infrastructure & Orchestration</h4>
              <div class="tag-row">
                <el-tag size="small" type="success">K3s</el-tag>
                <el-tag size="small" type="success">MicroK8s</el-tag>
                <el-tag size="small" type="success">Terraform</el-tag>
                <el-tag size="small" type="success">Helm</el-tag>
                <el-tag size="small" type="success">Docker</el-tag>
              </div>
            </div>
            <div class="toolchain-group">
              <h4>LLM & AI Inference</h4>
              <div class="tag-row">
                <el-tag size="small" type="warning">Ollama</el-tag>
                <el-tag size="small" type="warning">vLLM</el-tag>
                <el-tag size="small" type="warning">llama.cpp</el-tag>
                <el-tag size="small" type="warning">TensorRT-LLM</el-tag>
                <el-tag size="small" type="warning">ADK</el-tag>
              </div>
            </div>
            <div class="toolchain-group">
              <h4>Observability</h4>
              <div class="tag-row">
                <el-tag size="small" type="danger">Prometheus</el-tag>
                <el-tag size="small" type="danger">Grafana</el-tag>
                <el-tag size="small" type="danger">Loki</el-tag>
                <el-tag size="small" type="danger">PagerDuty</el-tag>
              </div>
            </div>
            <div class="toolchain-group">
              <h4>Air-Gap & Security</h4>
              <div class="tag-row">
                <el-tag size="small" type="info">Iron Bank</el-tag>
                <el-tag size="small" type="info">Harbor</el-tag>
                <el-tag size="small" type="info">Cosign</el-tag>
                <el-tag size="small" type="info">Vault</el-tag>
                <el-tag size="small" type="info">Kyverno</el-tag>
                <el-tag size="small" type="info">Trivy</el-tag>
              </div>
            </div>
            <div class="toolchain-group">
              <h4>Enterprise RAG</h4>
              <div class="tag-row">
                <el-tag size="small">Hybrid Search</el-tag>
                <el-tag size="small">BM25</el-tag>
                <el-tag size="small">Cross-Encoder Rerank</el-tag>
                <el-tag size="small">Vector DB</el-tag>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- FDE Methodology Framework -->
    <el-card class="resume-section" shadow="hover">
      <template #header>
        <span class="section-title">FDE Methodology Framework</span>
      </template>
      <el-timeline>
        <el-timeline-item
          v-for="(method, idx) in methodologies"
          :key="idx"
          :timestamp="method.phase"
          placement="top"
          :color="method.color"
          :icon="method.icon"
          size="large"
        >
          <el-card shadow="hover" class="method-card">
            <div class="method-header">
              <h3>{{ method.title }}</h3>
              <el-tag :type="method.tagType" size="small">{{ method.tag }}</el-tag>
            </div>
            <p class="method-desc">{{ method.desc }}</p>
            <div class="method-details">
              <div v-for="(detail, didx) in method.details" :key="didx" class="method-detail-item">
                <el-icon :size="14" color="#409eff"><Check /></el-icon>
                <span>{{ detail }}</span>
              </div>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-card>

    <!-- Architecture Decision Records -->
    <el-card class="resume-section" shadow="hover">
      <template #header>
        <span class="section-title">Architecture Decision Records</span>
      </template>
      <el-row :gutter="16">
        <el-col :span="12" v-for="adr in adrs" :key="adr.id">
          <el-card shadow="hover" class="adr-card">
            <div class="adr-header">
              <el-tag :type="adr.statusType" size="small">{{ adr.status }}</el-tag>
              <span class="adr-id">{{ adr.id }}</span>
            </div>
            <h4>{{ adr.title }}</h4>
            <p>{{ adr.summary }}</p>
            <div class="adr-dimensions">
              <el-tag
                v-for="dim in adr.dimensions"
                :key="dim"
                size="small"
                effect="plain"
                round
              >
                {{ dim }}
              </el-tag>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <!-- Lessons Learned -->
    <el-row :gutter="16">
      <el-col :span="12">
        <el-card class="resume-section" shadow="hover">
          <template #header>
            <span class="section-title">
              <el-icon color="#f56c6c"><WarningFilled /></el-icon>
              Gotchas & Pitfalls
            </span>
          </template>
          <div class="lesson-list">
            <div class="lesson-item" v-for="g in gotchas" :key="g.title">
              <el-icon color="#e6a23c"><Warning /></el-icon>
              <div>
                <strong>{{ g.title }}</strong>
                <p>{{ g.desc }}</p>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="resume-section" shadow="hover">
          <template #header>
            <span class="section-title">
              <el-icon color="#f56c6c"><CircleCloseFilled /></el-icon>
              Failure Retrospectives
            </span>
          </template>
          <div class="lesson-list">
            <div class="lesson-item" v-for="f in failures" :key="f.title">
              <el-icon color="#f56c6c"><CircleClose /></el-icon>
              <div>
                <strong>{{ f.title }}</strong>
                <p>{{ f.desc }}</p>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- FDE vs SWE Comparison -->
    <el-card class="resume-section" shadow="hover">
      <template #header>
        <span class="section-title">FDE vs. Traditional SWE</span>
      </template>
      <el-table :data="comparisonData" border stripe style="width: 100%">
        <el-table-column prop="dimension" label="Dimension" width="160" />
        <el-table-column prop="swe" label="Software Engineer">
          <template #default="{ row }">
            <span class="table-cell-swe">{{ row.swe }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="fde" label="Forward Deployed Engineer">
          <template #default="{ row }">
            <span class="table-cell-fde">{{ row.fde }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, type Component } from "vue";
import {
  Aim,
  Connection,
  TrendCharts,
  Opportunity,
  Check,
  WarningFilled,
  Warning,
  CircleCloseFilled,
  CircleClose,
  DataAnalysis,
  Search,
  Document,
  Monitor,
  Lock,
} from "@element-plus/icons-vue";

type TagType = "success" | "warning" | "info" | "primary" | "danger";

interface MethodologyItem {
  phase: string;
  title: string;
  tag: string;
  tagType: TagType;
  color: string;
  icon: Component;
  desc: string;
  details: string[];
}

const methodologies = reactive<MethodologyItem[]>([
  {
    phase: "Phase 1",
    title: "Discovery Call & Site Survey",
    tag: "Week 1",
    tagType: "primary",
    color: "#409eff",
    icon: Search,
    desc: "Land in Week 1 with 4 fixed sections: Data Landscape, Technical/Security Constraints, Delta identification, and a falsifiable Quick Win. Identify internal champion and blockers. Not meeting minutes — landing documentation.",
    details: [
      "Data Landscape: source systems, data gravity, known quality issues",
      "Technical/Security: identity, connectivity, exfiltration risks",
      "Delta: product gap + proposed glue code",
      "Quick Win: falsifiable Week 2 goal (e.g., Agent Search 90% recall)",
    ],
  },
  {
    phase: "Phase 2",
    title: "Consulting Frameworks",
    tag: "Structured Thinking",
    tagType: "success",
    color: "#67c23a",
    icon: DataAnalysis,
    desc: "Apply Pyramid Principle (BLUF: Bottom-Line Up Front), MECE decomposition, Trusted Advisor formula, and Three Whys diagnosis. Not rhetoric — structured thinking that drives implementation.",
    details: [
      "Pyramid Principle: conclusion → 3 pillars → data, not the reverse",
      "MECE: Mutually Exclusive, Collectively Exhaustive decomposition",
      "Trusted Advisor: Trust = (Credibility + Reliability + Intimacy) / Self-Orientation",
      "Three Whys: System of Record → Cost of Inaction → Day 2 owner",
    ],
  },
  {
    phase: "Phase 3",
    title: "Minimum Viable Architecture (MVA)",
    tag: "30-Day Proof",
    tagType: "warning",
    color: "#e6a23c",
    icon: Opportunity,
    desc: "The simplest architecture that proves value within 30 days. Cloud Run + BigQuery first, not GKE + data lake. Prove value first, then scale. Every component tied to business measurement.",
    details: [
      "30-day anchoring: prove value, not 90 days",
      "Minimum component set: Cloud Run + BigQuery, not GKE + streaming",
      "Phased Delivery: MVP → Scale → Optimize",
      "FinOps anchored: cost observable, not burning blindly",
    ],
  },
  {
    phase: "Phase 4",
    title: "Statement of Work (SOW)",
    tag: "Contract",
    tagType: "danger",
    color: "#f56c6c",
    icon: Document,
    desc: "SOW is a contract, not a plan. In-Scope + Out-of-Scope + Phased Delivery + Acceptance Criteria + Anti-Scope-Creep. MSA/SOW/CoI three-layer division. Not in SOW = scope creep.",
    details: [
      "In-Scope: every deliverable measurable",
      "Out-of-Scope: explicit — legacy AS400 deferred to Q3",
      "Acceptance Criteria: >90% recall, <5s latency, 0% hallucination",
      "Anti-Scope-Creep: changes go through change request, no verbal agreements",
    ],
  },
  {
    phase: "Phase 5",
    title: "Air-Gap & Compliance Deployment",
    tag: "Zero Internet",
    tagType: "info",
    color: "#909399",
    icon: Lock,
    desc: "Offline is a separate stack, not a subset of cloud. Pre-position everything: weights + package mirror + hardened registry + PKI + secrets + NTP. Day 1 assumes no internet, always.",
    details: [
      "K3s + Ollama/vLLM + Iron Bank + Cosign + Vault + Chrony",
      "One-way Data Diode / CDS for cross-domain data flow",
      "Image hardening: distroless, no shell = no pivot",
      "Day -7 drill: 4 classes of pitfall injection in mirrored env",
    ],
  },
  {
    phase: "Phase 6",
    title: "Day 2 Operations & Handover",
    tag: "Self-Redundancy",
    tagType: "success",
    color: "#67c23a",
    icon: Monitor,
    desc: "Day 2 is not a wrap-up; it is the foundation of project survival. FDE exit goal: make yourself redundant. Six-piece set: handover + monitoring + retraining + oncall + runbook + KT.",
    details: [
      "Internal Owner: identified in Week 1, no owner = project death",
      "Run Team training: transfer 1st-line support to customer Ops",
      "Monitoring: Prediction Drift + Feature Attribution + Latency + Error Rate",
      "30/60/90-day follow-up spot audits after handover",
    ],
  },
]);

interface AdrItem {
  id: string;
  title: string;
  status: string;
  statusType: TagType;
  summary: string;
  dimensions: string[];
  dependencies?: string[];
}

const adrs = reactive<AdrItem[]>([
  {
    id: "ADR-Fde-Delta-As-Contract",
    title: "The Delta as a Contract, Not a Feature",
    status: "Accepted",
    statusType: "success",
    summary:
      "Delta items managed as SOW attachment contracts with 4 mandatory fields: proposal glue + business metric + exit criteria + owner. Changes go through change request, not product backlog.",
    dimensions: ["Legal Traceability", "Exit Criteria", "Scope-Creep Control", "Renewal Evidence"],
  },
  {
    id: "ADR-Fde-Two-Loop-Eval-Gate",
    title: "Two-Loop Eval as Production Release Gate",
    status: "Accepted",
    statusType: "success",
    summary:
      "Inner Loop (ADK dev-time + golden dataset + 3 metrics) + Outer Loop (Pairwise + RAG triad + Model Monitoring). Failing either gate = no launch. No more vibes-test.",
    dimensions: ["Inner Loop", "Outer Loop", "Pairwise", "RAG Triad", "Golden Dataset"],
  },
  {
    id: "ADR-Fde-Hybrid-Search-Mandatory",
    title: "Hybrid Search Mandatory for Enterprise RAG",
    status: "Accepted",
    statusType: "success",
    summary:
      "All enterprise RAG deploys must use hybrid search (semantic + BM25 + cross-encoder rerank). Pure semantic recall on industry terms <60%; hybrid reaches 95%+.",
    dimensions: ["BM25", "Semantic", "Cross-Encoder", "Citation", "95%+ Recall"],
  },
  {
    id: "ADR-Fde-Air-Gap-First",
    title: "Air-Gap-First for Regulated Clients",
    status: "Accepted",
    statusType: "success",
    summary:
      "Compliance-driven customers (DoD IL4+, FedRAMP High, ITAR, CMMC L2+) default to air-gap-first. K3s + Ollama + Iron Bank + Cosign from Day 1. Cloud is only dev/test mirror.",
    dimensions: ["Air-Gap", "K3s", "Ollama", "Iron Bank", "Cosign", "Compliance"],
    dependencies: ["K3s", "Ollama", "Iron Bank", "Cosign", "Vault", "Data Diode"],
  },
]);

const gotchas = reactive([
  {
    title: "Air-Gap First Boot Surprise",
    desc: "4 classes of pitfalls: TLS cert without PKI, NTP unreachable, Cloud KMS unreachable, sneakernet ISO missing weights. Day -7 drill is mandatory.",
  },
  {
    title: "Discovery Three Whys Skipped",
    desc: "Skipping the 3rd question (Day 2 owner) during discovery means the project has no internal owner — guaranteed collapse after FDE exit.",
  },
  {
    title: "No Lockfile Supply Chain Risk",
    desc: "Missing lockfile in air-gapped environments — dependency versions drift, reproducibility breaks, security audit fails.",
  },
  {
    title: "Pure Semantic RAG Fails on Nomenclature",
    desc: "Enterprise terms (SKU codes, regulatory clause numbers, abbreviations) have <60% recall with pure semantic search. Hybrid is mandatory.",
  },
]);

const failures = reactive([
  {
    title: "FDE Exit Without Internal Owner",
    desc: "Discovery skipped 3rd Three Whys question → SOW had no exit criteria → handover was formality → system collapsed in 4-12 weeks → customer churned.",
  },
  {
    title: "Air-Gapped Pipeline Broke Without Sneakernet",
    desc: "Offline CI/CD pipeline broke; no sneakernet procedure in place; cleared engineer had to be re-dispatched; 2-week delay; customer trust eroded.",
  },
  {
    title: "Enterprise RAG Pure Semantic Baseline",
    desc: "Started with pure semantic vector search; regulatory clause recall <30%; customer lost trust in Week 2; full re-index to hybrid cost 3 weeks.",
  },
  {
    title: "Cloud-First, Air-Gap Migration Blocked",
    desc: "Verified on GKE first, discovered air-gap blockers at Week 12 (no NTP, no KMS, no package mirror). Migration took 8 weeks. Customer patience was 4 weeks.",
  },
]);

const comparisonData = reactive([
  {
    dimension: "User",
    swe: "Millions of anonymous users",
    fde: "High-risk stakeholder (CTO, General, CEO)",
  },
  {
    dimension: "Environment",
    swe: "Controlled cloud",
    fde: "Hostile, legacy, air-gapped, hybrid",
  },
  {
    dimension: "Goal",
    swe: "Scale + stability",
    fde: "Speed to value + solve the problem",
  },
  {
    dimension: "Code Ratio",
    swe: "90% features + 10% ops",
    fde: "50% integration/glue + 50% strategy",
  },
  {
    dimension: "Delivery",
    swe: "Sprint → PR → CI/CD → deploy",
    fde: "Embedded on-site, commits to customer production",
  },
  {
    dimension: "Success Metric",
    swe: "Uptime, latency, throughput",
    fde: "Customer renewal, Delta closed, system self-running",
  },
  {
    dimension: "Exit Condition",
    swe: "Feature shipped",
    fde: "Make yourself redundant; system runs itself",
  },
]);
</script>

<style scoped lang="scss">
.resume-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  background: #f5f7fa;
}

.resume-header {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 32px;
  background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
  border-radius: 12px;
  margin-bottom: 20px;
  color: #fff;

  .header-avatar {
    flex-shrink: 0;
  }

  .header-info {
    flex: 1;
  }

  .header-name {
    margin: 0 0 8px;
    font-size: 28px;
    font-weight: 700;
  }

  .header-tagline {
    margin: 0 0 16px;
    font-size: 15px;
    opacity: 0.9;
    line-height: 1.5;
  }

  .header-meta {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
}

.resume-section {
  margin-bottom: 20px;
  border-radius: 8px;

  .section-title {
    font-size: 16px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;

  .summary-item {
    display: flex;
    gap: 12px;
    padding: 12px;
    background: #fafafa;
    border-radius: 8px;
    border-left: 3px solid #409eff;

    strong {
      display: block;
      margin-bottom: 4px;
      font-size: 14px;
    }

    p {
      margin: 0;
      font-size: 13px;
      color: #606266;
      line-height: 1.6;
    }
  }
}

.competency-list {
  .competency-item {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }

    .competency-label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
      font-size: 13px;
      font-weight: 500;
    }
  }
}

.toolchain-grid {
  .toolchain-group {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }

    h4 {
      margin: 0 0 8px;
      font-size: 13px;
      font-weight: 600;
      color: #303133;
    }

    .tag-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
  }
}

.method-card {
  margin-bottom: 0;

  .method-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    h3 {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
    }
  }

  .method-desc {
    margin: 0 0 12px;
    font-size: 13px;
    color: #606266;
    line-height: 1.6;
  }

  .method-details {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;

    .method-detail-item {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      font-size: 12px;
      color: #909399;
      line-height: 1.5;
    }
  }
}

.adr-card {
  height: 100%;
  margin-bottom: 0;

  .adr-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;

    .adr-id {
      font-size: 11px;
      color: #909399;
      font-family: monospace;
    }
  }

  h4 {
    margin: 0 0 8px;
    font-size: 14px;
    font-weight: 600;
  }

  p {
    margin: 0 0 12px;
    font-size: 13px;
    color: #606266;
    line-height: 1.6;
  }

  .adr-dimensions {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
}

.lesson-list {
  .lesson-item {
    display: flex;
    gap: 10px;
    padding: 10px 0;
    border-bottom: 1px solid #ebeef5;

    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    strong {
      display: block;
      font-size: 13px;
      margin-bottom: 4px;
    }

    p {
      margin: 0;
      font-size: 12px;
      color: #909399;
      line-height: 1.5;
    }
  }
}

.table-cell-swe {
  color: #909399;
  font-size: 13px;
}

.table-cell-fde {
  color: #409eff;
  font-size: 13px;
  font-weight: 500;
}
</style>