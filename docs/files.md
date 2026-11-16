# Keep the Life: Files

```
index.html                 the story, indented two spaces per level
part2.html                 part 2 of the story (chapters 1 to 7, built from the same markup as part 1), the same page with body data-part="2" and its own ids (p2c1, p2c1-s1, p2c1-s1-l1), linked from the Part 2 button at the end of part 1 and from the Part 2 tab of every page in notes/, with a Part 1 button in its masthead; it ends with "End of part 2" and a Part 3 button
part3.html                 part 3, the post-mortem: one chapter: the prose of section 1.1 (p3c1-s1) in nine cards and a last line, then one section per article (1.2, the Engrama blog post on why Version 1.0 is not selling; 1.3, the GitLab project page of the firmware; 1.4, Hollis's notebook; 1.5, the Europa Wire article on AKV Solutions; 1.6, the #firmware channel on Engrama's Rocket.Chat; 1.7, the revised EU declaration of conformity; 1.8, Favre's letter to Hollis; 1.9, Toma's employment contract; 1.10, the agreement in the Official Journal; 1.11, the GitLab releases a year later; 1.12, Sigurrós's letter to Toma; 1.13, Kellerman's postcard from Chillon), the same page with body data-part="3", linked from the Part 3 button at the end of part 2 and from the Part 3 tab of every page in notes/, with a Part 2 button in its masthead and no end mark
notes/concept.html         the concept and every referenced SCP Wiki article
notes/summary.html         each chapter in brief, with its picture from svg/chapters/
notes/glossary.html        the terms (Campi Flegrei among them, under Places) the story uses without explaining; each entry links to the chapters where it is used; js/pages/glossary.js sorts the terms A to Z, by first appearance or by subject, gives each order its own row of jump links to its headings (letters, chapter numbers, subjects), which runs on in the line after the sort control and wraps under it; subjects carry a small dot after each, as in a word cloud, and keeps the choice; terms are divided by dashed lines, headings by solid rules
notes/making.html          how the story was made, in the first person: who wrote what, the skills and instructions Claude worked under, the title, the sources of the ideas, the character models, the rules of the brief as a partial record, and the numbers, counted live from the story
notes/critics.html         answers to critics, in the first person: AI slop, doing it all alone, authorship, knowing the subject, exploitation, faithfulness to the SCP canon and to SCP-239 and SCP-079 with a sociological view of the two, why alpha versions stay unpublished, and a note on perfection, forks and errors, with sources
notes/file.html            Toma's file as an SCP article in three revisions, switched by a File control beside the Header switch on the heading line, both wrapping under the heading below 600 px (js/pages/file.js, kept with the settings; without scripts all three show, each under its label): the Euclid revision at the end of chapter 11, kept as it was, the Explained revision after part 2, chapter 1 (the test on 29 April), with its own procedures, description and Addenda I to N, and the archived revision of December 2030 after part 3, in which the Foundation voids the file as the SCP Wiki does: a box by order of the O5 Council, the item as SCP-████-EX with Keter and Euclid struck, no procedures, the description archived, Addenda A to N archived and Addendum O on the execution of the judgment, the designation retired. The Euclid revision, revised 20 December 2029 (chapter 1 is Saturday 4 August 2029), has a header switched between the traditional item number and object class and the ACS bar (js/pages/file.js, kept with the settings), each addendum dated on its heading line, containment procedures, description addenda A to H, Document ████-1, the containment engineers' statement condemning Epsilon-11's use of cognitohazards, Document ████-2, a functional diagram of the implant extended from Kellerman's chapter 7 pinout, Document ████-3, a sketch of both sides of the board, and Document ████-4, a sketch of the bench kit (inline SVGs drawn in the page's tokens)
notes/classes.html         how the SCP Wiki classifies anomalies, files and people: object classes, the ACS bar (clearance, containment, secondary, disruption and risk classes), security clearance levels and personnel classes, with the classes the story uses and sources
svg/chapters/              one picture per chapter (cN.svg, p2cN.svg for part 2 and p3c1.svg for part 3), used by the summary
svg/ghidra/                the Ghidra toolbar icons, one per button, drawn for the dark theme
svg/gitlab/                the icons of the GitLab project page in part 3 (files, folders, branch, commit, tag, the sidebar groups and others), one per file, drawn for GitLab's dark theme
svg/engrama/               the Engrama logo, which replaces the GitLab and Rocket.Chat logos on Engrama's own servers
svg/postcard/              chillon.svg, the picture side of Kellerman's postcard in part 3: Chillon Castle on Lake Geneva under snowy mountains
svg/rocketchat/            the icons of the Rocket.Chat workspace in part 3 (hash, at, search, send, plus, emoji, members, thread), each in a gray for the light room and a lighter gray (-light) for the dark room list
svg/gnome/                 the GNOME guest: the wallpaper tile and the file-manager icons
svg/notebook/              Kellerman's notebook page: the margin line and the ruling tile
svg/phone/                 Toma's phone: the screen notch
BRIEF.MD                   the index of the brief, one row per file in docs/
docs/                      the brief, one file per topic
fonts/<Name>/              one folder per font, named after it, with its files and its OFL.txt: IBM Plex Sans, IBM Plex Mono, Newsreader, Caveat (Kellerman), Patrick Hand (Toma), Kalam (Hollis), Schoolbell (Sigurrós; its licence, Apache 2.0, is in LICENSE.txt), VT323

css/fonts.css              local @font-face rules
css/site/tokens.css        repeated values, the dark and light themes, the gutter
css/site/base.css          box sizing, the page, paragraphs, buttons, focus, redaction bars, text for screen readers only (span.vh), translations (span.tr)
css/site/masthead.css      the reading meter, the masthead, the settings row and its tools, the settings bar
css/site/layout.css        pretty wrap, the reading column, the contents and their floating menu (story only)
css/site/dock.css          the dock in the bottom corner below 1200 px: the tab, Contents (story only) and Settings, on the story and the pages in notes/
css/site/tabs.css          tabs, shared by the tabbed chapters and the row of pages in notes/
css/site/dialogue.css      speaker colors, the site announcement, chapters, sections, scenes, replies, the cards of part 3, the end of the book, the folding screens (story only)
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
css/screens/print.css      the newspaper, the AKV poster, the whiteboard, the hearing, the pinout, the Council's leaflet, the court's ruling, the Engrama blog post, the GitLab project page, Hollis's notebook, the Europa Wire article, the Rocket.Chat workspace, the EU declaration of conformity, Favre's letter, the employment contract, the Official Journal, the GitLab releases and the postcard (part 3)
css/screens/letters.css    letters by hand and screened mail (chapter 9)
css/screens/handhelds.css  the bench kit's reader and Toma's phone (chapter 10), with the phone's contacts app (part 2, chapter 4)
css/screens/calculator.css the graphing calculator (chapter 11), and its plain display without scripts
css/screens/secure.css     the recording team's secure workstation (part 2, chapter 3): the console, tables that wrap, the transcript, the teletext page and the firmware dialog, with no preformatted text (part 2 only)

js/making/probe.js         not deferred, loaded after the stylesheets: on index.html?probe=making and part2.html?probe=making it hides the story behind one line in the system font, through a style of its own, so no web font starts downloading before counts.js counts the story and jumps back
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
js/reading/tocmenu.js      contents as a floating menu below 1200 px, and the dock's tuck tab; on the pages in notes/ it runs the dock with only the tab and Settings
js/text/names.js           speaker column width
js/reading/notes.js        highlights, notes, quotes, bookmark
js/reading/toggles.js      toggle buttons
js/reading/postcard.js     the postcard of part 3 turns over (part3.html only)
js/reading/position.js     reading progress, contents tracking, section links, keys
js/devices/ghidra.js       Ghidra interactions
js/making/counts.js        counts of replies (both parts: each part saves its raw counts, part 1 hands them to part 2 on a probe, and part 2 sends the finished counts back), spoken words and stage directions per speaker, with the average and the median length of a reply; on the story page it saves them for the making page, and opened as index.html?probe=making it passes through part2.html (#raw=) and sends them back to notes/making.html in the address (#counts=)
js/pages/concept.js        the pages in notes/: follows the story's pretty wrap setting
js/pages/file.js           notes/file.html: switches between the Euclid, Explained and archived revisions, and the header of both between Traditional and ACS, and keeps both choices
js/pages/settings.js       the pages in notes/: the Settings button and row (Pretty wrap, Remember settings; Theme, Motion, Scroll speed and Redactions bound by base/, Page width by text/width.js), sharing their saved values with the story; the row starts folded
js/pages/glossary.js       the glossary's sort control
js/making/making.js        the Numbers section of notes/making.html: counts ../index.html and ../part2.html when served over the web; from a disk it uses the counts sent back by the probe, then the counts saved in the tab, and otherwise shows a notice whose Count the story button runs the probe
```

The scripts sit in folders by role: `base` (helpers, theme, motion, redactions, scroll areas), `text` (wrapping and the name column), `reading` (settings, sections, contents, notes, toggles, position), `devices` (the simulated screens and the calculator), `pages` (the pages in notes/) and `making` (the live counts). The stylesheets sit in `site` (the page and the story) and `screens` (the simulated screens and printed matter), one file to a topic, and every page links only the files it needs, in the order listed above. The story links every file except `pages.css` and `glossary.css`; the pages in notes/ link `tokens`, `base`, `masthead`, `dock`, `tabs`, `end`, `motion`, `pages` and `print`, and load `reading/settings.js` and `reading/tocmenu.js` for the Settings button, the floating panel and the dock, and the glossary adds `glossary.css`.

In the alpha versions, concept.html, summary.html and glossary.html were generated by build.py from concept.py, summary.py and glossary.py, the build also indented index.html, and pixlcd.py drew the calculator's pixel display from the X11 koi10x20 font. Those scripts and their sources were deleted, so every page is now edited directly.

Apart from probe.js, the scripts are plain deferred scripts loaded in the order above, so the page also works from a local file. They share one object, `window.KeepTheLife`, which `core.js` creates.

Without scripts every page reads in full: all sections show, every screen and attachment is open, the contents stay in the sidebar, and the controls that need a script (settings, the glossary's sort, the bookmark and notes, the making page's figures) stay out of sight. Each page's `html` element starts with the class `no-js`, which `core.js` removes.
