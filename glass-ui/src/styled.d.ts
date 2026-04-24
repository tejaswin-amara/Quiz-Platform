import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme {
    colors: {
      bg: string;
      glass: string;
      border: string;
      text: string;
      accent: string;
      overlay: string;
    };
    blur: string;
    radius: string;
    shadow: string;
  }
}
