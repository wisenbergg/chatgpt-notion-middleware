import { z } from "zod";

export const BlockInput = z.object({
  type: z
    .enum([
      "paragraph",
      "heading_1",
      "heading_2",
      "heading_3",
      "bulleted_list_item",
      "numbered_list_item",
      "to_do",
      "quote",
      "callout",
      "toggle",
    ])
    .default("paragraph"),
  text: z.string().min(1),
});

export const WritePayload = z
  .object({
    // "db" to create in database, "update" to update page, "page" to create under a parent page
    target: z.enum(["db", "update", "page"]),
    database_id: z.string().optional(),
    page_id: z.string().optional(),
    // A friendly title; if omitted, will try properties.Name or "Untitled"
    title: z.string().optional(),
    // Simple properties: strings/numbers/bools; or pass raw Notion property objects
    properties: z.record(z.any()).optional(),
    // Either a plain string or structured blocks
    content: z.union([z.string(), z.array(BlockInput)]).optional(),
    // Optional request correlation id you can log/echo
    request_id: z.string().optional(),
  })
  .strict()
  .superRefine((val: any, ctx: any) => {
    if (val.target === "db" && !val.database_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "database_id is required when target=db",
      });
    }
    if (val.target === "update" && !val.page_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "page_id is required when target=update",
      });
    }
    if (val.target === "page" && !val.page_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "page_id (parent) is required when target=page",
      });
    }
  });

export type WritePayload = z.infer<typeof WritePayload>;

// Query payloads for safe read-only operations
export const QueryPayload = z
  .object({
    mode: z.enum([
      "search", 
      "db_query", 
      "page_get", 
      "database_get", 
      "data_source_get", 
      "data_source_query", 
      "data_source_update",
      "block_get",
      "block_children_get",
      "block_children_append", 
      "block_update",
      "block_delete",
      "page_property_get",
      "data_source_templates_list"
    ]),
    // search
    query: z.string().optional(),
    object: z.enum(["page", "database"]).default("page").optional(),
    // db_query and data_source_query
    database_id: z.string().optional(),
    filter: z.record(z.any()).optional(),
    sorts: z.array(z.record(z.any())).optional(),
    page_size: z.number().int().min(1).max(100).optional(),
    start_cursor: z.string().optional(),
    // pagination helper (server will loop until this cap)
    max_results: z.number().int().min(1).max(500).optional(),
    // page_get and page_property_get
    page_id: z.string().optional(),
    property_id: z.string().optional(),
    // data_source_get, data_source_query, data_source_update, and data_source_templates_list
    data_source_id: z.string().optional(),
    properties: z.record(z.any()).optional(),
    title: z.array(z.record(z.any())).optional(),
    icon: z.record(z.any()).optional(),
    in_trash: z.boolean().optional(),
    parent: z.object({
      database_id: z.string()
    }).optional(),
    // data_source_query specific
    result_type: z.enum(["page", "data_source"]).optional(),
    filter_properties: z.array(z.string()).optional(),
    // block operations
    block_id: z.string().optional(),
    children: z.array(z.record(z.any())).optional(),
    after: z.string().optional(),
    archived: z.boolean().optional(),
    // data_source_templates_list
    name: z.string().optional(),
  })
  .strict()
  .superRefine((val: any, ctx: any) => {
    if (val.mode === "db_query" && !val.database_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "database_id is required when mode=db_query",
      });
    }
    if (val.mode === "page_get" && !val.page_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "page_id is required when mode=page_get",
      });
    }
    if (val.mode === "database_get" && !val.database_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "database_id is required when mode=database_get",
      });
    }
    if (val.mode === "data_source_get" && !val.data_source_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "data_source_id is required when mode=data_source_get",
      });
    }
    if (val.mode === "data_source_query" && !val.data_source_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "data_source_id is required when mode=data_source_query",
      });
    }
    if (val.mode === "data_source_update" && !val.data_source_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "data_source_id is required when mode=data_source_update",
      });
    }
    if (val.mode === "data_source_templates_list" && !val.data_source_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "data_source_id is required when mode=data_source_templates_list",
      });
    }
    if (val.mode === "block_get" && !val.block_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "block_id is required when mode=block_get",
      });
    }
    if (val.mode === "block_children_get" && !val.block_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "block_id is required when mode=block_children_get",
      });
    }
    if (val.mode === "block_children_append" && !val.block_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "block_id is required when mode=block_children_append",
      });
    }
    if (val.mode === "block_children_append" && !val.children) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "children is required when mode=block_children_append",
      });
    }
    if (val.mode === "block_update" && !val.block_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "block_id is required when mode=block_update",
      });
    }
    if (val.mode === "block_delete" && !val.block_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "block_id is required when mode=block_delete",
      });
    }
    if (val.mode === "page_property_get" && !val.page_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "page_id is required when mode=page_property_get",
      });
    }
    if (val.mode === "page_property_get" && !val.property_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "property_id is required when mode=page_property_get",
      });
    }
  });

export type QueryPayload = z.infer<typeof QueryPayload>;

// Create Database payload (safe subset)
export const CreateDatabasePayload = z
  .object({
    // Parent page under which the database will be created. If omitted and `workspace` is true, creates at workspace root.
    parent_page_id: z.string().min(1).optional(),
    // Create at workspace root when true
    workspace: z.boolean().optional(),
    // Database title
    title: z.string().min(1),
    // Simple, safe property definitions. If omitted, a minimal schema with a Title property will be created.
    properties: z
      .record(
        z.union([
          z
            .object({
              type: z.enum([
                "title",
                "rich_text",
                "number",
                "select",
                "multi_select",
                "status",
                "date",
                "checkbox",
                "url",
                "email",
                "phone_number",
                "people",
                "files",
                "formula",
                "relation",
                "rollup",
                "created_time",
                "created_by",
                "last_edited_time",
                "last_edited_by",
                "unique_id",
              ]),
              // For select/multi_select/status
              options: z.array(z.string()).optional(),
              // For number formatting (Notion supports various, default is "number")
              number_format: z.string().optional(),
              // For formula
              expression: z.string().optional(),
              // For relation
              database_id: z.string().optional(),
              relation_type: z.enum(["single_property", "dual_property"]).optional(),
              synced_property_name: z.string().optional(),
              synced_property_id: z.string().optional(),
              // For rollup
              relation_property_name: z.string().optional(),
              relation_property_id: z.string().optional(),
              rollup_property_name: z.string().optional(),
              rollup_property_id: z.string().optional(),
              function: z.string().optional(),
              // For unique_id
              prefix: z.string().optional(),
            })
            .passthrough(),
          // Raw passthrough to allow full Notion property schema
          z.object({ raw: z.record(z.any()) }),
        ])
      )
      .optional(),
  })
  .strict()
  .superRefine((val: any, ctx: any) => {
    const hasPage = Boolean(val.parent_page_id);
    const useWorkspace = Boolean(val.workspace);
    if (!hasPage && !useWorkspace) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Provide parent_page_id or set workspace=true" });
    }
    if (hasPage && useWorkspace) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Specify either parent_page_id or workspace=true, not both" });
    }
  });

export type CreateDatabasePayload = z.infer<typeof CreateDatabasePayload>;

// Update Database payload: add new properties and/or rename existing ones
export const UpdateDatabasePayload = z
  .object({
    database_id: z.string().min(1),
    // Add new properties: same definition style as create (simplified or raw)
    properties: z
      .record(
        z.union([
          z
            .object({
              type: z.enum([
                "title",
                "rich_text",
                "number",
                "select",
                "multi_select",
                "status",
                "date",
                "checkbox",
                "url",
                "email",
                "phone_number",
                "people",
                "files",
                "formula",
                "relation",
                "rollup",
                "created_time",
                "created_by",
                "last_edited_time",
                "last_edited_by",
                "unique_id",
              ]),
              options: z.array(z.string()).optional(),
              number_format: z.string().optional(),
              expression: z.string().optional(),
              database_id: z.string().optional(),
              relation_type: z.enum(["single_property", "dual_property"]).optional(),
              synced_property_name: z.string().optional(),
              synced_property_id: z.string().optional(),
              relation_property_name: z.string().optional(),
              relation_property_id: z.string().optional(),
              rollup_property_name: z.string().optional(),
              rollup_property_id: z.string().optional(),
              function: z.string().optional(),
              prefix: z.string().optional(),
            })
            .passthrough(),
          z.object({ raw: z.record(z.any()) }),
        ])
      )
      .optional(),
    // Rename existing properties: map current property name to new name
    rename: z
      .record(
        z.union([
          z.string(),
          z.object({
            name: z.string().min(1),
          }),
        ])
      )
      .optional(),
  })
  .strict();

export type UpdateDatabasePayload = z.infer<typeof UpdateDatabasePayload>;
