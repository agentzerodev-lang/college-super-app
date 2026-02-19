/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as attendance from "../attendance.js";
import type * as auth from "../auth.js";
import type * as canteen from "../canteen.js";
import type * as dashboard from "../dashboard.js";
import type * as events from "../events.js";
import type * as hostel from "../hostel.js";
import type * as library from "../library.js";
import type * as playground from "../playground.js";
import type * as resources from "../resources.js";
import type * as skills from "../skills.js";
import type * as sos from "../sos.js";
import type * as tickets from "../tickets.js";
import type * as timetable from "../timetable.js";
import type * as users from "../users.js";
import type * as wallet from "../wallet.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  attendance: typeof attendance;
  auth: typeof auth;
  canteen: typeof canteen;
  dashboard: typeof dashboard;
  events: typeof events;
  hostel: typeof hostel;
  library: typeof library;
  playground: typeof playground;
  resources: typeof resources;
  skills: typeof skills;
  sos: typeof sos;
  tickets: typeof tickets;
  timetable: typeof timetable;
  users: typeof users;
  wallet: typeof wallet;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
