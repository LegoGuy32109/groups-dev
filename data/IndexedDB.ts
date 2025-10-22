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

  // All IndexedDB functions use event listeners, so they are contructed with a promise
  // the function is provided a database instance and a resolver to the Promise
  private static async withDb<T, F = string>(
    logic: (
      db: IDBDatabase,
      resolve: (result: Result<T, F>) => void,
    ) => void,
  ): Promise<Result<T, F> | Fail<F>> {
    let db;
    if (IDB._db) {
      // Singleton already instantiated
      db = IDB._db;
    } else {
      // need to instantiate Singleton
      const result = await IDB.instantiate();
      if (!result.ok) return result as Fail<F>;
      db = result.db;
    }

    return new Promise((resolve) => logic(db, resolve));
  }

  public static readTable = (table: Tables, options?: {
    direction?: IDBCursorDirection;
    limit?: number;
    startAtValue?: unknown;
    excludeStartAtValue?: boolean;
  }): AsyncResult<{ total: Array<[unknown, unknown]> }> =>
    IDB.withDb((db, resolve) => {
      const bound = ["prev", "prevunique"].includes(options?.direction ?? "")
        ? IDBKeyRange.upperBound
        : IDBKeyRange.lowerBound;
      const range = options?.startAtValue
        ? bound(
          options.startAtValue,
          options?.excludeStartAtValue,
        )
        : undefined;

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

  public static saveLogin = () =>
    IDB.withDb((db, resolve) => {
      const userAgent = globalThis.navigator.userAgent;
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
    });

  public static deleteItem = (table: string, key: string): AsyncResult =>
    IDB.withDb((db, resolve) => {
      const store = db.transaction(table, "readwrite").objectStore(table);
      const deleteResult = store.delete(key);
      deleteResult.onsuccess = () => {
        resolve({ ok: true });
      };
      deleteResult.onerror = (event) => {
        resolve({
          ok: false,
          errors: [{
            data: event,
            message: `Failed to delete ${key} from ${table}`,
          }],
        });
      };
    });
}
