import { useMemo, useState } from "react";
import styled, { ThemeProvider } from "styled-components";
import { GlassCard } from "./components/GlassCard";
import { GlassHeader } from "./components/GlassHeader";
import { GlassModal } from "./components/GlassModal";
import { GlobalStyles } from "./globalStyles";
import { darkTheme, lightTheme } from "./theme";

const Layout = styled.main`
  width: min(1080px, 100% - 32px);
  margin: 32px auto;
  display: grid;
  gap: 24px;
`;

const Grid = styled.section`
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
`;

const Heading = styled.h2`
  margin: 0;
  font-size: 1.2rem;
`;

const Paragraph = styled.p`
  margin: 0;
  line-height: 1.5;
`;

const Button = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.accent};
  color: #ffffff;
  border-radius: 12px;
  padding: 10px 14px;
  cursor: pointer;
`;

const GhostButton = styled(Button)`
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
`;

export default function App() {
  const [open, setOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const theme = useMemo(() => (isDark ? darkTheme : lightTheme), [isDark]);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <GlassHeader
        title="Glass UI"
        actions={
          <GhostButton
            type="button"
            aria-label="Toggle dark mode"
            onClick={() => setIsDark((value) => !value)}
          >
            {isDark ? "Light" : "Dark"} Theme
          </GhostButton>
        }
      />

      <Layout>
        <Grid>
          <GlassCard>
            <Heading>GlassCard</Heading>
            <Paragraph>
              Frosted translucent container with shared blur tokens, soft shadows, and responsive
              spacing.
            </Paragraph>
            <Button type="button" aria-label="Open modal" onClick={() => setOpen(true)}>
              Open Modal
            </Button>
          </GlassCard>

          <GlassCard>
            <Heading>GlassHeader</Heading>
            <Paragraph>
              Sticky navbar using the same glass surface layer for visual consistency and improved
              performance.
            </Paragraph>
          </GlassCard>
        </Grid>
      </Layout>

      <GlassModal open={open} onClose={() => setOpen(false)} title="Glass Modal">
        <Heading style={{ marginBottom: 8 }}>GlassModal</Heading>
        <Paragraph>
          Accessible modal with ESC close, outside click close, and keyboard focus trap.
        </Paragraph>
        <div style={{ display: "flex", gap: 8 }}>
          <GhostButton type="button" aria-label="Cancel modal" onClick={() => setOpen(false)}>
            Cancel
          </GhostButton>
          <Button type="button" aria-label="Confirm modal" onClick={() => setOpen(false)}>
            Confirm
          </Button>
        </div>
      </GlassModal>
    </ThemeProvider>
  );
}
