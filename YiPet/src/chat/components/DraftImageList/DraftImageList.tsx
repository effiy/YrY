import { CloseOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Image } from 'antd';
import type { FC } from 'react';
import './DraftImageList.css';

export interface DraftImageListProps {
  images: string[];
  onRemove: (index: number) => void;
  onClear: () => void;
}

export const DraftImageList: FC<DraftImageListProps> = ({ images, onRemove, onClear }) => {
  if (!images.length) return null;
  return (
    <div className="di-list">
      {images.map((src, idx) => (
        <div className="di-item" key={`${idx}-${src.slice(0, 24)}`}>
          <Image src={src} alt={`Pending image ${idx + 1}`} className="di-img" preview={{ src }} />
          <Button
            className="di-remove"
            size="small"
            shape="circle"
            icon={<CloseOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onRemove(idx);
            }}
          />
        </div>
      ))}
      <Button
        className="di-clear"
        size="small"
        type="text"
        icon={<DeleteOutlined />}
        onClick={onClear}
      >
        Clear images ({images.length})
      </Button>
    </div>
  );
};
