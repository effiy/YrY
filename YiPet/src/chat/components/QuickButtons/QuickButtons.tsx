import { Tag } from 'antd';
import type { FC } from 'react';
import type { QuickButton } from '../../constants';
import { QUICK_BUTTONS, QUICK_BUTTONS_NEW } from '../../constants';
import type { ChatController } from '../../controller';
import './QuickButtons.css';

export interface QuickButtonsProps {
  controller: ChatController;
}

export const QuickButtons: FC<QuickButtonsProps> = ({ controller }) => {
  const state = controller.getSnapshot();

  const onClick = (b: QuickButton) => {
    if (state.isProcessing) return;
    if (b.template) {
      controller.setInputTemplate(b.content);
      return;
    }
    controller.sendQuickButton(b.content);
  };

  return (
    <div className="qb-row">
      {QUICK_BUTTONS.map((b) => (
        <Tag
          key={b.value}
          className="qb-chip"
          color={state.isProcessing ? undefined : 'processing'}
          onClick={() => onClick(b)}
        >
          {b.label}
        </Tag>
      ))}
      {QUICK_BUTTONS_NEW.map((b) => (
        <Tag
          key={b.value}
          className="qb-chip qb-chip--special"
          color={state.isProcessing ? undefined : 'warning'}
          onClick={() => onClick(b)}
        >
          {b.label}
        </Tag>
      ))}
    </div>
  );
};
