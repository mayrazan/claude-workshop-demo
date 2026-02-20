// Figma node-id: 1639-343791
import { Plus } from 'lucide-react';
import type { ActionItem } from '../types';
import ActionItemCard from './ActionItemCard';

interface ActionItemListProps {
  items: ActionItem[];
  onChange: (updated: ActionItem) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export default function ActionItemList({ items, onChange, onDelete, onAdd }: ActionItemListProps) {
  return (
    <div className="action-list">
      {items.length === 0 ? (
        <p className="action-list__empty">No action items yet. Add one manually below.</p>
      ) : (
        <div className="action-list__items">
          {items.map((item) => (
            <ActionItemCard
              key={item.id}
              item={item}
              onChange={onChange}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      <button className="btn btn--secondary btn--sm action-list__add" onClick={onAdd}>
        <Plus size={16} />
        Add manually
      </button>
    </div>
  );
}
