/* eslint-disable */
import type { DataModel } from "./dataModel";

type QueryNames = 
  | "users:get"
  | "users:getByClerkId"
  | "users:list"
  | "attendance:getByUser"
  | "attendance:getByCourse"
  | "classrooms:list"
  | "timetable:getByCourse"
  | "freeClassrooms:list"
  | "resources:list"
  | "tickets:list"
  | "sosAlerts:getActive"
  | "hostelMeals:getByDate"
  | "hostelReviews:list"
  | "canteenItems:list"
  | "canteenOrders:getByUser"
  | "playgrounds:list"
  | "playgroundSlots:getAvailable"
  | "events:list"
  | "eventRegistrations:getByEvent"
  | "books:search"
  | "bookBorrows:getByUser"
  | "wallets:getByUser"
  | "walletTransactions:getByUser"
  | "skillsLeaderboard:getTop"
  | "rewards:getByUser"
  | "notifications:getByUser"
  | "announcements:list";

type MutationNames = 
  | "users:create"
  | "users:update"
  | "attendance:mark"
  | "freeClassrooms:book"
  | "resources:upload"
  | "tickets:create"
  | "sosAlerts:create"
  | "sosAlerts:resolve"
  | "canteenOrders:create"
  | "playgroundSlots:book"
  | "events:create"
  | "eventRegistrations:register"
  | "bookBorrows:borrow"
  | "bookBorrows:return"
  | "walletTransactions:create"
  | "rewards:create";

type ActionNames = 
  | "users:syncFromClerk"
  | "notifications:sendBulk";

type FunctionReference = {
  query: QueryNames;
  mutation: MutationNames;
  action: ActionNames;
};

export const api = {
  users: {} as any,
  attendance: {} as any,
  courses: {} as any,
  classrooms: {} as any,
  timetable: {} as any,
  freeClassrooms: {} as any,
  resources: {} as any,
  tickets: {} as any,
  sosAlerts: {} as any,
  hostels: {} as any,
  hostelMeals: {} as any,
  hostelReviews: {} as any,
  canteens: {} as any,
  canteenItems: {} as any,
  canteenOrders: {} as any,
  playgrounds: {} as any,
  playgroundSlots: {} as any,
  events: {} as any,
  eventRegistrations: {} as any,
  books: {} as any,
  bookBorrows: {} as any,
  wallets: {} as any,
  walletTransactions: {} as any,
  skillsLeaderboard: {} as any,
  rewards: {} as any,
  notifications: {} as any,
  announcements: {} as any,
} as const;

export const internal = api;
