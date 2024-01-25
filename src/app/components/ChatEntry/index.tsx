import React, { useState, useEffect, useRef } from "react";
import styles from "./index.module.scss";
import { Chat, RGBColor } from "@/app/types/types";

type ChatEntryProps = { chat: Chat };

const ChatEntry: React.FC<ChatEntryProps> = ({ chat }) => {
  const color = chat.color || "#ffffff";
  const user = chat.user || "User";

  const hexToRGB = (hexCode: string): RGBColor => {
    hexCode = hexCode.replace("#", "");
    const r = parseInt(hexCode.substring(0, 2), 16);
    const g = parseInt(hexCode.substring(2, 4), 16);
    const b = parseInt(hexCode.substring(4, 6), 16);
    return [r, g, b];
  };

  const rgbToLuminance = (rgb: RGBColor): number => {
    const [r, g, b] = rgb.map((val) => val / 255);
    const rLinear =
      r <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    const gLinear =
      g <= 0.04045 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    const bLinear =
      b <= 0.04045 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
  };

  const contrastRatio = (color1: RGBColor, color2: RGBColor): number => {
    const luminance1 = rgbToLuminance(color1);
    const luminance2 = rgbToLuminance(color2);
    const brighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);
    return (brighter + 0.05) / (darker + 0.05);
  };

  const adjustConstrast = (hexCode: string): string => {
    const background: RGBColor = hexToRGB("#18181b");
    const color: RGBColor = hexToRGB(hexCode);

    const currentContrast = contrastRatio(color, background);
    if (currentContrast >= 4.5) {
      return hexCode; // Color already has adequate contrast
    }

    // Increase brightness of the color until contrast is met
    let adjustedColor: RGBColor = [...color];
    while (contrastRatio(adjustedColor, background) < 4.5) {
      for (let i = 0; i < 3; i++) {
        adjustedColor[i] = Math.min(255, adjustedColor[i] + 10);
      }
    }

    return `#${adjustedColor
      .map((val) => val.toString(16).padStart(2, "0"))
      .join("")}`;
  };

  return (
    <div className={styles.blockCont}>
      <div className={styles.block}>
        <span className={styles.user} style={{ color: adjustConstrast(color) }}>
          {user.length <= 10 ? user : user.slice(0, 7) + "..."}
        </span>
        <div className={styles.word}>{chat.message}</div>
      </div>
    </div>
  );
};

export default ChatEntry;