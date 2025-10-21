import { IS_BROWSER } from "fresh/runtime";
import { Dates } from "../utilities/Dates.ts";
// TODO: add banner if people aren't adding to home screen
// console.log(globalThis.navigator.userAgent);

let groupsDb: IDBDatabase | undefined = undefined;

// This is what our customer data looks like.
const customerData = [
  { ssn: "444-44-4444", name: "Bill", age: 35, email: "bill@company.com" },
  { ssn: "555-55-5555", name: "Donna", age: 32, email: "donna@home.org" },
];

export function openGroupsDb(): Promise<{ ok: boolean; error?: unknown }> {
  return new Promise((resolve) => {
    if (!IS_BROWSER) {
      resolve({ ok: false });
      return;
    }
    if (!globalThis.indexedDB) {
      const msg = "Could not access IndexedDB";
      console.error(msg);
      resolve({ ok: false, error: msg });
      return;
    }

    const request = globalThis.indexedDB.open("groups", 3);
    request.onerror = () => {
      console.error("Lacking Permission to use IndexedDB");
      resolve({ ok: false, error: request.error });
      return;
    };
    request.onsuccess = () => {
      groupsDb = request.result;
      resolve({ ok: true });
    };
    // INFO: onupgradeneeded is the only place I can add / edit tables
    request.onupgradeneeded = (event) => {
      console.log(
        `Upgrading groups db from version ${event.oldVersion} to ${event.newVersion}`,
      );
      const db = request.result;
      const objectStores = db.objectStoreNames;
      if (!objectStores.contains("customers")) {
        const customers = db.createObjectStore("customers", { keyPath: "ssn" });
        customers.createIndex("name", "name", { unique: false });
        customers.createIndex("email", "email", { unique: true });

        customers.transaction.oncomplete = () => {
          const completeCustomers = db
            .transaction("customers", "readwrite")
            .objectStore("customers");

          for (const customer of customerData) {
            completeCustomers.add(customer);
          }
        };
      }

      if (!objectStores.contains("locations")) {
        db.createObjectStore("locations");
      }
    };
  });
}

export function saveUserData() {
  if (!groupsDb) {
    console.error("groups db not instantiated yet");
    return;
  }

  const userAgent = globalThis.navigator.userAgent;
  const locations = groupsDb.transaction("locations", "readwrite").objectStore(
    "locations",
  );
  locations.add(userAgent, Dates.getNowIso());
}

interface ReadAllOptions {
  direction?: IDBCursorDirection;
  limit?: number;
  startAtValue?: unknown;
  excludeStartAtValue?: boolean;
}
export function readTable(
  table: string,
  options?: ReadAllOptions,
): Promise<Array<[unknown, unknown]>> {
  const bound = ["prev", "prevunique"].includes(options?.direction ?? "")
    ? IDBKeyRange.upperBound
    : IDBKeyRange.lowerBound;
  const range = options?.startAtValue
    ? bound(
      options.startAtValue,
      options?.excludeStartAtValue,
    )
    : undefined;

  return new Promise((resolve) => {
    const total = [] as Array<[unknown, unknown]>;
    if (!groupsDb) {
      console.error("groups db not instantiated yet");
      resolve(total);
      return;
    }
    const store = groupsDb.transaction(table).objectStore(table);
    store.openCursor(range, options?.direction).onsuccess = (ev) => {
      const { result: cursor } = ev.target as IDBRequest<IDBCursorWithValue>;
      if (!cursor || options?.limit && total.length >= options.limit) {
        resolve(total);
        return;
      }

      total.push([cursor.key, cursor.value]);
      cursor.continue();
    };
  });
}

export function deleteItem(table: string, key: string) {
  return new Promise((resolve) => {
    const total = [] as Array<[unknown, unknown]>;
    if (!groupsDb) {
      console.error("groups db not instantiated yet");
      resolve(total);
      return;
    }
    const store = groupsDb.transaction(table, "readwrite").objectStore(table);
    console.log(store, key)
    const deleteResult = store.delete(key);
    deleteResult.onsuccess = (event) => {
      const { result } = event.target as IDBRequest<undefined>;
      resolve(result)
    };
    deleteResult.onerror = (event) => {
      console.error(`Failed to delete ${key} from ${table}`, event);
      resolve(null)
    };
  });
}
