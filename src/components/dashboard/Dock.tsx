'use client';

import {
  motion,
  type MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
  type SpringOptions,
  AnimatePresence
} from 'framer-motion';
import React, { Children, cloneElement, useEffect, useMemo, useRef, useState } from 'react';

export type DockItemData = {
  icon: React.ReactNode;
  label: React.ReactNode;
  onClick: () => void;
  className?: string;
};

export type DockProps = {
  items: DockItemData[];
  className?: string;
  distance?: number;
  panelHeight?: number;
  baseItemSize?: number;
  dockHeight?: number;
  magnification?: number;
  spring?: SpringOptions;
};

type DockItemProps = {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  mouseX: MotionValue<number>;
  spring: SpringOptions;
  distance: number;
  baseItemSize: number;
  magnification: number;
  label?: React.ReactNode;
  isTouch?: boolean;
};

function DockItem({
  children,
  className = '',
  onClick,
  mouseX,
  spring,
  distance,
  magnification,
  baseItemSize,
  label,
  isTouch = false
}: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mouseX, (val: number) => {
    if (isTouch || distance === 0) return 9999;
    const rect = ref.current?.getBoundingClientRect() ?? {
      x: 0,
      width: baseItemSize
    };
    return val - (rect.x + (rect.width || baseItemSize) / 2);
  });

  const targetSize = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [baseItemSize, isTouch ? baseItemSize : magnification, baseItemSize]
  );
  const size = useSpring(targetSize, spring);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    isHovered.set(0);
    ref.current?.blur();
    onClick?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      isHovered.set(0);
      ref.current?.blur();
      onClick?.();
    }
  };

  return (
    <motion.div
      ref={ref}
      style={{
        width: isTouch ? baseItemSize : size,
        height: isTouch ? baseItemSize : size
      }}
      onHoverStart={() => !isTouch && isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => !isTouch && isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`relative inline-flex shrink-0 items-center justify-center rounded-full bg-white border-gray-200 border-2 shadow-md cursor-pointer transition-colors ${className}`}
      tabIndex={0}
      role="button"
      aria-haspopup="true"
      aria-label={typeof label === 'string' ? label : undefined}
    >
      {Children.map(children, child =>
        React.isValidElement(child)
          ? cloneElement(child as React.ReactElement<{ isHovered?: MotionValue<number> }>, { isHovered })
          : child
      )}
    </motion.div>
  );
}

type DockLabelProps = {
  className?: string;
  children: React.ReactNode;
  isHovered?: MotionValue<number>;
};

function DockLabel({ children, className = '', isHovered }: DockLabelProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isHovered) return;
    setIsVisible(isHovered.get() === 1);
    const unsubscribe = isHovered.on('change', (latest: number) => {
      setIsVisible(latest === 1);
    });
    return () => unsubscribe();
  }, [isHovered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -8 }}
          exit={{ opacity: 0, y: 0 }}
          transition={{ duration: 0.12 }}
          className={`${className} absolute -top-8 left-1/2 w-fit whitespace-pre rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-700 font-semibold shadow-lg pointer-events-none select-none z-30 hidden sm:block`}
          role="tooltip"
          style={{ x: '-50%' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

type DockIconProps = {
  className?: string;
  children: React.ReactNode;
  isHovered?: MotionValue<number>;
};

function DockIcon({ children, className = '' }: DockIconProps) {
  return <div className={`flex items-center justify-center ${className}`}>{children}</div>;
}

export default function Dock({
  items,
  className = '',
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 70,
  distance = 200,
  panelHeight = 64,
  baseItemSize = 50
}: DockProps) {
  const mouseX = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkTouch = () => {
        setIsTouch(window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 640);
      };
      checkTouch();
      window.addEventListener('resize', checkTouch);
      return () => window.removeEventListener('resize', checkTouch);
    }
  }, []);

  const maxHeight = useMemo(() => Math.max(panelHeight, magnification + 6), [panelHeight, magnification]);
  const heightRow = useTransform(isHovered, [0, 1], [panelHeight, isTouch ? panelHeight : maxHeight]);
  const height = useSpring(heightRow, spring);

  return (
    <motion.div
      style={{ height: isTouch ? panelHeight : height }}
      className="relative mx-auto flex max-w-full items-end justify-center pointer-events-none"
    >
      <motion.div
        onMouseMove={(e: React.MouseEvent<HTMLDivElement>) => {
          if (!isTouch) {
            isHovered.set(1);
            mouseX.set(e.clientX);
          }
        }}
        onMouseLeave={() => {
          isHovered.set(0);
          mouseX.set(Infinity);
        }}
        className={`${className} pointer-events-auto flex items-center justify-start sm:justify-center w-fit gap-2 sm:gap-3 rounded-2xl border-gray-200/90 border-2 bg-white/95 backdrop-blur-md px-2.5 sm:px-4 shadow-xl max-w-[calc(100vw-1.5rem)] overflow-x-auto overflow-y-visible scrollbar-none`}
        style={{ height: panelHeight }}
        role="toolbar"
        aria-label="Application dock"
      >
        {items.map((item, index) => (
          <DockItem
            key={index}
            onClick={item.onClick}
            className={item.className}
            mouseX={mouseX}
            spring={spring}
            distance={isTouch ? 0 : distance}
            magnification={isTouch ? baseItemSize : magnification}
            baseItemSize={baseItemSize}
            label={item.label}
            isTouch={isTouch}
          >
            <DockIcon>{item.icon}</DockIcon>
            <DockLabel>{item.label}</DockLabel>
          </DockItem>
        ))}
      </motion.div>
    </motion.div>
  );
}
