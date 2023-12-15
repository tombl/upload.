import { base64ToBytes, bytesToBase64 } from "byte-base64";
import { hexToUint8Array, uint8ArrayToHex } from "uint8array-extras";

const DICT = [
  "X-Amz-Algorithm",
  "AWS4-HMAC-SHA256",
  "X-Amz-Credential",
  "s3",
  "aws4_request",
  "X-Amz-Date",
  "X-Amz-Expires",
  "X-Amz-SignedHeaders",
  "host",
  "X-Amz-Signature",
  // append only
];

const enum TAGS {
  Dict = 0,
  Number = 1,
  IsoDate = 2,
  Hex = 3,
  GkHex = 4,
  Slashed = 5,
  Verbatim = 6,
}
const MASK_TAG = 0b111;
const MASK_BODY = 0b1111_1000;
const SHIFT_BODY = 4;

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

export function qpack(query: URLSearchParams, cap = 1024) {
  const out = new Uint8Array(cap);
  const dv = new DataView(out.buffer);
  let i = 0;
  function writeU8(n: number) {
    assert(n >= 0 && n < 256, "out of range");
    out[i++] = n;
  }
  function writeU32(n: number) {
    assert(n >= 0 && n < 2 ** 32, "out of range");
    dv.setUint32(i, n);
    i += 4;
  }
  function writeBytes(bytes: Uint8Array) {
    writeU8(bytes.length);
    out.set(bytes, i);
    i += bytes.length;
  }

  function writePart(part: string) {
    {
      const idx = DICT.indexOf(part);
      if (idx !== -1) {
        writeU8(TAGS.Dict | (idx << SHIFT_BODY));
        return;
      }
    }

    if (/^\d+$/.test(part)) {
      const num = parseInt(part, 10);
      if (num < 2 ** 32) {
        writeU8(TAGS.Number);
        writeU32(num);
        return;
      }
    }

    if (/^\d{8}T\d{6}Z$/.test(part)) {
      const date = parseInt(part.slice(0, 8), 10);
      const time = parseInt(part.slice(9, -1), 10);
      writeU8(TAGS.IsoDate);
      writeU32(date);
      writeU32(time);
      return;
    }

    if (/^(GK)?[0-9a-f]+$/.test(part) && part.length % 2 == 0) {
      const gk = part.startsWith("GK");
      writeU8(gk ? TAGS.GkHex : TAGS.Hex);
      writeBytes(hexToUint8Array(part.slice(gk ? 2 : 0)));
      return;
    }

    if (part.includes("/")) {
      const parts = part.split("/");
      writeU8(TAGS.Slashed);
      writeU32(parts.length);
      for (const part of parts) writePart(part);
      return;
    }

    writeU8(TAGS.Verbatim);
    writeBytes(new TextEncoder().encode(part));
  }

  writeU8(query.size);
  for (const [key, value] of query) {
    writePart(key);
    writePart(value);
  }

  if (i > cap) return qpack(query, i);
  const ret = bytesToBase64(out.slice(0, i));
  assert(qunpack(ret).toString() === query.toString(), "roundtrip failed");
  return ret;
}

export function qunpack(query: string) {
  const buf = base64ToBytes(query);
  const dv = new DataView(buf.buffer);
  let i = 0;

  function readU8() {
    return dv.getUint8(i++);
  }
  function readU32() {
    const n = dv.getUint32(i);
    i += 4;
    return n;
  }
  function readBytes() {
    const len = readU8();
    const bytes = buf.slice(i, i + len);
    i += len;
    return bytes;
  }
  function readPart(): string {
    const tag = readU8();
    switch (tag & MASK_TAG) {
      case TAGS.Dict:
        return DICT[(tag & MASK_BODY) >> SHIFT_BODY];
      case TAGS.Number:
        return readU32().toString();
      case TAGS.IsoDate: {
        const date = readU32().toString().padStart(8, "0");
        const time = readU32().toString().padStart(6, "0");
        return `${date}T${time}Z`;
      }
      case TAGS.Hex:
        return uint8ArrayToHex(readBytes());
      case TAGS.GkHex:
        return "GK" + uint8ArrayToHex(readBytes());
      case TAGS.Slashed:
        return Array.from({ length: readU32() }, () => readPart()).join("/");
      case TAGS.Verbatim:
        return new TextDecoder().decode(readBytes());
      default:
        throw new Error("invalid tag");
    }
  }

  const size = readU8();
  const out = new URLSearchParams();
  for (let i = 0; i < size; i++) {
    const key = readPart();
    const value = readPart();
    out.set(key, value);
  }
  return out;
}
