#!/usr/bin/env node

import axios from "axios";

const COOLIFY_URL = process.env.COOLIFY_URL;
const API_KEY = process.env.COOLIFY_KEY;

const server = {
  name: "coolify-mcp-server",
  version: "1.0.0"
};

const tools = [
  {
    name: "list_apps",
    description: "Lista todas as aplicações no Coolify",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "deploy_app",
    description: "Faz deploy de uma aplicação específica",
    inputSchema: {
      type: "object",
      properties: {
        uuid: {
          type: "string",
          description: "UUID da aplicação no Coolify"
        }
      },
      required: ["uuid"]
    }
  },
  {
    name: "get_app_logs",
    description: "Obtém os logs de uma aplicação",
    inputSchema: {
      type: "object",
      properties: {
        uuid: {
          type: "string",
          description: "UUID da aplicação no Coolify"
        }
      },
      required: ["uuid"]
    }
  }
];

async function callCoolify(method, endpoint, data = null) {
  try {
    const config = {
      method,
      url: `${COOLIFY_URL}${endpoint}`,
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json"
      }
    };
    
    if (data) {
      config.data = data;
    }

    const res = await axios(config);
    return { success: true, data: res.data };
  } catch (err) {
    return { 
      success: false, 
      error: err.response?.data?.message || err.message,
      status: err.response?.status
    };
  }
}

async function handleToolCall(name, args) {
  switch (name) {
    case "list_apps":
      return await callCoolify("GET", "/applications");
      
    case "deploy_app":
      if (!args.uuid) {
        return { success: false, error: "UUID da aplicação é obrigatório" };
      }
      return await callCoolify("POST", `/applications/${args.uuid}/restart`);
      
    case "get_app_logs":
      if (!args.uuid) {
        return { success: false, error: "UUID da aplicação é obrigatório" };
      }
      return await callCoolify("GET", `/applications/${args.uuid}/logs`);
      
    default:
      return { success: false, error: `Comando desconhecido: ${name}` };
  }
}

// Protocolo MCP via stdio
let buffer = "";

process.stdin.on("data", async (chunk) => {
  buffer += chunk.toString();
  
  const lines = buffer.split("\n");
  buffer = lines.pop() || "";
  
  for (const line of lines) {
    if (!line.trim()) continue;
    
    try {
      const message = JSON.parse(line);
      let response;

      switch (message.method) {
        case "initialize":
          response = {
            jsonrpc: "2.0",
            id: message.id,
            result: {
              protocolVersion: "2024-11-05",
              capabilities: {
                tools: {}
              },
              serverInfo: server
            }
          };
          break;

        case "tools/list":
          response = {
            jsonrpc: "2.0",
            id: message.id,
            result: { tools }
          };
          break;

        case "tools/call":
          const result = await handleToolCall(
            message.params.name,
            message.params.arguments || {}
          );
          response = {
            jsonrpc: "2.0",
            id: message.id,
            result: {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(result, null, 2)
                }
              ]
            }
          };
          break;

        default:
          response = {
            jsonrpc: "2.0",
            id: message.id,
            error: {
              code: -32601,
              message: `Método não suportado: ${message.method}`
            }
          };
      }

      process.stdout.write(JSON.stringify(response) + "\n");
    } catch (err) {
      const errorResponse = {
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32700,
          message: `Erro ao processar mensagem: ${err.message}`
        }
      };
      process.stdout.write(JSON.stringify(errorResponse) + "\n");
    }
  }
});

process.stdin.resume();
