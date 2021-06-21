import chai from "chai";

import { preRecordedTranscription } from "../../src/transcription/preRecordedTranscription";

chai.should();

describe("Transcription: Pre-recorded tests", () => {
  it("Providing buffer without mimetype will return error", (done) => {
    preRecordedTranscription("testKey:testSecret", "fakeUrl", {
      buffer: Buffer.allocUnsafe(100),
      mimetype: "",
    }).catch((e) => {
      try {
        e.message.should.eq(
          "DG: Mimetype must be provided if the source is a Buffer"
        );
      } catch (assertionError) {
        done(assertionError);
        return;
      }
    });

    done();
  });
});