import convert from "@openapi-contrib/json-schema-to-openapi-schema";
import jsonToSchema from "json-schema-generator";

const server = Bun.serve({
  port: process.env.PORT || 3000,
  async fetch(request) {
    const body = await request.json();
    const jsonSchema = jsonToSchema(body);
    const openapiSchema = await convert(jsonSchema);
    return Response.json(openapiSchema);
  },
});

console.log(`Listening on ${server.port}`);
