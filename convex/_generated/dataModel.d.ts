/* eslint-disable */
import type {
  DataModelFromSchemaDefinition,
  DocumentByInfo,
  TableNamesInSchema,
  SystemTableNames,
  TableInfo,
} from "convex/server";
import type { GenericId } from "convex/values";
import schema from "../schema";

export type DataModel = DataModelFromSchemaDefinition<typeof schema>;

export type TableName = TableNamesInSchema<typeof schema>;

export type SystemTableName = SystemTableNames;

export type Table<N extends TableName> = DocumentByInfo<
  DataModel,
  TableInfo<DataModel, N>
>;

export type Id<T extends TableName> = GenericId<T>;

export type { DocumentByName } from "convex/server";
