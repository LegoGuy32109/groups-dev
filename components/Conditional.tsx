import { ComponentChild } from "preact";

/**
 * Render the first child of this element if visible
 * Render the optional second child if not visible as fallback
 */
export default function Conditional(
  { children, visible = true }: {
    children: [ComponentChild, ComponentChild] | ComponentChild;
    visible?: boolean;
  },
): ComponentChild {
  const listOfChildren = Array.isArray(children) ? children : [children];
  if (!visible) return listOfChildren[1] ?? null;
  return listOfChildren[0];
}
