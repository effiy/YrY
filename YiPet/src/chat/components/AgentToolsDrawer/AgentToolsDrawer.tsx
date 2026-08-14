/**
 * YiPet Chat — AgentToolsDrawer
 * Browsable catalog of the YiAi agent's capabilities (deepseek-harness style:
 * "agent capabilities = tools"). Opens from the toolbar; lazily populated via
 * `/agent/tools`. Two tabs:
 *   • Tools — grouped by `group`, each showing name + description +
 *     requires_confirmation badge + parameter JSON (collapsed).
 *   • Skills — the YiKnowledge SKILL.md catalog, grouped by `category`.
 */

import { SafetyCertificateOutlined, ToolOutlined } from '@ant-design/icons';
import { Collapse, Drawer, Empty, Spin, Tabs, Tag } from 'antd';
import type { ChatController } from '@/chat/controller';
import './AgentToolsDrawer.css';

export interface AgentToolsDrawerProps {
  controller: ChatController;
}

const GROUP_LABELS: Record<string, string> = {
  search: 'Search',
  files: 'Files',
  data: 'Data',
  planning: 'Planning',
  capability: 'Capability',
  mcp: 'MCP',
};

export function AgentToolsDrawer({ controller }: AgentToolsDrawerProps) {
  const s = controller.state;
  const loading = s.agentToolsLoading;

  const groupedTools = new Map<string, typeof s.agentTools>();
  for (const tool of s.agentTools) {
    const g = tool.group || 'other';
    if (!groupedTools.has(g)) groupedTools.set(g, []);
    groupedTools.get(g)!.push(tool);
  }

  const groupedSkills = new Map<string, typeof s.agentSkills>();
  for (const skill of s.agentSkills) {
    const g = skill.category || 'other';
    if (!groupedSkills.has(g)) groupedSkills.set(g, []);
    groupedSkills.get(g)!.push(skill);
  }

  const toolsTab = (
    <div className="yp-atd-scroll">
      {loading ? (
        <div className="yp-atd-loading">
          <Spin /> Loading capabilities…
        </div>
      ) : s.agentTools.length === 0 ? (
        <Empty description="No tools available" />
      ) : (
        [...groupedTools.entries()].map(([group, tools]) => (
          <div key={group} className="yp-atd-group">
            <div className="yp-atd-group-title">{GROUP_LABELS[group] ?? group}</div>
            <Collapse
              ghost
              size="small"
              items={tools.map((t) => ({
                key: t.name,
                label: (
                  <span className="yp-atd-tool-label">
                    <ToolOutlined className="yp-atd-tool-icon" />
                    <span className="yp-atd-tool-name">{t.name}</span>
                    {t.requires_confirmation && (
                      <Tag color="warning" className="yp-atd-confirm-tag">
                        confirm
                      </Tag>
                    )}
                  </span>
                ),
                children: (
                  <div className="yp-atd-tool-body">
                    <p className="yp-atd-tool-desc">{t.description}</p>
                    {t.parameters && Object.keys(t.parameters).length > 0 && (
                      <pre className="yp-atd-tool-params">
                        {JSON.stringify(t.parameters, null, 2)}
                      </pre>
                    )}
                  </div>
                ),
              }))}
            />
          </div>
        ))
      )}
    </div>
  );

  const skillsTab = (
    <div className="yp-atd-scroll">
      {loading ? (
        <div className="yp-atd-loading">
          <Spin /> Loading capabilities…
        </div>
      ) : s.agentSkills.length === 0 ? (
        <Empty description="No skills available" />
      ) : (
        [...groupedSkills.entries()].map(([category, skills]) => (
          <div key={category} className="yp-atd-group">
            <div className="yp-atd-group-title">{category}</div>
            {skills.map((skill) => (
              <div key={skill.name} className="yp-atd-skill">
                <div className="yp-atd-skill-head">
                  <SafetyCertificateOutlined className="yp-atd-tool-icon" />
                  <span className="yp-atd-skill-name">{skill.name}</span>
                  {skill.chip && <Tag className="yp-atd-skill-chip">{skill.chip}</Tag>}
                </div>
                <p className="yp-atd-skill-desc">{skill.description}</p>
                {skill.tags?.length > 0 && (
                  <div className="yp-atd-skill-tags">
                    {skill.tags.map((tag) => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );

  return (
    <Drawer
      title="Agent capabilities"
      placement="right"
      width={360}
      open={s.agentToolsVisible}
      onClose={controller.closeAgentTools}
      getContainer="#yipet-chat-window"
      styles={{ body: { padding: 0 } }}
    >
      <Tabs
        size="small"
        className="yp-atd-tabs"
        items={[
          { key: 'tools', label: `Tools (${s.agentTools.length})`, children: toolsTab },
          { key: 'skills', label: `Skills (${s.agentSkills.length})`, children: skillsTab },
        ]}
      />
    </Drawer>
  );
}
