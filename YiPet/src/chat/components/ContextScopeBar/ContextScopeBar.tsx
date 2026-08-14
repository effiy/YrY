/**
 * YiPet Chat — ContextScopeBar
 * Compact strip above the messages area showing the active context that
 * will be shipped with the next send. Mirrors YiVad aiChat's
 * `ContextFilesPanel.vue` at a fraction of the surface — YiPet's floating
 * window has no room for a separate context column, so context surfaces
 * as chips in a single row.
 *
 * Chips:
 *   • RAG scope — file or folder path. Click opens KnowledgePreviewDialog
 *     (file only). X clears the scope.
 *   • Page context — enabled when `contextEnabled` is true AND the current
 *     session has `pageContent` (or the live `contextEditorDraft` is
 *     non-empty). Click opens PageContextEditor. X disables page context
 *     for this session (without deleting the saved content).
 *
 * Cross-project relevance: while chatting about any project's page (YiAi,
 * YiVad, YiKnowledge, external), the user sees at a glance what beyond
 * the typed prompt is being sent to the LLM — and can mute either source
 * with one click.
 */
import { CloseOutlined, FileTextOutlined, GlobalOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import type { ChatController } from '@/chat/controller';

export interface ContextScopeBarProps {
  controller: ChatController;
}

function splitPath(p: string): { head: string; tail: string } {
  if (!p) return { head: '', tail: '' };
  const parts = p.split('/').filter(Boolean);
  if (parts.length <= 1) return { head: '', tail: p };
  return { head: parts.slice(0, -1).join('/') + '/', tail: parts[parts.length - 1] };
}

export function ContextScopeBar(props: ContextScopeBarProps) {
  const s = props.controller.state;
  const ctrl = props.controller;

  const scope = s.ragScope;
  const scopeIsFile = s.ragScopeIsFile;
  const session = s.sessions.find((x) => x.id === s.currentSessionId);
  const pageContent = session?.pageContent || s.contextEditorDraft || '';
  const pageOn = s.contextEnabled && pageContent.trim().length > 0;
  const pageTitle = s.pageInfo?.title || 'current page';

  const hasScope = !!scope;
  const hasPage = pageOn;
  if (!hasScope && !hasPage) return null;

  const scopeSp = splitPath(scope);
  const pagePreview = pageContent.length > 60 ? `${pageContent.slice(0, 60)}…` : pageContent;

  return (
    <div className="yp-csb-bar" role="region" aria-label="Active context">
      <span className="yp-csb-label">Context:</span>

      {hasScope && (
        <Tooltip
          title={`${scopeIsFile ? 'File' : 'Folder'} scope · click to ${scopeIsFile ? 'preview' : 'view in sidebar'}`}
          placement="bottom"
        >
          <span
            className={`yp-csb-chip yp-csb-chip--scope${scopeIsFile ? '' : ' is-folder'}`}
            onClick={() => {
              if (scopeIsFile) ctrl.openKnowledgePreview(scope);
            }}
            role="button"
            tabIndex={0}
          >
            <FileTextOutlined />
            <span className="yp-csb-chip-path">
              {scopeSp.head && <span className="yp-csb-chip-head">{scopeSp.head}</span>}
              <span className="yp-csb-chip-tail">{scopeSp.tail}</span>
            </span>
            <button
              type="button"
              className="yp-csb-chip-x"
              onClick={(e) => {
                e.stopPropagation();
                ctrl.clearRagScope();
              }}
              title="Clear RAG scope"
              aria-label="Clear RAG scope"
            >
              <CloseOutlined />
            </button>
          </span>
        </Tooltip>
      )}

      {hasPage && (
        <Tooltip
          title={`Page context enabled · ${pageContent.length} chars · click to edit`}
          placement="bottom"
        >
          <span
            className="yp-csb-chip yp-csb-chip--page"
            onClick={() => ctrl.openContextEditor()}
            role="button"
            tabIndex={0}
          >
            <GlobalOutlined />
            <span className="yp-csb-chip-title">{pageTitle}</span>
            <span className="yp-csb-chip-preview">{pagePreview}</span>
            <button
              type="button"
              className="yp-csb-chip-x"
              onClick={(e) => {
                e.stopPropagation();
                // Disable page context for this session — keep the saved
                // content so a re-toggle restores it without re-typing.
                if (ctrl.state.contextEnabled) ctrl.toggleContext();
              }}
              title="Disable page context for this session"
              aria-label="Disable page context"
            >
              <CloseOutlined />
            </button>
          </span>
        </Tooltip>
      )}
    </div>
  );
}
