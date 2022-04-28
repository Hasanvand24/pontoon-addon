import fs from 'fs';
import path from 'path';

import type { IPackageJson } from 'package-json-type';

// ts-prune-ignore-next
export enum BrowserFamily {
  MOZILLA = 'mozilla',
  CHROMIUM = 'chromium',
}

const packageJson = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../package.json'), {
    encoding: 'utf-8',
  }),
) as IPackageJson;

const pontoonLogoSvg = 'assets/img/pontoon-logo.svg';
const pontoonLogoGrayAlphaSvg = 'assets/img/pontoon-logo-gray-alpha.svg';
const pontoonLogo32Png = 'assets/img/pontoon-logo-32.png';
const pontoonLogo128Png = 'assets/img/pontoon-logo-128.png';

// ts-prune-ignore-next
export function getManifestFor(
  targetBrowser: BrowserFamily,
): Record<string, unknown> {
  const forMozilla = targetBrowser === BrowserFamily.MOZILLA;
  const forChromium = targetBrowser === BrowserFamily.CHROMIUM;

  if ([forMozilla, forChromium].every((forIt) => !forIt)) {
    throw new Error(
      `No known browser specified to generate manifest for. Was "${targetBrowser}", must be one of: ${Object.values(
        BrowserFamily,
      )}.`,
    );
  }

  return {
    ...(forMozilla
      ? {
          browser_specific_settings: {
            gecko: {
              id: 'pontoon-tools@mikk.cz',
              strict_min_version: '91.0',
            },
          },
        }
      : {}),
    manifest_version: 2,
    name: 'Pontoon Add-on',
    description: packageJson.description,
    version: packageJson.version,
    author: packageJson.author,
    homepage_url: packageJson.homepage,
    icons: {
      ...(forMozilla
        ? {
            '16': pontoonLogoSvg,
            '48': pontoonLogoSvg,
            '96': pontoonLogoSvg,
            '128': pontoonLogoSvg,
          }
        : {}),
      ...(forChromium
        ? {
            '32': pontoonLogo32Png,
            '128': pontoonLogo128Png,
          }
        : {}),
    },
    permissions: [
      'https://pontoon.mozilla.org/*',
      'storage',
      'contextMenus',
      'tabs',
      'notifications',
      'alarms',
      ...(forMozilla
        ? [
            'contextualIdentities',
            'cookies',
            'webRequest',
            'webRequestBlocking',
          ]
        : []),
      '<all_urls>',
    ],
    optional_permissions: ['<all_urls>'],
    options_ui: {
      page: 'frontend/options.html',
      open_in_tab: true,
    },
    browser_action: {
      default_title: 'Pontoon notifications',
      ...(forMozilla
        ? {
            default_icon: pontoonLogoSvg,
          }
        : {}),
      ...(forChromium
        ? {
            default_icon: pontoonLogo32Png,
          }
        : {}),
    },
    ...(forMozilla
      ? {
          page_action: {
            browser_style: true,
            default_icon: {
              '19': pontoonLogoGrayAlphaSvg,
              '38': pontoonLogoGrayAlphaSvg,
            },
            default_popup: 'frontend/address-bar.html',
          },
        }
      : {}),
    background: {
      scripts: ['background/main.js'],
    },
    content_scripts: [
      {
        matches: ['https://pontoon.mozilla.org/*'],
        js: ['content-scripts/notifications-bell-icon.js'],
        run_at: 'document_end',
      },
    ],
    web_accessible_resources: [
      'content-scripts/pontoon-addon-promotion-in-page.js',
    ],
  };
}