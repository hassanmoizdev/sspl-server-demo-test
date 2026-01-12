import db from "../utils/db";

class Certificate {
  static create(data: any) {
    return db.certificate.create({
      data: {
        ...data,
      },
    });
  }

  static getOnlyBySerial(serial: any) {
    return db.certificate.findUnique({
      where: { serialNumber: serial },
    });
  }

  static getByParameters(personId: number, sessionId: number) {
    return db.certificate.findFirst({
      where: {
        personId,
        sessionId,
      },
    });
  }
}

export default Certificate;
