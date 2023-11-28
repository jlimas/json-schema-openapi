import convert from "@openapi-contrib/json-schema-to-openapi-schema";
import jsonToSchema from "json-schema-generator";

function descriptions(obj: any, keyName: string = "", isRoot: boolean = true) {
  if (obj && obj.hasOwnProperty("type") && !isRoot) {
    obj.description = `Description for the field: ${keyName}`;
  }

  if (obj && obj.hasOwnProperty("properties")) {
    for (let key in obj.properties) {
      descriptions(obj.properties[key], key, false);
    }
  }

  if (obj && obj.hasOwnProperty("items")) {
    if (Array.isArray(obj.items)) {
      obj.items.forEach((item: any) => descriptions(item, keyName, false));
    } else {
      descriptions(obj.items, keyName, false);
    }
  }
  return obj;
}

function clean(payload: any) {
  const removeKeys = ["minLength", "uniqueItems", "minItems"];
  if ("description" in payload) delete payload.description;
  Object.keys(payload).forEach((key) => {
    if (removeKeys.includes(key)) {
      delete payload[key];
    } else if (typeof payload[key] === "object") {
      clean(payload[key]);
    }
  });
  return payload;
}
const headers = {
  "content-type": "application/json; charset=UTF-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

const server = Bun.serve({
  port: process.env.PORT || 3000,
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers,
      });
    }
    const body = await request.json();
    const jsonSchema = jsonToSchema(body);
    const openapiSchema = await convert(jsonSchema);
    const data = descriptions(clean(openapiSchema));

    return Response.json(data, {
      headers,
    });
  },
});

console.log(`Listening on ${server.port}`);
