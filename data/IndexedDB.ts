import { IS_BROWSER } from "fresh/runtime";
import { Dates } from "../utilities/Dates.ts";
import { AsyncResult, Fail, Result } from "../utilities/Errors.ts";
// TODO: add banner if people aren't adding to home screen
// console.log(globalThis.navigator.userAgent);

export enum Tables {
  Locations = "locations",
}

export default class IDB {
  private static _db: IDBDatabase | undefined = undefined;

  private static async withDb<T, F = string>(
    logic: (db: IDBDatabase) => AsyncResult<T, F>,
  ): Promise<Result<T, F> | Fail<F>> {
    if (IDB._db) {
      return logic(IDB._db);
    }
    const result = await IDB.instantiate();
    if (!result.ok) return result as Fail<F>;
    return logic(result.db);
  }

  public static readTable = (table: Tables, options?: {
    direction?: IDBCursorDirection;
    limit?: number;
    startAtValue?: unknown;
    excludeStartAtValue?: boolean;
  }): AsyncResult<{ total: Array<[unknown, unknown]> }> =>
    IDB.withDb((db) => {
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
        const store = db.transaction(table).objectStore(table);
        const transaction = store.openCursor(range, options?.direction);
        transaction.onerror = (ev) => {
          resolve({
            ok: false,
            errors: [{ message: "Error Opening Cursor", data: ev }],
          });
          return;
        };
        transaction.onsuccess = (ev) => {
          const { result: cursor } = ev.target as IDBRequest<
            IDBCursorWithValue
          >;
          if (!cursor || options?.limit && total.length >= options.limit) {
            resolve({ ok: true, total });
            return;
          }

          total.push([cursor.key, cursor.value]);
          cursor.continue();
        };
      });
    });

  public static saveLogin = () =>
    IDB.withDb((db) => {
      const userAgent = globalThis.navigator.userAgent;
      return new Promise((resolve) => {
        const locations = db.transaction("locations", "readwrite").objectStore(
          "locations",
        );
        const request = locations.add(userAgent, Dates.getNowIso());
        request.onerror = (ev) => {
          resolve({
            ok: false,
            errors: [{
              message: "Failed to save login to IndexedDB",
              data: ev,
            }],
          });
        };
        request.onsuccess = () => {
          resolve({ ok: true });
        };
      }) as AsyncResult;
    });

  private static instantiate(): AsyncResult<{ db: IDBDatabase }> {
    return new Promise((resolve) => {
      if (!IS_BROWSER) {
        resolve({
          ok: false,
          errors: [{
            message: "Not in Client browser, cannot acces IndexedDB",
            type: "NOT_IN_BROWSER",
          }],
        });
        return;
      }
      if (!globalThis.indexedDB) {
        const message = "Could not access IndexedDB";
        console.error(message);
        resolve({
          ok: false,
          errors: [{ message, type: "INDEXEDDB_UNDEFINED" }],
        });
        return;
      }

      const request = globalThis.indexedDB.open("groups", 3);
      request.onerror = () => {
        resolve({
          ok: false,
          errors: [
            JSON.stringify(request.error) ??
              `Failure accessing indexedDB : ${request.error}`,
          ],
        });
        return;
      };
      request.onsuccess = () => {
        IDB._db = request.result;
        resolve({ ok: true, db: request.result });
      };
      // INFO: onupgradeneeded is the only place I can add / edit tables
      request.onupgradeneeded = (event) => {
        console.log(
          `Upgrading groups db from version ${event.oldVersion} to ${event.newVersion}`,
        );
        const db = request.result;
        const objectStores = db.objectStoreNames;
        if (!objectStores.contains("locations")) {
          db.createObjectStore("locations");
        }
      };
    });
  }
}

let groupsDb: IDBDatabase | undefined = undefined;

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
    const deleteResult = store.delete(key);
    deleteResult.onsuccess = (event) => {
      const { result } = event.target as IDBRequest<undefined>;
      resolve(result);
    };
    deleteResult.onerror = (event) => {
      console.error(`Failed to delete ${key} from ${table}`, event);
      resolve(null);
    };
  });
}
