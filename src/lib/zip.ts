import { Zip, ZipPassThrough } from "fflate";

export function createZip(files: File[], progress: (i: number) => void) {
  return new Promise<Blob>(async (resolve, reject) => {
    const parts: Uint8Array[] = [];
    const zip = new Zip((err, data, final) => {
      if (err != null) return reject(err);
      parts.push(data);
      if (final) resolve(new Blob(parts, { type: "application/zip" }));
    });

    for (const [i, file] of files.entries()) {
      const f = new ZipPassThrough(file.name);
      f.mtime = file.lastModified;
      zip.add(f);
      await file.stream().pipeTo(
        new WritableStream({
          write(chunk) {
            f.push(chunk);
          },
          close() {
            f.push(new Uint8Array(), true);
          },
        }),
      );
      progress(i);
    }
    zip.end();
  });
}
