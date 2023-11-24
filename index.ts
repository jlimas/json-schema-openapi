import convert from "@openapi-contrib/json-schema-to-openapi-schema";
import jsonToSchema from "json-schema-generator";

const removeKeys = ["minLength", "uniqueItems", "minItems"];

function cleanKeys(payload: any) {
  Object.keys(payload).forEach((key) => {
    if (removeKeys.includes(key)) {
      delete payload[key];
    } else if (typeof payload[key] === "object") {
      cleanKeys(payload[key]);
    }
  });
  return payload;
}

const server = Bun.serve({
  port: process.env.PORT || 3000,
  async fetch(request) {
    const body = await request.json();
    const jsonSchema = jsonToSchema(body);
    const openapiSchema = await convert(jsonSchema);
    return Response.json(cleanKeys(openapiSchema));
  },
});

console.log(`Listening on ${server.port}`);
