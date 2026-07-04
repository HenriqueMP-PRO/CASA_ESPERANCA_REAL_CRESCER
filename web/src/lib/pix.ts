type PixPayloadParams = {
  key: string;
  receiverName: string;
  city: string;
  amount?: number | null;
  description?: string;
  txid?: string;
};

function sanitize(value: string, maxLength: number) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9 $%*+\-./:]/g, "")
    .toUpperCase()
    .slice(0, maxLength);
}

function field(id: string, value: string) {
  return `${id}${String(value.length).padStart(2, "0")}${value}`;
}

function crc16(payload: string) {
  let crc = 0xffff;

  for (let i = 0; i < payload.length; i += 1) {
    crc ^= payload.charCodeAt(i) << 8;

    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function buildPixPayload({
  key,
  receiverName,
  city,
  amount,
  description = "Doacao CER Crescer",
  txid = "CERDOACAO",
}: PixPayloadParams) {
  const merchantAccount = [
    field("00", "br.gov.bcb.pix"),
    field("01", key),
    field("02", sanitize(description, 25)),
  ].join("");

  const parts = [
    field("00", "01"),
    field("01", "11"),
    field("26", merchantAccount),
    field("52", "0000"),
    field("53", "986"),
    amount && amount > 0 ? field("54", amount.toFixed(2)) : "",
    field("58", "BR"),
    field("59", sanitize(receiverName, 25)),
    field("60", sanitize(city, 15)),
    field("62", field("05", sanitize(txid, 25))),
  ];

  const payloadWithoutCrc = `${parts.join("")}6304`;

  return `${payloadWithoutCrc}${crc16(payloadWithoutCrc)}`;
}
