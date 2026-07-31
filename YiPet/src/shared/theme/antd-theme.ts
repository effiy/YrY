/**
 * antd ThemeConfig builder — maps YiPet color palette index → antd v5 theme.
 *
 * Used by popup and chat surfaces to wrap their root in <ConfigProvider theme={...}>.
 * antd v5 uses CSS-in-JS, so theme updates apply instantly with no CSS file reload —
 * CSP-safe for MV3.
 */
import type { ThemeConfig } from 'antd';
import { NONE_PALETTE, THEME_PALETTES } from './colors';

/**
 * Returns an antd ThemeConfig for the given palette index.
 * Pass idx < 0 for the None palette (light theme, black text on white bg).
 */
export function getAntdTheme(idx: number): ThemeConfig {
  if (idx < 0 || idx >= THEME_PALETTES.length) {
    const n = NONE_PALETTE;
    return {
      token: {
        colorPrimary: n.primary,
        colorLink: n.linkColor,
        colorTextBase: n.textPrimary,
        colorBgBase: n.bgPrimary,
        colorBorder: n.borderSecondary,
        colorBorderSecondary: n.borderSecondary,
      },
      components: {
        Layout: {
          headerBg: n.bgSecondary,
          bodyBg: n.bgPrimary,
          siderBg: n.bgSecondary,
        },
        Card: {
          colorBgContainer: n.bgSecondary,
          headerBg: n.bgSecondary,
        },
        Modal: {
          contentBg: n.bgSecondary,
          headerBg: n.bgSecondary,
        },
        Input: {
          colorBgContainer: n.inputBg,
          activeBorderColor: n.borderFocus,
          hoverBorderColor: n.borderFocus,
        },
        InputNumber: {
          colorBgContainer: n.inputBg,
        },
        Select: {
          colorBgContainer: n.inputBg,
        },
        Button: {
          colorPrimary: n.buttonBg,
          colorPrimaryHover: n.buttonHover,
        },
      },
    };
  }
  const p = THEME_PALETTES[idx];
  return {
    token: {
      colorPrimary: p.primary,
      colorLink: p.linkColor,
      colorTextBase: p.textPrimary,
      colorBgBase: p.bgPrimary,
      colorBorder: p.borderSecondary,
      colorBorderSecondary: p.borderSecondary,
    },
    components: {
      Layout: {
        headerBg: p.bgSecondary,
        bodyBg: p.bgPrimary,
        siderBg: p.bgSecondary,
      },
      Card: {
        colorBgContainer: p.bgSecondary,
        headerBg: p.bgSecondary,
      },
      Modal: {
        contentBg: p.bgSecondary,
        headerBg: p.bgSecondary,
      },
      Input: {
        colorBgContainer: p.inputBg,
        activeBorderColor: p.borderFocus,
        hoverBorderColor: p.borderFocus,
      },
      InputNumber: {
        colorBgContainer: p.inputBg,
      },
      Select: {
        colorBgContainer: p.inputBg,
      },
      Button: {
        colorPrimary: p.buttonBg,
        colorPrimaryHover: p.buttonHover,
      },
    },
  };
}
