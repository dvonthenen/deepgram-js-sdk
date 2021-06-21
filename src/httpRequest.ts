import { request } from "https";
import { RequestOptions } from "node:https";

const _requestOptions = (
  api_key: string,
  apiUrl: string,
  path: string,
  method: string,
  payload?: string | Buffer,
  // eslint-disable-next-line @typescript-eslint/ban-types
  override_options?: any
): RequestOptions => {
  const options = {
    host: apiUrl,
    path,
    port: 8090,
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `token ${api_key}`,
      "Content-Length": payload ? Buffer.byteLength(payload) : undefined,
    },
  };
  if (payload === undefined) {
    delete options.headers["Content-Length"];
  }
  let headers = options.headers;
  if (override_options && override_options.headers) {
    headers = { ...headers, ...override_options.headers };
  }

  return { ...options, ...override_options, ...{ headers } };
};

export function _request<T>(
  method: string,
  api_key: string,
  apiUrl: string,
  path: string,
  payload?: string | Buffer,
  // eslint-disable-next-line @typescript-eslint/ban-types
  options?: Object
): Promise<T> {
  const requestOptions = _requestOptions(
    api_key,
    apiUrl,
    path,
    method,
    payload,
    options
  );
  return new Promise((resolve, reject) => {
    try {
      const httpRequest = request(requestOptions, (dgRes) => {
        let dgResContent = "";

        dgRes.on("data", (chunk) => {
          dgResContent += chunk;
        });

        dgRes.on("end", () => {
          let dgResponse;
          try {
            dgResponse = JSON.parse(dgResContent);
          } catch {
            dgResponse = { error: dgResContent };
          }

          if (dgResponse.error) {
            reject(`DG: ${dgResContent}`);
          }
          resolve(dgResponse);
        });

        dgRes.on("error", (err) => {
          reject(`DG: ${err}`);
        });
      });

      httpRequest.on("error", (err) => {
        reject(`DG: ${err}`);
      });

      if (payload) {
        httpRequest.write(payload);
      }

      httpRequest.end();
    } catch (err) {
      reject(`DG: ${err}`);
    }
  });
}