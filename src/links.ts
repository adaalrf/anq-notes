import { Parser } from 'htmlparser2';
export function checkLinks(files: Map<string, string | Buffer>, siteUrl: string) {
  const ids = new Map<string, Set<string>>();
  const links: { file: string; value: string }[] = [];
  for (const [file, body] of files) {
    if (!file.endsWith('.html')) continue;
    const found = new Set<string>();
    const parser = new Parser({
      onopentag(name, attributes) {
        if (name === 'img' && !('alt' in attributes))
          throw new Error(`${file}: images need alt text (or alt="" when decorative).`);
        if (name === 'img' && attributes.src) {
          const image = new URL(attributes.src, siteUrl + '/');
          if (image.origin !== siteUrl)
            throw new Error(
              `${file}: external images are blocked by the supplied CSP; copy the image into assets/.`,
            );
        }
        if (attributes.id) {
          if (found.has(attributes.id))
            throw new Error(`${file}: duplicate id "${attributes.id}".`);
          found.add(attributes.id);
        }
        for (const key of ['href', 'src'])
          if (
            attributes[key] &&
            !(name === 'link' && ['canonical', 'alternate'].includes(attributes.rel))
          )
            links.push({ file, value: attributes[key] });
      },
    });
    parser.write(body.toString());
    parser.end();
    ids.set(file, found);
  }
  for (const { file, value } of links) {
    const base =
      file === 'index.html'
        ? '/'
        : file.endsWith('/index.html')
          ? '/' + file.slice(0, -10)
          : '/' + file;
    let url: URL;
    try {
      url = new URL(value, siteUrl + base);
    } catch {
      throw new Error(`${file}: invalid link "${value}".`);
    }
    if (url.origin !== siteUrl) continue;
    let path: string;
    try {
      path = decodeURIComponent(url.pathname);
    } catch {
      throw new Error(`${file}: invalid URL encoding in "${value}".`);
    }
    if (path.includes('\\') || path.includes('\0')) throw new Error(`${file}: invalid link path.`);
    const target = path.endsWith('/') ? path.slice(1) + 'index.html' : path.slice(1);
    if (!files.has(target))
      throw new Error(`${file}: broken internal link "${value}" (missing ${target}).`);
    if (url.hash && ids.has(target)) {
      let fragment: string;
      try {
        fragment = decodeURIComponent(url.hash.slice(1));
      } catch {
        throw new Error(`${file}: invalid fragment in "${value}".`);
      }
      if (!ids.get(target)!.has(fragment))
        throw new Error(`${file}: missing fragment in "${value}".`);
    }
  }
}
