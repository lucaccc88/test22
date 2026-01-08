import { useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

const ScrollPicker = ({ items, value, onChange, label, className }) => {
    const scrollRef = useRef(null);
    const itemHeight = 40; // h-10 = 40px
    const containerHeight = 160; // h-40 = 160px
    // Padding to center the first/last elements
    // (Container Height - Item Height) / 2
    const paddingY = (containerHeight - itemHeight) / 2;

    // Scroll to value on mount or when value changes externally
    useEffect(() => {
        const index = items.indexOf(value);
        if (index !== -1 && scrollRef.current) {
            scrollRef.current.scrollTop = index * itemHeight;
        }
    }, []); // Only on mount to avoid fighting with user scroll

    // Handle Wheel Event for precise stepping
    useEffect(() => {
        const element = scrollRef.current;
        if (!element) return;

        const handleWheel = (e) => {
            e.preventDefault();
            const direction = e.deltaY > 0 ? 1 : -1;
            // Scroll by exactly one item height
            element.scrollBy({
                top: direction * itemHeight,
                behavior: 'smooth'
            });
        };

        // Add non-passive listener to prevent default scrolling
        element.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            element.removeEventListener('wheel', handleWheel);
        };
    }, []);

    const handleScroll = (e) => {
        // Debounce or check scroll end could be better, but for simple values:
        // We can calculate the "centered" item on scroll end or use IntersectionObserver
        // Simple approach: On click, we select. With scroll snap, we can detect which one is centered?
        // Actually, reliable "on scroll change" is hard with just scroll events.
        // Let's rely on CLICK checks or Scroll Snap + specific event?
        // Let's try: Calculate index from scrollTop

        // For this MVP, let's update ONLY when snapping triggers?
        // Or simpler: The user SCROLLS to position, we read the value when they click "Start"?
        // No, visual feedback needs active state.

        // Let's allow onClick to select and scroll to.
        // And for scrolling, we update 'visually' but maybe update state on scroll end.

        // Simplest consistent behavior for Recat: 
        // 1. Calculate index based on scrollTop
        // 2. onChange(items[index])
    };

    // Better approach for React controlled scroll:
    // Use UI event onScroll to find the "active" item.

    const onScroll = () => {
        if (!scrollRef.current) return;
        const scrollTop = scrollRef.current.scrollTop;
        const index = Math.round(scrollTop / itemHeight);
        if (items[index] !== undefined && items[index] !== value) {
            onChange(items[index]);
        }
    };

    return (
        <div className={cn("flex flex-col items-center", className)}>
            {label && <span className="text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wider">{label}</span>}
            <div className="relative h-40 w-full overflow-hidden bg-zinc-100/50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700/50 transition-colors">
                {/* Highlight/Selection Bar */}
                <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-10 bg-cyan-500/10 border-y border-cyan-500/30 pointer-events-none z-10" />

                {/* Top Gradient Mask */}
                <div className="absolute top-0 left-0 right-0 h-14 bg-gradient-to-b from-zinc-50/90 to-transparent dark:from-zinc-950/90 dark:to-transparent pointer-events-none z-20" />

                {/* Bottom Gradient Mask */}
                <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-zinc-50/90 to-transparent dark:from-zinc-950/90 dark:to-transparent pointer-events-none z-20" />

                <div
                    ref={scrollRef}
                    className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide py-[60px]"
                    onScroll={onScroll}
                    style={{ paddingBlock: `${paddingY}px` }}
                >
                    {items.map((item) => (
                        <div
                            key={item}
                            onClick={() => {
                                onChange(item);
                                const index = items.indexOf(item);
                                if (scrollRef.current) {
                                    scrollRef.current.scrollTo({
                                        top: index * itemHeight,
                                        behavior: 'smooth'
                                    });
                                }
                            }}
                            className={cn(
                                "h-10 flex items-center justify-center snap-center cursor-pointer transition-all duration-200 select-none",
                                item === value
                                    ? "text-lg font-bold text-cyan-600 dark:text-cyan-400 scale-110"
                                    : "text-sm text-zinc-400 dark:text-zinc-600"
                            )}
                        >
                            {item}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ScrollPicker;
