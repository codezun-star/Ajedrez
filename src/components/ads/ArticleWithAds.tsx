/**
 * ArticleWithAds — renders a post's HTML with ad blocks folded into it.
 *
 * A unit placed inside the prose earns several times what the same unit earns
 * under the footer, because it is where the reader's eyes already are. The
 * question is where to cut, and the answer the article gives us for free is its
 * own `<h2>` headings: they are section breaks the author already chose, so an
 * ad lands in the pause between two topics instead of splitting a sentence.
 * Markdown only ever emits `<h2>` at the top level, which makes the split safe
 * to do on the rendered string.
 *
 * The first ad goes after the opening section — soon enough to be seen, late
 * enough that the reader has the article's first answer — and then one every
 * `EVERY` sections after that. Nothing is inserted before the closing section,
 * where the call to action already sits.
 *
 * The second break gets the native block rather than a rectangle, so a long
 * article does not read as the same banner four times over.
 */

import { Fragment } from 'react';
import { AdSlot } from './AdSlot';
import { NativeAd } from './NativeAd';

/** Insert an ad after the first section, then after every this many sections. */
const EVERY = 2;

/**
 * Cut the rendered article into sections, each starting at an `<h2>`.
 *
 * The lead paragraphs before the first heading come back as section 0.
 */
function splitSections(html: string): string[] {
  return html.split(/(?=<h2[\s>])/i).filter((part) => part.trim().length > 0);
}

/** Indices after which an ad should be inserted, never after the last one. */
function breakpoints(count: number): Set<number> {
  const marks = new Set<number>();
  for (let i = 0; i < count - 1; i += EVERY) marks.add(i);
  return marks;
}

export function ArticleWithAds({ html, lang }: { html: string; lang: string }) {
  const sections = splitSections(html);
  const marks = breakpoints(sections.length);
  let adCount = 0;

  return (
    <article lang={lang} className="article mt-4">
      {sections.map((section, i) => {
        const showAd = marks.has(i);
        // Exactly one native block per article: its container id is global,
        // so a second one would render an empty gap rather than a second ad.
        const native = showAd && adCount++ === 1;
        return (
          <Fragment key={i}>
            <div dangerouslySetInnerHTML={{ __html: section }} />
            {showAd &&
              (native ? (
                <NativeAd className="my-8" />
              ) : (
                <AdSlot ladder="inline" className="my-8" />
              ))}
          </Fragment>
        );
      })}
    </article>
  );
}
