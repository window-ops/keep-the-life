# Keep the Life: Files

```
index.html                 the story, indented two spaces per level
notes/concept.html         the concept and every referenced SCP Wiki article
notes/summary.html         each chapter in brief, with its picture from svg/chapters/
notes/glossary.html        the terms (Campi Flegrei among them, under Places) the story uses without explaining; each entry links to the chapters where it is used; js/pages/glossary.js sorts the terms A to Z, by first appearance or by subject, gives each order its own row of jump links to its headings (letters, chapter numbers, subjects), which runs on in the line after the sort control and wraps under it; subjects carry a small dot after each, as in a word cloud, and keeps the choice; terms are divided by dashed lines, headings by solid rules
notes/making.html          how the story was made, in the first person: who wrote what, the skills and instructions Claude worked under, the title, the sources of the ideas, the character models, the rules of the brief as a partial record, and the numbers, counted live from the story
notes/critics.html         answers to critics, in the first person: AI slop, doing it all alone, authorship, knowing the subject, exploitation, faithfulness to the SCP canon and to SCP-239 and SCP-079 with a sociological view of the two, why alpha versions stay unpublished, and a note on perfection, forks and errors, with sources
notes/file.html            Toma's file as an SCP article at the end of chapter 11, revised 20 December 2029 (chapter 1 is Saturday 4 August 2029): a header switched between the traditional item number and object class and the ACS bar (js/pages/file.js, kept with the settings), each addendum dated on its heading line, containment procedures, description addenda A to H, Document ████-1, the containment engineers' statement condemning Epsilon-11's use of cognitohazards, Document ████-2, a functional diagram of the implant extended from Kellerman's chapter 7 pinout, Document ████-3, a sketch of both sides of the board, and Document ████-4, a sketch of the bench kit (inline SVGs drawn in the page's tokens)
notes/classes.html         how the SCP Wiki classifies anomalies, files and people: object classes, the ACS bar (clearance, containment, secondary, disruption and risk classes), security clearance levels and personnel classes, with the classes the story uses and sources
svg/chapters/              one picture per chapter (cN.svg), used by the summary
svg/ghidra/                the Ghidra toolbar icons, one per button, drawn for the dark theme
svg/gnome/                 the GNOME guest: the wallpaper tile and the file-manager icons
svg/notebook/              Kellerman's notebook page: the margin line and the ruling tile
svg/phone/                 Toma's phone: the screen notch
BRIEF.MD                   the index of the brief, one row per file in docs/
docs/                      the brief, one file per topic
fonts/<Name>/              one folder per font, named after it, with its files and its OFL.txt: IBM Plex Sans, IBM Plex Mono, Newsreader, Caveat (Kellerman), Patrick Hand (Toma), VT323

css/fonts.css              local @font-face rules
css/site/tokens.css        repeated values, the dark and light themes, the gutter
css/site/base.css          box sizing, the page, paragraphs, buttons, focus, redaction bars, text for screen readers only (span.vh), translations (span.tr)
css/site/masthead.css      the reading meter, the masthead, the settings row and its tools, the settings bar
css/site/layout.css        pretty wrap, the reading column, the contents and their floating menu (story only)
css/site/tabs.css          tabs, shared by the tabbed chapters and the row of pages in notes/
css/site/dialogue.css      speaker colors, the site announcement, chapters, sections, scenes, replies, the end of the book, the folding screens (story only)
css/site/notes.css         highlights, notes, the bookmark and the panel (story only)
css/site/end.css           the footer and the toast
css/site/motion.css        the motion setting
css/site/pages.css         the pages in notes/, the making page's notice
css/site/glossary.css      the glossary (glossary page only)
css/site/print.css         printing
css/screens/tokens.css     repeated values for the simulated screens
css/screens/shell.css      the shared shell of every screen and printed piece
css/screens/workstation.css  Ghidra, the Ollama UI, Konsole, virt-manager with its GNOME guest
css/screens/scp-079.css    SCP-079's Exidy Sorcerer monitor
css/screens/print.css      the newspaper, the AKV poster, the whiteboard, the hearing, the pinout, the Council's leaflet
css/screens/letters.css    letters by hand and screened mail (chapter 9)
css/screens/handhelds.css  the bench kit's reader and Toma's phone (chapter 10)
css/screens/calculator.css the graphing calculator (chapter 11), and its plain display without scripts

js/making/probe.js         not deferred, loaded after the stylesheets: on index.html?probe=making it hides the story behind one line in the system font, through a style of its own, so no web font starts downloading before counts.js counts the story and jumps back
js/base/core.js            shared helpers, storage, toast (loads first of the deferred scripts)
js/base/theme.js           dark, light and system themes
js/base/motion.js          motion setting: system, reduced, full
js/base/scrollfocus.js     scroll areas within keyboard reach: a box that scrolls and holds nothing focusable joins the Tab order while it scrolls, named after its screen; loaded last on every page
js/base/redact.js          Redactions setting: what screen readers say for a redaction, redacted or static, and the burst of static a redaction plays when activated with static on
js/text/pretty.js          pretty wrap engine
js/text/width.js           page width control
js/reading/settings.js     settings row, remember settings
js/reading/sections.js     sections, tabs, contents links
js/devices/calc-font.js    the calculator's bitmap font
js/devices/calculator.js   draws each calculator from the text in the story: display, graphs, catalog, case, screen keys and keypad
js/devices/screens.js      device screens that grow when nearly full, the calculator's Play and Hide keys
js/reading/tocmenu.js      contents as a floating menu below 1200 px, and its tuck tab
js/text/names.js           speaker column width
js/reading/notes.js        highlights, notes, quotes, bookmark
js/reading/toggles.js      toggle buttons
js/reading/position.js     reading progress, contents tracking, section links, keys
js/devices/ghidra.js       Ghidra interactions
js/making/counts.js        counts of replies, spoken words and stage directions per speaker, with the average and the median length of a reply; on the story page it saves them for the making page, and opened as index.html?probe=making it sends them back to notes/making.html in the address (#counts=)
js/pages/concept.js        the pages in notes/: follows the story's pretty wrap setting
js/pages/file.js           notes/file.html: switches its header between Traditional and ACS and keeps the choice
js/pages/settings.js       the pages in notes/: the Settings button and row (Pretty wrap, Remember settings; Theme, Motion, Scroll speed and Redactions bound by base/, Page width by text/width.js), sharing their saved values with the story; the row starts folded
js/pages/glossary.js       the glossary's sort control
js/making/making.js        the Numbers section of notes/making.html: counts ../index.html when served over the web; from a disk it uses the counts sent back by the probe, then the counts saved in the tab, and otherwise shows a notice whose Count the story button runs the probe
```

The scripts sit in folders by role: `base` (helpers, theme, motion, redactions, scroll areas), `text` (wrapping and the name column), `reading` (settings, sections, contents, notes, toggles, position), `devices` (the simulated screens and the calculator), `pages` (the pages in notes/) and `making` (the live counts). The stylesheets sit in `site` (the page and the story) and `screens` (the simulated screens and printed matter), one file to a topic, and every page links only the files it needs, in the order listed above. The story links every file except `pages.css` and `glossary.css`; the pages in notes/ link `tokens`, `base`, `masthead`, `tabs`, `end`, `motion`, `pages` and `print`, and the glossary adds `glossary.css`.

In the alpha versions, concept.html, summary.html and glossary.html were generated by build.py from concept.py, summary.py and glossary.py, the build also indented index.html, and pixlcd.py drew the calculator's pixel display from the X11 koi10x20 font. Those scripts and their sources were deleted, so every page is now edited directly.

Apart from probe.js, the scripts are plain deferred scripts loaded in the order above, so the page also works from a local file. They share one object, `window.KeepTheLife`, which `core.js` creates.

Without scripts every page reads in full: all sections show, every screen and attachment is open, the contents stay in the sidebar, and the controls that need a script (settings, the glossary's sort, the bookmark and notes, the making page's figures) stay out of sight. Each page's `html` element starts with the class `no-js`, which `core.js` removes.
