"use client";

import { useEffect, useRef, useState } from "react";

export default function ScrollbarWrapper({
  children,
  hideScrollbar = false,
  scrollbarColor = "rgba(155, 155, 155, 0.5)",
}) {
  const scrollRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout to hide scrollbar after 1 second of inactivity
      timeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 1000);
    };

    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener("scroll", handleScroll);
      // Show scrollbar initially if there's scrollable content
      if (scrollElement.scrollHeight > scrollElement.clientHeight) {
        handleScroll();
      }
    }

    return () => {
      if (scrollElement) {
        scrollElement.removeEventListener("scroll", handleScroll);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const uniqueClass = hideScrollbar
    ? "scrollbar-hidden"
    : `custom-scrollbar-${isScrolling ? "visible" : "hidden"}`;

  // Parse the color and create transparent version
  const getTransparentColor = (color) => {
    // If it's already rgba, replace the alpha
    if (color.startsWith("rgba")) {
      return color.replace(/[\d.]+\)$/, "0)");
    }
    // If it's rgb, convert to rgba with 0 alpha
    if (color.startsWith("rgb")) {
      return color.replace("rgb", "rgba").replace(")", ", 0)");
    }
    // If it's hex, return transparent
    return "transparent";
  };

  const hiddenColor = getTransparentColor(scrollbarColor);

  return (
    <div
      ref={scrollRef}
      style={{
        height: "100vh",
        overflow: "auto",
        // Custom scrollbar styling for Firefox
        scrollbarWidth: hideScrollbar ? "none" : "thin",
        scrollbarColor: hideScrollbar
          ? "transparent transparent"
          : isScrolling
            ? `${scrollbarColor} transparent`
            : `${hiddenColor} transparent`,
        transition: "scrollbar-color 0.3s ease",
      }}
      className={uniqueClass}
      onMouseEnter={() => setIsScrolling(true)}
      onMouseLeave={() => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          setIsScrolling(false);
        }, 1000);
      }}
    >
      {children}
      <style jsx global>{`
        .custom-scrollbar-visible::-webkit-scrollbar,
        .custom-scrollbar-hidden::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar-visible::-webkit-scrollbar-track,
        .custom-scrollbar-hidden::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar-visible::-webkit-scrollbar-thumb {
          background-color: ${scrollbarColor};
          border-radius: 10px;
        }
        .custom-scrollbar-hidden::-webkit-scrollbar-thumb {
          background-color: transparent;
        }
        .custom-scrollbar-visible::-webkit-scrollbar-thumb:hover,
        .custom-scrollbar-hidden::-webkit-scrollbar-thumb:hover {
          background-color: ${scrollbarColor}cc;
        }
        .scrollbar-hidden::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
