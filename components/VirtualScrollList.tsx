import React, { useState, useEffect, useRef } from 'react';

interface VirtualScrollListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  containerHeight: number;
  keyExtractor: (item: T, index: number) => string | number;
}

const VirtualScrollList = <T extends {}>({
  items,
  renderItem,
  itemHeight,
  containerHeight,
  keyExtractor
}: VirtualScrollListProps<T>) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const itemVisibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(startIndex + itemVisibleCount, items.length);

  const visibleItems = items.slice(startIndex, endIndex);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div
      ref={containerRef}
      className="overflow-y-auto relative"
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      {/* Spacer at the top */}
      <div style={{ height: startIndex * itemHeight }} />
      
      {/* Visible items */}
      {visibleItems.map((item, index) => (
        <div
          key={keyExtractor(item, startIndex + index)}
          className="absolute left-0 right-0"
          style={{
            top: (startIndex + index) * itemHeight,
            height: itemHeight
          }}
        >
          {renderItem(item, startIndex + index)}
        </div>
      ))}
      
      {/* Spacer at the bottom */}
      <div style={{ height: (items.length - endIndex) * itemHeight }} />
    </div>
  );
};

export default VirtualScrollList;