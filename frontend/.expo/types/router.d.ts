/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams: { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/../src/components/LoadingState`; params?: Router.UnknownInputParams; } | { pathname: `/../src/components/InlineError`; params?: Router.UnknownInputParams; } | { pathname: `/../src/components/ActionButton`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; };
      hrefOutputParams: { pathname: Router.RelativePathString, params?: Router.UnknownOutputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownOutputParams } | { pathname: `/`; params?: Router.UnknownOutputParams; } | { pathname: `/../src/components/LoadingState`; params?: Router.UnknownOutputParams; } | { pathname: `/../src/components/InlineError`; params?: Router.UnknownOutputParams; } | { pathname: `/../src/components/ActionButton`; params?: Router.UnknownOutputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams; };
      href: Router.RelativePathString | Router.ExternalPathString | `/${`?${string}` | `#${string}` | ''}` | `/../src/components/LoadingState${`?${string}` | `#${string}` | ''}` | `/../src/components/InlineError${`?${string}` | `#${string}` | ''}` | `/../src/components/ActionButton${`?${string}` | `#${string}` | ''}` | `/_sitemap${`?${string}` | `#${string}` | ''}` | { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/../src/components/LoadingState`; params?: Router.UnknownInputParams; } | { pathname: `/../src/components/InlineError`; params?: Router.UnknownInputParams; } | { pathname: `/../src/components/ActionButton`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; };
    }
  }
}
