import React__default from 'react';
import * as react_jsx_runtime from 'react/jsx-runtime';
import * as styled_components from 'styled-components';
export { darkTheme, lightTheme } from '../theme.mjs';
export { GlobalStyles } from '../globalStyles.mjs';

type CardSize = "sm" | "md" | "lg";
interface GlassCardProps extends React__default.ComponentPropsWithoutRef<"section"> {
    size?: CardSize;
    children?: React__default.ReactNode;
}
declare const GlassCard: React__default.NamedExoticComponent<GlassCardProps>;

interface GlassHeaderProps {
    title: string;
    actions?: React__default.ReactNode;
}
declare function GlassHeaderInner({ title, actions }: GlassHeaderProps): react_jsx_runtime.JSX.Element;
declare const GlassHeader: React__default.MemoExoticComponent<typeof GlassHeaderInner>;

interface GlassModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React__default.ReactNode;
    announcement?: string;
}
declare const GlassModal: ({ open, onClose, title, children, announcement }: GlassModalProps) => react_jsx_runtime.JSX.Element;

type ButtonVariant = "primary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";
interface GlassButtonProps extends React__default.ComponentPropsWithoutRef<"button"> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    children?: React__default.ReactNode;
}
declare const GlassButton: React__default.NamedExoticComponent<GlassButtonProps>;

type ToastType = "info" | "success" | "warning" | "error";
interface GlassToastProps {
    message: string;
    type?: ToastType;
    duration?: number;
    onDismiss?: () => void;
}
declare const GlassToast: ({ message, type, duration, onDismiss }: GlassToastProps) => react_jsx_runtime.JSX.Element;

interface GlassTooltipProps {
    label: string;
    children: React__default.ReactElement;
}
declare const GlassTooltip: ({ label, children }: GlassTooltipProps) => react_jsx_runtime.JSX.Element;

type BadgeVariant = "default" | "success" | "warning" | "danger";
interface GlassBadgeProps extends React__default.ComponentPropsWithoutRef<"span"> {
    variant?: BadgeVariant;
    children?: React__default.ReactNode;
}
declare const GlassBadge: React__default.NamedExoticComponent<GlassBadgeProps>;

declare const glassSurface: styled_components.RuleSet<object>;

export { type BadgeVariant, type ButtonSize, type ButtonVariant, GlassBadge, type GlassBadgeProps, GlassButton, type GlassButtonProps, GlassCard, type GlassCardProps, GlassHeader, type GlassHeaderProps, GlassModal, type GlassModalProps, GlassToast, type GlassToastProps, GlassTooltip, type GlassTooltipProps, type ToastType, glassSurface };
