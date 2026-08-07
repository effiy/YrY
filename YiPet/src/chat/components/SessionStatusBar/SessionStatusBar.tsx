/**
 * YiPet Chat — SessionStatusBar (compact)
 * Mirrors YiVad aiChat `SessionStatusBar.vue` at a fraction of the surface.
 * Renders between ChatMessages and ChatInput in the chat area.
 *
 * Shows: model, message count, ~token estimate (chars/4) + cumulative cost
 * sparkline, context + RAG indicators, and a streaming phase pill.
 * Clicking the token chip surfaces the input:output split (Pi-inspired:
 * input vs output economics).
 *
 * Cross-project relevance: while chatting about any project's page (YiAi,
 * YiVad, YiKnowledge, external), the user sees at a glance how much of the
 * 8K context window is consumed — the budget pressure that matters most
 * when the page content is also being shipped as context.
 */

import {
  BookOutlined,
  BulbOutlined,
  CloudOutlined,
  LoadingOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { Tooltip } from 'antd';
import { useMemo } from 'react';
import { DEFAULT_MODEL } from '@/chat/constants';
import type { ChatController } from '@/chat/controller';

const CHARS_PER_TOKEN = 4;
const CONTEXT_WINDOW = 8192;
// Coarse local pricing defaults — indicative, not billing-grade.
const INPUT_RATE_PER_1K = 0.0005;
const OUTPUT_RATE_PER_1K = 0.0015;
const SPARK_W = 56;
const SPARK_H = 12;
const SPARK_PAD = 1;

function formatCost(usd: number): string {
  if (usd < 0.01) return `$${usd.toFixed(4)}`;
  if (usd < 1) return `$${usd.toFixed(3)}`;
  return `$${usd.toFixed(2)}`;
}

export interface SessionStatusBarProps {
  controller: ChatController;
}

export function SessionStatusBar(props: SessionStatusBarProps) {
  const s = props.controller.state;

  const stats = useMemo(() => {
    const msgs = s.messages ?? [];
    const userChars = 0;
    const petChars = 0;
    let pageChars = 0;
    const costHistory: number[] = [];
    let runningUser = 0;
    let runningPet = 0;
    for (const m of msgs) {
      if (m.type === 'user') runningUser += m.content?.length ?? 0;
      else runningPet += m.content?.length ?? 0;
      const uTok = Math.ceil(runningUser / CHARS_PER_TOKEN);
      const pTok = Math.ceil(runningPet / CHARS_PER_TOKEN);
      costHistory.push((uTok / 1000) * INPUT_RATE_PER_1K + (pTok / 1000) * OUTPUT_RATE_PER_1K);
    }
    const cur = s.sessions.find((x) => x.id === s.currentSessionId);
    pageChars += cur?.pageContent?.length ?? 0;
    const userTokens = Math.ceil(runningUser / CHARS_PER_TOKEN);
    const petTokens = Math.ceil(runningPet / CHARS_PER_TOKEN);
    const total = userTokens + petTokens;
    const pct = Math.min(100, Math.round((total / CONTEXT_WINDOW) * 100));
    const estimatedCost =
      (userTokens / 1000) * INPUT_RATE_PER_1K + (petTokens / 1000) * OUTPUT_RATE_PER_1K;
    // Sparkline path + per-point coordinates for hover-to-scroll.
    let sparkPath = '';
    const points: { x: number; y: number }[] = [];
    const n = costHistory.length;
    if (n >= 2) {
      const max = costHistory[n - 1] || 1;
      const min = Math.min(...costHistory, 0);
      const range = max - min || 1;
      for (let i = 0; i < n; i++) {
        const x = SPARK_PAD + (i / (n - 1)) * (SPARK_W - 2 * SPARK_PAD);
        const y =
          SPARK_H - SPARK_PAD - ((costHistory[i] - min) / range) * (SPARK_H - 2 * SPARK_PAD);
        points.push({ x, y });
      }
      sparkPath = `M ${points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')}`;
    }
    const bandW = n >= 2 ? (SPARK_W - 2 * SPARK_PAD) / n : 0;
    return {
      userMsgs: msgs.filter((m) => m.type === 'user').length,
      petMsgs: msgs.filter((m) => m.type !== 'user').length,
      userTokens,
      petTokens,
      totalTokens: total,
      pct,
      pageChars,
      estimatedCost,
      costHistory,
      sparkPath,
      points,
      bandW,
    };
  }, [s.messages, s.sessions, s.currentSessionId]);

  const phase = (() => {
    if (!s.isProcessing && !s.streamingType) return null;
    // streamingType: '' | 'send' | 'regenerate' | 'resend'
    return s.streamingType || 'send';
  })();

  const phaseLabel =
    phase === 'send'
      ? 'Generating'
      : phase === 'regenerate'
        ? 'Regenerating'
        : phase === 'resend'
          ? 'Resending'
          : '';
  const tokenLevel = stats.pct < 50 ? 'low' : stats.pct < 80 ? 'mid' : 'high';
  const tokenTooltip = (
    <div style={{ fontSize: 12, lineHeight: 1.6, maxWidth: 320 }}>
      <div>
        <b>Input (user):</b> ~{stats.userTokens} tok · {stats.userMsgs} message(s)
      </div>
      <div>
        <b>Output (pet):</b> ~{stats.petTokens} tok · {stats.petMsgs} message(s)
      </div>
      <div>
        <b>Total:</b> ~{stats.totalTokens} / {CONTEXT_WINDOW} ({stats.pct}%)
      </div>
      {stats.pageChars > 0 && (
        <div>
          <b>Page context:</b> ~{Math.ceil(stats.pageChars / CHARS_PER_TOKEN)} tok
        </div>
      )}
      <div style={{ marginTop: 4, fontSize: 11, color: 'var(--el-text-color-secondary, #999)' }}>
        Coarse chars/4 estimate; real tokenization differs by model.
      </div>
    </div>
  );
  const costTooltip = (
    <div style={{ fontSize: 12, lineHeight: 1.6, maxWidth: 300 }}>
      <div>
        <b>Estimated session cost:</b> {formatCost(stats.estimatedCost)}
      </div>
      <div>
        Input: {stats.userTokens} tok × ${INPUT_RATE_PER_1K}/1K ={' '}
        {formatCost((stats.userTokens / 1000) * INPUT_RATE_PER_1K)}
      </div>
      <div>
        Output: {stats.petTokens} tok × ${OUTPUT_RATE_PER_1K}/1K ={' '}
        {formatCost((stats.petTokens / 1000) * OUTPUT_RATE_PER_1K)}
      </div>
      {stats.costHistory.length >= 2 && (
        <div>
          Trajectory: {stats.costHistory.length} msgs · min{' '}
          {formatCost(Math.min(...stats.costHistory))} · max{' '}
          {formatCost(Math.max(...stats.costHistory))} · latest{' '}
          {formatCost(stats.costHistory[stats.costHistory.length - 1])}
        </div>
      )}
      <div style={{ marginTop: 4, fontSize: 11, color: 'var(--el-text-color-secondary, #999)' }}>
        Rates are local defaults; real pricing differs by provider/model.
      </div>
    </div>
  );

  const scrollToMessageByCostIdx = (i: number) => {
    // Cost history index i maps to the i-th message in the messages array
    // (costHistory is built in the same order as messages).
    const messagesContainer = document.getElementById('yipet-chat-messages');
    if (!messagesContainer) return;
    const bubble = messagesContainer.querySelector<HTMLElement>(`[data-chat-idx="${i}"]`);
    bubble?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="yp-ssb-bar" role="status" aria-live="polite">
      <span className="yp-ssb-item" title={`Model: ${DEFAULT_MODEL}`}>
        <CloudOutlined />
        <span className="yp-ssb-label">{DEFAULT_MODEL}</span>
      </span>
      <span className="yp-ssb-sep">|</span>
      <span
        className="yp-ssb-item"
        title={`${stats.userMsgs + stats.petMsgs} messages this session`}
      >
        <ThunderboltOutlined />
        <span className="yp-ssb-label">
          {stats.userMsgs}/{stats.petMsgs}
        </span>
      </span>
      <Tooltip title={tokenTooltip} placement="top">
        <span className="yp-ssb-item yp-ssb-tokens">
          <span
            className={`yp-ssb-token-bar yp-ssb-token-bar--${tokenLevel}`}
            title={`~${stats.totalTokens} / ${CONTEXT_WINDOW} tokens`}
          >
            <span className="yp-ssb-token-fill" style={{ width: `${stats.pct}%` }} />
          </span>
          <span className="yp-ssb-label">{stats.pct}%</span>
        </span>
      </Tooltip>
      <Tooltip title={costTooltip} placement="top">
        <span
          className="yp-ssb-item yp-ssb-cost"
          title={`~${formatCost(stats.estimatedCost)} this session`}
        >
          {stats.sparkPath ? (
            <svg
              className="yp-ssb-cost-spark"
              width={SPARK_W}
              height={SPARK_H}
              viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}
              aria-label={`Cumulative cost trajectory across ${stats.costHistory.length} messages`}
            >
              <path
                d={stats.sparkPath}
                fill="none"
                stroke="#f59e0b"
                strokeWidth={1}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {stats.bandW > 0 &&
                stats.points.map((p, i) => (
                  <rect
                    key={`spark-band-${i}`}
                    x={SPARK_PAD + i * stats.bandW}
                    y={0}
                    width={stats.bandW}
                    height={SPARK_H}
                    fill="transparent"
                    onMouseEnter={() => scrollToMessageByCostIdx(i)}
                    onClick={() => scrollToMessageByCostIdx(i)}
                    style={{ cursor: 'pointer' }}
                  >
                    <title>{`Msg ${i + 1} · ${formatCost(stats.costHistory[i])}`}</title>
                  </rect>
                ))}
            </svg>
          ) : null}
          <span className="yp-ssb-label">{formatCost(stats.estimatedCost)}</span>
        </span>
      </Tooltip>
      {s.contextEnabled && (
        <span
          className="yp-ssb-item yp-ssb-active"
          title="Page context enabled — page content is sent as AI context"
        >
          <BulbOutlined />
          <span className="yp-ssb-label">Ctx</span>
        </span>
      )}
      {s.knowledgeGrounded && (
        <span
          className="yp-ssb-item yp-ssb-active"
          title={`RAG grounded${s.ragScope ? ` · scope: ${s.ragScope}${s.ragScopeIsFile ? ' (file)' : ''}` : ''}`}
        >
          <BookOutlined />
          <span className="yp-ssb-label">RAG</span>
        </span>
      )}
      {phase && (
        <span
          className={`yp-ssb-item yp-ssb-active yp-ssb-phase yp-ssb-phase--${phase}`}
          title={`Phase: ${phase} · ${s.streamingPhase || 'idle'}`}
        >
          <LoadingOutlined />
          <span className="yp-ssb-label">{phaseLabel}</span>
          <span className="yp-ssb-timeline" aria-hidden="true">
            <span
              className={`yp-ssb-tl-seg ${s.streamingPhase === 'thinking' ? 'is-active' : ''}`}
            />
            <span
              className={`yp-ssb-tl-seg ${s.streamingPhase === 'retrieving' ? 'is-active' : ''}`}
            />
            <span
              className={`yp-ssb-tl-seg ${s.streamingPhase === 'streaming' ? 'is-active' : ''}`}
            />
          </span>
        </span>
      )}
    </div>
  );
}
