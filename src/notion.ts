import { Client } from "@notionhq/client";
import type { WritePayload, QueryPayload, CreateDatabasePayload, UpdateDatabasePayload } from "./schema.js";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
  // Use 2025-09-03 for proper data source support
  notionVersion: "2025-09-03",
});// Local helper to normalize Notion IDs from raw IDs or URLs
function extractNotionId(input?: string | null) {
  if (!input) return undefined as string | undefined;
  const str = String(input).trim();
  const match32 = (str.match(/[0-9a-fA-F]{32}/g) || [])[0];
  const raw = match32 || str.replace(/[^0-9a-fA-F]/g, "");
  if (raw.length !== 32) return undefined as string | undefined;
  const id = raw.toLowerCase();
  return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`;
}

function isAlreadyNotionProperty(v: any): boolean {
  return (
    v &&
    typeof v === "object" &&
    ("title" in v ||
      "rich_text" in v ||
      "number" in v ||
      "select" in v ||
      "multi_select" in v ||
      "status" in v ||
      "checkbox" in v ||
      "date" in v ||
      "people" in v ||
      "files" in v ||
      "url" in v ||
      "email" in v ||
      "phone_number" in v ||
      "relation" in v ||
      "rollup" in v)
  );
}

// Heuristic mapping for simple string/number/bool properties.
// - "Name" maps to title
// - "Status" maps to status (falls back to select if adjusted server-side)
export function toNotionProperties(input: Record<string, any> = {}): Record<string, any> {
  const props: Record<string, any> = {};
  for (const [key, value] of Object.entries(input)) {
    if (isAlreadyNotionProperty(value)) {
      props[key] = value;
      continue;
    }

    if (key.toLowerCase() === "name") {
      props[key] = {
        title: [{ type: "text", text: { content: String(value ?? "Untitled") } }],
      };
      continue;
    }

    if (key.toLowerCase() === "status" && typeof value === "string") {
      props[key] = { status: { name: value } };
      continue;
    }

    if (typeof value === "string") {
      props[key] = { rich_text: [{ type: "text", text: { content: value } }] };
    } else if (typeof value === "number") {
      props[key] = { number: value };
    } else if (typeof value === "boolean") {
      props[key] = { checkbox: value };
    } else if (Array.isArray(value)) {
      // naive multi_select from strings
      if (value.every((v) => typeof v === "string")) {
        props[key] = { multi_select: value.map((v) => ({ name: v })) };
      }
    }
  }
  return props;
}

export function toBlocks(content?: string | Array<{ type: string; text: string }>) {
  if (!content) return [];
  if (typeof content === "string") {
    return [
      {
        object: "block",
        type: "paragraph",
        paragraph: { rich_text: [{ type: "text", text: { content: content } }] },
      },
    ];
  }
  return content.map((b) => ({
    object: "block",
    type: b.type,
    [b.type]: { rich_text: [{ type: "text", text: { content: b.text } }] },
  }));
}

// Helper function to discover data sources from database ID (Step 1 of upgrade guide)
async function getDataSourcesFromDatabase(databaseId: string) {
  console.log(`🔍 Discovering data sources for database ${databaseId}`);
  
  const database: any = await (notion as any).databases.retrieve({ 
    database_id: extractNotionId(databaseId) 
  });
  
  const dataSources = database.data_sources || [];
  console.log(`📊 Found ${dataSources.length} data sources:`, dataSources);
  
  return dataSources;
}

// Helper function to get the primary data source ID for backwards compatibility
async function getPrimaryDataSourceId(databaseId: string): Promise<string> {
  const dataSources = await getDataSourcesFromDatabase(databaseId);
  
  if (dataSources.length === 0) {
    throw new Error(`No data sources found for database ${databaseId}`);
  }
  
  // Return the first data source ID (primary one)
  return dataSources[0].id;
}

export async function handleWrite(payload: WritePayload) {
  const title =
    payload.title ||
    (typeof (payload as any).properties?.Name === "string"
      ? (payload as any).properties?.Name
      : undefined) ||
    "Untitled";

  if (payload.target === "db") {
    // Step 2 of 2025-09-03 upgrade: Use data_source_id instead of database_id
    const databaseId = (payload as any).database_id!;
    const dataSourceId = await getPrimaryDataSourceId(databaseId);
    
    const properties = toNotionProperties({ Name: title, ...(payload as any).properties });
    
    // Use notion.request for 2025-09-03 API with data_source_id
    const res: any = await (notion as any).request({
      path: 'pages',
      method: 'post',
      body: {
        parent: { 
          type: "data_source_id", 
          data_source_id: dataSourceId 
        },
        properties,
      }
    });
    
    const pageId = res.id;

    const blocks = toBlocks((payload as any).content);
    if (blocks.length) {
      await notion.blocks.children.append({ block_id: pageId, children: blocks as any });
    }
    return { action: "created_in_database", page_id: pageId, url: res.url };
  }

  if (payload.target === "page") {
    const res = await notion.pages.create({
      parent: { page_id: (payload as any).page_id! },
      properties: toNotionProperties({ Name: title, ...(payload as any).properties }),
    });
    const pageId = res.id;
    const blocks = toBlocks((payload as any).content);
    if (blocks.length) {
      await notion.blocks.children.append({ block_id: pageId, children: blocks as any });
    }
    return { action: "created_under_page", page_id: pageId, url: (res as any).url };
  }

  if (payload.target === "update") {
    const updates: any = {};
    if ((payload as any).properties)
      updates.properties = toNotionProperties((payload as any).properties);
    const res = await notion.pages.update({
      page_id: (payload as any).page_id!,
      ...updates,
    });

    const blocks = toBlocks((payload as any).content);
    if (blocks.length) {
      await notion.blocks.children.append({ block_id: (payload as any).page_id!, children: blocks as any });
    }
    return { action: "updated_page", page_id: (payload as any).page_id, url: (res as any).url };
  }

  throw new Error("Unsupported target");
}

export async function handleQuery(payload: QueryPayload) {
  const cap = (payload as any).max_results as number | undefined;
  const pageSize = (payload as any).page_size as number | undefined;
  const startCursor = (payload as any).start_cursor as string | undefined;

  if (payload.mode === "search") {
    const results: any[] = [];
    let next = startCursor;
    let has_more = true;
    do {
      const res: any = await (notion as any).search({
        query: (payload as any).query,
        filter: (payload as any).object
          ? { property: "object", value: (payload as any).object }
          : undefined,
        sort: { direction: "descending", timestamp: "last_edited_time" },
        start_cursor: next,
        page_size: pageSize,
      });
      if (Array.isArray(res.results)) results.push(...res.results);
      next = res.next_cursor ?? null;
      has_more = Boolean(res.has_more && next);
      if (cap && results.length >= cap) {
        // slice to cap and return with a synthetic next_cursor
        const sliced = results.slice(0, cap);
        return { mode: "search", results: sliced, has_more: has_more || results.length > cap, next_cursor: next };
      }
      if (!has_more) {
        return { mode: "search", results, has_more: false, next_cursor: null };
      }
    } while (true);
  }

  if (payload.mode === "db_query") {
    // Step 3 of 2025-09-03 upgrade: Query data source instead of database
    const databaseId = (payload as any).database_id!;
    const dataSourceId = await getPrimaryDataSourceId(databaseId);
    
    const results: any[] = [];
    let next = startCursor;
    let has_more = true;
    do {
      // Use data source query endpoint
      const res: any = await (notion as any).request({
        path: `data_sources/${dataSourceId}/query`,
        method: 'post',
        body: {
          filter: (payload as any).filter,
          sorts: (payload as any).sorts,
          page_size: pageSize,
          start_cursor: next,
        }
      });
      
      if (Array.isArray(res.results)) results.push(...res.results);
      next = res.next_cursor ?? null;
      has_more = Boolean(res.has_more && next);
      if (cap && results.length >= cap) {
        const sliced = results.slice(0, cap);
        return { mode: "db_query", results: sliced, has_more: has_more || results.length > cap, next_cursor: next };
      }
      if (!has_more) {
        return { mode: "db_query", results, has_more: false, next_cursor: null };
      }
    } while (true);
  }

  if (payload.mode === "page_get") {
    const res = await (notion as any).pages.retrieve({ page_id: (payload as any).page_id! });
    return { mode: "page_get", page: res };
  }

  if (payload.mode === "database_get") {
    const res = await (notion as any).databases.retrieve({ database_id: (payload as any).database_id! });
    return { mode: "database_get", database: res };
  }

  if (payload.mode === "data_source_get") {
    const res = await (notion as any).request({
      method: 'get',
      path: `data_sources/${extractNotionId((payload as any).data_source_id!)}`
    });
    return { mode: "data_source_get", data_source: res };
  }

  if (payload.mode === "data_source_query") {
    const dataSourceId = extractNotionId((payload as any).data_source_id!);
    const queryBody: any = {};
    
    if (payload.filter) queryBody.filter = payload.filter;
    if (payload.sorts) queryBody.sorts = payload.sorts;
    if (payload.start_cursor) queryBody.start_cursor = payload.start_cursor;
    if (payload.page_size) queryBody.page_size = payload.page_size;
    if ((payload as any).result_type) queryBody.result_type = (payload as any).result_type;
    
    const res = await (notion as any).request({
      method: 'post',
      path: `data_sources/${dataSourceId}/query`,
      body: queryBody
    });
    
    return { mode: "data_source_query", result: res };
  }

  if (payload.mode === "data_source_update") {
    const result = await handleUpdateDataSource(payload);
    return { mode: "data_source_update", result };
  }

  if (payload.mode === "block_get") {
    const result = await handleBlockGet(payload);
    return { mode: "block_get", result };
  }

  if (payload.mode === "block_children_get") {
    const result = await handleBlockChildrenGet(payload);
    return { mode: "block_children_get", result };
  }

  if (payload.mode === "block_children_append") {
    const result = await handleBlockChildrenAppend(payload);
    return { mode: "block_children_append", result };
  }

  if (payload.mode === "block_update") {
    const result = await handleBlockUpdate(payload);
    return { mode: "block_update", result };
  }

  if (payload.mode === "block_delete") {
    const result = await handleBlockDelete(payload);
    return { mode: "block_delete", result };
  }

  if (payload.mode === "page_property_get") {
    const result = await handlePagePropertyGet(payload);
    return { mode: "page_property_get", result };
  }

  if (payload.mode === "data_source_templates_list") {
    const result = await handleDataSourceTemplatesList(payload);
    return { mode: "data_source_templates_list", result };
  }

  throw new Error("Unsupported query mode");
}

  function toDatabaseProperty(def: { type?: string; options?: string[]; number_format?: string; expression?: string; database_id?: string; relation_type?: string; synced_property_name?: string; synced_property_id?: string; relation_property_name?: string; relation_property_id?: string; rollup_property_name?: string; rollup_property_id?: string; function?: string; prefix?: string; raw?: any }) {
    if ((def as any).raw) {
      return (def as any).raw;
    }
    const t = def.type;
    switch (t) {
      case "title":
        return { title: {} };
      case "rich_text":
        return { rich_text: {} };
      case "number":
        return { number: { format: def.number_format || "number" } };
      case "select":
        return { select: { options: (def.options || []).map((name) => ({ name })) } };
      case "multi_select":
        return { multi_select: { options: (def.options || []).map((name) => ({ name })) } };
      case "status":
        return { status: { options: (def.options || []).map((name) => ({ name })) } };
      case "date":
        return { date: {} };
      case "checkbox":
        return { checkbox: {} };
      case "url":
        return { url: {} };
      case "email":
        return { email: {} };
      case "phone_number":
        return { phone_number: {} };
      case "people":
        return { people: {} };
      case "files":
        return { files: {} };
      case "formula":
        return { formula: { expression: def.expression || "" } };
      case "relation": {
        // Support both simplified shape and nested { relation: { ... } } shape
        let databaseId = def.database_id as string | undefined;
        let relType = def.relation_type as string | undefined;
        const nested = (def as any).relation;
        if (nested && typeof nested === "object") {
          databaseId = nested.database_id || databaseId;
          relType = nested.relation_type || relType;
        }

        const normalizedDbId = extractNotionId(databaseId || "") || databaseId;
        const relation: any = { database_id: normalizedDbId };
        // Map user-friendly 'many_to_many' to Notion 'dual_property'
        const kind = relType === "many_to_many" ? "dual_property" : relType;
        if (def.relation_type === "dual_property") {
          relation.type = "dual_property";
          relation.dual_property = {} as any;
          if (def.synced_property_name) relation.dual_property.synced_property_name = def.synced_property_name;
          if (def.synced_property_id) relation.dual_property.synced_property_id = def.synced_property_id;
        } else {
          relation.type = kind === "dual_property" ? "dual_property" : "single_property";
          if (relation.type === "dual_property") {
            relation.dual_property = {} as any;
            if ((def as any).synced_property_name) relation.dual_property.synced_property_name = (def as any).synced_property_name;
            if ((def as any).synced_property_id) relation.dual_property.synced_property_id = (def as any).synced_property_id;
          } else {
            relation.single_property = {};
          }
        }
        return { relation };
      }
      case "rollup": {
        const rollup: any = { function: def.function || "count" };
        if (def.relation_property_id) rollup.relation_property_id = def.relation_property_id;
        if (def.relation_property_name) rollup.relation_property_name = def.relation_property_name;
        if (def.rollup_property_id) rollup.rollup_property_id = def.rollup_property_id;
        if (def.rollup_property_name) rollup.rollup_property_name = def.rollup_property_name;
        return { rollup };
      }
      case "created_time":
        return { created_time: {} };
      case "created_by":
        return { created_by: {} };
      case "last_edited_time":
        return { last_edited_time: {} };
      case "last_edited_by":
        return { last_edited_by: {} };
      case "unique_id":
        return { unique_id: { prefix: def.prefix } };
      default:
        return undefined as any;
    }
  }

  export async function handleCreateDatabase(payload: CreateDatabasePayload) {
    const title = (payload as any).title as string;
    const inputProps: Record<string, any> = (payload as any).properties || {};

    // Build properties schema according to new API structure
    const properties: Record<string, any> = {};
    let hasTitle = false;
    for (const [name, def] of Object.entries(inputProps)) {
      const prop = toDatabaseProperty(def as any);
      if (!prop) continue;
      properties[name] = prop;
      if ((prop as any).title) hasTitle = true;
    }
    if (!hasTitle) {
      properties["Name"] = { title: {} };
    }

    // Determine parent: prefer explicit parent_page_id, then env fallback, then (as a last resort) try workspace root
    let parentPageId: string | undefined = (payload as any).parent_page_id;
    const envFallbackParent = process.env.NOTION_PARENT_PAGE_ID || process.env.NOTION_HOLDING_PAGE_ID;
    if (!parentPageId && (payload as any).workspace && envFallbackParent) {
      parentPageId = envFallbackParent;
    }

    // Fallback: reuse the parent page of a known database (NOTION_DB_ID/URL)
    if (!parentPageId && (payload as any).workspace) {
      const envDb = process.env.NOTION_DB_ID || process.env.NOTION_DB_URL;
      const dbId = extractNotionId(envDb || "");
      if (dbId) {
        try {
          const db: any = await (notion as any).databases.retrieve({ database_id: dbId });
          if (db?.parent?.type === "page_id" && db?.parent?.page_id) {
            parentPageId = db.parent.page_id;
          }
        } catch {
          // ignore and continue to workspace attempt
        }
      }
    }

    // Use 2025-09-03 API structure with initial_data_source
    const createPayload: any = {
      parent: parentPageId 
        ? { type: "page_id", page_id: parentPageId }
        : { type: "workspace", workspace: true },
      title: [{ type: "text", text: { content: title } }],
      initial_data_source: {
        properties: properties  // Properties go under initial_data_source in 2025-09-03
      }
    };

    console.log(`🔧 Creating database with 2025-09-03 API structure:`, JSON.stringify(createPayload, null, 2));

    if (!parentPageId && (payload as any).workspace) {
      try {
        const holding: any = await (notion as any).pages.create({
          parent: { type: "workspace", workspace: true },
          properties: {
            title: { title: [{ type: "text", text: { content: title } }] },
          },
        });
        createPayload.parent = { type: "page_id", page_id: holding.id };
      } catch (e: any) {
        // Notion rejects workspace-level page creation for internal integrations.
        // Surface a clearer error with guidance.
        const msg = e?.message || "Failed to create holding page at workspace root";
        const hint = "Provide parent_page_id explicitly or set NOTION_PARENT_PAGE_ID env to a page you own, or use a public integration with insert_content capability.";
        const error = new Error(`${msg}. ${hint}`);
        (error as any).status = e?.status || 400;
        throw error;
      }
    }

    const res: any = await (notion as any).databases.create(createPayload);

    return { action: "created_database", database_id: res.id, url: res.url };
  }

  export async function handleUpdateDatabase(payload: UpdateDatabasePayload) {
    const databaseId = (payload as any).database_id as string;
    const addPropsInput: Record<string, any> = (payload as any).properties || {};
    const renameInput: Record<string, any> = (payload as any).rename || {};

    // In 2025-09-03 API, we need to update the data source properties, not database directly
    if (Object.keys(addPropsInput).length > 0) {
      console.log(`🔧 Adding properties to database ${databaseId} via data source update`);
      
      // Get the primary data source for this database
      const dataSourceId = await getPrimaryDataSourceId(databaseId);
      
      const properties: Record<string, any> = {};
      for (const [name, def] of Object.entries(addPropsInput)) {
        const prop = toDatabaseProperty(def as any);
        if (prop) {
          properties[name] = prop;
        }
      }

      console.log(`� Updating data source ${dataSourceId} with properties:`, properties);
      
      // Update the data source properties using the 2025-09-03 API
      const res: any = await (notion as any).request({
        method: 'PATCH',
        path: `data_sources/${dataSourceId}`,
        body: {
          properties: properties
        }
      });

      return { action: "updated_database_properties", database_id: databaseId, data_source_id: dataSourceId, url: res.url };
    }

    if (Object.keys(renameInput).length > 0) {
      console.log(`🔄 Renaming properties in database ${databaseId} via data source update`);
      
      // Get the primary data source for this database
      const dataSourceId = await getPrimaryDataSourceId(databaseId);
      
      // Get current data source to understand existing properties
      const currentDataSource: any = await (notion as any).request({
        method: 'GET',
        path: `data_sources/${dataSourceId}`
      });
      
      const properties: Record<string, any> = { ...currentDataSource.properties };
      
      for (const [oldName, newNameOrConfig] of Object.entries(renameInput)) {
        const newName = typeof newNameOrConfig === 'string' ? newNameOrConfig : (newNameOrConfig as any).name;
        if (newName && properties[oldName]) {
          // Copy property to new name and remove old one
          properties[newName] = properties[oldName];
          properties[oldName] = null; // Remove old property
        }
      }

      console.log(`📊 Updating data source ${dataSourceId} with renamed properties`);
      
      const res: any = await (notion as any).request({
        method: 'PATCH',
        path: `data_sources/${dataSourceId}`,
        body: {
          properties: properties
        }
      });

      return { action: "renamed_database_properties", database_id: databaseId, data_source_id: dataSourceId, url: res.url };
    }

    return { 
      action: "no_changes", 
      database_id: databaseId,
      message: "No properties or renames provided." 
    };
  }

  // Create a new data source with defined properties schema
  // In Notion API 2025-09-03, data sources contain the actual property definitions
  export async function handleCreateDataSource(payload: any) {
    const parent = payload.parent;
    const inputProps: Record<string, any> = payload.properties || {};
    const title = payload.title || [{ type: "text", text: { content: "Data Source" } }];

    // Build properties schema for data source - these define the columns in Notion UI
    const properties: Record<string, any> = {};
    for (const [name, def] of Object.entries(inputProps)) {
      const prop = toDatabaseProperty(def as any);
      if (!prop) continue;
      properties[name] = prop;
    }

    const res: any = await (notion as any).request({
      method: 'POST',
      path: 'data_sources',
      body: {
        parent,
        properties,
        title
      }
    });

    return { action: "created_data_source", data_source_id: res.id, url: res.url };
  }

  // Data source property management for Notion API 2025-09-03
  // Database properties define the schema of a data source within a Notion database
  // These properties correspond to the columns in the Notion UI
  export async function handleUpdateDataSource(payload: any) {
    if (!payload.data_source_id) {
      throw new Error("data_source_id is required for data source update");
    }

    const requestBody: any = {};

    // Handle properties updates - defines the schema changes for the data source
    if (payload.properties && typeof payload.properties === 'object') {
      const properties: Record<string, any> = {};
      for (const [propName, propDef] of Object.entries(payload.properties)) {
        if (propDef === null) {
          // Remove property by setting to null
          properties[propName] = null;
        } else if (propDef && typeof propDef === 'object') {
          // Update or add property to the data source schema
          const prop = toDatabaseProperty(propDef as any);
          if (prop) {
            properties[propName] = prop;
          }
        }
      }
      requestBody.properties = properties;
    }

    // Handle title updates
    if (payload.title) {
      requestBody.title = payload.title;
    }

    // Handle icon updates
    if (payload.icon !== undefined) {
      requestBody.icon = payload.icon; // Can be null to remove icon
    }

    // Handle in_trash updates
    if (payload.in_trash !== undefined) {
      requestBody.in_trash = payload.in_trash;
    }

    // Handle parent updates (moving to different database)
    if (payload.parent?.database_id) {
      requestBody.parent = {
        type: "database_id",
        database_id: extractNotionId(payload.parent.database_id)
      };
    }

    console.log("🔧 Updating data source schema with ID:", payload.data_source_id);
    console.log("📋 Property schema changes:", JSON.stringify(requestBody, null, 2));

    // PATCH request to update data source properties (schema)
    const res: any = await (notion as any).request({
      method: 'PATCH',
      path: `data_sources/${extractNotionId(payload.data_source_id)}`,
      body: requestBody
    });

    return { action: "updated_data_source", data_source_id: res.id, url: res.url };
  }

  export async function handleBlockGet({ block_id }: any) {
    if (!block_id) {
      throw new Error("block_id is required for retrieving block");
    }

    console.log(`📦 Retrieving block ${block_id}`);
    
    const response = await notion.blocks.retrieve({
      block_id: block_id,
    });

    return response;
  }

  export async function handleBlockChildrenGet({ 
    block_id,
    page_size,
    start_cursor 
  }: any) {
    if (!block_id) {
      throw new Error("block_id is required for retrieving block children");
    }

    console.log(`📋 Retrieving children for block ${block_id}`);
    
    const response = await notion.blocks.children.list({
      block_id: block_id,
      page_size: page_size,
      start_cursor: start_cursor,
    });

    return response;
  }

  export async function handleBlockChildrenAppend({
    block_id,
    children,
    after,
  }: any) {
    if (!block_id) {
      throw new Error("block_id is required for appending block children");
    }
    if (!children || !Array.isArray(children)) {
      throw new Error("children array is required for appending block children");
    }

    console.log(`➕ Appending ${children.length} children to block ${block_id}`);
    
    const response = await notion.blocks.children.append({
      block_id: block_id,
      children: children,
      after: after,
    });

    return response;
  }

  export async function handleBlockUpdate({
    block_id,
    archived,
    ...blockData
  }: any) {
    if (!block_id) {
      throw new Error("block_id is required for updating block");
    }

    const updateData: any = { ...blockData };
    if (archived !== undefined) updateData.archived = archived;

    console.log(`🔧 Updating block ${block_id}:`, updateData);
    
    const response = await notion.blocks.update({
      block_id: block_id,
      ...updateData,
    });

    return response;
  }

  export async function handleBlockDelete({ block_id }: any) {
    if (!block_id) {
      throw new Error("block_id is required for deleting block");
    }

    console.log(`🗑️ Deleting block ${block_id}`);
    
    // Delete by setting archived to true
    const response = await notion.blocks.update({
      block_id: block_id,
      archived: true,
    });

    return response;
  }

  export async function handlePagePropertyGet({
    page_id,
    property_id,
    page_size,
    start_cursor,
  }: any) {
    if (!page_id) {
      throw new Error("page_id is required for retrieving page property");
    }
    if (!property_id) {
      throw new Error("property_id is required for retrieving page property");
    }

    console.log(`📄 Retrieving property ${property_id} for page ${page_id}`);
    
    const response = await notion.pages.properties.retrieve({
      page_id: page_id,
      property_id: property_id,
      page_size: page_size,
      start_cursor: start_cursor,
    });

    return response;
  }

  export async function handleDataSourceTemplatesList({
    data_source_id,
    page_size,
    start_cursor,
  }: any) {
    if (!data_source_id) {
      throw new Error("data_source_id is required for listing data source templates");
    }

    console.log(`📋 Listing templates for data source ${data_source_id}`);
    
    const response = await notion.request({
      path: `data_sources/${data_source_id}/templates`,
      method: "get",
      query: {
        page_size: page_size,
        start_cursor: start_cursor,
      },
    });

    return response;
  }
