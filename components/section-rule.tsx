/**
 * The halftone hairline rule. A small server component so it can sit
 * between any two sections in a page. It's a thin band of tiny black
 * dots — like a printed newspaper rule.
 */
export function SectionRule() {
  return <hr className="kg-rule" aria-hidden="true" />;
}
